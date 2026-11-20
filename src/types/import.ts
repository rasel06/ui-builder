export interface ImportColumn {
    key: string;
    label: string;
    type: string;
    required: boolean;
    required_note: string | null;
    has_lookup: boolean;
    example: string | null;
    hint: string | null;
    aliases: string[];
    multiple?: boolean;
    create_missing?: boolean;
    choices?: string[] | null;
}

/** One further sheet whose rows belong to a row of the main sheet. */
export interface ImportSheet {
    key: string;
    title: string;
    columns: ImportColumn[];
    /** The main-sheet column holding the value this sheet's rows repeat. */
    parent: string;
    /** The column on this sheet that repeats it. */
    child: string;
    required: boolean;
    hint: string | null;
}

export interface ImportSchemaData {
    title: string;
    columns: ImportColumn[];
    notes: string[];
    /** Answered once for the whole file (for example the store opening stock goes to). */
    context: ImportColumn[];
    sheets: ImportSheet[];
    limits: { rows_per_request: number; rows_per_file: number };
    /** The module can hand back its current records to correct and upload again. */
    exportable?: boolean;
}

export type ImportRowStatus = 'created' | 'updated' | 'skipped' | 'failed';

export interface ImportRowResult {
    row: number;
    status: ImportRowStatus;
    messages: string[];
    id: number | string | null;
    label: string | null;
    /** Records created for this row (a new category or brand). */
    notes?: { column: string; name: string }[];
}

export interface ImportCounts {
    created: number;
    updated: number;
    skipped: number;
    failed: number;
}

/** One row of the uploaded file as the dialog holds it. */
export interface ImportEntry {
    row: number;
    data: Record<string, any>;
    /** Rows of the other sheets that belong to this one, by sheet key. */
    children?: Record<string, { row: number; data: Record<string, any> }[]>;
    result?: ImportRowResult;
    /** Set once the row is saved, so a retry never sends it twice. */
    done?: boolean;
}

/** The rows of one sheet, header split off, with each row's number as the sheet shows it. */
export interface SheetGrid {
    headers: string[];
    rows: any[][];
    rowNumbers: number[];
}

export interface SpreadsheetData extends SheetGrid {
    sheetName: string;
    /** Every other data sheet in the workbook, by its name. */
    others: Record<string, SheetGrid>;
    /** Set when the file was made from one of our templates. */
    meta: { module?: string; variant?: string | null; existing?: boolean; sheets?: { main?: string; children?: Record<string, string> } } | null;
}

/** A choice made before the file is read (for products: what is being sold). */
export interface ImportVariant {
    key: string;
    label: string;
    description: string | null;
    /** A Lucide icon name (for example Package), when the type has one. */
    icon?: string | null;
    supported: boolean;
    /** Translation key explaining why an unsupported type has no import yet. */
    reason: string | null;
}

export interface ImportChoice {
    id: number;
    name: string;
}
