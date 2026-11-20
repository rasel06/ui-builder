<template>
    <DialogWrapper
        :is-open="isOpen"
        :title="t('ui-builder.export_settings')"
        dialog-size="4xl"
        :theme="theme"
        @close="handleClose"
    >
        <div class="export-dialog-grid grid grid-cols-1 gap-3 md:grid-cols-12">
            <div class="space-y-3 md:col-span-7">
                <div class="space-y-1 text-left">
                    <label
                        class="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                        <FileDown class="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                        {{ t('ui-builder.export_format') }}
                    </label>
                    <div
                        :class="[
                            'grid grid-cols-2 gap-1.5',
                            enabledFormatCount > 4
                                ? 'sm:grid-cols-5'
                                : 'sm:grid-cols-4',
                        ]"
                    >
                        <button
                            v-if="exportConfig.pdf"
                            type="button"
                            :class="[
                                'format-btn flex flex-col items-center justify-center rounded-lg border p-2 transition-all hover:scale-102 active:scale-98',
                                localFormat === 'pdf'
                                    ? 'border-red-500 bg-red-50/50 text-red-600 ring-2 ring-red-500/20 dark:bg-red-950/20 dark:text-red-400'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800',
                            ]"
                            @click="localFormat = 'pdf'"
                        >
                            <FileText class="h-4.5 w-4.5" />
                            <span
                                class="mt-0.5 text-[11px] font-semibold"
                            >{{ t('ui-builder.pdf') }}</span>
                        </button>

                        <button
                            v-if="exportConfig.excel"
                            type="button"
                            :class="[
                                'format-btn flex flex-col items-center justify-center rounded-lg border p-2 transition-all hover:scale-102 active:scale-98',
                                localFormat === 'excel'
                                    ? 'border-green-500 bg-green-50/50 text-green-600 ring-2 ring-green-500/20 dark:bg-green-950/20 dark:text-green-400'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800',
                            ]"
                            @click="localFormat = 'excel'"
                        >
                            <FileSpreadsheet class="h-4.5 w-4.5" />
                            <span class="mt-0.5 text-[11px] font-semibold"
                                >{{ t('ui-builder.excel') }}</span
                            >
                        </button>

                        <button
                            v-if="exportConfig.csv"
                            type="button"
                            :class="[
                                'format-btn flex flex-col items-center justify-center rounded-lg border p-2 transition-all hover:scale-102 active:scale-98',
                                localFormat === 'csv'
                                    ? 'border-blue-500 bg-blue-50/50 text-blue-600 ring-2 ring-blue-500/20 dark:bg-blue-950/20 dark:text-blue-400'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800',
                            ]"
                            @click="localFormat = 'csv'"
                        >
                            <Table class="h-4.5 w-4.5" />
                            <span class="mt-0.5 text-[11px] font-semibold"
                                >{{ t('ui-builder.csv') }}</span
                            >
                        </button>

                        <button
                            v-if="exportConfig.json"
                            type="button"
                            :class="[
                                'format-btn flex flex-col items-center justify-center rounded-lg border p-2 transition-all hover:scale-102 active:scale-98',
                                localFormat === 'json'
                                    ? 'border-amber-500 bg-amber-50/50 text-amber-600 ring-2 ring-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800',
                            ]"
                            @click="localFormat = 'json'"
                        >
                            <FileJson class="h-4.5 w-4.5" />
                            <span class="mt-0.5 text-[11px] font-semibold"
                                >{{ t('ui-builder.json') }}</span
                            >
                        </button>

                        <button
                            v-if="exportConfig.print"
                            type="button"
                            :class="[
                                'format-btn flex flex-col items-center justify-center rounded-lg border p-2 transition-all hover:scale-102 active:scale-98',
                                localFormat === 'print'
                                    ? 'border-slate-600 bg-slate-100/50 text-slate-600 ring-2 ring-slate-500/20 dark:border-slate-400 dark:bg-slate-800/50 dark:text-slate-400'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800',
                            ]"
                            @click="localFormat = 'print'"
                        >
                            <Printer class="h-4.5 w-4.5" />
                            <span class="mt-0.5 text-[11px] font-semibold"
                                >{{ t('ui-builder.print') }}</span
                            >
                        </button>
                    </div>
                </div>

                <div class="space-y-1 text-left">
                    <label
                        class="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                        <Calendar class="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                        {{ t('ui-builder.data_range') }}
                    </label>
                    <div class="flex flex-col gap-1.5 sm:flex-row">
                        <label
                            :class="[
                                'scope-btn flex flex-1 cursor-pointer items-center justify-between rounded-lg border p-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800',
                                localScope === 'current'
                                    ? 'border-slate-600 bg-slate-50/50 dark:border-slate-400 dark:bg-slate-800/40'
                                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
                            ]"
                            :style="
                                localScope === 'current'
                                    ? {
                                          borderColor: activeHex,
                                          backgroundColor: activeHex + '05',
                                      }
                                    : {}
                            "
                        >
                            <div class="flex items-center gap-1.5">
                                <input
                                    type="radio"
                                    name="exportScope"
                                    value="current"
                                    v-model="localScope"
                                    class="h-3.5 w-3.5 cursor-pointer focus:ring-0"
                                    :style="{ accentColor: activeHex }"
                                />
                                <div class="text-left">
                                    <p
                                        class="text-[13px] font-medium text-slate-800 dark:text-slate-200"
                                    >
                                        {{ t('ui-builder.current_page') }}
                                    </p>
                                    <p
                                        class="text-[9px] text-slate-600 dark:text-slate-400"
                                    >
                                        {{ t('ui-builder.export_active_page_only') }}
                                    </p>
                                </div>
                            </div>
                            <span
                                class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            >
                                {{ dataCount }} {{ t('ui-builder.records') }}
                            </span>
                        </label>

                        <label
                            :class="[
                                'scope-btn flex flex-1 cursor-pointer items-center justify-between rounded-lg border p-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800',
                                localScope === 'all'
                                    ? 'border-slate-600 bg-slate-50/50 dark:border-slate-400 dark:bg-slate-800/40'
                                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
                            ]"
                            :style="
                                localScope === 'all'
                                    ? {
                                          borderColor: activeHex,
                                          backgroundColor: activeHex + '05',
                                      }
                                    : {}
                            "
                        >
                            <div class="flex items-center gap-1.5">
                                <input
                                    type="radio"
                                    name="exportScope"
                                    value="all"
                                    v-model="localScope"
                                    class="h-3.5 w-3.5 cursor-pointer focus:ring-0"
                                    :style="{ accentColor: activeHex }"
                                />
                                <div class="text-left">
                                    <p
                                        class="text-[13px] font-medium text-slate-800 dark:text-slate-200"
                                    >
                                        {{ t('ui-builder.all_available_data') }}
                                    </p>
                                    <p
                                        class="text-[9px] text-slate-600 dark:text-slate-400"
                                    >
                                        {{ t('ui-builder.export_all_filtered_records') }}
                                    </p>
                                </div>
                            </div>
                            <span
                                class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                                :style="{
                                    backgroundColor: activeHex + '1a',
                                    color: activeHex,
                                }"
                            >
                                {{ totalCount }} {{ t('ui-builder.records') }}
                            </span>
                        </label>
                    </div>
                </div>

                <Transition name="fade">
                    <div
                        v-if="localFormat === 'pdf' || localFormat === 'print'"
                        class="layout-options-box space-y-2 rounded-xl border border-slate-200 bg-slate-50/30 p-2.5 dark:border-slate-800 dark:bg-slate-950/20"
                    >
                        <h4
                            class="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
                        >
                            <Settings2 class="h-3.5 w-3.5 text-slate-500 dark:text-neutral-400" />
                            {{ t('ui-builder.page_layout_options') }}
                        </h4>

                        <div class="layout-row-grid grid grid-cols-2 gap-2">
                            <div class="space-y-0.5 text-left">
                                <label
                                    class="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    <Ruler class="h-3 w-3 text-slate-500 dark:text-neutral-400" />
                                    {{ t('ui-builder.page_size') }}
                                </label>
                                <div
                                    class="relative flex items-center rounded-md border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-slate-500/20 dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <span
                                        class="pointer-events-none absolute top-1/2 left-2 z-10 -translate-y-1/2 text-slate-600 dark:text-slate-400"
                                    >
                                        <Ruler class="h-3 w-3" />
                                    </span>
                                    <v-select
                                        v-model="pdfConfig.pageSize"
                                        :options="pageSizeOptions"
                                        label="label"
                                        :reduce="(opt: any) => opt.value"
                                        :clearable="false"
                                        :searchable="false"
                                        class="export-page-size-select w-full"
                                    />
                                </div>
                            </div>

                            <div class="space-y-0.5 text-left">
                                <label
                                    class="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    <Compass class="h-3 w-3 text-slate-500 dark:text-neutral-400" />
                                    {{ t('ui-builder.orientation') }}
                                </label>
                                <div
                                    class="flex h-[26px] items-center rounded-md border border-slate-200 bg-slate-100/50 p-0.5 dark:border-slate-800 dark:bg-slate-900/60"
                                >
                                    <button
                                        type="button"
                                        @click="
                                            pdfConfig.orientation = 'portrait'
                                        "
                                        :class="[
                                            'flex h-full flex-1 items-center justify-center gap-0.5 rounded px-1 text-[10px] font-bold transition-all active:scale-95',
                                            pdfConfig.orientation === 'portrait'
                                                ? 'border border-slate-200/50 bg-white text-slate-900 shadow-xs dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-100'
                                                : 'dark:hover:text-slate-350 text-slate-500 hover:text-slate-700',
                                        ]"
                                    >
                                        <svg
                                            class="h-3 w-3 shrink-0 text-current"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            stroke-width="2"
                                        >
                                            <rect
                                                x="6"
                                                y="3"
                                                width="12"
                                                height="18"
                                                rx="1.5"
                                            />
                                            <line
                                                x1="9"
                                                y1="7"
                                                x2="15"
                                                y2="7"
                                            />
                                            <line
                                                x1="9"
                                                y1="11"
                                                x2="15"
                                                y2="11"
                                            />
                                            <line
                                                x1="9"
                                                y1="15"
                                                x2="13"
                                                y2="15"
                                            />
                                        </svg>
                                        {{ t('ui-builder.portrait') }}
                                    </button>
                                    <button
                                        type="button"
                                        @click="
                                            pdfConfig.orientation = 'landscape'
                                        "
                                        :class="[
                                            'flex h-full flex-1 items-center justify-center gap-0.5 rounded px-1 text-[10px] font-bold transition-all active:scale-95',
                                            pdfConfig.orientation ===
                                            'landscape'
                                                ? 'border border-slate-200/50 bg-white text-slate-900 shadow-xs dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-100'
                                                : 'dark:hover:text-slate-350 text-slate-500 hover:text-slate-700',
                                        ]"
                                    >
                                        <svg
                                            class="h-3 w-3 shrink-0 text-current"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            stroke-width="2"
                                        >
                                            <rect
                                                x="3"
                                                y="6"
                                                width="18"
                                                height="12"
                                                rx="1.5"
                                            />
                                            <line
                                                x1="6"
                                                y1="10"
                                                x2="18"
                                                y2="10"
                                            />
                                            <line
                                                x1="6"
                                                y1="14"
                                                x2="14"
                                                y2="14"
                                            />
                                        </svg>
                                        {{ t('ui-builder.landscape') }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-2">
                            <div
                                class="cell-padding-box space-y-1 rounded-lg border border-slate-200/80 bg-white p-2 text-left dark:border-slate-800/80 dark:bg-slate-900/50"
                            >
                                <div class="flex items-center justify-between">
                                    <label
                                        class="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        <Maximize2
                                            class="h-3 w-3 text-slate-500 dark:text-neutral-400"
                                        />
                                        {{ t('ui-builder.table_cell_padding') }}
                                    </label>
                                    <span
                                        class="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-bold text-slate-500 dark:text-neutral-400 dark:bg-slate-800"
                                    >
                                        {{ pdfConfig.cellPadding }}mm
                                    </span>
                                </div>
                                <div class="flex h-5 items-center gap-2">
                                    <button
                                        type="button"
                                        @click="
                                            pdfConfig.cellPadding = Math.max(
                                                1,
                                                pdfConfig.cellPadding - 0.5,
                                            )
                                        "
                                        class="rounded p-0.5 text-slate-500 dark:text-neutral-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:text-neutral-100 dark:hover:bg-slate-800"
                                    >
                                        <Minus class="h-3 w-3" />
                                    </button>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        step="0.5"
                                        v-model.number="pdfConfig.cellPadding"
                                        class="h-0.5 flex-grow cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-gray-700"
                                        :style="{ accentColor: activeHex }"
                                    />
                                    <button
                                        type="button"
                                        @click="
                                            pdfConfig.cellPadding = Math.min(
                                                10,
                                                pdfConfig.cellPadding + 0.5,
                                            )
                                        "
                                        class="rounded p-0.5 text-slate-500 dark:text-neutral-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:text-neutral-100 dark:hover:bg-slate-800"
                                    >
                                        <Plus class="h-3 w-3" />
                                    </button>
                                </div>
                            </div>

                            <div class="space-y-1 text-left">
                                <label
                                    class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    <Frame class="h-3.5 w-3.5 text-slate-500 dark:text-neutral-400" />
                                    {{ t('ui-builder.margins') }}
                                </label>
                                <div
                                    class="margins-box grid grid-cols-12 items-center gap-2 rounded-lg border border-slate-200/80 bg-white p-2 dark:border-slate-800/80 dark:bg-slate-900/50"
                                >
                                    <div class="col-span-4 space-y-1.5">
                                        <div class="space-y-0.5">
                                            <span
                                                class="flex items-center gap-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500"
                                            >
                                                <ArrowUp
                                                    class="text-slate-550 h-2.5 w-2.5"
                                                />
                                                {{ t('ui-builder.margin_top') }}
                                            </span>
                                            <div
                                                class="relative flex items-center rounded-md border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-slate-500/20 dark:border-slate-800 dark:bg-slate-900"
                                            >
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    v-model.number="
                                                        pdfConfig.margin.top
                                                    "
                                                    class="margin-input w-full bg-transparent py-1 pr-6 pl-1.5 text-left text-[11px] font-semibold text-slate-700 focus:outline-none dark:text-slate-200"
                                                />
                                                <span
                                                    class="text-slate-450 absolute right-1 text-[9px] font-bold select-none dark:text-slate-500"
                                                >
                                                    mm
                                                </span>
                                            </div>
                                        </div>
                                        <div class="space-y-0.5">
                                            <span
                                                class="flex items-center gap-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500"
                                            >
                                                <ArrowLeft
                                                    class="h-2.5 w-2.5 text-slate-500 dark:text-neutral-400"
                                                />
                                                {{ t('ui-builder.margin_left') }}
                                            </span>
                                            <div
                                                class="relative flex items-center rounded-md border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-slate-500/20 dark:border-slate-800 dark:bg-slate-900"
                                            >
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    v-model.number="
                                                        pdfConfig.margin.left
                                                    "
                                                    class="margin-input w-full bg-transparent py-1 pr-6 pl-1.5 text-left text-[11px] font-semibold text-slate-700 focus:outline-none dark:text-slate-200"
                                                />
                                                <span
                                                    class="text-slate-450 absolute right-1 text-[9px] font-bold select-none dark:text-slate-500"
                                                >
                                                    mm
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        class="preview-graphic-container col-span-4 flex h-20 flex-col items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50/50 p-0.5 select-none dark:border-slate-800 dark:bg-slate-900/30"
                                    >
                                        <div
                                            :class="[
                                                isPortrait
                                                    ? 'h-14 w-10.5'
                                                    : 'h-10.5 w-14',
                                                'relative flex items-center justify-center overflow-hidden rounded border border-slate-300 bg-white shadow-xs transition-all duration-300 dark:border-slate-700 dark:bg-slate-950',
                                            ]"
                                        >
                                            <div
                                                class="border-slate-350 absolute inset-x-0 border-t border-dashed dark:border-slate-800"
                                                :style="{
                                                    top: `${Math.min((pdfConfig.margin.top ?? 14) / 3.5, maxTopBottom)}px`,
                                                }"
                                            ></div>
                                            <div
                                                class="border-slate-350 absolute inset-x-0 border-b border-dashed dark:border-slate-800"
                                                :style="{
                                                    bottom: `${Math.min((pdfConfig.margin.bottom ?? 14) / 3.5, maxTopBottom)}px`,
                                                }"
                                            ></div>
                                            <div
                                                class="border-slate-350 absolute inset-y-0 border-l border-dashed dark:border-slate-800"
                                                :style="{
                                                    left: `${Math.min((pdfConfig.margin.left ?? 14) / 3.5, maxLeftRight)}px`,
                                                }"
                                            ></div>
                                            <div
                                                class="border-slate-350 absolute inset-y-0 border-r border-dashed dark:border-slate-800"
                                                :style="{
                                                    right: `${Math.min((pdfConfig.margin.right ?? 14) / 3.5, maxLeftRight)}px`,
                                                }"
                                            ></div>

                                            <div
                                                class="pointer-events-none z-10 w-full space-y-0.5 px-1.5 opacity-30"
                                            >
                                                <div
                                                    class="dark:bg-slate-650 mx-auto h-0.5 w-3/4 rounded-sm bg-slate-400"
                                                ></div>
                                                <div
                                                    class="dark:bg-slate-850 h-0.5 w-full rounded-xs bg-slate-300"
                                                ></div>
                                                <div
                                                    class="dark:bg-slate-850 h-0.5 w-full rounded-xs bg-slate-300"
                                                ></div>
                                            </div>
                                        </div>
                                        <span
                                            class="dark:text-slate-550 mt-0.5 text-[8px] font-bold text-slate-400 select-none"
                                            >{{ t('ui-builder.layout') }}</span
                                        >
                                    </div>

                                    <div class="col-span-4 space-y-1.5">
                                        <div class="space-y-0.5">
                                            <span
                                                class="flex items-center gap-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500"
                                            >
                                                <ArrowDown
                                                    class="text-slate-555 h-2.5 w-2.5"
                                                />
                                                {{ t('ui-builder.margin_bottom') }}
                                            </span>
                                            <div
                                                class="relative flex items-center rounded-md border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-slate-500/20 dark:border-slate-800 dark:bg-slate-900"
                                            >
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    v-model.number="
                                                        pdfConfig.margin.bottom
                                                    "
                                                    class="margin-input w-full bg-transparent py-1 pr-6 pl-1.5 text-left text-[11px] font-semibold text-slate-700 focus:outline-none dark:text-slate-200"
                                                />
                                                <span
                                                    class="text-slate-450 absolute right-1 text-[9px] font-bold select-none dark:text-slate-500"
                                                >
                                                    mm
                                                </span>
                                            </div>
                                        </div>
                                        <div class="space-y-0.5">
                                            <span
                                                class="flex items-center gap-0.5 text-[9px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500"
                                            >
                                                <ArrowRight
                                                    class="text-slate-555 h-2.5 w-2.5"
                                                />
                                                {{ t('ui-builder.margin_right') }}
                                            </span>
                                            <div
                                                class="relative flex items-center rounded-md border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-slate-500/20 dark:border-slate-800 dark:bg-slate-900"
                                            >
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    v-model.number="
                                                        pdfConfig.margin.right
                                                    "
                                                    class="margin-input w-full bg-transparent py-1 pr-6 pl-1.5 text-left text-[11px] font-semibold text-slate-700 focus:outline-none dark:text-slate-200"
                                                />
                                                <span
                                                    class="text-slate-450 absolute right-1 text-[9px] font-bold select-none dark:text-slate-500"
                                                >
                                                    mm
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            class="toggle-box flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-left dark:border-slate-800/80 dark:bg-slate-900/50"
                        >
                            <div class="flex items-center gap-2">
                                <span
                                    class="text-slate-600 dark:text-slate-400"
                                >
                                    <Heading class="h-4 w-4" />
                                </span>
                                <div>
                                    <p
                                        class="text-xs font-semibold text-slate-700 dark:text-slate-200"
                                    >
                                        {{ t('ui-builder.repeat_table_headers') }}
                                    </p>
                                    <p
                                        class="text-[9px] text-slate-600 dark:text-slate-400"
                                    >
                                        {{ t('ui-builder.show_headers_every_page') }}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                @click="
                                    pdfConfig.repeatHeader =
                                        !pdfConfig.repeatHeader
                                "
                                class="relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                :style="{
                                    backgroundColor: pdfConfig.repeatHeader
                                        ? activeHex
                                        : '#cbd5e1',
                                }"
                            >
                                <span
                                    class="pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-neutral-900 shadow ring-0 transition duration-200 ease-in-out"
                                    :class="
                                        pdfConfig.repeatHeader
                                            ? 'translate-x-4'
                                            : 'translate-x-0'
                                    "
                                ></span>
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>

            <div
                class="dark:bg-slate-955 checklist-container flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white md:col-span-5 md:h-full md:min-h-[300px] dark:border-slate-800"
            >
                <div
                    class="checklist-header flex shrink-0 items-center justify-between border-b bg-slate-50 px-3 py-2 dark:bg-slate-900/50"
                >
                    <label
                        class="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                        <Columns class="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                        {{ t('ui-builder.include_columns') }}
                    </label>
                    <span
                        class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 dark:text-neutral-400 dark:bg-slate-800"
                    >
                        {{ selectedCols.length }} / {{ targetColumns.length }}
                    </span>
                </div>

                <div
                    class="checklist-toolbar flex shrink-0 items-center justify-between border-b bg-slate-50/30 px-3 py-1.5 dark:bg-slate-900/30"
                >
                    <span
                        class="text-[9px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500"
                        >{{ t('ui-builder.quick_select') }}</span
                    >
                    <div class="flex items-center gap-1">
                        <button
                            type="button"
                            class="hover:bg-slate-205 flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 transition-all active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            @click="selectAllColumns"
                        >
                            <CheckCheck class="h-2.5 w-2.5" />
                            {{ t('ui-builder.all') }}
                        </button>
                        <button
                            type="button"
                            class="hover:bg-slate-205 flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 transition-all active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            @click="selectVisibleColumns"
                        >
                            <Eye class="h-2.5 w-2.5" />
                            {{ t('ui-builder.visible') }}
                        </button>
                        <button
                            type="button"
                            class="flex items-center gap-0.5 rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
                            @click="clearAllColumns"
                        >
                            <X class="h-2.5 w-2.5" />
                            {{ t('ui-builder.clear') }}
                        </button>
                    </div>
                </div>

                <div
                    class="flex-grow scrollbar-thin scrollbar-thumb-slate-200 space-y-1 overflow-y-auto p-2 dark:scrollbar-thumb-slate-800"
                >
                    <label
                        v-for="col in targetColumns"
                        :key="col.key"
                        :class="[
                            'checklist-item flex cursor-pointer items-center gap-2 rounded-lg border p-1.5 text-left transition-all select-none active:scale-[0.99]',
                            selectedCols.includes(col.key)
                                ? 'border-slate-200 bg-slate-50/50 shadow-xs dark:border-slate-800 dark:bg-slate-900/50'
                                : 'border-transparent bg-white hover:bg-slate-50/30 dark:bg-transparent dark:hover:bg-slate-900/20',
                        ]"
                        :style="
                            selectedCols.includes(col.key)
                                ? {
                                      borderColor: activeHex + '20',
                                      backgroundColor: activeHex + '03',
                                  }
                                : {}
                        "
                    >
                        <div
                            class="relative flex shrink-0 items-center justify-center"
                        >
                            <input
                                type="checkbox"
                                :value="col.key"
                                v-model="selectedCols"
                                class="sr-only"
                            />
                            <div
                                :class="[
                                    'flex h-4 w-4 items-center justify-center rounded border transition-all',
                                    selectedCols.includes(col.key)
                                        ? 'border-transparent text-white'
                                        : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900',
                                ]"
                                :style="
                                    selectedCols.includes(col.key)
                                        ? { backgroundColor: activeHex }
                                        : {}
                                "
                            >
                                <Check
                                    v-if="selectedCols.includes(col.key)"
                                    class="h-2.5 w-2.5 stroke-[3]"
                                />
                            </div>
                        </div>

                        <div
                            class="flex min-w-0 flex-grow items-center justify-between gap-2"
                        >
                            <div class="flex min-w-0 items-center gap-2">
                                <component
                                    :is="getColumnIcon(col)"
                                    class="h-3.5 w-3.5 shrink-0 text-slate-400 transition-colors dark:text-slate-500"
                                    :style="
                                        selectedCols.includes(col.key)
                                            ? { color: activeHex }
                                            : {}
                                    "
                                />
                                <div class="min-w-0">
                                    <p
                                        class="truncate text-xs font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        {{ resolveColumnLabel(col) }}
                                    </p>
                                    <p
                                        class="text-slate-450 truncate font-mono text-[9px] dark:text-slate-500"
                                    >
                                        {{ col.key }}
                                    </p>
                                </div>
                            </div>
                            <span
                                v-if="visibleColumns.includes(col.key)"
                                class="shrink-0 rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-500 dark:text-neutral-400 select-none dark:bg-slate-800"
                            >
                                {{ t('ui-builder.visible') }}
                            </span>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex w-full items-center justify-between">
                <div class="text-left text-xs font-semibold text-slate-500 dark:text-neutral-400">
                    <span v-if="isProcessing" class="flex items-center gap-2">
                        <Loader2 class="h-4 w-4 animate-spin text-slate-600" />
                        {{ t('ui-builder.fetching_records') }}
                    </span>
                </div>

                <div class="flex gap-2">
                    <button
                        type="button"
                        :class="`h-9 rounded-md px-4 font-medium transition-colors ${theme.secondaryButton}`"
                        @click="handleClose"
                        :disabled="isProcessing"
                    >
                        {{ t('ui-builder.cancel') }}
                    </button>
                    <button
                        type="button"
                        :disabled="selectedCols.length === 0 || isProcessing"
                        :class="`h-9 min-w-[120px] rounded-md px-4 font-medium transition-colors ${theme.primaryButton} ${selectedCols.length === 0 || isProcessing ? 'cursor-not-allowed opacity-50' : ''}`"
                        @click="handleExport"
                    >
                        <span v-if="isProcessing">{{ t('ui-builder.exporting') }}</span>
                        <span v-else>{{ confirmButtonLabel }}</span>
                    </button>
                </div>
            </div>
        </template>
    </DialogWrapper>
</template>

<script setup lang="ts">
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Award,
    Building2,
    Calendar,
    CalendarDays,
    Check,
    CheckCheck,
    CheckCircle,
    Columns,
    Compass,
    DollarSign,
    Eye,
    FileDown,
    FileJson,
    FileSpreadsheet,
    FileText,
    Frame,
    Globe,
    Hash,
    Heading,
    Loader2,
    Mail,
    Maximize2,
    Minus,
    Phone,
    Plus,
    Printer,
    Ruler,
    Settings2,
    Shield,
    Table,
    Tag,
    ToggleLeft,
    User,
    X,
} from '@lucide/vue';
import { resolveColumnLabel, resolveLabel } from '../../i18n';
import { computed, ref, watch } from 'vue';
import { useUiI18n } from '../../i18n';
import vSelect from 'vue-select';

const { t } = useUiI18n();

const pageSizeOptions = [
    { value: 'a3', label: 'A3 (297 x 420 mm)' },
    { value: 'a4', label: 'A4 (210 x 297 mm)' },
    { value: 'a5', label: 'A5 (148 x 210 mm)' },
    { value: 'letter', label: 'Letter (8.5" x 11")' },
    { value: 'legal', label: 'Legal (8.5" x 14")' },
];
import type {
    ExportFormat,
    ModuleConfig,
    ThemeConfig,
} from '../../types/module';
import { themeColorFamily } from '../../composables/themes';
import { normalizeExportConfig } from '../../utils/exportUtils';
import DialogWrapper from './DialogWrapper.vue';

interface Props {
    isOpen: boolean;
    config: ModuleConfig;
    visibleColumns: string[];
    dataCount: number;
    totalCount: number;
    theme: ThemeConfig;
    defaultFormat: ExportFormat;
    isProcessing?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isProcessing: false,
});

const emit = defineEmits<{
    'update:isOpen': [value: boolean];
    close: [];
    export: [
        options: {
            format: ExportFormat;
            scope: 'current' | 'all';
            columns: string[];
            pdfConfig: {
                pageSize: string;
                orientation: 'portrait' | 'landscape';
                cellPadding: number;
                repeatHeader: boolean;
                margin: {
                    top: number;
                    bottom: number;
                    left: number;
                    right: number;
                };
            };
        },
    ];
}>();

const exportConfig = computed(() => {
    return normalizeExportConfig(props.config?.exportConfig);
});

const themeColorName = computed(() => {
    return themeColorFamily(props.theme?.primaryButton) ?? 'blue';
});

const themeHexMap: Record<string, string> = {
    gray: '#4b5563',
    blue: '#2563eb',
    green: '#059669',
    purple: '#7c3aed',
    red: '#dc2626',
    orange: '#ea580c',
    yellow: '#ca8a04',
    teal: '#0d9488',
    cyan: '#0891b2',
    indigo: '#4f46e5',
    pink: '#db2777',
    rose: '#e11d48',
    slate: '#475569',
    zinc: '#52525b',
    stone: '#57534e',
    neutral: '#525252',
    lime: '#65a30d',
    amber: '#d97706',
    violet: '#7c3aed',
};

const activeHex = computed(() => {
    return themeHexMap[themeColorName.value] || '#2563eb';
});

// Drives the format grid's column count — with JSON opted in there are five tiles,
// which would otherwise wrap one onto a second row.
const enabledFormatCount = computed(
    () =>
        [
            exportConfig.value.pdf,
            exportConfig.value.excel,
            exportConfig.value.csv,
            exportConfig.value.json,
            exportConfig.value.print,
        ].filter(Boolean).length,
);

const targetColumns = computed(() => {
    return props.config.tableColumns.filter(
        (col) => !['select', 'actions'].includes(col.key),
    );
});

const getColumnIcon = (col: any) => {
    const key = (col.key || '').toLowerCase();
    const type = (col.type || '').toLowerCase();

    // Check specific keys first
    if (key === 'id') return Hash;
    if (key.includes('email')) return Mail;
    if (
        key.includes('phone') ||
        key.includes('mobile') ||
        key.includes('contact')
    )
        return Phone;
    if (key.includes('role') || key.includes('permission')) return Shield;
    if (
        key.includes('date') ||
        key.includes('time') ||
        key.includes('created_at') ||
        key.includes('updated_at') ||
        key.includes('since')
    )
        return CalendarDays;
    if (key.includes('department') || key.includes('dept')) return Building2;
    if (
        key.includes('designation') ||
        key.includes('title') ||
        key.includes('job')
    )
        return Award;
    if (
        key.includes('employee_id') ||
        key.includes('code') ||
        key.includes('number') ||
        key.includes('no')
    )
        return Hash;
    if (
        key.includes('status') ||
        key.includes('active') ||
        key.includes('enabled')
    )
        return CheckCircle;
    if (
        key.includes('salary') ||
        key.includes('price') ||
        key.includes('amount') ||
        key.includes('cost') ||
        key.includes('fee')
    )
        return DollarSign;
    if (key.includes('website') || key.includes('url') || key.includes('link'))
        return Globe;

    // Check types
    if (
        type === 'avatar' ||
        key.includes('avatar') ||
        key.includes('image') ||
        key.includes('photo')
    )
        return User;
    if (type === 'badge') return Tag;
    if (type === 'switch' || type === 'boolean') return ToggleLeft;
    if (type === 'status') return CheckCircle;

    // Default fallback
    return FileText;
};

const localFormat = ref<ExportFormat>(props.defaultFormat);
const localScope = ref<'current' | 'all'>('current');
const selectedCols = ref<string[]>([...props.visibleColumns]);
const pdfConfig = ref({
    pageSize: exportConfig.value.pageSize,
    orientation: exportConfig.value.orientation as 'portrait' | 'landscape',
    cellPadding: exportConfig.value.cellPadding,
    repeatHeader: exportConfig.value.repeatHeader,
    margin:
        typeof exportConfig.value.margin === 'object' &&
        exportConfig.value.margin !== null
            ? {
                  top: exportConfig.value.margin.top ?? 14,
                  bottom: exportConfig.value.margin.bottom ?? 14,
                  left: exportConfig.value.margin.left ?? 14,
                  right: exportConfig.value.margin.right ?? 14,
              }
            : {
                  top: Number(exportConfig.value.margin) || 14,
                  bottom: Number(exportConfig.value.margin) || 14,
                  left: Number(exportConfig.value.margin) || 14,
                  right: Number(exportConfig.value.margin) || 14,
              },
});

const isPortrait = computed(() => pdfConfig.value.orientation === 'portrait');
const maxTopBottom = computed(() => (isPortrait.value ? 16 : 12));
const maxLeftRight = computed(() => (isPortrait.value ? 12 : 16));

watch(
    () => props.defaultFormat,
    (val) => {
        localFormat.value = val;
    },
);

watch(
    () => props.isOpen,
    (isOpen) => {
        if (isOpen) {
            localScope.value = 'current';
            selectedCols.value = props.visibleColumns.filter(
                (k) => !['select', 'actions'].includes(k),
            );
            pdfConfig.value = {
                pageSize: exportConfig.value.pageSize,
                orientation: exportConfig.value.orientation as
                    'portrait' | 'landscape',
                cellPadding: exportConfig.value.cellPadding,
                repeatHeader: exportConfig.value.repeatHeader,
                margin:
                    typeof exportConfig.value.margin === 'object' &&
                    exportConfig.value.margin !== null
                        ? {
                              top: exportConfig.value.margin.top ?? 14,
                              bottom: exportConfig.value.margin.bottom ?? 14,
                              left: exportConfig.value.margin.left ?? 14,
                              right: exportConfig.value.margin.right ?? 14,
                          }
                        : {
                              top: Number(exportConfig.value.margin) || 14,
                              bottom: Number(exportConfig.value.margin) || 14,
                              left: Number(exportConfig.value.margin) || 14,
                              right: Number(exportConfig.value.margin) || 14,
                          },
            };
        }
    },
);

const confirmButtonLabel = computed(() => {
    switch (localFormat.value) {
        case 'pdf':
            return t('ui-builder.export_pdf');
        case 'excel':
            return t('ui-builder.export_excel');
        case 'csv':
            return t('ui-builder.export_csv');
        case 'json':
            return t('ui-builder.export_json');
        case 'print':
            return t('ui-builder.print');
        default:
            return t('ui-builder.export');
    }
});

const selectAllColumns = () => {
    selectedCols.value = targetColumns.value.map((c) => c.key);
};

const selectVisibleColumns = () => {
    selectedCols.value = props.visibleColumns.filter(
        (k) => !['select', 'actions'].includes(k),
    );
};

const clearAllColumns = () => {
    selectedCols.value = [];
};

const handleClose = () => {
    emit('update:isOpen', false);
    emit('close');
};

const handleExport = () => {
    emit('export', {
        format: localFormat.value,
        scope: localScope.value,
        columns: selectedCols.value,
        pdfConfig: pdfConfig.value,
    });
};
</script>

<style scoped>
/* Relies on FormField.vue's base (unscoped) vue-select CSS reset, which ships in the same
   bundle since ModuleManager.vue always loads both — but doesn't reuse .vue-select-custom's
   sm/md/lg/xl size presets, since none match this control's 26px/11px compact dimensions. */
.export-page-size-select :deep(.vs__dropdown-toggle) {
    border: none;
    background-color: transparent;
    padding: 0 6px 0 22px;
    height: 26px;
    min-height: 26px;
    display: flex;
    align-items: center;
}
.export-page-size-select :deep(.vs__selected) {
    margin: 0;
    padding: 0;
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
}
.export-page-size-select :deep(.vs__search) {
    margin: 0;
    padding: 0;
    font-size: 11px;
}
.export-page-size-select :deep(.vs__actions) {
    padding: 0 4px 0 0;
}
.export-page-size-select :deep(.vs__clear) {
    display: none;
}
.export-page-size-select :deep(.vs__dropdown-menu) {
    z-index: 70;
    font-size: 11px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-height: 850px) {
    .export-dialog-grid {
        gap: 0.5rem !important;
    }

    :deep(.p-4) {
        padding: 0.5rem !important;
    }
    :deep(.pt-4) {
        padding-top: 0.5rem !important;
    }
    :deep(.p-3) {
        padding: 0.5rem 0.75rem !important;
    }

    .space-y-3 > :not([hidden]) ~ :not([hidden]) {
        margin-top: 0.375rem !important;
    }

    .format-btn {
        padding: 0.25rem 0.5rem !important;
    }
    .format-btn span {
        font-size: 10px !important;
        margin-top: 0.125rem !important;
    }
    .format-btn svg {
        width: 1rem !important;
        height: 1rem !important;
    }

    .scope-btn {
        padding: 0.25rem 0.5rem !important;
    }
    .scope-btn p.text-\[13px\] {
        font-size: 11px !important;
    }
    .scope-btn p.text-\[9px\] {
        font-size: 8px !important;
    }
    .scope-btn span {
        font-size: 9px !important;
        padding: 0.125rem 0.375rem !important;
    }

    .layout-options-box {
        padding: 0.375rem !important;
        border-radius: 0.5rem !important;
    }
    .layout-options-box > :not([hidden]) ~ :not([hidden]) {
        margin-top: 0.25rem !important;
    }
    .layout-options-box h4 {
        margin-bottom: 0.125rem !important;
    }

    .layout-row-grid {
        gap: 0.375rem !important;
    }

    .layout-row-grid select {
        padding-top: 0.125rem !important;
        padding-bottom: 0.125rem !important;
        font-size: 10px !important;
    }
    .layout-row-grid select + span svg {
        width: 0.65rem !important;
        height: 0.65rem !important;
    }
    .layout-row-grid label {
        font-size: 10px !important;
    }
    .layout-row-grid label svg {
        width: 0.65rem !important;
        height: 0.65rem !important;
    }

    .layout-row-grid button {
        font-size: 9px !important;
        height: 1.25rem !important; /* 20px instead of 26px */
    }
    .layout-row-grid button svg {
        width: 0.65rem !important;
        height: 0.65rem !important;
    }

    .cell-padding-box,
    .margins-box,
    .toggle-box {
        padding: 0.25rem 0.375rem !important;
        border-radius: 0.375rem !important;
    }

    .cell-padding-box .flex.items-center.justify-between span {
        font-size: 9px !important;
        padding: 0.125rem 0.25rem !important;
    }

    .preview-graphic-container {
        height: 3.5rem !important; /* 56px instead of 80px */
    }
    .preview-graphic-container div.relative {
        transform: scale(0.7) !important;
    }
    .preview-graphic-container span {
        display: none !important; /* Hide "Layout" text to save space */
    }
    .margins-box .col-span-4[class*='space-y-1.5'] {
        gap: 0.125rem !important;
    }
    .margins-box
        .col-span-4[class*='space-y-1.5']
        > :not([hidden])
        ~ :not([hidden]) {
        margin-top: 0.125rem !important;
    }
    .margins-box input {
        padding-top: 0.125rem !important;
        padding-bottom: 0.125rem !important;
        font-size: 10px !important;
    }
    .margins-box span.text-\[9px\] {
        font-size: 8px !important;
    }

    .checklist-container {
        min-height: 200px !important;
        border-radius: 0.5rem !important;
    }
    .checklist-header {
        padding: 0.25rem 0.5rem !important;
    }
    .checklist-toolbar {
        padding: 0.15rem 0.5rem !important;
    }
    .checklist-item {
        padding: 0.25rem 0.375rem !important;
        border-radius: 0.375rem !important;
    }
    .checklist-item p.text-xs {
        font-size: 11px !important;
    }
    .checklist-item p.text-\[9px\] {
        font-size: 8px !important;
    }
}
</style>
