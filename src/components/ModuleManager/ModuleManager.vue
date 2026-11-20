<template>
    <div
        :class="`density-transition rounded-lg border p-4 shadow-lg md:p-0 ${appliedTheme.cardBackground} ${appliedTheme.cardBorder}`"
    >
        <AccessDenied
            v-if="!canView"
            :module-name="config.moduleName"
            :theme="appliedTheme"
        />

        <template v-else>
            <div :class="headerPaddingClass">
                <ModuleHeader
                    :module-name="config.moduleName"
                    :module-icon="resolvedModuleIcon"
                    :description="config.description"
                    :total-count="totalCount"
                    :search-term="searchTerm"
                    :has-active-filters="hasActiveFilters"
                    :is-refreshing="isRefreshing"
                    :can-export="canExport"
                    :can-create="
                        config.actionConfig?.create?.show !== false && canCreate
                    "
                    :can-import="canImport"
                    :theme="appliedTheme"
                    :density="density"
                    :create-icon="
                        config.actionConfig?.create?.icon || config.createIcon
                    "
                    :export-icon="config.actionConfig?.export?.icon"
                    :custom-header-actions="visibleCustomHeaderActions"
                    :view-scope="savedViewScope"
                    @custom-header-action="handleCustomHeaderAction"
                    @search-change="searchTerm = $event"
                    @clear-search="searchTerm = ''"
                    @clear-filters="handleClearFilters"
                    @refresh="handleRefresh"
                    @export="handleExport"
                    @import="isImportDialogOpen = true"
                    @create-click="openCreateDialog"
                />

                <FilterBar
                    :has-status-filter="hasStatusFilter"
                    :status-filter="statusFilter"
                    :enable-date-filter="config.enableDateFilter"
                    :date-range="dateRange"
                    :custom-filters="config.customFilters"
                    :custom-filter-values="customFilters"
                    :filter-config="effectiveFilterConfig"
                    :enable-theme-selector="showThemeSelector"
                    :selected-theme="selectedTheme"
                    :density="density"
                    :theme="appliedTheme"
                    :config="config"
                    :columns="config.tableColumns"
                    :data="data"
                    :visible-columns="visibleColumns"
                    :export-actions="visibleExportActions"
                    @export-action="handleExportAction"
                    @status-change="handleStatusFilter"
                    @date-range-change="handleDateRangeChange"
                    @custom-filter-change="handleCustomFilterChange"
                    @theme-change="handleThemeChange"
                    @export="openExportDialog"
                />
            </div>

            <div :class="contentPaddingClass">
                <div class="relative">
                    <div>
                        <template v-if="loading">
                            <GridSkeleton
                                v-if="
                                    config.gridConfig?.enabled &&
                                    layout === 'grid'
                                "
                                :grid-config="config.gridConfig"
                                :per-page="perPage"
                                :theme="appliedTheme"
                            />
                            <TableSkeleton
                                v-else
                                :columns="config.tableColumns"
                                :visible-columns="visibleColumns"
                                :per-page="perPage"
                                :has-checkbox="
                                    visibleColumns.includes('select')
                                "
                                :density="density"
                                :theme="appliedTheme"
                            />

                            <PaginationSkeleton
                                :is-sticky="true"
                                :show-pagination="true"
                                :theme="appliedTheme"
                                :density="density"
                            />
                        </template>

                        <EmptyState
                            v-else-if="data.length === 0"
                            :module-name="config.moduleName"
                            :has-active-filters="hasActiveFilters"
                            :can-create="canCreate"
                            :theme="appliedTheme"
                            :density="density"
                            @create-click="openCreateDialog"
                        />

                        <template v-else>
                            <!-- Grid-enabled: one persistent shared toolbar; only table/grid swaps via Transition below. -->
                            <div
                                v-if="config.gridConfig?.enabled"
                                :class="`overflow-hidden rounded-lg border ${tableTheme.tableBorder} ${tableTheme.tableBackground}`"
                            >
                                <DataToolbar
                                    :layout="layout"
                                    :show-layout-toggle="true"
                                    :columns="config.tableColumns"
                                    :grid-config="config.gridConfig"
                                    :visible-columns="visibleColumns"
                                    :data="data"
                                    :selected-rows="selectedRows"
                                    :custom-bulk-actions="
                                        visibleCustomBulkActions
                                    "
                                    :can-bulk-delete="canBulkDelete"
                                    :action-config="effectiveActionConfig"
                                    :theme="tableTheme"
                                    @toggle-column="handleToggleColumn"
                                    @reset-columns="resetColumns"
                                    @selection-change="selectedRows = $event"
                                    @bulk-action="handleBulkAction"
                                    @update:layout="layout = $event"
                                />

                                <Transition name="layout-fade" mode="out-in">
                                    <div
                                        v-if="layout !== 'grid'"
                                        key="table"
                                        class="overflow-x-auto"
                                    >
                                        <GenericTable
                                            :data="data"
                                            :columns="config.tableColumns"
                                            :selected-theme="selectedTheme"
                                            :visible-columns="visibleColumns"
                                            :sort-config="sortConfig"
                                            :can-update="canUpdate"
                                            :can-delete="canDelete"
                                            :can-bulk-delete="canBulkDelete"
                                            :selected-rows="selectedRows"
                                            :total-count="totalCount"
                                            :theme="tableTheme"
                                            :custom-row-actions="
                                                visibleCustomRowActions
                                            "
                                            :custom-bulk-actions="
                                                visibleCustomBulkActions
                                            "
                                            :update-endpoint="
                                                config.actionConfig?.edit
                                                    ?.endpoint ||
                                                config.api?.update
                                            "
                                            :edit-icon="config.editIcon"
                                            :delete-icon="config.deleteIcon"
                                            :view-icon="config.viewIcon"
                                            :actionConfig="effectiveActionConfig"
                                            :config="config"
                                            :can-view="canViewDetails"
                                            :hide-toolbar="true"
                                            @row-click="openEditDialog"
                                            @view-click="openViewDialog"
                                            @delete="handleDelete"
                                            @bulk-action="handleBulkAction"
                                            @custom-row-action="
                                                handleCustomRowAction
                                            "
                                            @toggle-column="
                                                handleToggleColumn
                                            "
                                            @reset-columns="resetColumns"
                                            @sort="handleSort"
                                            @selection-change="
                                                selectedRows = $event
                                            "
                                            @export="openExportDialog"
                                            :export-actions="visibleExportActions"
                                            @export-action="handleExportAction"
                                        />
                                    </div>
                                    <GenericGrid
                                        v-else
                                        key="grid"
                                        :data="data"
                                        :columns="config.tableColumns"
                                        :grid-config="config.gridConfig"
                                        :selected-theme="selectedTheme"
                                        :visible-columns="visibleColumns"
                                        :can-update="canUpdate"
                                        :can-delete="canDelete"
                                        :can-bulk-delete="canBulkDelete"
                                        :selected-rows="selectedRows"
                                        :total-count="totalCount"
                                        :theme="tableTheme"
                                        :custom-row-actions="
                                            visibleCustomRowActions
                                        "
                                        :custom-bulk-actions="
                                            visibleCustomBulkActions
                                        "
                                        :update-endpoint="
                                            config.actionConfig?.edit
                                                ?.endpoint || config.api?.update
                                        "
                                        :edit-icon="config.editIcon"
                                        :delete-icon="config.deleteIcon"
                                        :view-icon="config.viewIcon"
                                        :actionConfig="effectiveActionConfig"
                                        :config="config"
                                        :can-view="canViewDetails"
                                        :hide-toolbar="true"
                                        @row-click="openEditDialog"
                                        @view-click="openViewDialog"
                                        @delete="handleDelete"
                                        @bulk-action="handleBulkAction"
                                        @custom-row-action="
                                            handleCustomRowAction
                                        "
                                        @toggle-column="handleToggleColumn"
                                        @reset-columns="resetColumns"
                                        @selection-change="
                                            selectedRows = $event
                                        "
                                    />
                                </Transition>
                            </div>

                            <!-- Non-grid: GenericTable renders its own toolbar, no layout switch. -->
                            <div v-else class="overflow-x-auto">
                                <GenericTable
                                    :data="data"
                                    :columns="config.tableColumns"
                                    :selected-theme="selectedTheme"
                                    :visible-columns="visibleColumns"
                                    :sort-config="sortConfig"
                                    :can-update="canUpdate"
                                    :can-delete="canDelete"
                                    :can-bulk-delete="canBulkDelete"
                                    :selected-rows="selectedRows"
                                    :total-count="totalCount"
                                    :theme="tableTheme"
                                    :custom-row-actions="
                                        visibleCustomRowActions
                                    "
                                    :custom-bulk-actions="
                                        visibleCustomBulkActions
                                    "
                                    :update-endpoint="
                                        config.actionConfig?.edit?.endpoint ||
                                        config.api?.update
                                    "
                                    :edit-icon="config.editIcon"
                                    :delete-icon="config.deleteIcon"
                                    :view-icon="config.viewIcon"
                                    :actionConfig="effectiveActionConfig"
                                    :config="config"
                                    :can-view="canViewDetails"
                                    @row-click="openEditDialog"
                                    @view-click="openViewDialog"
                                    @delete="handleDelete"
                                    @bulk-action="handleBulkAction"
                                    @custom-row-action="handleCustomRowAction"
                                    @toggle-column="handleToggleColumn"
                                    @reset-columns="resetColumns"
                                    @sort="handleSort"
                                    @selection-change="selectedRows = $event"
                                    @export="openExportDialog"
                                    :export-actions="visibleExportActions"
                                    @export-action="handleExportAction"
                                />
                            </div>

                            <Pagination
                                v-if="totalPages > 1"
                                :page="currentPage"
                                :total-pages="totalPages"
                                :total-count="totalCount"
                                :per-page="perPage"
                                :theme="appliedTheme"
                                :is-sticky="true"
                                :density="density"
                                @page-change="handlePageChange"
                                @per-page-change="handlePerPageChange"
                            />

                            <Pagination
                                v-else
                                :page="currentPage"
                                :total-pages="totalPages"
                                :total-count="totalCount"
                                :per-page="perPage"
                                :theme="appliedTheme"
                                :is-sticky="true"
                                :density="density"
                                @page-change="handlePageChange"
                                @per-page-change="handlePerPageChange"
                            />
                        </template>
                    </div>
                </div>
            </div>
        </template>

        <DialogWrapper
            v-model:is-open="isDialogOpen"
            :title="
                isCreating
                    ? t('ui-builder.create_item', { module: translatedModuleName })
                    : isViewing
                      ? t('ui-builder.view_item_details', { module: translatedModuleName })
                      : t('ui-builder.edit_item', { module: translatedModuleName })
            "
            :dialog-size="
                isCreating
                    ? actionConfig?.create?.dialogueSize ||
                      config.createDialogSize ||
                      'md'
                    : isViewing
                      ? actionConfig?.detailsView?.dialogueSize || 'md'
                      : actionConfig?.edit?.dialogueSize ||
                        config.editDialogSize ||
                        'md'
            "
            :theme="appliedTheme"
            :density="density"
            @close="handleDialogClose"
            :close-on-backdrop="false"
            :close-on-escape="false"
        >
            <ViewDetails
                v-if="isViewing"
                :config="config"
                :row="editingItem"
                :theme="appliedTheme"
            />
            <GenericForm
                v-else
                :fields="config.formFields"
                :form="isCreating ? createForm : updateForm"
                :is-editing="!isCreating"
                :readonly="isViewing"
                :submit-label="isCreating ? resolveLabel('ui-builder.create') : resolveLabel('ui-builder.update')"
                :default-input-size="config.formInputSize || 'md'"
                :use-grid-layout="true"
                :theme="appliedTheme"
                :density="density"
                :selected-theme="selectedTheme"
                @submit="isCreating ? handleCreate() : handleUpdate()"
            />

            <template v-if="!isViewing" #footer>
                <button
                    type="button"
                    :class="`mr-2 h-9 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${appliedTheme.cardBorder} ${appliedTheme.labelText || ''}`"
                    @click="handleDialogClose"
                >
                    {{ resolveLabel('ui-builder.cancel') }}
                </button>
                <button
                    type="button"
                    :disabled="
                        isCreating ? isCreateProcessing : isUpdateProcessing
                    "
                    :class="`h-9 min-w-[100px] rounded-md px-4 font-medium transition-colors ${appliedTheme.primaryButton} ${(isCreating ? isCreateProcessing : isUpdateProcessing) ? 'cursor-not-allowed opacity-50' : ''}`"
                    @click="isCreating ? handleCreate() : handleUpdate()"
                >
                    <span
                        v-if="
                            isCreating ? isCreateProcessing : isUpdateProcessing
                        "
                        class="flex items-center"
                    >
                        <svg
                            class="me-2 h-4 w-4 animate-spin"
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
                        {{ resolveLabel('ui-builder.saving') }}
                    </span>
                    <span v-else>{{ isCreating ? resolveLabel('ui-builder.create') : resolveLabel('ui-builder.update') }}</span>
                </button>
            </template>
        </DialogWrapper>

        <DialogWrapper
            v-model:is-open="customActionDialog.isOpen"
            :title="resolveLabel(customActionDialog.action?.label || '')"
            :dialog-size="customActionDialog.action?.dialogSize || '2xl'"
            :theme="appliedTheme"
            :density="density"
            @close="closeCustomActionDialog"
            :close-on-backdrop="false"
            :close-on-escape="true"
        >
            <Transition name="fade" mode="out-in">
                <div
                    v-if="customActionDialog.isLoading"
                    key="loading"
                    class="flex min-h-[600px] items-center justify-center"
                >
                    <div
                        class="tkt-animate-spin h-10 w-10 rounded-full border-4 border-slate-200 dark:border-white/15 border-t-current"
                        :class="appliedTheme.loadingText || 'text-blue-600'"
                    ></div>
                </div>

                <SubModuleCrudPanel
                    v-else-if="customActionDialog.action?.crudConfig"
                    key="crud"
                    :crud-config="customActionDialog.action.crudConfig"
                    :row="customActionDialog.row"
                    :theme="appliedTheme"
                    :density="density"
                    :form-input-size="config.formInputSize || 'md'"
                    @change="handleRefresh"
                />

                <div
                    v-else-if="
                        customActionDialog.dynamicContent?.type === 'component'
                    "
                    key="component"
                    class="flex min-h-full flex-col"
                >
                    <component
                        ref="dynamicComponentRef"
                        :is="customActionDialog.dynamicContent.component"
                        :key="
                            customActionDialog.componentKey ||
                            'dynamic-component'
                        "
                        :data="customActionDialog.dynamicContent.data"
                        :row="customActionDialog.row"
                        :theme="appliedTheme"
                        @success="handleRefresh"
                        @close="closeCustomActionDialog"
                        @customRowAction="handleTriggerCustomAction"
                        @triggerAction="handleTriggerCustomAction"
                    />
                </div>

                <div
                    v-else-if="
                        customActionDialog.dynamicContent?.type === 'html'
                    "
                    key="html"
                    class="flex min-h-full flex-col space-y-4"
                >
                    <FormErrors
                        v-if="hasCustomActionErrors"
                        :errors="customActionForm.errors"
                        :theme="appliedTheme"
                    />
                    <div
                        v-html="customActionDialog.dynamicContent.data"
                        class="dynamic-form-container flex-grow"
                        @input="handleHtmlInput"
                        @change="handleHtmlInput"
                    ></div>
                </div>

                <GenericForm
                    v-else
                    key="fields"
                    :fields="
                        customActionDialog.dynamicContent?.type === 'fields'
                            ? customActionDialog.dynamicContent.data
                            : typeof customActionDialog.action?.formFields ===
                                'function'
                              ? customActionDialog.action.formFields(
                                    customActionDialog.row,
                                )
                              : customActionDialog.action?.formFields || []
                    "
                    :form="customActionForm"
                    :row="customActionDialog.row"
                    :is-editing="true"
                    :submit-label="
                        resolveLabel(customActionDialog.action?.submitLabel || 'ui-builder.submit')
                    "
                    :default-input-size="config.formInputSize || 'md'"
                    :use-grid-layout="true"
                    :theme="appliedTheme"
                    :density="density"
                    :selected-theme="selectedTheme"
                    :dnd="customActionDialog.action?.dnd"
                    @submit="handleCustomActionSubmit"
                />
            </Transition>

            <template
                v-if="
                    !customActionDialog.isLoading &&
                    !customActionDialog.action?.crudConfig &&
                    !customActionDialog.action?.renderInDialog &&
                    !customActionDialog.action?.hideFooter
                "
                #footer
            >
                <button
                    type="button"
                    :class="`h-9 min-w-[100px] rounded-md px-4 font-medium transition-colors ${appliedTheme.primaryButton} ${isCustomActionProcessing ? 'cursor-not-allowed opacity-50' : ''}`"
                    :disabled="isCustomActionProcessing"
                    @click="handleCustomActionSubmit"
                >
                    <span
                        v-if="isCustomActionProcessing"
                        class="flex items-center"
                    >
                        <svg
                            class="me-2 h-4 w-4 animate-spin"
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
                        {{ resolveLabel('ui-builder.saving') }}
                    </span>
                    <span v-else>{{
                        resolveLabel(customActionDialog.action?.submitLabel || 'ui-builder.submit')
                    }}</span>
                </button>
            </template>
        </DialogWrapper>

        <!-- Secondary dialog, on top of the custom-action dialog (e.g. Reply while TicketTimeline is open) -->
        <DialogWrapper
            v-model:is-open="secondaryActionDialog.isOpen"
            :title="resolveLabel(secondaryActionDialog.action?.label || resolveLabel('ui-builder.reply'))"
            :dialog-size="secondaryActionDialog.action?.dialogSize || '3xl'"
            :theme="appliedTheme"
            :density="density"
            z-class="z-[60]"
            @close="closeSecondaryActionDialog"
            :close-on-backdrop="false"
            :close-on-escape="false"
        >
            <GenericForm
                v-if="secondaryActionDialog.action"
                :fields="
                    typeof secondaryActionDialog.action?.formFields ===
                    'function'
                        ? secondaryActionDialog.action.formFields(
                              secondaryActionDialog.row,
                          )
                        : secondaryActionDialog.action?.formFields || []
                "
                :form="secondaryActionForm"
                :row="secondaryActionDialog.row"
                :is-editing="true"
                :submit-label="
                    resolveLabel(secondaryActionDialog.action?.submitLabel || 'ui-builder.submit')
                "
                :default-input-size="config.formInputSize || 'md'"
                :use-grid-layout="true"
                :theme="appliedTheme"
                :density="density"
                :selected-theme="selectedTheme"
                :dnd="secondaryActionDialog.action?.dnd"
                @submit="handleSecondaryActionSubmit"
            />

            <template
                v-if="
                    !secondaryActionDialog.isLoading &&
                    !secondaryActionDialog.action?.crudConfig &&
                    !secondaryActionDialog.action?.renderInDialog &&
                    !secondaryActionDialog.action?.hideFooter
                "
                #footer
            >
                <button
                    type="button"
                    :class="`h-9 min-w-[100px] rounded-md px-4 font-medium transition-colors ${appliedTheme.primaryButton} ${isSecondaryActionProcessing ? 'cursor-not-allowed opacity-50' : ''}`"
                    :disabled="isSecondaryActionProcessing"
                    @click="handleSecondaryActionSubmit"
                >
                    <span
                        v-if="isSecondaryActionProcessing"
                        class="flex items-center"
                    >
                        <svg
                            class="me-2 h-4 w-4 animate-spin"
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
                        {{ resolveLabel('ui-builder.saving') }}
                    </span>
                    <span v-else>{{
                        resolveLabel(secondaryActionDialog.action?.submitLabel || 'ui-builder.submit')
                    }}</span>
                </button>
            </template>
        </DialogWrapper>

        <ExportDialog
            v-model:is-open="isExportDialogOpen"
            :config="config"
            :visible-columns="visibleColumns"
            :data-count="data.length"
            :total-count="totalCount"
            :theme="appliedTheme"
            :default-format="exportDefaultFormat"
            :is-processing="isExportProcessing"
            @export="executeExport"
        />

        <ImportDialog
            v-if="canImport && config.importConfig"
            v-model:is-open="isImportDialogOpen"
            :config="config.importConfig"
            :module-name="config.moduleName"
            :theme="appliedTheme"
            @imported="onImported"
        />

        <ImagePreviewModal />
    </div>
</template>

<script setup lang="ts">
import { router, usePage } from '../../adapters/inertia';
import { readPageProps } from '../../adapters/pageProps';
import axios from 'axios';
import { format } from 'date-fns';
import { computed, defineAsyncComponent, nextTick, onMounted, ref, toRef, watch } from 'vue';
import { useUiI18n } from '../../i18n';
import { resolveLabel, resolveModuleName } from '../../i18n';

// Saved views (the Views menu) belong to the screen they were saved on; a report page and a list are separate screens.
const savedViewScope = typeof window !== 'undefined' ? `list:${window.location.pathname}` : '';
const { t } = useUiI18n();

// Every module's filters sit in one grouped popover on the right, whatever its config says
// (a config may still supply the group title).
const effectiveFilterConfig = computed(() => ({
    ...props.config.filterConfig,
    group: true,
    align: 'right' as const,
}));
import { getThemeHex } from '../../composables/themes';
import { useCrudHandlers } from '../../composables/useCrudHandlers';
import { useForm } from '../../composables/useForm';
import { useModuleManager } from '../../composables/useModuleManager';
import { listShortcut, useListShortcuts, type ListShortcut } from '../../integrations/shortcuts';
import { toast } from '../../composables/useToast';
import type {
    CustomActionDialogState,
    ExportFormat,
    FilterState,
    ModuleConfig,
    PaginationData,
    ThemeConfig,
} from '../../types/module';
import { flattenFormFields } from '../../types/module';
import {
    handleExportCSV,
    handleExportExcel,
    handleExportJSON,
    handleExportPDF,
    handlePrint,
    normalizeExportConfig,
} from '../../utils/exportUtils';
import { evaluateVisibility } from '../../utils/fieldUtils';
import ImagePreviewModal from '../ImagePreviewModal.vue';
import AccessDenied from './AccessDenied.vue';
import DataToolbar from './DataToolbar.vue';
import DialogWrapper from './DialogWrapper.vue';
import EmptyState from './EmptyState.vue';
import ExportDialog from './ExportDialog.vue';
import { injectCustomFieldColumns } from '../../utils/customFieldColumns';
import FilterBar from './FilterBar.vue';
import FormErrors from './FormErrors.vue';
import GenericForm from './GenericForm.vue';
import GenericGrid from './GenericGrid.vue';
import GenericTable from './GenericTable.vue';
import ModuleHeader from './ModuleHeader.vue';
import Pagination from './Pagination.vue';
import PaginationSkeleton from './PaginationSkeleton.vue';
import GridSkeleton from './GridSkeleton.vue';
import TableSkeleton from './TableSkeleton.vue';
import ViewDetails from './ViewDetails.vue';

// ~114 KB, and only ever shown from a row action: loaded when that dialog first opens.
const SubModuleCrudPanel = defineAsyncComponent(() => import('./SubModuleCrudPanel.vue'));
// Carries the spreadsheet reader; loaded the first time someone opens Import.
const ImportDialog = defineAsyncComponent(() => import('./ImportDialog.vue'));

interface Props {
    config?: ModuleConfig;
    initialData: PaginationData;
    initialFilters?: FilterState;
    theme?: Partial<ThemeConfig>;
    enableThemeSelector?: boolean;
    defaultTheme?: string;
}

const props = withDefaults(defineProps<Props>(), {
    config: () => ({
        moduleName: 'Module',
        tableColumns: [],
        formFields: [],
        api: {
            create: '',
            update: '',
            delete: '',
        },
        permissions: {
            view: '',
            create: '',
            update: '',
            delete: '',
            export: '',
        },
        dataPropName: 'data',
    }),
    initialFilters: () => ({}),
    theme: () => ({}),
    enableThemeSelector: true,
    defaultTheme: 'default',
});

const page = usePage();

// The store's own fields flagged "show on list" become columns (types: ModuleConfig.customFields). Added before the
// first render and again whenever the page hands over a new config object; adding is idempotent.
watch(
    () => props.config,
    (config) => injectCustomFieldColumns(config, readPageProps(page).customFieldColumns),
    { immediate: true, flush: 'pre' },
);

// Module icon: config.icon override, else the matching sidebar menu item's icon (DB-sourced).
const resolvedModuleIcon = computed(() => {
    if (props.config.icon) return props.config.icon;

    const currentPath = page.url.split('?')[0];
    const menus = (readPageProps(page).sidebarMenu as any[]) ?? [];

    for (const item of menus) {
        if (
            item.url &&
            currentPath.startsWith(
                item.url.startsWith('/') ? item.url : `/${item.url}`,
            )
        ) {
            if (item.icon) return item.icon as string;
        }
        if (item.children) {
            for (const child of item.children) {
                const childUrl = child.url?.startsWith('/')
                    ? child.url
                    : `/${child.url}`;
                if (child.url && currentPath.startsWith(childUrl)) {
                    if (child.icon) return child.icon as string;
                }
            }
        }
    }
    return undefined;
});

const moduleManager = useModuleManager(
    toRef(props, 'config'),
    props.initialData,
    props.initialFilters,
    props.theme,
    props.defaultTheme,
);

const {
    data,
    currentPage,
    perPage,
    totalPages,
    totalCount,
    loading,
    searchTerm,
    debouncedSearch,
    statusFilter,
    dateRange,
    customFilters,
    sortConfig,
    editingItem,
    isDialogOpen,
    isCreating,
    isViewing,
    visibleColumns,
    selectedRows,
    isRefreshing,
    customActionDialog,
    density,
    layout,
    selectedTheme,
    isImportDialogOpen,
    canView,
    canViewDetails,
    canCreate,
    canUpdate,
    canDelete,
    canBulkDelete,
    canExport,
    visibleCustomHeaderActions,
    visibleCustomRowActions,
    visibleCustomBulkActions,
    checkPermission,
    appliedTheme,
    tableTheme,
    hasStatusFilter,
    hasSelectedRows,
    hasActiveFilters,
    handleStatusFilter,
    handleDateRangeChange,
    handleCustomFilterChange,
    handleSort,
    handlePerPageChange,
    handlePageChange,
    handleRefresh,
    handleClearFilters,
    resetColumns,
} = moduleManager;

const actionConfig = computed(() => props.config.actionConfig);
// A list with no form fields and no view fields has nothing to show in its View dialog (it opened blank),
// so the View action is dropped unless the config asks for it explicitly.
const effectiveActionConfig = computed(() => {
    const cfg = props.config.actionConfig;
    const fields = props.config.formFields as unknown;
    const nothingToShow = !props.config.viewFields && Array.isArray(fields) && fields.length === 0;
    if (!nothingToShow || cfg?.detailsView?.show === true) return cfg;
    return { ...(cfg ?? {}), detailsView: { ...(cfg?.detailsView ?? {}), show: false } };
});

// List-screen shortcuts, shared by every module. Each is gated the same as its own button
// (e.g. `n` needs create permission) and disabled while any dialog covers the list.
const listInteractive = () => !isDialogOpen.value && !isImportDialogOpen.value && !customActionDialog.value?.isOpen;

const listShortcuts = computed<ListShortcut[]>(() => [
    listShortcut('list.focus_search', {
        when: listInteractive,
        handler: () => {
            const input = document.querySelector<HTMLInputElement>('[data-module-search]');
            input?.focus();
            input?.select();
        },
    }),
    listShortcut('list.new_record', {
        when: () => listInteractive() && actionConfig.value?.create?.show !== false && canCreate.value,
        handler: () => openCreateDialog(),
    }),
    listShortcut('list.refresh', {
        when: listInteractive,
        handler: () => handleRefresh(),
    }),
    listShortcut('list.prev_page', {
        when: () => listInteractive() && currentPage.value > 1,
        handler: () => handlePageChange(currentPage.value - 1),
    }),
    listShortcut('list.next_page', {
        when: () => listInteractive() && currentPage.value < totalPages.value,
        handler: () => handlePageChange(currentPage.value + 1),
    }),
]);

useListShortcuts(() => listShortcuts.value);

// Dialog titles always use the singular form (never the plural translation variant).
const translatedModuleName = computed(() =>
    resolveModuleName(props.config.moduleName, props.config.moduleName),
);

const showThemeSelector = computed(() => {
    return props.enableThemeSelector && Object.keys(props.theme).length === 0;
});

// Import has its own permission (bulk writes are riskier than one create); without one it follows create.
const canImport = computed(() => {
    const importConfig = props.config.importConfig;
    if (!importConfig?.enabled || !importConfig.importer) return false;
    if (!importConfig.permission) return canCreate.value;

    return (readPageProps(page).auth?.permissions as string[] | undefined)?.includes(importConfig.permission) ?? false;
});

const onImported = () => {
    (router.reload as any)({ preserveScroll: true });
};

const handleThemeChange = (newTheme: string) => {
    selectedTheme.value = newTheme;
};

const headerPaddingClass = computed(() => {
    if (density.value === 'compact') return 'space-y-3 border-b py-3 px-4';
    if (density.value === 'relaxed') return 'space-y-6 border-b py-6 px-8';
    return 'space-y-4 border-b py-4 px-6';
});

const contentPaddingClass = computed(() => {
    if (density.value === 'compact') return 'py-3 px-4';
    if (density.value === 'relaxed') return 'py-6 px-8';
    return 'py-4 px-6';
});

const getInitialFormData = () => {
    const formData: Record<string, any> = {};
    flattenFormFields(props.config.formFields).forEach((field) => {
        if (!field.name) return;
        if (field.type === 'radio' && field.options?.length) {
            const firstOption = field.options[0];
            formData[field.name] =
                typeof firstOption === 'object'
                    ? firstOption.value
                    : firstOption;
        } else if (field.defaultValue !== undefined) {
            formData[field.name] = field.defaultValue;
        } else if (field.multiple) {
            formData[field.name] = [];
        } else {
            formData[field.name] = '';
        }
    });
    return formData;
};

const createForm = useForm(getInitialFormData());
const updateForm = useForm(getInitialFormData());
const customActionForm = useForm({});
const secondaryActionForm = useForm({});
const dynamicComponentRef = ref<any>(null);

const secondaryActionDialog = ref<CustomActionDialogState>({
    isOpen: false,
    action: null,
    row: null,
});

const isSecondaryActionProcessing = computed(() => {
    const proc = secondaryActionForm.processing;
    if (proc && typeof proc === 'object' && 'value' in proc) {
        return (proc as any).value;
    }
    return Boolean(proc);
});

const isCreateProcessing = computed(() => {
    const proc = createForm.processing;
    if (proc && typeof proc === 'object' && 'value' in proc) {
        return (proc as any).value;
    }
    return Boolean(proc);
});

const isUpdateProcessing = computed(() => {
    const proc = updateForm.processing;
    if (proc && typeof proc === 'object' && 'value' in proc) {
        return (proc as any).value;
    }
    return Boolean(proc);
});

const hasCustomActionErrors = computed(() => {
    return Object.keys(customActionForm.errors).length > 0;
});

// Syncs customActionForm.errors onto a raw HTML form's data-error-for placeholders/border classes.
const handleHtmlErrors = () => {
    if (customActionDialog.value.dynamicContent?.type !== 'html') return;

    nextTick(() => {
        const container = document.querySelector('.dynamic-form-container');
        if (!container) return;

        const errorElements = container.querySelectorAll('.html-error');
        errorElements.forEach((el) => {
            const fieldName = (el as HTMLElement).dataset.errorFor;
            if (fieldName) {
                const errorMessage = customActionForm.errors[fieldName];
                el.textContent = errorMessage || '';

                const containerEl = container.querySelector(
                    `.html-error-container[data-error-container-for="${fieldName}"]`,
                );
                if (containerEl) {
                    if (errorMessage) {
                        containerEl.classList.remove('hidden');
                        containerEl.classList.add('flex');
                    } else {
                        containerEl.classList.add('hidden');
                        containerEl.classList.remove('flex');
                    }
                }
            }
        });

        const inputs = container.querySelectorAll('input, textarea, select');
        inputs.forEach((input) => {
            const name = (input as HTMLInputElement).name;
            if (name) {
                const hasError = !!customActionForm.errors[name];
                if (hasError) {
                    input.classList.add('border-red-500', 'focus:ring-red-500');
                    input.classList.remove(
                        'border-gray-200',
                        'focus:border-blue-500',
                        'focus:ring-blue-500',
                    );
                } else {
                    input.classList.remove(
                        'border-red-500',
                        'focus:ring-red-500',
                    );
                    input.classList.add(
                        'border-gray-200',
                        'focus:border-blue-500',
                        'focus:ring-blue-500',
                    );
                }
            }
        });
    });
};

const crudHandlers = useCrudHandlers(
    toRef(props, 'config'),
    visibleCustomBulkActions,
);

const {
    handleCreate: crudCreate,
    handleUpdate: crudUpdate,
    handleDelete: crudDelete,
    handleBulkAction: crudBulkAction,
    handleCustomRowAction: crudHandleCustomRowAction,
    handleCustomActionSubmit: crudCustomActionSubmit,
    openCreateDialog: crudOpenCreateDialog,
    openEditDialog: crudOpenEditDialog,
} = crudHandlers;

const handleCreate = () => {
    const auth = readPageProps(page).auth;
    const fields = flattenFormFields(props.config.formFields || []).filter(
        (f) => evaluateVisibility(f, false, createForm.data, auth),
    );
    if (createForm.validate && !createForm.validate(fields, false, { auth })) {
        return;
    }

    crudCreate(
        createForm,
        (open) => (isDialogOpen.value = open),
        getInitialFormData,
        {
            onSuccess: () => {
                selectedRows.value = [];
            },
        },
    );
};

const handleUpdate = () => {
    const auth = readPageProps(page).auth;
    const fields = flattenFormFields(props.config.formFields || []).filter(
        (f) => evaluateVisibility(f, true, updateForm.data, auth),
    );
    if (updateForm.validate && !updateForm.validate(fields, true, { auth })) {
        return;
    }

    crudUpdate(
        updateForm,
        editingItem,
        (open) => (isDialogOpen.value = open),
        (item) => (editingItem.value = item),
        {
            onSuccess: () => {
                selectedRows.value = [];
            },
        },
    );
};

const handleCustomRowAction = (action: any, row: any) => {
    if (action.crudConfig) {
        customActionDialog.value = {
            isOpen: true,
            action: action,
            row: row,
        };
        return;
    }

    if (action.formFields && action.formFields.length > 0) {
        // Clear previous dynamic content (e.g. details view component) when opening a form action
        customActionDialog.value.dynamicContent = undefined;
        customActionForm.reset();

        customActionDialog.value = {
            isOpen: true,
            action: action,
            row: row,
        };
        initCustomActionForm(action, row);
    } else {
        crudHandleCustomRowAction(
            action,
            row,
            (state) => (customActionDialog.value = state),
            {
                onSuccess: () => {
                    selectedRows.value = [];
                },
            },
        );
    }
};

// Auto-opens a customRowAction's dialog for a just-flashed createdId. Deliberately not
// `immediate` — only a fresh create redirect should fire this, never a plain page load.
watch(
    () => readPageProps(page).flash?.createdId,
    (createdId) => {
        if (!createdId) return;
        const action = props.config.customRowActions?.find(
            (a: any) => a.autoOpenAfterCreate,
        );
        if (!action) return;
        handleCustomRowAction(action, { id: createdId });
    },
);

const handleTriggerCustomAction = (actionOrKey: any, targetRow?: any) => {
    const row = targetRow || customActionDialog.value.row;
    let action = actionOrKey;
    if (typeof actionOrKey === 'string') {
        action = props.config.customRowActions?.find(
            (a: any) => a.key === actionOrKey,
        );
    }
    if (!action) return;

    // Already open on a component view (e.g. TicketTimeline) — stack the reply form on top.
    if (
        customActionDialog.value.isOpen &&
        customActionDialog.value.dynamicContent?.type === 'component'
    ) {
        secondaryActionForm.reset();
        secondaryActionDialog.value = {
            isOpen: true,
            action: action,
            row: row,
        };

        const fields =
            typeof action.formFields === 'function'
                ? action.formFields(row)
                : action.formFields || [];
        const initialData: Record<string, any> = {};
        fields.forEach((field: any) => {
            const val = field.getValue
                ? field.getValue(row)
                : (row?.[field.name] ?? field.defaultValue ?? '');
            initialData[field.name] = val !== undefined ? val : '';

            if (
                field.type === 'vue-select' &&
                (field.name.endsWith('_id') || field.relationName)
            ) {
                const relationName =
                    field.relationName || field.name.replace(/_id$/, '');
                if (relationName && row?.[relationName] !== undefined) {
                    initialData[relationName] = row[relationName];
                }
            }
        });

        secondaryActionForm.setDataBulk(initialData);
    } else {
        handleCustomRowAction(action, row);
    }
};

const closeSecondaryActionDialog = () => {
    secondaryActionDialog.value = {
        isOpen: false,
        action: null,
        row: null,
    };
    setTimeout(() => {
        secondaryActionForm.reset();
    }, 300);
};

const handleSecondaryActionSubmit = () => {
    let fields: any[] = [];
    if (typeof secondaryActionDialog.value.action?.formFields === 'function') {
        fields =
            secondaryActionDialog.value.action.formFields(
                secondaryActionDialog.value.row,
            ) || [];
    } else {
        fields = secondaryActionDialog.value.action?.formFields || [];
    }

    const auth = readPageProps(page).auth;
    const visibleFields = fields.filter((f) =>
        evaluateVisibility(f, true, secondaryActionForm.data, auth),
    );

    if (
        visibleFields.length > 0 &&
        secondaryActionForm.validate &&
        !secondaryActionForm.validate(visibleFields, true, { auth })
    ) {
        return;
    }

    const activeRow = secondaryActionDialog.value.row;
    const ticketId =
        activeRow?.id ||
        activeRow?.ticket_id ||
        customActionDialog.value.row?.id ||
        customActionDialog.value.dynamicContent?.data?.id;

    crudHandlers.handleCustomActionSubmit(
        secondaryActionDialog,
        secondaryActionForm,
        (state) => (secondaryActionDialog.value = state),
        {
            onSuccess: async (responseData: any) => {
                selectedRows.value = [];
                handleRefresh();

                if (ticketId) {
                    window.dispatchEvent(
                        new CustomEvent('ticket-reply-success', {
                            detail: { ticketId },
                        }),
                    );
                }

                const freshTicket = responseData?.ticket;
                if (
                    customActionDialog.value.isOpen &&
                    freshTicket &&
                    customActionDialog.value.dynamicContent
                ) {
                    customActionDialog.value = {
                        ...customActionDialog.value,
                        componentKey: Date.now(),
                        dynamicContent: {
                            ...customActionDialog.value.dynamicContent,
                            data: freshTicket,
                        },
                    };
                } else if (customActionDialog.value.isOpen && ticketId) {
                    try {
                        const baseUri =
                            props.config.baseUri || '/support/tickets';
                        const detailsRes = await axios.get(
                            `${baseUri}/${ticketId}/details`,
                            {
                                params: { _t: Date.now() },
                            },
                        );
                        if (
                            detailsRes.data &&
                            customActionDialog.value.dynamicContent
                        ) {
                            customActionDialog.value = {
                                ...customActionDialog.value,
                                componentKey: Date.now(),
                                dynamicContent: {
                                    ...customActionDialog.value.dynamicContent,
                                    data: detailsRes.data,
                                },
                            };
                        }
                    } catch (e) {
                        console.error('Failed to reload timeline details:', e);
                    }
                }
            },
        },
    );
};

const handleCustomHeaderAction = (action: any) => {
    handleCustomRowAction(action, null);
};

const handleCustomActionSubmit = () => {
    let fields: any[] = [];
    if (customActionDialog.value.dynamicContent?.type === 'fields') {
        fields = customActionDialog.value.dynamicContent.data || [];
    } else if (
        typeof customActionDialog.value.action?.formFields === 'function'
    ) {
        fields =
            customActionDialog.value.action.formFields(
                customActionDialog.value.row,
            ) || [];
    } else {
        fields = customActionDialog.value.action?.formFields || [];
    }

    const auth = readPageProps(page).auth;
    const visibleFields = fields.filter((f) =>
        evaluateVisibility(f, true, customActionForm.data, auth),
    );

    if (
        visibleFields.length > 0 &&
        customActionForm.validate &&
        !customActionForm.validate(visibleFields, true, { auth })
    ) {
        return;
    }

    crudHandlers.handleCustomActionSubmit(
        customActionDialog,
        customActionForm,
        (state) => (customActionDialog.value = state),
        {
            onSuccess: () => {
                selectedRows.value = [];
                handleRefresh();
            },
            onError: () => {
                // handleHtmlErrors watcher picks up the errors
            },
        },
    );
};

const handleDelete = (id: string | number) => {
    crudDelete(id, {
        onSuccess: () => {
            selectedRows.value = [];
        },
    });
};

const handleBulkAction = (actionKey: string, ids: string[]) => {
    crudBulkAction(
        actionKey,
        ids,
        data.value,
        (state: any) => (customActionDialog.value = state),
        {
            onSuccess: () => {
                selectedRows.value = [];
            },
        },
    );
};

const openCreateDialog = () => {
    isCreating.value = true;
    editingItem.value = null;

    const initialData = getInitialFormData();
    createForm.reset(initialData);

    // nextTick so processing.value is cleared after the form is actually ready
    nextTick(() => {
        if (
            createForm.processing &&
            typeof createForm.processing === 'object' &&
            'value' in createForm.processing
        ) {
            createForm.processing.value = false;
        }
    });

    isDialogOpen.value = true;
};

const handleHtmlInput = (event: Event) => {
    const target = event.target as
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (target && target.name) {
        customActionForm.setData(target.name, target.value);
    }
};

const openEditDialog = (row: any) => {
    if (!canUpdate.value) return;
    if (props.config.disableRowClick) return;
    if (props.config.onRowClick) {
        props.config.onRowClick(row, router);
        return;
    }

    isCreating.value = false;
    isViewing.value = false;
    editingItem.value = row;

    updateForm.reset();
    const formData: Record<string, any> = {};
    // Only include ID and defined form fields, avoiding submitting the entire row (e.g. timestamps, relations)
    if (row?.id !== undefined) {
        formData.id = row.id;
    }
    const sourceObj = row?.userable ? { ...row.userable, ...row } : row;
    flattenFormFields(props.config.formFields).forEach((f) => {
        if (!f.name) return;
        let val = f.getValue ? f.getValue(sourceObj) : sourceObj[f.name];

        // Multi-select is hydrated from full relation objects but must hold just IDs (what validation expects).
        if (f.multiple && Array.isArray(val)) {
            val = val.map((item: any) =>
                item && typeof item === 'object'
                    ? item.value !== undefined
                        ? item.value
                        : item.id
                    : item,
            );
        }

        formData[f.name] = val !== undefined ? val : f.multiple ? [] : '';

        if (
            f.type === 'vue-select' &&
            (f.name.endsWith('_id') || f.relationName)
        ) {
            const relationName = f.relationName || f.name.replace(/_id$/, '');
            if (relationName && sourceObj[relationName] !== undefined) {
                formData[relationName] = sourceObj[relationName];
            }
        }
    });
    updateForm.setDataBulk(formData);

    nextTick(() => {
        if (
            updateForm.processing &&
            typeof updateForm.processing === 'object' &&
            'value' in updateForm.processing
        ) {
            updateForm.processing.value = false;
        }
    });

    isDialogOpen.value = true;
};

const openViewDialog = (row: any) => {
    isCreating.value = false;
    isViewing.value = true;
    editingItem.value = row;

    updateForm.reset();
    const sourceObj = row?.userable ? { ...row.userable, ...row } : row;
    updateForm.setDataBulk(sourceObj);

    isDialogOpen.value = true;
};

const handleDialogClose = () => {
    isDialogOpen.value = false;

    // Reset forms after a short delay to avoid visual glitches
    setTimeout(() => {
        if (isCreating.value) {
            createForm.reset(getInitialFormData());
        } else {
            updateForm.reset(getInitialFormData());
        }
        editingItem.value = null;
        isViewing.value = false;
    }, 300);
};

const closeCustomActionDialog = () => {
    const shouldReload = customActionDialog.value.action?.reloadParentOnChange;
    customActionDialog.value = {
        isOpen: false,
        action: null,
        row: null,
    };

    setTimeout(() => {
        customActionForm.reset();
    }, 300);

    if (shouldReload) {
        (router.reload as any)({ preserveScroll: true });
    }
};

const isExportDialogOpen = ref(false);
const exportDefaultFormat = ref<ExportFormat>('excel');
const isExportProcessing = ref(false);

const openExportDialog = (format: ExportFormat = 'excel') => {
    exportDefaultFormat.value = format;
    isExportDialogOpen.value = true;
};

// The list's filters as they stand (search, status, sort, dates, custom filters), as query parameters.
const currentFilterParams = (): Record<string, any> => {
    const params: Record<string, any> = {
        search: searchTerm.value || undefined,
        status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
        sort: sortConfig.value.key || undefined,
        direction: sortConfig.value.direction || 'asc',
        ...(dateRange.value.from && {
            date_from: format(dateRange.value.from, 'yyyy-MM-dd'),
        }),
        ...(dateRange.value.to && {
            date_to: format(dateRange.value.to, 'yyyy-MM-dd'),
        }),
        ...Object.fromEntries(
            Object.entries(customFilters.value)
                .filter(
                    ([_, v]) =>
                        v !== undefined &&
                        v !== null &&
                        v !== '' &&
                        v !== 'all' &&
                        (!Array.isArray(v) || v.length > 0),
                )
                .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v]),
        ),
    };

    Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === null) {
            delete params[key];
        }
    });

    return params;
};

// Extra Export-menu entries a module configured (exportConfig.customActions), limited to what the viewer may use.
const visibleExportActions = computed(() => {
    const raw = typeof props.config.exportConfig === 'object' ? props.config.exportConfig?.customActions || [] : [];
    return raw.filter((a: any) => (!a.permission || checkPermission(a.permission)) && (typeof a.show === 'function' ? a.show(null) : a.show !== false));
});

// An export action runs like a header action whose "row" is the current filters, so its form can prefill from them.
const handleExportAction = (action: any) => {
    handleCustomRowAction(action, currentFilterParams());
};

const fetchAllDataForExport = async (): Promise<any[]> => {
    const currentFilters: Record<string, any> = { ...currentFilterParams(), perPage: 'all' };

    try {
        const response = await axios.get(window.location.pathname, {
            params: currentFilters,
            headers: {
                'X-Inertia': 'true',
                'X-Inertia-Version': page.version,
                'X-Inertia-Partial-Component': page.component,
                'X-Inertia-Partial-Data': props.config.dataPropName,
            },
        });

        const responseData = response.data.props[props.config.dataPropName];
        if (responseData && 'data' in responseData) {
            return responseData.data || [];
        } else if (Array.isArray(responseData)) {
            return responseData;
        }
        return [];
    } catch (error: any) {
        if (error.response?.status === 409) {
            console.warn(
                'Inertia version mismatch (409). Falling back to full HTML parsing...',
            );
            // Fallback: Fetch without X-Inertia headers to avoid version check
            const response = await axios.get(window.location.pathname, {
                params: currentFilters,
            });
            const html = response.data;
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const appEl =
                doc.getElementById('app') || doc.querySelector('[data-page]');
            if (appEl) {
                const pageDataStr = appEl.getAttribute('data-page');
                if (pageDataStr) {
                    const pageData = JSON.parse(pageDataStr);
                    if (pageData.version) {
                        try {
                            page.version = pageData.version;
                        } catch (e) {
                            // ignore read-only assignment error
                        }
                    }
                    const responseData =
                        pageData.props?.[props.config.dataPropName];
                    if (responseData && 'data' in responseData) {
                        return responseData.data || [];
                    } else if (Array.isArray(responseData)) {
                        return responseData;
                    }
                }
            }
            throw new Error(
                'Failed to parse data from HTML fallback response.',
            );
        }
        throw error;
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
    };
}) => {
    isExportProcessing.value = true;
    try {
        let exportData = data.value;

        if (options.scope === 'all') {
            const rawData = await fetchAllDataForExport();
            exportData = props.config.transformData
                ? props.config.transformData(rawData)
                : rawData;
        }

        const user = readPageProps(page).auth?.user;
        const userName = user?.name || user?.email || 'System User';
        const themeColor = selectedTheme.value
            ? getThemeHex(selectedTheme.value)
            : '#4b5563';

        const extraMeta = {
            userName,
            themeColor,
            activeFiltersText: searchTerm.value
                ? `Search: "${searchTerm.value}"`
                : 'All Data',
        };

        const normalized = normalizeExportConfig(props.config.exportConfig, props.config.moduleName);
        const mergedExportConfig = {
            ...normalized,
            pageSize: options.pdfConfig.pageSize,
            orientation: options.pdfConfig.orientation,
            cellPadding: options.pdfConfig.cellPadding,
            repeatHeader: options.pdfConfig.repeatHeader,
            margin: options.pdfConfig.margin,
        };

        const tempConfig = {
            ...props.config,
            exportConfig: mergedExportConfig,
        };

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

const handleExport = () => {
    if (!canExport.value) return;

    const exportConfig = normalizeExportConfig(props.config.exportConfig);
    let defaultFormat: ExportFormat = 'excel';
    if (exportConfig.excel) defaultFormat = 'excel';
    else if (exportConfig.pdf) defaultFormat = 'pdf';
    else if (exportConfig.csv) defaultFormat = 'csv';
    else if (exportConfig.json) defaultFormat = 'json';
    else if (exportConfig.print) defaultFormat = 'print';

    openExportDialog(defaultFormat);
};

const handleToggleColumn = (key: string) => {
    if (visibleColumns.value.includes(key)) {
        visibleColumns.value = visibleColumns.value.filter((k) => k !== key);
    } else {
        visibleColumns.value = [...visibleColumns.value, key];
    }
};

const initCustomActionForm = async (action: any, row: any) => {
    if (!action) return;

    if (action.loadForm) {
        customActionDialog.value.dynamicContent = undefined;
        try {
            customActionDialog.value.isLoading = true;
            const loadConfig = action.loadForm(row);
            const response = await axios({
                method: loadConfig.method?.split('|')[0] || 'GET',
                url: loadConfig.url,
            });

            const contentType = response.headers['content-type'] as string;
            if (contentType?.includes('application/json')) {
                customActionDialog.value.dynamicContent = {
                    type: 'fields',
                    data: response.data.fields || response.data,
                };

                const initialData: Record<string, any> = {};
                const fields = customActionDialog.value.dynamicContent.data;
                if (Array.isArray(fields)) {
                    fields.forEach((field: any) => {
                        initialData[field.name] =
                            response.data.data?.[field.name] ||
                            row?.[field.name] ||
                            field.defaultValue ||
                            '';

                        if (
                            field.type === 'vue-select' &&
                            (field.name.endsWith('_id') || field.relationName)
                        ) {
                            const relationName =
                                field.relationName ||
                                field.name.replace(/_id$/, '');
                            if (relationName) {
                                if (row?.[relationName] !== undefined) {
                                    initialData[relationName] =
                                        row[relationName];
                                } else if (
                                    response.data.data?.[relationName] !==
                                    undefined
                                ) {
                                    initialData[relationName] =
                                        response.data.data[relationName];
                                }
                            }
                        }
                    });
                }
                customActionForm.reset();
                customActionForm.setDataBulk(initialData);
            } else {
                customActionDialog.value.dynamicContent = {
                    type: 'html',
                    data: response.data,
                };
            }
        } catch (error: any) {
            console.error('Failed to load dynamic form:', error);
            const message =
                error.response?.data?.error ||
                error.response?.data?.message ||
                t('toast.load_form_error');
            toast.error(message);
            closeCustomActionDialog();
        } finally {
            customActionDialog.value.isLoading = false;
        }
    } else if (action.formFields) {
        const declared =
            typeof action.formFields === 'function'
                ? action.formFields(row)
                : action.formFields;
        // Flattened — fields may be wrapped in FormGroupNode cards, whose raw field.name is undefined.
        const fields = flattenFormFields(declared);
        const initialData: Record<string, any> = {};
        fields.forEach((field: any) => {
            const val = field.getValue
                ? field.getValue(row)
                : (row?.[field.name] ?? field.defaultValue ?? '');
            initialData[field.name] = val !== undefined ? val : '';

            if (
                field.type === 'vue-select' &&
                (field.name.endsWith('_id') || field.relationName)
            ) {
                const relationName =
                    field.relationName || field.name.replace(/_id$/, '');
                if (relationName && row?.[relationName] !== undefined) {
                    initialData[relationName] = row[relationName];
                }
            }
        });

        if (Array.isArray(row)) {
            initialData['ids'] = row.map((r: any) => String(r.id));
            initialData['orders'] = row.map((r: any) => r.order || 0);
        }

        customActionForm.reset();
        customActionForm.setDataBulk(initialData);
    }

    nextTick(() => {
        if (
            customActionForm.processing &&
            typeof customActionForm.processing === 'object' &&
            'value' in customActionForm.processing
        ) {
            customActionForm.processing.value = false;
        }
    });
};

watch(
    () => [
        customActionDialog.value.isOpen,
        customActionDialog.value.action?.key,
    ],
    async ([isOpen]) => {
        if (!isOpen) return;
        const { action, row } = customActionDialog.value;
        if (!action) return;
        initCustomActionForm(action, row);
    },
);

watch(
    () => customActionForm.errors,
    () => {
        handleHtmlErrors();
    },
    { deep: true },
);

watch(
    () => customActionDialog.value.isOpen,
    (isOpen) => {
        if (!isOpen) {
            customActionForm.clearErrors();
        }
    },
);

onMounted(() => {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab) {
            const action = (props.config.customHeaderActions || []).find(
                (a: any) =>
                    a.key === tab ||
                    a.tabAlias === tab ||
                    (Array.isArray(a.tabAliases) && a.tabAliases.includes(tab)),
            );
            if (action) {
                handleCustomHeaderAction(action);
            }
        }
    }
});

defineExpose({
    handleCustomHeaderAction,
    handleCustomRowAction,
    openCreateDialog,
    customActionDialog,
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.layout-fade-enter-active,
.layout-fade-leave-active {
    transition:
        opacity 0.22s ease,
        transform 0.22s ease;
}

.layout-fade-enter-from {
    opacity: 0;
    transform: scale(0.99) translateY(4px);
}

.layout-fade-leave-to {
    opacity: 0;
    transform: scale(0.99) translateY(-4px);
}

@keyframes tkt-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.tkt-animate-spin {
    animation: tkt-spin 0.8s linear infinite !important;
}
</style>
