import { saveAs } from 'file-saver';
import pluralize from 'pluralize';
import { resolveLabel } from '../i18n';
import type { ExportConfig, ModuleConfig } from '../types/module';
import { getDefaultExportConfig } from './exportDefaults';

// `jspdf` (+ its transitive `html2canvas`) and `exceljs` are ~750 KB of the bundle
// between them, but are only needed once a user actually triggers an export. They are
// therefore imported dynamically inside the handlers below rather than at module scope —
// this file is imported eagerly by GenericTable/ModuleManager/SubModuleCrudPanel, so a
// top-level import would pull that weight onto every list page in the app. The jsPDF
// import below is `import type`, which is erased at compile time and costs nothing.
import type { jsPDF } from 'jspdf';
import {
    collectScripts,
    detectScript,
    ensureCanvasFontsLoaded,
    rasterizeLines,
    registerPdfFonts,
    type ScriptKind,
} from './pdfUnicodeText';

/**
 * Recursively extracts raw text content from Vue VNodes or arrays of VNodes.
 */
export const extractTextFromVNode = (node: any): string => {
    if (node === null || node === undefined) return '';
    if (typeof node !== 'object') return String(node);

    if (Array.isArray(node)) {
        return node.map(extractTextFromVNode).filter(Boolean).join(' ');
    }

    if (node.children) {
        if (
            typeof node.children === 'string' ||
            typeof node.children === 'number'
        ) {
            return String(node.children);
        }
        if (Array.isArray(node.children)) {
            return node.children
                .map(extractTextFromVNode)
                .filter(Boolean)
                .join(' ');
        }
        if (typeof node.children === 'object') {
            return extractTextFromVNode(node.children);
        }
    }

    if (typeof node.children === 'function') {
        try {
            const slots = node.children();
            return extractTextFromVNode(slots);
        } catch (e) {
            // Ignore function/slot execution errors
        }
    }

    if (node.props) {
        if (node.props.label) return String(node.props.label);
        if (node.props.title) return String(node.props.title);
        if (node.props.children)
            return extractTextFromVNode(node.props.children);
    }

    if (node.name !== undefined && node.name !== null) return String(node.name);
    if (node.label !== undefined && node.label !== null)
        return String(node.label);
    if (node.title !== undefined && node.title !== null)
        return String(node.title);

    return '';
};

/**
 * Normalizes flat or structured ExportConfig objects into a unified flat layout.
 *
 * `moduleName`, when given, becomes the title fallback (`"${moduleName} List"`)
 * ahead of the generic static default — so a module gets a correct document
 * title for free and only needs `exportConfig.document.title` to override it.
 */
export const normalizeExportConfig = (
    config?: ExportConfig,
    moduleName?: string,
) => {
    const defaults = getDefaultExportConfig();
    const defaultTitle = moduleName ? `${pluralize(moduleName)} List` : defaults.title;

    if (!config) return { ...defaults, title: defaultTitle, companyName: hostBranding?.()?.name || defaults.companyName };

    // Resolve UI options from either nested or flat style
    const ui = config.ui || {};
    const hasFormats = Array.isArray(ui.formats);
    const pdf = hasFormats
        ? ui.formats!.includes('pdf')
        : config.pdf !== undefined
          ? config.pdf
          : defaults.pdf;
    const excel = hasFormats
        ? ui.formats!.includes('excel')
        : config.excel !== undefined
          ? config.excel
          : defaults.excel;
    const csv = hasFormats
        ? ui.formats!.includes('csv')
        : config.csv !== undefined
          ? config.csv
          : defaults.csv;
    const json = hasFormats
        ? ui.formats!.includes('json')
        : config.json !== undefined
          ? config.json
          : defaults.json;
    const print = hasFormats
        ? ui.formats!.includes('print')
        : config.print !== undefined
          ? config.print
          : defaults.print;

    const showAsGroup =
        ui.asGroup !== undefined
            ? ui.asGroup
            : config.showAsGroup !== undefined
              ? config.showAsGroup
              : defaults.showAsGroup;
    const position =
        ui.position !== undefined
            ? ui.position
            : config.position !== undefined
              ? config.position
              : defaults.position;
    const align =
        ui.align !== undefined
            ? ui.align
            : config.align !== undefined
              ? config.align
              : defaults.align;
    const showAsDropdown =
        ui.asDropdown !== undefined
            ? ui.asDropdown
            : config.showAsDropdown !== undefined
              ? config.showAsDropdown
              : defaults.showAsDropdown;
    const printPosition =
        ui.printPosition !== undefined
            ? ui.printPosition
            : config.printPosition !== undefined
              ? config.printPosition
              : defaults.printPosition;
    const activeOnlyOnData =
        ui.activeOnlyOnData !== undefined
            ? ui.activeOnlyOnData
            : config.activeOnlyOnData !== undefined
              ? config.activeOnlyOnData
              : defaults.activeOnlyOnData;
    const indentColumns =
        ui.indentColumns !== undefined
            ? ui.indentColumns
            : config.indentColumns !== undefined
              ? config.indentColumns
              : defaults.indentColumns;
    const indentCondition =
        ui.indentCondition !== undefined
            ? ui.indentCondition
            : config.indentCondition !== undefined
              ? config.indentCondition
              : defaults.indentCondition;

    // Resolve document options from either nested or flat style
    const doc = config.document || {};
    const companyName =
        doc.company !== undefined
            ? doc.company
            : config.companyName !== undefined
              ? config.companyName
              : hostBranding?.()?.name || defaults.companyName;
    const title =
        doc.title !== undefined
            ? doc.title
            : config.title !== undefined
              ? config.title
              : defaultTitle;
    const subtitle =
        doc.subtitle !== undefined
            ? doc.subtitle
            : config.subtitle !== undefined
              ? config.subtitle
              : defaults.subtitle;
    const showMeta =
        doc.showMeta !== undefined
            ? doc.showMeta
            : config.showMeta !== undefined
              ? config.showMeta
              : defaults.showMeta;
    const showFilters =
        doc.showFilters !== undefined
            ? doc.showFilters
            : config.showFilters !== undefined
              ? config.showFilters
              : defaults.showFilters;
    const themeColor =
        doc.themeColor !== undefined
            ? doc.themeColor
            : config.themeColor !== undefined
              ? config.themeColor
              : defaults.themeColor;
    const pageSize =
        doc.size !== undefined
            ? doc.size
            : config.pageSize !== undefined
              ? config.pageSize
              : defaults.pageSize;
    const orientation =
        doc.orientation !== undefined
            ? doc.orientation
            : config.orientation !== undefined
              ? config.orientation
              : defaults.orientation;
    const margin =
        doc.margin !== undefined
            ? doc.margin
            : config.margin !== undefined
              ? config.margin
              : defaults.margin;
    const cellPadding =
        doc.cellPadding !== undefined
            ? doc.cellPadding
            : config.cellPadding !== undefined
              ? config.cellPadding
              : defaults.cellPadding;
    const showSerial =
        doc.showSerial !== undefined
            ? doc.showSerial
            : config.showSerial !== undefined
              ? config.showSerial
              : defaults.showSerial;
    const repeatHeader =
        doc.repeatHeader !== undefined
            ? doc.repeatHeader
            : config.repeatHeader !== undefined
              ? config.repeatHeader
              : defaults.repeatHeader;
    const customMeta =
        doc.meta !== undefined
            ? doc.meta
            : config.customMeta !== undefined
              ? config.customMeta
              : defaults.customMeta;
    const logoPath =
        doc.logo !== undefined
            ? doc.logo
            : config.logoPath !== undefined
              ? config.logoPath
              : defaults.logoPath;

    const enabled =
        config.enabled !== undefined ? config.enabled : defaults.enabled;

    return {
        enabled,
        pdf,
        excel,
        csv,
        json,
        print,
        showAsGroup,
        position,
        align,
        showAsDropdown,
        companyName,
        title,
        subtitle,
        showMeta,
        showFilters,
        themeColor,
        pageSize,
        orientation,
        margin,
        cellPadding,
        showSerial,
        repeatHeader,
        customMeta,
        printPosition,
        activeOnlyOnData,
        indentColumns,
        indentCondition,
        logoPath,
    };
};

/**
 * Parses hex color to RGB array. Defaults to dark gray [75, 85, 99].
 */
const hexToRgb = (hex: string): [number, number, number] => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(
        shorthandRegex,
        (_, r, g, b) => r + r + g + g + b + b,
    );
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result
        ? [
              parseInt(result[1], 16),
              parseInt(result[2], 16),
              parseInt(result[3], 16),
          ]
        : [75, 85, 99];
};

/** Normalizes an autoTable cell color style (rgb array, gray-level number, hex string, or
 *  `false` for transparent) into an RGB triple for canvas/jsPDF fill calls. */
const normalizeColor = (
    color: number | number[] | string | false | undefined,
    fallback: [number, number, number],
): [number, number, number] => {
    if (Array.isArray(color))
        return [color[0], color[1], color[2]];
    if (typeof color === 'number') return [color, color, color];
    if (typeof color === 'string') return hexToRgb(color);
    return fallback;
};

/** Key used for the optional serial column, so JSON can drop it again. */
const SERIAL_KEY = '__sl';

/**
 * Extracts and formats the currently visible headers and row values from the data.
 */
const getExportableData = (
    data: any[],
    config: ModuleConfig,
    visibleColumns: string[],
) => {
    const normalizedConfig = normalizeExportConfig(config.exportConfig, config.moduleName);
    const columns = config.tableColumns.filter(
        (col) =>
            visibleColumns.includes(col.key) &&
            !['select', 'actions'].includes(col.key),
    );
    // Labels are i18n keys in most configs ('language.order', 'translation.key'), so
    // exporting `col.label` raw wrote the key itself as the column heading in every
    // PDF/Excel/CSV — the table showed "Order" while its export said "language.order".
    // `resolveLabel` returns the translation when one exists and the string unchanged
    // otherwise, so plain-English labels ('Direction') are unaffected.
    const headers = columns.map((col) => resolveLabel(col.label));
    const rows = data.map((row) =>
        columns.map((col) => {
            // Determine initial raw value, checking for dot-nested paths
            let val = row[col.key];
            if (col.key.includes('.')) {
                val = col.key
                    .split('.')
                    .reduce((acc, part) => acc?.[part], row);
            }

            let cellText = '';

            // 1. Column-specific export value formatter overrides
            if (col.exportValue) {
                cellText = col.exportValue(val, row);
            } else if (col.exportKey && val && typeof val === 'object') {
                cellText =
                    val[col.exportKey] !== undefined &&
                    val[col.exportKey] !== null
                        ? String(val[col.exportKey])
                        : '';
            }
            // 2. Avatar specific rendering
            else if (col.type === 'avatar') {
                cellText = row.name || '';
            }
            // 3. Badge specific rendering
            else if (col.type === 'badge') {
                const rawVal = col.render ? col.render(row) : val;
                if (Array.isArray(rawVal)) {
                    cellText = rawVal
                        .map((r: any) => {
                            if (typeof r === 'object' && r !== null) {
                                return (
                                    r.name ||
                                    r.label ||
                                    r.title ||
                                    r.key ||
                                    r.value ||
                                    String(r)
                                );
                            }
                            return String(r);
                        })
                        .join(', ');
                } else if (typeof rawVal === 'object' && rawVal !== null) {
                    cellText =
                        rawVal.name ||
                        rawVal.label ||
                        rawVal.title ||
                        rawVal.key ||
                        rawVal.value ||
                        '';
                } else {
                    cellText =
                        rawVal !== undefined && rawVal !== null
                            ? String(rawVal)
                            : '';
                }
            }
            // 4. Status specific rendering
            else if (col.type === 'status') {
                cellText = row.status || '';
            }
            // 5. Standard render method
            else if (col.render) {
                const rendered = col.render(row);
                cellText = extractTextFromVNode(rendered);
            }
            // 6. Object fallback mapping (prevents [object Object])
            else if (val && typeof val === 'object' && !Array.isArray(val)) {
                if (val.name !== undefined && val.name !== null)
                    cellText = String(val.name);
                else if (val.label !== undefined && val.label !== null)
                    cellText = String(val.label);
                else if (val.title !== undefined && val.title !== null)
                    cellText = String(val.title);
                else if (val.key !== undefined && val.key !== null)
                    cellText = String(val.key);
                else if (val.value !== undefined && val.value !== null)
                    cellText = String(val.value);
            } else {
                cellText = val !== undefined && val !== null ? String(val) : '';
            }

            // Post-process to apply hierarchy indent based on depth
            let depthLevel = 0;
            if (typeof normalizedConfig.indentCondition === 'function') {
                const res = normalizedConfig.indentCondition(row, col);
                if (typeof res === 'number') {
                    depthLevel = res;
                } else if (typeof res === 'boolean' && res) {
                    let depth: number | undefined = undefined;
                    if (
                        val &&
                        typeof val === 'object' &&
                        typeof val.depth === 'number'
                    ) {
                        depth = val.depth;
                    } else if (typeof row.depth === 'number') {
                        depth = row.depth;
                    }
                    depthLevel = depth || 0;
                }
            } else {
                let depth: number | undefined = undefined;
                if (
                    val &&
                    typeof val === 'object' &&
                    typeof val.depth === 'number'
                ) {
                    depth = val.depth;
                } else if (typeof row.depth === 'number') {
                    depth = row.depth;
                }
                depthLevel = depth || 0;
            }

            if (cellText && depthLevel > 0) {
                const targetCols =
                    normalizedConfig.indentColumns &&
                    normalizedConfig.indentColumns.length > 0
                        ? normalizedConfig.indentColumns
                        : ['title', 'name', 'label'];
                if (targetCols.includes(col.key)) {
                    cellText = '    '.repeat(depthLevel) + cellText;
                }
            }

            return cellText;
        }),
    );

    const showSerial = normalizedConfig.showSerial === true;
    const finalHeaders = showSerial ? ['SL', ...headers] : headers;
    const finalRows = showSerial
        ? rows.map((row, index) => [String(index + 1), ...row])
        : rows;
    // Column keys aligned 1:1 with `finalHeaders`. The tabular formats only ever
    // print the (translated) header, but JSON needs the stable machine-readable
    // key instead — a label changes with the viewer's locale, a key doesn't.
    const finalKeys = showSerial
        ? [SERIAL_KEY, ...columns.map((col) => col.key)]
        : columns.map((col) => col.key);

    return { headers: finalHeaders, rows: finalRows, keys: finalKeys };
};

/**
 * Generates a styled jsPDF Document with professional title blocks, metadata grids, and dividers.
 */
const generatePDFDocument = async (
    data: any[],
    config: ModuleConfig,
    visibleColumns: string[],
    extraMeta?: {
        activeFiltersText?: string;
        userName?: string;
        themeColor?: string;
    },
    logoImage?: HTMLImageElement | null,
): Promise<jsPDF> => {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
    ]);

    const { headers, rows } = getExportableData(data, config, visibleColumns);
    const exportConfig = normalizeExportConfig(config.exportConfig, config.moduleName);
    const columns = config.tableColumns.filter(
        (col) =>
            visibleColumns.includes(col.key) &&
            !['select', 'actions'].includes(col.key),
    );
    const companyName = exportConfig.companyName || hostBranding?.()?.name || 'Quick POS';
    const title = exportConfig.title;
    const subtitle = exportConfig.subtitle;
    const showMeta = exportConfig.showMeta !== false;
    const showFilters = exportConfig.showFilters !== false;
    const customMeta = exportConfig.customMeta || {};
    const primaryHex =
        exportConfig.themeColor || extraMeta?.themeColor || '#4b5563';

    // Resolve margins dynamically (individual top/bottom/left/right support)
    let marginTop = 14;
    let marginBottom = 14;
    let marginLeft = 14;
    let marginRight = 14;

    if (exportConfig.margin !== undefined) {
        if (typeof exportConfig.margin === 'number') {
            marginTop = exportConfig.margin;
            marginBottom = exportConfig.margin;
            marginLeft = exportConfig.margin;
            marginRight = exportConfig.margin;
        } else if (
            typeof exportConfig.margin === 'object' &&
            exportConfig.margin !== null
        ) {
            if (exportConfig.margin.top !== undefined)
                marginTop = exportConfig.margin.top;
            if (exportConfig.margin.bottom !== undefined)
                marginBottom = exportConfig.margin.bottom;
            if (exportConfig.margin.left !== undefined)
                marginLeft = exportConfig.margin.left;
            if (exportConfig.margin.right !== undefined)
                marginRight = exportConfig.margin.right;
        }
    }
    const resolvedPadding =
        exportConfig.cellPadding !== undefined ? exportConfig.cellPadding : 2.5;

    const resolvedOrientation =
        exportConfig.orientation ||
        (headers.length > 6 ? 'landscape' : 'portrait');
    const resolvedPageSize = exportConfig.pageSize || 'a4';

    // Bengali/Arabic text has no glyphs in jsPDF's built-in helvetica font (and jsPDF does
    // no OpenType shaping even for an embedded font, so vector Bengali/Arabic would render
    // disconnected/unreordered anyway) - scan every string that can end up in this document
    // and, for any non-Latin script actually present, load the matching webfont (for
    // correctly-shaped canvas rasterization) and embed the real TTF into this doc instance
    // (for accurate width/wrap metrics only - see pdfUnicodeText.ts).
    const usedScripts = collectScripts([
        companyName,
        title,
        subtitle,
        extraMeta?.userName,
        showFilters ? extraMeta?.activeFiltersText : undefined,
        ...Object.entries(customMeta).map(([key, val]) => `${key}: ${val}`),
        ...headers,
        ...rows.flat(),
    ]);
    if (usedScripts.size > 0) {
        await ensureCanvasFontsLoaded(usedScripts);
    }

    const doc = new jsPDF({
        orientation: resolvedOrientation,
        format: resolvedPageSize,
        unit: 'mm',
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const rgb = hexToRgb(primaryHex);

    const pdfFontNames =
        usedScripts.size > 0 ? await registerPdfFonts(doc, usedScripts) : {};

    /** Draws text via the normal vector helvetica path for Latin content, or rasterizes
     *  it to a correctly-shaped image for Bengali/Arabic. `x`/`y` follow jsPDF.text()'s
     *  own convention (y is the text baseline). */
    const writeText = (
        pdfDoc: jsPDF,
        text: string,
        x: number,
        y: number,
        opts: {
            fontSize: number;
            bold?: boolean;
            color?: [number, number, number];
            align?: 'left' | 'center' | 'right';
        },
    ) => {
        const color = opts.color || [0, 0, 0];
        const script = detectScript(text);
        const fontName = script !== 'latin' ? pdfFontNames[script] : undefined;
        if (!fontName) {
            pdfDoc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
            pdfDoc.setFontSize(opts.fontSize);
            pdfDoc.setTextColor(color[0], color[1], color[2]);
            pdfDoc.text(text, x, y, opts.align ? { align: opts.align } : undefined);
            return;
        }
        const raster = rasterizeLines([text], {
            script: script as Exclude<ScriptKind, 'latin'>,
            fontPx: opts.fontSize * (96 / 72),
            bold: opts.bold,
            color,
            align: opts.align,
        });
        let drawX = x;
        if (opts.align === 'center') drawX = x - raster.wMm / 2;
        else if (opts.align === 'right') drawX = x - raster.wMm;
        const drawY = y - raster.firstLineAscentMm;
        pdfDoc.addImage(raster.dataUrl, 'PNG', drawX, drawY, raster.wMm, raster.hMm);
    };

    /** Script-aware sibling of doc.splitTextToSize() - switches to the real embedded font
     *  (accurate glyph metrics) before measuring, so wrap points are correct for Bengali/
     *  Arabic instead of using helvetica's metrics for a script it has no glyphs for. */
    const splitFieldToLines = (field: string, maxWidthMm: number): string[] => {
        const script = detectScript(field);
        const fontName = script !== 'latin' ? pdfFontNames[script] : undefined;
        doc.setFont(fontName || 'helvetica', 'normal');
        doc.setFontSize(8.5);
        return doc.splitTextToSize(field, maxWidthMm);
    };

    // Helper to draw the complete page header (Accent bar, Company name, Title, Metadata block, Divider)
    const drawPageHeader = (pdfDoc: jsPDF): number => {
        let y = Math.max(6, marginTop - 8);
        if (y < 5) y = 5;

        // 1. Draw a solid colored accent bar at the very top
        pdfDoc.setFillColor(rgb[0], rgb[1], rgb[2]);
        pdfDoc.rect(0, 0, pageWidth, 5, 'F');
        y += 5;

        // Draw 3D Isometric Hexagon Logo (Matching the app branding)
        const logoSize = 6;
        // A supplied logo keeps its own proportions (a wide wordmark must not be squeezed square) in a 10mm-high box.
        const logoH = logoImage ? 10 : logoSize;
        const logoW = logoImage
            ? Math.min(36, Math.max(4, (logoH * (logoImage.naturalWidth || 1)) / (logoImage.naturalHeight || 1)))
            : logoSize;
        const logoX = marginLeft;
        const logoY = y - 1;
        const rgbLighter = [
            Math.min(255, rgb[0] + 35),
            Math.min(255, rgb[1] + 35),
            Math.min(255, rgb[2] + 35),
        ];
        const rgbDarker = [
            Math.max(0, rgb[0] - 35),
            Math.max(0, rgb[1] - 35),
            Math.max(0, rgb[2] - 35),
        ];

        const draw3DLogo = (
            doc: jsPDF,
            x: number,
            yy: number,
            size: number,
        ) => {
            const rgbLighter = [
                Math.min(255, rgb[0] + 35),
                Math.min(255, rgb[1] + 35),
                Math.min(255, rgb[2] + 35),
            ];
            const rgbDarker = [
                Math.max(0, rgb[0] - 35),
                Math.max(0, rgb[1] - 35),
                Math.max(0, rgb[2] - 35),
            ];
            doc.setFillColor(rgbLighter[0], rgbLighter[1], rgbLighter[2]);
            doc.triangle(
                x + size / 2,
                yy,
                x + size,
                yy + size / 4,
                x + size / 2,
                yy + size / 2,
                'F',
            );
            doc.triangle(
                x + size / 2,
                yy,
                x + size / 2,
                yy + size / 2,
                x,
                yy + size / 4,
                'F',
            );
            doc.setFillColor(rgb[0], rgb[1], rgb[2]);
            doc.triangle(
                x,
                yy + size / 4,
                x + size / 2,
                yy + size / 2,
                x + size / 2,
                yy + size,
                'F',
            );
            doc.triangle(
                x,
                yy + size / 4,
                x + size / 2,
                yy + size,
                x,
                yy + (3 * size) / 4,
                'F',
            );
            doc.setFillColor(rgbDarker[0], rgbDarker[1], rgbDarker[2]);
            doc.triangle(
                x + size,
                yy + size / 4,
                x + size / 2,
                yy + size / 2,
                x + size / 2,
                yy + size,
                'F',
            );
            doc.triangle(
                x + size,
                yy + size / 4,
                x + size / 2,
                yy + size,
                x + size,
                yy + (3 * size) / 4,
                'F',
            );
        };

        if (logoImage) {
            try {
                let format = 'PNG';
                if (typeof logoImage.src === 'string') {
                    if (
                        logoImage.src.includes('image/jpeg') ||
                        logoImage.src.includes('image/jpg')
                    )
                        format = 'JPEG';
                    else if (logoImage.src.includes('image/webp'))
                        format = 'WEBP';
                }
                pdfDoc.addImage(
                    logoImage,
                    format,
                    logoX,
                    logoY,
                    logoW,
                    logoH,
                );
            } catch (e) {
                console.error(
                    'Failed to add custom logo, falling back to 3D logo:',
                    e,
                );
                draw3DLogo(pdfDoc, logoX, logoY, logoSize);
            }
        } else {
            draw3DLogo(pdfDoc, logoX, logoY, logoSize);
        }

        // 2. Company Info on Left, Report Type on Right
        writeText(
            pdfDoc,
            companyName.toUpperCase(),
            marginLeft + logoW + 2.5,
            y + (logoImage ? logoH / 2 - 1.5 : 3.8),
            { fontSize: 8.5, bold: true, color: [140, 145, 155] },
        );
        writeText(pdfDoc, 'SYSTEM REPORT', pageWidth - marginRight, y + 3.8, {
            fontSize: 8.5,
            bold: true,
            color: [140, 145, 155],
            align: 'right',
        });
        y += logoImage ? logoH + 7 : 11;

        // 3. Document Main Title
        writeText(pdfDoc, title, marginLeft, y, {
            fontSize: 20,
            bold: true,
            color: [30, 41, 59], // Slate-800
        });
        y += 6;

        // 4. Subtitle
        if (subtitle) {
            writeText(pdfDoc, subtitle, marginLeft, y, {
                fontSize: 10,
                color: [100, 116, 139], // Slate-500
            });
            y += 8;
        }

        // 5. Metadata Block (Styled as a premium light gray card)
        if (showMeta) {
            const metaStartY = y;

            const leftFields = [
                `Date Generated: ${new Date().toLocaleString()}`,
                `Generated By: ${extraMeta?.userName || 'System User'}`,
                `Total Records: ${rows.length} records`,
            ];

            const rightFields: string[] = [];
            if (showFilters && extraMeta?.activeFiltersText) {
                rightFields.push(
                    `Active Filters: ${extraMeta.activeFiltersText}`,
                );
            }
            Object.entries(customMeta).forEach(([key, val]) => {
                rightFields.push(`${key}: ${val}`);
            });

            const lineSpacing = 5.5;
            const topPadding = 4;
            const bottomPadding = 2;

            const leftHeightNeeded =
                leftFields.length > 0
                    ? (leftFields.length - 1) * lineSpacing
                    : 0;

            const boxWidth = pageWidth - marginLeft - marginRight;
            const textLeftX = marginLeft + 3.5;
            const textRightX = marginLeft + boxWidth / 2 + 2.5;

            const rightHeightNeeded = 0;
            const rightSplitLines: string[][] = [];
            rightFields.forEach((field) => {
                const splitText = splitFieldToLines(field, boxWidth / 2 - 6);
                rightSplitLines.push(splitText);
            });
            const rightLinesCount = rightSplitLines.reduce(
                (acc, val) => acc + val.length,
                0,
            );
            const rightHeight =
                rightLinesCount > 0 ? (rightLinesCount - 1) * lineSpacing : 0;

            const totalTextHeight = Math.max(leftHeightNeeded, rightHeight);
            const boxHeight = totalTextHeight + topPadding + bottomPadding;

            // Draw card background and border (aligned exactly with table margins)
            pdfDoc.setFillColor(248, 250, 252); // Slate-50
            pdfDoc.setDrawColor(226, 232, 240); // Slate-200
            pdfDoc.setLineWidth(0.3);
            pdfDoc.roundedRect(
                marginLeft,
                metaStartY - 1,
                boxWidth,
                boxHeight,
                1.5,
                1.5,
                'FD',
            );

            const metaColor: [number, number, number] = [71, 85, 105]; // Slate-600

            let leftY = metaStartY - 1 + topPadding;
            leftFields.forEach((field) => {
                writeText(pdfDoc, field, textLeftX, leftY, {
                    fontSize: 8.5,
                    color: metaColor,
                });
                leftY += lineSpacing;
            });

            let rightY = metaStartY - 1 + topPadding;
            rightSplitLines.forEach((lines) => {
                lines.forEach((line: string) => {
                    writeText(pdfDoc, line, textRightX, rightY, {
                        fontSize: 8.5,
                        color: metaColor,
                    });
                    rightY += lineSpacing;
                });
            });

            y = metaStartY - 1 + boxHeight + 4; // 4mm gap below card to start of table
        } else {
            y += 2;
        }
        return y;
    };

    // Draw header on Page 1 to establish start position & header height
    const headerHeight = drawPageHeader(doc);

    // Set table margins (top margin is enlarged on subsequent pages if repeating header to avoid overlaps)
    const tableMarginTop =
        exportConfig.repeatHeader === true ? headerHeight : marginTop;

    // Cells whose text needs the canvas-rasterized treatment (see writeText/pdfUnicodeText.ts) -
    // keyed by `${section}-${row.index}-${column.index}`, populated in didParseCell (before
    // autoTable wraps/sizes the cell) and consumed in didDrawCell (after autoTable has drawn
    // its own, unshaped vector text - which the rasterized image then fully covers).
    const complexCellScripts = new Map<string, Exclude<ScriptKind, 'latin'>>();

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: headerHeight,
        showHead:
            exportConfig.repeatHeader === true ? 'everyPage' : 'firstPage',
        theme: 'striped',
        headStyles: {
            fillColor: [rgb[0], rgb[1], rgb[2]],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 3,
        },
        styles: {
            fontSize: 8,
            cellPadding: resolvedPadding,
            overflow: 'linebreak',
        },
        margin: {
            top: tableMarginTop,
            bottom: marginBottom,
            left: marginLeft,
            right: marginRight,
        },
        didParseCell: (cellData) => {
            if (usedScripts.size > 0) {
                const joined = cellData.cell.text.join(' ');
                const script = detectScript(joined);
                const fontName =
                    script !== 'latin' ? pdfFontNames[script] : undefined;
                if (fontName) {
                    // Real embedded font -> accurate width/wrap metrics for this cell.
                    // The vector glyphs it would draw are never shown - didDrawCell below
                    // always covers them with a correctly-shaped rasterized image.
                    cellData.cell.styles.font = fontName;
                    complexCellScripts.set(
                        `${cellData.section}-${cellData.row.index}-${cellData.column.index}`,
                        script as Exclude<ScriptKind, 'latin'>,
                    );
                }
            }
            if (cellData.section === 'body') {
                const hasHierarchyConfig =
                    config.exportConfig?.indentCondition !== undefined;

                if (hasHierarchyConfig) {
                    const rawRow = data[cellData.row.index];
                    if (rawRow) {
                        let isIndented = false;
                        const targetCols =
                            exportConfig.indentColumns &&
                            exportConfig.indentColumns.length > 0
                                ? exportConfig.indentColumns
                                : ['title', 'name', 'label'];
                        const colKey = targetCols[0] || 'title';
                        const colObj = columns.find(
                            (c) => c.key === colKey,
                        ) || { key: colKey };

                        if (
                            typeof exportConfig.indentCondition === 'function'
                        ) {
                            const res = exportConfig.indentCondition(
                                rawRow,
                                colObj,
                            );
                            if (typeof res === 'number') {
                                isIndented = res > 0;
                            } else if (typeof res === 'boolean') {
                                isIndented = res;
                            }
                        } else {
                            let depth: number | undefined = undefined;
                            if (typeof rawRow.depth === 'number') {
                                depth = rawRow.depth;
                            } else {
                                for (const key of targetCols) {
                                    const val = key.includes('.')
                                        ? key
                                              .split('.')
                                              .reduce(
                                                  (acc, part) => acc?.[part],
                                                  rawRow,
                                              )
                                        : rawRow[key];
                                    if (
                                        val &&
                                        typeof val === 'object' &&
                                        typeof val.depth === 'number'
                                    ) {
                                        depth = val.depth;
                                        break;
                                    }
                                }
                            }
                            isIndented = (depth || 0) > 0;
                        }

                        if (!isIndented) {
                            cellData.cell.styles.fontStyle = 'bold';
                            cellData.cell.styles.textColor = rgb;
                        }
                    }
                }
            }
        },
        didDrawCell: (cellData) => {
            const script = complexCellScripts.get(
                `${cellData.section}-${cellData.row.index}-${cellData.column.index}`,
            );
            if (!script) return;

            const { cell } = cellData;
            const padTop = cell.padding('top');
            const padBottom = cell.padding('bottom');
            const padLeft = cell.padding('left');
            const padRight = cell.padding('right');
            const boxX = cell.x + padLeft;
            const boxY = cell.y + padTop;
            const boxW = Math.max(0, cell.width - padLeft - padRight);
            const boxH = Math.max(0, cell.height - padTop - padBottom);

            // Cover the default (unshaped, possibly wrong-order) vector text autoTable
            // already drew for this cell with its own background color before placing
            // the correctly-shaped rasterized image on top.
            const fillRgb = normalizeColor(cell.styles.fillColor, [
                255, 255, 255,
            ]);
            doc.setFillColor(fillRgb[0], fillRgb[1], fillRgb[2]);
            doc.rect(boxX, boxY, boxW, boxH, 'F');

            const textRgb = normalizeColor(cell.styles.textColor, [
                20, 20, 20,
            ]);
            const halign =
                cell.styles.halign === 'right' || cell.styles.halign === 'center'
                    ? cell.styles.halign
                    : 'left';
            const raster = rasterizeLines(cell.text, {
                script,
                fontPx: (cell.styles.fontSize || 8) * (96 / 72),
                bold:
                    cell.styles.fontStyle === 'bold' ||
                    cell.styles.fontStyle === 'bolditalic',
                color: textRgb,
                align: halign,
            });

            let drawX = boxX;
            if (cell.styles.halign === 'right')
                drawX = cell.x + cell.width - padRight - raster.wMm;
            else if (cell.styles.halign === 'center')
                drawX = boxX + (boxW - raster.wMm) / 2;

            let drawY = boxY;
            if (cell.styles.valign === 'bottom')
                drawY = cell.y + cell.height - padBottom - raster.hMm;
            else if (cell.styles.valign === 'middle')
                drawY = boxY + (boxH - raster.hMm) / 2;

            doc.addImage(raster.dataUrl, 'PNG', drawX, drawY, raster.wMm, raster.hMm);
        },
        didDrawPage: (data) => {
            const pageHeight =
                doc.internal.pageSize.height ||
                doc.internal.pageSize.getHeight();
            const pageW =
                doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

            const footerColor: [number, number, number] = [148, 163, 184]; // Slate-400

            // Page X of Y (centered)
            writeText(doc, `Page ${data.pageNumber}`, pageW / 2, pageHeight - 10, {
                fontSize: 8,
                color: footerColor,
                align: 'center',
            });
            // Brand (left)
            writeText(doc, companyName, marginLeft, pageHeight - 10, {
                fontSize: 8,
                color: footerColor,
            });
            // Label (right)
            writeText(
                doc,
                'Confidential / Exported Report',
                pageW - marginRight,
                pageHeight - 10,
                { fontSize: 8, color: footerColor, align: 'right' },
            );

            // Draw accent border or repeat full header on subsequent pages
            if (data.pageNumber > 1) {
                if (exportConfig.repeatHeader === true) {
                    drawPageHeader(doc);
                } else {
                    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
                    doc.rect(0, 0, pageW, 4, 'F');
                }
            }
        },
    });

    return doc;
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) =>
            reject(new Error(`Failed to load image at ${src}`));
        img.src = src;
    });
};

/**
 * Lets the host app say which logo (and company name) its documents carry, without ui-builder importing anything
 * from it. A module's own `exportConfig.logoPath` still wins; with neither, the built-in mark is drawn.
 */
let hostBranding: (() => { logoUrl?: string | null; name?: string | null }) | null = null;
export function setExportBranding(fn: typeof hostBranding) {
    hostBranding = fn;
}

/** Loads the logo and re-draws it as PNG, so a JPEG/WebP/SVG upload goes into the PDF the same way (and keeps its transparency). */
const loadLogo = async (src: string): Promise<HTMLImageElement> => {
    const img = await loadImage(src);
    const w = img.naturalWidth || 256;
    const h = img.naturalHeight || 256;
    const scale = Math.min(1, 512 / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);

    return loadImage(canvas.toDataURL('image/png'));
};

export const handleExportPDF = async (
    data: any[],
    config: ModuleConfig,
    visibleColumns: string[],
    extraMeta?: {
        activeFiltersText?: string;
        userName?: string;
        themeColor?: string;
    },
) => {
    const exportConfig = normalizeExportConfig(config.exportConfig, config.moduleName);
    const logoPath = exportConfig.logoPath || hostBranding?.()?.logoUrl || undefined;

    let logoImage: HTMLImageElement | null = null;
    if (logoPath) {
        try {
            logoImage = await loadLogo(logoPath);
        } catch (e) {
            console.warn(
                'Could not preload custom logo, falling back to 3D logo:',
                e,
            );
        }
    }

    const doc = await generatePDFDocument(
        data,
        config,
        visibleColumns,
        extraMeta,
        logoImage,
    );
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`${config.moduleName.toLowerCase()}_${timestamp}.pdf`);
};

export const handleExportExcel = async (
    data: any[],
    config: ModuleConfig,
    visibleColumns: string[],
    extraMeta?: { activeFiltersText?: string; userName?: string },
) => {
    const { headers, rows } = getExportableData(data, config, visibleColumns);

    const { default: ExcelJS } = await import('exceljs');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true };
    });

    rows.forEach((r) => worksheet.addRow(r));

    // Auto-fit column widths considering headers & values
    const allRows = [headers, ...rows];
    worksheet.columns = headers.map((_, colIndex) => {
        let maxLen = 10;
        for (const row of allRows) {
            const val = row[colIndex];
            if (val) maxLen = Math.max(maxLen, String(val).length);
        }
        return { width: Math.min(Math.max(maxLen + 2, 10), 50) };
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${config.moduleName.toLowerCase()}_${timestamp}.xlsx`);
};

export const handleExportCSV = (
    data: any[],
    config: ModuleConfig,
    visibleColumns: string[],
    extraMeta?: { activeFiltersText?: string; userName?: string },
) => {
    const { headers, rows } = getExportableData(data, config, visibleColumns);

    const csvLines: string[] = [];

    const escapeCSV = (field: any) => {
        return `"${String(field || '').replace(/"/g, '""')}"`;
    };

    csvLines.push(headers.map((h) => escapeCSV(h)).join(','));
    rows.forEach((row) => {
        csvLines.push(row.map((field) => escapeCSV(field)).join(','));
    });

    const blob = new Blob([csvLines.join('\n')], {
        type: 'text/csv;charset=utf-8;',
    });
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(blob, `${config.moduleName.toLowerCase()}_${timestamp}.csv`);
};

/**
 * Machine-readable sibling of the CSV export: same rows, same column selection,
 * same `exportValue`/render extraction — just emitted as objects keyed by column
 * key instead of a positional table. Opt-in per module via `exportConfig.json`.
 */
export const handleExportJSON = (
    data: any[],
    config: ModuleConfig,
    visibleColumns: string[],
    extraMeta?: { activeFiltersText?: string; userName?: string },
) => {
    const { keys, rows } = getExportableData(data, config, visibleColumns);
    const exportConfig = normalizeExportConfig(config.exportConfig, config.moduleName);

    const records = rows.map((row) => {
        const record: Record<string, string> = {};
        keys.forEach((key, index) => {
            // The serial column is an artefact of a printed table — a JSON array is
            // already ordered, so shipping "1", "2", "3" on every record is noise.
            if (key !== SERIAL_KEY) record[key] = row[index];
        });
        return record;
    });

    const payload = {
        module: config.moduleName,
        title: exportConfig.title,
        exported_at: new Date().toISOString(),
        exported_by: extraMeta?.userName || undefined,
        filters: extraMeta?.activeFiltersText || undefined,
        total: records.length,
        data: records,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8;',
    });
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(blob, `${config.moduleName.toLowerCase()}_${timestamp}.json`);
};

export const handlePrint = async (
    data: any[],
    config: ModuleConfig,
    visibleColumns: string[],
    extraMeta?: {
        activeFiltersText?: string;
        userName?: string;
        themeColor?: string;
    },
) => {
    const exportConfig = normalizeExportConfig(config.exportConfig, config.moduleName);
    const logoPath = exportConfig.logoPath || hostBranding?.()?.logoUrl || undefined;

    let logoImage: HTMLImageElement | null = null;
    if (logoPath) {
        try {
            logoImage = await loadLogo(logoPath);
        } catch (e) {
            console.warn(
                'Could not preload custom logo for printing, falling back to 3D logo:',
                e,
            );
        }
    }

    const doc = await generatePDFDocument(
        data,
        config,
        visibleColumns,
        extraMeta,
        logoImage,
    );
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
};
