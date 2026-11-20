<script setup lang="ts">
/**
 * The "Views" menu on a list: apply a saved set of filters, save the current one, make one the default, share it.
 * Storage comes from savedViewStore() (the host's, else the browser's).
 */
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../primitives/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../primitives/dropdown-menu';
import { router } from '../../adapters/inertia';
import { Bookmark, Check, Star, Trash2, Users } from '@lucide/vue';
import { computed, onMounted, ref } from 'vue';
import { useUiI18n } from '../../i18n';
import type { ThemeConfig } from '../../types/module';
import { useTheme } from '../../composables/useTheme';
import { currentListQuery, DATE_PRESETS, savedViewStore, viewQuery, type DatePreset, type SavedView } from '../../utils/savedViews';
import FormField from './FormField.vue';

const props = defineProps<{ scope: string; theme: ThemeConfig; buttonClass?: string }>();

const { t } = useUiI18n();
const { activeThemeName } = useTheme();
const views = ref<SavedView[]>([]);
const saving = ref(false);
const dialogOpen = ref(false);
const name = ref('');
const shared = ref(false);
const asDefault = ref(false);
// 'exact' = keep the dates as they are now (a non-empty value, so the field shows its label instead of an empty box).
const datePreset = ref('exact');
const error = ref('');

// A list that is filtered by dates can keep that range as a rule ("last 7 days") instead of the exact days it shows now.
const hasDates = computed(() => {
    const p = new URLSearchParams(window.location.search);
    return !!(p.get('date_from') || p.get('date_to'));
});
const presetField = computed(() => ({
    name: 'view_date_preset',
    label: t('ui-builder.view_dates'),
    hint: t('ui-builder.view_dates_hint'),
    type: 'select',
    options: [{ value: 'exact', label: t('ui-builder.view_dates_exact') }, ...DATE_PRESETS.map((p) => ({ value: p, label: t(`ui-builder.view_dates_${p}`) }))],
}));

const load = async () => {
    try {
        views.value = await savedViewStore().list(props.scope);
    } catch {
        views.value = [];
    }
};

const opens = (view: SavedView) => viewQuery(view);
const apply = (view: SavedView) => router.visit(`${window.location.pathname}${opens(view) ? `?${opens(view)}` : ''}`, { preserveScroll: true });
// Compared as a set of parameters, so the order they appear in the address does not matter.
const same = (a: string, b: string) => [...new URLSearchParams(a)].map(([k, v]) => `${k}=${v}`).sort().join('&') === [...new URLSearchParams(b)].map(([k, v]) => `${k}=${v}`).sort().join('&');
const isCurrent = (view: SavedView) => same(opens(view), currentListQuery());

const save = async () => {
    if (!name.value.trim()) return;
    saving.value = true;
    error.value = '';
    try {
        const preset = (hasDates.value && datePreset.value && datePreset.value !== 'exact' ? datePreset.value : null) as DatePreset | null;
        await savedViewStore().save(props.scope, { name: name.value.trim(), query: currentListQuery(), is_shared: shared.value, is_default: asDefault.value, date_preset: preset });
        dialogOpen.value = false;
        name.value = '';
        datePreset.value = 'exact';
        shared.value = false;
        asDefault.value = false;
        await load();
    } catch {
        error.value = t('ui-builder.view_save_failed');
    } finally {
        saving.value = false;
    }
};

const remove = async (view: SavedView) => {
    await savedViewStore().remove(view.id);
    await load();
};

onMounted(async () => {
    await load();
    // A list opened with no filters of its own opens the person's default view.
    const fallback = views.value.find((v) => v.is_default && (v.query || v.date_preset));
    if (!window.location.search && fallback) router.visit(`${window.location.pathname}?${opens(fallback)}`, { replace: true, preserveScroll: true });
});
</script>

<template>
    <DropdownMenu @update:open="(open: boolean) => open && load()">
        <DropdownMenuTrigger as-child>
            <button type="button" :class="buttonClass" :aria-label="t('ui-builder.views')" :title="t('ui-builder.views')">
                <Bookmark class="h-4 w-4" />
            </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" :collision-padding="8" class="w-64">
            <DropdownMenuLabel>{{ t('ui-builder.views') }}</DropdownMenuLabel>
            <p v-if="!views.length" class="px-2 py-1.5 text-xs text-muted-foreground">{{ t('ui-builder.views_none') }}</p>
            <DropdownMenuItem v-for="view in views" :key="view.id" class="flex items-center gap-2" @select="apply(view)">
                <Check class="h-3.5 w-3.5 shrink-0" :class="isCurrent(view) ? 'opacity-100' : 'opacity-0'" />
                <span class="min-w-0 flex-1 truncate">{{ view.name }}</span>
                <Star v-if="view.is_default" class="h-3.5 w-3.5 shrink-0 text-amber-500" :aria-label="t('ui-builder.view_default')" />
                <Users v-if="view.is_shared" class="h-3.5 w-3.5 shrink-0 text-muted-foreground" :aria-label="t('ui-builder.view_shared')" />
                <button
                    v-if="view.mine !== false"
                    type="button"
                    class="rounded p-0.5 text-muted-foreground hover:text-destructive"
                    :aria-label="t('ui-builder.view_delete')"
                    @click.stop.prevent="remove(view)"
                >
                    <Trash2 class="h-3.5 w-3.5" />
                </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="dialogOpen = true">{{ t('ui-builder.view_save_current') }}</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>

    <Dialog v-model:open="dialogOpen">
        <DialogContent class="sm:max-w-sm" :class="theme.cardBackground">
            <DialogHeader>
                <DialogTitle class="text-sm font-semibold">{{ t('ui-builder.view_save_current') }}</DialogTitle>
            </DialogHeader>
            <div class="space-y-3">
                <FormField :field="{ name: 'view_name', label: t('ui-builder.view_name'), type: 'text', required: true } as any" :value="name" size="md" :theme="theme" :selected-theme="activeThemeName" @update="(_n: string, v: any) => (name = String(v ?? ''))" />
                <FormField v-if="hasDates" :field="presetField as any" :value="datePreset" size="md" :theme="theme" :selected-theme="activeThemeName" @update="(_n: string, v: any) => (datePreset = String(v ?? ''))" />
                <FormField :field="{ name: 'view_default', label: t('ui-builder.view_default'), type: 'switch', placeholder: t('ui-builder.view_default_hint') } as any" :value="asDefault" size="md" :theme="theme" :selected-theme="activeThemeName" @update="(_n: string, v: any) => (asDefault = !!v)" />
                <FormField :field="{ name: 'view_shared', label: t('ui-builder.view_shared'), type: 'switch', placeholder: t('ui-builder.view_shared_hint') } as any" :value="shared" size="md" :theme="theme" :selected-theme="activeThemeName" @update="(_n: string, v: any) => (shared = !!v)" />
                <p v-if="error" class="text-sm text-destructive" role="alert">{{ error }}</p>
            </div>
            <DialogFooter>
                <button type="button" :class="['rounded-md px-3 py-1.5 text-sm font-medium', theme.primaryButton]" :disabled="saving || !name.trim()" @click="save">
                    {{ t('ui-builder.view_save') }}
                </button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
