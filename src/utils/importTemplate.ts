import type { ImportColumn, ImportSchemaData } from '../types/import';
import { safeCell, toCsv } from './importFile';

export interface TemplateLabels {
    data: string;
    options: string;
    instructions: string;
    column: string;
    required: string;
    type: string;
    notes: string;
    yes: string;
    no: string;
    requiredYes: string;
    requiredOptional: string;
    types: Record<string, string>;
    /** Translated sheet names for the extra sheets, by sheet key. A key with no entry uses the sheet's own title. */
    sheetTitles?: Record<string, string>;
}

interface TemplateInput {
    module: string;
    variant?: string | null;
    schema: ImportSchemaData;
    /** Allowed values for option / lookup columns, keyed by column key (`sheet.column` for an extra sheet). */
    options: Record<string, string[]>;
    labels: TemplateLabels;
    /** Translates a column's English label. */
    columnLabel: (label: string) => string;
    /** Existing records to put under the headers instead of the example row. */
    rows?: Record<string, any>[];
}

const MAX_VALIDATED_ROWS = 2000;

/** Excel column letters: 1 -> A, 27 -> AA. */
const letter = (n: number): string => {
    let s = '';
    for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) s = String.fromCharCode(65 + ((x - 1) % 26)) + s;
    return s;
};

/** Excel allows 31 characters in a sheet name and none of : \ / ? * [ ]. */
const sheetName = (name: string): string => name.replace(/[:\\/?*[\]]/g, ' ').slice(0, 31).trim() || 'Sheet';

/**
 * The file a person fills in. Required columns are starred and shaded; option columns get a
 * dropdown fed from an Options sheet; types that need more than one row per product carry a further
 * sheet for each kind of row; an Instructions sheet says what each column takes.
 */
export const buildTemplateWorkbook = async (input: TemplateInput): Promise<Blob> => {
    const { default: ExcelJS } = await import('exceljs');
    const { schema, options, labels } = input;
    const workbook = new ExcelJS.Workbook();

    const mainName = sheetName(labels.data);
    const childNames: Record<string, string> = {};
    for (const sheet of schema.sheets ?? []) {
        childNames[sheet.key] = sheetName(labels.sheetTitles?.[sheet.key] ?? sheet.title);
    }
    const optionsName = sheetName(labels.options);

    // ---- Where each list of allowed values will sit on the Options sheet (decided first, so every sheet can point at it)
    interface OptionList { key: string; heading: string; values: string[]; col: number }
    const lists: OptionList[] = [];
    const optionRange: Record<string, string> = {};
    const addList = (key: string, heading: string) => {
        const values = options[key];
        if (!values?.length) return;
        const col = lists.length + 1;
        lists.push({ key, heading, values, col });
        optionRange[key] = `'${optionsName}'!$${letter(col)}$2:$${letter(col)}$${values.length + 1}`;
    };
    for (const column of schema.columns) addList(column.key, input.columnLabel(column.label));
    for (const sheet of schema.sheets ?? []) {
        for (const column of sheet.columns) addList(`${sheet.key}.${column.key}`, `${childNames[sheet.key]}: ${input.columnLabel(column.label)}`);
    }

    /** Header row, dropdowns and rows for one sheet. */
    const fill = (ws: any, columns: ImportColumn[], prefix: string, rows: Record<string, any>[], isExample: boolean) => {
        columns.forEach((column, i) => {
            const col = i + 1;
            const head = ws.getCell(1, col);
            head.value = input.columnLabel(column.label) + (column.required ? ' *' : '');
            head.font = { bold: true, color: { argb: column.required ? 'FFB91C1C' : 'FF334155' } };
            head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: column.required ? 'FFFEE2E2' : 'FFF1F5F9' } };
            head.border = { bottom: { style: 'medium', color: { argb: column.required ? 'FFB91C1C' : 'FF94A3B8' } } };
            const note = [column.required_note, column.hint].filter(Boolean).join('\n');
            if (note) head.note = note;

            ws.getColumn(col).width = Math.max(14, Math.min(34, head.value!.toString().length + 6));

            // Text columns stay text, so a phone number keeps its leading zero.
            const asText = column.type === 'phone' || column.type === 'text' || column.type === 'email';
            if (asText) ws.getColumn(col).numFmt = '@';

            const range = optionRange[prefix + column.key];
            const validation = range
                ? { type: 'list' as const, allowBlank: true, formulae: [range], showErrorMessage: false }
                : column.type === 'bool'
                  ? { type: 'list' as const, allowBlank: true, formulae: [`"${labels.yes},${labels.no}"`], showErrorMessage: false }
                  : null;
            if (validation) {
                for (let r = 2; r <= MAX_VALIDATED_ROWS; r++) ws.getCell(r, col).dataValidation = validation;
            }
        });

        rows.forEach((row, r) => {
            columns.forEach((column, i) => {
                const cell = ws.getCell(r + 2, i + 1);
                const value = row[column.key];
                cell.value = value === null || value === undefined ? '' : typeof value === 'number' ? value : safeCell(value);
                if (isExample) cell.font = { italic: true, color: { argb: 'FF94A3B8' } };
            });
        });
    };

    /** An example that is not one of the real choices would fail on its own upload. */
    const exampleRow = (columns: ImportColumn[], prefix: string): Record<string, any> =>
        Object.fromEntries(
            columns.map((c) => {
                const choices = options[prefix + c.key];
                const usable = !choices || (c.example !== null && choices.some((v) => v.toLowerCase() === c.example!.toLowerCase()));
                // A required choice with no usable example takes the first real option, so the untouched
                // example row is still a valid row.
                const fallback = c.required && choices?.length ? choices[0] : '';
                return [c.key, usable ? (c.example ?? '') : fallback];
            }),
        );

    // ---- Sheets, in the order a person meets them
    const data = workbook.addWorksheet(mainName, { views: [{ state: 'frozen', ySplit: 1 }] });
    const mainExample = exampleRow(schema.columns, '');
    fill(data, schema.columns, '', input.rows?.length ? input.rows : [mainExample], !input.rows?.length);

    for (const sheet of schema.sheets ?? []) {
        const ws = workbook.addWorksheet(childNames[sheet.key], { views: [{ state: 'frozen', ySplit: 1 }] });
        const example = exampleRow(sheet.columns, `${sheet.key}.`);
        // The example row points at the example product, so the untouched file ties together.
        example[sheet.child] = mainExample[sheet.parent] ?? '';
        fill(ws, sheet.columns, `${sheet.key}.`, [example], true);
    }

    if (lists.length) {
        const optionSheet = workbook.addWorksheet(optionsName);
        for (const list of lists) {
            optionSheet.getCell(1, list.col).value = list.heading;
            optionSheet.getCell(1, list.col).font = { bold: true };
            list.values.forEach((v, i) => (optionSheet.getCell(i + 2, list.col).value = v));
            optionSheet.getColumn(list.col).width = Math.min(40, Math.max(14, list.heading.length + 2, ...list.values.map((v) => v.length + 2)));
        }
    }

    // ---- Instructions sheet
    const guideName = sheetName(labels.instructions);
    const guide = workbook.addWorksheet(guideName);
    guide.getColumn(1).width = 26;
    guide.getColumn(2).width = 18;
    guide.getColumn(3).width = 16;
    guide.getColumn(4).width = 70;
    ['column', 'required', 'type', 'notes'].forEach((key, i) => {
        const cell = guide.getCell(1, i + 1);
        cell.value = (labels as any)[key];
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    });

    let line = 2;
    const describe = (columns: ImportColumn[], prefix: string, heading: string | null) => {
        if (heading) {
            guide.getCell(line, 1).value = heading;
            guide.getCell(line, 1).font = { bold: true, color: { argb: 'FF1D4ED8' } };
            line++;
        }
        for (const column of columns) {
            const choices = options[prefix + column.key];
            guide.getCell(line, 1).value = input.columnLabel(column.label);
            guide.getCell(line, 2).value = column.required ? labels.requiredYes : column.required_note ?? labels.requiredOptional;
            guide.getCell(line, 3).value = labels.types[column.type] ?? column.type;
            guide.getCell(line, 4).value = [column.hint, choices?.length ? `${labels.options}: ${choices.slice(0, 8).join(', ')}${choices.length > 8 ? '…' : ''}` : '']
                .filter(Boolean)
                .join(' ');
            if (column.required) guide.getCell(line, 2).font = { bold: true, color: { argb: 'FFB91C1C' } };
            line++;
        }
    };
    describe(schema.columns, '', (schema.sheets ?? []).length ? mainName : null);
    for (const sheet of schema.sheets ?? []) {
        line++;
        describe(sheet.columns, `${sheet.key}.`, `${childNames[sheet.key]}${sheet.hint ? ` — ${sheet.hint}` : ''}`);
    }
    line++;
    schema.notes.forEach((note) => (guide.getCell(line++, 1).value = note));

    // ---- Hidden marker: which module and type this file was made for, and where each sheet is
    const meta = workbook.addWorksheet('_meta', { state: 'veryHidden' });
    meta.getCell('A1').value = JSON.stringify({
        module: input.module,
        variant: input.variant ?? null,
        // A file of the records already on file: uploading it again means "update them".
        existing: !!input.rows?.length,
        columns: schema.columns.map((c) => c.key),
        sheets: { main: mainName, children: childNames },
        helpers: [optionsName, guideName],
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/** The header row and an example row, for people who cannot use a workbook. Only for types that fit on one sheet. */
export const buildTemplateCsv = (input: Pick<TemplateInput, 'schema' | 'columnLabel'>): Blob =>
    new Blob(
        [
            toCsv([
                input.schema.columns.map((c) => input.columnLabel(c.label) + (c.required ? ' *' : '')),
                input.schema.columns.map((c) => c.example ?? ''),
            ]),
        ],
        { type: 'text/csv;charset=utf-8' },
    );
