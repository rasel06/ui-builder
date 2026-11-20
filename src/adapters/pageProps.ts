/**
 * The page props ui-builder reads, in one typed place. This is the server contract: the Laravel
 * side shares these on every Inertia response (quick-pos does it in HandleInertiaRequests; the
 * companion Laravel package will provide `UiBuilder::share()`).
 *
 * A host whose props have a different shape registers a mapper with `setPagePropsMapper()`;
 * the default takes the props as they are. Module data props (the paginated list, extra lists a
 * config names) are not part of this contract and are read by name.
 */

export interface UiBuilderPageProps {
    auth?: {
        user?: Record<string, any> | null;
        /** Permission names the signed-in user holds. Configs gate buttons and fields on them. */
        permissions?: string[] | null;
        [key: string]: any;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
        message?: string | null;
        /** Id of a record just created, so a list can open a follow-up action on it. */
        createdId?: number | string | null;
        [key: string]: any;
    };
    /** Host-defined fields flagged "show on list", grouped by record type (optional). */
    customFieldColumns?: Record<string, any[]>;
    /** Sidebar items; used only to borrow a module's icon when its config names none (optional). */
    sidebarMenu?: Array<{ url?: string | null; icon?: string | null }>;
    /** Text direction of the current language (optional, default ltr). */
    direction?: 'ltr' | 'rtl';
    [key: string]: any;
}

type Mapper = (props: Record<string, any>) => UiBuilderPageProps;

let mapper: Mapper = (props) => props as UiBuilderPageProps;

export function setPagePropsMapper(next: Mapper | null): void {
    mapper = next ?? ((props) => props as UiBuilderPageProps);
}

/** Reads the contract props from an Inertia page object (`usePage()`). */
export function readPageProps(page: { props: Record<string, any> } | null | undefined): UiBuilderPageProps {
    return page?.props ? mapper(page.props) : {};
}
