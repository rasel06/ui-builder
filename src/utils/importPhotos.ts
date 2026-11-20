import type { ImportEntry } from '../types/import';

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTOS_PER_ITEM = 12;

const stemOf = (name: string) => name.replace(/\.[^.]+$/, '').trim().toLowerCase();
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Split the Photo cell into file names: `a.jpg; b.jpg` (also commas, pipes and new lines). */
export const photoNames = (cell: unknown): string[] =>
    String(cell ?? '')
        .split(/[;,|\n]+/)
        .map((n) => n.trim())
        .filter(Boolean);

/** Keep the files that are pictures of a usable size. */
export function acceptPhotos(list: File[]): { accepted: File[]; rejected: File[] } {
    const accepted: File[] = [];
    const rejected: File[] = [];
    for (const f of list) (PHOTO_TYPES.includes(f.type) && f.size <= PHOTO_MAX_BYTES ? accepted : rejected).push(f);

    return { accepted, rejected };
}

export interface PhotoMatching {
    /** Pictures for each row, by sheet row number. */
    byRow: Map<number, File[]>;
    /** Picture files that no row asked for. */
    unused: File[];
    /** File names a row asked for that were not added. */
    missing: string[];
    /** Rows that have more pictures than one item can hold (the extra are dropped). */
    over: number;
}

/**
 * Tie picture files to rows. A row gets the files named in its Photo cell, plus any file named
 * after its SKU: `RICE-5KG.jpg`, `RICE-5KG-2.jpg`, `RICE-5KG_back.jpg` is not matched (only a
 * number may follow the SKU), so `RICE-5KG-1` can never be mistaken for the item `RICE-5KG-10`.
 */
export function matchPhotos(entries: ImportEntry[], files: File[], skuKey = 'sku', photoKey = 'photo'): PhotoMatching {
    const byName = new Map<string, File>();
    for (const f of files) byName.set(f.name.toLowerCase(), f);

    const used = new Set<File>();
    const byRow = new Map<number, File[]>();
    const missing = new Set<string>();
    let over = 0;

    for (const entry of entries) {
        const found: File[] = [];

        for (const name of photoNames(entry.data[photoKey])) {
            const file = byName.get(name.toLowerCase()) ?? files.find((f) => stemOf(f.name) === stemOf(name));
            if (file) found.push(file);
            else missing.add(name);
        }

        const sku = String(entry.data[skuKey] ?? '').trim().toLowerCase();
        if (sku) {
            const pattern = new RegExp(`^${escapeRegExp(sku)}(?:[\\s_-]*\\(?\\d+\\)?)?$`);
            const auto = files.filter((f) => pattern.test(stemOf(f.name))).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            for (const f of auto) if (!found.includes(f)) found.push(f);
        }

        if (found.length > PHOTOS_PER_ITEM) over++;
        const list = found.slice(0, PHOTOS_PER_ITEM);
        if (list.length) {
            byRow.set(entry.row, list);
            list.forEach((f) => used.add(f));
        }
    }

    return { byRow, unused: files.filter((f) => !used.has(f)), missing: [...missing], over };
}
