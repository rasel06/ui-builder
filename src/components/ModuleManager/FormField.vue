<template>
    <div
        :class="[
            field.showInRow
                ? 'flex flex-row items-center justify-between gap-4'
                : 'space-y-1.5',
            field.type === 'checkbox' && field.showSelectAll
                ? `rounded-lg border p-1 ${theme.cardBorder || 'border-gray-200 dark:border-gray-800'}`
                : '',
        ]"
    >
        <label
            v-if="!['file', 'image', 'avatar'].includes(field.type)"
            :for="
                !['radio', 'vue-select', 'select', 'rich-text', 'checkbox', 'icon-picker'].includes(
                    field.type,
                )
                    ? field.name
                    : undefined
            "
            :class="[
                'flex items-center gap-4 text-[13px] leading-5 font-semibold tracking-tight',
                field.type === 'checkbox' && field.showSelectAll
                    ? `mt-0 justify-between border-b ${theme.inputBorder || 'border-gray-200 dark:border-gray-700'}`
                    : field.showInRow
                      ? 'mb-0 pb-0'
                      : 'mb-0 justify-start',
                field.showInRow ? 'min-w-0 flex-1' : '',
                theme.labelText || 'text-gray-700 dark:text-gray-300',
            ]"
            :style="
                field.showInRow && field.labelWidth
                    ? { width: field.labelWidth, flex: 'none' }
                    : {}
            "
        >
            <span>
                {{ resolveFieldLabel(field) }}

                <span
                    v-if="field.required"
                    :class="theme.errorText || 'text-red-600'"
                >
                    *</span
                >
                <HintTip :text="hintText" />
            </span>

            <span v-if="field.type === 'checkbox' && field.showSelectAll">
                <input
                    ref="selectAllInput"
                    type="checkbox"
                    :id="`${field.name}-select-all`"
                    :checked="isAllSelected"
                    @change="handleSelectAll"
                    :class="[
                        'h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 transition-all focus:ring-1 focus:ring-[var(--focus-theme-color)]! focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600',
                        checkboxThemeClass,
                    ]"
                    :style="{ accentColor: checkboxAccentColor }"
                />
            </span>
        </label>

        <FileUploadField
            v-if="['file', 'image', 'avatar'].includes(field.type)"
            :field="field"
            :value="value"
            :error="error"
            :size="size"
            :theme="theme"
            :selected-theme="selectedTheme"
            :readonly="readonly || field.readonly || isLoading"
            @update="(name, val) => $emit('update', name, val)"
        />

        <!-- Text, Email, Number, Password, Date, Time, URL, Tel inputs -->
        <div
            v-else-if="isTextInput"
            :class="[
                'group/field relative',
                field.showInRow ? 'flex-initial' : 'w-full',
            ]"
            :style="
                field.showInRow && field.inputWidth
                    ? { width: field.inputWidth }
                    : field.showInRow && field.type === 'number'
                      ? { width: '80px' }
                      : {}
            "
        >
            <input
                :id="field.name"
                :name="field.name"
                :type="field.type"
                :lang="field.lang"
                :value="value"
                :min="field.min"
                :max="field.max"
                :step="field.step"
                @input="handleInput"
                @focus="(e) => handleEvent('onFocus', e)"
                @blur="(e) => handleEvent('onBlur', e)"
                v-on="eventHandlers"
                :readonly="readonly || field.readonly || isLoading"
                :placeholder="
                    (field.placeholder ? resolveLabel(field.placeholder) : '') || fieldPrompt('enter', resolveFieldLabel(field))
                "
                :autocomplete="field.autocomplete || 'off'"
                :style="{ 
                    '--focus-theme-color': focusThemeColor,
                    ...ctl.heightStyle,
                    ...ctl.padStyle,
                }"
                :class="[
                    `${computedSizeClass} ${theme.inputBackground || 'bg-white dark:bg-gray-800'} ${
                        error
                            ? theme.errorBorder || 'border-red-500'
                            : theme.inputBorder ||
                              'border-gray-300 dark:border-gray-700'
                    } ${((field.type === 'date' || field.type === 'datetime-local' || field.type === 'time') && (!value)) ? 'text-gray-500 dark:text-gray-400' : (theme.inputText || 'text-gray-900 dark:text-gray-100')} ${field.className || ''} w-full rounded-md border transition-all focus:border-[var(--focus-theme-color)]! focus:ring-0 focus:outline-none! ${readonly || field.readonly || isLoading ? 'cursor-wait opacity-70 select-none focus:ring-0' : ''}`,
                    // No min-width: a date or time field takes exactly the width it is given, like a text field.
                    ['date', 'datetime-local', 'time'].includes(field.type) ? 'ub-date-input' : '',
                    isLoading ? 'pr-10' : '',
                ]"
            />
            <div
                v-show="isLoading"
                class="pointer-events-none absolute top-1/2 right-3 z-50 -translate-y-1/2"
            >
                <svg
                    :class="`h-5 w-5 animate-spin ${spinnerColorClass}`"
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
                    ></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            </div>
            <div
                v-if="showReloadIcon"
                :class="`absolute top-1/2 right-3 z-50 -translate-y-1/2 cursor-pointer text-gray-400 dark:text-neutral-400 hover:${theme?.loadingText || (selectedTheme ? 'text-' + selectedTheme + '-600' : 'text-blue-600')}`"
                @click="
                    executeEventAjax(
                        'onFocus',
                        (field.events as any).onFocus,
                        value,
                        true,
                    )
                "
                :title="resolveLabel('ui-builder.reload')"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-4 w-4"
                >
                    <path
                        d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
                    />
                    <path d="M21 3v5h-5" />
                    <path
                        d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
                    />
                    <path d="M8 16H3v5" />
                </svg>
            </div>
        </div>

        <!-- A plain static-options 'select' field renders through the exact same vue-select markup
             below as 'vue-select' itself — currentOptions/selectedOption resolution already handles
             a bare field.options array with no ajaxConfig, so this needed no new logic, just a wider
             template condition. -->
        <div
            v-else-if="field.type === 'vue-select' || field.type === 'select'"
            :class="['flex w-full items-stretch']"
        >
        <div
            ref="vueSelectWrapperRef"
            :class="[
                'relative min-w-0 flex-1',
                field.icon ? 'has-field-icon' : '',
            ]"
        >
            <div
                v-if="field.icon"
                class="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2"
            >
                <component
                    :is="field.icon"
                    :class="[
                        'h-4 w-4 opacity-50',
                        theme.paginationText || 'text-gray-400 dark:text-neutral-400',
                    ]"
                />
            </div>

            <v-select
                :id="field.name"
                :dir="direction"
                :append-to-body="true"
                :calculate-position="calculateDropdownPosition"
                v-bind="
                    field.ajaxConfig
                        ? {
                              'dropdown-should-open': (vm: any) =>
                                  Boolean(
                                      vm.open &&
                                          (vm.search.length > 0 ||
                                              isLoading ||
                                              field.ajaxConfig?.loadOnFocus ||
                                              (field.ajaxConfig?.prefetch &&
                                                  dynamicOptions.length > 0)),
                                  ),
                          }
                        : {}
                "
                :model-value="selectedOption"
                @update:model-value="handleVueSelectUpdate"
                @open="scrollParentToRevealDropdown"
                @search:focus="
                    () => {
                        handleEvent('onFocus', null);
                        scrollParentToRevealDropdown();
                        if (
                            field.ajaxConfig?.loadOnFocus &&
                            dynamicOptions.length === 0
                        ) {
                            handleSearch('', (s) => (isLoading.value = s));
                        }
                    }
                "
                @search:blur="() => handleEvent('onBlur', null)"
                v-on="eventHandlers"
                :options="currentOptions"
                :multiple="field.multiple"
                :close-on-select="!field.multiple"
                :reduce="(opt: any) => opt"
                :get-option-label="
                    (opt: any) => {
                        if (typeof opt === 'object' && opt !== null) {
                            const labelKey = field.ajaxConfig?.labelKey;
                            if (typeof labelKey === 'function') {
                                return labelKey(opt);
                            }
                            return resolveLabel(
                                opt.label ||
                                    opt[labelKey || 'label'] ||
                                    opt.name ||
                                    String(opt.value || ''),
                            );
                        }
                        return String(opt);
                    }
                "
                :placeholder="
                    (field.placeholder ? resolveLabel(field.placeholder) : '') || fieldPrompt('select', resolveFieldLabel(field))
                "
                :disabled="readonly || field.readonly"
                :style="{
                    '--vs-highlight-bg': getThemeHex(selectedTheme),
                    '--vs-tag-color': getThemeTagTextColor(selectedTheme),
                    '--focus-theme-color': focusThemeColor,
                    '--vs-border-radius': 'var(--radius-md, 0.375rem)',
                    ...ctl.vars,
                    ...(field.multiple ? { height: 'auto' } : ctl.heightStyle),
                    ...ctl.minHeightStyle,
                }"
                :class="[
                    'vue-select-custom ub-sized',
                    ctl.raw ? '' : ctl.token,
                    field.multiple ? 'multiple' : '',
                    computedSizeClass,
                    theme.inputBackground || 'bg-white dark:bg-gray-800',
                    error
                        ? theme.errorBorder || 'border-red-500'
                        : theme.inputBorder ||
                          'border-gray-300 dark:border-gray-700',
                    theme.inputText || 'text-gray-900 dark:text-gray-100',
                    field.className || '',
                    field.icon ? 'has-field-icon' : '',
                    // Logical -s/-e (not -l/-r) so the flat edge is on the right side under RTL too.
                    field.ajaxConfig?.quickCreate && canQuickCreate ? 'rounded-s-md rounded-e-none' : 'rounded-md',
                    'w-full border transition-all focus-within:border-[var(--focus-theme-color)]! focus-within:ring-0 focus-within:outline-none!',
                    field.ajaxConfig?.quickCreate && canQuickCreate ? 'focus-within:relative focus-within:z-[1]' : '',
                    readonly || field.readonly || isLoading
                        ? 'cursor-wait select-none focus-within:ring-0'
                        : '',
                    isLoading ? 'relative z-[60]' : '',
                ]"
                :loading="isLoading"
                :filterable="false"
                @search="handleSearch"
            >
                <template #search="{ attributes, events }">
                    <input
                        :id="`${field.name}-search`"
                        :name="`${field.name}-search`"
                        class="vs__search min-w-0"
                        v-bind="attributes"
                        v-on="events"
                        :placeholder="
                            !value ||
                            (Array.isArray(value) && value.length === 0)
                                ? (field.placeholder ? resolveLabel(field.placeholder) : '') ||
                                  fieldPrompt('select', resolveFieldLabel(field))
                                : ''
                        "
                    />
                </template>
                <template #no-options="{ search, searching }">
                    <div
                        v-if="isLoading"
                        :class="[
                            'relative z-[50] flex flex-col justify-start overflow-hidden rounded-md text-left',
                            theme.tableMenuBackground ||
                                'bg-white dark:bg-gray-900',
                            '!bg-white dark:!bg-gray-950', // Ensure solid background during load
                        ]"
                    >
                        <!-- Skeleton Options List (exactly 5 items to fix height) -->
                        <div class="w-full">
                            <div
                                v-for="(width, index) in [60, 40, 75, 50, 80]"
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
                                        theme.loadingText || 'text-blue-600',
                                    ]"
                                    style="animation-duration: 3s"
                                ></div>
                                <div
                                    :class="[
                                        'absolute inset-0 animate-spin rounded-full border-[3px] border-r-transparent border-b-transparent border-l-transparent',
                                        theme.loadingText || 'text-blue-600',
                                    ]"
                                    style="animation-duration: 0.8s"
                                ></div>
                                <div
                                    class="absolute inset-0 flex items-center justify-center"
                                >
                                    <div
                                        :class="[
                                            'h-1.5 w-1.5 animate-pulse rounded-full',
                                            theme.loadingText || 'bg-blue-600',
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
                            >
                                {{ resolveLabel('ui-builder.fetching_results') }}
                            </span>
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
                                    theme.tableTextSecondary || 'text-gray-500 dark:text-neutral-400',
                                ]"
                            >
                                <span class="font-semibold text-current italic"
                                    >"{{ search }}"</span
                                >
                                {{ resolveLabel('ui-builder.try_different_term') }}
                            </p>
                        </div>
                    </div>
                    <div v-else class="hidden"></div>
                </template>
                <template
                    v-if="field.multiple"
                    #selected-option-container="{ option, deselect, disabled }"
                >
                    <Badge
                        class="m-0.5 cursor-default gap-1 border-transparent pr-1 text-xs font-medium"
                        :style="{
                            backgroundColor: 'var(--vs-tag-bg, var(--vs-highlight-bg, #3b82f6))',
                            color: 'var(--vs-tag-fg, var(--vs-tag-color, #fff))',
                        }"
                    >
                        <span>{{ getOptionDisplayLabel(option) }}</span>
                        <button
                            v-if="!disabled"
                            type="button"
                            class="ml-0.5 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
                            @mousedown.stop="deselect(option)"
                        >
                            <X class="h-3 w-3" />
                        </button>
                    </Badge>
                </template>
                <template #selected-option="option">
                    <!-- No field.icon here: `.has-field-icon` above already renders it once,
                         fixed-position over the input, whether or not something is selected —
                         a second copy here duplicated it the moment an option was picked. -->
                    <div class="flex items-center gap-2">
                        <span
                            v-if="field.ajaxConfig?.renderOption"
                            v-html="field.ajaxConfig.renderOption(option)"
                        ></span>
                        <span v-else>{{ getOptionDisplayLabel(option) }}</span>
                    </div>
                </template>
                <template #option="option">
                    <div
                        v-if="field.ajaxConfig?.renderOption"
                        v-html="field.ajaxConfig.renderOption(option)"
                    ></div>
                    <div v-else class="flex flex-col">
                        <span>{{ getOptionDisplayLabel(option) }}</span>
                    </div>
                </template>
                <template #spinner="{ loading }">
                    <div
                        v-if="
                            (loading || isLoading) && dynamicOptions.length > 0
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
                        v-if="isLoading && dynamicOptions.length > 0"
                        class="sticky top-0 z-[60]"
                    >
                        <div
                            class="absolute inset-0 min-h-[50px] overflow-hidden rounded-md bg-white/40 backdrop-blur-[1px] dark:bg-gray-950/40"
                        >
                            <div
                                class="flex h-full w-full flex-col items-center justify-center gap-3"
                            >
                                <div class="relative h-10 w-10">
                                    <div
                                        :class="[
                                            'absolute inset-0 animate-spin rounded-full border-2 border-t-transparent',
                                            theme.loadingText ||
                                                'text-blue-600',
                                        ]"
                                    ></div>
                                    <div
                                        :class="[
                                            'absolute inset-0 flex items-center justify-center opacity-40',
                                            theme.loadingText ||
                                                'text-blue-600',
                                        ]"
                                    >
                                        <RefreshCw
                                            class="h-4 w-4 animate-pulse"
                                        />
                                    </div>
                                </div>
                                <span
                                    :class="[
                                        'text-[10px] font-bold tracking-[0.2em] uppercase',
                                        theme.tableTextSecondary ||
                                            'text-gray-500 dark:text-neutral-400',
                                    ]"
                                    >{{ resolveLabel('ui-builder.refreshing_list') }}</span
                                >
                            </div>
                        </div>
                    </div>
                </template>
                <template #open-indicator="{ attributes }">
                    <div class="flex h-full items-center justify-center p-1">
                        <ChevronDown
                            v-bind="attributes"
                            class="h-4 w-4 opacity-50"
                        />
                    </div>
                </template>
                <template #deselect>
                    <div class="flex items-center justify-center p-1">
                        <X class="h-3.5 w-3.5 opacity-50 hover:opacity-100" />
                    </div>
                </template>
            </v-select>
        </div>

        <!-- Quick-create: inline "+" to add a missing related record (opt-in via ajaxConfig.quickCreate) -->
        <button
            v-if="field.ajaxConfig?.quickCreate && canQuickCreate"
            type="button"
            :disabled="isFieldDisabled"
            :title="resolveLabel('ui-builder.add')"
            :class="[
                // -ms-px overlaps this button's border onto the select's, so the joined
                // edge reads as one 1px divider (logical property keeps this correct in RTL too).
                'relative -ms-px flex shrink-0 items-center justify-center rounded-s-none rounded-e-md border transition-colors',
                // Not theme.secondaryButton/inputBackground (both mismatch the select's own border/bg) — headerBackground keeps the seam invisible across presets.
                theme.headerBackground || 'bg-gray-50 dark:bg-gray-950',
                error
                    ? theme.errorBorder || 'border-red-500'
                    : theme.inputBorder || 'border-gray-300 dark:border-gray-700',
                theme.paginationText || 'text-gray-400 dark:text-neutral-400',
                'hover:brightness-95 dark:hover:brightness-125',
                isFieldDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ]"
            :style="{
                height: ctl.height,
                width: ctl.height,
            }"
            @click="quickCreateOpen = true"
        >
            <Plus class="h-4 w-4" />
        </button>

        <component
            :is="QuickCreateDialog"
            v-if="field.ajaxConfig?.quickCreate && canQuickCreate"
            :open="quickCreateOpen"
            :quick-create="field.ajaxConfig.quickCreate"
            :theme="theme"
            :selected-theme="selectedTheme"
            @update:open="quickCreateOpen = $event"
            @created="handleQuickCreated"
        />
        </div>

        <SwitchFormField
            v-else-if="field.type === 'switch'"
            :field="field"
            :value="value"
            :error="error"
            :theme="theme"
            :selected-theme="selectedTheme"
            :hide-label="true"
            :size="size"
            @update="(name, val) => $emit('update', name, val)"
            :class="field.className"
        />

        <div
            v-else-if="field.type === 'radio'"
            :class="`flex ${field.orientation === 'vertical' ? 'flex-col gap-2' : 'flex-wrap gap-4'} ${field.className || ''}`"
        >
            <div
                v-for="(opt, idx) in field.options"
                :key="idx"
                class="flex items-center space-x-2"
            >
                <input
                    :id="`${field.name.toLowerCase()}-${typeof opt === 'object' ? opt.value.toString().toLowerCase() : opt.toString().toLowerCase()}`"
                    :name="field.name"
                    type="radio"
                    :value="typeof opt === 'object' ? opt.value : opt"
                    :checked="
                        value === (typeof opt === 'object' ? opt.value : opt)
                    "
                    :disabled="readonly || field.readonly"
                    :class="[
                        'h-4 w-4 shrink-0 cursor-pointer border-gray-300 transition-all focus:ring-1 focus:ring-[var(--focus-theme-color)]! focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600',
                        checkboxThemeClass,
                    ]"
                    :style="{ accentColor: checkboxAccentColor, ...ctl.iconStyle }"
                />
                <label
                    :for="`${field.name.toLowerCase()}-${typeof opt === 'object' ? opt.value.toString().toLowerCase() : opt.toString().toLowerCase()}`"
                    :class="`cursor-pointer font-normal ${ctl.raw || !['xs', 'sm', 'md'].includes(ctl.token) ? ctl.textClass : ''} ${theme.labelText || 'text-gray-700 dark:text-gray-300'}`"
                >
                    {{ resolveLabel(typeof opt === 'object' ? opt.label : opt) }}
                </label>
            </div>
        </div>

        <div
            v-else-if="field.type === 'checkbox'"
            :class="`grid grid-cols-2 ${field.orientation === 'vertical' ? `gap-2 rounded-md ${theme.headerBackground || 'bg-slate-50/50'} p-4` : 'gap-4'} ${field.className || ''}`"
        >
            <div
                v-for="(opt, idx) in field.options"
                :key="idx"
                class="flex items-center space-x-2"
            >
                <input
                    :id="`${field.name.toLowerCase()}-${typeof opt === 'object' ? opt.value.toString().toLowerCase() : opt.toString().toLowerCase()}`"
                    :name="field.name"
                    type="checkbox"
                    :value="typeof opt === 'object' ? opt.value : opt"
                    :checked="
                        (Array.isArray(value) ? value : []).includes(
                            typeof opt === 'object' ? opt.value : opt,
                        )
                    "
                    @change="handleCheckboxChange"
                    :disabled="readonly || field.readonly"
                    :class="[
                        'h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 transition-all focus:ring-1 focus:ring-[var(--focus-theme-color)]! focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600',
                        checkboxThemeClass,
                    ]"
                    :style="{ accentColor: checkboxAccentColor, ...ctl.iconStyle }"
                />
                <label
                    :for="`${field.name.toLowerCase()}-${typeof opt === 'object' ? opt.value.toString().toLowerCase() : opt.toString().toLowerCase()}`"
                    :class="`cursor-pointer font-normal ${ctl.raw || !['xs', 'sm', 'md'].includes(ctl.token) ? ctl.textClass : ''} ${theme.labelText || 'text-gray-700 dark:text-gray-300'}`"
                >
                    {{ resolveLabel(typeof opt === 'object' ? opt.label : opt) }}
                </label>
            </div>
        </div>

        <div
            v-else-if="field.type === 'textarea'"
            @keydown.enter.stop
            class="group/field relative w-full"
        >
            <textarea
                :id="field.name"
                :name="field.name"
                :value="value"
                @input="handleInput"
                @focus="(e) => handleEvent('onFocus', e)"
                @blur="(e) => handleEvent('onBlur', e)"
                v-on="eventHandlers"
                :readonly="readonly || field.readonly || isLoading"
                :placeholder="
                    (field.placeholder ? resolveLabel(field.placeholder) : '') || fieldPrompt('enter', resolveFieldLabel(field))
                "
                :rows="field.minHeight ? undefined : field.rows || 4"
                :style="{
                    '--focus-theme-color': focusThemeColor,
                    minHeight: field.minHeight,
                    ...ctl.padStyle,
                }"
                :class="[
                    `${minHeight} ${ctl.textClass} ${theme.inputBackground || 'bg-white dark:bg-gray-800'} ${
                        error
                            ? theme.errorBorder || 'border-red-500'
                            : theme.inputBorder ||
                              'border-gray-300 dark:border-gray-700'
                    } ${theme.inputText || 'text-gray-900 dark:text-gray-100'} ${field.className || ''} w-full rounded-md border transition-all focus:border-[var(--focus-theme-color)]! focus:ring-0 focus:outline-none! ${readonly || field.readonly || isLoading ? 'cursor-wait opacity-70 select-none focus:ring-0' : ''}`,
                    isLoading ? 'pr-10' : '',
                ]"
            ></textarea>
            <div
                v-show="isLoading"
                class="pointer-events-none absolute top-3 right-3 z-20"
            >
                <svg
                    :class="`h-4 w-4 animate-spin ${theme.loadingText || 'text-blue-600'}`"
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
                    ></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            </div>
        </div>

        <div
            v-else-if="field.type === 'rich-text'"
            @keydown.enter.stop
            class="group/field relative w-full overflow-hidden rounded-md border transition-all focus-within:border-[var(--focus-theme-color)]! focus-within:ring-0 focus-within:outline-none!"
            :style="{
                '--ql-theme-color': getThemeHex(selectedTheme),
                '--ql-theme-bg': getThemeHex(selectedTheme) + '15',
                '--focus-theme-color': focusThemeColor,
                '--ub-editor-font': ctl.editorFont,
            }"
            :class="[
                error
                    ? theme.errorBorder || 'border-red-500'
                    : theme.inputBorder ||
                      'border-gray-300 dark:border-gray-700',
                theme.inputBackground || 'bg-white dark:bg-gray-800',
            ]"
        >
            <QuillEditor
                :id="field.name"
                :name="field.name"
                ref="quillEditorRef"
                :content="value"
                @update:content="
                    (content: any) => $emit('update', field.name, content)
                "
                content-type="html"
                :options="quillOptions"
                @ready="onQuillReady"
                :read-only="readonly || field.readonly || isLoading"
                :class="[
                    'w-full border-none!',
                    theme.inputText || 'text-gray-900 dark:text-gray-100',
                    readonly || field.readonly || isLoading
                        ? 'cursor-wait opacity-70'
                        : '',
                ]"
                :style="{ 
                    '--quill-min-height': field.minHeight || '250px',
                    'min-height': field.minHeight || '250px'
                }"
            />
        </div>

        <div
            v-else-if="field.type === 'icon-picker'"
            ref="iconPickerRef"
            class="group/field relative w-full"
        >
            <button
                type="button"
                :disabled="readonly || field.readonly"
                @click="iconPickerOpen = !iconPickerOpen"
                :style="{ 
                    '--focus-theme-color': focusThemeColor,
                    ...ctl.heightStyle,
                    ...ctl.padStyle,
                }"
                :class="[
                    `flex w-full items-center gap-2 rounded-md border text-left transition-all focus:border-[var(--focus-theme-color)]! focus:ring-0 focus:outline-none!`,
                    computedSizeClass,
                    theme.inputBackground || 'bg-white dark:bg-gray-800',
                    theme.inputText || 'text-gray-900 dark:text-gray-100',
                    error
                        ? theme.errorBorder || 'border-red-500'
                        : theme.inputBorder ||
                          'border-gray-300 dark:border-gray-700',
                    readonly || field.readonly
                        ? 'cursor-not-allowed opacity-70'
                        : 'cursor-pointer',
                ]"
            >
                <component
                    v-if="value && iconMap[value]"
                    :is="iconMap[value]"
                    class="h-4 w-4 shrink-0"
                    :style="ctl.iconStyle"
                />
                <span :class="['min-w-0 truncate', value ? '' : 'opacity-40']">{{
                    value || fieldPrompt('select', resolveFieldLabel(field))
                }}</span>
                <ChevronDown class="ml-auto h-4 w-4 shrink-0 opacity-40" :style="ctl.iconStyle" />
            </button>

            <!-- Dropdown: teleported to body to escape dialog overflow clipping -->
            <Teleport to="body">
                <div
                    v-if="iconPickerOpen"
                    ref="iconDropdownRef"
                    :style="iconDropdownStyle"
                    :class="[
                        'fixed z-[9999] overflow-hidden rounded-lg border shadow-xl',
                        theme.inputBackground || 'bg-white dark:bg-gray-900',
                        theme.inputBorder ||
                            'border-gray-200 dark:border-gray-700',
                    ]"
                >
                    <div
                        :class="[
                            'border-b p-2',
                            theme.inputBorder ||
                                'border-gray-200 dark:border-gray-700',
                        ]"
                    >
                        <input
                            ref="iconSearchInputRef"
                            :value="iconSearchRaw"
                            @input="handleIconSearchInput"
                            :id="`${field.name}-icon-search`"
                            :name="`${field.name}-icon-search`"
                            type="text"
                            placeholder="Search icons..."
                            :class="[
                                'w-full rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none',
                                focusRingThemeClass,
                                theme.inputBackground ||
                                    'bg-white dark:bg-gray-800',
                                theme.inputBorder ||
                                    'border-gray-200 dark:border-gray-600',
                                theme.inputText ||
                                    'text-gray-900 dark:text-gray-100',
                            ]"
                        />
                    </div>

                    <div
                        v-if="value"
                        @click.stop.prevent="clearIcon"
                        @mousedown.stop.prevent="clearIcon"
                        :class="[
                            'flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-sm',
                            theme.inputBorder ||
                                'border-gray-200 dark:border-gray-700',
                            theme.errorText || 'text-red-500',
                            'hover:opacity-80',
                        ]"
                    >
                        <X class="h-3.5 w-3.5" /> {{ resolveLabel('ui-builder.clear_selection') }}
                    </div>

                    <div
                        class="px-3 pt-2 pb-1 text-xs opacity-50"
                        :class="theme.inputText || 'text-gray-500 dark:text-neutral-400'"
                    >
                        <template v-if="iconSearch.trim()">
                            {{ displayedIcons.length }} result{{
                                displayedIcons.length !== 1 ? 's' : ''
                            }}
                            for &ldquo;{{ iconSearch.trim() }}&rdquo;
                            <span v-if="filteredIcons.length > displayedIcons.length">
                                ({{ filteredIcons.length - displayedIcons.length }} more &mdash; refine search)
                            </span>
                        </template>
                        <template v-else>
                            Showing {{ displayedIcons.length }} of
                            {{ iconList.length }} icons &mdash; type to search
                        </template>
                    </div>

                    <div
                        class="grid max-h-64 grid-cols-5 gap-1 overflow-y-auto p-2"
                    >
                        <button
                            v-for="icon in displayedIcons"
                            :key="icon.name"
                            v-memo="[value === icon.name]"
                            type="button"
                            :title="icon.name"
                            @click.stop.prevent="selectIcon(icon.name)"
                            @mousedown.stop.prevent="selectIcon(icon.name)"
                            style="font-size: 9px"
                            :class="[
                                'flex flex-col items-center justify-center gap-1 overflow-hidden rounded-md p-2 transition-colors',
                                value === icon.name
                                    ? theme.primaryButton ||
                                      (selectedTheme
                                          ? `bg-${selectedTheme}-600 text-white`
                                          : 'bg-blue-600 text-white')
                                    : theme.tableRowHover ||
                                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                            ]"
                        >
                            <component
                                :is="icon.component"
                                class="h-5 w-5 shrink-0"
                            />
                            <span
                                class="w-full truncate text-center leading-tight"
                                >{{ icon.name }}</span
                            >
                        </button>
                        <div
                            v-if="displayedIcons.length === 0"
                            class="col-span-5 py-6 text-center text-sm opacity-50"
                        >
                            No icons found for &ldquo;{{ iconSearchRaw }}&rdquo;
                        </div>
                    </div>
                </div>
            </Teleport>
        </div>
        
        <div v-else-if="field.type === 'key-value'" class="group/field relative w-full">
            <KeyValueField
                :value="value"
                :theme="theme"
                :size="size"
                :readonly="readonly || field.readonly || isLoading"
                :key-placeholder="field.keyPlaceholder"
                :value-placeholder="field.valuePlaceholder"
                :add-action-text="field.addActionText"
                :show-serial="field.showSerial"
                :max-height="field.maxHeight"
                :selected-theme="selectedTheme"
                :key-options="field.keyOptions"
                @update="(val) => $emit('update', field.name, val)"
            />
        </div>

        <div
            v-if="error"
            :class="`mt-1 flex items-center gap-1 text-xs font-medium ${theme.errorText || 'text-red-600'}`"
        >
            <svg
                class="h-3.5 w-3.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                />
            </svg>
            <span>{{ error }}</span>
        </div>

    </div>
</template>

<!-- Module-level script (runs once, not per instance): iconList/iconMap are heavy
     (1500+ Lucide components), and markRaw() below keeps Vue from proxying them. -->
<script lang="ts">
// `computed`/`ref` come from the `<script setup>` block below (one shared module scope).
import { loadLucideIcon, useLucideIcons } from '../../composables/useLucideIcons';

// Never import the Lucide barrel here — it would pull all ~1,800 icons into a shared
// chunk and break tree-shaking elsewhere (see useLucideIcons).
const { icons: loadedIcons } = useLucideIcons();

// Name catalogue is also lazy (352 KB index) — fetched only when a picker actually opens.
const iconNames = ref<string[]>([]);
let catalogueRequested = false;

export function ensureIconCatalogueLoaded(): void {
    if (catalogueRequested) return;
    catalogueRequested = true;

    import('../../composables/lucideIconRegistry')
        .then(({ availableIconNames }) => {
            iconNames.value = availableIconNames();
        })
        .catch(() => {
            // Leaves the picker empty rather than breaking the form around it.
            catalogueRequested = false;
        });
}

export const iconList = computed(() =>
    iconNames.value.map((name) => ({ name, component: loadedIcons.value[name] ?? null })),
);

export const iconMap = computed(() => loadedIcons.value);

/** Requests the components for a batch of names (i.e. the rows currently rendered). */
export function ensureIconsLoaded(names: string[]): void {
    names.forEach(loadLucideIcon);
}
</script>

<script setup lang="ts">
import { Badge } from '../../primitives/badge';
import { fieldPrompt, resolveFieldLabel, resolveLabel } from '../../i18n';
import { Swal } from '../../utils/swal';
import axios from 'axios';
import { usePage } from '../../adapters/inertia';
import { readPageProps } from '../../adapters/pageProps';
import { ChevronDown, Plus, RefreshCw, SearchX, Upload, X } from '@lucide/vue';
import { computed, defineAsyncComponent, markRaw, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue';
import vSelect from 'vue-select';
import {
    getThemeActiveBorderColor,
    getThemeActiveCheckboxColor,
    getThemeActiveRingColor,
    getThemeHex,
    getThemeTagTextColor,
    themeColorFamily,
} from '../../composables/themes';
import type {
    FormEventAction,
    FormField,
    ThemeConfig,
} from '../../types/module';
import { resolveControlSize } from '../../utils/sizing';
import HintTip from '../HintTip.vue';
import SwitchFormField from './SwitchFormField.vue';
import KeyValueField from './KeyValueField.vue';
import FileUploadField from './FileUploadField.vue';

// Quill (~340 KB) loaded on demand so pages with no rich-text field don't pay for it;
// `window.Quill` is assigned inside the loader since its plugins expect the global.
const QuillEditor = defineAsyncComponent(async () => {
    const [vueQuill, quillNamespace] = await Promise.all([
        import('@vueup/vue-quill'),
        import('quill'),
        import('@vueup/vue-quill/dist/vue-quill.snow.css'),
    ]);

    const Q: any =
        (vueQuill as any).Quill || (quillNamespace as any).default || quillNamespace;
    if (Q) {
        (window as any).Quill = Q;
    }

    return (vueQuill as any).QuillEditor;
});

// Same reasoning: loaded on demand, only for fields that opt into quickCreate.
const QuickCreateDialog = defineAsyncComponent(
    () => import('./QuickCreateDialog.vue'),
);

interface Props {
    field: FormField;
    value: any;
    error?: string;
    size: string;
    theme: Partial<ThemeConfig>;
    selectedTheme: string;
    formData?: Record<string, any>;
    form?: any;
    readonly?: boolean;
}

const props = defineProps<Props>();
const selectAllInput = ref<HTMLInputElement | null>(null);

// Helper text lives in an (i) tooltip beside the label rather than on a line of its own.
// A switch's placeholder doubles as its description, so it joins the tooltip.
const hintText = computed(() => {
    const parts = [props.field.hint, props.field.type === 'switch' ? props.field.placeholder : undefined]
        .filter(Boolean)
        .map((k) => resolveLabel(k as string));
    return parts.join(' ') || null;
});

// A preset without loadingText takes its primary button's colour; a runtime-built `text-${name}-600` is never generated.
const spinnerColorClass = computed(() => {
    if (props.theme?.loadingText) return props.theme.loadingText;
    const family = themeColorFamily(props.theme?.primaryButton);
    return family ? `theme-${family} text-tc-600 dark:text-tc-400` : 'text-blue-600 dark:text-blue-400';
});

const emit = defineEmits<{
    update: [name: string, value: any];
}>();

const checkboxThemeClass = computed(() => {
    return (
        props.theme?.checkbox ||
        getThemeActiveCheckboxColor(props.theme?.primaryButton)
    );
});

const focusRingThemeClass = computed(() => {
    return getThemeActiveRingColor(props.theme?.primaryButton);
});

const focusBorderThemeClass = computed(() => {
    return getThemeActiveBorderColor(props.theme?.primaryButton);
});

const checkboxAccentColor = computed(() => {
    return getThemeHex(props.selectedTheme);
});

const focusThemeColor = computed(() => {
    return getThemeHex(props.selectedTheme || 'blue');
});

const dynamicOptions = ref<any[]>([]);
const selectedOption = ref<any>(null);
const isLoading = ref(false);
const uploadError = ref<string | null>(null);
const quillEditorRef = ref<any>(null);
const vueSelectWrapperRef = ref<HTMLElement | null>(null);

let debounceTimer: any = null;

const page = usePage();

// vue-select's RTL support keys off a real dir="rtl" attribute on .v-select, which
// doesn't cascade from <html dir> like CSS direction does — pass it through explicitly.
const direction = computed(
    () => readPageProps(page).direction === 'rtl' ? 'rtl' : 'ltr',
);

// Quick-create: resolves the target module's create permission up front so the "+"
// button doesn't appear for someone who'd only fail on submit (server still gates it).
const quickCreateOpen = ref(false);
const quickCreatePermission = ref<string | undefined>(undefined);
const quickCreateResolved = ref(false);

const canQuickCreate = computed(() => {
    if (!quickCreateResolved.value) return false;
    if (!quickCreatePermission.value) return true;
    const permissions = readPageProps(page).auth?.permissions;
    return Array.isArray(permissions)
        ? permissions.includes(quickCreatePermission.value)
        : false;
});

// A function-valued field.readonly can't be resolved here (no row) so it's treated as not-readonly.
const isFieldDisabled = computed(
    () =>
        Boolean(props.readonly) ||
        (typeof props.field.readonly !== 'function' && Boolean(props.field.readonly)),
);

onMounted(() => {
    const quickCreate = props.field.ajaxConfig?.quickCreate;
    if (props.field.type !== 'vue-select' || !quickCreate) return;

    Promise.resolve(quickCreate.getConfig())
        .then((config) => {
            quickCreatePermission.value =
                config.actionConfig?.create?.permission ||
                config.permissions?.create;
        })
        .catch((error) => {
            console.error('Failed to resolve quick-create permission:', error);
        })
        .finally(() => {
            quickCreateResolved.value = true;
        });
});

// Maps a quick-created record into the same {label, value} option shape handleSearch() builds.
const mapRecordToOption = (record: any) => {
    const config = props.field.ajaxConfig;
    const labelKey = config?.labelKey;
    const valueKey = config?.valueKey || 'value';
    return {
        ...record,
        label:
            typeof labelKey === 'function'
                ? labelKey(record)
                : record[labelKey || 'label'] || record.label || record.name,
        value: record[valueKey] !== undefined ? record[valueKey] : record.id,
    };
};

const handleQuickCreated = (record: any) => {
    const option = mapRecordToOption(record);
    dynamicOptions.value = [option, ...dynamicOptions.value];

    if (props.field.multiple) {
        const current = Array.isArray(selectedOption.value)
            ? selectedOption.value
            : [];
        handleVueSelectUpdate([...current, option]);
    } else {
        handleVueSelectUpdate(option);
    }
};

// Scrolls the nearest scrollable ancestor so an opening dropdown isn't clipped near the
// bottom of a dialog — estimates space needed from the wrapper's position, since the
// dropdown itself isn't rendered/measurable yet.
const scrollParentToRevealDropdown = () => {
    const wrapper = vueSelectWrapperRef.value;
    if (!wrapper) return;

    const getScrollableParent = (el: HTMLElement): HTMLElement | null => {
        let current = el.parentElement;
        while (current) {
            const style = getComputedStyle(current);
            const overflowY = style.overflowY;
            if (overflowY === 'auto' || overflowY === 'scroll') {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    };

    const scrollParent = getScrollableParent(wrapper);
    if (!scrollParent) return;

    // Use a short delay so the layout has settled after the dropdown triggers
    requestAnimationFrame(() => {
        const parentRect = scrollParent.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();

        const maxVisibleOptions = props.field.ajaxConfig?.maxVisibleOptions || (props.field as any).maxVisibleOptions;
        const ESTIMATED_DROPDOWN_HEIGHT = maxVisibleOptions ? maxVisibleOptions * 38 : 300;

        const neededBottom = wrapperRect.bottom + ESTIMATED_DROPDOWN_HEIGHT;

        const overflow = neededBottom - parentRect.bottom;

        if (overflow > 0) {
            scrollParent.scrollBy({ top: overflow + 16, behavior: 'smooth' });
        }
    });
};

// Positions the append-to-body dropdown below the toggle and copies theme CSS vars onto it.
const calculateDropdownPosition = (
    el: HTMLElement,
    vm: any,
    { width, top, left }: { width: string; top: string; left: string }
) => {
    const rootEl = vm.$el;
    
    const maxVisibleOptions = props.field.ajaxConfig?.maxVisibleOptions || (props.field as any).maxVisibleOptions;
    // Assuming each option is roughly ~38px high
    const calculatedMaxHeight = maxVisibleOptions ? `${maxVisibleOptions * 38}px` : '350px';

    if (rootEl) {
        const rect = rootEl.getBoundingClientRect();
        const bodyRect = document.body.getBoundingClientRect();

        // Subtract body rect offsets so this aligns even if body has margins/relative positioning.
        el.style.width = rect.width + 'px';
        el.style.left = (rect.left - bodyRect.left) + 'px';
        el.style.top = (rect.bottom - bodyRect.top) + 'px';
        el.style.zIndex = '9999';
        
        // Apply max height via CSS variable (so it works with !important in CSS)
        el.style.setProperty('--vs-dropdown-max-height', calculatedMaxHeight);

        const computedStyle = getComputedStyle(rootEl);

        el.style.backgroundColor = computedStyle.backgroundColor || '#fff';
        el.style.borderColor = computedStyle.borderColor || '#e5e7eb';
        el.style.color = computedStyle.color || '#111827';

        el.style.borderStyle = computedStyle.borderStyle || 'solid';
        el.style.borderWidth = computedStyle.borderWidth || '1px';
        el.style.borderTopStyle = 'solid'; // override top border removal

        const highlightBg = rootEl.style.getPropertyValue('--vs-highlight-bg') || getThemeHex(props.selectedTheme);
        if (highlightBg) {
            el.style.setProperty('--vs-highlight-bg', highlightBg);
        }

        const tagColor = rootEl.style.getPropertyValue('--vs-tag-color') || getThemeTagTextColor(props.selectedTheme);
        if (tagColor) {
            el.style.setProperty('--vs-tag-color', tagColor);
        }
    } else {
        el.style.top = top;
        el.style.left = left;
        el.style.width = width;
        el.style.zIndex = '9999';
        el.style.setProperty('--vs-dropdown-max-height', calculatedMaxHeight);
    }
};

const filePreviews = ref<{ url: string; name: string }[]>([]);
const initialPreviews = ref<string[]>([]);
const selectedFiles = ref<File[]>([]);

const isTextInput = computed(() => {
    return [
        'text',
        'email',
        'number',
        'password',
        'date',
        'time',
        'datetime-local',
        'url',
        'tel',
    ].includes(props.field.type);
});

const handleCheckboxChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    const valueStr = target.value;

    // We parse the value back to its original type if possible (number, boolean)
    let parsedValue: any = valueStr;
    if (valueStr === 'true') parsedValue = true;
    if (valueStr === 'false') parsedValue = false;
    if (!isNaN(Number(valueStr)) && valueStr.trim() !== '')
        parsedValue = Number(valueStr);

    let currentValues = Array.isArray(props.value) ? [...props.value] : [];

    if (isChecked) {
        if (!currentValues.includes(parsedValue)) {
            currentValues.push(parsedValue);
        }
    } else {
        currentValues = currentValues.filter((v) => String(v) !== valueStr);
    }

    emit('update', props.field.name, currentValues);

    if (props.field.onChange) {
        props.field.onChange(currentValues, props.form);
    }

    if (props.field.events?.onChange) {
        handleEvent('onChange', currentValues);
    }
};

const isAllSelected = computed(() => {
    if (props.field.type !== 'checkbox' || !props.field.options?.length)
        return false;
    const currentValues = (Array.isArray(props.value) ? props.value : []).map(
        (v) => String(v),
    );
    return props.field.options.every((opt) => {
        const optVal = typeof opt === 'object' ? opt.value : opt;
        return currentValues.includes(String(optVal));
    });
});

const isSomeSelected = computed(() => {
    if (props.field.type !== 'checkbox' || !props.field.options?.length)
        return false;
    const currentValues = (Array.isArray(props.value) ? props.value : []).map(
        (v) => String(v),
    );
    return (
        currentValues.length > 0 &&
        props.field.options.some((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            return currentValues.includes(String(optVal));
        })
    );
});

const handleSelectAll = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    const allValues = isChecked
        ? props.field.options?.map((opt) =>
              typeof opt === 'object' ? opt.value : opt,
          ) || []
        : [];

    emit('update', props.field.name, allValues);

    if (props.field.onChange) {
        props.field.onChange(allValues, props.form);
    }

    if (props.field.events?.onChange) {
        handleEvent('onChange', allValues);
    }
};

watch(
    [isAllSelected, isSomeSelected],
    () => {
        if (selectAllInput.value) {
            selectAllInput.value.indeterminate =
                isSomeSelected.value && !isAllSelected.value;
        }
    },
    { immediate: true },
);

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const files = Array.from(target.files);
    uploadError.value = null;

    if (props.field.fileConfig?.maxSize) {
        const maxSizeInBytes = props.field.fileConfig.maxSize * 1024 * 1024;
        const oversized = files.find((f) => f.size > maxSizeInBytes);
        if (oversized) {
            uploadError.value = `File ${oversized.name} exceeds ${props.field.fileConfig.maxSize}MB limit.`;
            target.value = ''; // Reset input to allow re-selection
            return;
        }
    }

    if (props.field.fileConfig?.multiple && props.field.fileConfig?.maxFiles) {
        const currentCount =
            selectedFiles.value.length + initialPreviews.value.length;
        const newCount = files.length;

        if (currentCount + newCount > props.field.fileConfig.maxFiles) {
            uploadError.value = `Maximum ${props.field.fileConfig.maxFiles} files allowed. Currently: ${currentCount}, New: ${newCount}`;
            target.value = ''; // Reset input to allow re-selection
            return;
        }
    }

    if (props.field.fileConfig?.multiple) {
        selectedFiles.value = [...selectedFiles.value, ...files];
    } else {
        selectedFiles.value = files;
        initialPreviews.value = []; // Clear initial on single select if new file added
    }

    emit(
        'update',
        props.field.name,
        props.field.fileConfig?.multiple
            ? [...initialPreviews.value, ...selectedFiles.value]
            : selectedFiles.value[0] || null,
    );

    target.value = ''; // Reset input to allow re-selection
};

watch(
    selectedFiles,
    (newFiles) => {
        // Cleanup old preview URLs to prevent memory leaks
        filePreviews.value.forEach((p) => URL.revokeObjectURL(p.url));

        if (props.field.fileConfig?.preview !== false) {
            filePreviews.value = newFiles
                .filter((file) => {
                    return (
                        file.type.startsWith('image/') ||
                        /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
                    );
                })
                .map((file) => ({
                    url: URL.createObjectURL(file),
                    name: file.name,
                }));
        } else {
            filePreviews.value = [];
        }
    },
    { deep: true },
);

const removeFile = (idx: number) => {
    uploadError.value = null;

    // filePreviews and selectedFiles aren't 1-to-1 (non-images are excluded), so match by name.
    const preview = filePreviews.value[idx];
    if (preview) {
        const fileIdx = selectedFiles.value.findIndex(
            (f) => f.name === preview.name,
        );
        if (fileIdx !== -1) {
            selectedFiles.value.splice(fileIdx, 1);
        } else {
            // Fallback: just remove by index if name matching fails
            selectedFiles.value.splice(idx, 1);
        }
    } else {
        selectedFiles.value.splice(idx, 1);
    }

    // Reassign (rather than rely on splice alone) to guarantee the watcher fires.
    selectedFiles.value = [...selectedFiles.value];

    emit(
        'update',
        props.field.name,
        props.field.fileConfig?.multiple
            ? [...initialPreviews.value, ...selectedFiles.value]
            : selectedFiles.value[0] || initialPreviews.value[0] || null,
    );
};

const removeInitialFile = (idx: number) => {
    uploadError.value = null;
    initialPreviews.value.splice(idx, 1);
    initialPreviews.value = [...initialPreviews.value];
    
    emit(
        'update',
        props.field.name,
        props.field.fileConfig?.multiple
            ? [...initialPreviews.value, ...selectedFiles.value]
            : selectedFiles.value[0] || initialPreviews.value[0] || null,
    );
};

watch(
    () => props.value,
    (newVal) => {
        if (['file', 'image', 'avatar'].includes(props.field.type)) {
            if (typeof newVal === 'string') {
                initialPreviews.value = [newVal];
            } else if (
                Array.isArray(newVal) &&
                newVal.every((v) => typeof v === 'string')
            ) {
                initialPreviews.value = newVal;
            } else if (!newVal) {
                initialPreviews.value = [];
            }
        }
    },
    { immediate: true },
);

const showReloadIcon = computed(() => {
    // Only reliable for text inputs for now
    if (!isTextInput.value) return false;

    const onFocus = props.field.events?.onFocus;
    const hasReloadConfig =
        typeof onFocus === 'object' && onFocus?.ajaxConfig?.enableReload;

    return !isLoading.value && !!props.value && hasReloadConfig;
});

// Standardize and merge options for display in the dropdown
const currentOptions = computed(() => {
    // 1. Start with dynamic options from AJAX
    const list = [...(dynamicOptions.value || [])];

    // 2. Add static options from field config ONLY if not using AJAX
    if (props.field.options && !props.field.ajaxConfig) {
        props.field.options.forEach((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const label = typeof opt === 'object' ? opt.label : opt;

            if (
                !list.find((o) => (typeof o === 'object' ? o.value : o) == val)
            ) {
                list.push({
                    label,
                    value: val,
                    ...(typeof opt === 'object' ? opt : {}),
                });
            }
        });
    }

    // 3. Ensure the currently selected object(s) are in the list (multi-select is filtered back out below).
    if (selectedOption.value) {
        if (Array.isArray(selectedOption.value)) {
            (selectedOption.value as any[]).forEach((sel: any) => {
                const val = sel?.value;
                if (
                    val !== undefined &&
                    !list.find(
                        (o) => (typeof o === 'object' ? o.value : o) == val,
                    )
                ) {
                    list.push(sel);
                }
            });
        } else {
            const val = (selectedOption.value as any).value;
            if (
                !list.find((o) => (typeof o === 'object' ? o.value : o) == val)
            ) {
                list.push(selectedOption.value);
            }
        }
    }

    let finalOptions = list;

    if (props.field.multiple && Array.isArray(selectedOption.value)) {
        const selectedIds = (selectedOption.value as any[]).map((sel) =>
            typeof sel === 'object' ? sel.value : sel,
        );
        finalOptions = finalOptions.filter((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            return !selectedIds.includes(val);
        });
    }

    if (props.field.type === 'vue-select') {
        const sortOrder = props.field.ajaxConfig?.sortOrder || 'label';
        const sortDirection = props.field.ajaxConfig?.sortDirection || 'asc';
        
        if (sortOrder !== 'none') {
            finalOptions.sort((a, b) => {
                let comparison = 0;
                
                if (sortOrder === 'order') {
                    const aVal = typeof a === 'object' ? a.order ?? a.value ?? a.id : a;
                    const bVal = typeof b === 'object' ? b.order ?? b.value ?? b.id : b;
                    comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                } else if (sortOrder === 'id') {
                    const aVal = typeof a === 'object' ? a.value ?? a.id : a;
                    const bVal = typeof b === 'object' ? b.value ?? b.id : b;
                    comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                } else {
                    const getLabel = (opt: any) => {
                        if (typeof opt === 'object' && opt !== null) {
                            const labelKey = props.field.ajaxConfig?.labelKey;
                            if (typeof labelKey === 'function') {
                                return labelKey(opt);
                            }
                            return opt.label ?? opt[labelKey as string || 'label'] ?? opt.name ?? String(opt.value || '');
                        }
                        return String(opt);
                    };
                    const aLabel = String(getLabel(a) || '').toLowerCase();
                    const bLabel = String(getLabel(b) || '').toLowerCase();
                    comparison = aLabel.localeCompare(bLabel);
                }
                
                return sortDirection === 'desc' ? -comparison : comparison;
            });
        }
    }

    return finalOptions;
});

const minHeight = computed(() => {
    // If a custom minHeight is provided in the field config, we let the style binding handle it
    if (props.field.minHeight) return '';

    return props.field.rows
        ? `min-h-[${props.field.rows * 24}px]`
        : 'min-h-[80px]';
});

const quillToolbar = computed(() => {
    if (!props.field.toolbar) return 'snow'; // Default

    switch (props.field.toolbar) {
        case 'minimal':
            return [
                ['bold', 'italic'],
                [{ list: 'ordered' }, { list: 'bullet' }],
            ];
        case 'essential':
            return [
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link'],
                ['clean'],
            ];
        case 'full':
            return [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ align: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean'],
            ];
        default:
            return 'snow';
    }
});

const handleQuillImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        if (props.field.fileConfig?.maxSize) {
            const maxSizeInBytes = props.field.fileConfig.maxSize * 1024 * 1024;
            if (file.size > maxSizeInBytes) {
                Swal.fire({
                    icon: 'error',
                    title: 'File too large',
                    text: `Image size exceeds the ${props.field.fileConfig.maxSize}MB limit.`,
                    confirmButtonColor: getThemeHex(props.selectedTheme),
                });
                return;
            }
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const quill = quillEditorRef.value?.getQuill();
            const range = quill?.getSelection();
            if (quill && range) {
                quill.insertEmbed(range.index, 'image', e.target?.result);
            }
        };
        reader.readAsDataURL(file);
    };
};

const onQuillReady = (quill: any) => {
    if (props.field.fileConfig?.maxSize) {
        const toolbar = quill.getModule('toolbar');
        if (toolbar) {
            toolbar.addHandler('image', handleQuillImageUpload);
        }
    }
};

const quillOptions = computed(() => {
    const modules: any = {};

    if (props.field.toolbar && props.field.toolbar !== 'snow') {
        modules.toolbar = {
            container: quillToolbar.value,
        };
    } else {
        modules.toolbar = true;
    }


    return {
        modules,
        theme: 'snow',
        placeholder:
            (props.field.placeholder ? resolveLabel(props.field.placeholder) : '') ||
            fieldPrompt('enter', resolveFieldLabel(props.field)),
    };
});

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    let val: any = target.value;

    if (props.field.type === 'number' && val !== '') {
        val = Number(val);
    }

    emit('update', props.field.name, val);

    if (props.field.onChange) {
        props.field.onChange(val, props.form);
    }
};

const handleVueSelectUpdate = (val: any) => {
    if (props.field.multiple) {
        const arr: any[] = Array.isArray(val) ? val : val ? [val] : [];
        selectedOption.value = arr;
        const finalValues = arr.map((item: any) =>
            item && typeof item === 'object'
                ? item.value !== undefined
                    ? item.value
                    : item.id
                : item,
        );
        emit('update', props.field.name, finalValues);
        if (props.field.onChange) {
            props.field.onChange(arr, props.form);
        }
        if (props.field.events?.onChange) {
            handleEvent('onChange', finalValues);
        }
        return;
    }

    let finalValue: any = null;
    if (val && typeof val === 'object') {
        selectedOption.value = val;
        finalValue = val.value !== undefined ? val.value : val.id;

        // ✅ Clear search results on selection for AJAX feeds
        if (props.field.ajaxConfig && !props.field.multiple) {
            dynamicOptions.value = [];
        }
    } else {
        selectedOption.value = null;
        finalValue = val !== undefined ? val : null;
    }

    emit('update', props.field.name, finalValue);

    if (val && props.field.ajaxConfig?.onSelect) {
        props.field.ajaxConfig.onSelect(val, props.form);
    }

    if (val && props.field.ajaxConfig?.onSelectAjax) {
        executeEventAjax(
            'onSelectAjax',
            { ajaxConfig: props.field.ajaxConfig.onSelectAjax },
            finalValue,
        );
    }

    if (!finalValue && props.field.ajaxConfig?.resetFields) {
        props.field.ajaxConfig.resetFields.forEach((fieldName) => {
            emit('update', fieldName, '');
        });
    }

    if (props.field.onChange) {
        props.field.onChange(val, props.form);
    }
    if (props.field.events?.onChange) {
        handleEvent('onChange', finalValue);
    }
};

const eventTimers = ref<Record<string, any>>({});

const executeEventAjax = async (
    eventName: string,
    action: FormEventAction,
    value: any,
    force = false, // ✅ NEW: Force execution bypassing condition
) => {
    if (!action.ajaxConfig) return;

    // Skip AJAX if condition() returns false, unless force is set.
    if (
        !force &&
        action.ajaxConfig.condition &&
        !action.ajaxConfig.condition(props.formData || {}, value)
    ) {
        return;
    }

    isLoading.value = true;
    const startTime = Date.now();

    const config = action.ajaxConfig;
    const method = (config.method || 'GET').toLowerCase();

    try {
        let resolvedParams: Record<string, any> = {};
        if (config.params) {
            if (typeof config.params === 'function') {
                resolvedParams = (config.params as any)(
                    props.formData || {},
                    value,
                );
            } else {
                resolvedParams = { ...config.params };
            }
        }

        let response: any;

        if (method === 'get') {
            const params = { ...resolvedParams };
            if (!params.value) params.value = value;
            response = await axios.get(config.endpoint, {
                params,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });
        } else {
            const body = {
                value,
                ...resolvedParams,
            };
            response = await axios[method as 'post' | 'put' | 'patch'](
                config.endpoint,
                body,
                {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        Accept: 'application/json',
                    },
                },
            );
        }

        const data = response.data;

        if (config.onSuccess) {
            config.onSuccess(data, props.form);
        }
    } catch (error: any) {
        console.error(`Error in ${eventName} AJAX:`, error);
        const errorData = error.response?.data || error;
        if (config.onError) {
            config.onError(errorData, props.form);
        }
    } finally {
        // Ensure loader is visible for at least 500ms
        const elapsed = Date.now() - startTime;
        if (elapsed < 500) {
            await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
        }
        isLoading.value = false;
    }
};

const handleEvent = (eventName: string, eventOrValue: any) => {
    const events = props.field.events;
    if (!events) return;

    const actionOrHandler = (events as any)[eventName];
    if (!actionOrHandler) return;

    const value =
        eventOrValue && eventOrValue.target
            ? (eventOrValue.target as any).value
            : eventOrValue;

    if (typeof actionOrHandler === 'function') {
        actionOrHandler(value, props.form, eventOrValue);
        return;
    }

    const action = actionOrHandler as FormEventAction;

    const execute = () => {
        if (action.handler) {
            action.handler(value, props.form, eventOrValue);
        }
        if (action.ajaxConfig) {
            executeEventAjax(eventName, action, value);
        }
    };

    if (action.debounce) {
        if (eventTimers.value[eventName]) {
            clearTimeout(eventTimers.value[eventName]);
        }
        eventTimers.value[eventName] = setTimeout(execute, action.debounce);
    } else {
        execute();
    }
};

const eventHandlers = computed(() => {
    const handlers: Record<string, any> = {};
    const events = props.field.events;
    if (!events) return handlers;

    if (events.onKeyUp) handlers.keyup = (e: any) => handleEvent('onKeyUp', e);
    if (events.onKeyDown)
        handlers.keydown = (e: any) => handleEvent('onKeyDown', e);
    if (events.onKeyPress)
        handlers.keypress = (e: any) => handleEvent('onKeyPress', e);
    // onFocus/onBlur are already bound via @focus/@blur in the template — skip to avoid double-firing.
    if (events.onInput) handlers.input = (e: any) => handleEvent('onInput', e);
    if (events.onChange && !['vue-select', 'select'].includes(props.field.type)) {
        // vue-select (and, since it now renders the same way, plain 'select') uses handleVueSelectUpdate
        handlers.change = (e: any) => handleEvent('onChange', e);
    }

    return handlers;
});

const getOptionDisplayLabel = (option: any): string => {
    if (typeof option === 'object' && option !== null) {
        const labelKey = props.field.ajaxConfig?.labelKey;
        if (typeof labelKey === 'function') {
            return labelKey(option);
        }
        return resolveLabel(
            option.label ||
                option[labelKey || 'label'] ||
                option.name ||
                String(option.value || option.id || ''),
        );
    }
    return resolveLabel(String(option));
};

const matchesValue = (o: any, target: any): boolean => {
    if (o === null || o === undefined) return false;
    const val =
        typeof o === 'object' ? (o.value !== undefined ? o.value : o.id) : o;
    return String(val) === String(target);
};

const normaliseOption = (raw: any): any => {
    const ajax = props.field.ajaxConfig;
    const valueKey = ajax?.valueKey || 'value';
    const idVal =
        raw[valueKey] !== undefined
            ? raw[valueKey]
            : raw.value !== undefined
              ? raw.value
              : raw.id;
    let derivedLabel = '';
    if (typeof ajax?.labelKey === 'function') {
        derivedLabel = ajax.labelKey(raw);
    } else {
        const lKey = (ajax?.labelKey as string) || 'label';
        derivedLabel = raw[lKey] || raw.label || raw.name || String(idVal);
    }
    return { ...raw, label: derivedLabel, value: idVal };
};

// Sync incoming value (ID or array of IDs) to selection cache (full object / array)
watch(
    [() => props.value, () => props.field, dynamicOptions],
    ([newVal]) => {
        if (props.field.multiple) {
            if (!newVal || (Array.isArray(newVal) && newVal.length === 0)) {
                selectedOption.value = [];
                return;
            }
            const ids: any[] = Array.isArray(newVal) ? newVal : [newVal];
            const searchSource = [
                ...(dynamicOptions.value || []),
                ...(props.field.options || []),
            ];
            const resolved = ids.map((id) => {
                if (typeof id === 'object' && id !== null)
                    return normaliseOption(id);
                const found = searchSource.find((o) => matchesValue(o, id));
                if (found && typeof found === 'object')
                    return normaliseOption(found);
                // Preserve existing cached entry if already resolved
                const cached = Array.isArray(selectedOption.value)
                    ? (selectedOption.value as any[]).find((c: any) =>
                          matchesValue(c, id),
                      )
                    : null;
                if (cached) return cached;
                // Placeholder until async fetch returns
                return { label: String(id), value: id };
            });
            selectedOption.value = resolved;
            return;
        }

        if (newVal === null || newVal === undefined || newVal === '') {
            selectedOption.value = null;
            return;
        }

        if (typeof newVal === 'object' && newVal !== null) {
            const ajax = props.field.ajaxConfig;
            const valueKey = ajax?.valueKey || 'value';

            const hasId =
                newVal.id !== undefined ||
                newVal.value !== undefined ||
                newVal[valueKey] !== undefined;

            if (hasId) {
                selectedOption.value = normaliseOption(newVal);
                return;
            }
        }

        // Lookup the full object for this ID in BOTH current results and static config
        const searchSource = [
            ...(dynamicOptions.value || []),
            ...(props.field.options || []),
        ];

        const found = searchSource.find((o) => matchesValue(o, newVal));

        if (found && typeof found === 'object') {
            selectedOption.value = {
                label:
                    typeof props.field.ajaxConfig?.labelKey === 'function'
                        ? props.field.ajaxConfig.labelKey(found)
                        : found.label ||
                          found[props.field.ajaxConfig?.labelKey || 'label'] ||
                          found.name ||
                          String(
                              found.value !== undefined
                                  ? found.value
                                  : found.id,
                          ),
                value: found.value !== undefined ? found.value : found.id,
                ...found,
            };
        } else {
            // Preserve current selectedOption ONLY if it has a real label (not placeholder)
            if (
                selectedOption.value &&
                matchesValue(selectedOption.value, newVal) &&
                selectedOption.value.label !== String(newVal)
            ) {
                return;
            }

            selectedOption.value = {
                label: String(newVal),
                value: newVal,
            };
        }
    },
    { immediate: true, deep: true },
);

const internalValue = computed({
    get: () => props.value,
    set: (val) => {
        if (props.field.type === 'vue-select') {
            const found = currentOptions.value.find(
                (o) => (typeof o === 'object' ? o.value : o) == val,
            );
            if (found && typeof found === 'object') {
                selectedOption.value = found;
            } else if (!val) {
                selectedOption.value = null;
                if (props.field.ajaxConfig?.resetOnEmpty !== false) {
                    dynamicOptions.value = [];
                }
            }
        }
        emit('update', props.field.name, val);
    },
});

// Sizes come from utils/sizing.ts: a token (xs … 7xl) or raw Tailwind classes, which are applied as
// given; the inline style only fills what those classes leave out.
const ctl = computed(() => resolveControlSize(props.size));
const computedSizeClass = computed(() => ctl.value.className);
// Identical GETs issued at the same moment (a form with several fields on one endpoint, each resolving its
// saved id on mount) share one request. The entry is dropped the moment it settles, so nothing is ever served
// stale -- this only collapses duplicates that are already in flight.
const inFlightLookups = new Map<string, Promise<any>>();
const sharedLookup = (endpoint: string, params: Record<string, any>) => {
    const key = endpoint + '?' + JSON.stringify(params);
    let pending = inFlightLookups.get(key);
    if (!pending) {
        pending = axios
            .get(endpoint, {
                params,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            })
            .finally(() => inFlightLookups.delete(key));
        inFlightLookups.set(key, pending);
    }
    return pending;
};
// Only the newest typed search may write into the list: an older, slower answer arriving late would
// otherwise replace the options for what the user has since typed.
let searchSeq = 0;
const handleSearch = (
    search: string,
    loading: (status: boolean) => void,
    isId: boolean = false,
) => {
    // Don't clear results immediately — avoids a "No Results" flash while new ones load.
    if (!isId && search.length < 1 && !props.field.ajaxConfig?.prefetch && !props.field.ajaxConfig?.loadOnFocus) {
        if (props.field.ajaxConfig?.resetOnEmpty !== false) {
            dynamicOptions.value = [];
        }
        return;
    }

    if (!props.field.ajaxConfig) return;

    if (debounceTimer) clearTimeout(debounceTimer);

    const executeSearch = async () => {
        const seq = isId ? searchSeq : ++searchSeq;
        // Empty search strings are allowed here (load initial data); isLoading guards against state fighting.
        isLoading.value = true;
        try {
            const config = props.field.ajaxConfig!;
            const method = (config.method || 'GET').toLowerCase();
            const searchParam = config.searchParam || 'search';
            const resultsPath = config.resultsPath; // No default 'data'
            const labelKey = config.labelKey || 'label';
            const valueKey = config.valueKey || 'value';

            let resolvedParams: Record<string, any> = {};
            if (config.params) {
                if (typeof config.params === 'function') {
                    resolvedParams = (config.params as any)(
                        props.formData || props.form || {},
                    );
                } else {
                    resolvedParams = { ...config.params };
                }
            }

            let response: any;
            if (method === 'get') {
                const params = { ...resolvedParams };
                if (isId) {
                    params.id = search;
                } else {
                    params[searchParam] = search;
                }
                response = await sharedLookup(config.endpoint, params);
            } else {
                const body = isId
                    ? { id: search, ...resolvedParams }
                    : { [searchParam]: search, ...resolvedParams };
                response = await axios[method as 'post' | 'put' | 'patch'](
                    config.endpoint,
                    body,
                    {
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            Accept: 'application/json',
                        },
                    },
                );
            }

            if (!isId && seq !== searchSeq) return;

            const data = response.data;

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
                const mapped = results.map((item) => ({
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

                let finalMapped = mapped;
                if (typeof config.transformOptions === 'function') {
                    finalMapped = config.transformOptions(
                        mapped,
                        props.formData || {},
                        props.form,
                        props.row,
                    );
                    const updatedVal = props.formData?.[props.field.name];
                    if (updatedVal !== undefined && updatedVal !== props.value) {
                        emit('update', props.field.name, updatedVal);
                    }
                }

                if (isId) {
                    if (finalMapped.length === 0) {
                        // Avoid infinite loop by caching the negative result
                        dynamicOptions.value = [
                            ...dynamicOptions.value,
                            { label: String(search), value: search, notFound: true }
                        ];
                    } else {
                        dynamicOptions.value = [...dynamicOptions.value, ...finalMapped];
                    }
                } else {
                    dynamicOptions.value = finalMapped;
                }
            } else if (!isId) {
                dynamicOptions.value = [];
            }
        } catch (error) {
            console.error('Error fetching dynamic options:', error);
            if (!isId) {
                dynamicOptions.value = [];
            }
        } finally {
            if (isId || seq === searchSeq) isLoading.value = false;
        }
    };

    if (isId || (search.length === 0 && props.field.ajaxConfig?.loadOnFocus)) {
        executeSearch();
    } else {
        debounceTimer = setTimeout(executeSearch, 300);
    }
};

// Helper to trigger ID-based search for labels
const resolveInitialValue = (val: any) => {
    if (props.field.multiple && Array.isArray(val)) {
        val.forEach((id) => resolveInitialValue(id));
        return;
    }

    if (
        val !== null &&
        val !== undefined &&
        val !== '' &&
        props.field.ajaxConfig &&
        (typeof val === 'number' || typeof val === 'string')
    ) {
        // 1. Check if it's already in the selected cache with a resolved label (not a placeholder ID string)
        const alreadyCached = Array.isArray(selectedOption.value)
            ? (selectedOption.value as any[]).some((c: any) =>
                  matchesValue(c, val) && c.label !== String(val),
              )
            : (selectedOption.value && matchesValue(selectedOption.value, val) && selectedOption.value.label !== String(val));

        if (alreadyCached) return;

        // 2. Only fetch if we don't already have this ID in our dynamic options
        const alreadyFetched = dynamicOptions.value.find((o) =>
            matchesValue(o, val),
        );

        if (!alreadyFetched) {
            handleSearch(
                String(val),
                (s: boolean) => (isLoading.value = s),
                true, // isId = true
            );
        }
    }
};

onMounted(() => {
    resolveInitialValue(props.value);

    if (props.field.ajaxConfig?.prefetch) {
        handleSearch('', (s) => (isLoading.value = s));
    }
});

// An ajax list that depends on other fields (e.g. tables free at a chosen time) must not keep
// serving what it loaded for the old answers: clear it when a named field changes, so the next
// open re-queries with the current form values.
watch(
    () => (props.field.ajaxConfig?.refetchOn ?? []).map((name) => JSON.stringify(props.formData?.[name] ?? null)).join('|'),
    (now, before) => {
        if (now === before || !props.field.ajaxConfig?.refetchOn?.length) return;
        dynamicOptions.value = [];
    },
);

// Reactive resolution if value changes (e.g. late data hydration)
watch(
    () => props.value,
    (newVal) => {
        resolveInitialValue(newVal);
    },
);

// Only the already-selected icon loads eagerly; the rest load via displayedIcons below.
if (props.field.type === 'icon' && typeof props.value === 'string') {
    ensureIconsLoaded([props.value]);
}

if (props.field.type === 'icon-picker' || props.field.type === 'icon') {
    ensureIconCatalogueLoaded();
}

const iconPickerOpen = ref(false);

// iconSearch is the debounced version of iconSearchRaw, to avoid re-filtering 1500 icons per keystroke.
const iconSearchRaw = ref('');
const iconSearch = ref('');
let iconSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const handleIconSearchInput = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    iconSearchRaw.value = val;
    if (iconSearchDebounceTimer) clearTimeout(iconSearchDebounceTimer);
    iconSearchDebounceTimer = setTimeout(() => {
        iconSearch.value = val;
    }, 200);
};

const iconPickerRef = ref<HTMLElement | null>(null);
const iconDropdownRef = ref<HTMLElement | null>(null);
const iconSearchInputRef = ref<HTMLInputElement | null>(null);
const iconDropdownPosition = ref<'top' | 'bottom'>('bottom');
const iconDropdownStyle = ref<Record<string, string>>({});

const filteredIcons = computed(() => {
    const q = iconSearch.value.trim().toLowerCase();
    if (!q) return iconList.value;
    return iconList.value.filter((i) => i.name.toLowerCase().includes(q));
});

// Capped even when searching — typing 'a' would otherwise render 500+ icons at once.
const MAX_UNFILTERED_ICONS = 150;
const displayedIcons = computed(() => {
    return filteredIcons.value.slice(0, MAX_UNFILTERED_ICONS);
});

// Loads components for the visible slice only, so opening the picker never loads the whole set.
watch(
    displayedIcons,
    (list) => ensureIconsLoaded(list.map((i) => i.name)),
    { immediate: true },
);

const selectIcon = (name: string) => {
    emit('update', props.field.name, name);
    iconPickerOpen.value = false;
    iconSearch.value = '';
    iconSearchRaw.value = '';
};

const clearIcon = () => {
    emit('update', props.field.name, '');
    iconPickerOpen.value = false;
    iconSearch.value = '';
    iconSearchRaw.value = '';
};

// Guards against the async watch below touching refs after teardown (it awaits nextTick()).
let isMounted = true;

// Auto-focus the search box and determine position when the picker opens
watch(iconPickerOpen, async (isOpen) => {
    if (isOpen) {
        if (iconPickerRef.value) {
            const rect = iconPickerRef.value.getBoundingClientRect();
            const DROPDOWN_HEIGHT = 340;
            const spaceBelow = window.innerHeight - rect.bottom;
            const width = Math.max(rect.width, 320);

            if (spaceBelow < DROPDOWN_HEIGHT) {
                iconDropdownStyle.value = {
                    position: 'fixed',
                    bottom: `${window.innerHeight - rect.top + 4}px`,
                    left: `${rect.left}px`,
                    width: `${width}px`,
                };
                iconDropdownPosition.value = 'top';
            } else {
                iconDropdownStyle.value = {
                    position: 'fixed',
                    top: `${rect.bottom + 4}px`,
                    left: `${rect.left}px`,
                    width: `${width}px`,
                };
                iconDropdownPosition.value = 'bottom';
            }
        }
        await nextTick();
        if (!isMounted) return;
        iconSearchInputRef.value?.focus();
    }
});

// Dropdown is teleported to body, so both refs must be checked to detect an outside click.
const handleClickOutsideIconPicker = (event: MouseEvent) => {
    if (!iconPickerOpen.value) return;
    const target = event.target as Node;
    const clickedInsideTrigger = iconPickerRef.value?.contains(target);
    const clickedInsideDropdown = iconDropdownRef.value?.contains(target);
    if (!clickedInsideTrigger && !clickedInsideDropdown) {
        iconPickerOpen.value = false;
        iconSearch.value = '';
    }
};

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutsideIconPicker);
});

// Closes the picker before teardown so the teleported content unmounts cleanly.
onBeforeUnmount(() => {
    isMounted = false;
    if (iconSearchDebounceTimer) clearTimeout(iconSearchDebounceTimer);
    if (iconPickerOpen.value) {
        iconPickerOpen.value = false;
        iconSearch.value = '';
        iconSearchRaw.value = '';
    }
});

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutsideIconPicker);
});
</script>

<!-- vue-select base CSS — global (non-scoped), so .vs__* selectors aren't attribute-scoped by Vue. -->
<style>
/* stylelint-disable */
@layer vue-select {
:root{--vs-colors--lightest: rgba(60, 60, 60, .26);--vs-colors--light: rgba(60, 60, 60, .5);--vs-colors--dark: #333;--vs-colors--darkest: rgba(0, 0, 0, .15);--vs-search-input-color: inherit;--vs-search-input-placeholder-color: inherit;--vs-font-size: 1rem;--vs-line-height: 1.4;--vs-state-disabled-bg: rgb(248, 248, 248);--vs-state-disabled-color: var(--vs-colors--light);--vs-state-disabled-controls-color: var(--vs-colors--light);--vs-state-disabled-cursor: not-allowed;--vs-border-color: var(--vs-colors--lightest);--vs-border-width: 1px;--vs-border-style: solid;--vs-border-radius: 4px;--vs-actions-padding: 4px 6px 0 3px;--vs-controls-color: var(--vs-colors--light);--vs-controls-size: 1;--vs-controls--deselect-text-shadow: 0 1px 0 #fff;--vs-selected-bg: #f0f0f0;--vs-selected-color: var(--vs-colors--dark);--vs-selected-border-color: var(--vs-border-color);--vs-selected-border-style: var(--vs-border-style);--vs-selected-border-width: var(--vs-border-width);--vs-dropdown-bg: #fff;--vs-dropdown-color: inherit;--vs-dropdown-z-index: 1000;--vs-dropdown-min-width: 160px;--vs-dropdown-max-height: 350px;--vs-dropdown-box-shadow: 0px 3px 6px 0px var(--vs-colors--darkest);--vs-dropdown-option-bg: #000;--vs-dropdown-option-color: var(--vs-dropdown-color);--vs-dropdown-option-padding: 3px 20px;--vs-dropdown-option--active-bg: #5897fb;--vs-dropdown-option--active-color: #fff;--vs-dropdown-option--deselect-bg: #fb5858;--vs-dropdown-option--deselect-color: #fff;--vs-transition-timing-function: cubic-bezier(1, -.115, .975, .855);--vs-transition-duration: .15s}
.v-select{position:relative;font-family:inherit}.v-select,.v-select *{box-sizing:border-box}
:root{--vs-transition-timing-function: cubic-bezier(1, .5, .8, 1);--vs-transition-duration: .15s}
@keyframes vSelectSpinner{0%{transform:rotate(0)}to{transform:rotate(360deg)}}
.vs__fade-enter-active,.vs__fade-leave-active{pointer-events:none;transition:opacity var(--vs-transition-duration) var(--vs-transition-timing-function)}
.vs__fade-enter,.vs__fade-leave-to{opacity:0}
:root{--vs-disabled-bg: var(--vs-state-disabled-bg);--vs-disabled-color: var(--vs-state-disabled-color);--vs-disabled-cursor: var(--vs-state-disabled-cursor)}
.vs--disabled .vs__dropdown-toggle,.vs--disabled .vs__clear,.vs--disabled .vs__search,.vs--disabled .vs__selected,.vs--disabled .vs__open-indicator{cursor:var(--vs-disabled-cursor);background-color:var(--vs-disabled-bg)}
.v-select[dir=rtl] .vs__actions{padding:0 3px 0 6px}.v-select[dir=rtl] .vs__clear{margin-left:6px;margin-right:0}.v-select[dir=rtl] .vs__deselect{margin-left:0;margin-right:2px}.v-select[dir=rtl] .vs__dropdown-menu{text-align:right}
.vs__dropdown-toggle{appearance:none;display:flex;padding:0 0 4px;background:none;border:var(--vs-border-width) var(--vs-border-style) var(--vs-border-color);border-radius:var(--vs-border-radius);white-space:normal}
.vs__selected-options{display:flex;flex-basis:100%;flex-grow:1;flex-wrap:wrap;padding:0 2px;position:relative}
.vs__actions{display:flex;align-items:center;padding:var(--vs-actions-padding)}
.vs--searchable .vs__dropdown-toggle{cursor:text}.vs--unsearchable .vs__dropdown-toggle{cursor:pointer}
.vs--open .vs__dropdown-toggle{border-bottom-color:transparent;border-bottom-left-radius:0;border-bottom-right-radius:0}
.vs__open-indicator{fill:var(--vs-controls-color);transform:scale(var(--vs-controls-size));transition:transform var(--vs-transition-duration) var(--vs-transition-timing-function);transition-timing-function:var(--vs-transition-timing-function)}
.vs--open .vs__open-indicator{transform:rotate(180deg) scale(var(--vs-controls-size))}
.vs--loading .vs__open-indicator{opacity:0}
.vs__clear{fill:var(--vs-controls-color);padding:0;border:0;background-color:transparent;cursor:pointer;margin-right:8px}
.vs__dropdown-menu{display:block;box-sizing:border-box;position:absolute;top:calc(100% - var(--vs-border-width));left:0;z-index:var(--vs-dropdown-z-index);padding:5px 0;margin:0;width:100%;max-height:var(--vs-dropdown-max-height);min-width:var(--vs-dropdown-min-width);overflow-y:auto;box-shadow:var(--vs-dropdown-box-shadow);border:var(--vs-border-width) var(--vs-border-style) var(--vs-border-color);border-top-style:none;border-radius:0 0 var(--vs-border-radius) var(--vs-border-radius);text-align:left;list-style:none;background:var(--vs-dropdown-bg);color:var(--vs-dropdown-color)}
.vs__no-options{text-align:center}
.vs__dropdown-option{line-height:1.42857143;display:block;padding:var(--vs-dropdown-option-padding);clear:both;color:var(--vs-dropdown-option-color);white-space:nowrap;cursor:pointer}
.vs__dropdown-option--highlight{background:var(--vs-dropdown-option--active-bg);color:var(--vs-dropdown-option--active-color)}
.vs__dropdown-option--deselect{background:var(--vs-dropdown-option--deselect-bg);color:var(--vs-dropdown-option--deselect-color)}
.vs__dropdown-option--disabled{background:var(--vs-state-disabled-bg);color:var(--vs-state-disabled-color);cursor:var(--vs-state-disabled-cursor)}
.vs__selected{display:flex;align-items:center;background-color:var(--vs-selected-bg);border:var(--vs-selected-border-width) var(--vs-selected-border-style) var(--vs-selected-border-color);border-radius:var(--vs-border-radius);color:var(--vs-selected-color);line-height:var(--vs-line-height);margin:4px 2px 0;padding:0 .25em;z-index:0}
.vs__deselect{display:inline-flex;appearance:none;margin-left:4px;padding:0;border:0;cursor:pointer;background:none;fill:var(--vs-controls-color);text-shadow:var(--vs-controls--deselect-text-shadow)}
.vs--single .vs__selected{background-color:transparent;border-color:transparent}
.vs--single.vs--open .vs__selected,.vs--single.vs--loading .vs__selected{position:absolute;opacity:.4}
.vs--single.vs--searching .vs__selected{display:none}
/* Split from the original combined rule that included ::-ms-clear (IE only) */
.vs__search::-webkit-search-cancel-button{display:none}
.vs__search::-webkit-search-decoration{display:none}
.vs__search::-webkit-search-results-button{display:none}
.vs__search::-webkit-search-results-decoration{display:none}
.vs__search,.vs__search:focus{color:var(--vs-search-input-color);appearance:none;line-height:var(--vs-line-height);font-size:var(--vs-font-size);border:1px solid transparent;border-left:none;outline:none;margin:4px 0 0;padding:0 7px;background:none;box-shadow:none;width:0;max-width:100%;flex-grow:1;z-index:1}
.vs__search::placeholder{color:var(--vs-search-input-placeholder-color)}
.vs--unsearchable .vs__search{opacity:1}
.vs--unsearchable:not(.vs--disabled) .vs__search{cursor:pointer}
.vs--single.vs--searching:not(.vs--open):not(.vs--loading) .vs__search{opacity:.2}
.vs__spinner{align-self:center;opacity:0;font-size:5px;text-indent:-9999em;overflow:hidden;border-top:.9em solid rgba(100,100,100,.1);border-right:.9em solid rgba(100,100,100,.1);border-bottom:.9em solid rgba(100,100,100,.1);border-left:.9em solid rgba(60,60,60,.45);transform:translateZ(0) scale(var(--vs-controls--spinner-size, var(--vs-controls-size)));animation:vSelectSpinner 1.1s infinite linear;transition:opacity .1s}
.vs__spinner,.vs__spinner:after{border-radius:50%;width:5em;height:5em;transform:scale(var(--vs-controls--spinner-size, var(--vs-controls-size)))}
.vs--loading .vs__spinner{opacity:1}
}
/* stylelint-enable */
</style>

<!-- Custom overrides on vue-select's base CSS above. Global, not :deep()/:global() scoped —
     this is the only component rendering .vue-select-custom markup. -->
<style>
.vue-select-custom .vs__dropdown-toggle {
    border: none;
    background-color: transparent;
    display: flex;
    align-items: center;
    padding: 0 !important;
    /* Without this, a wrapping (not truncating) long label overflows this fixed-height
       box and, since .vs__selected is z-index:1, visually overlaps the field's own label. */
    overflow: hidden;
}

/* Heights come from utils/sizing.ts. FormField sets --ub-control-h (outer height) and --ub-control-lh
   (text line, outer minus 4px) inline for a size token; the classes below set the same pair for the
   sm/md/lg/xl class names FilterBar and Pagination still put on their selects. With raw Tailwind classes
   neither is set, and the inner parts take the height the root's own classes give it (100%). FormField marks
   its selects .ub-sized; a .vue-select-custom with no size class (a page's own select) is left alone. The inner
   toggle sits inside a 1px border top and bottom, hence the 2px. */
.vue-select-custom.xs { --ub-control-h: 28px; --ub-control-lh: 24px; }
.vue-select-custom.sm { --ub-control-h: 32px; --ub-control-lh: 28px; }
.vue-select-custom.md { --ub-control-h: 36px; --ub-control-lh: 32px; }
.vue-select-custom.lg { --ub-control-h: 40px; --ub-control-lh: 36px; }
.vue-select-custom.xl { --ub-control-h: 44px; --ub-control-lh: 40px; }

.vue-select-custom:is(.xs, .sm, .md, .lg, .xl, .ub-sized) .vs__dropdown-toggle {
    min-height: calc(var(--ub-control-h, calc(100% + 2px)) - 2px);
    height: calc(var(--ub-control-h, calc(100% + 2px)) - 2px);
}
/* Large sizes move the text in from the border the way the matching text input does. */
.vue-select-custom.ub-sized:not(.has-field-icon) .vs__selected-options {
    padding-left: var(--ub-vs-pad, 4px);
}
.vue-select-custom:is(.xs, .sm, .md, .lg, .xl, .ub-sized) .vs__selected,
.vue-select-custom:is(.xs, .sm, .md, .lg, .xl, .ub-sized) .vs__search,
.vue-select-custom:is(.xs, .sm, .md, .lg, .xl, .ub-sized) .vs__actions {
    height: calc(var(--ub-control-h, calc(100% + 2px)) - 4px) !important;
    line-height: var(--ub-control-lh, normal) !important;
    margin: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

/* The native calendar/clock button of a date or time field grows with the field's text. */
.ub-date-input::-webkit-calendar-picker-indicator {
    width: max(16px, 0.9em);
    height: max(16px, 0.9em);
    background-size: contain;
}

/* Allow the outer container (which has the border) to grow when tags warp */
.vue-select-custom.multiple {
    height: auto !important;
}

/* Multi-select: Keep toggle as a single flex row so the arrow stays pinned right */
.vue-select-custom.multiple .vs__dropdown-toggle {
    height: auto !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    padding: 0 !important;
}
/* The selected-options container handles the wrapping and scrolling internally */
.vue-select-custom.multiple .vs__selected-options {
    flex-wrap: wrap !important;
    max-height: 90px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 1px 0 1px 4px !important;
    scrollbar-width: thin;
    scrollbar-color: rgba(150, 150, 150, 0.4) transparent;
}
.vue-select-custom.has-field-icon.multiple .vs__selected-options {
    padding-left: 32px !important;
}
/* Badge slot takes over coloring; just clear the default vs__selected shell */
.vue-select-custom.multiple .vs__selected {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
}

.vue-select-custom .vs__selected-options {
    padding: 0 4px;
    display: flex;
    align-items: center;
    flex-basis: 0;
    flex-grow: 1;
    overflow: hidden;
}

.vue-select-custom.has-field-icon .vs__selected-options {
    padding-left: 4px !important;
}

.vue-select-custom.has-field-icon .vs__search {
    padding-left: 28px !important;
    margin-left: 0 !important;
}

.vue-select-custom.has-field-icon .vs__selected {
    padding-left: 28px !important;
}

.vue-select-custom .vs__actions {
    padding: 0 4px 0 0;
    display: flex;
    align-items: center;
    height: 100%;
}

.vue-select-custom .vs__search {
    margin: 0;
    padding: 0 4px;
    border: none;
    color: inherit !important;
}

.vue-select-custom .vs__dropdown-menu {
    background-color: inherit;
    border-color: inherit;
    z-index: 1000;
}

/* Global since append-to-body teleports this outside any component's scoped DOM subtree. */
.vs__dropdown-menu {
    background-color: white !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    border-radius: var(--radius-md, 0.375rem) !important;
    overflow-y: auto !important;
    max-height: var(--vs-dropdown-max-height, 350px) !important;
    margin-top: 4px !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
}

.dark .vs__dropdown-menu {
    background-color: #0f172a !important; /* bg-slate-900 */
    border-color: #1e293b !important; /* border-slate-800 */
}

.vue-select-custom .vs__selected {
    margin: 0;
    padding: 0;
    position: relative;
    z-index: 1;
    color: inherit !important;
}

/* Single-select only — truncates instead of wrapping/overflowing the fixed-height toggle. */
.vue-select-custom:not(.multiple) .vs__selected {
    display: block;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.vue-select-custom .vs__dropdown-option {
    color: inherit !important;
    padding: 6px 10px;
    font-size: 0.875rem;
    text-align: left;
}

.vs__dropdown-option {
    color: #1e293b !important; /* text-slate-800 */
    padding: 6px 10px !important;
    font-size: 0.875rem !important;
    text-align: left !important;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.dark .vs__dropdown-option {
    color: #f1f5f9 !important; /* text-slate-100 */
}

.vue-select-custom .vs__dropdown-option--highlight {
    background-color: var(--vs-highlight-bg, #3b82f6) !important;
    color: white !important;
}

.vs__dropdown-option--highlight {
    background-color: var(--vs-highlight-bg, #3b82f6) !important;
    color: white !important;
}

/* Dark mode keeps the accent as a tint, not a solid fill: options hovered one after another would
   otherwise flash a saturated bar over a near-black menu. Selected tags follow the same rule. */
.dark .vue-select-custom .vs__dropdown-option--highlight,
.dark .vs__dropdown-option--highlight {
    background-color: color-mix(in srgb, var(--vs-highlight-bg, #3b82f6) 22%, transparent) !important;
    color: #f5f5f5 !important;
}

/* Declared on whichever element sets --vs-highlight-bg inline (the field, a filter, an appended menu), so the
   mix resolves against that element's own accent and its descendants inherit the result. */
.dark [style*='--vs-highlight-bg'] {
    --vs-tag-bg: color-mix(in srgb, var(--vs-highlight-bg, #3b82f6) 20%, transparent);
    --vs-tag-fg: color-mix(in srgb, var(--vs-highlight-bg, #3b82f6) 40%, white);
}

.vue-select-custom .vs__search::placeholder {
    color: #9ca3af; /* text-gray-400 */
}

@media (max-width: 640px) {
    .vue-select-custom .vs__dropdown-option {
        padding: 10px 8px;
        font-size: 14px;
    }
    .vs__dropdown-option {
        padding: 10px 8px !important;
        font-size: 14px !important;
    }
}

/* Quill hardcodes LTR styles (text-align/float: left), so RTL needs explicit overrides here. */
[dir='rtl'] .ql-editor {
    direction: rtl;
    text-align: right;
}
[dir='rtl'] .ql-editor.ql-blank::before {
    right: 15px;
    left: 15px;
    text-align: right;
}
[dir='rtl'] .ql-toolbar.ql-snow {
    direction: rtl;
    text-align: right;
}
[dir='rtl'] .ql-toolbar.ql-snow .ql-formats {
    margin-right: 0;
    margin-left: 15px;
}
[dir='rtl'] .ql-snow.ql-toolbar button,
[dir='rtl'] .ql-snow .ql-toolbar button,
[dir='rtl'] .ql-snow .ql-picker {
    float: right;
}
[dir='rtl'] .ql-snow .ql-picker-label {
    padding-right: 8px;
    padding-left: 2px;
}
[dir='rtl'] .ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg {
    right: auto;
    left: 0;
}
[dir='rtl'] .ql-snow .ql-picker-options {
    text-align: right;
}
[dir='rtl'] .ql-snow .ql-color-picker .ql-picker-item {
    float: right;
}
</style>

<style scoped>
.loading-fade-enter-active,
.loading-fade-leave-active {
    transition: all 0.25s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
    opacity: 0;
    transform: scale(0.98);
}

:deep(.ql-toolbar.ql-snow) {
    border-top-left-radius: var(--radius-md, 0.375rem);
    border-top-right-radius: var(--radius-md, 0.375rem);
    border: none !important;
    border-bottom: 1px solid !important;
    border-color: inherit !important;
    background-color: var(--ql-theme-bg, rgba(255, 255, 255, 0.05));
    padding: 8px;
    transition: background-color 0.2s;
}

:deep(.ql-container.ql-snow) {
    border-bottom-left-radius: var(--radius-md, 0.375rem);
    border-bottom-right-radius: var(--radius-md, 0.375rem);
    border: none !important;
    font-family: inherit;
    font-size: var(--ub-editor-font, 0.875rem);
    background-color: transparent !important;
}

:deep(.ql-editor) {
    min-height: 200px;
}

:deep(.ql-editor.ql-blank::before) {
    color: inherit;
    opacity: 0.4;
    font-style: normal;
}

:deep(.ql-snow.ql-toolbar button:hover),
:deep(.ql-snow .ql-toolbar button:hover),
:deep(.ql-snow.ql-toolbar button:focus),
:deep(.ql-snow .ql-toolbar button:focus),
:deep(.ql-snow.ql-toolbar button.ql-active),
:deep(.ql-snow .ql-toolbar button.ql-active),
:deep(.ql-snow.ql-toolbar .ql-picker-label:hover),
:deep(.ql-snow .ql-toolbar .ql-picker-label:hover),
:deep(.ql-snow.ql-toolbar .ql-picker-label.ql-active),
:deep(.ql-snow .ql-toolbar .ql-picker-label.ql-active),
:deep(.ql-snow.ql-toolbar .ql-picker-item:hover),
:deep(.ql-snow .ql-toolbar .ql-picker-item:hover),
:deep(.ql-snow.ql-toolbar .ql-picker-item.ql-selected),
:deep(.ql-snow .ql-toolbar .ql-picker-item.ql-selected) {
    color: var(--ql-theme-color, #3b82f6) !important;
}

:deep(.ql-snow.ql-toolbar button:hover .ql-stroke),
:deep(.ql-snow .ql-toolbar button:hover .ql-stroke),
:deep(.ql-snow.ql-toolbar button.ql-active .ql-stroke),
:deep(.ql-snow .ql-toolbar button.ql-active .ql-stroke),
:deep(.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke),
:deep(.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke),
:deep(.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke),
:deep(.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke),
:deep(.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke),
:deep(.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke),
:deep(.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke),
:deep(.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke),
:deep(.ql-snow.ql-toolbar button:hover .ql-stroke-miter),
:deep(.ql-snow .ql-toolbar button:hover .ql-stroke-miter),
:deep(.ql-snow.ql-toolbar button.ql-active .ql-stroke-miter),
:deep(.ql-snow .ql-toolbar button.ql-active .ql-stroke-miter) {
    stroke: var(--ql-theme-color, #3b82f6) !important;
}

:deep(.ql-snow.ql-toolbar button:hover .ql-fill),
:deep(.ql-snow .ql-toolbar button:hover .ql-fill),
:deep(.ql-snow.ql-toolbar button.ql-active .ql-fill),
:deep(.ql-snow .ql-toolbar button.ql-active .ql-fill),
:deep(.ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill),
:deep(.ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill),
:deep(.ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill),
:deep(.ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill),
:deep(.ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill),
:deep(.ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill),
:deep(.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill),
:deep(.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill) {
    fill: var(--ql-theme-color, #3b82f6) !important;
}

:deep(.ql-snow .ql-stroke) {
    stroke: currentColor;
}

:deep(.ql-snow .ql-fill) {
    fill: currentColor;
}

:deep(.ql-editor) {
    min-height: var(--quill-min-height, 250px) !important;
}

:deep(.ql-snow .ql-picker) {
    color: currentColor;
}

:deep(.ql-snow .ql-picker-options) {
    background-color: var(--theme-menu-background, #fff) !important;
    border-color: var(--theme-menu-border, #e5e7eb) !important;
    color: var(--theme-menu-text, #111827) !important;
    border-radius: var(--radius-md, 0.375rem);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 100;
}

.dark :deep(.ql-snow .ql-picker-options) {
    background-color: #1f2937 !important; /* bg-gray-800 */
    border-color: #374151 !important; /* bg-gray-700 */
    color: #f3f4f6 !important; /* bg-gray-100 */
}
</style>
