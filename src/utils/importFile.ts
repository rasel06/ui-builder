import type { ImportColumn, SheetGrid, SpreadsheetData } from '../types/import';

/** Collapse a header to letters and digits so "Phone *", "phone" and "PHONE_NUMBER" compare equal. */
export const normalizeHeader = (value: unknown): string =>
    String(value ?? '')
        .toLowerCase()
        .replace(/\*/g, '')
        .replace(/[^\p{L}\p{N}]+/gu, '');

/**
 * Pair each schema column with the file column that holds it. Matches the key, the label and
 * any alias, ignoring case, spaces and the red-star suffix.
 */
export const matchColumns = (
    headers: string[],
    columns: ImportColumn[],
    /** Turns a label into the user's language, so a template downloaded in Arabic reads back. */
    translate?: (label: string) => string,
): { mapping: Record<string, number>; missing: ImportColumn[] } => {
    const normalized = headers.map(normalizeHeader);
    const used = new Set<number>();
    const mapping: Record<string, number> = {};

    for (const column of columns) {
        const wanted = [column.key, column.label, translate?.(column.label), ...column.aliases].filter(Boolean).map(normalizeHeader);
        const index = normalized.findIndex((h, i) => h !== '' && !used.has(i) && wanted.includes(h));
        if (index !== -1) {
            mapping[column.key] = index;
            used.add(index);
        }
    }

    return { mapping, missing: columns.filter((c) => mapping[c.key] === undefined) };
};

/** Split CSV text into rows. Handles quotes, escaped quotes, CRLF, a UTF-8 BOM and ; or tab delimiters. */
export const parseCsv = (text: string): string[][] => {
    const source = text.replace(/^﻿/, '');
    const firstLine = source.split(/\r?\n/, 1)[0] ?? '';
    const delimiter = [',', ';', '\t'].reduce((best, d) =>
        firstLine.split(d).length > firstLine.split(best).length ? d : best,
    ',');

    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;

    for (let i = 0; i < source.length; i++) {
        const ch = source[i];
        if (quoted) {
            if (ch === '"' && source[i + 1] === '"') {
                cell += '"';
                i++;
            } else if (ch === '"') {
                quoted = false;
            } else {
                cell += ch;
            }
        } else if (ch === '"') {
            quoted = true;
        } else if (ch === delimiter) {
            row.push(cell);
            cell = '';
        } else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && source[i + 1] === '\n') i++;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else {
            cell += ch;
        }
    }
    if (cell !== '' || row.length) {
        row.push(cell);
        rows.push(row);
    }

    return rows;
};

/** A cell's value as plain text or a number, whatever shape ExcelJS gave it. */
const cellValue = (value: any): any => {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'object') {
        if ('result' in value) return cellValue(value.result);
        if ('richText' in value) return value.richText.map((p: any) => p.text).join('');
        if ('text' in value) return String(value.text);
        if ('error' in value) return null;
    }
    return value;
};

const isBlankRow = (cells: any[]) => cells.every((c) => c === null || c === undefined || String(c).trim() === '');

/**
 * The first row with at least two filled cells is the header: people often add a title or blank
 * lines above it.
 */
const splitHeader = (grid: any[][]): { headers: string[]; rows: any[][]; rowNumbers: number[] } => {
    const headerIndex = Math.max(
        0,
        grid.findIndex((r) => r.filter((c) => c !== null && String(c).trim() !== '').length >= 2),
    );
    const headers = (grid[headerIndex] ?? []).map((h) => String(h ?? '').trim());
    const rows: any[][] = [];
    const rowNumbers: number[] = [];
    grid.slice(headerIndex + 1).forEach((cells, i) => {
        if (isBlankRow(cells)) return;
        rows.push(cells);
        rowNumbers.push(headerIndex + 2 + i);
    });

    return { headers, rows, rowNumbers };
};

export class ImportFileError extends Error {}

/** Names of the helper sheets a template carries; their rows are never data. */
const HELPER_SHEETS = new Set(['_meta', 'options', 'instructions', 'howtofill']);

const gridOf = (sheet: any): SheetGrid => {
    const grid: any[][] = [];
    // Only rows that hold something. A template carries dropdown rules down thousands of empty rows,
    // and visiting each of those cells took half a minute.
    sheet.eachRow((row: any, rowNumber: number) => {
        const cells: any[] = [];
        for (let c = 1; c <= sheet.columnCount; c++) {
            cells.push(cellValue(row.getCell(c).value));
        }
        grid[rowNumber - 1] = cells;
    });
    // Rows with nothing in them are absent from the list; keep the gaps as empty rows so numbering stays true.
    const { headers, rows, rowNumbers } = splitHeader(Array.from(grid, (r) => r ?? []));

    return { headers, rows, rowNumbers };
};

/**
 * Read a .xlsx or .csv file. ExcelJS is loaded only now, so it never weighs on a list page. A workbook
 * from one of our templates says which sheet is the main one and which hold the rest; any other
 * workbook is read by sheet name.
 */
export const readSpreadsheet = async (file: File, preferredSheet?: string): Promise<SpreadsheetData> => {
    const name = file.name.toLowerCase();

    if (name.endsWith('.csv') || name.endsWith('.txt')) {
        const { headers, rows, rowNumbers } = splitHeader(parseCsv(await file.text()));
        return { sheetName: file.name, headers, rows, rowNumbers, others: {}, meta: null };
    }

    if (!name.endsWith('.xlsx')) {
        throw new ImportFileError('unsupported');
    }

    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());

    let meta: SpreadsheetData['meta'] = null;
    const metaSheet = workbook.getWorksheet('_meta');
    if (metaSheet) {
        try {
            meta = JSON.parse(String(metaSheet.getCell('A1').value ?? 'null'));
        } catch {
            meta = null;
        }
    }

    const skip = new Set([...HELPER_SHEETS, ...(((meta as any)?.helpers as string[] | undefined) ?? []).map(normalizeHeader)]);
    const candidates = workbook.worksheets.filter((s) => !skip.has(normalizeHeader(s.name)));
    const main =
        candidates.find((s) => s.name === preferredSheet) ??
        candidates.find((s) => s.name === meta?.sheets?.main) ??
        candidates.find((s) => s.name === 'Data') ??
        candidates[0];

    if (!main) {
        throw new ImportFileError('empty');
    }

    const others: Record<string, SheetGrid> = {};
    for (const sheet of candidates) {
        if (sheet !== main) others[sheet.name] = gridOf(sheet);
    }

    return { sheetName: main.name, ...gridOf(main), others, meta };
};

/** A spreadsheet treats a cell starting with = + - @ as a formula; neutralise it in files we hand out. */
export const safeCell = (value: unknown): string => {
    const text = String(value ?? '');
    return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
};

export const toCsv = (rows: unknown[][]): string =>
    '﻿' +
    rows
        .map((r) =>
            r
                .map((v) => {
                    const text = safeCell(v);
                    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
                })
                .join(','),
        )
        .join('\r\n');
