<template>
    <div
        :class="
            hideToolbar
                ? ''
                : `overflow-hidden rounded-lg border ${theme.tableBorder} ${theme.tableBackground}`
        "
    >
        <!-- Toolbar (hidden when a shared DataToolbar is rendered above this component
             instead — see ModuleManager.vue's `hideToolbar` wiring for grid-enabled
             modules, so the toolbar stays mounted while only the table/grid swaps) -->
        <div
            v-if="!hideToolbar"
            :class="`flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${theme.toolbarBorder} ${theme.toolbarBackground}`"
        >
            <div
                :class="
                    cn(
                        'flex flex-wrap items-center gap-2 rounded-lg border p-1.5',
                        theme.rowSelected,
                        theme.toolbarBorder,
                    )
                "
            >
                <DropdownMenu :modal="false">
                    <DropdownMenuTrigger as-child>
                        <Button
                            variant="ghost"
                            :class="cn('border font-medium flex items-center justify-center', buttonSizeClass, theme.secondaryButton)"
                        >
                            <Eye class="me-2 h-4 w-4" />
                            {{ t('ui-builder.columns') }}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        :class="
                            cn(
                                'w-48 border',
                                theme.menuBackground,
                                theme.menuBorder,
                                theme.menuText,
                            )
                        "
                        :collision-padding="8"
                    >
                        <div class="flex items-center justify-between pr-2">
                            <DropdownMenuLabel :class="theme.menuText">
                                {{ t('ui-builder.toggle_columns') }}
                            </DropdownMenuLabel>
                            <Button
                                variant="ghost"
                                size="icon"
                                :class="`h-6 w-6 ${theme.iconActive || 'text-blue-600'} hover:opacity-80 transition-opacity`"
                                :title="t('ui-builder.reset_columns')"
                                @click="emit('resetColumns')"
                            >
                                <RotateCcw class="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <DropdownMenuSeparator
                            :class="theme.toolbarSeparator || 'opacity-20'"
                        />
                        <div class="max-h-72 overflow-y-auto">
                            <DropdownMenuCheckboxItem
                                v-for="col in selectableColumns"
                                :key="col.key"
                                :checked="visibleColumns.includes(col.key)"
                                @select.prevent
                                @click="toggleColumn(col.key)"
                                :class="theme.menuText"
                            >
                                <div
                                    class="flex w-full items-center justify-between"
                                >
                                    <span>{{ resolveColumnLabel(col) }}</span>
                                    <Eye
                                        v-if="visibleColumns.includes(col.key)"
                                        :class="[
                                            'ms-2 h-4 w-4',
                                            theme.iconActive || 'text-blue-600',
                                        ]"
                                    />
                                    <EyeOff
                                        v-else
                                        :class="[
                                            'ms-2 h-4 w-4',
                                            theme.iconInactive ||
                                                'text-gray-400 dark:text-neutral-400',
                                        ]"
                                    />
                                </div>
                            </DropdownMenuCheckboxItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <!-- Density (single shared control — see DensityToggle.vue) -->
                <DensityToggle :theme="theme" />

                <!-- Table/Grid layout switch (only for modules with gridConfig enabled) -->
                <LayoutToggle
                    v-if="showLayoutToggle"
                    :model-value="layout || 'table'"
                    :theme="theme"
                    @update:model-value="emit('update:layout', $event)"
                />
            </div>

            <!-- Export Buttons (positioned on the right side) -->
            <div
                v-if="exportConfig.enabled !== false && exportConfig.position !== 'filterBar' && selectedRows.length === 0"
                :class="
                    exportConfig.showAsDropdown
                        ? cn(
                            'flex flex-wrap items-center gap-2',
                            exportConfig.align === 'right' && 'sm:ms-auto'
                          )
                        : cn(
                            'flex flex-wrap items-center gap-2 rounded-lg border p-1.5',
                            theme.rowSelected,
                            theme.toolbarBorder,
                            exportConfig.align === 'right' && 'sm:ms-auto'
                          )
                "
            >
                <div v-if="exportConfig.showAsDropdown" class="flex items-center gap-2">
                    <template v-if="exportConfig.printPosition === 'first'">
                        <Button
                            v-if="exportConfig.print"
                            variant="outline"
                            :class="cn('border gap-2 font-medium transition-all focus:ring-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 flex items-center justify-center', buttonSizeClass, theme.inputBackground || 'bg-white dark:bg-gray-855', theme.inputBorder || 'border-gray-200 dark:border-gray-700', theme.badgeText || 'text-gray-900 dark:text-gray-100')"
                            :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                            @click="exportTo('print')"
                            :title="t('ui-builder.print')"
                        >
                            <Printer class="h-4 w-4 opacity-70" />
                            <span>{{ t('ui-builder.print') }}</span>
                        </Button>
                    </template>

                    <!-- Dropdown for the rest (PDF, Excel, CSV) when disabled -->
                    <Button
                        v-if="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                        variant="outline"
                        disabled
                        :class="cn('border gap-2 font-medium transition-all focus:ring-0 flex items-center justify-center', buttonSizeClass, theme.secondaryButton)"
                    >
                        <Download class="h-4 w-4 opacity-70" />
                        <span>{{ t('ui-builder.export') }}</span>
                        <ChevronDown class="h-4 w-4 opacity-50" />
                    </Button>

                    <!-- Dropdown for the rest (PDF, Excel, CSV, JSON) when enabled -->
                    <DropdownMenu :modal="false" v-else-if="exportConfig.pdf || exportConfig.excel || exportConfig.csv || exportConfig.json || exportActions.length">
                        <DropdownMenuTrigger as-child>
                            <Button
                                variant="outline"
                                :class="cn('border gap-2 font-medium transition-all focus:ring-0 flex items-center justify-center', buttonSizeClass, theme.secondaryButton)"
                            >
                                <Download class="h-4 w-4 opacity-70" />
                                <span>{{ t('ui-builder.export') }}</span>
                                <ChevronDown class="h-4 w-4 opacity-50" />
                            </Button>
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
                                v-if="exportConfig.pdf"
                                @click="exportTo('pdf')"
                                :class="`flex items-center gap-2 cursor-pointer focus:${theme.badgeBackground || 'bg-gray-100 dark:bg-white/10'} focus:${theme.badgeText || 'text-gray-800 dark:text-neutral-200'}`"
                            >
                                <FileText class="h-4 w-4 text-red-600 dark:text-red-400" />
                                <span>{{ t('ui-builder.pdf') }}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                v-if="exportConfig.excel"
                                @click="exportTo('excel')"
                                :class="`flex items-center gap-2 cursor-pointer focus:${theme.badgeBackground || 'bg-gray-100 dark:bg-white/10'} focus:${theme.badgeText || 'text-gray-800 dark:text-neutral-200'}`"
                            >
                                <FileSpreadsheet class="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span>{{ t('ui-builder.excel') }}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                v-if="exportConfig.csv"
                                @click="exportTo('csv')"
                                :class="`flex items-center gap-2 cursor-pointer focus:${theme.badgeBackground || 'bg-gray-100 dark:bg-white/10'} focus:${theme.badgeText || 'text-gray-800 dark:text-neutral-200'}`"
                            >
                                <Table class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>{{ t('ui-builder.csv') }}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                v-if="exportConfig.json"
                                @click="exportTo('json')"
                                :class="`flex items-center gap-2 cursor-pointer focus:${theme.badgeBackground || 'bg-gray-100 dark:bg-white/10'} focus:${theme.badgeText || 'text-gray-800 dark:text-neutral-200'}`"
                            >
                                <FileJson class="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <span>{{ t('ui-builder.json') }}</span>
                            </DropdownMenuItem>
                            <template v-if="exportActions.length">
                                <DropdownMenuSeparator />
                                <DropdownMenuItem v-for="action in exportActions" :key="action.key" @click="emit('exportAction', action)" :class="`flex items-center gap-2 cursor-pointer focus:${(theme as any).badgeBackground || 'bg-gray-100 dark:bg-white/10'} focus:${(theme as any).badgeText || 'text-gray-800 dark:text-neutral-200'}`">
                                    <component :is="action.icon || Mail" class="h-4 w-4 opacity-70" />
                                    <span>{{ resolveLabel(action.label) }}</span>
                                </DropdownMenuItem>
                            </template>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <template v-if="exportConfig.printPosition !== 'first'">
                        <Button
                            v-if="exportConfig.print"
                            variant="outline"
                            :class="cn('border gap-2 font-medium transition-all focus:ring-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 flex items-center justify-center', buttonSizeClass, theme.inputBackground || 'bg-white dark:bg-gray-855', theme.inputBorder || 'border-gray-200 dark:border-gray-700', theme.badgeText || 'text-gray-900 dark:text-gray-100')"
                            :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                            @click="exportTo('print')"
                            :title="t('ui-builder.print')"
                        >
                            <Printer class="h-4 w-4 opacity-70" />
                            <span>{{ t('ui-builder.print') }}</span>
                        </Button>
                    </template>
                </div>

                <template v-else>
                    <template v-if="!exportConfig.showAsGroup">
                        <Button
                            v-if="exportConfig.pdf"
                            variant="ghost"
                            size="icon"
                            :class="cn('border hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, theme.inputBackground || 'bg-white dark:bg-gray-855', theme.inputBorder || 'border-gray-200 dark:border-gray-700')"
                            :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                            :title="t('ui-builder.export_pdf')"
                            @click="exportTo('pdf')"
                        >
                            <FileText class="h-5 w-5 opacity-70" />
                        </Button>
                        <Button
                            v-if="exportConfig.excel"
                            variant="ghost"
                            size="icon"
                            :class="cn('border hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, theme.inputBackground || 'bg-white dark:bg-gray-855', theme.inputBorder || 'border-gray-200 dark:border-gray-700')"
                            :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                            :title="t('ui-builder.export_excel')"
                            @click="exportTo('excel')"
                        >
                            <FileSpreadsheet class="h-5 w-5 opacity-70" />
                        </Button>
                        <Button
                            v-if="exportConfig.csv"
                            variant="ghost"
                            size="icon"
                            :class="cn('border hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, theme.inputBackground || 'bg-white dark:bg-gray-855', theme.inputBorder || 'border-gray-200 dark:border-gray-700')"
                            :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                            :title="t('ui-builder.export_csv')"
                            @click="exportTo('csv')"
                        >
                            <Table class="h-5 w-5 opacity-70" />
                        </Button>
                        <Button
                            v-if="exportConfig.json"
                            variant="ghost"
                            size="icon"
                            :class="cn('border hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, theme.inputBackground || 'bg-white dark:bg-gray-855', theme.inputBorder || 'border-gray-200 dark:border-gray-700')"
                            :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                            :title="t('ui-builder.export_json')"
                            @click="exportTo('json')"
                        >
                            <FileJson class="h-5 w-5 opacity-70" />
                        </Button>
                        <Button
                            v-for="action in exportActions"
                            :key="action.key"
                            variant="ghost"
                            size="icon"
                            :class="cn('border hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, (theme as any).inputBackground || 'bg-white dark:bg-gray-855', (theme as any).inputBorder || 'border-gray-200 dark:border-gray-700')"
                            :title="resolveLabel(action.label)"
                            @click="emit('exportAction', action)"
                        >
                            <component :is="action.icon || Mail" class="h-5 w-5 opacity-70" />
                        </Button>
                        <Button
                            v-if="exportConfig.print"
                            variant="ghost"
                            size="icon"
                            :class="cn('border hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, theme.inputBackground || 'bg-white dark:bg-gray-855', theme.inputBorder || 'border-gray-200 dark:border-gray-700')"
                            :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                            :title="t('ui-builder.print')"
                            @click="exportTo('print')"
                        >
                            <Printer class="h-5 w-5 opacity-70" />
                        </Button>
                    </template>

                    <div v-else class="flex items-center gap-2">
                        <template v-if="exportConfig.printPosition === 'first'">
                            <Button
                                v-if="exportConfig.print"
                                variant="outline"
                                size="icon"
                                :class="cn('border hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, theme.inputBackground || 'bg-white dark:bg-gray-855', theme.inputBorder || 'border-gray-200 dark:border-gray-700')"
                                :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                                :title="t('ui-builder.print')"
                                @click="exportTo('print')"
                            >
                                <Printer class="h-5 w-5 opacity-70" />
                            </Button>
                        </template>

                        <div
                            v-if="exportConfig.pdf || exportConfig.excel || exportConfig.csv || exportConfig.json || exportActions.length"
                            class="flex items-center rounded-md border overflow-hidden"
                            :class="[theme.tableBorder || 'border-gray-200 dark:border-gray-700', theme.inputBackground || 'bg-white dark:bg-gray-855']"
                        >
                            <Button
                                v-if="exportConfig.pdf"
                                variant="ghost"
                                size="icon"
                                :class="['rounded-none border-0 border-r last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, theme.tableBorder || 'border-gray-200 dark:border-gray-700']"
                                :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                                :title="t('ui-builder.export_pdf')"
                                @click="exportTo('pdf')"
                            >
                                <FileText class="h-5 w-5 opacity-70" />
                            </Button>
                            <Button
                                v-if="exportConfig.excel"
                                variant="ghost"
                                size="icon"
                                :class="['rounded-none border-0 border-r last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, theme.tableBorder || 'border-gray-200 dark:border-gray-700']"
                                :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                                :title="t('ui-builder.export_excel')"
                                @click="exportTo('excel')"
                            >
                                <FileSpreadsheet class="h-5 w-5 opacity-70" />
                            </Button>
                            <Button
                                v-if="exportConfig.csv"
                                variant="ghost"
                                size="icon"
                                :class="['rounded-none border-0 border-r last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, theme.tableBorder || 'border-gray-200 dark:border-gray-700']"
                                :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                                :title="t('ui-builder.export_csv')"
                                @click="exportTo('csv')"
                            >
                                <Table class="h-5 w-5 opacity-70" />
                            </Button>
                            <Button
                                v-if="exportConfig.json"
                                variant="ghost"
                                size="icon"
                                :class="['rounded-none border-0 border-r last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, theme.tableBorder || 'border-gray-200 dark:border-gray-700']"
                                :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                                :title="t('ui-builder.export_json')"
                                @click="exportTo('json')"
                            >
                                <FileJson class="h-5 w-5 opacity-70" />
                            </Button>
                            <Button
                                v-for="action in exportActions"
                                :key="action.key"
                                variant="ghost"
                                size="icon"
                                :class="['rounded-none border-0 border-r last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, (theme as any).tableBorder || 'border-gray-200 dark:border-gray-700']"
                                :title="resolveLabel(action.label)"
                                @click="emit('exportAction', action)"
                            >
                                <component :is="action.icon || Mail" class="h-5 w-5 opacity-70" />
                            </Button>
                        </div>

                        <template v-if="exportConfig.printPosition !== 'first'">
                            <Button
                                v-if="exportConfig.print"
                                variant="outline"
                                size="icon"
                                :class="cn('border hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors', squareButtonSizeClass, theme.inputBackground || 'bg-white dark:bg-gray-855', theme.inputBorder || 'border-gray-200 dark:border-gray-700')"
                                :disabled="exportConfig.activeOnlyOnData && (!props.data || props.data.length === 0)"
                                :title="t('ui-builder.print')"
                                @click="exportTo('print')"
                            >
                                <Printer class="h-5 w-5 opacity-70" />
                            </Button>
                        </template>
                    </div>
                </template>
            </div>

            <div
                v-if="selectedRows.length > 0"
                :class="
                    cn(
                        'flex flex-wrap items-center gap-2 rounded-lg border p-1.5',
                        theme.rowSelected,
                        theme.toolbarBorder,
                    )
                "
            >
                <span :class="['pr-1 text-sm font-medium', theme.toolbarText]">
                    {{ selectedRows.length }} selected
                </span>
                <div
                    :class="[
                        'mx-1 h-4 w-px',
                        theme.toolbarSeparator ||
                            'bg-gray-300 dark:bg-gray-600',
                    ]"
                ></div>
                <Button
                    variant="ghost"
                    :class="cn('border font-medium flex items-center justify-center', buttonSizeClass, theme.secondaryButton)"
                    @click="emit('selectionChange', [])"
                >
                    <Eraser class="h-4 w-4" />
                    {{ t('ui-builder.clear') }}
                </Button>
                <div :class="['mx-1 h-4 w-px', theme.toolbarSeparator]"></div>
                <template
                    v-for="(action, index) in visibleBulkActions"
                    :key="action.key"
                >
                    <Button
                        variant="ghost"
                        :class="cn('border font-medium flex items-center justify-center', buttonSizeClass, theme.secondaryButton)"
                        @click="handleBulkAction(action.key)"
                    >
                        <component
                            v-if="action.icon"
                            :is="action.icon"
                            class="me-2 h-4 w-4"
                        />
                        {{ resolveLabel(action.label) }}
                    </Button>
                    <div
                        :class="[
                            'mx-1 h-4 w-px',
                            theme.toolbarSeparator ||
                                'bg-gray-300 dark:bg-gray-600',
                        ]"
                    ></div>
                </template>
                <Button
                    v-if="canBulkDelete && selectedRows.length > 1"
                    variant="destructive"
                    size="sm"
                    @click="handleBulkAction('delete')"
                >
                    <component
                        :is="actionConfig?.bulkDelete?.icon || Trash2"
                        class="me-2 h-4 w-4"
                    />
                    Delete ({{ selectedRows.length }})
                </Button>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table data-table-type="own" class="w-full min-w-[640px]">
                <thead>
                    <tr
                        :class="`border-b ${theme.headerBackground} ${theme.tableBorder}`"
                    >
                        <th
                            v-if="hasCheckboxColumn"
                            :class="`w-12 ${currentDensity.headerPadding}`"
                        >
                            <div class="flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    :checked="isAllSelected"
                                    :indeterminate.prop="isIndeterminate"
                                    @click="handleSelectAllClick"
                                    class="h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-white/15"
                                    :style="{
                                        accentColor: checkboxAccentColor,
                                    }"
                                />
                            </div>
                        </th>
                        <th
                            v-for="col in columns"
                            v-show="
                                visibleColumns.includes(col.key) &&
                                col.key !== 'select'
                            "
                            :key="col.key"
                            :class="`${currentDensity.headerPadding} ${
                                col.hiddenOnMobile
                                    ? 'hidden md:table-cell'
                                    : 'table-cell'
                            } ${
                                col.align
                                    ? `text-${col.align}`
                                    : col.key === 'actions'
                                      ? 'text-right'
                                      : 'text-left'
                            } text-xs font-semibold tracking-wider uppercase ${theme.headerText} ${
                                col.sortable
                                    ? `cursor-pointer transition-colors select-none ${theme.rowHover}`
                                    : ''
                            } ${
                                col.sticky === 'right' || col.sticky === true
                                    ? `sticky right-0 z-10 ${theme.headerBackground || 'bg-gray-50 dark:bg-gray-950'} shadow-[-4px_0_6px_-1px_rgb(0,0,0,0.05)]`
                                    : col.sticky === 'left'
                                    ? `sticky left-0 z-10 ${theme.headerBackground || 'bg-gray-50 dark:bg-gray-950'} shadow-[4px_0_6px_-1px_rgb(0,0,0,0.05)]`
                                    : ''
                            }`"
                            @click="col.sortable && $emit('sort', col.key)"
                        >
                            <div
                                :class="`flex items-center gap-2 ${
                                    col.align === 'center'
                                        ? 'justify-center'
                                        : col.align === 'right' ||
                                            col.key === 'actions'
                                          ? 'justify-end'
                                          : 'justify-start'
                                }`"
                            >
                                <span>{{ resolveColumnLabel(col) }}</span>
                                <ArrowUpDown
                                    v-if="col.sortable"
                                    :class="`h-3.5 w-3.5 ${
                                        sortConfig?.key === col.key
                                            ? theme.iconActive
                                            : theme.iconInactive
                                    }`"
                                />
                            </div>
                        </th>
                    </tr>
                </thead>

                <tbody :class="`divide-y ${theme.rowBorder}`">
                    <tr
                        v-for="row in data"
                        :key="row.id"
                        :class="`group cursor-pointer transition-colors ${
                            selectedRows.includes(String(row.id))
                                ? getSelectedRowClass()
                                : theme.rowHover
                        }`"
                    >
                        <td
                            v-if="hasCheckboxColumn"
                            :class="`w-12 ${currentDensity.cellPadding}`"
                        >
                            <div class="flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    :checked="
                                        selectedRows.includes(String(row.id))
                                    "
                                    @click.stop="handleSelectRowClick(row.id)"
                                    class="h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-white/15"
                                    :style="{
                                        accentColor: checkboxAccentColor,
                                    }"
                                />
                            </div>
                        </td>
                        <td
                            v-for="col in columns"
                            v-show="
                                visibleColumns.includes(col.key) &&
                                col.key !== 'select'
                            "
                            :key="col.key"
                            :class="`${currentDensity.cellPadding} ${
                                currentDensity.fontSize
                            } ${
                                col.hiddenOnMobile
                                    ? 'hidden md:table-cell'
                                    : 'table-cell'
                            } ${
                                col.align
                                    ? `text-${col.align}`
                                    : col.key === 'actions'
                                      ? 'text-right'
                                      : 'text-left'
                            } ${theme.textPrimary} ${
                                col.sticky === 'right' || col.sticky === true
                                    ? `sticky right-0 z-10 ${theme.tableBackground || 'bg-white dark:bg-gray-800'} shadow-[-4px_0_6px_-1px_rgb(0,0,0,0.05)] group-hover:bg-gray-50 dark:group-hover:bg-gray-900`
                                    : col.sticky === 'left'
                                    ? `sticky left-0 z-10 ${theme.tableBackground || 'bg-white dark:bg-gray-800'} shadow-[4px_0_6px_-1px_rgb(0,0,0,0.05)] group-hover:bg-gray-50 dark:group-hover:bg-gray-900`
                                    : ''
                            }`"
                        >
                            <div
                                v-if="
                                    col.key === 'actions' &&
                                    hasVisibleActions(row)
                                "
                                class="flex items-center justify-end gap-1"
                            >
                                <template
                                    v-for="action in visibleStandaloneActions(row)"
                                    :key="action.key"
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        :class="
                                            cn(
                                                'h-8 px-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800',
                                                theme.secondaryButton,
                                                !action.showLabel && 'w-8',
                                            )
                                        "
                                        @click.stop="
                                            handleCustomAction(action, row)
                                        "
                                        :title="resolveLabel(action.label)"
                                    >
                                        <component
                                            v-if="action.icon"
                                            :is="action.icon"
                                            :class="
                                                cn(
                                                    'h-4 w-4',
                                                    action.showLabel &&
                                                        'me-1.5',
                                                )
                                            "
                                        />
                                        <span
                                            v-if="action.showLabel"
                                            class="text-xs font-medium"
                                            >{{ resolveLabel(action.label) }}</span
                                        >
                                    </Button>
                                </template>

                                <DropdownMenu :modal="false">
                                    <DropdownMenuTrigger as-child>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            :class="currentDensity.buttonSize"
                                            @click.stop
                                        >
                                            <MoreHorizontal
                                                :class="
                                                    localDensity === 'compact'
                                                        ? 'h-3.5 w-3.5'
                                                        : localDensity ===
                                                            'relaxed'
                                                          ? 'h-5 w-5'
                                                          : 'h-4 w-4'
                                                "
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        :collision-padding="8"
                                        :class="
                                            cn(
                                                'w-36 p-1 shadow-md border rounded-md bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800',
                                                theme.menuBackground,
                                                theme.menuBorder,
                                                theme.menuText,
                                            )
                                        "
                                    >
                                        <template
                                            v-for="(action, index) in getRowDropdownActions(row)"
                                            :key="action.key"
                                        >
                                            <DropdownMenuSeparator
                                                v-if="index > 0"
                                                :class="cn('my-0.5', theme.toolbarSeparator)"
                                            />
                                            <DropdownMenuItem
                                                @click="action.onClick"
                                                :class="cn(
                                                    'cursor-pointer flex items-center gap-2 px-2 py-1 text-xs font-medium',
                                                    action.class || theme.menuText
                                                )"
                                            >
                                                <component
                                                    v-if="action.icon"
                                                    :is="action.icon"
                                                    :class="['h-3.5 w-3.5', action.iconClass || 'opacity-60']"
                                                    :stroke-width="1.75"
                                                />
                                                <span>{{ resolveLabel(action.label) }}</span>
                                            </DropdownMenuItem>
                                        </template>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <template
                                v-else-if="getCellContent(row, col) !== null"
                            >
                                <component
                                    v-if="isVNode(getCellContent(row, col))"
                                    :is="getCellContent(row, col)"
                                />
                                <span v-else>{{
                                    getCellContent(row, col)
                                }}</span>
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storageKey } from '../../lib/storage';
import { useLucideIcons } from '../../composables/useLucideIcons';
import {
    ArrowUpDown,
    Eraser,
    Eye,
    EyeOff,
    MoreHorizontal,
    Pencil,
    RotateCcw,
    Trash2,
    FileText,
    FileSpreadsheet,
    FileJson,
    Mail,
    Table,
    Printer,
    Download,
    ChevronDown,
} from '@lucide/vue';
import {
    handleExportPDF,
    handleExportExcel,
    handleExportCSV,
    handlePrint,
    normalizeExportConfig,
} from '../../utils/exportUtils';
import { computed, h, isVNode, watch, type Component } from 'vue';
import { usePage } from '../../adapters/inertia';
import { useUiI18n } from '../../i18n';
import { resolveColumnLabel, resolveLabel } from '../../i18n';
import { DENSITY_CONFIGS, getThemeHex } from '../../composables/themes';
import { toast } from '../../composables/useToast';

const { t } = useUiI18n();
const { resolveLucideIcon } = useLucideIcons();
import type {
    ActionConfig,
    ActionSettings,
    BadgeConfig,
    ColumnConfig,
    CustomAction,
    DensityType,
    ExportFormat,
    ModuleConfig,
    SortConfig,
    SwitchColumnConfig,
    TableTheme,
} from '../../types/module';
import { Badge } from '../../primitives/badge';
import { Button } from '../../primitives/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../primitives/dropdown-menu';
import { cn } from '../../lib/utils';
import DensityToggle from './DensityToggle.vue';
import LayoutToggle from './LayoutToggle.vue';
import SwitchColumn from './SwitchColumn.vue';

interface Props {
    /** Extra Export-menu entries the module configured (exportConfig.customActions), already permission-filtered. */
    exportActions?: any[];
    data: any[];
    columns: ColumnConfig[];
    visibleColumns: string[];
    sortConfig?: SortConfig;
    canUpdate?: boolean;
    canDelete?: boolean;
    canBulkDelete?: boolean;
    canView?: boolean;
    selectedRows: string[];
    totalCount?: number;
    theme?: Partial<TableTheme>;
    customRowActions?: CustomAction[];
    customBulkActions?: CustomAction[];
    updateEndpoint?: string;
    editIcon?: Component;
    deleteIcon?: Component;
    viewIcon?: Component;
    actionConfig?: ActionConfig;
    config?: ModuleConfig;
    selectedTheme?: string;
    layout?: 'table' | 'grid'; // ✅ NEW: current layout, for the LayoutToggle beside Density
    showLayoutToggle?: boolean; // ✅ NEW: show the Table/Grid switch (modules with gridConfig)
    hideToolbar?: boolean; // ✅ NEW: skip this component's own toolbar — a shared DataToolbar is rendered above it instead
}

const props = withDefaults(defineProps<Props>(), {
    exportActions: () => [],
    canUpdate: true,
    canDelete: true,
    canBulkDelete: true,
    canView: true,
    customRowActions: () => [],
    customBulkActions: () => [],
    theme: () => ({}),
    hideToolbar: false,
});

const emit = defineEmits<{
    exportAction: [action: any];
    rowClick: [row: any];
    viewClick: [row: any];
    delete: [id: string | number];
    bulkAction: [actionKey: string, ids: string[]];
    customRowAction: [action: CustomAction, row: any];
    toggleColumn: [key: string];
    sort: [key: string];
    selectionChange: [rows: string[]];
    resetColumns: [];
    export: [format: ExportFormat];
    'update:layout': [layout: 'table' | 'grid'];
}>();

const exportConfig = computed(() => {
    const defaults = {
        pdf: true,
        excel: true,
        csv: true,
        json: false,
        print: true,
        showAsGroup: true,
        enabled: true,
        position: 'filterBar' as 'table' | 'filterBar',
        showAsDropdown: true,
        align: 'right' as 'left' | 'right',
        activeOnlyOnData: true,
    };
    if (!props.config || !props.config.exportConfig) {
        return defaults;
    }
    const normalized = normalizeExportConfig(props.config.exportConfig);
    const resolvedPosition = normalized.position || 'table';

    // Default showAsDropdown logic matching FilterBar
    let defaultShowAsDropdown = resolvedPosition === 'filterBar';
    if (props.config.exportConfig.showAsDropdown === undefined && props.config.exportConfig.ui?.asDropdown === undefined) {
        if (resolvedPosition === 'filterBar') {
            defaultShowAsDropdown = normalized.showAsGroup !== false;
        } else {
            defaultShowAsDropdown = false;
        }
    } else {
        defaultShowAsDropdown = normalized.showAsDropdown;
    }

    // Default align: 'right' in table unless explicitly set to 'left'
    let defaultAlign: 'left' | 'right' = 'right';
    if (props.config.exportConfig.align !== undefined || props.config.exportConfig.ui?.align !== undefined) {
        defaultAlign = normalized.align;
    }

    return {
        ...defaults,
        ...normalized,
        showAsDropdown: defaultShowAsDropdown,
        align: defaultAlign,
    };
});

const exportTo = (type: ExportFormat) => {
    emit('export', type);
};

const isActionVisible = (
    action: ActionSettings | CustomAction | undefined,
    row: any,
) => {
    if (!action) return true;
    if (typeof action.show === 'function') {
        return action.show(row);
    }
    return action.show !== false;
};

const visibleDropdownActions = computed(() =>
    props.customRowActions.filter((a) => a.position !== 'standalone'),
);

const visibleStandaloneActions = (row: any) =>
    props.customRowActions.filter(
        (a) => a.position === 'standalone' && isActionVisible(a, row),
    );

const visibleDropdownActionsForRow = (row: any) =>
    visibleDropdownActions.value.filter((a) => isActionVisible(a, row));

const getRowDropdownActions = (row: any) => {
    const list: Array<{
        key: string;
        label: string;
        icon: any;
        onClick: () => void;
        class?: string;
        iconClass?: string;
    }> = [];

    // 1. View action
    const viewVisible =
        props.actionConfig?.detailsView?.show !== false &&
        isActionVisible(props.actionConfig?.detailsView, row) &&
        props.canView;
    if (viewVisible) {
        list.push({
            key: 'view',
            label: t('ui-builder.view'),
            icon: props.actionConfig?.detailsView?.icon || props.viewIcon || Eye,
            onClick: () => handleView(row),
        });
    }

    // 2. Edit action
    const editVisible =
        isActionVisible(props.actionConfig?.edit, row) &&
        props.canUpdate;
    if (editVisible) {
        list.push({
            key: 'edit',
            label: t('ui-builder.edit'),
            icon: props.actionConfig?.edit?.icon || props.editIcon || Pencil,
            onClick: () => handleEdit(row),
        });
    }

    // 3. Custom dropdown actions
    const customActions = visibleDropdownActionsForRow(row);
    for (const action of customActions) {
        list.push({
            key: `custom-${action.key}`,
            label: action.label,
            icon: action.icon,
            onClick: () => handleCustomAction(action, row),
        });
    }

    // 4. Delete action
    const deleteVisible =
        isActionVisible(props.actionConfig?.delete, row) &&
        props.canDelete;
    if (deleteVisible) {
        list.push({
            key: 'delete',
            label: t('ui-builder.delete'),
            icon: props.actionConfig?.delete?.icon || props.deleteIcon || Trash2,
            onClick: () => handleDelete(row),
            class: 'text-red-600 focus:text-red-700 focus:bg-red-50/50 dark:focus:bg-red-950/20',
            iconClass: 'text-red-500',
        });
    }

    return list;
};

const hasVisibleActions = (row: any) => {
    const editVisible = isActionVisible(props.actionConfig?.edit, row);
    const deleteVisible = isActionVisible(props.actionConfig?.delete, row);
    const viewVisible =
        props.actionConfig?.detailsView?.show !== false &&
        isActionVisible(props.actionConfig?.detailsView, row);

    return (
        (editVisible && props.canUpdate) ||
        (deleteVisible && props.canDelete) ||
        (viewVisible && props.canView) ||
        visibleDropdownActionsForRow(row).length > 0 ||
        visibleStandaloneActions(row).length > 0
    );
};

import { useStorage } from '@vueuse/core';

// ✅ Use shared density ref for immediate UI updates across tabs/modules
const localDensity = useStorage<DensityType>(storageKey('table-density'), 'normal');

const buttonSizeClass = computed(() => {
    if (localDensity.value === 'compact') return 'h-8 text-xs px-3';
    if (localDensity.value === 'relaxed') return 'h-10 text-base px-5';
    return 'h-9 text-sm px-4';
});

const squareButtonSizeClass = computed(() => {
    if (localDensity.value === 'compact') return 'h-8 w-8';
    if (localDensity.value === 'relaxed') return 'h-10 w-10';
    return 'h-9 w-9';
});

watch(
    () => props.visibleColumns,
    (newVal, oldVal) => {},
    { deep: true },
);

const handleDelete = (row: any) => {
    emit('delete', row.id);
};

const handleCustomAction = (action: CustomAction, row: any) => {
    emit('customRowAction', action, row);
};

const handleBulkAction = (actionKey: string) => {
    const action = props.customBulkActions?.find((a) => a.key === actionKey);

    if (action && action.validation) {
        const fullRows = props.data.filter((row) =>
            props.selectedRows.includes(String(row.id)),
        );
        const validationResult = action.validation(fullRows);
        if (!validationResult.isValid) {
            toast.warning(validationResult.message || 'Invalid selection.');
            return;
        }
    }
    emit('bulkAction', actionKey, props.selectedRows);
};

const defaultTheme: TableTheme = {
    tableBackground: 'bg-white dark:bg-gray-800',
    tableBorder: 'border-gray-200 dark:border-gray-700',
    headerBackground: 'bg-gray-50 dark:bg-gray-950',
    headerText: 'text-gray-900 dark:text-gray-100',
    rowHover: 'hover:bg-gray-50 dark:hover:bg-gray-950/50',
    rowSelected: 'bg-blue-50 dark:bg-blue-900/30',
    rowBorder: 'border-gray-100 dark:bg-gray-900',
    textPrimary: 'text-gray-900 dark:text-gray-100',
    textSecondary: 'text-gray-700 dark:text-gray-300',
    toolbarBackground: 'bg-gray-50 dark:bg-gray-950',
    toolbarBorder: 'border-gray-200 dark:border-gray-800',
    toolbarText: 'text-gray-700 dark:text-gray-300',
    toolbarSeparator: 'bg-gray-300 dark:bg-gray-600',
    iconActive: 'text-gray-600 dark:text-gray-400',
    iconInactive: 'text-gray-500 dark:text-gray-400',
    menuBackground: 'bg-white dark:bg-gray-950',
    menuBorder: 'border-gray-200 dark:border-gray-800',
    menuText: 'text-gray-900 dark:text-gray-100',
    primaryButton: 'bg-gray-600 hover:bg-gray-700 text-white',
    secondaryButton:
        'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-800',
    checkbox: 'text-blue-600 focus:ring-blue-500',
};

const theme = computed(() => ({ ...defaultTheme, ...props.theme }));

const checkboxAccentColor = computed(() => {
    const primaryButton = theme.value.primaryButton || '';

    const colorMap: Record<string, string> = {
        'bg-blue-600': '#2563eb',
        'bg-emerald-600': '#059669',
        'bg-green-600': '#16a34a',
        'bg-purple-600': '#9333ea',
        'bg-red-600': '#dc2626',
        'bg-orange-600': '#ea580c',
        'bg-yellow-600': '#ca8a04',
        'bg-teal-600': '#0d9488',
        'bg-cyan-600': '#0891b2',
        'bg-indigo-600': '#4f46e5',
        'bg-pink-600': '#db2777',
        'bg-rose-600': '#e11d48',
        'bg-gray-600': '#4b5563',
        'bg-slate-600': '#475569',
        'bg-zinc-600': '#52525b',
        'bg-stone-600': '#57534e',
        'bg-neutral-600': '#525252',
        'bg-lime-600': '#65a30d',
        'bg-amber-600': '#d97706',
        'bg-violet-600': '#7c3aed',
        'bg-fuchsia-600': '#c026d3',
        'bg-sky-600': '#0284c7',
    };

    for (const [className, hexColor] of Object.entries(colorMap)) {
        if (primaryButton.includes(className)) {
            return hexColor;
        }
    }

    // Default to blue
    return '#2563eb';
});

const getSelectedRowClass = () => {
    // Priority 1: Use theme-defined selection style if available
    if (theme.value.rowSelected) {
        return theme.value.rowSelected;
    }

    const primaryBg = theme.value.primaryButton || '';

    const colorFamilies = [
        'blue',
        'emerald',
        'green',
        'purple',
        'red',
        'orange',
        'yellow',
        'teal',
        'cyan',
        'indigo',
        'pink',
        'rose',
        'gray',
        'slate',
        'zinc',
        'stone',
        'neutral',
        'lime',
        'amber',
        'violet',
        'fuchsia',
        'sky',
    ];

    const detectedColor = colorFamilies.find((color) =>
        primaryBg.toLowerCase().includes(color),
    );

    if (detectedColor) {
        // Handle special case for emerald vs green (emerald is preferred for green themes)
        const finalColor =
            detectedColor === 'green' && primaryBg.includes('emerald')
                ? 'emerald'
                : detectedColor;

        // Modern gradient adjustment: slightly higher opacity for better contrast on glass surfaces
        if (primaryBg.includes('gradient') || primaryBg.includes('backdrop')) {
            return `theme-${finalColor} bg-tc-50/40 dark:bg-tc-500/10`;
        }

        return `theme-${finalColor} bg-tc-50 dark:bg-tc-500/10`;
    }

    return 'bg-blue-50 dark:bg-blue-500/10';
};

const getTagBadgeClass = () => {
    const primaryBg = theme.value.primaryButton || '';

    const colorFamilies = [
        'blue',
        'emerald',
        'green',
        'purple',
        'red',
        'orange',
        'yellow',
        'teal',
        'cyan',
        'indigo',
        'pink',
        'rose',
        'gray',
        'slate',
        'zinc',
        'stone',
        'neutral',
        'lime',
        'amber',
        'violet',
        'fuchsia',
        'sky',
    ];

    const detected = colorFamilies.find((c) =>
        primaryBg.toLowerCase().includes(c),
    );

    if (detected) {
        const color =
            detected === 'green' && primaryBg.includes('emerald')
                ? 'emerald'
                : detected;
        // Literal tc-* classes (Tailwind cannot see a runtime-built `text-${color}-800`); theme-<color> picks the palette.
        return `theme-${color} bg-tc-100 text-tc-800 border-tc-200 dark:bg-tc-500/15 dark:text-tc-300 dark:border-tc-500/25`;
    }

    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-500/25';
};

const currentDensity = computed(
    () => DENSITY_CONFIGS[localDensity.value] || DENSITY_CONFIGS.normal,
);
const hasCheckboxColumn = computed(() =>
    props.visibleColumns.includes('select'),
);
const selectableColumns = computed(() => {
    const cols = props.columns.filter(
        (col) => !['select', 'actions'].includes(col.key),
    );

    return cols;
});

const selectedFullRows = computed(() => {
    return props.data.filter((row) =>
        props.selectedRows.includes(String(row.id)),
    );
});

const visibleBulkActions = computed(() => {
    return props.customBulkActions.filter((action) => {
        if (!action.validation) return true;
        const result = action.validation(selectedFullRows.value);
        return result.isValid;
    });
});

watch(
    selectedFullRows,
    (newRows, oldRows) => {
        if (newRows.length === 0) return;

        const isCheckingFirstItem =
            newRows.length === 1 && oldRows.length === 0;

        props.customBulkActions.forEach((action) => {
            if (action.validation) {
                const result = action.validation(newRows);
                if (!result.isValid && result.message) {
                    // Suppress "select at least" messages when just checking the first item
                    const isMinLengthError = result.message
                        .toLowerCase()
                        .includes('select at least');

                    if (isCheckingFirstItem && isMinLengthError) {
                        return;
                    }

                    toast.warning(result.message);
                }
            }
        });
    },
    { deep: true },
);
const isAllSelected = computed(
    () =>
        props.selectedRows.length === props.data.length &&
        props.data.length > 0,
);

const isIndeterminate = computed(
    () =>
        props.selectedRows.length > 0 &&
        props.selectedRows.length < props.data.length,
);

const handleSelectAllClick = () => {
    const newState = !isAllSelected.value;

    emit(
        'selectionChange',
        newState ? props.data.map((row) => String(row.id)) : [],
    );
};

const handleSelectRowClick = (id: string | number) => {
    const idStr = String(id);
    const isCurrentlySelected = props.selectedRows.includes(idStr);

    const newSelection = isCurrentlySelected
        ? props.selectedRows.filter((rowId) => rowId !== idStr)
        : [...props.selectedRows, idStr];

    emit('selectionChange', newSelection);
};

const toggleColumn = (key: string) => {
    emit('toggleColumn', key);
};

const handleEdit = (row: any) => {
    emit('rowClick', row);
};

const handleView = (row: any) => {
    emit('viewClick', row);
};

const handleRowClick = (event: MouseEvent, row: any) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, input, [role="menuitem"]')) return;
    emit('rowClick', row);
};

const getCellContent = (row: any, column: ColumnConfig) => {
    if (!props.visibleColumns.includes(column.key)) return null;

    switch (column.type) {
        case 'avatar':
            return h('div', { class: 'flex items-center gap-3' }, [
                h('img', {
                    src:
                        row.image ||
                        row.avatar ||
                        'https://via.placeholder.com/32',
                    alt: row.name || 'Avatar',
                    class: `${currentDensity.value.avatarSize} rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700`,
                }),
                h('span', { class: 'font-medium' }, row.name),
            ]);

        case 'badge':
            if (column.badgeConfig) {
                const getBadgeVNode = (value: any) => {
                    let lookupValue = value;
                    if (value && typeof value === 'object') {
                        lookupValue = value.name || value.label || value.id;
                    }

                    const bc = column.badgeConfig as Record<any, BadgeConfig>;
                    if (!bc || 'variantMap' in bc || 'colorMap' in bc)
                        return null;

                    const config = bc[String(lookupValue)];
                    if (config) {
                        const hasTextColor =
                            config.class && /\btext-\w+/.test(config.class);
                        const themeTextColor = hasTextColor
                            ? ''
                            : (props.theme as any).badgeText ||
                              (props.theme as any).tableTextPrimary ||
                              '';

                        const badgeItem = h(
                            Badge,
                            {
                                variant: config.variant as any,
                                class: cn(
                                    'inline-flex h-auto items-center gap-1 py-1 break-words whitespace-normal',
                                    column.wrapped
                                        ? 'w-full justify-center md:w-auto md:justify-start'
                                        : 'w-auto',
                                    themeTextColor,
                                    config.class,
                                ),
                            },
                            () => [
                                config.icon
                                    ? h(config.icon, {
                                          class: 'h-3 w-3 flex-shrink-0',
                                      })
                                    : null,
                                h(
                                    'span',
                                    {
                                        class: 'block max-w-full',
                                        title: resolveLabel(config.label),
                                    },
                                    resolveLabel(config.label),
                                ),
                            ],
                        );

                        return h(
                            'div',
                            {
                                class: cn(
                                    'flex min-w-0 items-center',
                                    column.wrapped
                                        ? 'w-full md:w-auto'
                                        : 'w-auto',
                                ),
                            },
                            [badgeItem],
                        );
                    }
                    return null;
                };

                const rawValue = column.render
                    ? column.render(row, theme.value, localDensity.value)
                    : row[column.key];

                if (Array.isArray(rawValue)) {
                    const badgeVNodes = rawValue
                        .map((v) => getBadgeVNode(v))
                        .filter(Boolean);
                    if (badgeVNodes.length > 0) {
                        return h(
                            'div',
                            {
                                class: cn(
                                    'gap-x-2 gap-y-1.5',
                                    column.wrapped
                                        ? 'grid w-full grid-cols-[repeat(3,minmax(60px,1fr))] md:inline-flex md:max-w-[280px] md:flex-wrap md:gap-1.5'
                                        : 'inline-flex flex-wrap items-center',
                                    column.align === 'center'
                                        ? 'justify-start md:justify-center'
                                        : 'justify-start',
                                ),
                            },
                            badgeVNodes,
                        );
                    }
                } else {
                    const vnode = getBadgeVNode(rawValue);
                    if (vnode) return vnode;
                }
            }

            // Fallback to existing logic for other badges
            const badgeContent = column.render
                ? column.render(row, theme.value)
                : row[column.key] || row.role || row.category || '—';

            if (Array.isArray(badgeContent)) {
                return h(
                    'div',
                    {
                        class: cn(
                            'gap-x-2 gap-y-1.5',
                            column.wrapped
                                ? 'grid w-full grid-cols-[repeat(3,minmax(60px,1fr))] md:inline-flex md:max-w-[280px] md:flex-wrap md:gap-1.5'
                                : 'inline-flex flex-wrap items-center',
                            column.align === 'center'
                                ? 'justify-start md:justify-center'
                                : 'justify-start',
                        ),
                    },
                    badgeContent.map((content: string) => {
                        const standardBadge = h(
                            Badge,
                            {
                                class: cn(
                                    'h-auto border py-1 break-words whitespace-normal',
                                    column.wrapped
                                        ? 'w-full justify-center md:w-auto md:justify-start'
                                        : 'w-auto',
                                    currentDensity.value.badgePadding,
                                    getTagBadgeClass(),
                                ),
                            },
                            () =>
                                h(
                                    'span',
                                    { class: 'block', title: String(content) },
                                    String(content),
                                ),
                        );

                        return h(
                            'div',
                            {
                                class: cn(
                                    'flex min-w-0 items-center',
                                    column.wrapped
                                        ? 'w-full md:w-auto'
                                        : 'w-auto',
                                ),
                            },
                            [standardBadge],
                        );
                    }),
                );
            }

            // Handle object-based badge configuration (direct from data)
            if (
                badgeContent &&
                typeof badgeContent === 'object' &&
                !Array.isArray(badgeContent) &&
                'label' in badgeContent
            ) {
                const config = badgeContent as any;
                const IconComponent = config.icon
                    ? typeof config.icon === 'string'
                        ? resolveLucideIcon(config.icon)
                        : config.icon
                    : null;

                return h(
                    Badge,
                    {
                        variant: config.variant || 'default',
                        class: cn(
                            'inline-flex h-auto items-center gap-1.5 border py-1 break-words whitespace-normal',
                            currentDensity.value.badgePadding,
                            config.class || getTagBadgeClass(),
                        ),
                    },
                    () => [
                        IconComponent
                            ? h(IconComponent, { class: 'h-3 w-3' })
                            : null,
                        h('span', resolveLabel(String(config.label))),
                    ],
                );
            }

            return h(
                Badge,
                {
                    class: cn(
                        'h-auto border py-1 break-words whitespace-normal',
                        currentDensity.value.badgePadding,
                        getTagBadgeClass(),
                    ),
                },
                () => String(badgeContent),
            );

        case 'status':
            const isActive = row.status === 'Active';
            return h(
                'span',
                {
                    class: `inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                        isActive
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`,
                },
                [
                    h('span', {
                        class: `h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`,
                    }),
                    String(row.status ?? '—'),
                ],
            );

        case 'custom':
            if (column.render) {
                const rendered = column.render(
                    row,
                    theme.value,
                    localDensity.value,
                );
                if (isVNode(rendered)) return rendered;
                return String(
                    rendered !== null &&
                        rendered !== undefined &&
                        rendered !== ''
                        ? rendered
                        : '—',
                );
            }
            return String(
                row[column.key] !== null &&
                    row[column.key] !== undefined &&
                    row[column.key] !== ''
                    ? row[column.key]
                    : '—',
            );

        case 'component':
            if (column.render) {
                const rendered = column.render(
                    row,
                    theme.value,
                    localDensity.value,
                );
                if (isVNode(rendered)) return rendered;
                if (rendered && typeof rendered === 'object') {
                    return h(rendered as Component);
                }
            }
            return null;

        case 'switch':
            const switchConfig: SwitchColumnConfig = {
                field: column.key,
                onLabel: ' ',
                offLabel: ' ',
                ...(column.switchConfig || {}),
            };

            const densityToSize: Record<DensityType, string> = {
                compact: 'sm',
                normal: 'md',
                relaxed: 'xl',
            };
            const defaultSize = densityToSize[localDensity.value] || 'md';

            const switchNode = h(SwitchColumn, {
                row,
                config: switchConfig,
                permission: column.permission || switchConfig.permission,
                disabled: column.disabled,
                readonly: column.readonly || !column.switchConfig, // Force readonly if no config provided
                isChecked:
                    typeof column.isChecked === 'function'
                        ? column.isChecked(row)
                        : column.isChecked !== undefined
                          ? column.isChecked
                          : column.render
                            ? column.render(
                                  row,
                                  theme.value,
                                  localDensity.value,
                              )
                            : undefined,
                variant: column.variant,
                updateEndpoint: props.updateEndpoint,
                theme: theme.value,
                dataPropName: props.config?.dataPropName || 'data',
                extraPropsToRefresh: props.config?.extraPropsToRefresh || [],
                size: column.size || defaultSize,
            });
            // SwitchColumn's own root is a full-width flex row, so the cell's `text-${align}` can't move it.
            // Wrap it in a flex container that honours col.align; the default (justify-start) keeps every
            // existing switch column exactly where it was — only a column that sets align center/right shifts.
            return h(
                'div',
                {
                    class:
                        'flex items-center ' +
                        (column.align === 'center'
                            ? 'justify-center'
                            : column.align === 'right'
                              ? 'justify-end'
                              : 'justify-start'),
                },
                [switchNode],
            );

        default:
            if (column.render) {
                const rendered = column.render(
                    row,
                    theme.value,
                    localDensity.value,
                );
                if (isVNode(rendered)) return rendered;
                return String(
                    rendered !== null &&
                        rendered !== undefined &&
                        rendered !== ''
                        ? rendered
                        : '—',
                );
            }
            return String(
                row[column.key] !== null &&
                    row[column.key] !== undefined &&
                    row[column.key] !== ''
                    ? row[column.key]
                    : '—',
            );
    }
};
</script>
