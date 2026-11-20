<template>
    <div
        class="density-transition flex flex-col overflow-hidden"
        style="min-height: 380px; max-height: 70vh"
    >
        <!-- ── Top toolbar ─────────────────────────────────────────────── -->
        <div
            :class="[
                'flex items-center justify-between border-b py-3',
                theme.cardBorder,
                gapClass,
            ]"
        >
            <div :class="['flex items-center justify-start', gapClass]">
                <div class="relative w-40 sm:w-56">
                    <Search
                        :class="`absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 ${theme.paginationText}`"
                    />
                    <input
                        v-model="searchQuery"
                        type="text"
                        :placeholder="t('ui-builder.search')"
                        :class="[
                            controlHeightTextClass,
                            `w-full rounded-md border pr-3 pl-9 font-medium transition-colors outline-none placeholder:font-medium focus:ring-1 ${theme.inputBackground} ${theme.inputBorder} ${theme.inputText} focus:border-indigo-400 focus:ring-indigo-400`,
                        ]"
                    />
                    <button
                        v-if="searchQuery"
                        @click="clearSearch"
                        :class="`absolute top-1/2 right-2.5 -translate-y-1/2 ${theme.paginationText} hover:text-red-500`"
                    >
                        <X class="h-4 w-4" />
                    </button>
                </div>
                <span
                    v-if="!listLoading"
                    :class="`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${theme.badgeBackground} ${theme.badgeText}`"
                >
                    {{ isPaginated ? totalCount : displayRecords.length }}
                </span>

                <!-- Grouped Filters Popover -->
                <div
                    v-if="crudConfig.customFilters && crudConfig.customFilters.length > 0"
                    class="flex items-center gap-1.5"
                >
                    <Popover v-model:open="isFilterGroupOpen">
                        <PopoverTrigger as-child>
                            <button
                                type="button"
                                :class="[
                                    buttonSizeClass,
                                    `flex items-center gap-2 rounded-md border px-3 text-left font-medium shadow-sm transition-all hover:scale-102 active:scale-98 ${theme.secondaryButton || 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`,
                                ]"
                            >
                                <ListFilter class="h-4 w-4 opacity-70" />
                                <span>{{ resolveLabel(crudConfig.filterConfig?.groupTitle || 'ui-builder.filters') }}</span>
                                <div
                                    v-if="activeFiltersCount > 0"
                                    class="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-semibold text-white"
                                >
                                    {{ activeFiltersCount }}
                                </div>
                                <ChevronDown class="h-4 w-4 opacity-50 transition-transform duration-200" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            :class="`z-[60] flex w-[280px] flex-col gap-4 border p-4 shadow-xl ${theme.cardBackground} ${theme.cardBorder}`"
                            align="start"
                        >
                            <div
                                v-for="filter in crudConfig.customFilters"
                                :key="filter.key"
                                class="flex flex-col gap-1.5"
                            >
                                <label
                                    :class="`text-xs font-semibold tracking-wider uppercase ${theme.labelText} opacity-60`"
                                >
                                    {{ resolveLabel(filter.label) }}
                                </label>
                                <Select
                                    :model-value="String(customFilterValues[filter.key] ?? 'all')"
                                    @update:model-value="(val) => handleSubFilterChange(filter.key, val)"
                                >
                                    <SelectTrigger
                                        :class="`flex h-9 items-center justify-between rounded-md border px-3 text-left font-medium shadow-sm ${theme.inputBackground} ${theme.inputBorder} ${theme.badgeText}`"
                                    >
                                        <SelectValue
                                            :placeholder="resolveLabel(filter.placeholder || filter.label)"
                                        />
                                    </SelectTrigger>
                                    <SelectContent
                                        :class="`z-[70] border ${theme.inputBackground} ${theme.inputBorder} ${theme.badgeText}`"
                                    >
                                        <SelectItem
                                            v-for="option in filter.options"
                                            :key="String(option.value)"
                                            :value="String(option.value)"
                                            :class="`focus:${theme.badgeBackground} focus:${theme.badgeText}`"
                                        >
                                            {{ resolveLabel(option.label) }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div
                                v-if="activeFiltersCount > 0"
                                class="flex justify-end border-t border-gray-100 pt-2 dark:border-gray-800"
                            >
                                <button
                                    type="button"
                                    @click="clearAllSubFilters"
                                    class="flex items-center gap-1 text-xs font-medium text-rose-500 transition-colors hover:text-rose-600"
                                >
                                    <RotateCcw class="h-3.5 w-3.5" />
                                    <span>{{ t('ui-builder.reset_filters') }}</span>
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <button
                        v-if="activeFiltersCount > 0"
                        type="button"
                        @click="clearAllSubFilters"
                        class="flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-gray-500 dark:text-neutral-400 transition-colors hover:bg-gray-100 hover:text-rose-600 dark:hover:bg-gray-800"
                        :title="t('ui-builder.reset_filters')"
                    >
                        <RotateCcw class="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div :class="['flex shrink-0 items-center', gapClass]">
                <template v-if="canExport && exportConfigResolved">
                    <div
                        v-if="exportConfigResolved.showAsDropdown"
                        :class="['flex items-center', gapClass]"
                    >
                        <template
                            v-if="
                                exportConfigResolved.printPosition === 'first'
                            "
                        >
                            <button
                                v-if="exportConfigResolved.print"
                                :disabled="
                                    exportConfigResolved.activeOnlyOnData &&
                                    (!displayRecords ||
                                        displayRecords.length === 0)
                                "
                                @click="handleExportTrigger('print')"
                                :title="resolveLabel('ui-builder.print')"
                                :class="[
                                    buttonSizeClass,
                                    `flex items-center gap-1 rounded-md border font-medium transition-all hover:scale-102 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40 ${theme.secondaryButton}`,
                                ]"
                            >
                                <Printer class="h-4 w-4 opacity-70" />
                                <span>{{ resolveLabel('ui-builder.print') }}</span>
                            </button>
                        </template>

                        <!-- Dropdown for the rest (PDF, Excel, CSV) when disabled -->
                        <button
                            v-if="
                                exportConfigResolved.activeOnlyOnData &&
                                (!displayRecords || displayRecords.length === 0)
                            "
                            disabled
                            :class="[
                                buttonSizeClass,
                                `flex cursor-not-allowed items-center gap-1 rounded-md border font-medium opacity-40 ${theme.secondaryButton}`,
                            ]"
                        >
                            <Download class="h-4 w-4 opacity-70" />
                            <span>{{ resolveLabel('ui-builder.export') }}</span>
                            <ChevronDown class="h-4 w-4 opacity-50" />
                        </button>

                        <!-- Dropdown for the rest (PDF, Excel, CSV, JSON) when enabled -->
                        <DropdownMenu
                            v-else-if="
                                exportConfigResolved.pdf ||
                                exportConfigResolved.excel ||
                                exportConfigResolved.csv ||
                                exportConfigResolved.json
                            "
                        >
                            <DropdownMenuTrigger as-child>
                                <button
                                    :class="[
                                        buttonSizeClass,
                                        `flex items-center gap-1 rounded-md border font-medium transition-all hover:scale-102 active:scale-98 ${theme.secondaryButton}`,
                                    ]"
                                >
                                    <Download class="h-4 w-4 opacity-70" />
                                    <span>{{ resolveLabel('ui-builder.export') }}</span>
                                    <ChevronDown class="h-4 w-4 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                :class="
                                    cn(
                                        'w-36 border',
                                        theme.menuBackground,
                                        theme.menuBorder,
                                        theme.menuText,
                                    )
                                "
                                :collision-padding="8"
                            >
                                <DropdownMenuItem
                                    v-if="exportConfigResolved.pdf"
                                    @click="handleExportTrigger('pdf')"
                                    :class="`flex cursor-pointer items-center gap-2 focus:${theme.badgeBackground || 'bg-gray-100 dark:bg-white/10'} focus:${theme.badgeText || 'text-gray-800 dark:text-neutral-200'}`"
                                >
                                    <FileText
                                        class="h-4 w-4 text-red-600 dark:text-red-400"
                                    />
                                    <span>{{ resolveLabel('ui-builder.pdf') }}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    v-if="exportConfigResolved.excel"
                                    @click="handleExportTrigger('excel')"
                                    :class="`flex cursor-pointer items-center gap-2 focus:${theme.badgeBackground || 'bg-gray-100 dark:bg-white/10'} focus:${theme.badgeText || 'text-gray-800 dark:text-neutral-200'}`"
                                >
                                    <FileSpreadsheet
                                        class="h-4 w-4 text-green-600 dark:text-green-400"
                                    />
                                    <span>{{ resolveLabel('ui-builder.excel') }}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    v-if="exportConfigResolved.csv"
                                    @click="handleExportTrigger('csv')"
                                    :class="`flex cursor-pointer items-center gap-2 focus:${theme.badgeBackground || 'bg-gray-100 dark:bg-white/10'} focus:${theme.badgeText || 'text-gray-800 dark:text-neutral-200'}`"
                                >
                                    <Table
                                        class="h-4 w-4 text-blue-600 dark:text-blue-400"
                                    />
                                    <span>{{ resolveLabel('ui-builder.csv') }}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    v-if="exportConfigResolved.json"
                                    @click="handleExportTrigger('json')"
                                    :class="`flex cursor-pointer items-center gap-2 focus:${theme.badgeBackground || 'bg-gray-100 dark:bg-white/10'} focus:${theme.badgeText || 'text-gray-800 dark:text-neutral-200'}`"
                                >
                                    <FileJson
                                        class="h-4 w-4 text-amber-600 dark:text-amber-400"
                                    />
                                    <span>{{ resolveLabel('ui-builder.json') }}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <template
                            v-if="
                                exportConfigResolved.printPosition !== 'first'
                            "
                        >
                            <button
                                v-if="exportConfigResolved.print"
                                :disabled="
                                    exportConfigResolved.activeOnlyOnData &&
                                    (!displayRecords ||
                                        displayRecords.length === 0)
                                "
                                @click="handleExportTrigger('print')"
                                :title="resolveLabel('ui-builder.print')"
                                :class="[
                                    buttonSizeClass,
                                    `flex items-center gap-1 rounded-md border font-medium transition-all hover:scale-102 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40 ${theme.secondaryButton}`,
                                ]"
                            >
                                <Printer class="h-4 w-4 opacity-70" />
                                <span>{{ resolveLabel('ui-builder.print') }}</span>
                            </button>
                        </template>
                    </div>

                    <template v-else>
                        <template v-if="!exportConfigResolved.showAsGroup">
                            <button
                                v-if="exportConfigResolved.pdf"
                                :disabled="
                                    exportConfigResolved.activeOnlyOnData &&
                                    (!displayRecords ||
                                        displayRecords.length === 0)
                                "
                                :title="resolveLabel('ui-builder.export_pdf')"
                                @click="handleExportTrigger('pdf')"
                                :class="[
                                    squareButtonSizeClass,
                                    `flex items-center justify-center rounded-md border font-medium transition-all hover:scale-102 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40 ${theme.secondaryButton}`,
                                ]"
                            >
                                <FileText class="h-5 w-5 opacity-70" />
                            </button>
                            <button
                                v-if="exportConfigResolved.excel"
                                :disabled="
                                    exportConfigResolved.activeOnlyOnData &&
                                    (!displayRecords ||
                                        displayRecords.length === 0)
                                "
                                :title="resolveLabel('ui-builder.export_excel')"
                                @click="handleExportTrigger('excel')"
                                :class="[
                                    squareButtonSizeClass,
                                    `flex items-center justify-center rounded-md border font-medium transition-all hover:scale-102 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40 ${theme.secondaryButton}`,
                                ]"
                            >
                                <FileSpreadsheet class="h-5 w-5 opacity-70" />
                            </button>
                            <button
                                v-if="exportConfigResolved.csv"
                                :disabled="
                                    exportConfigResolved.activeOnlyOnData &&
                                    (!displayRecords ||
                                        displayRecords.length === 0)
                                "
                                :title="resolveLabel('ui-builder.export_csv')"
                                @click="handleExportTrigger('csv')"
                                :class="[
                                    squareButtonSizeClass,
                                    `flex items-center justify-center rounded-md border font-medium transition-all hover:scale-102 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40 ${theme.secondaryButton}`,
                                ]"
                            >
                                <Table class="h-5 w-5 opacity-70" />
                            </button>
                            <button
                                v-if="exportConfigResolved.json"
                                :disabled="
                                    exportConfigResolved.activeOnlyOnData &&
                                    (!displayRecords ||
                                        displayRecords.length === 0)
                                "
                                :title="resolveLabel('ui-builder.export_json')"
                                @click="handleExportTrigger('json')"
                                :class="[
                                    squareButtonSizeClass,
                                    `flex items-center justify-center rounded-md border font-medium transition-all hover:scale-102 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40 ${theme.secondaryButton}`,
                                ]"
                            >
                                <FileJson class="h-5 w-5 opacity-70" />
                            </button>
                            <button
                                v-if="exportConfigResolved.print"
                                :disabled="
                                    exportConfigResolved.activeOnlyOnData &&
                                    (!displayRecords ||
                                        displayRecords.length === 0)
                                "
                                :title="resolveLabel('ui-builder.print')"
                                @click="handleExportTrigger('print')"
                                :class="[
                                    squareButtonSizeClass,
                                    `flex items-center justify-center rounded-md border font-medium transition-all hover:scale-102 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40 ${theme.secondaryButton}`,
                                ]"
                            >
                                <Printer class="h-5 w-5 opacity-70" />
                            </button>
                        </template>

                        <div v-else class="flex items-center gap-2">
                            <template
                                v-if="
                                    exportConfigResolved.printPosition ===
                                    'first'
                                "
                            >
                                <button
                                    v-if="exportConfigResolved.print"
                                    :disabled="
                                        exportConfigResolved.activeOnlyOnData &&
                                        (!displayRecords ||
                                            displayRecords.length === 0)
                                    "
                                    :title="resolveLabel('ui-builder.print')"
                                    @click="handleExportTrigger('print')"
                                    :class="[
                                        squareButtonSizeClass,
                                        `flex items-center justify-center rounded-md border font-medium transition-all hover:scale-102 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40 ${theme.secondaryButton}`,
                                    ]"
                                >
                                    <Printer class="h-5 w-5 opacity-70" />
                                </button>
                            </template>

                            <div
                                v-if="
                                    exportConfigResolved.pdf ||
                                    exportConfigResolved.excel ||
                                    exportConfigResolved.csv ||
                                    exportConfigResolved.json
                                "
                                :class="`flex items-center overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 ${theme.inputBackground || 'dark:bg-gray-855 bg-white'}`"
                            >
                                <button
                                    v-if="exportConfigResolved.pdf"
                                    :disabled="
                                        exportConfigResolved.activeOnlyOnData &&
                                        (!displayRecords ||
                                            displayRecords.length === 0)
                                    "
                                    :title="resolveLabel('ui-builder.export_pdf')"
                                    @click="handleExportTrigger('pdf')"
                                    :class="[
                                        squareButtonSizeClass,
                                        'flex items-center justify-center rounded-none border-0 border-r border-gray-200 last:border-r-0 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800/40',
                                    ]"
                                >
                                    <FileText class="h-5 w-5 opacity-70" />
                                </button>
                                <button
                                    v-if="exportConfigResolved.excel"
                                    :disabled="
                                        exportConfigResolved.activeOnlyOnData &&
                                        (!displayRecords ||
                                            displayRecords.length === 0)
                                    "
                                    :title="resolveLabel('ui-builder.export_excel')"
                                    @click="handleExportTrigger('excel')"
                                    :class="[
                                        squareButtonSizeClass,
                                        'flex items-center justify-center rounded-none border-0 border-r border-gray-200 last:border-r-0 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800/40',
                                    ]"
                                >
                                    <FileSpreadsheet
                                        class="h-5 w-5 opacity-70"
                                    />
                                </button>
                                <button
                                    v-if="exportConfigResolved.csv"
                                    :disabled="
                                        exportConfigResolved.activeOnlyOnData &&
                                        (!displayRecords ||
                                            displayRecords.length === 0)
                                    "
                                    :title="resolveLabel('ui-builder.export_csv')"
                                    @click="handleExportTrigger('csv')"
                                    :class="[
                                        squareButtonSizeClass,
                                        'flex items-center justify-center rounded-none border-0 border-r border-gray-200 last:border-r-0 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800/40',
                                    ]"
                                >
                                    <Table class="h-5 w-5 opacity-70" />
                                </button>
                                <button
                                    v-if="exportConfigResolved.json"
                                    :disabled="
                                        exportConfigResolved.activeOnlyOnData &&
                                        (!displayRecords ||
                                            displayRecords.length === 0)
                                    "
                                    :title="resolveLabel('ui-builder.export_json')"
                                    @click="handleExportTrigger('json')"
                                    :class="[
                                        squareButtonSizeClass,
                                        'flex items-center justify-center rounded-none border-0 border-r border-gray-200 last:border-r-0 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800/40',
                                    ]"
                                >
                                    <FileJson class="h-5 w-5 opacity-70" />
                                </button>
                            </div>

                            <template
                                v-if="
                                    exportConfigResolved.printPosition !==
                                    'first'
                                "
                            >
                                <button
                                    v-if="exportConfigResolved.print"
                                    :disabled="
                                        exportConfigResolved.activeOnlyOnData &&
                                        (!displayRecords ||
                                            displayRecords.length === 0)
                                    "
                                    :title="resolveLabel('ui-builder.print')"
                                    @click="handleExportTrigger('print')"
                                    :class="[
                                        squareButtonSizeClass,
                                        `flex items-center justify-center rounded-md border font-medium transition-all hover:scale-102 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40 ${theme.secondaryButton}`,
                                    ]"
                                >
                                    <Printer class="h-5 w-5 opacity-70" />
                                </button>
                            </template>
                        </div>
                    </template>
                </template>

                <button
                    v-if="canCreate"
                    @click="startCreate"
                    :class="[
                        buttonSizeClass,
                        `flex items-center gap-1.5 rounded-md font-medium transition-colors ${isCreating ? theme.secondaryButton : theme.primaryButton}`,
                    ]"
                >
                    <Plus class="h-4 w-4" />
                    {{ resolveLabel(crudConfig.createLabel ?? 'ui-builder.add') }}
                </button>
            </div>
        </div>

        <!-- ── Table (scrollable) ─────────────────────────────────────── -->
        <Transition name="table-fade" mode="out-in">
            <div
                class="flex-1 overflow-y-auto"
                :key="listLoading ? 'loading' : 'loaded'"
            >
                <div class="overflow-x-auto">
                    <GenericTable
                        :data="displayRecords"
                        :columns="gridColumns"
                        :visible-columns="visibleColumns"
                        :sort-config="subSortConfig"
                        :selected-rows="selectedRows"
                        :total-count="isPaginated ? totalCount : displayRecords.length"
                        :theme="theme"
                        :can-bulk-delete="canBulkDelete"
                        :custom-row-actions="crudConfig.customRowActions || []"
                        :action-config="crudConfig.actionConfig"
                        :config="(crudConfig as any)"
                        :update-endpoint="crudConfig.actionConfig?.edit?.endpoint || crudConfig.updateEndpoint"
                        :edit-icon="crudConfig.editIcon"
                        :delete-icon="crudConfig.deleteIcon"
                        @row-click="startEdit"
                        @delete="handleTableDelete"
                        @bulk-action="handleBulkAction"
                        @custom-row-action="(action, row) => action.onClick && action.onClick(row, router)"
                        @toggle-column="handleToggleColumn"
                        @reset-columns="resetColumns"
                        @sort="toggleSort"
                        @selection-change="selectedRows = $event"
                        @export="(f) => handleExportTrigger(f)"
                    />
                </div>
            </div>
        </Transition>

        <!-- ── Sub-dialog for Add/Edit ────────────────────────────────────────── -->
        <DialogWrapper
            v-model:is-open="isFormDialogOpen"
            :title="
                isCreating
                    ? resolveLabel(crudConfig.createLabel ?? 'ui-builder.add_new_record')
                    : resolveLabel(crudConfig.updateLabel ?? 'ui-builder.edit_record')
            "
            :dialog-size="
                isCreating
                    ? crudConfig.createDialogSize || 'xl'
                    : crudConfig.updateDialogSize || 'xl'
            "
            :theme="theme"
            :density="density"
            :close-on-backdrop="false"
            :close-on-escape="false"
            @close="isCreating ? cancelCreate() : cancelEdit()"
        >
            <div v-if="isFormDialogOpen" class="@container">
                <div :class="['grid grid-cols-12', gridGapClass]">
                    <div
                        v-for="field in processedFormFields"
                        v-show="evaluateFieldVisibility(field)"
                        :key="field.name"
                        :class="
                            getGridSpanClass(
                                typeof field.width === 'function'
                                    ? field.width(!isCreating, inlineFormData, {
                                          auth,
                                      })
                                    : field.width,
                            )
                        "
                    >
                        <template v-if="field.type === 'switch'">
                            <div class="space-y-1.5">
                                <label
                                    :class="`text-sm font-bold ${theme.labelText || 'text-gray-700 dark:text-gray-300'}`"
                                >
                                    {{ resolveFieldLabel(field) }}
                                    <span
                                        v-if="field.required"
                                        :class="
                                            theme.errorText || 'text-red-600'
                                        "
                                    >
                                        *
                                    </span>
                                </label>
                                <div class="flex items-center">
                                    <SwitchColumn
                                        :key="`${field.name}-${inlineFormData[field.name]}`"
                                        :row="inlineFormData"
                                        :isChecked="inlineFormData[field.name]"
                                        :config="{
                                            field: field.name,
                                            onLabel: ' ',
                                            offLabel: ' ',
                                            confirmToggle: false,
                                            onToggle: () => {},
                                            ...(field.switchConfig || {}),
                                        }"
                                        :theme="theme"
                                        :size="field.size || 'md'"
                                        @change="
                                            (val) => {
                                                // 1. Update the primary value
                                                inlineFormData[field.name] =
                                                    val;

                                                // 2. Execute cross-field logic
                                                if (field.onChange) {
                                                    field.onChange(
                                                        inlineFormData,
                                                        val,
                                                    );
                                                }
                                            }
                                        "
                                    />
                                </div>
                                <p
                                    v-if="field.placeholder"
                                    :class="`text-xs ${theme.paginationText || 'text-gray-500 dark:text-neutral-400'}`"
                                >
                                    {{ field.placeholder }}
                                </p>
                            </div>
                        </template>
                        <FormField
                            v-else
                            :field="field"
                            :value="inlineFormData[field.name]"
                            :error="inlineFormErrors[field.name]"
                            :theme="theme"
                            :size="getFieldSize(field)"
                            :selectedTheme="theme.name || 'indigo'"
                            :form-data="{ ...inlineFormData, parentRow: props.row, product_id: props.row?.id }"
                            :form="{ ...inlineFormData, parentRow: props.row, product_id: props.row?.id }"
                            @update="
                                (name, val) => {
                                    inlineFormData[name] = val;
                                    if (field.onChange) {
                                        field.onChange(
                                            inlineFormData.value,
                                            val,
                                        );
                                    }
                                }
                            "
                            @keyup.enter="
                                if (
                                    field.type !== 'rich-text' &&
                                    field.type !== 'textarea'
                                ) {
                                    isCreating
                                        ? submitCreate()
                                        : submitUpdate({ id: editingRowId });
                                }
                            "
                        />
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex items-center gap-3">
                    <button
                        @click="isCreating ? cancelCreate() : cancelEdit()"
                        :class="`rounded-md px-4 py-2 text-sm font-medium transition-colors ${theme.secondaryButton}`"
                    >
                        Cancel
                    </button>
                    <button
                        @click="
                            isCreating
                                ? submitCreate()
                                : submitUpdate({ id: editingRowId })
                        "
                        :disabled="isSubmitting"
                        :class="`flex items-center gap-2 rounded-md ${theme.primaryButton} px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50`"
                    >
                        <svg
                            v-if="isSubmitting"
                            class="h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                            />
                            <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <Save v-else class="h-4 w-4" />
                        {{ isCreating ? resolveLabel('ui-builder.create') : resolveLabel('ui-builder.update') }}
                    </button>
                </div>
            </template>
        </DialogWrapper>

        <!-- ── Pagination bar (server-side mode only) ──────────────────── -->
        <div
            v-if="isPaginated && !listLoading && totalPages > 0"
            :class="[
                'flex items-center justify-between border-t',
                paginationPaddingClass,
                theme.cardBorder,
                theme.tableBackground,
            ]"
        >
            <div dir="ltr" class="flex items-center gap-2">
                <span :class="`text-sm ${theme.tableTextSecondary}`"
                    >{{ resolveLabel('ui-builder.rows') }}:</span
                >
                <v-select
                    :model-value="localPerPage"
                    :options="[5, 10, 25, 50, 100]"
                    :clearable="false"
                    :searchable="false"
                    :style="rowsSelectVars"
                    :class="[
                        'vue-select-custom ub-sized w-[78px] rounded-md border',
                        theme.inputBackground,
                        theme.inputBorder,
                        theme.inputText,
                    ]"
                    @update:model-value="selectPerPage"
                />
            </div>

            <span dir="ltr" :class="`text-sm ${theme.tableTextSecondary}`">
                {{ pageStart }} - {{ pageEnd }} of {{ totalCount }}
            </span>

            <div class="flex items-center gap-1">
                <button
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage <= 1 || listLoading"
                    :class="[
                        'flex items-center justify-center rounded-md transition-colors',
                        squareButtonSizeClass,
                        theme.paginationButton,
                        'disabled:cursor-not-allowed disabled:opacity-40',
                    ]"
                >
                    <ChevronLeft class="h-4 w-4 rtl:-scale-x-100" />
                </button>

                <!-- Page number pills (show up to 5 around current) -->
                <template v-for="p in visiblePageNumbers" :key="p">
                    <span
                        v-if="p === '...'"
                        :class="[
                            'flex items-center justify-center text-sm',
                            squareButtonSizeClass,
                            theme.tableTextSecondary,
                        ]"
                        >…</span
                    >
                    <button
                        v-else
                        @click="goToPage(p as number)"
                        :class="[
                            'flex items-center justify-center rounded-md px-2 transition-colors',
                            squareButtonSizeClass,
                            (p as number) === currentPage
                                ? theme.paginationActiveButton
                                : theme.paginationButton,
                        ]"
                    >
                        {{ p }}
                    </button>
                </template>

                <button
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage >= totalPages || listLoading"
                    :class="[
                        'flex items-center justify-center rounded-md transition-colors',
                        squareButtonSizeClass,
                        theme.paginationButton,
                        'disabled:cursor-not-allowed disabled:opacity-40',
                    ]"
                >
                    <ChevronRight class="h-4 w-4 rtl:-scale-x-100" />
                </button>
            </div>
        </div>

        <!-- ── Keyboard hint ───────────────────────────────────────────── -->
        <div
            v-if="isCreating || editingRowId !== null"
            :class="`flex items-center gap-4 border-t px-4 py-2 text-sm ${theme.cardBorder} ${theme.tableTextSecondary}`"
        >
            <span class="flex items-center gap-1.5">
                <kbd
                    :class="`rounded border px-1.5 py-0.5 font-mono text-xs ${theme.inputBackground} ${theme.inputBorder}`"
                    >↵ Enter</kbd
                >
                Save
            </span>
            <span class="flex items-center gap-1.5">
                <kbd
                    :class="`rounded border px-1.5 py-0.5 font-mono text-xs ${theme.inputBackground} ${theme.inputBorder}`"
                    >Esc</kbd
                >
                Cancel
            </span>
        </div>

        <ExportDialog
            v-if="canExport"
            v-model:is-open="isExportDialogOpen"
            :config="
                {
                    tableColumns: props.crudConfig.tableColumns,
                    exportConfig: props.crudConfig.exportConfig,
                } as any
            "
            :visible-columns="
                props.crudConfig.tableColumns
                    .filter((c) => !['select', 'actions'].includes(c.key))
                    .map((c) => c.key)
            "
            :data-count="displayRecords.length"
            :total-count="isPaginated ? totalCount : filteredRecords.length"
            :theme="theme"
            :default-format="exportDefaultFormat"
            :is-processing="isExportProcessing"
            @export="executeExport"
        />
    </div>
</template>

<script setup lang="ts">
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../primitives/dropdown-menu';
import { resolveColumnLabel, resolveFieldLabel, resolveLabel } from '../../i18n';
import { cn } from '../../lib/utils';
import { router, usePage } from '../../adapters/inertia';
import { readPageProps } from '../../adapters/pageProps';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    FileJson,
    FileSpreadsheet,
    FileText,
    ListFilter,
    PackageOpen,
    Pencil,
    Plus,
    Printer,
    RotateCcw,
    Save,
    Search,
    Table,
    Trash2,
    X,
} from '@lucide/vue';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../../primitives/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../primitives/select';
import axios from 'axios';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useUiI18n } from '../../i18n';
import vSelect from 'vue-select';

const { t } = useUiI18n();
import { DENSITY_CONFIGS, themeColorFamily } from '../../composables/themes';
import { toast } from '../../composables/useToast';
import type {
    ColumnConfig,
    CustomFilter,
    DensityType,
    ExportFormat,
    FilterConfig,
    GridWidth,
    SubModuleCrudConfig,
    ThemeConfig,
} from '../../types/module';
import {
    handleExportCSV,
    handleExportExcel,
    handleExportJSON,
    handleExportPDF,
    handlePrint,
    normalizeExportConfig,
} from '../../utils/exportUtils';
import { evaluateVisibility } from '../../utils/fieldUtils';
import { gridWidthClass, resolveControlSize } from '../../utils/sizing';
import DialogWrapper from './DialogWrapper.vue';
import ExportDialog from './ExportDialog.vue';
import FormField from './FormField.vue';
import GenericTable from './GenericTable.vue';
import SwitchColumn from './SwitchColumn.vue';

// ── Props & Emits ────────────────────────────────────────────────────────────
interface Props {
    crudConfig: SubModuleCrudConfig;
    theme: ThemeConfig;
    row?: any;
    formInputSize?: string;
    density?: DensityType;
}

const props = withDefaults(defineProps<Props>(), {
    formInputSize: 'md',
    density: 'normal',
});
const emit = defineEmits<{ change: [] }>();

const currentDensity = computed(
    () => DENSITY_CONFIGS[props.density] || DENSITY_CONFIGS.normal,
);

const controlHeightTextClass = computed(() => {
    if (props.density === 'compact') return 'h-8 text-xs';
    if (props.density === 'relaxed') return 'h-10 text-base';
    return 'h-9 text-sm';
});

const buttonSizeClass = computed(() => {
    if (props.density === 'compact') return 'h-8 text-xs px-3';
    if (props.density === 'relaxed') return 'h-10 text-base px-5';
    return 'h-9 text-sm px-4';
});

const squareButtonSizeClass = computed(() => {
    if (props.density === 'compact') return 'h-8 w-8';
    if (props.density === 'relaxed') return 'h-10 w-10';
    return 'h-9 w-9';
});

const paginationPaddingClass = computed(() => {
    if (props.density === 'compact') return 'py-1.5 px-3';
    if (props.density === 'relaxed') return 'py-3.5 px-5';
    return 'py-2.5 px-4';
});

const computedFormInputSize = computed(() => {
    if (props.density === 'compact') return 'sm';
    if (props.density === 'relaxed') return 'lg';
    return props.formInputSize || 'md';
});

// Rows-per-page select follows the form size (any token or raw classes, utils/sizing.ts).
const rowsSelectVars = computed(
    () => resolveControlSize(computedFormInputSize.value).vars,
);

const gridGapClass = computed(() => {
    if (props.density === 'compact') return 'gap-x-3 gap-y-2.5';
    if (props.density === 'relaxed') return 'gap-x-6 gap-y-6';
    return 'gap-x-4 gap-y-4';
});

const gapClass = computed(() => {
    if (props.density === 'compact') return 'gap-2';
    if (props.density === 'relaxed') return 'gap-4';
    return 'gap-3';
});

const page = usePage();
const auth = computed(() => readPageProps(page).auth);
const checkPermission = (permission?: string): boolean => {
    if (!permission) return true;
    return auth.value?.permissions?.includes(permission) ?? false;
};

/**
 * Dynamic parent row helper:
 * Merges props.row with the latest message computed from fresh child records
 * so parentRow.latest_message stays updated after creating or deleting replies.
 */
const effectiveParentRow = computed(() => {
    if (!props.row) return props.row;

    const allRecords =
        records.value.length > 0 ? records.value : pageRecords.value;
    const latestMessageFromList =
        allRecords.length > 0
            ? [...allRecords].sort((a, b) => Number(b.id) - Number(a.id))[0]
            : null;

    return {
        ...props.row,
        latest_message: latestMessageFromList || props.row.latest_message,
    };
});

const canCreate = computed(() => {
    const config = props.crudConfig.actionConfig?.create;
    if (config) {
        const isShown =
            typeof config.show === 'function'
                ? config.show(effectiveParentRow.value)
                : config.show !== false;
        return isShown && checkPermission(config.permission);
    }
    // Fallback to deprecated structure
    return (
        props.crudConfig.showCreate !== false &&
        checkPermission(props.crudConfig.permissions?.create)
    );
});

const canUpdateRow = (row: any) => {
    const config =
        props.crudConfig.actionConfig?.update ||
        props.crudConfig.actionConfig?.edit;
    if (config) {
        const isShown =
            typeof config.show === 'function'
                ? config.show(row, effectiveParentRow.value) // Pass child row, then dynamic parent row
                : config.show !== false;
        return isShown && checkPermission(config.permission);
    }
    // Fallback to deprecated structure
    return (
        props.crudConfig.showUpdate !== false &&
        checkPermission(props.crudConfig.permissions?.update)
    );
};

const canDeleteRow = (row: any) => {
    const config = props.crudConfig.actionConfig?.delete;
    if (config) {
        const isShown =
            typeof config.show === 'function'
                ? config.show(row, effectiveParentRow.value) // Pass child row, then dynamic parent row
                : config.show !== false;
        return (
            isShown && !!config.endpoint && checkPermission(config.permission)
        );
    }
    // Fallback to deprecated structure
    return (
        props.crudConfig.showDelete !== false &&
        !!props.crudConfig.deleteEndpoint &&
        checkPermission(props.crudConfig.permissions?.delete)
    );
};

const evaluateFieldVisibility = (field: any) => {
    const isEditing = !isCreating.value;
    const row = inlineFormData;
    return evaluateVisibility(field, isEditing, row, auth.value);
};

/**
 * Form fields with `required` resolved to a static boolean based on the
 * current inline form data and editing state. This allows `required` to be
 * defined as a function `(isEditing, row, context) => boolean` in the config,
 * consistent with how `show` works.
 */
const processedFormFields = computed(() => {
    const isEditing = editingRowId.value !== null;
    const row = inlineFormData;
    return props.crudConfig.formFields.map((f) => ({
        ...f,
        required:
            typeof f.required === 'function'
                ? f.required(isEditing, row, { auth: auth.value })
                : !!f.required,
        // A select's choices can depend on the row being edited (e.g. only the premises a
        // purchase-order line still has stock outstanding for). Resolved here, like
        // `required`, so FormField.vue only ever sees a plain array. The `FormField` type
        // still says array, hence the casts — a function is opt-in per field.
        options:
            typeof (f.options as unknown) === 'function'
                ? (f.options as any)(isEditing, row, { auth: auth.value })
                : f.options,
    }));
});

// ── Mode detection ───────────────────────────────────────────────────────────
const isPaginated = computed(() => !!props.crudConfig.paginate);

// ── List state ───────────────────────────────────────────────────────────────
const records = ref<any[]>([]); // client-side: all records
const pageRecords = ref<any[]>([]); // paginated mode: current page records
const listLoading = ref(false);

// Pagination state (server-side mode)
const currentPage = ref(1);
const totalPages = ref(0);
const totalCount = ref(0);
const localPerPage = ref(props.crudConfig.perPage ?? 10);

const displayRecords = computed(() =>
    isPaginated.value ? pageRecords.value : filteredRecords.value,
);

const searchQuery = ref('');
const sortColumn = ref<string | null>(null);
const sortDirection = ref<'asc' | 'desc'>('asc');

// The embedded table is the SAME component the top-level lists use (GenericTable): column visibility,
// row selection, sort arrows, bulk bar and the toolbar all come from it. These are the pieces of state
// GenericTable is a controlled view over.
// GenericTable expects the same column shape the top-level configs use: a leading `select` column and a
// trailing `actions` column bookending the real columns (the panel used to hard-code those itself).
const gridColumns = computed(
    () =>
        [
            { key: 'select', label: '', type: 'select' },
            ...props.crudConfig.tableColumns,
            { key: 'actions', label: 'ui-builder.actions', type: 'actions' },
        ] as any[],
);
const defaultVisibleColumns = () => ['select', ...props.crudConfig.tableColumns.map((c: any) => c.key), 'actions'];
const visibleColumns = ref<string[]>(defaultVisibleColumns());
const selectedRows = ref<string[]>([]);
const canBulkDelete = computed(() => (props.crudConfig.actionConfig?.delete?.show ?? true) !== false);
const subSortConfig = computed(() =>
    sortColumn.value ? { key: sortColumn.value, direction: sortDirection.value } : undefined,
);
const handleToggleColumn = (key: string) => {
    visibleColumns.value = visibleColumns.value.includes(key)
        ? visibleColumns.value.filter((k) => k !== key)
        : [...visibleColumns.value, key];
};
const resetColumns = () => {
    visibleColumns.value = defaultVisibleColumns();
};
// GenericTable emits delete(id); resolve the row and route through the panel's own guarded delete.
const handleTableDelete = (id: string | number) => {
    const row = displayRecords.value.find((r: any) => String(r.id) === String(id));
    if (row && canDeleteRow(row)) executeDelete(row);
};
// Routes bulk delete through the same per-row guard (canDeleteRow), so a protected row
// (e.g. a received PO line) is skipped rather than force-deleted.
const handleBulkAction = async (actionKey: string, ids: string[]) => {
    if (actionKey !== 'delete') return;
    const targets = displayRecords.value.filter((r: any) => ids.includes(String(r.id)) && canDeleteRow(r));
    if (!targets.length) return;
    if (!window.confirm(t('ui-builder.confirm_delete_selected', { n: targets.length }))) return;
    for (const row of targets) {
        await executeDelete(row);
    }
    selectedRows.value = [];
};
const isFilterGroupOpen = ref(false);
const customFilterValues = ref<Record<string, any>>({});

const activeFiltersCount = computed(() => {
    if (!props.crudConfig.customFilters) return 0;
    return Object.entries(customFilterValues.value).filter(
        ([_, val]) =>
            val !== undefined &&
            val !== null &&
            val !== '' &&
            val !== 'all',
    ).length;
});

const handleSubFilterChange = (key: string, val: any) => {
    customFilterValues.value[key] = val;
    if (isPaginated.value) {
        currentPage.value = 1;
        fetchList();
    }
};

const clearAllSubFilters = () => {
    customFilterValues.value = {};
    if (isPaginated.value) {
        currentPage.value = 1;
        fetchList();
    }
};

const toggleSort = (colKey: string) => {
    if (sortColumn.value === colKey) {
        if (sortDirection.value === 'asc') {
            sortDirection.value = 'desc';
        } else {
            sortColumn.value = null;
            sortDirection.value = 'asc';
        }
    } else {
        sortColumn.value = colKey;
        sortDirection.value = 'asc';
    }

    if (isPaginated.value) {
        currentPage.value = 1;
        fetchList();
    }
};

const filteredRecords = computed(() => {
    let result = records.value;

    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter((row) =>
            props.crudConfig.tableColumns.some((col) => {
                let val: string;
                if (col.searchValue) {
                    val = col.searchValue(row);
                } else {
                    const renderVal = col.render ? col.render(row) : null;
                    if (
                        typeof renderVal === 'string' ||
                        typeof renderVal === 'number'
                    ) {
                        val = String(renderVal);
                    } else {
                        val = String(row[col.key] ?? '');
                    }
                }
                return val.toLowerCase().includes(q);
            }),
        );
    }

    if (props.crudConfig.customFilters && !isPaginated.value) {
        Object.entries(customFilterValues.value).forEach(([k, filterVal]) => {
            if (
                filterVal !== undefined &&
                filterVal !== null &&
                filterVal !== '' &&
                filterVal !== 'all'
            ) {
                result = result.filter((row) => {
                    const rowVal = row[k];
                    if (
                        typeof filterVal === 'boolean' ||
                        filterVal === 'true' ||
                        filterVal === 'false'
                    ) {
                        const boolFilter =
                            filterVal === true ||
                            filterVal === 'true' ||
                            filterVal === '1';
                        return Boolean(rowVal) === boolFilter;
                    }
                    if (filterVal === '1' || filterVal === '0') {
                        return (rowVal ? '1' : '0') === filterVal;
                    }
                    return String(rowVal) === String(filterVal);
                });
            }
        });
    }

    if (sortColumn.value && !isPaginated.value) {
        result = [...result].sort((a, b) => {
            const valA = a[sortColumn.value!];
            const valB = b[sortColumn.value!];

            if (valA === valB) return 0;
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;

            if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return result;
});

const pageStart = computed(() =>
    totalCount.value === 0
        ? 0
        : (currentPage.value - 1) * localPerPage.value + 1,
);
const pageEnd = computed(() =>
    Math.min(currentPage.value * localPerPage.value, totalCount.value),
);

const visiblePageNumbers = computed((): (number | '...')[] => {
    const total = totalPages.value;
    const cur = currentPage.value;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (cur > 3) pages.push('...');
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++)
        pages.push(p);
    if (cur < total - 2) pages.push('...');
    pages.push(total);
    return pages;
});

// ── Row & form state ────────────────────────────────────────────────────────
const isCreating = ref(false);
const isSubmitting = ref(false);
const editingRowId = ref<number | null>(null);
const confirmDeleteId = ref<number | null>(null);
const deletingId = ref<number | null>(null);
const flashRowId = ref<number | null>(null);
const generalError = ref('');
const firstFieldRef = ref<HTMLInputElement | null>(null);
const isFormDialogOpen = ref(false);

const inlineFormData = reactive<Record<string, any>>({});
const inlineFormErrors = reactive<Record<string, string>>({});

// ── Search debounce (server-side) ─────────────────────────────────────────
let searchTimer: ReturnType<typeof setTimeout>;
watch(searchQuery, () => {
    if (!isPaginated.value) return; // client-side handles it in computed
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        currentPage.value = 1;
        fetchList();
    }, 400);
});

// ── Initialization ──────────────────────────────────────────────────────────
onMounted(() => {
    fetchList();
});

// ── CRUD Methods ────────────────────────────────────────────────────────────

/**
 * Resolves ":id" placeholders in endpoint URLs using the parent row data.
 */
const resolveEndpoint = (url?: string) => {
    if (!url) return '';
    let resolved = url;
    if (props.row?.id) {
        resolved = resolved.replace(':id', props.row.id.toString());
    }
    return resolved;
};

/**
 * Resolves a per-record update/delete endpoint. Some crudConfigs nest the
 * record under its parent (e.g. `/catalog/products/:id/components/:id` — parent id,
 * then the record's own id); others are flat with only the record's own id
 * (e.g. `/catalog/barcodes/:id` — no parent scoping in the URL at all).
 * Substituting the *first* `:id` with the parent row's id (resolveEndpoint's
 * job) before filling in the record's id breaks the flat case: it consumes
 * the endpoint's only `:id` with the wrong (parent) value, leaving the
 * record's own id never substituted — so the request silently hits whatever
 * record happens to share an id with the parent instead of the one actually
 * being edited/deleted. Filling the record's id into the *last* `:id` first
 * — then letting resolveEndpoint() fill any placeholder that's still left
 * with the parent id — handles both shapes correctly: a flat endpoint has
 * nothing left for resolveEndpoint() to touch, a nested one still has its
 * leading parent placeholder intact.
 */
const resolveRecordEndpoint = (url: string, recordId: string | number) => {
    const lastIdx = url.lastIndexOf(':id');
    if (lastIdx === -1) return resolveEndpoint(url);
    const withRecordId =
        url.slice(0, lastIdx) + String(recordId) + url.slice(lastIdx + ':id'.length);
    return resolveEndpoint(withRecordId);
};

const fetchList = async (isBackground = false) => {
    if (!props.crudConfig.listEndpoint) return;
    if (!isBackground && displayRecords.value.length === 0) {
        listLoading.value = true;
    }
    generalError.value = '';

    try {
        const endpoint = resolveEndpoint(props.crudConfig.listEndpoint);
        const params: any = {};
        if (isPaginated.value) {
            params.paginate = true;
            params.page = currentPage.value;
            params.perPage = localPerPage.value;
            if (searchQuery.value) params.search = searchQuery.value;
            if (sortColumn.value) {
                params.sort = sortColumn.value;
                params.direction = sortDirection.value;
            }
        }
        if (props.crudConfig.customFilters) {
            Object.entries(customFilterValues.value).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '' && v !== 'all') {
                    params[k] = v;
                }
            });
        }

        const { data } = await axios.get(endpoint, { params });

        // Robust data extraction: handle { data: [...] } and plain [...]
        const results =
            data.data && Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                  ? data
                  : [];

        if (isPaginated.value && data.last_page !== undefined) {
            pageRecords.value = results;
            totalPages.value = data.last_page || 0;
            totalCount.value = data.total || 0;
            currentPage.value = data.current_page || 1;
        } else {
            // Fallback for non-paginated or malformed paginated response
            records.value = results;
            if (isPaginated.value) {
                pageRecords.value = results;
                totalPages.value = 1;
                totalCount.value = results.length;
            }
        }
    } catch (err) {
        console.error('[SubModuleCrudPanel] list fetch failed', err);
        generalError.value =
            props.crudConfig.messages?.fetchError || t('toast.load_error');
        // Without this the panel just renders its "no records" empty state on any
        // fetch failure (403, 404, network error) — visually identical to a genuinely
        // empty list, with no signal to the user that anything went wrong.
        toast.error(generalError.value);
    } finally {
        listLoading.value = false;
    }
};

/**
 * Build the payload to send to the server.
 * vue-select fields store {id, name} objects in inlineFormData for display,
 * but the backend expects plain scalar IDs. This extracts `.id` from any
 * object value on vue-select fields.
 */
const serializeFormPayload = () => {
    const payload: Record<string, any> = { ...inlineFormData };
    let hasFiles = false;

    props.crudConfig.formFields.forEach((field) => {
        if (field.type === 'vue-select') {
            const val = payload[field.name];
            if (
                val !== null &&
                val !== undefined &&
                typeof val === 'object' &&
                !Array.isArray(val)
            ) {
                payload[field.name] = val.id ?? val;
            }
        }
        if (field.type === 'file' || field.type === 'image') {
            hasFiles = true;
        }
    });

    if (hasFiles) {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
            const val = payload[key];
            if (Array.isArray(val)) {
                val.forEach((v) => {
                    if (v instanceof File) {
                        formData.append(`${key}[]`, v);
                    } else if (typeof v === 'string') {
                        formData.append(`existing_${key}[]`, v);
                    } else {
                        formData.append(`${key}[]`, v);
                    }
                });
            } else if (val !== null && val !== undefined) {
                if (typeof val === 'boolean') {
                    formData.append(key, val ? '1' : '0');
                } else if (val instanceof File) {
                    formData.append(key, val);
                } else {
                    formData.append(key, val);
                }
            }
        });

        console.log('[DEBUG] Serialized FormData keys/values:');
        for (let pair of formData.entries()) {
            console.log(
                pair[0] +
                    ', ' +
                    (pair[1] instanceof File ? pair[1].name : pair[1]),
            );
        }

        return formData;
    }

    return payload;
};

const startCreate = () => {
    resetForm();
    isCreating.value = true;
    isFormDialogOpen.value = true;
    focusFirstField();
};

const cancelCreate = () => {
    isCreating.value = false;
    isFormDialogOpen.value = false;
    resetForm();
};

const submitCreate = async () => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    generalError.value = '';
    Object.keys(inlineFormErrors).forEach((k) => delete inlineFormErrors[k]);

    // Validate visible fields only (using processedFormFields to resolve function-based required)
    const visibleFields = processedFormFields.value.filter((f) =>
        evaluateFieldVisibility(f),
    );

    let isValid = true;
    visibleFields.forEach((f) => {
        const val = inlineFormData[f.name];
        if (
            f.required &&
            (val === undefined ||
                val === null ||
                val === '' ||
                (Array.isArray(val) && val.length === 0))
        ) {
            inlineFormErrors[f.name] = `${f.label} is required`;
            isValid = false;
        }
    });

    if (!isValid) {
        isSubmitting.value = false;
        return;
    }

    try {
        const createConfig = props.crudConfig.actionConfig?.create;
        const endpointUrl =
            createConfig?.endpoint || props.crudConfig.createEndpoint;
        const endpoint = resolveEndpoint(endpointUrl);
        const { data } = await axios.post(endpoint, serializeFormPayload());

        // Robust record extraction
        let record = data.data || data;
        const keys = Object.keys(data);
        if (
            keys.length === 1 &&
            data[keys[0]] &&
            typeof data[keys[0]] === 'object' &&
            !Array.isArray(data[keys[0]])
        ) {
            record = data[keys[0]];
        }

        toast.success(
            props.crudConfig.messages?.createSuccess || t('toast.create_success'),
        );

        // Always refresh list to ensure side-effects (like new records) are reflected
        await fetchList(true);

        if (props.crudConfig.reloadParentOnChange) {
            emit('change');
        }

        cancelCreate();
        flashRow(record.id);
    } catch (err: any) {
        if (err.response?.status === 422) {
            const errors = err.response.data.errors || {};
            Object.keys(errors).forEach((key) => {
                inlineFormErrors[key] = Array.isArray(errors[key])
                    ? errors[key][0]
                    : errors[key];
            });
        } else {
            generalError.value =
                props.crudConfig.messages?.createError ||
                t('toast.create_error');
            toast.error(generalError.value);
        }
    } finally {
        isSubmitting.value = false;
    }
};

const startEdit = (row: any) => {
    resetForm();
    editingRowId.value = row.id;
    isCreating.value = false;

    // Hydrate form — use getValue when defined (e.g. vue-select needs {id, name} object)
    props.crudConfig.formFields.forEach((field) => {
        inlineFormData[field.name] = field.getValue
            ? field.getValue(row)
            : row[field.name];
    });

    isFormDialogOpen.value = true;
    focusFirstField();
};

const cancelEdit = () => {
    editingRowId.value = null;
    isFormDialogOpen.value = false;
    resetForm();
};

const submitUpdate = async (row: any) => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    generalError.value = '';
    Object.keys(inlineFormErrors).forEach((k) => delete inlineFormErrors[k]);

    // Validate visible fields only (using processedFormFields to resolve function-based required)
    const visibleFields = processedFormFields.value.filter((f) =>
        evaluateFieldVisibility(f),
    );

    let isValid = true;
    visibleFields.forEach((f) => {
        const val = inlineFormData[f.name];
        if (
            f.required &&
            (val === undefined ||
                val === null ||
                val === '' ||
                (Array.isArray(val) && val.length === 0))
        ) {
            inlineFormErrors[f.name] = `${f.label} is required`;
            isValid = false;
        }
    });

    if (!isValid) {
        isSubmitting.value = false;
        return;
    }

    try {
        const updateConfig =
            props.crudConfig.actionConfig?.update ||
            props.crudConfig.actionConfig?.edit;
        const endpointUrl =
            updateConfig?.endpoint || props.crudConfig.updateEndpoint;
        if (!endpointUrl) throw new Error('No update endpoint defined');

        // Resolve :id placeholders — see resolveRecordEndpoint()'s docblock:
        // the endpoint may carry just the record's own id (flat, e.g.
        // barcodes/batches/serials) or both the parent's and the record's
        // (nested, e.g. components/variants).
        const endpoint = resolveRecordEndpoint(endpointUrl, row.id);

        const method = (updateConfig?.method || 'PUT').toLowerCase() as
            'put' | 'patch' | 'post';
        const { data } = await axios[method](endpoint, serializeFormPayload());

        // Robust record extraction
        let record = data.data || data;
        const keys = Object.keys(data);
        if (
            keys.length === 1 &&
            data[keys[0]] &&
            typeof data[keys[0]] === 'object' &&
            !Array.isArray(data[keys[0]])
        ) {
            record = data[keys[0]];
        }

        toast.success(
            props.crudConfig.messages?.updateSuccess || t('toast.update_success'),
        );

        // Always refresh list to ensure side-effects (like new/updated records) are reflected
        await fetchList(true);

        if (props.crudConfig.reloadParentOnChange) {
            emit('change');
        }

        cancelEdit();
        flashRow(row.id);
    } catch (err: any) {
        if (err.response?.status === 422) {
            const errors = err.response.data.errors || {};
            Object.keys(errors).forEach((key) => {
                inlineFormErrors[key] = Array.isArray(errors[key])
                    ? errors[key][0]
                    : errors[key];
            });
        } else {
            generalError.value =
                props.crudConfig.messages?.updateError ||
                t('toast.update_error');
            toast.error(generalError.value);
        }
    } finally {
        isSubmitting.value = false;
    }
};

const executeDelete = async (row: any) => {
    if (deletingId.value) return;
    deletingId.value = row.id;

    try {
        const deleteConfig = props.crudConfig.actionConfig?.delete;
        const endpointUrl =
            deleteConfig?.endpoint || props.crudConfig.deleteEndpoint;
        if (!endpointUrl) throw new Error('No delete endpoint defined');

        const endpoint = resolveRecordEndpoint(endpointUrl, row.id);

        await axios.delete(endpoint);

        toast.success(
            props.crudConfig.messages?.deleteSuccess || t('toast.delete_success'),
        );

        // Step back a page if the last item on the page was deleted
        if (
            isPaginated.value &&
            displayRecords.value.length === 1 &&
            currentPage.value > 1
        ) {
            currentPage.value -= 1;
        }

        // Always refresh list to ensure side-effects (like deleted records) are reflected
        await fetchList(true);

        if (props.crudConfig.reloadParentOnChange) {
            emit('change');
        }
    } catch (err) {
        console.error('[SubModuleCrudPanel] delete failed', err);
        toast.error(
            props.crudConfig.messages?.deleteError || t('toast.delete_error'),
        );
    } finally {
        deletingId.value = null;
        confirmDeleteId.value = null;
    }
};

const onRowSwitchToggle = () => {
    if (props.crudConfig.reloadParentOnChange) {
        emit('change');
    }
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const resetForm = () => {
    Object.keys(inlineFormData).forEach((k) => delete inlineFormData[k]);
    Object.keys(inlineFormErrors).forEach((k) => delete inlineFormErrors[k]);

    props.crudConfig.formFields.forEach((f) => {
        inlineFormData[f.name] =
            f.defaultValue !== undefined ? f.defaultValue : null;
    });
};

const focusFirstField = () => {
    nextTick(() => {
        if (firstFieldRef.value) firstFieldRef.value.focus();
    });
};

const flashRow = (id: number | null) => {
    if (!id) return;
    flashRowId.value = id;
    setTimeout(() => {
        if (flashRowId.value === id) flashRowId.value = null;
    }, 2500);
};

const getBadgeClasses = (col: ColumnConfig, row: any) => {
    const val = col.render ? col.render(row) : row[col.key];
    const map = col.badgeConfig?.variantMap || {};
    const variant = map[val] || 'secondary';

    const variants: Record<string, string> = {
        success:
            'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
        warning:
            'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
        danger: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20',
        info: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20',
        secondary:
            'bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20',
    };
    return variants[variant] || variants.secondary;
};

const getGridSpanClass = (width?: GridWidth) => gridWidthClass(width);

// A token or raw Tailwind classes; FormField resolves either through utils/sizing.ts.
const getFieldSize = (field: any) => field.size || computedFormInputSize.value;

// ── Pagination Handlers ─────────────────────────────────────────────────────

const goToPage = (p: number) => {
    if (p < 1 || p > totalPages.value || p === currentPage.value) return;
    currentPage.value = p;
    fetchList();
};

const handlePerPageChange = () => {
    currentPage.value = 1;
    fetchList();
};

const selectPerPage = (value: number) => {
    localPerPage.value = value;
    handlePerPageChange();
};

const clearSearch = () => {
    searchQuery.value = '';
};

// ── Export Settings & Methods ────────────────────────────────────────────────
const isExportDialogOpen = ref(false);
const exportDefaultFormat = ref<ExportFormat>('excel');
const isExportProcessing = ref(false);

const canExport = computed(() => {
    if (props.crudConfig.exportConfig === false) return false;
    if (props.crudConfig.actionConfig?.export?.show === false) return false;
    if ((props.crudConfig as any).showExport === false) return false;
    return true;
});

const exportConfigResolved = computed(() => {
    if (!props.crudConfig || props.crudConfig.exportConfig === false) {
        return null;
    }
    if (props.crudConfig.actionConfig?.export?.show === false) {
        return null;
    }
    const rawExport =
        typeof props.crudConfig.exportConfig === 'object'
            ? props.crudConfig.exportConfig
            : {};
    const normalized = normalizeExportConfig(rawExport);

    let defaultShowAsDropdown = normalized.showAsDropdown;
    if (
        rawExport.showAsDropdown === undefined &&
        rawExport.ui?.asDropdown === undefined
    ) {
        defaultShowAsDropdown = true;
    }

    return {
        ...normalized,
        showAsDropdown: defaultShowAsDropdown,
    };
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

const handleExportTrigger = (format?: ExportFormat) => {
    if (!canExport.value) return;

    const rawExport =
        typeof props.crudConfig.exportConfig === 'object'
            ? props.crudConfig.exportConfig
            : {};
    const exportConfig = normalizeExportConfig(rawExport);
    let defaultFormat: ExportFormat = 'excel';
    if (format) {
        defaultFormat = format;
    } else {
        if (exportConfig.excel) defaultFormat = 'excel';
        else if (exportConfig.pdf) defaultFormat = 'pdf';
        else if (exportConfig.csv) defaultFormat = 'csv';
        else if (exportConfig.json) defaultFormat = 'json';
        else if (exportConfig.print) defaultFormat = 'print';
    }

    exportDefaultFormat.value = defaultFormat;
    isExportDialogOpen.value = true;
};

const fetchAllDataForExport = async (): Promise<any[]> => {
    if (!props.crudConfig.listEndpoint) return [];
    try {
        const endpoint = resolveEndpoint(props.crudConfig.listEndpoint);
        const params: any = {
            perPage: 'all',
            paginate: false,
        };
        if (searchQuery.value) params.search = searchQuery.value;
        if (sortColumn.value) {
            params.sort = sortColumn.value;
            params.direction = sortDirection.value;
        }
        if (props.crudConfig.customFilters) {
            Object.entries(customFilterValues.value).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '' && v !== 'all') {
                    params[k] = v;
                }
            });
        }

        const { data } = await axios.get(endpoint, { params });
        const results =
            data.data && Array.isArray(data.data)
                ? data.data
                : Array.isArray(data)
                  ? data
                  : [];
        return results;
    } catch (err) {
        console.error('[SubModuleCrudPanel] fetchAllDataForExport failed', err);
        return [];
    }
};

const executeExport = async (options: {
    format: ExportFormat;
    scope: 'current' | 'all';
    columns: string[];
    pdfConfig: {
        pageSize: string;
        orientation: 'portrait' | 'landscape';
        cellPadding: number;
        repeatHeader: boolean;
        margin: any;
    };
}) => {
    isExportProcessing.value = true;
    try {
        let exportData = displayRecords.value;

        if (options.scope === 'all') {
            if (isPaginated.value) {
                exportData = await fetchAllDataForExport();
            } else {
                exportData = filteredRecords.value;
            }
        }

        const user = auth.value?.user;
        const userName = user?.name || user?.email || 'System User';
        const themeHex = themeHexMap[themeColorName.value] || '#2563eb';

        let activeFiltersText = searchQuery.value
            ? `Search: "${searchQuery.value}"`
            : '';
        if (props.crudConfig.customFilters && activeFiltersCount.value > 0) {
            const filterDescriptions: string[] = [];
            props.crudConfig.customFilters.forEach((f) => {
                const val = customFilterValues.value[f.key];
                if (
                    val !== undefined &&
                    val !== null &&
                    val !== '' &&
                    val !== 'all'
                ) {
                    const opt = f.options?.find(
                        (o) => String(o.value) === String(val),
                    );
                    filterDescriptions.push(
                        `${resolveLabel(f.label)}: ${opt ? resolveLabel(opt.label) : val}`,
                    );
                }
            });
            if (filterDescriptions.length > 0) {
                activeFiltersText = activeFiltersText
                    ? `${activeFiltersText} | ${filterDescriptions.join(', ')}`
                    : filterDescriptions.join(', ');
            }
        }
        if (!activeFiltersText) {
            activeFiltersText = 'All Data';
        }

        const extraMeta = {
            userName,
            themeColor: themeHex,
            activeFiltersText,
        };

        const rawExport =
            typeof props.crudConfig.exportConfig === 'object'
                ? props.crudConfig.exportConfig
                : {};
        const normalized = normalizeExportConfig(rawExport);
        const mergedExportConfig = {
            ...normalized,
            pageSize: options.pdfConfig.pageSize,
            orientation: options.pdfConfig.orientation,
            cellPadding: options.pdfConfig.cellPadding,
            repeatHeader: options.pdfConfig.repeatHeader,
            margin: options.pdfConfig.margin,
        };

        const tempConfig = {
            moduleName: resolveLabel(props.crudConfig.createLabel || 'ui-builder.report'),
            tableColumns: props.crudConfig.tableColumns,
            exportConfig: mergedExportConfig,
        } as any;

        if (options.format === 'pdf') {
            await handleExportPDF(
                exportData,
                tempConfig,
                options.columns,
                extraMeta,
            );
        } else if (options.format === 'excel') {
            await handleExportExcel(
                exportData,
                tempConfig,
                options.columns,
                extraMeta,
            );
        } else if (options.format === 'csv') {
            handleExportCSV(exportData, tempConfig, options.columns, extraMeta);
        } else if (options.format === 'json') {
            handleExportJSON(exportData, tempConfig, options.columns, extraMeta);
        } else if (options.format === 'print') {
            await handlePrint(
                exportData,
                tempConfig,
                options.columns,
                extraMeta,
            );
        }

        toast.success(t('toast.export_success'));
        isExportDialogOpen.value = false;
    } catch (error: any) {
        console.error('Export failed:', error);
        const errMsg = error?.message || String(error);
        toast.error(t('toast.export_failed', { message: errMsg }));
    } finally {
        isExportProcessing.value = false;
    }
};
</script>

<style scoped>
.table-fade-enter-active,
.table-fade-leave-active {
    transition: opacity 0.2s ease;
}
.table-fade-enter-from,
.table-fade-leave-to {
    opacity: 0;
}

.crud-row-enter-active,
.crud-row-leave-active {
    transition: all 0.4s ease;
}
.crud-row-enter-from {
    opacity: 0;
    transform: translateX(-10px);
}
.crud-row-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.flash-success {
    background-color: rgba(16, 185, 129, 0.1) !important;
}
.delete-confirm-row {
    background-color: rgba(239, 68, 68, 0.05) !important;
}
</style>
