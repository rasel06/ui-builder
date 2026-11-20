<template>
    <DialogWrapper
        :is-open="isOpen"
        :title="t('ui-builder.import_title', { module: moduleTitle })"
        dialog-size="4xl"
        :theme="theme"
        :close-on-backdrop="flow.step.value !== 'importing'"
        :close-on-escape="flow.step.value !== 'importing'"
        @close="handleClose"
    >
        <!-- ============================================================ upload -->
        <div v-if="flow.step.value === 'upload'" class="space-y-4">
            <!-- what is being imported (products: the type) -->
            <div v-if="flow.variants.value.length" class="space-y-2">
                <p class="text-sm font-semibold">{{ t('ui-builder.import_choose_type') }}</p>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    <button
                        v-for="v in flow.variants.value"
                        :key="v.key"
                        type="button"
                        :disabled="!v.supported"
                        :aria-pressed="flow.variant.value === v.key"
                        :title="v.reason ? t(v.reason) : (v.description ?? '')"
                        :class="[
                            'flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center text-xs font-medium transition-colors',
                            flow.variant.value === v.key ? [theme.primaryButton, 'border-transparent'] : theme.cardBorder,
                            v.supported ? (flow.variant.value === v.key ? '' : 'hover:opacity-80') : 'cursor-not-allowed opacity-50',
                        ]"
                        @click="flow.chooseVariant(v.key)"
                    >
                        <component :is="typeIcon(v.icon)" class="h-5 w-5" />
                        <span>{{ resolveLabel(v.label) }}</span>
                        <span v-if="!v.supported && v.reason" class="text-[10px] font-normal opacity-80">{{ t(v.reason) }}</span>
                    </button>
                </div>
            </div>

            <label
                :class="[
                    'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors',
                    dragging ? 'border-tc-500 bg-tc-50 dark:bg-tc-500/10' : 'border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900',
                    theme.cardBorder,
                ]"
                @dragover.prevent="dragging = true"
                @dragleave.prevent="dragging = false"
                @drop.prevent="onDrop"
            >
                <Loader2 v-if="flow.busy.value" class="h-8 w-8 animate-spin text-slate-400 dark:text-neutral-400" />
                <Upload v-else class="h-8 w-8 text-slate-400 dark:text-neutral-400" />
                <span class="text-sm font-semibold">{{ t('ui-builder.import_drop') }}</span>
                <span class="text-xs text-slate-500 dark:text-neutral-400">{{ t('ui-builder.import_formats') }}</span>
                <input ref="fileInput" type="file" class="sr-only" accept=".xlsx,.csv,.txt" @change="onPick" />
            </label>

            <p v-if="flow.error.value" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300" role="alert">
                {{ flow.error.value }}
            </p>

            <div class="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm" :class="theme.cardBorder">
                <FileSpreadsheet class="h-5 w-5 shrink-0 text-emerald-600" />
                <p class="min-w-48 flex-1 text-slate-600 dark:text-slate-300">{{ t('ui-builder.import_first_time') }}</p>
                <button type="button" :class="['inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium', theme.secondaryButton]" :disabled="flow.busy.value || flow.needsVariant.value" @click="flow.downloadTemplate('xlsx')">
                    <Download class="h-4 w-4" />{{ t('ui-builder.import_get_template') }}
                </button>
                <button v-if="!flow.hasSheets.value" type="button" class="text-xs text-slate-500 dark:text-neutral-400 underline-offset-2 hover:underline" :disabled="flow.busy.value || flow.needsVariant.value" @click="flow.downloadTemplate('csv')">
                    {{ t('ui-builder.import_get_csv') }}
                </button>
            </div>
            <div v-if="flow.canDownloadCurrent.value" class="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm" :class="theme.cardBorder">
                <Pencil class="h-5 w-5 shrink-0 text-sky-600" />
                <p class="min-w-48 flex-1 text-slate-600 dark:text-slate-300">{{ t('ui-builder.import_edit_existing') }}</p>
                <button type="button" :class="['inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium', theme.secondaryButton]" :disabled="flow.busy.value" @click="flow.downloadCurrent()">
                    <Download class="h-4 w-4" />{{ t('ui-builder.import_get_current') }}
                </button>
            </div>
        </div>

        <!-- ============================================================ check -->
        <div v-else-if="flow.step.value === 'check'" class="space-y-3">
            <div class="flex flex-wrap items-center gap-2 text-sm">
                <FileSpreadsheet class="h-4 w-4 text-emerald-600" />
                <span class="font-medium">{{ flow.fileName.value }}</span>
                <span class="text-slate-500 dark:text-neutral-400">· {{ t('ui-builder.import_rows_found', { count: flow.entries.value.length }) }}</span>
                <button type="button" class="ml-auto text-xs text-slate-500 dark:text-neutral-400 underline-offset-2 hover:underline" @click="flow.reset()">{{ t('ui-builder.import_choose_other') }}</button>
            </div>

            <!-- the other sheets of the workbook, and rows on them that belong to no product -->
            <div v-if="flow.hasSheets.value" class="space-y-1.5 text-xs">
                <p class="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
                    <span v-for="s in flow.sheetSummary.value" :key="s.title">{{ t('ui-builder.import_sheet_rows', s) }}</span>
                </p>
                <p v-if="flow.orphans.value.length" class="rounded-lg border border-amber-300 bg-amber-50 p-2 text-amber-800 dark:border-amber-500/25 dark:bg-amber-950/30 dark:text-amber-200">
                    {{ t('ui-builder.import_orphans', { count: flow.orphans.value.length, list: flow.orphans.value.slice(0, 4).map((o) => `${o.sheet} ${o.row}: ${o.value || '—'}`).join('; ') }) }}
                </p>
            </div>

            <!-- required columns we could not find -->
            <div v-if="flow.missingRequired.value.length" class="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-500/25 dark:bg-amber-950/30">
                <p class="text-sm font-semibold text-amber-800 dark:text-amber-200">{{ t('ui-builder.import_missing_columns') }}</p>
                <div v-for="column in flow.missingRequired.value" :key="column.key" class="flex flex-wrap items-center gap-2 text-sm">
                    <span class="w-40 font-medium">{{ flow.columnLabel(column.label) }} *</span>
                    <select
                        class="min-w-48 rounded-md border bg-white px-2 py-1 text-sm dark:bg-slate-900"
                        :value="''"
                        @change="flow.setMapping(column.key, ($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value))"
                    >
                        <option value="">{{ t('ui-builder.import_pick_column') }}</option>
                        <option v-for="h in flow.headerOptions.value" :key="h.index" :value="h.index">{{ h.label }}</option>
                    </select>
                </div>
            </div>

            <template v-else>
                <!-- progress while checking -->
                <div v-if="flow.busy.value" class="flex items-center gap-2 text-sm text-slate-500 dark:text-neutral-400">
                    <Loader2 class="h-4 w-4 animate-spin" />{{ t('ui-builder.import_checking', flow.progress.value) }}
                </div>

                <template v-else>
                    <div class="grid gap-2 sm:grid-cols-3">
                        <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/25 dark:bg-emerald-950/30">
                            <p class="flex items-center gap-1.5 text-xl font-bold text-emerald-700 dark:text-emerald-300"><CheckCircle2 class="h-5 w-5" />{{ flow.ready.value.length }}</p>
                            <p class="text-xs text-emerald-800 dark:text-emerald-200">{{ t('ui-builder.import_ready') }}</p>
                        </div>
                        <div class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/25 dark:bg-red-950/30">
                            <p class="flex items-center gap-1.5 text-xl font-bold text-red-700 dark:text-red-300"><XCircle class="h-5 w-5" />{{ flow.failed.value.length }}</p>
                            <p class="text-xs text-red-800 dark:text-red-200">{{ t('ui-builder.import_need_fix') }}</p>
                        </div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                            <p class="text-xl font-bold">{{ flow.skipCount.value + flow.updateCount.value }}</p>
                            <p class="text-xs text-slate-600 dark:text-slate-300">{{ t('ui-builder.import_already_exist') }}</p>
                        </div>
                    </div>

                    <!-- already in the list -->
                    <div v-if="flow.skipCount.value + flow.updateCount.value > 0" class="flex flex-wrap items-center gap-4 rounded-lg border p-3 text-sm" :class="theme.cardBorder">
                        <span class="font-medium">{{ t('ui-builder.import_existing_question', { count: flow.skipCount.value + flow.updateCount.value }) }}</span>
                        <label class="flex items-center gap-1.5"><input type="radio" name="dup" value="skip" :checked="flow.onDuplicate.value === 'skip'" @change="flow.changeDuplicatePolicy('skip')" />{{ t('ui-builder.import_skip_them') }}</label>
                        <label class="flex items-center gap-1.5"><input type="radio" name="dup" value="update" :checked="flow.onDuplicate.value === 'update'" @change="flow.changeDuplicatePolicy('update')" />{{ t('ui-builder.import_update_them') }}</label>
                    </div>

                    <!-- answers asked once for the whole file -->
                    <div v-if="flow.schema.value?.context?.length" class="flex flex-wrap items-center gap-4 rounded-lg border p-3 text-sm" :class="theme.cardBorder">
                        <template v-for="c in flow.schema.value.context" :key="c.key">
                            <label v-if="c.type === 'bool'" class="flex items-center gap-1.5">
                                <input type="checkbox" :checked="!!flow.context.value[c.key]" @change="flow.setContext(c.key, ($event.target as HTMLInputElement).checked)" />
                                {{ flow.columnLabel(c.label) }}
                            </label>
                            <label v-else class="flex flex-wrap items-center gap-2">
                                <span class="font-medium">{{ flow.columnLabel(c.label) }}</span>
                                <select
                                    class="min-w-44 rounded-md border bg-white px-2 py-1 dark:bg-slate-900"
                                    :value="flow.context.value[c.key] ?? ''"
                                    @change="flow.setContext(c.key, ($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value))"
                                >
                                    <option value="">{{ t('ui-builder.import_none_chosen') }}</option>
                                    <option v-for="o in flow.contextChoices.value[c.key] ?? []" :key="o.id" :value="o.id">{{ o.name }}</option>
                                </select>
                            </label>
                        </template>
                    </div>

                    <!-- records the import will create -->
                    <div v-if="flow.newValues.value.length" class="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm dark:border-sky-500/25 dark:bg-sky-950/30">
                        <p class="font-semibold">{{ t('ui-builder.import_will_create') }}</p>
                        <p v-for="g in flow.newValues.value" :key="g.column" class="text-xs">
                            <span class="font-medium">{{ g.column }}:</span> {{ g.names.slice(0, 8).join(', ') }}<span v-if="g.names.length > 8"> +{{ g.names.length - 8 }}</span>
                        </p>
                    </div>

                    <!-- pictures: matched to rows by the Photo column or by the SKU in the file name -->
                    <div v-if="flow.hasPhotos.value" class="space-y-1.5 rounded-lg border border-dashed p-3 text-sm" :class="[theme.cardBorder, photoDragging ? 'bg-tc-50 dark:bg-tc-500/10' : '']"
                        @dragover.prevent="photoDragging = true" @dragleave.prevent="photoDragging = false" @drop.prevent="onPhotoDrop">
                        <div class="flex flex-wrap items-center gap-2">
                            <ImagePlus class="h-4 w-4 shrink-0 text-slate-500 dark:text-neutral-400" />
                            <span class="min-w-48 flex-1 font-medium">{{ t('ui-builder.import_photos_title') }}</span>
                            <button type="button" :class="['rounded-md px-3 py-1 text-xs font-medium', theme.secondaryButton]" @click="photoInput?.click()">{{ t('ui-builder.import_photos_add') }}</button>
                            <button v-if="flow.photos.value.length" type="button" class="text-xs text-slate-500 dark:text-neutral-400 underline-offset-2 hover:underline" @click="flow.clearPhotos()">{{ t('ui-builder.import_photos_clear') }}</button>
                            <input ref="photoInput" type="file" class="sr-only" multiple accept="image/jpeg,image/png,image/webp" @change="onPhotoPick" />
                        </div>
                        <p class="text-xs text-slate-500 dark:text-neutral-400">{{ t('ui-builder.import_photos_hint') }}</p>
                        <template v-if="flow.photos.value.length || flow.photosRejected.value">
                            <p class="text-xs text-emerald-700 dark:text-emerald-300">{{ t('ui-builder.import_photos_matched', { files: flow.photos.value.length - flow.photoMatching.value.unused.length, items: flow.photoRows.value }) }}</p>
                            <p v-if="flow.photoMatching.value.unused.length" class="text-xs text-amber-700 dark:text-amber-300">
                                {{ t('ui-builder.import_photos_unused', { count: flow.photoMatching.value.unused.length, list: flow.photoMatching.value.unused.slice(0, 4).map((f) => f.name).join(', ') }) }}
                            </p>
                            <p v-if="flow.photoMatching.value.missing.length" class="text-xs text-amber-700 dark:text-amber-300">
                                {{ t('ui-builder.import_photos_missing', { count: flow.photoMatching.value.missing.length, list: flow.photoMatching.value.missing.slice(0, 4).join(', ') }) }}
                            </p>
                            <p v-if="flow.photosRejected.value" class="text-xs text-amber-700 dark:text-amber-300">{{ t('ui-builder.import_photos_rejected', { count: flow.photosRejected.value }) }}</p>
                            <p v-if="flow.photoMatching.value.over" class="text-xs text-amber-700 dark:text-amber-300">{{ t('ui-builder.import_photos_over', { count: flow.photoMatching.value.over, max: PHOTOS_PER_ITEM }) }}</p>
                        </template>
                    </div>

                    <p v-if="flow.unmatchedOptional.value.length" class="text-xs text-slate-500 dark:text-neutral-400">
                        {{ t('ui-builder.import_not_in_file', { columns: flow.unmatchedOptional.value.map((c) => flow.columnLabel(c.label)).join(', ') }) }}
                    </p>

                    <p v-if="flow.error.value" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300" role="alert">{{ flow.error.value }}</p>

                    <!-- tabs -->
                    <div class="flex gap-1 border-b text-sm" :class="theme.cardBorder" role="tablist">
                        <button v-for="tab in tabs" :key="tab.key" type="button" role="tab" :aria-selected="activeTab === tab.key"
                            :class="['-mb-px border-b-2 px-3 py-1.5', activeTab === tab.key ? 'border-tc-600 font-semibold' : 'border-transparent text-slate-500 dark:text-neutral-400']"
                            @click="activeTab = tab.key; limit = PAGE">
                            {{ tab.label }} <span class="text-xs text-slate-400 dark:text-neutral-400">{{ tab.count }}</span>
                        </button>
                    </div>

                    <div class="max-h-[40vh] overflow-auto rounded-lg border" :class="theme.cardBorder">
                        <table data-table-type="own" class="w-full min-w-max text-left text-xs">
                            <thead :class="['sticky top-0', theme.tableHeaderBackground]">
                                <tr>
                                    <th class="px-2 py-1.5">#</th>
                                    <th class="min-w-56 px-2 py-1.5">{{ t('ui-builder.import_problem') }}</th>
                                    <th v-for="c in shownColumns" :key="c.key" class="px-2 py-1.5">{{ flow.columnLabel(c.label) }}<span v-if="c.required"> *</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="entry in visibleEntries" :key="entry.row" class="border-t align-top" :class="theme.cardBorder">
                                    <td class="px-2 py-1 text-slate-500 dark:text-neutral-400">{{ entry.row }}</td>
                                    <td class="min-w-56 px-2 py-1">
                                        <span v-if="entry.result?.status === 'failed'" class="text-red-600 dark:text-red-400">{{ entry.result.messages.join(' ') }}</span>
                                        <span v-else-if="entry.result?.status === 'skipped'" class="text-slate-500 dark:text-neutral-400">{{ t('ui-builder.import_will_skip') }}</span>
                                        <span v-else-if="entry.result?.status === 'updated'" class="text-amber-600">{{ t('ui-builder.import_will_update') }}</span>
                                        <span v-else class="text-emerald-600">{{ t('ui-builder.import_will_add') }}</span>
                                    </td>
                                    <td v-for="c in shownColumns" :key="c.key" class="px-2 py-1">
                                        <input
                                            v-if="entry.result?.status === 'failed'"
                                            class="w-32 rounded border bg-white px-1.5 py-0.5 dark:bg-slate-900"
                                            :value="entry.data[c.key] ?? ''"
                                            @change="onEdit(entry, c.key, ($event.target as HTMLInputElement).value)"
                                        />
                                        <span v-else>{{ entry.data[c.key] ?? '' }}</span>
                                    </td>
                                </tr>
                                <tr v-if="!visibleEntries.length"><td :colspan="shownColumns.length + 2" class="px-2 py-6 text-center text-slate-500 dark:text-neutral-400">{{ t('ui-builder.import_nothing_here') }}</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <button v-if="tabEntries.length > limit" type="button" class="text-xs underline-offset-2 hover:underline" @click="limit += PAGE">{{ t('ui-builder.import_show_more') }}</button>
                </template>
            </template>
        </div>

        <!-- ============================================================ importing -->
        <div v-else-if="flow.step.value === 'importing'" class="space-y-3 py-10 text-center">
            <Loader2 class="mx-auto h-8 w-8 animate-spin text-slate-400 dark:text-neutral-400" />
            <p class="text-sm font-medium">{{ t(flow.phase.value === 'photos' ? 'ui-builder.import_saving_photos' : 'ui-builder.import_saving', flow.progress.value) }}</p>
            <div class="mx-auto h-2 max-w-md overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div class="h-full bg-emerald-500 transition-all" :style="{ width: percent + '%' }" />
            </div>
            <p class="text-xs text-slate-500 dark:text-neutral-400">{{ t('ui-builder.import_dont_close') }}</p>
        </div>

        <!-- ============================================================ done -->
        <div v-else class="space-y-4 py-4 text-center">
            <CheckCircle2 class="mx-auto h-10 w-10 text-emerald-500" />
            <p class="text-lg font-semibold">{{ t('ui-builder.import_done') }}</p>
            <p class="text-sm text-slate-600 dark:text-slate-300">
                {{ t('ui-builder.import_summary', { ...flow.counts.value, failed: flow.failed.value.length }) }}
            </p>
            <p v-if="flow.photosAdded.value || flow.photosFailed.value" class="text-sm text-slate-600 dark:text-slate-300">
                {{ t('ui-builder.import_photos_done', { count: flow.photosAdded.value }) }}<span v-if="flow.photosFailed.value" class="text-amber-700 dark:text-amber-300"> {{ t('ui-builder.import_photos_failed', { count: flow.photosFailed.value }) }}</span>
            </p>
            <p v-if="flow.undone.value" class="text-sm font-medium text-emerald-700 dark:text-emerald-300" role="status">
                {{ flow.undone.value.remaining ? t('ui-builder.import_undone', flow.undone.value) : t('ui-builder.import_undone_all', flow.undone.value) }}
            </p>
            <p v-if="flow.error.value" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300" role="alert">{{ flow.error.value }}</p>
            <button v-if="flow.counts.value.created > 0 && !flow.undone.value" type="button" :disabled="flow.undoing.value" :class="['mx-1 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium', theme.secondaryButton]" @click="confirmUndo">
                <Undo2 class="h-4 w-4" />{{ t('ui-builder.import_undo') }}
            </button>
            <button v-if="flow.failed.value.length" type="button" :class="['inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium', theme.secondaryButton]" @click="flow.downloadProblems()">
                <Download class="h-4 w-4" />{{ t('ui-builder.import_download_problems', { count: flow.failed.value.length }) }}
            </button>
        </div>

        <template #footer>
            <div class="flex w-full items-center justify-end gap-2">
                <button v-if="flow.step.value !== 'importing'" type="button" :class="['rounded-md px-4 py-2 text-sm font-medium', theme.secondaryButton]" @click="handleClose">
                    {{ flow.step.value === 'done' ? t('ui-builder.import_close') : t('ui-builder.cancel') }}
                </button>
                <button v-if="flow.step.value === 'check' && !flow.busy.value && !flow.missingRequired.value.length" type="button"
                    :class="['inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold', theme.primaryButton]"
                    :disabled="!flow.ready.value.length" @click="flow.importNow()">
                    {{ t('ui-builder.import_now', { count: flow.ready.value.length }) }}
                </button>
            </div>
        </template>
    </DialogWrapper>
</template>

<script setup lang="ts">
import { resolveLabel, resolveModuleName } from '../../i18n';
import pluralize from 'pluralize';
import {
    CalendarClock, CalendarRange, CheckCircle2, Download, FileSpreadsheet, Gift, ImagePlus, Loader2, Package, Pencil, Pill, Repeat, Scale, Shirt, ShieldCheck, Smartphone, Timer,
    Undo2, Upload, UtensilsCrossed, Wrench, XCircle,
} from '@lucide/vue';
import { computed, ref, watch } from 'vue';
import { useUiI18n } from '../../i18n';
import { useImport } from '../../composables/useImport';
import type { ImportEntry } from '../../types/import';
import { PHOTOS_PER_ITEM } from '../../utils/importPhotos';
import type { ImportConfig, ThemeConfig } from '../../types/module';
import DialogWrapper from './DialogWrapper.vue';

interface Props {
    isOpen: boolean;
    config: ImportConfig;
    moduleName: string;
    theme: ThemeConfig;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:isOpen': [value: boolean]; close: []; imported: [] }>();
const { t } = useUiI18n();

// Named imports only (never the lucide barrel): a product type names its icon as a string.
const TYPE_ICONS: Record<string, any> = {
    Package, UtensilsCrossed, Scale, Wrench, Download, Pill, Timer, Smartphone, Shirt, ShieldCheck, CalendarClock, CalendarRange, Repeat, Gift,
};
const typeIcon = (name?: string | null) => (name && TYPE_ICONS[name]) || Package;

const PAGE = 100;
const flow = useImport(props.config, props.moduleName);
const moduleTitle = computed(() => resolveModuleName(props.moduleName, pluralize(props.moduleName, 2, false)));

const dragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const activeTab = ref<'fix' | 'ready' | 'all'>('all');
const limit = ref(PAGE);

const tabs = computed(() => [
    { key: 'all' as const, label: t('ui-builder.import_tab_all'), count: flow.entries.value.length },
    { key: 'fix' as const, label: t('ui-builder.import_tab_fix'), count: flow.failed.value.length },
    { key: 'ready' as const, label: t('ui-builder.import_tab_ready'), count: flow.ready.value.length },
]);

const tabEntries = computed<ImportEntry[]>(() =>
    activeTab.value === 'fix' ? flow.failed.value : activeTab.value === 'ready' ? flow.ready.value : flow.entries.value,
);
const visibleEntries = computed(() => tabEntries.value.slice(0, limit.value));
const shownColumns = computed(() => flow.columns.value.filter((c) => flow.mapping.value[c.key] !== undefined));
const percent = computed(() => (flow.progress.value.total ? Math.round((flow.progress.value.done / flow.progress.value.total) * 100) : 0));

// Modules with a choice to make first (products: the type) list their options when opened.
watch(
    () => props.isOpen,
    (open) => {
        if (open) flow.loadVariants();
    },
    { immediate: true },
);

// Land on the rows that need attention first.
watch(
    () => flow.busy.value,
    (busy) => {
        if (!busy && flow.step.value === 'check') activeTab.value = flow.failed.value.length ? 'fix' : 'all';
    },
);

const onPick = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) flow.handleFile(file);
    if (fileInput.value) fileInput.value.value = '';
};

const onDrop = (event: DragEvent) => {
    dragging.value = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) flow.handleFile(file);
};

const photoDragging = ref(false);
const photoInput = ref<HTMLInputElement | null>(null);

const onPhotoPick = (event: Event) => {
    flow.addPhotos([...((event.target as HTMLInputElement).files ?? [])]);
    if (photoInput.value) photoInput.value.value = '';
};

const onPhotoDrop = (event: DragEvent) => {
    photoDragging.value = false;
    flow.addPhotos([...(event.dataTransfer?.files ?? [])]);
};

const confirmUndo = () => {
    if (window.confirm(t('ui-builder.import_undo_confirm', { count: flow.counts.value.created }))) flow.undoImport();
};

const onEdit = async (entry: ImportEntry, key: string, value: string) => {
    entry.data = { ...entry.data, [key]: value === '' ? null : value };
    await flow.recheckRow(entry);
};

const handleClose = () => {
    const imported = flow.step.value === 'done' && flow.counts.value.created + flow.counts.value.updated > 0;
    emit('update:isOpen', false);
    emit('close');
    if (imported) emit('imported');
    setTimeout(() => flow.reset(), 300);
};
</script>
