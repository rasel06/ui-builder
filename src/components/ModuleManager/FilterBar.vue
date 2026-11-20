<template>
    <div
        v-if="shouldShow"
        :style="{
            ...vsVars,
            '--focus-theme-color': getThemeHex(selectedThemeLocal),
        }"
        :class="['flex flex-wrap items-center', gapClass, `density-${density}`]"
    >
        <!-- ✅ Theme Selector (Same structure as custom filters) -->
        <div v-if="enableThemeSelector" class="order-1 w-full md:w-[160px]">
            <Select
                v-model="selectedThemeLocal"
                @update:model-value="handleThemeChange"
            >
                <SelectTrigger
                    :class="[
                        controlHeightTextClass,
                        `flex items-center justify-between rounded-md border px-3 text-left font-medium shadow-sm transition-all focus:border-[var(--focus-theme-color)]! focus:ring-0 ${theme.inputBackground} ${theme.inputBorder || 'border-gray-200 dark:border-white/15'} ${theme.badgeText}`,
                    ]"
                >
                    <div class="flex items-center gap-2">
                        <Palette
                            :class="`mt-0.5 h-4 w-4 ${theme.paginationText}`"
                        />
                        <SelectValue :placeholder="t('ui-builder.select_theme')" />
                    </div>
                </SelectTrigger>
                <SelectContent
                    :class="`border ${theme.inputBackground} ${theme.inputBorder} ${theme.badgeText}`"
                >
                    <SelectItem
                        v-for="(themeData, key) in PREBUILT_THEMES"
                        :key="key"
                        :value="key"
                        :class="`focus:${theme.badgeBackground} focus:${theme.badgeText}`"
                    >
                        <div class="flex items-center gap-2">
                            <div
                                :class="`h-3 w-3 rounded-full ${getThemeColor(key)}`"
                            ></div>
                            {{ translatableThemeKeys.has(key) ? t(`theme.${key}`) : themeData.name }}
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div
            v-if="enableDateFilter"
            class="relative order-2 w-full min-w-0 md:w-auto md:min-w-[180px] md:max-w-[320px]"
        >
            <Popover v-model:open="isDatePickerOpen">
                <PopoverTrigger as-child>
                    <Button
                        variant="outline"
                        :class="[
                            controlHeightTextClass,
                            `flex w-full min-w-0 items-center justify-between gap-2 whitespace-nowrap border px-3 text-left font-medium shadow-sm transition-all focus:border-[var(--focus-theme-color)]! focus:ring-0 ${theme.inputBackground} ${theme.inputBorder || 'border-gray-200 dark:border-white/15'} ${theme.badgeText} ${
                                !dateRange.from && !dateRange.to
                                    ? theme.paginationText
                                    : ''
                            }`,
                        ]"
                        :title="dateRangeLabel"
                    >
                        <div class="flex min-w-0 items-center gap-2">
                            <CalendarIcon
                                :class="`mt-0.5 h-4 w-4 shrink-0 ${theme.paginationText}`"
                            />
                            <span class="min-w-0 truncate">{{ dateRangeLabel }}</span>
                        </div>
                        <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    :class="`w-auto border p-4 ${theme.cardBackground} ${theme.cardBorder}`"
                    align="start"
                >
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <Label
                                    :class="`mb-1 block text-xs ${theme.labelText}`"
                                    >{{ resolveLabel('ui-builder.from') }}</Label
                                >
                                <Input
                                    type="date"
                                    v-model="dateFromLocal"
                                    @change="handleDateChange"
                                    :class="[
                                        controlHeightTextClass,
                                        `border ${theme.inputBackground} ${theme.inputBorder} ${theme.badgeText}`,
                                    ]"
                                />
                            </div>
                            <div>
                                <Label
                                    :class="`mb-1 block text-xs ${theme.labelText}`"
                                    >{{ resolveLabel('ui-builder.to') }}</Label
                                >
                                <Input
                                    type="date"
                                    v-model="dateToLocal"
                                    @change="handleDateChange"
                                    :class="[
                                        controlHeightTextClass,
                                        `border ${theme.inputBackground} ${theme.inputBorder} ${theme.badgeText}`,
                                    ]"
                                />
                            </div>
                        </div>
                        <div class="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                @click="clearDateRange"
                                :class="`h-8 gap-1.5 ${theme.secondaryButton}`"
                            >
                                <X class="h-3.5 w-3.5" />
                                {{ resolveLabel('ui-builder.clear') }}
                            </Button>
                            <Button
                                size="sm"
                                @click="isDatePickerOpen = false"
                                :class="`h-8 ${theme.primaryButton}`"
                            >
                                {{ resolveLabel('ui-builder.done') }}
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>

        <div
            v-if="customFilters?.length"
            :class="[
                'flex flex-wrap items-center',
                gapClass,
                filterConfig?.align === 'right' ? 'ml-auto' : '',
                filterConfig?.group ? 'w-auto' : 'w-full md:w-auto',
                filterConfig?.align === 'right' && exportConfig.align === 'left'
                    ? 'order-4'
                    : 'order-3',
            ]"
        >
            <!-- Grouped in Popover -->
            <template v-if="filterConfig?.group">
                <div class="flex items-center gap-1.5">
                    <Popover v-model:open="isFilterGroupOpen">
                        <PopoverTrigger as-child>
                            <Button
                                variant="outline"
                                :class="[
                                    controlHeightTextClass,
                                    `flex items-center gap-2 border px-3 text-left font-medium shadow-sm transition-all focus:border-[var(--focus-theme-color)]! focus:ring-0 ${theme.inputBackground} ${theme.inputBorder || 'border-gray-200 dark:border-white/15'} ${theme.badgeText}`,
                                ]"
                            >
                                <ListFilter
                                    :class="`h-4 w-4 ${theme.paginationText}`"
                                />
                                <span>{{
                                    filterConfig.groupTitle &&
                                    filterConfig.groupTitle !== 'Filters' &&
                                    filterConfig.groupTitle !== 'Filter'
                                        ? resolveLabel(filterConfig.groupTitle)
                                        : t('ui-builder.filters')
                                }}</span>
                                <div
                                    v-if="activeFiltersCount > 0"
                                    class="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-white"
                                    style="font-size: 10px"
                                    :style="{
                                        backgroundColor:
                                            'var(--focus-theme-color)',
                                    }"
                                >
                                    {{ activeFiltersCount }}
                                </div>
                                <ChevronDown
                                    class="h-4 w-4 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180"
                                />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            :class="`z-[50] flex w-[280px] flex-col gap-4 border p-4 shadow-xl ${theme.cardBackground} ${theme.cardBorder}`"
                            align="end"
                            @interact-outside="isFilterGroupOpen = false"
                        >
                            <div
                                v-for="filter in customFilters"
                                :key="filter.key"
                                class="flex flex-col gap-1.5"
                            >
                                <label
                                    :class="`text-xs font-semibold tracking-wider uppercase ${theme.labelText} opacity-60`"
                                >
                                    {{ resolveLabel(filter.label) }}
                                </label>
                                <v-select
                                    v-if="filter.type === 'vue-select'"
                                    :id="filter.key"
                                    :dropdown-should-open="
                                        (vm) => vm.search.length > 0
                                    "
                                    :multiple="filter.multiple"
                                    :model-value="
                                        selectedFilterObjects[filter.key] ||
                                        (filter.multiple ? [] : null)
                                    "
                                    @update:model-value="
                                        (val: any) => {
                                            if (Array.isArray(val)) {
                                                selectedFilterObjects[
                                                    filter.key
                                                ] = val;
                                                customFilterValuesLocal[
                                                    filter.key
                                                ] = val.map((v) =>
                                                    typeof v === 'object'
                                                        ? v.value !== undefined
                                                            ? v.value
                                                            : v.id
                                                        : v,
                                                );
                                            } else if (
                                                val &&
                                                typeof val === 'object'
                                            ) {
                                                selectedFilterObjects[
                                                    filter.key
                                                ] = val;
                                                const finalValue =
                                                    val.value !== undefined
                                                        ? val.value
                                                        : val.id;
                                                customFilterValuesLocal[
                                                    filter.key
                                                ] = finalValue;
                                            } else {
                                                selectedFilterObjects[
                                                    filter.key
                                                ] = filter.multiple ? [] : null;
                                                customFilterValuesLocal[
                                                    filter.key
                                                ] = val;
                                                // Reset options on clear
                                                if (
                                                    filter.ajaxConfig
                                                        ?.resetOnEmpty !== false
                                                ) {
                                                    dynamicFilterOptions[
                                                        filter.key
                                                    ] = [];
                                                }
                                            }
                                            handleCustomFilterChange(
                                                filter.key,
                                            );
                                        }
                                    "
                                    :options="getFilterOptions(filter)"
                                    :reduce="(opt: any) => opt"
                                    :get-option-label="
                                        (opt: any) =>
                                            getFilterOptionLabel(filter, opt)
                                    "
                                    :placeholder="
                                        focusedFilters[filter.key]
                                            ? t('ui-builder.start_typing')
                                            : resolveLabel(filter.placeholder || filter.label)
                                    "
                                    @search:focus="
                                        focusedFilters[filter.key] = true
                                    "
                                    @search:blur="
                                        focusedFilters[filter.key] = false
                                    "
                                    :class="[
                                        `vue-select-custom ${vueSelectSizeClass} w-full rounded-md border text-sm shadow-sm transition-all focus-within:border-[var(--focus-theme-color)]! focus-within:ring-0 focus-within:outline-none!`,
                                        filter.multiple ? 'multiple' : '',
                                        theme.inputBackground || '',
                                        theme.inputBorder || 'border-gray-200 dark:border-white/15',
                                        theme.badgeText || '',
                                        !customFilterValuesLocal[filter.key]
                                            ? theme.paginationText || ''
                                            : '',
                                        loadingFilters[filter.key]
                                            ? 'relative z-[60]'
                                            : '',
                                    ]"
                                    :style="{
                                        '--vs-highlight-bg':
                                            getThemeHex(selectedThemeLocal),
                                        '--vs-tag-color':
                                            getThemeTagTextColor(
                                                selectedThemeLocal,
                                            ),
                                        '--focus-theme-color':
                                            getThemeHex(selectedThemeLocal),
                                        '--vs-border-radius':
                                            'var(--radius-md, 0.375rem)',
                                    }"
                                    :loading="loadingFilters[filter.key]"
                                    :filterable="!filter.ajaxConfig"
                                    @search="
                                        (
                                            search: string,
                                            loading: (s: boolean) => void,
                                        ) =>
                                            handleFilterSearch(
                                                filter,
                                                search,
                                                loading,
                                            )
                                    "
                                >
                                    <template #list-footer>
                                        <div
                                            v-if="
                                                filter.multiple &&
                                                selectedFilterObjects[
                                                    filter.key
                                                ]?.length
                                            "
                                            class="mt-1 border-t border-gray-200 pt-1 dark:border-gray-700"
                                        >
                                            <div
                                                class="px-3 py-1.5 font-semibold tracking-wider text-gray-400 dark:text-neutral-400 uppercase"
                                                style="font-size: 10px"
                                            >
                                                {{ resolveLabel('ui-builder.selected_items') }}
                                            </div>
                                            <div
                                                v-for="opt in selectedFilterObjects[
                                                    filter.key
                                                ]"
                                                :key="
                                                    opt.value !== undefined
                                                        ? opt.value
                                                        : opt.id
                                                "
                                                class="group flex cursor-pointer items-center justify-between px-3 py-1.5 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                                                @mousedown.stop.prevent="
                                                    removeOption(
                                                        filter.key,
                                                        opt,
                                                    )
                                                "
                                            >
                                                <div
                                                    class="flex items-center gap-2"
                                                >
                                                    <Check
                                                        class="h-3.5 w-3.5 text-blue-500"
                                                    />
                                                    <span class="text-sm">
                                                        {{
                                                            getFilterOptionLabel(
                                                                filter,
                                                                opt,
                                                            )
                                                        }}
                                                    </span>
                                                </div>
                                                <div
                                                    class="flex h-7 w-7 items-center justify-center rounded-md transition-colors group-hover:bg-red-100 dark:group-hover:bg-red-900/40"
                                                >
                                                    <X
                                                        class="h-4 w-4 text-red-500 opacity-80 transition-opacity group-hover:opacity-100"
                                                        :stroke-width="2"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                    <template #placeholder>
                                        <div
                                            class="pointer-events-none flex h-full items-center justify-start gap-2 overflow-hidden leading-none opacity-60"
                                        >
                                            <component
                                                v-if="filter.icon"
                                                :is="filter.icon"
                                                :class="`h-4 w-4 shrink-0 ${theme.paginationText}`"
                                            />
                                            <span
                                                class="truncate text-xs leading-none font-medium"
                                                >{{
                                                    resolveLabel(
                                                        filter.placeholder ||
                                                            filter.label,
                                                    )
                                                }}</span
                                            >
                                        </div>
                                    </template>
                                    <template #search="{ attributes, events }">
                                        <div
                                            class="relative flex h-full w-full items-center justify-start gap-2 overflow-hidden rounded-sm leading-none"
                                        >
                                            <!-- Search Icon: Always show if searching or if multiple -->
                                            <component
                                                v-if="filter.icon"
                                                :is="filter.icon"
                                                :class="`h-4 w-4 shrink-0 text-slate-600 dark:text-slate-400 ${theme.paginationText}`"
                                                v-show="
                                                    filter.multiple ||
                                                    !customFilterValuesLocal[
                                                        filter.key
                                                    ] ||
                                                    attributes.placeholder ||
                                                    focusedFilters[filter.key]
                                                "
                                            />

                                            <Badge
                                                v-if="
                                                    filter.multiple &&
                                                    selectedFilterObjects[
                                                        filter.key
                                                    ] &&
                                                    selectedFilterObjects[
                                                        filter.key
                                                    ].length > 0
                                                "
                                                variant="secondary"
                                                class="ml-0.5 flex h-[18px] items-center justify-center rounded px-1.5 py-0 text-[10px]"
                                                :style="{
                                                    backgroundColor:
                                                        'var(--vs-tag-bg, var(--vs-highlight-bg, #f1f5f9))',
                                                    color: 'var(--vs-tag-fg, var(--vs-tag-color, #0f172a))',
                                                }"
                                            >
                                                {{
                                                    selectedFilterObjects[
                                                        filter.key
                                                    ].length
                                                }}
                                            </Badge>

                                            <input
                                                class="vs__search !m-0 min-w-0 flex-grow !border-none !bg-transparent !p-0 text-xs leading-none !shadow-none outline-none focus:ring-0"
                                                v-bind="attributes"
                                                :placeholder="
                                                    focusedFilters[filter.key]
                                                        ? t('ui-builder.start_typing')
                                                        : attributes.placeholder
                                                "
                                                v-on="events"
                                            />
                                        </div>
                                    </template>
                                    <template #selected-option="option">
                                        <div
                                            class="pointer-events-none flex h-full items-center justify-start gap-2 overflow-hidden leading-none"
                                            :class="theme.badgeText"
                                        >
                                            <component
                                                v-if="
                                                    option.icon || filter.icon
                                                "
                                                :is="option.icon || filter.icon"
                                                :class="`h-4 w-4 shrink-0 text-slate-600 dark:text-slate-400 ${theme.paginationText}`"
                                            />
                                            <span
                                                v-if="
                                                    filter.ajaxConfig
                                                        ?.renderOption
                                                "
                                                v-html="
                                                    filter.ajaxConfig.renderOption(
                                                        option,
                                                    )
                                                "
                                            ></span>
                                            <span
                                                v-else
                                                class="truncate text-xs leading-none font-medium"
                                                >{{
                                                    getFilterOptionLabel(
                                                        filter,
                                                        option,
                                                    )
                                                }}</span
                                            >
                                        </div>
                                    </template>
                                    <template #open-indicator>
                                        <div
                                            class="flex h-full items-center justify-center p-1"
                                        >
                                            <ChevronDown
                                                class="h-4 w-4 flex-shrink-0 opacity-50"
                                            />
                                        </div>
                                    </template>
                                    <template #clear="{ deselect }">
                                        <div
                                            class="z-[10] flex cursor-pointer items-center justify-center p-1"
                                            @click.stop="deselect"
                                        >
                                            <X
                                                class="h-3.5 w-3.5 text-slate-500 dark:text-neutral-400 transition-colors hover:text-rose-500"
                                                :stroke-width="1"
                                            />
                                        </div>
                                    </template>
                                    <template
                                        #no-options="{ search, searching }"
                                    >
                                        <div
                                            v-if="loadingFilters[filter.key]"
                                            :class="[
                                                'relative z-[50] flex flex-col justify-start overflow-hidden rounded-md text-left',
                                                theme.tableMenuBackground ||
                                                    'bg-white dark:bg-gray-900',
                                                '!bg-white dark:!bg-gray-950',
                                            ]"
                                        >
                                            <div class="w-full">
                                                <div
                                                    v-for="(width, index) in [
                                                        60, 40, 75, 50, 80,
                                                    ]"
                                                    :key="index"
                                                    class="flex h-[42px] flex-col justify-center gap-1.5 border-b border-gray-100 px-3 py-2 last:border-b-0 dark:border-gray-800"
                                                >
                                                    <div
                                                        :class="[
                                                            'h-3 animate-pulse rounded',
                                                            theme.badgeBackground ||
                                                                'bg-gray-100 dark:bg-gray-800',
                                                        ]"
                                                        :style="{
                                                            width: `${width}%`,
                                                        }"
                                                    ></div>
                                                    <div
                                                        v-if="index % 2 === 0"
                                                        :class="[
                                                            'h-2 w-1/3 animate-pulse rounded opacity-50',
                                                            theme.badgeBackground ||
                                                                'bg-gray-100 dark:bg-gray-800',
                                                        ]"
                                                    ></div>
                                                </div>
                                            </div>
                                            <div
                                                class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] dark:bg-gray-950/60"
                                            >
                                                <div
                                                    class="relative mb-3 h-10 w-10"
                                                >
                                                    <div
                                                        :class="[
                                                            'absolute inset-0 animate-spin rounded-full border-[3px] border-t-transparent opacity-20',
                                                            theme.loadingText ||
                                                                'text-blue-600',
                                                        ]"
                                                        style="
                                                            animation-duration: 3s;
                                                        "
                                                    ></div>
                                                    <div
                                                        :class="[
                                                            'absolute inset-0 animate-spin rounded-full border-[3px] border-r-transparent border-b-transparent border-l-transparent',
                                                            theme.loadingText ||
                                                                'text-blue-600',
                                                        ]"
                                                        style="
                                                            animation-duration: 0.8s;
                                                        "
                                                    ></div>
                                                    <div
                                                        class="absolute inset-0 flex items-center justify-center"
                                                    >
                                                        <div
                                                            :class="[
                                                                'h-1.5 w-1.5 animate-pulse rounded-full',
                                                                theme.loadingText ||
                                                                    'bg-blue-600',
                                                            ]"
                                                        ></div>
                                                    </div>
                                                </div>
                                                <span
                                                    :class="[
                                                        'text-xs font-bold tracking-tight',
                                                        theme.tableTextPrimary ||
                                                            'text-gray-900 dark:text-gray-100',
                                                    ]"
                                                    >{{ resolveLabel('ui-builder.fetching_results') }}</span
                                                >
                                            </div>
                                        </div>
                                        <div
                                            v-else-if="searching"
                                            :class="[
                                                'flex flex-col items-center justify-center gap-3 px-4 py-14 text-center',
                                                theme.tableMenuBackground ||
                                                    'bg-white dark:bg-gray-900',
                                                'rounded-md',
                                            ]"
                                        >
                                            <div
                                                :class="[
                                                    'rounded-full p-3',
                                                    theme.headerBackground ||
                                                        'bg-gray-100 dark:bg-gray-800',
                                                ]"
                                            >
                                                <SearchX
                                                    class="h-8 w-8 opacity-40"
                                                />
                                            </div>
                                            <div class="space-y-1">
                                                <p
                                                    :class="[
                                                        'text-sm font-bold',
                                                        theme.tableTextPrimary ||
                                                            'text-gray-900 dark:text-gray-100',
                                                    ]"
                                                >
                                                    {{ resolveLabel('ui-builder.no_matches_found') }}
                                                </p>
                                                <p
                                                    :class="[
                                                        'max-w-[200px] text-xs leading-relaxed',
                                                        theme.tableTextSecondary ||
                                                            'text-gray-500 dark:text-neutral-400',
                                                    ]"
                                                >
                                                    <span class="font-semibold text-current italic">"{{ search }}"</span> {{ resolveLabel('ui-builder.try_different_term') }}
                                                </p>
                                            </div>
                                        </div>
                                        <div v-else class="hidden"></div>
                                    </template>
                                    <template #spinner="{ loading }">
                                        <div
                                            v-if="
                                                (loading ||
                                                    loadingFilters[
                                                        filter.key
                                                    ]) &&
                                                ((dynamicFilterOptions[
                                                    filter.key
                                                ]?.length ?? 0) > 0 ||
                                                    (filter.options?.length ??
                                                        0) > 0)
                                            "
                                            class="p-1"
                                        >
                                            <RefreshCw
                                                :class="`h-4 w-4 animate-spin ${theme.loadingText || 'text-blue-600'}`"
                                            />
                                        </div>
                                    </template>
                                    <template #list-header>
                                        <div
                                            v-if="
                                                loadingFilters[filter.key] &&
                                                ((dynamicFilterOptions[
                                                    filter.key
                                                ]?.length ?? 0) > 0 ||
                                                    (filter.options?.length ??
                                                        0) > 0)
                                            "
                                            class="sticky top-0 z-[60]"
                                        >
                                            <div
                                                class="absolute inset-0 min-h-[50px] overflow-hidden rounded-md bg-white/40 backdrop-blur-[1px] dark:bg-gray-950/40"
                                            >
                                                <div
                                                    class="flex h-full w-full flex-col items-center justify-center gap-1.5 py-4"
                                                >
                                                    <div
                                                        class="relative h-6 w-6"
                                                    >
                                                        <div
                                                            :class="[
                                                                'absolute inset-0 animate-spin rounded-full border-[2px] border-t-transparent opacity-20',
                                                                theme.loadingText ||
                                                                    'text-blue-600',
                                                            ]"
                                                        ></div>
                                                        <div
                                                            :class="[
                                                                'absolute inset-0 flex items-center justify-center',
                                                                theme.loadingText ||
                                                                    'text-blue-600',
                                                            ]"
                                                        >
                                                            <RefreshCw
                                                                class="h-3.5 w-3.5 animate-spin"
                                                            />
                                                        </div>
                                                    </div>
                                                    <span
                                                        :class="[
                                                            'font-bold tracking-[0.2em] uppercase',
                                                            theme.tableTextSecondary ||
                                                                'text-gray-500 dark:text-neutral-400',
                                                        ]"
                                                        style="font-size: 9px"
                                                        >{{ resolveLabel('ui-builder.updating_filter') }}</span
                                                    >
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </v-select>

                                <Select
                                    v-else
                                    v-model="
                                        customFilterValuesLocal[filter.key]
                                    "
                                    @update:model-value="
                                        handleCustomFilterChange(filter.key)
                                    "
                                >
                                    <SelectTrigger
                                        :class="`flex h-9 items-center justify-between rounded-md border px-3 text-left font-medium shadow-sm ${theme.inputBackground} ${theme.inputBorder} ${theme.badgeText}`"
                                    >
                                        <div class="flex items-center gap-2">
                                            <component
                                                v-if="filter.icon"
                                                :is="filter.icon"
                                                :class="`mt-0.5 h-4 w-4 flex-shrink-0 ${theme.paginationText}`"
                                            />
                                            <SelectValue
                                                :placeholder="
                                                    resolveLabel(
                                                        filter.placeholder ||
                                                            filter.label,
                                                    )
                                                "
                                            />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent
                                        :class="`z-[51] border ${theme.inputBackground} ${theme.inputBorder} ${theme.badgeText}`"
                                    >
                                        <SelectItem
                                            v-for="option in filter.options"
                                            :key="option.value"
                                            :value="option.value"
                                            :class="`focus:${theme.badgeBackground} focus:${theme.badgeText}`"
                                        >
                                            {{ resolveLabel(option.label) }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <!-- Clear all filters button removed from popover (global clear exists in header) -->
                        </PopoverContent>
                    </Popover>
                    <Button
                        v-if="activeFiltersCount > 0"
                        variant="ghost"
                        size="icon"
                        :class="`h-9 w-9 rounded-md border border-transparent transition-opacity hover:opacity-80`"
                        :style="{ color: 'var(--focus-theme-color)' }"
                        :title="t('ui-builder.reset_filters')"
                        @click="clearAllCustomFilters"
                    >
                        <RotateCcw class="h-4 w-4" />
                    </Button>
                </div>
            </template>

            <!-- Individual Filters (Original Layout) -->
            <template v-else>
                <div
                    v-for="filter in customFilters"
                    :key="filter.key"
                    :class="
                        filter.className || 'w-full md:w-auto md:min-w-[200px]'
                    "
                >
                    <div class="flex w-full items-center">
                        <v-select
                            v-if="filter.type === 'vue-select'"
                            :id="filter.key"
                            :dropdown-should-open="(vm) => vm.search.length > 0"
                            :multiple="filter.multiple"
                            :model-value="
                                selectedFilterObjects[filter.key] ||
                                (filter.multiple ? [] : null)
                            "
                            @update:model-value="
                                (val: any) => {
                                    if (Array.isArray(val)) {
                                        selectedFilterObjects[filter.key] = val;
                                        customFilterValuesLocal[filter.key] =
                                            val.map((v) =>
                                                typeof v === 'object'
                                                    ? v.value !== undefined
                                                        ? v.value
                                                        : v.id
                                                    : v,
                                            );
                                    } else if (val && typeof val === 'object') {
                                        selectedFilterObjects[filter.key] = val;
                                        const finalValue =
                                            val.value !== undefined
                                                ? val.value
                                                : val.id;
                                        customFilterValuesLocal[filter.key] =
                                            finalValue;
                                    } else {
                                        selectedFilterObjects[filter.key] =
                                            filter.multiple ? [] : null;
                                        customFilterValuesLocal[filter.key] =
                                            val;
                                        // Reset options on clear
                                        if (
                                            filter.ajaxConfig?.resetOnEmpty !==
                                            false
                                        ) {
                                            dynamicFilterOptions[filter.key] =
                                                [];
                                        }
                                    }
                                    handleCustomFilterChange(filter.key);
                                }
                            "
                            :options="getFilterOptions(filter)"
                            :reduce="(opt: any) => opt"
                            :get-option-label="
                                (opt: any) => getFilterOptionLabel(filter, opt)
                            "
                            :placeholder="
                                focusedFilters[filter.key]
                                    ? t('ui-builder.start_typing')
                                    : resolveLabel(filter.placeholder || filter.label)
                            "
                            @search:focus="focusedFilters[filter.key] = true"
                            @search:blur="focusedFilters[filter.key] = false"
                            :class="[
                                `vue-select-custom ${vueSelectSizeClass} w-full rounded-md border text-sm shadow-sm transition-all focus-within:border-[var(--focus-theme-color)]! focus-within:ring-0 focus-within:outline-none!`,
                                filter.multiple ? 'multiple' : '',
                                theme.inputBackground || '',
                                theme.inputBorder || 'border-gray-200 dark:border-white/15',
                                theme.badgeText || '',
                                !customFilterValuesLocal[filter.key]
                                    ? theme.paginationText || ''
                                    : '',
                                loadingFilters[filter.key]
                                    ? 'relative z-[60]'
                                    : '',
                            ]"
                            :style="{
                                '--vs-highlight-bg':
                                    getThemeHex(selectedThemeLocal),
                                '--vs-tag-color':
                                    getThemeTagTextColor(selectedThemeLocal),
                                '--focus-theme-color':
                                    getThemeHex(selectedThemeLocal),
                                '--vs-border-radius':
                                    'var(--radius-md, 0.375rem)',
                            }"
                            :loading="loadingFilters[filter.key]"
                            :filterable="!filter.ajaxConfig"
                            @search="
                                (
                                    search: string,
                                    loading: (s: boolean) => void,
                                ) => handleFilterSearch(filter, search, loading)
                            "
                        >
                            <template #list-footer>
                                <div
                                    v-if="
                                        filter.multiple &&
                                        selectedFilterObjects[filter.key]
                                            ?.length
                                    "
                                    class="mt-1 border-t border-gray-200 pt-1 dark:border-gray-700"
                                >
                                    <div
                                        class="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-gray-400 dark:text-neutral-400 uppercase"
                                    >
                                        {{ resolveLabel('ui-builder.selected_items') }}
                                    </div>
                                    <div
                                        v-for="opt in selectedFilterObjects[
                                            filter.key
                                        ]"
                                        :key="
                                            opt.value !== undefined
                                                ? opt.value
                                                : opt.id
                                        "
                                        class="group flex cursor-pointer items-center justify-between px-3 py-1.5 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                                        @mousedown.stop.prevent="
                                            removeOption(filter.key, opt)
                                        "
                                    >
                                        <div class="flex items-center gap-2">
                                            <Check
                                                class="h-3.5 w-3.5 text-blue-500"
                                            />
                                            <span class="text-sm">
                                                {{
                                                    getFilterOptionLabel(
                                                        filter,
                                                        opt,
                                                    )
                                                }}
                                            </span>
                                        </div>
                                        <div
                                            class="flex h-7 w-7 items-center justify-center rounded-md transition-colors group-hover:bg-red-100 dark:group-hover:bg-red-900/40"
                                        >
                                            <X
                                                class="h-4 w-4 text-red-500 opacity-80 transition-opacity group-hover:opacity-100"
                                                :stroke-width="2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <template #placeholder>
                                <div
                                    class="pointer-events-none flex h-full items-center justify-start gap-2 overflow-hidden opacity-60"
                                >
                                    <component
                                        v-if="filter.icon"
                                        :is="filter.icon"
                                        :class="`h-4 w-4 flex-shrink-0 ${theme.paginationText}`"
                                    />
                                    <span class="inline text-sm">{{
                                        resolveLabel(
                                            filter.placeholder || filter.label,
                                        )
                                    }}</span>
                                </div>
                            </template>
                            <template #search="{ attributes, events }">
                                <div
                                    class="relative flex h-full w-full items-center justify-start gap-2 overflow-hidden rounded-sm"
                                >
                                    <!-- Search Icon: Always show if searching or if multiple -->
                                    <component
                                        v-if="filter.icon"
                                        :is="filter.icon"
                                        :class="`h-4 w-4 shrink-0 text-slate-600 dark:text-slate-400 ${theme.paginationText}`"
                                        v-show="
                                            filter.multiple ||
                                            !customFilterValuesLocal[
                                                filter.key
                                            ] ||
                                            attributes.placeholder ||
                                            focusedFilters[filter.key]
                                        "
                                    />

                                    <Badge
                                        v-if="
                                            filter.multiple &&
                                            selectedFilterObjects[filter.key] &&
                                            selectedFilterObjects[filter.key]
                                                .length > 0
                                        "
                                        variant="secondary"
                                        class="ml-0.5 flex h-[18px] items-center justify-center rounded px-1.5 py-0 text-[10px]"
                                        :style="{
                                            backgroundColor:
                                                'var(--vs-tag-bg, var(--vs-highlight-bg, #f1f5f9))',
                                            color: 'var(--vs-tag-fg, var(--vs-tag-color, #0f172a))',
                                        }"
                                    >
                                        {{
                                            selectedFilterObjects[filter.key]
                                                .length
                                        }}
                                    </Badge>

                                    <input
                                        class="vs__search !m-0 min-w-0 flex-grow !border-none !bg-transparent !p-0 !shadow-none outline-none focus:ring-0"
                                        v-bind="attributes"
                                        :placeholder="
                                            focusedFilters[filter.key]
                                                ? t('ui-builder.start_typing')
                                                : attributes.placeholder
                                        "
                                        v-on="events"
                                    />
                                </div>
                            </template>

                            <template #selected-option="option">
                                <div
                                    class="pointer-events-none flex h-full items-center justify-start gap-2 overflow-hidden"
                                    :class="theme.badgeText"
                                >
                                    <component
                                        v-if="option.icon || filter.icon"
                                        :is="option.icon || filter.icon"
                                        :class="`h-4 w-4 flex-shrink-0 ${theme.paginationText}`"
                                    />
                                    <span
                                        v-if="filter.ajaxConfig?.renderOption"
                                        v-html="
                                            filter.ajaxConfig.renderOption(
                                                option,
                                            )
                                        "
                                    ></span>
                                    <span v-else>{{
                                        typeof option === 'object' &&
                                        option !== null
                                            ? (() => {
                                                  const labelKey =
                                                      filter.ajaxConfig
                                                          ?.labelKey;
                                                  if (
                                                      typeof labelKey ===
                                                      'function'
                                                  ) {
                                                      return labelKey(option);
                                                  }
                                                  return (
                                                      option.label ||
                                                      option[
                                                          labelKey || 'label'
                                                      ] ||
                                                      option.name ||
                                                      option.value
                                                  );
                                              })()
                                            : String(option)
                                    }}</span>
                                </div>
                            </template>
                            <template #option="option">
                                <div
                                    v-if="filter.ajaxConfig?.renderOption"
                                    v-html="
                                        filter.ajaxConfig.renderOption(option)
                                    "
                                ></div>
                                <div v-else class="flex flex-col">
                                    <span>{{
                                        typeof option === 'object' &&
                                        option !== null
                                            ? (() => {
                                                  const labelKey =
                                                      filter.ajaxConfig
                                                          ?.labelKey;
                                                  if (
                                                      typeof labelKey ===
                                                      'function'
                                                  ) {
                                                      return labelKey(option);
                                                  }
                                                  return (
                                                      option.label ||
                                                      option[
                                                          labelKey || 'label'
                                                      ] ||
                                                      option.name ||
                                                      option.value
                                                  );
                                              })()
                                            : String(option)
                                    }}</span>
                                </div>
                            </template>
                            <template #open-indicator>
                                <div
                                    class="flex h-full items-center justify-center p-1"
                                >
                                    <ChevronDown
                                        class="h-4 w-4 flex-shrink-0 opacity-50"
                                    />
                                </div>
                            </template>
                            <template #clear="{ deselect }">
                                <div
                                    class="z-[10] flex cursor-pointer items-center justify-center p-1"
                                    @click.stop="deselect"
                                >
                                    <X
                                        class="h-3.5 w-3.5 text-slate-500 dark:text-neutral-400 transition-colors hover:text-rose-500"
                                        :stroke-width="1"
                                    />
                                </div>
                            </template>
                            <template #no-options="{ search, searching }">
                                <div
                                    v-if="loadingFilters[filter.key]"
                                    :class="[
                                        'relative z-[50] flex flex-col justify-start overflow-hidden rounded-md text-left',
                                        theme.tableMenuBackground ||
                                            'bg-white dark:bg-gray-900',
                                        '!bg-white dark:!bg-gray-950',
                                    ]"
                                >
                                    <div class="w-full">
                                        <div
                                            v-for="(width, index) in [
                                                60, 40, 75, 50, 80,
                                            ]"
                                            :key="index"
                                            class="flex h-[42px] flex-col justify-center gap-1.5 border-b border-gray-100 px-3 py-2 last:border-b-0 dark:border-gray-800"
                                        >
                                            <div
                                                :class="[
                                                    'h-3 animate-pulse rounded',
                                                    theme.badgeBackground ||
                                                        'bg-gray-100 dark:bg-gray-800',
                                                ]"
                                                :style="{ width: `${width}%` }"
                                            ></div>
                                            <div
                                                v-if="index % 2 === 0"
                                                :class="[
                                                    'h-2 w-1/3 animate-pulse rounded opacity-50',
                                                    theme.badgeBackground ||
                                                        'bg-gray-100 dark:bg-gray-800',
                                                ]"
                                            ></div>
                                        </div>
                                    </div>
                                    <div
                                        class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] dark:bg-gray-950/60"
                                    >
                                        <div class="relative mb-3 h-10 w-10">
                                            <div
                                                :class="[
                                                    'absolute inset-0 animate-spin rounded-full border-[3px] border-t-transparent opacity-20',
                                                    theme.loadingText ||
                                                        'text-blue-600',
                                                ]"
                                                style="animation-duration: 3s"
                                            ></div>
                                            <div
                                                :class="[
                                                    'absolute inset-0 animate-spin rounded-full border-[3px] border-r-transparent border-b-transparent border-l-transparent',
                                                    theme.loadingText ||
                                                        'text-blue-600',
                                                ]"
                                                style="animation-duration: 0.8s"
                                            ></div>
                                            <div
                                                class="absolute inset-0 flex items-center justify-center"
                                            >
                                                <div
                                                    :class="[
                                                        'h-1.5 w-1.5 animate-pulse rounded-full',
                                                        theme.loadingText ||
                                                            'bg-blue-600',
                                                    ]"
                                                ></div>
                                            </div>
                                        </div>
                                        <span
                                            :class="[
                                                'text-xs font-bold tracking-tight',
                                                theme.tableTextPrimary ||
                                                    'text-gray-900 dark:text-gray-100',
                                            ]"
                                            >{{ resolveLabel('ui-builder.fetching_results') }}</span
                                        >
                                    </div>
                                </div>
                                <div
                                    v-else-if="searching"
                                    :class="[
                                        'flex flex-col items-center justify-center gap-3 px-4 py-14 text-center',
                                        theme.tableMenuBackground ||
                                            'bg-white dark:bg-gray-900',
                                        'rounded-md',
                                    ]"
                                >
                                    <div
                                        :class="[
                                            'rounded-full p-3',
                                            theme.headerBackground ||
                                                'bg-gray-100 dark:bg-gray-800',
                                        ]"
                                    >
                                        <SearchX class="h-8 w-8 opacity-40" />
                                    </div>
                                    <div class="space-y-1">
                                        <p
                                            :class="[
                                                'text-sm font-bold',
                                                theme.tableTextPrimary ||
                                                    'text-gray-900 dark:text-gray-100',
                                            ]"
                                        >
                                            {{ resolveLabel('ui-builder.no_matches_found') }}
                                        </p>
                                        <p
                                            :class="[
                                                'max-w-[200px] text-xs leading-relaxed',
                                                theme.tableTextSecondary ||
                                                    'text-gray-500 dark:text-neutral-400',
                                            ]"
                                        >
                                            <span class="font-semibold text-current italic">"{{ search }}"</span> {{ resolveLabel('ui-builder.try_different_term') }}
                                        </p>
                                    </div>
                                </div>
                                <div v-else class="hidden"></div>
                            </template>
                            <template #spinner="{ loading }">
                                <div
                                    v-if="
                                        (loading ||
                                            loadingFilters[filter.key]) &&
                                        ((dynamicFilterOptions[filter.key]
                                            ?.length ?? 0) > 0 ||
                                            (filter.options?.length ?? 0) > 0)
                                    "
                                    class="p-1"
                                >
                                    <RefreshCw
                                        :class="`h-4 w-4 animate-spin ${theme.loadingText || 'text-blue-600'}`"
                                    />
                                </div>
                            </template>
                            <template #list-header>
                                <div
                                    v-if="
                                        loadingFilters[filter.key] &&
                                        ((dynamicFilterOptions[filter.key]
                                            ?.length ?? 0) > 0 ||
                                            (filter.options?.length ?? 0) > 0)
                                    "
                                    class="sticky top-0 z-[60]"
                                >
                                    <div
                                        class="absolute inset-0 min-h-[50px] overflow-hidden rounded-md bg-white/40 backdrop-blur-[1px] dark:bg-gray-950/40"
                                    >
                                        <div
                                            class="flex h-full w-full flex-col items-center justify-center gap-1.5 py-4"
                                        >
                                            <div class="relative h-6 w-6">
                                                <div
                                                    :class="[
                                                        'absolute inset-0 animate-spin rounded-full border-[2px] border-t-transparent opacity-20',
                                                        theme.loadingText ||
                                                            'text-blue-600',
                                                    ]"
                                                ></div>
                                                <div
                                                    :class="[
                                                        'absolute inset-0 flex items-center justify-center',
                                                        theme.loadingText ||
                                                            'text-blue-600',
                                                    ]"
                                                >
                                                    <RefreshCw
                                                        class="h-3.5 w-3.5 animate-spin"
                                                    />
                                                </div>
                                            </div>
                                            <span
                                                :class="[
                                                    'font-bold tracking-[0.2em] uppercase',
                                                    theme.tableTextSecondary ||
                                                        'text-gray-500 dark:text-neutral-400',
                                                ]"
                                                style="font-size: 9px"
                                                >{{ resolveLabel('ui-builder.updating_filter') }}</span
                                            >
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </v-select>

                        <Select
                            v-else
                            v-model="customFilterValuesLocal[filter.key]"
                            @update:model-value="
                                handleCustomFilterChange(filter.key)
                            "
                        >
                            <SelectTrigger
                                :class="[
                                    controlHeightTextClass,
                                    `flex items-center justify-between rounded-md border px-3 text-left font-medium shadow-sm ${theme.inputBackground} ${theme.inputBorder} ${theme.badgeText}`,
                                ]"
                            >
                                <div class="flex items-center gap-2">
                                    <component
                                        v-if="filter.icon"
                                        :is="filter.icon"
                                        :class="`mt-0.5 h-4 w-4 flex-shrink-0 ${theme.paginationText}`"
                                    />
                                    <span
                                        v-if="
                                            !filter.hideLabelOnSelect &&
                                            customFilterValuesLocal[filter.key]
                                        "
                                        class="inline"
                                    >
                                        {{ resolveLabel(filter.placeholder || filter.label) }}
                                    </span>
                                    <SelectValue
                                        :placeholder="
                                            resolveLabel(filter.placeholder || filter.label)
                                        "
                                    />
                                </div>
                            </SelectTrigger>
                            <SelectContent
                                :class="`border ${theme.inputBackground} ${theme.inputBorder} ${theme.badgeText}`"
                            >
                                <SelectItem
                                    v-for="option in filter.options"
                                    :key="option.value"
                                    :value="option.value"
                                    :class="`focus:${theme.badgeBackground} focus:${theme.badgeText}`"
                                >
                                    {{ resolveLabel(option.label) }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </template>
        </div>

        <!-- Export Buttons (positioned next to Filters, styled like a Filter dropdown or buttons) -->
        <div
            v-if="
                exportConfig.enabled !== false &&
                exportConfig.position === 'filterBar'
            "
            :class="[
                exportConfig.align === 'right' &&
                !(filterConfig?.align === 'right' && customFilters?.length)
                    ? 'ml-auto'
                    : '',
                filterConfig?.align === 'right' && exportConfig.align === 'left'
                    ? 'order-3'
                    : 'order-4',
            ]"
        >
            <div
                v-if="exportConfig.showAsDropdown"
                :class="['flex items-center', gapClass]"
            >
                <template v-if="exportConfig.printPosition === 'first'">
                    <Button
                        v-if="exportConfig.print"
                        variant="outline"
                        :class="`flex h-9 items-center gap-2 border px-3 text-left font-medium shadow-sm transition-all focus:border-[var(--focus-theme-color)]! focus:ring-0 ${theme.inputBackground} ${theme.inputBorder || 'border-gray-200 dark:border-white/15'} ${theme.badgeText}`"
                        :disabled="
                            exportConfig.activeOnlyOnData &&
                            (!props.data || props.data.length === 0)
                        "
                        @click="exportTo('print')"
                        :title="t('ui-builder.print')"
                    >
                        <Printer class="h-4 w-4 opacity-70" />
                        <span>{{ t('ui-builder.print') }}</span>
                    </Button>
                </template>

                <!-- Dropdown for the rest (PDF, Excel, CSV) when disabled -->
                <Button
                    v-if="
                        exportConfig.activeOnlyOnData &&
                        (!props.data || props.data.length === 0)
                    "
                    variant="outline"
                    disabled
                    :class="`flex h-9 items-center gap-2 border px-3 text-left font-medium shadow-sm transition-all focus:border-[var(--focus-theme-color)]! focus:ring-0 ${theme.inputBackground} ${theme.inputBorder || 'border-gray-200 dark:border-white/15'} ${theme.badgeText}`"
                >
                    <Download class="h-4 w-4 opacity-70" />
                    <span>{{ t('ui-builder.export') }}</span>
                    <ChevronDown class="ms-1 h-4 w-4 opacity-50" />
                </Button>

                <!-- Dropdown for the rest (PDF, Excel, CSV, JSON) when enabled -->
                <DropdownMenu
                    v-else-if="
                        exportConfig.pdf ||
                        exportConfig.excel ||
                        exportConfig.csv ||
                        exportConfig.json ||
                        exportActions.length
                    "
                >
                    <DropdownMenuTrigger as-child>
                        <Button
                            variant="outline"
                            :class="`flex h-9 items-center gap-2 border px-3 text-left font-medium shadow-sm transition-all focus:border-[var(--focus-theme-color)]! focus:ring-0 ${theme.inputBackground} ${theme.inputBorder || 'border-gray-200 dark:border-white/15'} ${theme.badgeText}`"
                        >
                            <Download class="h-4 w-4 opacity-70" />
                            <span>{{ t('ui-builder.export') }}</span>
                            <ChevronDown class="ms-1 h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        :class="
                            cn(
                                'w-36 border',
                                theme.inputBackground,
                                theme.inputBorder,
                                theme.badgeText,
                            )
                        "
                        :collision-padding="8"
                    >
                        <DropdownMenuItem
                            v-if="exportConfig.pdf"
                            @click="exportTo('pdf')"
                            :class="`flex cursor-pointer items-center gap-2 focus:${theme.badgeBackground} focus:${theme.badgeText}`"
                        >
                            <FileText
                                class="h-4 w-4 text-red-600 dark:text-red-400"
                            />
                            <span>{{ t('ui-builder.pdf') }}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            v-if="exportConfig.excel"
                            @click="exportTo('excel')"
                            :class="`flex cursor-pointer items-center gap-2 focus:${theme.badgeBackground} focus:${theme.badgeText}`"
                        >
                            <FileSpreadsheet
                                class="h-4 w-4 text-green-600 dark:text-green-400"
                            />
                            <span>{{ t('ui-builder.excel') }}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            v-if="exportConfig.csv"
                            @click="exportTo('csv')"
                            :class="`flex cursor-pointer items-center gap-2 focus:${theme.badgeBackground} focus:${theme.badgeText}`"
                        >
                            <Table
                                class="h-4 w-4 text-blue-600 dark:text-blue-400"
                            />
                            <span>{{ t('ui-builder.csv') }}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            v-if="exportConfig.json"
                            @click="exportTo('json')"
                            :class="`flex cursor-pointer items-center gap-2 focus:${theme.badgeBackground} focus:${theme.badgeText}`"
                        >
                            <FileJson
                                class="h-4 w-4 text-amber-600 dark:text-amber-400"
                            />
                            <span>{{ t('ui-builder.json') }}</span>
                        </DropdownMenuItem>
                        <template v-if="exportActions.length">
                            <DropdownMenuSeparator />
                            <DropdownMenuItem v-for="action in exportActions" :key="action.key" @click="emit('exportAction', action)" :class="`flex cursor-pointer items-center gap-2 focus:${theme.badgeBackground} focus:${theme.badgeText}`">
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
                        :class="`flex h-9 items-center gap-2 border px-3 text-left font-medium shadow-sm transition-all focus:border-[var(--focus-theme-color)]! focus:ring-0 ${theme.inputBackground} ${theme.inputBorder || 'border-gray-200 dark:border-white/15'} ${theme.badgeText}`"
                        :disabled="
                            exportConfig.activeOnlyOnData &&
                            (!props.data || props.data.length === 0)
                        "
                        @click="exportTo('print')"
                        :title="t('ui-builder.print')"
                    >
                        <Printer class="h-4 w-4 opacity-70" />
                        <span>{{ t('ui-builder.print') }}</span>
                    </Button>
                </template>
            </div>

            <div v-else :class="['flex flex-wrap items-center', gapClass]">
                <template v-if="!exportConfig.showAsGroup">
                    <Button
                        v-if="exportConfig.pdf"
                        variant="ghost"
                        size="icon"
                        :class="
                            cn(
                                'h-9 w-9 border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                theme.inputBackground ||
                                    'dark:bg-gray-855 bg-white',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-700',
                            )
                        "
                        :disabled="
                            exportConfig.activeOnlyOnData &&
                            (!props.data || props.data.length === 0)
                        "
                        :title="t('ui-builder.export_pdf')"
                        @click="exportTo('pdf')"
                    >
                        <FileText class="h-5 w-5 opacity-70" />
                    </Button>
                    <Button
                        v-if="exportConfig.excel"
                        variant="ghost"
                        size="icon"
                        :class="
                            cn(
                                'h-9 w-9 border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                theme.inputBackground ||
                                    'dark:bg-gray-855 bg-white',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-700',
                            )
                        "
                        :disabled="
                            exportConfig.activeOnlyOnData &&
                            (!props.data || props.data.length === 0)
                        "
                        :title="t('ui-builder.export_excel')"
                        @click="exportTo('excel')"
                    >
                        <FileSpreadsheet class="h-5 w-5 opacity-70" />
                    </Button>
                    <Button
                        v-if="exportConfig.csv"
                        variant="ghost"
                        size="icon"
                        :class="
                            cn(
                                'h-9 w-9 border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                theme.inputBackground ||
                                    'dark:bg-gray-855 bg-white',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-700',
                            )
                        "
                        :disabled="
                            exportConfig.activeOnlyOnData &&
                            (!props.data || props.data.length === 0)
                        "
                        :title="t('ui-builder.export_csv')"
                        @click="exportTo('csv')"
                    >
                        <Table class="h-5 w-5 opacity-70" />
                    </Button>
                    <Button
                        v-if="exportConfig.json"
                        variant="ghost"
                        size="icon"
                        :class="
                            cn(
                                'h-9 w-9 border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                theme.inputBackground ||
                                    'dark:bg-gray-855 bg-white',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-700',
                            )
                        "
                        :disabled="
                            exportConfig.activeOnlyOnData &&
                            (!props.data || props.data.length === 0)
                        "
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
                        :class="
                            cn(
                                'h-9 w-9 border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                theme.inputBackground ||
                                    'dark:bg-gray-855 bg-white',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-700',
                            )
                        "
                        :title="resolveLabel(action.label)"
                        @click="emit('exportAction', action)"
                    >
                        <component :is="action.icon || Mail" class="h-5 w-5 opacity-70" />
                    </Button>
                    <Button
                        v-if="exportConfig.print"
                        variant="ghost"
                        size="icon"
                        :class="
                            cn(
                                'h-9 w-9 border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                theme.inputBackground ||
                                    'dark:bg-gray-855 bg-white',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-700',
                            )
                        "
                        :disabled="
                            exportConfig.activeOnlyOnData &&
                            (!props.data || props.data.length === 0)
                        "
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
                            :class="
                                cn(
                                    'h-9 w-9 border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                    theme.inputBackground ||
                                        'dark:bg-gray-850 bg-white',
                                    theme.inputBorder ||
                                        'border-gray-200 dark:border-gray-700',
                                )
                            "
                            :disabled="
                                exportConfig.activeOnlyOnData &&
                                (!props.data || props.data.length === 0)
                            "
                            :title="t('ui-builder.print')"
                            @click="exportTo('print')"
                        >
                            <Printer class="h-5 w-5 opacity-70" />
                        </Button>
                    </template>

                    <div
                        v-if="
                            exportConfig.pdf ||
                            exportConfig.excel ||
                            exportConfig.csv ||
                            exportConfig.json ||
                        exportActions.length
                        "
                        class="flex items-center overflow-hidden rounded-md border"
                        :class="[
                            theme.inputBorder ||
                                'border-gray-200 dark:border-gray-700',
                            theme.inputBackground ||
                                'dark:bg-gray-850 bg-white',
                        ]"
                    >
                        <Button
                            v-if="exportConfig.pdf"
                            variant="ghost"
                            size="icon"
                            :class="[
                                'h-9 w-9 rounded-none border-0 border-r transition-colors last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-700',
                            ]"
                            :disabled="
                                exportConfig.activeOnlyOnData &&
                                (!props.data || props.data.length === 0)
                            "
                            :title="t('ui-builder.export_pdf')"
                            @click="exportTo('pdf')"
                        >
                            <FileText class="h-5 w-5 opacity-70" />
                        </Button>
                        <Button
                            v-if="exportConfig.excel"
                            variant="ghost"
                            size="icon"
                            :class="[
                                'h-9 w-9 rounded-none border-0 border-r transition-colors last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-700',
                            ]"
                            :disabled="
                                exportConfig.activeOnlyOnData &&
                                (!props.data || props.data.length === 0)
                            "
                            :title="t('ui-builder.export_excel')"
                            @click="exportTo('excel')"
                        >
                            <FileSpreadsheet class="h-5 w-5 opacity-70" />
                        </Button>
                        <Button
                            v-if="exportConfig.csv"
                            variant="ghost"
                            size="icon"
                            :class="[
                                'h-9 w-9 rounded-none border-0 border-r transition-colors last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-700',
                            ]"
                            :disabled="
                                exportConfig.activeOnlyOnData &&
                                (!props.data || props.data.length === 0)
                            "
                            :title="t('ui-builder.export_csv')"
                            @click="exportTo('csv')"
                        >
                            <Table class="h-5 w-5 opacity-70" />
                        </Button>
                        <Button
                            v-if="exportConfig.json"
                            variant="ghost"
                            size="icon"
                            :class="[
                                'h-9 w-9 rounded-none border-0 border-r transition-colors last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-700',
                            ]"
                            :disabled="
                                exportConfig.activeOnlyOnData &&
                                (!props.data || props.data.length === 0)
                            "
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
                            :class="[
                                'h-9 w-9 rounded-none border-0 border-r transition-colors last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-700',
                            ]"
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
                            :class="
                                cn(
                                    'h-9 w-9 border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40',
                                    theme.inputBackground ||
                                        'dark:bg-gray-855 bg-white',
                                    theme.inputBorder ||
                                        'border-gray-200 dark:border-gray-700',
                                )
                            "
                            :disabled="
                                exportConfig.activeOnlyOnData &&
                                (!props.data || props.data.length === 0)
                            "
                            :title="t('ui-builder.print')"
                            @click="exportTo('print')"
                        >
                            <Printer class="h-5 w-5 opacity-70" />
                        </Button>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { resolveLabel } from '../../i18n';
import { useUiI18n } from '../../i18n';
import { cn } from '../../lib/utils';
import { csrfHeaders } from '../../lib/http';
import {
    CalendarIcon,
    Check,
    ChevronDown,
    Download,
    FileJson,
    Mail,
    FileSpreadsheet,
    FileText,
    ListFilter,
    Palette,
    Printer,
    RefreshCw,
    RotateCcw,
    SearchX,
    Table,
    X,
} from '@lucide/vue';
import { format } from 'date-fns';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import vSelect from 'vue-select';
// CSS is loaded via FormField.vue global block to remove legacy vendor prefixes
import {
    getThemeHex,
    getThemeTagTextColor,
    PREBUILT_THEMES,
} from '../../composables/themes';
import type {
    ColumnConfig,
    CustomFilter,
    DateRangeState,
    ExportFormat,
    ModuleConfig,
    ThemeConfig,
} from '../../types/module';
import { normalizeExportConfig } from '../../utils/exportUtils';
import { Badge } from '../../primitives/badge';
import { Button } from '../../primitives/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../primitives/dropdown-menu';
import { Input } from '../../primitives/input';
import { Label } from '../../primitives/label';
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

interface Props {
    /** Extra Export-menu entries the module configured (exportConfig.customActions), already permission-filtered. */
    exportActions?: any[];
    hasStatusFilter: boolean;
    statusFilter: string;
    enableDateFilter?: boolean;
    dateRange: DateRangeState;
    customFilters?: CustomFilter[];
    customFilterValues: Record<string, any>;
    filterConfig?: {
        group?: boolean;
        groupTitle?: string;
        align?: 'left' | 'right';
    };
    enableThemeSelector?: boolean;
    selectedTheme?: string;
    density?: 'compact' | 'normal' | 'relaxed';
    theme: Partial<ThemeConfig>;
    config?: ModuleConfig;
    columns?: ColumnConfig[];
    data?: any[];
    visibleColumns?: string[];
}

const props = withDefaults(defineProps<Props>(), {
    exportActions: () => [],
    enableDateFilter: false,
    customFilters: () => [],
    enableThemeSelector: false,
    selectedTheme: 'default',
    density: 'normal',
    columns: () => [],
    data: () => [],
    visibleColumns: () => [],
});

const emit = defineEmits<{
    exportAction: [action: any];
    statusChange: [status: string];
    dateRangeChange: [range: DateRangeState];
    customFilterChange: [key: string, value: string];
    themeChange: [theme: string];
    densityChange: [density: 'compact' | 'normal' | 'relaxed'];
    export: [format: ExportFormat];
}>();

const { t } = useUiI18n();

const translatableThemeKeys = new Set([
    'default',
    'blue',
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
    'slate',
    'zinc',
    'stone',
    'neutral',
    'lime',
    'amber',
    'violet',
    'fuchsia',
    'sky',
]);

const statusFilterLocal = ref(props.statusFilter);
const isDatePickerOpen = ref(false);
const isFilterGroupOpen = ref(false);
const dateFromLocal = ref('');
const dateToLocal = ref('');
const customFilterValuesLocal = reactive({ ...props.customFilterValues });
const selectedThemeLocal = ref(props.selectedTheme);
const selectedDensityLocal = ref(props.density);

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

    // If showAsDropdown is not explicitly set:
    // - In filterBar, it defaults to true (dropdown) UNLESS showAsGroup is explicitly set to false (in which case it shows individual buttons).
    // - In table, it defaults to false (buttons).
    let defaultShowAsDropdown = resolvedPosition === 'filterBar';
    if (
        props.config.exportConfig.showAsDropdown === undefined &&
        props.config.exportConfig.ui?.asDropdown === undefined
    ) {
        if (resolvedPosition === 'filterBar') {
            defaultShowAsDropdown = normalized.showAsGroup !== false;
        } else {
            defaultShowAsDropdown = false;
        }
    } else {
        defaultShowAsDropdown = normalized.showAsDropdown;
    }

    // Default align logic: if align is not set, default to right
    let defaultAlign: 'left' | 'right' = 'right';
    if (
        props.config.exportConfig.align !== undefined ||
        props.config.exportConfig.ui?.align !== undefined
    ) {
        defaultAlign = normalized.align;
    } else if (
        props.filterConfig?.align === 'right' &&
        !props.customFilters?.length
    ) {
        defaultAlign = 'right';
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

const dynamicFilterOptions = reactive<Record<string, any[]>>({});
const loadingFilters = reactive<Record<string, boolean>>({});
const focusedFilters = reactive<Record<string, boolean>>({});
const selectedFilterObjects = reactive<Record<string, any>>({}); // ✅ Cache full objects for display
let debounceTimer: any = null;

const defaultTheme: ThemeConfig = {
    inputBackground: 'bg-white dark:bg-gray-800',
    inputBorder: 'border-gray-300 dark:border-gray-700',
    inputText: 'text-gray-900 dark:text-gray-100',
    labelText: 'text-gray-700 dark:text-gray-300',
    primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondaryButton:
        'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100',
    paginationText: 'text-gray-500 dark:text-gray-400',
    cardBackground: 'bg-white dark:bg-gray-800',
    cardBorder: 'border-gray-200 dark:border-gray-700',
    errorText: 'text-red-600',
    errorBorder: 'border-red-500',
    errorBackground: 'bg-red-50 dark:bg-red-500/10',
    errorBorderColor: 'border-red-200 dark:border-red-500/25',
    headerBackground: 'bg-gray-50 dark:bg-gray-950',
    headerText: 'text-gray-900 dark:text-gray-100',
    paginationButton:
        'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-950',
    paginationActiveButton:
        'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
    badgeBackground: 'bg-gray-100 dark:bg-gray-900',
    badgeText: 'text-gray-800 dark:text-gray-200',
    tableBackground: 'bg-white dark:bg-gray-900',
    tableBorder: 'border-gray-200 dark:border-gray-800',
    tableHeaderBackground: 'bg-gray-50 dark:bg-gray-950',
    tableHeaderText: 'text-gray-900 dark:text-gray-100',
    tableRowHover: 'hover:bg-gray-50 dark:hover:bg-gray-950/50',
    tableRowBorder: 'border-gray-100 dark:border-gray-900',
    tableTextPrimary: 'text-gray-900 dark:text-gray-100',
    tableTextSecondary: 'text-gray-700 dark:text-gray-300',
    tableToolbarBackground: 'bg-gray-50 dark:bg-gray-950',
    tableToolbarBorder: 'border-gray-200 dark:border-gray-800',
};

const theme = computed(() => ({ ...defaultTheme, ...props.theme }));

const shouldShow = computed(
    () =>
        props.enableThemeSelector ||
        props.hasStatusFilter ||
        props.enableDateFilter ||
        (props.customFilters?.length ?? 0) > 0 ||
        (exportConfig.value.enabled !== false &&
            exportConfig.value.position === 'filterBar'),
);

const themeColorMap: Record<string, string> = {
    default: 'bg-gray-500',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500',
    zinc: 'bg-zinc-500',
    stone: 'bg-stone-500',
    neutral: 'bg-neutral-500',
    lime: 'bg-lime-500',
    amber: 'bg-amber-500',
    violet: 'bg-violet-500',
    fuchsia: 'bg-fuchsia-500',
    sky: 'bg-sky-500',
    modern: 'bg-gradient-to-r from-blue-500 to-purple-500',
    modern1: 'bg-gradient-to-r from-blue-400 to-cyan-400',
    modern2: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500',
    modern3: 'bg-gradient-to-r from-slate-400 to-blue-500',
    modern4: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
};

const getThemeColor = (themeName: string): string => {
    return themeColorMap[themeName] || 'bg-gray-500';
};

if (props.dateRange.from) {
    dateFromLocal.value = format(props.dateRange.from, 'yyyy-MM-dd');
}
if (props.dateRange.to) {
    dateToLocal.value = format(props.dateRange.to, 'yyyy-MM-dd');
}

watch(
    () => props.statusFilter,
    (newValue) => {
        statusFilterLocal.value = newValue;
    },
);

watch(
    () => props.selectedTheme,
    (newValue) => {
        selectedThemeLocal.value = newValue || 'default';
    },
);

watch(
    () => props.density,
    (newValue) => {
        selectedDensityLocal.value = newValue || 'normal';
    },
);

watch(
    () => props.customFilterValues,
    (newValue) => {
        // ✅ Sync local filter values
        // First, handle keys that were removed or cleared in the parent
        Object.keys(customFilterValuesLocal).forEach((key) => {
            if (!newValue || !(key in newValue)) {
                const filter = props.customFilters?.find((f) => f.key === key);
                if (filter) {
                    customFilterValuesLocal[key] = filter.multiple ? [] : '';
                } else {
                    delete customFilterValuesLocal[key];
                }
            }
        });

        // Then apply new values
        if (newValue) {
            Object.assign(customFilterValuesLocal, newValue);
        }

        // ✅ Sync selectedFilterObjects: clear entries for keys that are now empty
        props.customFilters?.forEach((filter) => {
            const val = customFilterValuesLocal[filter.key];
            const isEmpty =
                val === undefined ||
                val === null ||
                val === '' ||
                val === 'all' ||
                (Array.isArray(val) && val.length === 0);

            if (isEmpty) {
                selectedFilterObjects[filter.key] = filter.multiple ? [] : null;
            } else if (
                filter.type === 'vue-select' &&
                filter.ajaxConfig &&
                (!selectedFilterObjects[filter.key] ||
                    (Array.isArray(selectedFilterObjects[filter.key]) &&
                        selectedFilterObjects[filter.key].length === 0))
            ) {
                // ✅ Auto-hydrate if we have a value but no label object
                const searchStr = Array.isArray(val)
                    ? val.join(',')
                    : String(val);
                handleFilterSearch(
                    filter,
                    searchStr,
                    (s) => {
                        loadingFilters[filter.key] = s;
                    },
                    true,
                );
            }
        });
    },
    { deep: true, immediate: true },
);

const activeFiltersCount = computed(() => {
    // A filter flagged countAsFilter: false is the screen's context (e.g. a required branch), not something
    // the user applied — don't let it inflate the badge to a permanent "1".
    const noCount = new Set((props.customFilters ?? []).filter((f) => f.countAsFilter === false).map((f) => f.key));
    return Object.entries(props.customFilterValues).filter(([key, val]) => {
        if (noCount.has(key)) return false;
        if (Array.isArray(val)) return val.length > 0;
        return val !== null && val !== '' && val !== 'all';
    }).length;
});

const clearAllCustomFilters = () => {
    props.customFilters.forEach((filter) => {
        const defaultValue = filter.multiple ? [] : filter.defaultValue || '';
        customFilterValuesLocal[filter.key] = defaultValue;
        selectedFilterObjects[filter.key] = filter.multiple ? [] : null;
        emit('customFilterChange', filter.key, defaultValue);
    });
};

const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
};

// The trigger's text: a range inside one year drops the first year ("Nov 1 – Nov 11, 2026") so it fits the box.
const dateRangeLabel = computed(() => {
    const { from, to } = props.dateRange;
    if (from && to) {
        return from.getFullYear() === to.getFullYear()
            ? `${format(from, 'MMM d')} – ${format(to, 'MMM d, yyyy')}`
            : `${format(from, 'MMM d, yyyy')} – ${format(to, 'MMM d, yyyy')}`;
    }
    if (from) return `${formatDate(from)} –`;
    if (to) return `– ${formatDate(to)}`;
    return resolveLabel('ui-builder.date_range');
});

const handleStatusChange = (value: string) => {
    emit('statusChange', value);
};

const handleThemeChange = (value: any) => {
    emit('themeChange', String(value));
};

const handleDensityChange = (value: any) => {
    emit('densityChange', value);
};

const controlHeightTextClass = computed(() => {
    if (props.density === 'compact') return 'h-8 text-xs';
    if (props.density === 'relaxed') return 'h-10 text-base';
    return 'h-9 text-sm';
});

const vueSelectSizeClass = computed(() => {
    if (props.density === 'compact') return 'sm';
    if (props.density === 'relaxed') return 'lg';
    return 'md';
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

const gapClass = computed(() => {
    if (props.density === 'compact') return 'gap-2';
    if (props.density === 'relaxed') return 'gap-4';
    return 'gap-3';
});

const vsVars = computed(() => ({
    '--vs-highlight-bg': getThemeHex(selectedThemeLocal.value),
}));

const handleDateChange = () => {
    const range: DateRangeState = {
        from: dateFromLocal.value ? new Date(dateFromLocal.value) : null,
        to: dateToLocal.value ? new Date(dateToLocal.value) : null,
    };
    emit('dateRangeChange', range);
};

const clearDateRange = () => {
    dateFromLocal.value = '';
    dateToLocal.value = '';
    emit('dateRangeChange', { from: null, to: null });
    isDatePickerOpen.value = false;
};

const getFilterOptionLabel = (filter: any, opt: any) => {
    if (typeof opt === 'object' && opt !== null) {
        const labelKey = filter.ajaxConfig?.labelKey;
        if (typeof labelKey === 'function') {
            return labelKey(opt);
        }
        if (filter.ajaxConfig) {
            return (
                opt.label ||
                opt[labelKey || 'label'] ||
                opt.name ||
                String(opt.value || '')
            );
        }
        return resolveLabel(
            opt.label ||
                opt[labelKey || 'label'] ||
                opt.name ||
                String(opt.value || ''),
        );
    }
    return String(opt);
};

const handleCustomFilterChange = (key: string) => {
    emit('customFilterChange', key, customFilterValuesLocal[key]);
};

const removeOption = (filterKey: string, optionToRemove: any) => {
    const filter = props.customFilters?.find((f) => f.key === filterKey);
    if (!filter) return;

    let objects = selectedFilterObjects[filterKey] || [];
    objects = objects.filter((o: any) => o !== optionToRemove);
    selectedFilterObjects[filterKey] = objects;

    const optVal =
        optionToRemove.value !== undefined
            ? optionToRemove.value
            : optionToRemove.id;
    const values = customFilterValuesLocal[filterKey];
    if (Array.isArray(values)) {
        customFilterValuesLocal[filterKey] = values.filter(
            (v: any) => v !== optVal,
        );
    }

    handleCustomFilterChange(filterKey);
};

const getFilterOptions = (filter: CustomFilter) => {
    const staticOptions = filter.options || [];
    const dynamicOptions = dynamicFilterOptions[filter.key] || [];

    const list = [...dynamicOptions];
    staticOptions.forEach((opt) => {
        if (
            !list.find(
                (o) => (typeof o === 'object' ? o.value : o) == opt.value,
            )
        ) {
            list.push(opt);
        }
    });

    // ✅ NEW: Skip already selected items to avoid confusion
    if (filter.multiple) {
        const selectedIds = customFilterValuesLocal[filter.key] || [];
        return list.filter((opt: any) => {
            const val =
                typeof opt === 'object'
                    ? opt.value !== undefined
                        ? opt.value
                        : opt.id
                    : opt;
            return Array.isArray(selectedIds)
                ? !selectedIds.includes(val)
                : selectedIds != val;
        });
    }

    return list;
};

const getSelectedFilterOption = (filter: CustomFilter) => {
    const selectedId = customFilterValuesLocal[filter.key];
    if (!selectedId) return null;

    const options = getFilterOptions(filter);
    const found = options.find(
        (opt) => (typeof opt === 'object' ? opt.value : opt) == selectedId,
    );

    return found || null;
};

const handleFilterSearch = (
    filter: CustomFilter,
    search: string,
    loading: (s: boolean) => void,
    isId: boolean = false,
) => {
    if (!isId && search.trim().length < 1) {
        if (filter.ajaxConfig?.resetOnEmpty !== false) {
            dynamicFilterOptions[filter.key] = [];
        }
        return;
    }

    if (!filter.ajaxConfig) return;

    const execute = async () => {
        // We now allow empty search strings to load initial data
        loading(true);
        loadingFilters[filter.key] = true;
        try {
            const config = filter.ajaxConfig!;
            const method = config.method || 'GET';
            const searchParam = config.searchParam || 'search';
            const resultsPath = config.resultsPath; // No default 'data'
            const labelKey = config.labelKey || 'label';
            const valueKey = config.valueKey || 'value';

            const url = new URL(config.endpoint, window.location.origin);
            const fetchOptions: RequestInit = {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                method: method,
            };

            if (method === 'GET') {
                if (isId) {
                    url.searchParams.append('id', search);
                } else {
                    url.searchParams.append(searchParam, search);
                }
                if (config.params) {
                    Object.entries(config.params).forEach(([key, val]) => {
                        url.searchParams.append(key, val);
                    });
                }
            } else {
                const body: Record<string, any> = { ...config.params };
                if (isId) {
                    body.id = search;
                } else {
                    body[searchParam] = search;
                }
                fetchOptions.body = JSON.stringify(body);
                (fetchOptions.headers as Record<string, string>)[
                    'Content-Type'
                ] = 'application/json';

                Object.assign(
                    fetchOptions.headers as Record<string, string>,
                    csrfHeaders(),
                );
            }

            const response = await fetch(url.toString(), fetchOptions);
            const data = await response.json();

            // Smart response parsing: Try path first, then fallbacks
            let results = resultsPath
                ? resultsPath.split('.').reduce((obj, key) => obj?.[key], data)
                : data;

            // If the resolved "results" isn't an array, try common patterns
            if (!Array.isArray(results)) {
                // If the raw data is an array, use it (overrides incorrect resultsPath)
                if (Array.isArray(data)) {
                    results = data;
                }
                // If data.data exists (common Laravel pattern), use it
                else if (data && Array.isArray(data.data)) {
                    results = data.data;
                }
            }

            if (Array.isArray(results)) {
                const mappedResults = results.map((item) => ({
                    ...item,
                    label:
                        typeof config.labelKey === 'function'
                            ? config.labelKey(item)
                            : item[config.labelKey || 'label'] ||
                              item.label ||
                              item.name,
                    value:
                        item[valueKey] !== undefined ? item[valueKey] : item.id,
                }));

                dynamicFilterOptions[filter.key] = mappedResults;

                // ✅ If there's a selected value, populate the cache
                let selectedVal = customFilterValuesLocal[filter.key];
                if (
                    selectedVal &&
                    filter.multiple &&
                    typeof selectedVal === 'string'
                ) {
                    selectedVal = selectedVal.split(',').filter((v) => v);
                }

                if (
                    selectedVal &&
                    (!selectedFilterObjects[filter.key] ||
                        (Array.isArray(selectedVal) &&
                            selectedFilterObjects[filter.key].length === 0))
                ) {
                    if (filter.multiple || Array.isArray(selectedVal)) {
                        const valArray = Array.isArray(selectedVal)
                            ? selectedVal
                            : [selectedVal];
                        const foundArgs = mappedResults.filter(
                            (opt: any) =>
                                valArray.includes(String(opt.value)) ||
                                valArray.includes(Number(opt.value)),
                        );
                        if (foundArgs.length > 0) {
                            selectedFilterObjects[filter.key] = foundArgs;
                        }
                    } else {
                        const found = mappedResults.find(
                            (opt: any) => opt.value == selectedVal,
                        );
                        if (found) {
                            selectedFilterObjects[filter.key] = found;
                        }
                    }
                }
            } else {
                dynamicFilterOptions[filter.key] = [];
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
            dynamicFilterOptions[filter.key] = [];
        } finally {
            loading(false);
            loadingFilters[filter.key] = false;
        }
    };

    if (isId) {
        execute();
    } else {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(execute, 300);
    }
};

onMounted(() => {
    if (props.customFilters) {
        props.customFilters.forEach((filter) => {
            const val = customFilterValuesLocal[filter.key];
            if (
                filter.type === 'vue-select' &&
                filter.ajaxConfig &&
                val !== undefined &&
                val !== null &&
                val !== '' &&
                (!Array.isArray(val) || val.length > 0)
            ) {
                // Trigger search to load the initial label
                const searchStr = Array.isArray(val)
                    ? val.join(',')
                    : String(val);
                handleFilterSearch(
                    filter,
                    searchStr,
                    (s) => {
                        loadingFilters[filter.key] = s;
                    },
                    true,
                );
            }
        });
    }
});
</script>

<style scoped>
.vue-select-custom :deep(.vs__dropdown-toggle) {
    border: none !important;
    background-color: transparent !important;
    display: flex !important;
    align-items: center !important;
    padding: 0 !important;
    margin: 0 !important;
    height: 100% !important;
}

/* Height must be fixed on the v-select ROOT, not the inner toggle: the root
   carries its own 1px border (box-sizing: border-box), so a pixel height on
   the toggle alone left the root ~2px taller than sibling controls like the
   Status filter's SelectTrigger (h-9) — visibly misaligned box heights in
   the grouped filter popover. The toggle keeps height:100% (set above) so it
   fills whatever height the root is given. */
.vue-select-custom.sm {
    height: 32px;
}

.vue-select-custom.sm :deep(.vs__dropdown-toggle) {
    background-color: transparent;
}

.vue-select-custom.md {
    height: 36px;
}

.vue-select-custom.md :deep(.vs__dropdown-toggle) {
    background-color: transparent;
}

.vue-select-custom.lg {
    height: 40px;
}

.vue-select-custom.lg :deep(.vs__dropdown-toggle) {
    background-color: transparent;
}

.vue-select-custom :deep(.vs__dropdown-menu) {
    background: white;
    border: 1px solid #e2e8f0;
    color: inherit;
    z-index: 1000 !important;
    top: calc(100% + 4px) !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.dark .vue-select-custom :deep(.vs__dropdown-menu) {
    background: #1e293b;
    border-color: #334155;
}

.vue-select-custom :deep(.vs__dropdown-option) {
    color: inherit;
    padding: 6px 10px;
    font-size: 0.875rem;
    text-align: left;
}

.vue-select-custom :deep(.vs__dropdown-option--highlight) {
    background: var(--vs-highlight-bg);
    color: white;
}

.vue-select-custom :deep(.vs__selected-options) {
    padding: 0 10px !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    flex-grow: 1;
    overflow: hidden;
    flex-wrap: wrap;
    gap: 6px;
    height: 100% !important;
    min-height: unset !important;
}

.vue-select-custom.multiple :deep(.vs__selected-options) {
    padding: 2px 10px !important;
}

.vue-select-custom :deep(.vs__actions) {
    padding: 0 10px !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    height: 100% !important;
}

.vue-select-custom .vs__search {
    padding-left: 0;
}

.vue-select-custom :deep(.vs__search) {
    margin: 0 !important;
    padding: 0 !important;
    min-width: 60px;
    border: none !important;
    color: inherit;
    font-size: 0.875rem;
    line-height: 1 !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
}

.vue-select-custom.multiple :deep(.vs__search) {
    min-width: 30px;
}

.vue-select-custom :deep(.vs__search::placeholder) {
    color: inherit;
    opacity: 1;
}

.vue-select-custom :deep(.vs__selected) {
    display: flex !important;
    align-items: center !important;
    position: relative;
    z-index: 1;
    margin: 0 !important;
    padding: 0 !important;
    height: 100% !important;
    border: none !important;
    text-align: left !important;
    justify-content: flex-start !important;
}

/* Badge slot takes over coloring; completely hide original shells in multiple mode to defer to dropdown rendering */
.vue-select-custom.multiple :deep(.vs__selected) {
    display: none !important;
}

/* Allow the outer container (which has the border) to grow when tags warp,
   but its EMPTY-state min-height must still match the fixed height of the
   non-multiple boxes (sm/md/lg above) per density — a single hardcoded
   36px here regardless of density made the Tags filter a different height
   than Brand/Category whenever density was compact/relaxed, and even at
   the default density it wasn't guaranteed to equal the sibling boxes'
   border-box height exactly. */
.vue-select-custom.sm.multiple {
    height: auto !important;
    min-height: 32px;
}

.vue-select-custom.md.multiple {
    height: auto !important;
    min-height: 36px;
}

.vue-select-custom.lg.multiple {
    height: auto !important;
    min-height: 40px;
}

.vue-select-custom.multiple :deep(.vs__dropdown-toggle) {
    height: auto !important;
    flex-wrap: nowrap !important;
    align-items: center;
    padding: 0 !important;
}

.vue-select-custom.sm.multiple :deep(.vs__dropdown-toggle) {
    min-height: 32px;
}

.vue-select-custom.md.multiple :deep(.vs__dropdown-toggle) {
    min-height: 36px;
}

.vue-select-custom.lg.multiple :deep(.vs__dropdown-toggle) {
    min-height: 40px;
}

/* The selected-options container handles the wrapping and scrolling internally */
.vue-select-custom.multiple :deep(.vs__selected-options) {
    flex-wrap: wrap !important;
    max-height: 90px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 2px 0 2px 12px !important;
    scrollbar-width: thin;
    scrollbar-color: rgba(150, 150, 150, 0.4) transparent;
}

.vue-select-custom :deep(.vs__actions) {
    display: flex;
    align-items: center;
    height: 100%;
}

/* Density overrides to ensure margin & padding symmetry */
.density-compact :deep(button),
.density-compact :deep(input),
.density-compact :deep([role='combobox']),
.density-compact :deep(.vue-select-custom:not(.multiple) .vs__dropdown-toggle) {
    height: 32px !important;
    font-size: 0.75rem !important;
}
.density-compact :deep(.vue-select-custom:not(.multiple) .vs__selected) {
    height: 30px !important;
}
.density-compact :deep(.w-9) {
    width: 32px !important;
}

.density-relaxed :deep(button),
.density-relaxed :deep(input),
.density-relaxed :deep([role='combobox']),
.density-relaxed :deep(.vue-select-custom:not(.multiple) .vs__dropdown-toggle) {
    height: 40px !important;
    font-size: 1rem !important;
}
.density-relaxed :deep(.vue-select-custom:not(.multiple) .vs__selected) {
    height: 38px !important;
}
.density-relaxed :deep(.w-9) {
    width: 40px !important;
}
</style>
