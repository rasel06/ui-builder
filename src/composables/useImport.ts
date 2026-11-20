import axios from 'axios';
// @ts-ignore file-saver ships no types (same gap as exportUtils.ts)
import { saveAs } from 'file-saver';
import { computed, ref } from 'vue';
import { useUiI18n } from '../i18n';
import { resolveLabel } from '../i18n';
import type { ImportConfig } from '../types/module';
import type { ImportChoice, ImportCounts, ImportEntry, ImportSchemaData, ImportVariant, SpreadsheetData } from '../types/import';
import { ImportFileError, matchColumns, normalizeHeader, readSpreadsheet, toCsv } from '../utils/importFile';
import { acceptPhotos, matchPhotos } from '../utils/importPhotos';

type Step = 'upload' | 'check' | 'importing' | 'done';

const AJAX = { headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' } };

const uuid = (): string =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
          });

/**
 * The import flow for one module: read the file, match its columns, ask the server to check
 * every row (a dry run), let the user fix or skip problems, then save in batches.
 */
export function useImport(config: ImportConfig, moduleName: string) {
    const { t, te } = useUiI18n();
    const base = `/import/${config.importer}`;

    const step = ref<Step>('upload');
    const busy = ref(false);
    const error = ref<string | null>(null);

    const schema = ref<ImportSchemaData | null>(null);
    /** What is being imported (products: the type). Empty list = the module has no such choice. */
    const variants = ref<ImportVariant[]>([]);
    const variant = ref<string | null>(null);
    const context = ref<Record<string, any>>({});
    const contextChoices = ref<Record<string, ImportChoice[]>>({});
    const schemas: Record<string, ImportSchemaData> = {};
    const sheet = ref<SpreadsheetData | null>(null);
    const fileName = ref('');
    const mapping = ref<Record<string, number>>({});
    const entries = ref<ImportEntry[]>([]);
    const onDuplicate = ref<'skip' | 'update'>('skip');

    const progress = ref({ done: 0, total: 0 });
    const counts = ref<ImportCounts>({ created: 0, updated: 0, skipped: 0, failed: 0 });
    const runUuid = ref('');

    /** Rows read from the other sheets of the workbook, by sheet key, before they are tied to a product. */
    const childRows = ref<Record<string, { row: number; data: Record<string, any> }[]>>({});
    /** Rows on another sheet that name a product the first sheet does not have. */
    const orphans = ref<{ sheet: string; row: number; value: string }[]>([]);

    const sheetTitle = (def: { key: string; title: string }) => (te(`ui-builder.import_sheet_${def.key}`) ? t(`ui-builder.import_sheet_${def.key}`) : def.title);
    const hasSheets = computed(() => (schema.value?.sheets?.length ?? 0) > 0);
    const sheetSummary = computed(() => (schema.value?.sheets ?? []).map((def) => ({ title: sheetTitle(def), count: childRows.value[def.key]?.length ?? 0 })));

    const columns = computed(() => schema.value?.columns ?? []);
    const missingRequired = computed(() => columns.value.filter((c) => c.required && mapping.value[c.key] === undefined));
    const unmatchedOptional = computed(() => columns.value.filter((c) => !c.required && mapping.value[c.key] === undefined));
    const headerOptions = computed(() => sheet.value?.headers.map((label, index) => ({ label, index })).filter((h) => h.label) ?? []);

    const failed = computed(() => entries.value.filter((e) => e.result?.status === 'failed'));
    const existing = computed(() => entries.value.filter((e) => e.result?.status === 'skipped' || (e.result?.status === 'updated' && onDuplicate.value === 'update')));
    const ready = computed(() => entries.value.filter((e) => e.result && e.result.status !== 'failed'));
    const newCount = computed(() => entries.value.filter((e) => e.result?.status === 'created').length);
    const updateCount = computed(() => entries.value.filter((e) => e.result?.status === 'updated').length);
    const skipCount = computed(() => entries.value.filter((e) => e.result?.status === 'skipped').length);

    /** Records the import will create (new categories, brands), grouped by what they are. */
    const newValues = computed(() => {
        const found = new Map<string, Set<string>>();
        for (const e of entries.value) {
            if (e.result?.status === 'failed') continue;
            for (const n of e.result?.notes ?? []) {
                if (!found.has(n.column)) found.set(n.column, new Set());
                found.get(n.column)!.add(n.name);
            }
        }
        return [...found.entries()].map(([column, names]) => ({ column, names: [...names] }));
    });

    /** A column heading in the user's language: `ui-builder.import_field_<label>` when it exists, else the label as the importer wrote it. */
    const columnLabel = (label: string) => {
        const key = `ui-builder.import_field_${label.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '')}`;

        return te(key) ? t(key) : resolveLabel(label);
    };

    // ------------------------------------------------------------------ pictures
    /** Picture files dropped for the items in the file. They are matched to rows by name and sent after the rows are saved. */
    const photos = ref<File[]>([]);
    const photosRejected = ref(0);
    const photosAdded = ref(0);
    const photosFailed = ref(0);
    const phase = ref<'rows' | 'photos'>('rows');
    const hasPhotos = computed(() => columns.value.some((c) => c.key === 'photo'));
    const photoMatching = computed(() => matchPhotos(entries.value, photos.value));
    const photoRows = computed(() => entries.value.filter((e) => e.result && e.result.status !== 'failed' && photoMatching.value.byRow.has(e.row)).length);

    const addPhotos = (list: File[]) => {
        const { accepted, rejected } = acceptPhotos(list);
        const have = new Set(photos.value.map((f) => f.name.toLowerCase()));
        photos.value = [...photos.value, ...accepted.filter((f) => !have.has(f.name.toLowerCase()))];
        photosRejected.value += rejected.length;
    };
    const clearPhotos = () => {
        photos.value = [];
        photosRejected.value = 0;
    };

    /** Send each saved item its pictures, one item at a time. A failure is counted, never fatal. */
    const uploadPhotos = async (rows: ImportEntry[]) => {
        const todo = rows.filter((e) => e.result?.id != null && e.result.status !== 'failed' && e.result.status !== 'skipped' && photoMatching.value.byRow.has(e.row));
        if (!todo.length) return;

        phase.value = 'photos';
        progress.value = { done: 0, total: todo.length };
        for (const entry of todo) {
            const form = new FormData();
            form.append('id', String(entry.result!.id));
            photoMatching.value.byRow.get(entry.row)!.forEach((f) => form.append('photos[]', f));
            try {
                const { data } = await axios.post(`${base}/photos`, form, AJAX);
                photosAdded.value += data.data.added;
            } catch {
                photosFailed.value++;
            }
            progress.value.done++;
        }
    };

    const params = () => (variant.value ? { variant: variant.value } : {});

    let variantsAsked = false;
    const loadVariants = async () => {
        if (!variantsAsked) {
            variantsAsked = true;
            try {
                const { data } = await axios.get(`${base}/variants`, AJAX);
                variants.value = data.data ?? [];
            } catch {
                variants.value = [];
            }
        }
        // A module with no choice to make has its columns known up front (so the dialog can offer what depends on them).
        if (!variants.value.length && !schema.value) {
            try {
                await loadSchema();
            } catch {
                /* the upload step reports it */
            }
        }
    };

    const choicesCache: Record<string, Record<string, ImportChoice[]>> = {};
    /** A load already under way for a type, so two callers asking at once share one request. */
    const loading: Record<string, Promise<void>> = {};

    const fetchSchema = async (key: string) => {
        const { data } = await axios.get(`${base}/schema`, { ...AJAX, params: params() });
        // Answers asked once per file come with their choices. Both are stored together, only once both are known.
        choicesCache[key] = data.data.context?.length
            ? (await axios.get(`${base}/options`, { ...AJAX, params: params() })).data.context ?? {}
            : {};
        schemas[key] = data.data;
    };

    const loadSchema = async () => {
        const key = variant.value ?? '';
        if (!schemas[key]) {
            await (loading[key] ??= fetchSchema(key).finally(() => delete loading[key]));
        }
        schema.value = schemas[key];
        contextChoices.value = choicesCache[key] ?? {};
        // A question with only one possible answer (a single store) is answered already.
        context.value = Object.fromEntries(
            (schema.value.context ?? []).map((c) => {
                const choices = choicesCache[key]?.[c.key] ?? [];
                return [c.key, c.type === 'bool' ? c.key === 'auto_barcodes' : choices.length === 1 ? choices[0].id : null];
            }),
        );
        return schema.value;
    };

    /** Pick what is being imported; the columns, template and context all follow. */
    const chooseVariant = async (key: string) => {
        error.value = null;
        variant.value = key;
        try {
            await loadSchema();
        } catch {
            fail('ui-builder.import_check_failed');
        }
    };

    /** Whether this module (and, for products, this type) can hand back its current records. */
    const canDownloadCurrent = computed(() => !!schema.value?.exportable && !needsVariant.value && !hasSheets.value);

    const needsVariant = computed(() => variants.value.length > 0 && !variant.value);

    const fail = (key: string, params?: Record<string, unknown>) => {
        error.value = t(key, params ?? {});
    };

    // ------------------------------------------------------------------ template
    const typeLabels = () =>
        Object.fromEntries(['text', 'number', 'bool', 'date', 'phone', 'email', 'option', 'lookup'].map((k) => [k, t(`ui-builder.import_type_${k}`)]));

    const templateLabels = (s: ImportSchemaData) => ({
        data: t('ui-builder.import_sheet_data'),
        options: t('ui-builder.import_sheet_options'),
        instructions: t('ui-builder.import_sheet_instructions'),
        column: t('ui-builder.import_col_column'),
        required: t('ui-builder.import_col_required'),
        type: t('ui-builder.import_col_type'),
        notes: t('ui-builder.import_col_notes'),
        yes: t('ui-builder.yes'),
        no: t('ui-builder.no'),
        requiredYes: t('ui-builder.import_required'),
        requiredOptional: t('ui-builder.import_optional'),
        types: typeLabels(),
        sheetTitles: Object.fromEntries((s.sheets ?? []).map((def) => [def.key, sheetTitle(def)])),
    });

    const downloadTemplate = async (kind: 'xlsx' | 'csv' = 'xlsx') => {
        busy.value = true;
        error.value = null;
        try {
            if (needsVariant.value) return fail('ui-builder.import_choose_type_first');
            const s = await loadSchema();
            const stem = `${moduleName.toLowerCase().replace(/\s+/g, '-')}${variant.value ? '-' + variant.value : ''}-import-template`;

            if (kind === 'csv' && s.sheets?.length) return fail('ui-builder.import_needs_workbook');

            if (kind === 'csv') {
                const { buildTemplateCsv } = await import('../utils/importTemplate');
                saveAs(buildTemplateCsv({ schema: s, columnLabel }), `${stem}.csv`);
                return;
            }

            const [{ data }, { buildTemplateWorkbook }] = await Promise.all([
                axios.get(`${base}/options`, { ...AJAX, params: params() }),
                import('../utils/importTemplate'),
            ]);
            const blob = await buildTemplateWorkbook({
                module: config.importer!,
                variant: variant.value,
                schema: s,
                options: data.data,
                columnLabel,
                labels: templateLabels(s),
            });
            saveAs(blob, `${stem}.xlsx`);
        } catch (e) {
            console.error('Import template failed', e);
            fail('ui-builder.import_template_failed');
        } finally {
            busy.value = false;
        }
    };

    /** Download the records already on file, in the template's columns, to correct and upload again. */
    const downloadCurrent = async () => {
        busy.value = true;
        error.value = null;
        try {
            if (needsVariant.value) return fail('ui-builder.import_choose_type_first');
            const s = await loadSchema();
            const [{ data: exported }, { data: options }, { buildTemplateWorkbook }] = await Promise.all([
                axios.get(`${base}/export`, { ...AJAX, params: params() }),
                axios.get(`${base}/options`, { ...AJAX, params: params() }),
                import('../utils/importTemplate'),
            ]);
            if (!exported.data.length) return fail('ui-builder.import_nothing_to_download');

            const blob = await buildTemplateWorkbook({
                module: config.importer!,
                variant: variant.value,
                schema: s,
                options: options.data,
                columnLabel,
                rows: exported.data,
                labels: templateLabels(s),
            });
            saveAs(blob, `${moduleName.toLowerCase().replace(/\s+/g, '-')}${variant.value ? '-' + variant.value : ''}-current-data.xlsx`);
            if (exported.truncated) fail('ui-builder.import_download_truncated', { max: s.limits.rows_per_file });
        } catch (e: any) {
            console.error('Import download failed', e);
            fail('ui-builder.import_download_failed');
        } finally {
            busy.value = false;
        }
    };

    // ------------------------------------------------------------------ reading
    const linkKey = (value: unknown) => String(value ?? '').trim().toLowerCase();

    const rowsFromSheet = (): ImportEntry[] => {
        const s = sheet.value!;
        const entries: ImportEntry[] = s.rows.map((cells, i) => {
            const data: Record<string, any> = {};
            for (const [key, index] of Object.entries(mapping.value)) {
                data[key] = cells[index] ?? null;
            }
            return { row: s.rowNumbers[i], data };
        });

        // Tie each row of the other sheets to its product by the value they share.
        orphans.value = [];
        for (const def of schema.value?.sheets ?? []) {
            const byParent = new Map<string, ImportEntry>();
            for (const entry of entries) {
                const key = linkKey(entry.data[def.parent]);
                if (key !== '') byParent.set(key, entry);
                (entry.children ??= {})[def.key] = [];
            }
            for (const child of childRows.value[def.key] ?? []) {
                const owner = byParent.get(linkKey(child.data[def.child]));
                if (owner) owner.children![def.key].push(child);
                else orphans.value.push({ sheet: sheetTitle(def), row: child.row, value: String(child.data[def.child] ?? '') });
            }
        }

        return entries;
    };

    /** Read the other sheets of the workbook into rows. Returns false, with the reason shown, when one is missing or unreadable. */
    const readChildSheets = (): boolean => {
        childRows.value = {};
        const defs = schema.value?.sheets ?? [];
        if (!defs.length) return true;

        const data = sheet.value!;
        const names = Object.keys(data.others);
        if (!names.length) {
            fail('ui-builder.import_needs_workbook');

            return false;
        }

        for (const def of defs) {
            const wanted = [data.meta?.sheets?.children?.[def.key], def.key, def.title, sheetTitle(def)].filter(Boolean).map((n) => normalizeHeader(n));
            const found = names.find((n) => wanted.includes(normalizeHeader(n)));
            if (!found) {
                fail('ui-builder.import_missing_sheet', { sheet: sheetTitle(def) });

                return false;
            }

            const grid = data.others[found];
            const { mapping: map, missing } = matchColumns(grid.headers, def.columns, columnLabel);
            const needed = missing.filter((c) => c.required);
            if (needed.length) {
                fail('ui-builder.import_sheet_columns_missing', { sheet: sheetTitle(def), columns: needed.map((c) => columnLabel(c.label)).join(', ') });

                return false;
            }

            childRows.value[def.key] = grid.rows.map((cells, i) => ({
                row: grid.rowNumbers[i],
                data: Object.fromEntries(Object.entries(map).map(([key, index]) => [key, cells[index] ?? null])),
            }));
        }

        return true;
    };

    const handleFile = async (file: File) => {
        error.value = null;
        busy.value = true;
        try {
            const max = (config.maxFileSize ?? 10) * 1024 * 1024;
            if (file.size > max) return fail('ui-builder.import_file_too_big', { mb: config.maxFileSize ?? 10 });

            sheet.value = await readSpreadsheet(file);
            fileName.value = file.name;

            // A file made from one of our templates says what it was made for.
            const stamped = sheet.value.meta?.variant;
            if (stamped && stamped !== variant.value && variants.value.some((v) => v.key === stamped && v.supported)) {
                variant.value = stamped;
            }
            if (needsVariant.value) return fail('ui-builder.import_choose_type_first');

            const s = await loadSchema();

            if (!sheet.value.rows.length) return fail('ui-builder.import_file_empty');
            if (sheet.value.rows.length > s.limits.rows_per_file) {
                return fail('ui-builder.import_too_many_rows', { max: s.limits.rows_per_file });
            }
            if (sheet.value.meta?.module && sheet.value.meta.module !== config.importer) {
                return fail('ui-builder.import_wrong_template');
            }

            // A file made by "Download current data" is meant to change what is there.
            if (sheet.value.meta?.existing) onDuplicate.value = 'update';

            mapping.value = matchColumns(sheet.value.headers, s.columns, columnLabel).mapping;
            if (!readChildSheets()) return;
            step.value = 'check';
            if (!missingRequired.value.length) await runCheck();
        } catch (e) {
            fail(e instanceof ImportFileError ? 'ui-builder.import_unsupported' : 'ui-builder.import_read_failed');
        } finally {
            busy.value = false;
        }
    };

    const setMapping = async (key: string, index: number | null) => {
        const next = { ...mapping.value };
        if (index === null) delete next[key];
        else next[key] = index;
        mapping.value = next;
        if (!missingRequired.value.length) await runCheck();
    };

    // ------------------------------------------------------------------ checking
    const batchSize = () => Math.min(schema.value?.limits.rows_per_request ?? 200, 200);

    const payload = (batch: ImportEntry[]) =>
        batch.map((e) => ({
            _row: e.row,
            ...e.data,
            ...(e.children
                ? { _children: Object.fromEntries(Object.entries(e.children).map(([key, rows]) => [key, rows.map((r) => ({ _row: r.row, ...r.data }))])) }
                : {}),
        }));

    /** Ask the server to check every row, a batch at a time. Nothing is saved. */
    const runCheck = async () => {
        entries.value = rowsFromSheet();
        busy.value = true;
        error.value = null;
        progress.value = { done: 0, total: entries.value.length };
        try {
            let seen: Record<string, number> = {};
            for (let i = 0; i < entries.value.length; i += batchSize()) {
                const batch = entries.value.slice(i, i + batchSize());
                const { data } = await axios.post(`${base}/preview`, { rows: payload(batch), on_duplicate: onDuplicate.value, seen, variant: variant.value, context: context.value }, AJAX);
                data.rows.forEach((result: any, j: number) => (batch[j].result = result));
                seen = data.seen;
                progress.value.done = Math.min(i + batch.length, entries.value.length);
            }
        } catch (e: any) {
            fail('ui-builder.import_check_failed');
        } finally {
            busy.value = false;
        }
    };

    const setContext = async (key: string, value: any) => {
        context.value = { ...context.value, [key]: value };
        await runCheck();
    };

    const changeDuplicatePolicy = async (policy: 'skip' | 'update') => {
        onDuplicate.value = policy;
        await runCheck();
    };

    /** Re-check one row after the user edited a cell, keeping the other rows' keys in play. */
    const recheckRow = async (entry: ImportEntry) => {
        try {
            const seen: Record<string, number> = {};
            const { data } = await axios.post(`${base}/preview`, { rows: payload([entry]), on_duplicate: onDuplicate.value, seen, variant: variant.value, context: context.value }, AJAX);
            entry.result = data.rows[0];
        } catch {
            fail('ui-builder.import_check_failed');
        }
    };

    // ------------------------------------------------------------------ saving
    const importNow = async () => {
        const toSave = entries.value.filter((e) => e.result && e.result.status !== 'failed' && !e.done);
        if (!toSave.length) return;

        step.value = 'importing';
        error.value = null;
        runUuid.value = runUuid.value || uuid();
        counts.value = { created: 0, updated: 0, skipped: 0, failed: 0 };
        progress.value = { done: 0, total: toSave.length };
        phase.value = 'rows';
        photosAdded.value = 0;
        photosFailed.value = 0;

        let seen: Record<string, number> = {};
        try {
            for (let i = 0, n = 0; i < toSave.length; i += batchSize(), n++) {
                const batch = toSave.slice(i, i + batchSize());
                const { data } = await axios.post(
                    `${base}/commit`,
                    { rows: payload(batch), on_duplicate: onDuplicate.value, run_uuid: runUuid.value, batch: n, seen, variant: variant.value, context: context.value },
                    AJAX,
                );
                data.rows.forEach((result: any, j: number) => {
                    batch[j].result = result;
                    batch[j].done = result.status !== 'failed';
                });
                (Object.keys(counts.value) as (keyof ImportCounts)[]).forEach((k) => (counts.value[k] += data.counts[k]));
                seen = data.seen;
                progress.value.done = Math.min(i + batch.length, toSave.length);
            }
            if (hasPhotos.value && photos.value.length) await uploadPhotos(toSave);
            step.value = 'done';
        } catch {
            fail('ui-builder.import_save_failed');
            step.value = 'check';
        }
    };

    // ------------------------------------------------------------------ undo
    const undoing = ref(false);
    const undone = ref<{ removed: number; remaining: number } | null>(null);

    /** Take back the records this import created (those nothing has been built on). */
    const undoImport = async () => {
        if (!runUuid.value || undoing.value) return;
        undoing.value = true;
        error.value = null;
        try {
            const { data } = await axios.post(`/import/runs/${runUuid.value}/undo`, {}, AJAX);
            undone.value = { removed: data.removed, remaining: data.remaining };
        } catch {
            fail('ui-builder.import_undo_failed');
        } finally {
            undoing.value = false;
        }
    };

    // ------------------------------------------------------------------ results
    /** The rows that did not import, with the reason beside each, in the shape the user uploaded. */
    const downloadProblems = () => {
        const s = schema.value!;
        const rows = entries.value.filter((e) => e.result?.status === 'failed');
        const csv = toCsv([
            [...s.columns.map((c) => columnLabel(c.label)), t('ui-builder.import_problem')],
            ...rows.map((e) => [...s.columns.map((c) => e.data[c.key] ?? ''), e.result!.messages.join(' ')]),
        ]);
        saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${moduleName.toLowerCase().replace(/\s+/g, '-')}-import-problems.csv`);
    };

    const reset = () => {
        step.value = 'upload';
        busy.value = false;
        error.value = null;
        sheet.value = null;
        childRows.value = {};
        orphans.value = [];
        fileName.value = '';
        variant.value = null;
        schema.value = null;
        mapping.value = {};
        entries.value = [];
        onDuplicate.value = 'skip';
        runUuid.value = '';
        undone.value = null;
        clearPhotos();
        photosAdded.value = 0;
        photosFailed.value = 0;
        counts.value = { created: 0, updated: 0, skipped: 0, failed: 0 };
        progress.value = { done: 0, total: 0 };
    };

    return {
        variants, variant, context, contextChoices, needsVariant, newValues, hasSheets, sheetSummary, orphans, sheetTitle, loadVariants, chooseVariant, setContext,
        step, busy, error, schema, columns, sheet, fileName, mapping, entries, onDuplicate, progress, counts,
        missingRequired, unmatchedOptional, headerOptions, failed, existing, ready, newCount, updateCount, skipCount,
        columnLabel, loadSchema, downloadTemplate, downloadCurrent, canDownloadCurrent, handleFile, setMapping, runCheck, changeDuplicatePolicy,
        recheckRow, importNow, photos, photosRejected, photosAdded, photosFailed, phase, hasPhotos, photoMatching, photoRows, addPhotos, clearPhotos, downloadProblems, undoImport, undoing, undone, reset,
    };
}
