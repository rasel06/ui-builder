# The Definitive Developer Guide to the UI Builder

**Audience**: Novice to Expert. Follow every step to build a complete module. Skip to any section as a daily reference.

> **Legend**: ✅ = Mandatory, ⬜ = Optional, `[val]` = Default value.

---

## How the System Works (Overview)

```
User Browser
    ↑↓ Inertia.js
Laravel Controller  →  Inertia::render('Page', ['dataPropName' => $paginatedData])
    ↑↓
Vue Page (index.vue)  →  <ModuleManager :config="..." :initialData="..." />
    ↑↓
ModuleConfig (*.ts)   →  defines tableColumns, formFields, actionConfig, etc.
```

---

## STEP 1: Create the Backend

_Register routes, build a controller, define endpoints._

### 1A. Routes (`web.php`)

```php
// routes/web.php
use App\Http\Controllers\EmployeeController;

Route::prefix('employees')->name('employees.')->group(function () {
    Route::get('/', [EmployeeController::class, 'index'])->name('index');
    Route::post('/', [EmployeeController::class, 'store'])->name('store');
    Route::put('/{employee}', [EmployeeController::class, 'update'])->name('update');
    Route::delete('/{employee}', [EmployeeController::class, 'destroy'])->name('destroy');
    Route::post('/bulk-delete', [EmployeeController::class, 'bulkDestroy'])->name('bulkDestroy');
    Route::post('/export', [EmployeeController::class, 'export'])->name('export');
    Route::get('/departments/search', [EmployeeController::class, 'searchDepartments'])->name('departments.search');
    // Custom row action endpoints:
    Route::post('/{employee}/award-bonus', [EmployeeController::class, 'awardBonus'])->name('awardBonus');
    Route::get('/{employee}/permissions', [EmployeeController::class, 'getPermissions'])->name('getPermissions');
    Route::post('/{employee}/permissions', [EmployeeController::class, 'savePermissions'])->name('savePermissions');
});
```

### 1B. Controller (`EmployeeController.php`)

```php
<?php
namespace App\Http\Controllers;

use App\Models\Employee;
use App\Traits\FilterAndPaginateTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    use FilterAndPaginateTrait;

    /**
     * INDEX: Sends paginated data + filters to the Vue page.
     * The UI Builder reads the search box, column clicks, and filter dropdowns
     * and automatically sends them as query string parameters.
     */
    public function index(Request $request)
    {
        $query = Employee::with(['department', 'creator']); // eager-load relations

        $data = $this->applyFiltersAndPagination($request, $query, [
            'searchable_columns' => ['name', 'email', 'phone'],
            'sortable_columns'   => ['id', 'name', 'salary', 'created_at'],
            'filterable_columns' => ['department_id', 'status'], // For customFilters
            'default_sort'       => 'id',       // [Default: 'id']
            'default_direction'  => 'desc',     // [Default: 'asc']
        ]);

        return Inertia::render('Employees/Index', [
            'employees' => $data, // KEY must match 'dataPropName' in config!
            'filters'   => $request->only([
                'search', 'department_id', 'status',
                'sort', 'direction', 'perPage', 'page',
                'date_from', 'date_to', // Include if using enableDateFilter
            ]),
        ]);
    }

    /** STORE: Receives formField 'name' keys as $request body */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:employees',
            'department_id' => 'required|exists:departments,id',
            'avatar'        => 'nullable|image|max:5120', // 5MB
        ]);
        Employee::create($validated);
        return back()->with('success', 'Employee created!');
    }

    /** UPDATE */
    public function update(Request $request, Employee $employee)
    {
        $employee->update($request->validate([...]));
        return back()->with('success', 'Employee updated!');
    }

    /** DESTROY */
    public function destroy(Employee $employee)
    {
        $employee->delete();
        return back()->with('success', 'Employee deleted!');
    }

    /** BULK DESTROY: UI Builder sends POST { ids: [1, 2, 3] } */
    public function bulkDestroy(Request $request)
    {
        Employee::whereIn('id', $request->input('ids', []))->delete();
        return back()->with('success', count($request->ids) . ' deleted.');
    }

    /**
     * AJAX SEARCH: For vue-select dropdowns.
     * IMPORTANT: Must return JSON with a 'data' key!
     * The UI Builder sends the typed text as the `search` query param.
     */
    public function searchDepartments(Request $request)
    {
        $results = Department::where('name', 'like', '%' . $request->input('search') . '%')
            ->limit(10)
            ->get(['id', 'name', 'manager_name']); // Include any fields you need in onSelect
        return response()->json(['data' => $results]);
    }

    /**
     * CUSTOM ACTION - with static inline form
     */
    public function awardBonus(Request $request, Employee $employee)
    {
        $request->validate(['amount' => 'required|numeric|min:0']);
        $employee->bonuses()->create(['amount' => $request->amount, 'reason' => $request->reason]);
        return back()->with('success', 'Bonus awarded!');
    }

    /**
     * DYNAMIC FORM LOAD (for `loadForm` pattern in customRowActions)
     * Must return formFields definition + the current record data
     */
    public function getPermissions(Employee $employee)
    {
        return response()->json([
            'formFields' => [
                ['name' => 'can_read', 'label' => 'Read', 'type' => 'checkbox'],
                // ... dynamically generated from DB if needed
            ],
            'data' => $employee->permissions()->pluck('name'),
        ]);
    }
}
```

---

## STEP 2: Create the Vue Page

```vue
<!-- resources/js/pages/Employees/Index.vue -->
<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Head, usePage } from '@inertiajs/vue3';
import ModuleManager from '@/components/ui-builder/components/ModuleManager/ModuleManager.vue';
import { getEmployeeConfig, type EmployeePageProps } from './employeeConfig';

const breadcrumbs = [{ title: 'Employees', href: '/employees' }];

// Use usePage() to destructure Inertia page props (recommended pattern)
const { employees, filters } = usePage().props as unknown as EmployeePageProps;

const config = getEmployeeConfig();
</script>

<template>
    <Head title="Employees" />
    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-4 p-4">
            <ModuleManager
                :config="config"
                :initial-data="employees"
                :initial-filters="filters"
                :enable-theme-selector="true"   <!-- (Optional) Shows theme switcher button -->
            />
        </div>
    </AppLayout>
</template>
```

---

## STEP 3: Module Identity ([ModuleConfig](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#370-403) Root)

> **Pattern**: Export config as a **function** (not a plain [const](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/app/Http/Controllers/Urm/MenuController.php#20-24)) when you need dynamic values like `BASE_URI` inside it.

```typescript
// resources/js/pages/Employees/employeeConfig.ts
import type { ModuleConfig } from '@/components/ui-builder/types/module';
import { diffForHumans } from '@/components/ui-builder/utils/utilities';
import {
    PlusCircle,
    FileEdit,
    Trash,
    Eye,
    Settings,
    FileSpreadsheet,
    Users,
} from '@lucide/vue';

export const getEmployeeConfig = (): ModuleConfig => {
    const BASE_URI = '/employees'; // Define once, reuse everywhere

    return {
        moduleName: 'Employees', // ✅ Header title
        dataPropName: 'employees', // ✅ Must match Inertia::render() key
        icon: Users, // ⬜ Lucide icon in header
        enableDateFilter: true, // ⬜ [false] Global date range picker
        disableRowClick: false, // ⬜ [false] Prevents row → Edit dialog
        onRowClick: (row, router) => {
            // ⬜ Custom action on row click
            router.visit(`/employees/${row.id}/profile`);
        },
        extraPropsToRefresh: ['employees', 'filters'], // ⬜ Force reload extra Inertia props
        formGridColumns: 12, // ⬜ [12] Max layout columns for form
        formInputSize: 'md', // ⬜ ['md'] 'xs' … '7xl', or Tailwind classes (see Sizes)
        createDialogSize: '2xl', // ⬜ ['md'] See DialogSize options
        editDialogSize: 'xl', // ⬜ ['md'] See DialogSize options
    };
};
```

### Reference: [DialogSize](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#153-163) Values

`'3xs'` | `'2xs'` | `'xs'` | `'sm'` | `'md'` | `'lg'` | `'xl'` | `'2xl'` … `'7xl'` | `'full'` | `'screen'` (edge to edge), or raw Tailwind classes such as `'max-w-[60rem]'`.

### Reference: Sizes (all components)

Every size is resolved in one place, `utils/sizing.ts`, so a size means the same thing in every component.

- **Controls** (`size` on a field, `formInputSize`, switch columns, `EntityAvatar`, `fieldSize()`): `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'` … `'7xl'`. Field heights: 28, 32, 36, 40, 44, 48, 56, 64, 72, 88, 104 px.
- **Raw Tailwind classes** are accepted anywhere a size is: `size: 'h-12 text-xl'`, `'h-[52px]'`, `'h-10 md:h-14 px-6'`. They are applied as given; the component only fills in what they leave out (height, padding, text size). A switch uses the size nearest the class height.
- **Field and group widths** (`width`): any fraction of the 12-column grid (`'1/12'` … `'11/12'`, `'1/6'`, `'5/6'`, `'1/2'`, `'1/3'`, `'1/4'`, fifths), `'full'`, or raw `col-*` classes. Widths follow the form's own width (container queries), not the screen.
- **Dialogs**: see DialogSize above.

### Reference: Root Config Properties

| Property              | Type                                                                                                                        | Status | Default | Description                                                                                                                                      |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :----- | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `moduleName`          | `string`                                                                                                                    | ✅     | -       | Title displayed in the module header.                                                                                                            |
| `dataPropName`        | `string`                                                                                                                    | ✅     | -       | MUST match the Inertia [::render()](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/roles/rolesConfig.ts#128-129) key. |
| `icon`                | `Component`                                                                                                                 | ⬜     | `null`  | Lucide icon next to the title.                                                                                                                   |
| `enableDateFilter`    | `boolean`                                                                                                                   | ⬜     | `false` | Shows global date-range picker in toolbar.                                                                                                       |
| `disableRowClick`     | `boolean`                                                                                                                   | ⬜     | `false` | If `true`, row click does NOT open the Edit dialog.                                                                                              |
| `onRowClick`          | `Function(row, router)`                                                                                                     | ⬜     | `null`  | Custom callback when a row is clicked.                                                                                                           |
| `extraPropsToRefresh` | `string[]`                                                                                                                  | ⬜     | `[]`    | Extra Inertia prop keys to reload after create/edit/delete.                                                                                      |
| `formGridColumns`     | `number`                                                                                                                    | ⬜     | `12`    | Total columns for the form grid layout.                                                                                                          |
| `formInputSize`       | `string`                                                                                                                    | ⬜     | `'md'`  | `'xs'` … `'7xl'`, or raw Tailwind classes. Applies to all inputs.                                                                                           |
| `createDialogSize`    | [DialogSize](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#153-163) | ⬜     | `'md'`  | Size of the Create popup.                                                                                                                        |
| `editDialogSize`      | [DialogSize](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#153-163) | ⬜     | `'md'`  | Size of the Edit popup.                                                                                                                          |

---

## STEP 4: Table Columns (`tableColumns`)

```typescript
tableColumns: [
    // ① Bulk-select checkboxes column (place first!)
    { key: 'select', label: '', type: 'select' },

    // ② Simple sortable text
    { key: 'name', label: 'Full Name', sortable: true },

    // ③ Nested object access (dot notation)
    { key: 'department.name', label: 'Department' },

    // ④ Custom formatted text using render()
    { key: 'created_at', label: 'Joined', render: (row) => diffForHumans(row.created_at) },
    { key: 'salary', label: 'Salary', align: 'right', render: (row) => `$${row.salary.toLocaleString()}` },

    // ⑤ Simple badge (two-way color mapping via badgeColors)
    {
        key: 'status',
        label: 'Status',
        type: 'badge',
        align: 'center',
        badgeColors: {
            'active':   'bg-green-100 text-green-800',
            'inactive': 'bg-red-100 text-red-800',
            'pending':  'bg-yellow-100 text-yellow-800',
        }
    },

    // ⑥ Rich badge (with icons, hover colors — via badgeConfig object)
    {
        key: 'role',
        label: 'Role',
        type: 'badge',
        badgeConfig: {
            'admin': {
                label: 'Admin',
                variant: 'default',
                icon: ShieldIcon, // Lucide component
                class: 'bg-red-500 hover:bg-red-600 text-white border-none',
            },
            'editor': {
                label: 'Editor',
                variant: 'default',
                icon: PencilIcon,
                class: 'bg-blue-500 text-white border-none',
            }
        }
    },

    // ⑦ Avatar / profile image
    { key: 'avatar_url', label: 'Photo', type: 'avatar' },

    // ⑧ Interactive toggle switch
    {
        key: 'is_active',
        label: 'Active',
        type: 'switch',
        permission: 'employees.update',       // Hide if user lacks permission
        disabled: (row) => row.is_system,     // Per-row disable via function
        switchConfig: {
            onValue: 1,                       // Payload when ON  [Default: true]
            offValue: 0,                      // Payload when OFF [Default: false]
            onLabel: 'Active',
            offLabel: 'Inactive',
            endpoint: '/employees/:id/toggle',// :id auto-replaced
            method: 'PATCH',                  // [Default: 'POST']
            confirmToggle: true,
            confirmMessage: (row, newVal) => `${newVal ? 'Activate' : 'Deactivate'} ${row.name}?`,
            onToggle: async (row, newValue, router) => {
                // Return false to cancel the toggle!
                if (row.is_admin && !newValue) return false;
            },
        }
    },

    // ⑨ Actions column (edit / delete / custom row action buttons)
    { key: 'actions', label: 'Actions', type: 'actions' },
],
```

### Reference: `tableColumns` (ColumnConfig) Properties

| Property                                                                                                                                      | Type                                                                                                                                | Status | Default  | Description                                                                                                                                               |
| :-------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :----- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [key](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/components/ModuleManager/FormField.vue#1157-1158) | `string`                                                                                                                            | ✅     | -        | Maps to JSON key. Dot notation for nested (`department.name`).                                                                                            |
| [label](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#166-168)                                | `string`                                                                                                                            | ✅     | -        | Column header text.                                                                                                                                       |
| `type`                                                                                                                                        | `string`                                                                                                                            | ⬜     | `'text'` | `'text'`, `'badge'`, `'avatar'`, `'switch'`, `'select'`, `'actions'`.                                                                                     |
| `sortable`                                                                                                                                    | `boolean`                                                                                                                           | ⬜     | `false`  | Enables click-to-sort. Requires backend `sortable_columns`.                                                                                               |
| `align`                                                                                                                                       | `string`                                                                                                                            | ⬜     | `'left'` | `'left'`, `'center'`, `'right'`.                                                                                                                          |
| [render](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/roles/rolesConfig.ts#128-129)                              | `Function(row)`                                                                                                                     | ⬜     | `null`   | Returns an HTML string. Full custom rendering.                                                                                                            |
| `badgeColors`                                                                                                                                 | `Record<string,string>`                                                                                                             | ⬜     | `{}`     | Simple map of value → Tailwind classes.                                                                                                                   |
| `badgeConfig`                                                                                                                                 | `Record<string,BadgeConfig>`                                                                                                        | ⬜     | `null`   | Rich map with [label](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#166-168), `variant`, `icon`, `class`. |
| [permission](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/app/Http/Controllers/Urm/RoleController.php#193-318)                          | `string`                                                                                                                            | ⬜     | `null`   | Spatie permission. Hides switch col if user lacks it.                                                                                                     |
| `disabled`                                                                                                                                    | `boolean\|Function(row)`                                                                                                            | ⬜     | `false`  | Disable per-row. Accepts a function for dynamic logic.                                                                                                    |
| `switchConfig`                                                                                                                                | [SwitchColumnConfig](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#145-151) | ⬜     | `{}`     | Extended options for `type: "switch"` columns.                                                                                                            |

### Reference: [SwitchColumnConfig](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#145-151) Properties

| Property                                                                                                             | Type                                  | Status | Default      | Description                                            |
| :------------------------------------------------------------------------------------------------------------------- | :------------------------------------ | :----- | :----------- | :----------------------------------------------------- |
| `endpoint`                                                                                                           | `string`                              | ⬜     | Update URL   | Toggle URL. `:id` is auto-replaced with row ID.        |
| `method`                                                                                                             | `string`                              | ⬜     | `'POST'`     | HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). |
| `onValue`                                                                                                            | `any`                                 | ⬜     | `true`       | Value sent when switched ON.                           |
| `offValue`                                                                                                           | `any`                                 | ⬜     | `false`      | Value sent when switched OFF.                          |
| `onLabel`                                                                                                            | `string`                              | ⬜     | `'Active'`   | Tooltip for ON state.                                  |
| `offLabel`                                                                                                           | `string`                              | ⬜     | `'Inactive'` | Tooltip for OFF state.                                 |
| `confirmToggle`                                                                                                      | `boolean`                             | ⬜     | `false`      | Shows SweetAlert before toggling.                      |
| `confirmMessage`                                                                                                     | `Function(row, newVal)`               | ⬜     | Generic      | Returns a custom string for the SweetAlert dialog.     |
| `onToggle`                                                                                                           | `async Function(row, newVal, router)` | ⬜     | `null`       | Custom async toggle handler. Return `false` to cancel. |
| [permission](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/app/Http/Controllers/Urm/RoleController.php#193-318) | `string`                              | ⬜     | `null`       | Hides the switch if user lacks this Spatie permission. |
| `disabled`                                                                                                           | `boolean\|Function(row)`              | ⬜     | `false`      | Disables toggle per-row.                               |

---

## STEP 5: Form Fields (`formFields`)

The form opens in a dialog on Create and Edit.

```typescript
formFields: [
    // ── STANDARD INPUTS ──────────────────────────────────────────────
    { name: 'name',     label: 'Full Name', type: 'text',     required: true, width: 'full', size: 'lg' },
    { name: 'email',    label: 'Email',     type: 'email',    required: true, width: '1/2' },
    { name: 'website',  label: 'Website',   type: 'url',      width: '1/2' },
    { name: 'phone',    label: 'Phone',     type: 'tel',      width: '1/2' },
    { name: 'age',      label: 'Age',       type: 'number',   width: '1/4', defaultValue: 18 },
    { name: 'dob',      label: 'Birthday',  type: 'date',     width: '1/4' },
    { name: 'shift',    label: 'Shift',     type: 'time',     width: '1/4' },
    { name: 'login_at', label: 'Login At',  type: 'datetime-local', width: '1/2' },

    // ── PASSWORDS (visibility control) ────────────────────────────────
    { name: 'password',              label: 'New Password',     type: 'password', width: '1/2', showOnlyOnCreate: true },
    { name: 'password_confirmation', label: 'Confirm Password', type: 'password', width: '1/2', showOnlyOnCreate: true },
    { name: 'current_password',      label: 'Current Password', type: 'password', width: '1/2', showOnlyOnEdit: true },

    // ── HIDDEN ────────────────────────────────────────────────────────
    { name: 'created_by', type: 'hidden', defaultValue: 1 },

    // ── MULTI-LINE ────────────────────────────────────────────────────
    { name: 'bio', label: 'Biography', type: 'textarea', width: 'full', rows: 5 },

    // ── STATIC DROPDOWNS ─────────────────────────────────────────────
    {
        name: 'status', label: 'Status', type: 'select', width: '1/3',
        defaultValue: 'Active',
        options: [
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' }
        ]
    },
    {
        name: 'gender', label: 'Gender', type: 'radio', width: '1/2',
        orientation: 'horizontal', // ⬜ ['vertical']
        options: [{ value: 'm', label: 'Male' }, { value: 'f', label: 'Female' }]
    },

    // ── TOGGLE SWITCH ─────────────────────────────────────────────────
    {
        name: 'is_active', label: 'Active Account', type: 'switch', width: '1/4',
        defaultValue: true,
        switchConfig: { onValue: 1, offValue: 0, onLabel: 'Yes', offLabel: 'No' }
    },

    // ── AJAX SEARCHABLE DROPDOWN (vue-select) ─────────────────────────
    {
        name: 'department_id', label: 'Department', type: 'vue-select', width: '1/2',
        ajaxConfig: {
            endpoint: '/employees/departments/search', // ✅ Backend URL
            method: 'GET',                             // ⬜ ['GET']
            searchParam: 'search',                     // ⬜ ['search']
            resultsPath: 'data',                       // ⬜ ['data']
            labelKey: 'name',                          // ⬜ ['label'] Can also be a function: (item) => `${item.name} (${item.code})`
            valueKey: 'id',                            // ⬜ ['value']
            debounce: 500,                             // ⬜ [300] ms delay
            resetOnEmpty: true,                        // ⬜ [true]
            params: { type: 'active' },                // ⬜ Static extra params always sent
            // Dynamic params - re-evaluated on each search:
            // params: (formData) => ({ company_id: formData.company_id }),
            renderOption: (item) => `<b>${item.name}</b> <small>${item.code}</small>`, // ⬜ Custom option HTML
            resetFields: ['position_id', 'team_id'], // ⬜ Clear these when THIS changes
            onSelect: (item, form) => {               // ⬜ Auto-fill other fields on pick
                form.setData('manager_name', item.manager_name);
                form.setData('region', item.region_code);
            },
        }
    },
    // Static vue-select (no AJAX - pass options array directly)
    {
        name: 'guard_name', label: 'Guard', type: 'vue-select',
        options: [{ value: 'web', label: 'Web' }, { value: 'api', label: 'API' }],
        defaultValue: 'web'
    },

    // ── FILE UPLOADS ──────────────────────────────────────────────────
    {
        name: 'avatar', label: 'Profile Photo', type: 'avatar', width: '1/3',
        fileConfig: {
            maxSize: 5,                                            // ⬜ [10] MB
            accept: 'image/png,image/jpeg,image/webp',            // ⬜ ['*']
            preview: true,                                         // ⬜ [true] Show thumbnail
            uploadEndpoint: '/employees/upload-avatar',           // ⬜ Custom upload URL
            storagePath: 'avatars',                               // ⬜ Storage subfolder
        }
    },
    {
        name: 'documents', label: 'Attach Files', type: 'file', width: '2/3',
        fileConfig: { multiple: true, maxFiles: 5, maxSize: 10, accept: '.pdf,.docx' }
    },

    // ── CHECKBOX GROUP + CHECK-ALL ─────────────────────────────────────
    {
        name: 'master_toggle', label: 'Grant All Permissions', type: 'check-all',
        targetGroup: 'permissions', // ✅
        skipSubmit: true,           // ✅ CRITICAL: Exclude from Laravel payload!
        showBorder: false,          // ⬜ [true]
        showLabel: true,            // ⬜ [true]
        width: 'full'
    },
    {
        name: 'can_read', label: 'Read', type: 'checkbox',
        group: 'permissions',         // ✅ Links to check-all targetGroup
        showSelectAll: true,          // ⬜ Shows "Select All / None" above the group
        width: '1/4'
    },
    { name: 'can_write',  label: 'Write',  type: 'checkbox', group: 'permissions', width: '1/4' },
    { name: 'can_delete', label: 'Delete', type: 'checkbox', group: 'permissions', width: '1/4' },

    // ── FIELD EVENTS (Advanced: AJAX on input events) ─────────────────
    {
        name: 'role_name', label: 'Role Name', type: 'text',
        events: {
            onFocus: {  // Fires when user clicks into field
                ajaxConfig: {
                    endpoint: '/roles/next-order',
                    method: 'POST',
                    params: (formData, value) => ({ name: value }),   // Dynamic params
                    onSuccess: (data, form) => { form.setData('order', data.order); },
                    onError: (error, form) => { form.setError('order', 'Already taken'); },
                    condition: (formData) => !formData.order,         // Only fire if order is empty
                    enableReload: true,                               // Show a reload icon button
                }
            },
            onBlur: (value, form) => {
                form.setData('slug', value.toLowerCase().replace(/ /g, '-'));
            },
        },
        onChange: (value, form) => { console.log('Changed:', value); } // Shorthand
    },
],
```

### Reference: Base [FormField](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#182-262) Properties

| Property                                                                                                       | Type                                                                                                                       | Status | Default      | Description                                                                                                                                                                                      |
| :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :----- | :----------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                                                                                                         | `string`                                                                                                                   | ✅     | -            | Maps to Laravel `$request->name` payload key.                                                                                                                                                    |
| [label](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#166-168) | `string`                                                                                                                   | ✅     | -            | Text displayed above the input.                                                                                                                                                                  |
| `type`                                                                                                         | `string`                                                                                                                   | ✅     | -            | See all supported types below.                                                                                                                                                                   |
| `width`                                                                                                        | [GridWidth](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#163-174) | ⬜     | `'full'`     | any 12-column fraction (`'1/12'` … `'11/12'`, `'1/6'`, `'1/2'`, `'1/3'`, fifths …), `'full'`, or raw `col-*` classes                                                                                                        |
| `size`                                                                                                         | `string`                                                                                                                   | ⬜     | `'md'`       | `'xs'` … `'7xl'`, or raw Tailwind classes. Overrides `formInputSize`.                                                                                                                                       |
| `required`                                                                                                     | `boolean`                                                                                                                  | ⬜     | `false`      | Adds red `*` to label.                                                                                                                                                                           |
| `disabled`                                                                                                     | `boolean`                                                                                                                  | ⬜     | `false`      | Greys out, blocks interaction.                                                                                                                                                                   |
| `readonly`                                                                                                     | `boolean`                                                                                                                  | ⬜     | `false`      | Shows value; prevents editing.                                                                                                                                                                   |
| `min`                                                                                                          | `number\|string`                                                                                                           | ⬜     | `null`       | Minimum value for number/date inputs.                                                                                                                                                            |
| `max`                                                                                                          | `number\|string`                                                                                                           | ⬜     | `null`       | Maximum value for number/date inputs.                                                                                                                                                            |
| `showInRow`                                                                                                    | `boolean`                                                                                                                  | ⬜     | `false`      | If `true`, displays label and input side-by-side.                                                                                                                                                |
| `labelWidth`                                                                                                   | `string`                                                                                                                   | ⬜     | `null`       | Width for label when `showInRow` is true (e.g. '200px', '2/3').                                                                                                                                  |
| `inputWidth`                                                                                                   | `string`                                                                                                                   | ⬜     | `null`       | Width for input when `showInRow` is true (e.g. '60px').                                                                                                                                          |
| `placeholder`                                                                                                  | `string`                                                                                                                   | ⬜     | `''`         | Hint text inside input.                                                                                                                                                                          |
| `defaultValue`                                                                                                 | `any`                                                                                                                      | ⬜     | `null`       | Pre-fills in Create mode.                                                                                                                                                                        |
| `skipSubmit`                                                                                                   | `boolean`                                                                                                                  | ⬜     | `false`      | Omits field from Laravel payload.                                                                                                                                                                |
| `showLabel`                                                                                                    | `boolean`                                                                                                                  | ⬜     | `true`       | Toggles label visibility.                                                                                                                                                                        |
| `showBorder`                                                                                                   | `boolean`                                                                                                                  | ⬜     | `true`       | Toggles border on `check-all` container.                                                                                                                                                         |
| `rows` / `cols`                                                                                                | `number`                                                                                                                   | ⬜     | `3` / auto   | For `textarea`.                                                                                                                                                                                  |
| `className`                                                                                                    | `string`                                                                                                                   | ⬜     | `''`         | Extra Tailwind classes on wrapper.                                                                                                                                                               |
| `orientation`                                                                                                  | `string`                                                                                                                   | ⬜     | `'vertical'` | `'horizontal'` or `'vertical'`. For `radio`, `checkbox`.                                                                                                                                         |
| `options`                                                                                                      | `Array<{value,label}>`                                                                                                     | ⬜     | `[]`         | Required for `select`, `radio`, `checkbox`, static `vue-select`.                                                                                                                                 |
| `hideOnCreate`                                                                                                 | `boolean`                                                                                                                  | ⬜     | `false`      | Hides in Create dialog only.                                                                                                                                                                     |
| `hideOnEdit`                                                                                                   | `boolean`                                                                                                                  | ⬜     | `false`      | Hides in Edit dialog only.                                                                                                                                                                       |
| `showOnlyOnCreate`                                                                                             | `boolean`                                                                                                                  | ⬜     | `false`      | Only visible when creating a new record.                                                                                                                                                         |
| `showOnlyOnEdit`                                                                                               | `boolean`                                                                                                                  | ⬜     | `false`      | Only visible when editing an existing record.                                                                                                                                                    |
| `group`                                                                                                        | `string`                                                                                                                   | ⬜     | `null`       | Links `checkbox` to a `check-all` master field.                                                                                                                                                  |
| `targetGroup`                                                                                                  | `string`                                                                                                                   | ⬜     | `null`       | For `check-all`: which `group` to toggle.                                                                                                                                                        |
| `showSelectAll`                                                                                                | `boolean`                                                                                                                  | ⬜     | `false`      | "Select All / None" link above a `checkbox` list.                                                                                                                                                |
| `onChange`                                                                                                     | `Function(value, form)`                                                                                                    | ⬜     | `null`       | Shorthand change callback.                                                                                                                                                                       |
| `events`                                                                                                       | `EventsObject`                                                                                                             | ⬜     | `null`       | Full event hooks: `onFocus`, `onBlur`, `onKeyUp`, `onKeyDown`, `onChange`, [onInput](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/modules/moduleConfig.ts#159-170). |
| `ajaxConfig`                                                                                                   | `AjaxConfig`                                                                                                               | ⬜     | `null`       | Required for `vue-select`.                                                                                                                                                                       |
| `fileConfig`                                                                                                   | `FileConfig`                                                                                                               | ⬜     | `null`       | For `file`, `image`, `avatar`.                                                                                                                                                                   |
| `switchConfig`                                                                                                 | `SwitchConfig`                                                                                                             | ⬜     | `null`       | For `switch` type.                                                                                                                                                                               |

### Supported `type` Values

| Type                                                                                                                                   | Description                             |
| :------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| `text`, `email`, `number`, `password`, `url`, `tel`                                                                                    | Standard HTML5 inputs                   |
| [date](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/app/Http/Controllers/Urm/UserController.php#75-95), `time`, `datetime-local` | Datetime pickers                        |
| `hidden`                                                                                                                               | Hidden value, submitted to server       |
| `textarea`                                                                                                                             | Multi-line text (use `rows`)            |
| `select`                                                                                                                               | Static dropdown                         |
| `radio`                                                                                                                                | Radio button group (use `orientation`)  |
| `checkbox`                                                                                                                             | Checkbox group (use with `check-all`)   |
| `vue-select`                                                                                                                           | Searchable AJAX or static dropdown      |
| `switch`                                                                                                                               | Boolean toggle                          |
| `avatar`                                                                                                                               | Profile image upload with round preview |
| `file`                                                                                                                                 | General-purpose file uploader           |
| `check-all`                                                                                                                            | Master toggle for a `checkbox` group    |

### Reference: `ajaxConfig` Properties

| Property                                                                                                          | Type                         | Status | Default    | Description                                                                       |
| :---------------------------------------------------------------------------------------------------------------- | :--------------------------- | :----- | :--------- | :-------------------------------------------------------------------------------- |
| `endpoint`                                                                                                        | `string`                     | ✅     | -          | URL called when user types.                                                       |
| `method`                                                                                                          | `string`                     | ⬜     | `'GET'`    | HTTP method.                                                                      |
| `searchParam`                                                                                                     | `string`                     | ⬜     | `'search'` | Query key sent to backend with user's typed text.                                 |
| `resultsPath`                                                                                                     | `string`                     | ⬜     | `'data'`   | JSON key in backend response containing the array.                                |
| [labelKey](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#166-168) | `string\|Function(item)`     | ⬜     | `'label'`  | Key or function for the display text.                                             |
| `valueKey`                                                                                                        | `string`                     | ⬜     | `'value'`  | Key saved to form on selection.                                                   |
| `debounce`                                                                                                        | `number`                     | ⬜     | `300`      | ms delay before firing the search request.                                        |
| `resetOnEmpty`                                                                                                    | `boolean`                    | ⬜     | `true`     | Clears options when search box is empty.                                          |
| [params](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/roles/rolesConfig.ts#146-149)  | `Object\|Function(formData)` | ⬜     | `{}`       | Extra params always sent. Function for dynamic values based on other form fields. |
| `renderOption`                                                                                                    | `Function(item)`             | ⬜     | `null`     | Returns HTML string to customize dropdown option appearance.                      |
| `resetFields`                                                                                                     | `string[]`                   | ⬜     | `[]`       | Field `name`s to clear when this field's value changes.                           |
| [onSelect](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#176-181) | `Function(item, form)`       | ⬜     | `null`     | Callback after selection. Use `form.setData(key, val)` to auto-fill other fields. |

### Reference: `fileConfig` Properties

| Property         | Type      | Status | Default | Description                                                 |
| :--------------- | :-------- | :----- | :------ | :---------------------------------------------------------- |
| `maxSize`        | `number`  | ⬜     | `10`    | Max size in MB.                                             |
| `maxFiles`       | `number`  | ⬜     | `1`     | Max number of files (for `multiple: true`).                 |
| `multiple`       | `boolean` | ⬜     | `false` | Allow multi-file selection.                                 |
| `accept`         | `string`  | ⬜     | `'*'`   | MIME types or extensions: `"image/*"`, `".pdf,.docx"`.      |
| `preview`        | `boolean` | ⬜     | `true`  | Show image thumbnail preview.                               |
| `uploadEndpoint` | `string`  | ⬜     | `null`  | Custom endpoint for standalone upload (before form submit). |
| `storagePath`    | `string`  | ⬜     | `null`  | Storage subfolder hint for the backend.                     |

---

## STEP 6: CRUD Endpoints (`actionConfig`)

```typescript
actionConfig: {
    create: {
        show: true,                   // ⬜ [false] Shows the "Create" button
        icon: PlusCircle,             // ⬜ Lucide icon
        dialogueSize: '2xl',          // ⬜ Overrides root createDialogSize
        permission: 'user create',    // ⬜ Spatie permission
        endpoint: BASE_URI,           // ✅ POST to this URL
        addMore: 'confirm',           // ⬜ [false] true=keep open, 'confirm'=ask user, false=close
        messages: {
            success: 'Employee created!',   // ⬜ Custom toast messages
            error: 'Failed to create.',
        }
    },
    edit: {
        show: true,
        icon: FileEdit,
        dialogueSize: 'xl',
        permission: 'user edit',
        endpoint: `${BASE_URI}/:id`,  // ✅ :id auto-replaced with row ID
        messages: { success: 'Updated!', error: 'Update failed.' }
    },
    delete: {
        show: true,
        icon: Trash,
        permission: 'user delete',
        endpoint: `${BASE_URI}/:id`,  // ✅
        messages: { success: 'Deleted!' }
    },
    view: {                           // Controls the "Eye" icon in each row
        show: true,
        icon: Eye,
        permission: 'user view',
    },
    detailsView: {                    // Controls an inline details panel (if implemented)
        show: true,
        permission: 'user view',
    },
    bulkDelete: {                     // Enables row checkboxes + "Delete Selected" button
        show: true,
        icon: Settings,
        permission: 'user delete',
        endpoint: `${BASE_URI}/bulk-delete`, // ✅ Receives POST { ids: [1,2,3] }
    },
    export: {                         // Enables "Export" button on toolbar
        show: true,
        icon: FileSpreadsheet,
        permission: 'user export',
        endpoint: `${BASE_URI}/export`, // ✅
        method: 'POST',               // ⬜ ['GET']
    }
},
```

### Reference: [ActionSettings](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#332-347) (per CRUD action)

| Property                                                                                                                           | Type                                                                                                                        | Status | Default   | Description                                                                                                                                                                                    |
| :--------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :----- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [show](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/composables/useCrudHandlers.ts#12-48) | `boolean`                                                                                                                   | ⬜     | `false`   | Shows the button. Must be `true` to be visible.                                                                                                                                                |
| `endpoint`                                                                                                                         | `string`                                                                                                                    | ✅     | -         | URL. Use `:id` as placeholder for row ID.                                                                                                                                                      |
| [permission](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/app/Http/Controllers/Urm/RoleController.php#193-318)               | `string`                                                                                                                    | ⬜     | `null`    | Spatie permission to show this button.                                                                                                                                                         |
| `icon`                                                                                                                             | `Component`                                                                                                                 | ⬜     | Default   | Lucide icon.                                                                                                                                                                                   |
| `dialogueSize`                                                                                                                     | [DialogSize](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#153-163) | ⬜     | Root size | Overrides root dialog size for this action.                                                                                                                                                    |
| `method`                                                                                                                           | `string`                                                                                                                    | ⬜     | `'POST'`  | HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).                                                                                                                                         |
| `messages.success`                                                                                                                 | `string`                                                                                                                    | ⬜     | Generic   | Custom green toast on success.                                                                                                                                                                 |
| `messages.error`                                                                                                                   | `string`                                                                                                                    | ⬜     | Generic   | Custom red toast on error.                                                                                                                                                                     |
| `addMore`                                                                                                                          | `boolean\|'confirm'`                                                                                                        | ⬜     | `false`   | For [create](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/components/ModuleManager/FileUploadField.vue#403-416) only. Keeps dialog open after saving. |

---

## STEP 7: Custom Row Actions ([customRowActions](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/components/ModuleManager/GenericTable.vue#592-593))

Adds extra buttons to the "Actions" column of each row.

```typescript
customRowActions: [
    // ── Pattern A: Static inline form popup ──────────────────────────
    {
        key: 'send-email',
        label: 'Send Welcome Email',
        icon: Mail,
        permission: 'user edit',
        variant: 'outline',          // ⬜ 'default', 'destructive', 'outline', 'ghost'
        dialogSize: 'xl',            // ⬜ ['md']
        formFields: [                // Setting this opens a popup form
            { name: 'subject', label: 'Subject', type: 'text', required: true, defaultValue: 'Welcome!' },
            { name: 'message', label: 'Body', type: 'textarea', rows: 6, required: true },
        ],
        submitLabel: 'Send Email',   // ⬜ ['Submit']
        // onClick receives the *form data* as a 3rd argument when formFields is defined
        onClick: async (row, router, formData) => {
            await router.post(`/users/${row.id}/welcome-email`, formData || {}, { preserveScroll: true });
            return true; // Return true to close dialog and show success
        },
    },

    // ── Pattern B: Dynamic form loaded from server ────────────────────
    {
        key: 'permissions',
        label: 'Assign Permissions',
        icon: LockIcon,
        permission: 'role view',
        dialogSize: 'full',
        loadForm: (row) => ({             // Fetches form definition + data from server
            url: `/roles/${row.id}/permissions`,
            method: 'GET',
            preserveScroll: true,
        }),
        submitConfig: (row) => ({         // Where to POST the submitted form
            url: `/roles/${row.id}/permissions`,
            method: 'POST',
            preserveScroll: true,
        }),
        submitLabel: 'Save Permissions',
    },

    // ── Pattern C: Confirmation + script (no popup) ───────────────────
    {
        key: 'terminate',
        label: 'Terminate',
        icon: BanIcon,
        confirmMessage: 'Permanently terminate this employee?', // ⬜ Shows SweetAlert
        onClick: async (row, router) => {
            await axios.post(`/employees/${row.id}/terminate`);
            router.reload();
        }
    },
],
```

### Reference: [CustomAction](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#279-303) Properties

| Property                                                                                                                                      | Type                                                                                                                        | Status | Default     | Description                                                                                                                                                       |
| :-------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :----- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [key](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/components/ModuleManager/FormField.vue#1157-1158) | `string`                                                                                                                    | ✅     | -           | Unique action identifier.                                                                                                                                         |
| [label](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#166-168)                                | `string`                                                                                                                    | ✅     | -           | Tooltip text on the button.                                                                                                                                       |
| `icon`                                                                                                                                        | `Component`                                                                                                                 | ⬜     | `null`      | Lucide icon component.                                                                                                                                            |
| [permission](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/app/Http/Controllers/Urm/RoleController.php#193-318)                          | `string`                                                                                                                    | ⬜     | `null`      | Spatie permission to show button.                                                                                                                                 |
| `variant`                                                                                                                                     | `string`                                                                                                                    | ⬜     | `'default'` | `'default'`, `'destructive'`, `'outline'`, `'ghost'`.                                                                                                             |
| `dialogSize`                                                                                                                                  | [DialogSize](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/types/module.ts#153-163) | ⬜     | `'md'`      | Popup dialog size.                                                                                                                                                |
| `confirmMessage`                                                                                                                              | `string`                                                                                                                    | ⬜     | `null`      | Shows SweetAlert before executing.                                                                                                                                |
| `formFields`                                                                                                                                  | `FormField[]`                                                                                                               | ⬜     | `null`      | Static array for popup form. _(Either this or [loadForm](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#231-236))_ |
| [loadForm](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#231-236)                             | `Function(row)`                                                                                                             | ⬜     | `null`      | Returns `{url, method}`. Fetches form fields dynamically.                                                                                                         |
| [submitConfig](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#236-241)                         | `Function(row)`                                                                                                             | ⬜     | `null`      | Returns `{url, method}`. Required when using [loadForm](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#231-236).   |
| `submitLabel`                                                                                                                                 | `string`                                                                                                                    | ⬜     | `'Submit'`  | Submit button text in popup.                                                                                                                                      |
| [onClick](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/users/userConfig.ts#395-405)                              | `async Function(row, router, formData?)`                                                                                    | ⬜     | `null`      | Custom script. `formData` is passed if `formFields` is defined. Return `true` to close popup.                                                                     |
| `dnd`                                                                                                                                         | `boolean`                                                                                                                   | ⬜     | `false`     | **(Bulk Only)** Enable drag-and-drop reordering of fields in the form.                                                                                            |
| `validation`                                                                                                                                  | `Function(rows)`                                                                                                            | ⬜     | `null`      | **(Bulk Only)** Returns `{isValid, message}`. Validates selection before opening dialog.                                                                          |

---

## STEP 8: Toolbar Filters & View Options

### [customFilters](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/components/ModuleManager/FilterBar.vue#378-379) (Persistent Toolbar Dropdowns)

```typescript
customFilters: [
    // Static options filter (with icon)
    {
        key: 'status',                   // ✅ Query parameter sent to Laravel
        label: 'Status',                 // ✅
        icon: FilterIcon,                // ⬜ Lucide icon next to label
        type: 'select',                  // ⬜ ['select'] or 'vue-select'
        defaultValue: 'all',             // ⬜ Pre-selected value
        placeholder: 'All Statuses',     // ⬜ Hint text
        className: 'w-48',               // ⬜ Tailwind class on the filter widget
        options: [
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
        ]
    },
    // AJAX filter (searches as user types)
    {
        key: 'department_id',
        label: 'Department',
        type: 'vue-select',
        ajaxConfig: { endpoint: '/departments/search', labelKey: 'name', valueKey: 'id' }
    }
],
```

| Property                                                                                                                                      | Type                   | Status | Default    | Description                            |
| :-------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- | :----- | :--------- | :------------------------------------- |
| [key](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/components/ModuleManager/FormField.vue#1157-1158) | `string`               | ✅     | -          | Query string key sent to Laravel.      |
| [label](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#166-168)                                | `string`               | ✅     | -          | UI label.                              |
| `type`                                                                                                                                        | `string`               | ⬜     | `'select'` | `'select'` or `'vue-select'`.          |
| `icon`                                                                                                                                        | `Component`            | ⬜     | `null`     | Lucide icon.                           |
| `defaultValue`                                                                                                                                | `string`               | ⬜     | `null`     | Pre-selected value on load.            |
| `placeholder`                                                                                                                                 | `string`               | ⬜     | `null`     | Hint text.                             |
| `className`                                                                                                                                   | `string`               | ⬜     | `null`     | Custom Tailwind classes on the widget. |
| `options`                                                                                                                                     | `Array<{value,label}>` | ⬜     | `[]`       | Required for `type: 'select'`.         |
| `ajaxConfig`                                                                                                                                  | `AjaxConfig`           | ⬜     | `null`     | Required for `type: 'vue-select'`.     |

### [customBulkActions](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/components/ui-builder/components/ModuleManager/GenericTable.vue#593-594) (Multi-row Selection Actions)

```typescript
customBulkActions: [
    {
        key: 'bulk-activate',
        label: 'Activate All',
        permission: 'users.bulk-activate',
        endpoint: '/employees/bulk-activate', // Receives POST { ids: [1,2,3] }
        validation: (rows) => rows.every(r => r.parent_id === rows[0].parent_id) ? { isValid: true } : { isValid: false, message: 'Must be same parent' }, // Conditional check
        formFields: (rows) => rows.map(r => ({ name: '...'})), // Dynamic form fields
    },
    {
        key: 'bulk-email',
        label: 'Send Bulk Email',
        permission: 'users.bulk-email',
        endpoint: '/employees/bulk-email',
    }
],
```

> **Note**: For Bulk Actions, `formFields` and `submitConfig` can be **functions** that receive the array of selected `rows`.

### `viewFields` (Read-only "Eye" Dialog)

```typescript
viewFields: {
    showAll: false,                 // ⬜ [false] true = show every DB column automatically
    fields: ['name', 'email'],      // ⬜ Explicit columns to show when showAll is false
    except: ['id', 'password'],     // ⬜ Columns to HIDE when showAll is true
    format: [
        { key: 'created_at', data: 'created_at', type: 'date' },          // Human readable date
        { key: 'salary', data: 'salary', type: 'badge' },                  // Colored badge
        { key: 'manager', data: (row) => row.manager?.full_name ?? '–' } // Custom value
    ]
},
```

### `importConfig` (Excel/CSV Upload)

```typescript
importConfig: {
    enabled: true,                                   // ✅
    endpoint: '/employees/import',                   // ✅
    templateUrl: '/downloads/employee_template.xlsx',// ⬜ "Download Template" link
    maxFileSize: 10,                                 // ⬜ [10] MB
    acceptedFormats: ['.xlsx', '.xls', '.csv'],      // ⬜ Allowed formats
    requiredColumns: ['name', 'email'],              // ⬜ Validated on import
    columnMapping: { 'Employee Name': 'name' },      // ⬜ Map Excel headers → DB columns
},
```

---

## Common Mistakes & Troubleshooting

> [!CAUTION]
> **"My table shows no data"**
> The value of `dataPropName` in your config does NOT exactly match the key you used in `Inertia::render('...', ['**employees**' => $data])`.

> [!CAUTION]
> **"My AJAX dropdown shows a spinning loader and never loads"**
> Your backend search method is NOT wrapping results in a `'data'` key. It MUST be `return response()->json(['data' => $results]);`.

> [!CAUTION]
> **"My check-all field value is being sent to Laravel and breaking validation"**
> You forgot `skipSubmit: true` on your `type: "check-all"` field. The UI Builder sends it, but Laravel has no column for it.

> [!CAUTION]
> **"After saving, the table doesn't refresh"**
> Your controller is NOT returning `back()` or `back()->with(...)`. You MUST use `return back()` for Inertia to trigger an automatic page reload.

> [!TIP]
> **Use `extraPropsToRefresh`** when creating a record that affects data displayed elsewhere on the page (e.g., a sidebar menu count or a roles dropdown in another component).

> [!TIP]
> **Use `diffForHumans()`** helper from `@/components/ui-builder/utils/utilities` in your [render](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/roles/rolesConfig.ts#128-129) functions to display timestamps as "3 hours ago" instead of a raw ISO date string.

> [!TIP]
> **The [loadForm](file:///Volumes/RASEL-DATA/2025-mission/kidsplaybd/resources/js/pages/urm/menus/menuConfig.ts#231-236) pattern** is powerful for editing complex relational data. The server returns both the form field definitions AND pre-filled values in a single GET request, which the popup renders automatically.
