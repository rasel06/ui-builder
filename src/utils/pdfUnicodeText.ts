/**
 * jsPDF's built-in fonts (helvetica/times/courier) only cover WinAnsi/Latin-1, so Bengali
 * and Arabic text silently fails to render in PDF exports/prints. jsPDF also does no
 * OpenType shaping (no GSUB/GPOS), so even an embedded Bengali/Arabic TTF would draw
 * disconnected, unreordered glyphs (wrong for both scripts, and backwards for Arabic).
 *
 * Fix: rasterize non-Latin text on an offscreen <canvas> using the browser's own text
 * shaping engine (which already handles Bengali conjuncts/reordering and Arabic joining +
 * bidi correctly - it's the same engine that renders these scripts correctly everywhere
 * else in this app), then place the result as a PNG image in the PDF instead of vector
 * text. The actual TTFs are still embedded into each jsPDF document too, but only so
 * jsPDF's own width/line-wrap math (autoTable column sizing, splitTextToSize) uses real
 * glyph metrics instead of helvetica's - the vector glyphs they'd draw are never shown,
 * always covered by the rasterized image.
 */

export type ScriptKind = 'latin' | 'bengali' | 'arabic';
type NonLatinScript = Exclude<ScriptKind, 'latin'>;

interface ScriptFontConfig {
    /** Distinctive family name for the canvas @font-face - avoids colliding with a
     *  same-named font that might already be installed on the machine, with different
     *  metrics/glyph coverage. */
    canvasFamily: string;
    regularUrl: string;
    boldUrl: string;
    /** Family name registered into the jsPDF document via addFont(). */
    pdfFontName: string;
}

// The fonts ship with ui-builder (bundled by the host's build as hashed assets, fetched only when a PDF
// actually contains Bengali or Arabic text), so the host needs nothing in its public folder.
const SCRIPT_FONTS: Record<NonLatinScript, ScriptFontConfig> = {
    bengali: {
        canvasFamily: 'Noto Sans Bengali POS Export',
        regularUrl: new URL('../assets/fonts/NotoSansBengali-Regular.ttf', import.meta.url).href,
        boldUrl: new URL('../assets/fonts/NotoSansBengali-Bold.ttf', import.meta.url).href,
        pdfFontName: 'NotoSansBengali',
    },
    arabic: {
        canvasFamily: 'Noto Sans Arabic POS Export',
        regularUrl: new URL('../assets/fonts/NotoSansArabic-Regular.ttf', import.meta.url).href,
        boldUrl: new URL('../assets/fonts/NotoSansArabic-Bold.ttf', import.meta.url).href,
        pdfFontName: 'NotoSansArabic',
    },
};

/** Lets a host point a script at fonts of its own (e.g. a different typeface for its documents). */
export function setScriptFontUrls(script: NonLatinScript, urls: { regularUrl: string; boldUrl: string }): void {
    SCRIPT_FONTS[script] = { ...SCRIPT_FONTS[script], ...urls };
}

const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const BENGALI_RE = /[ঀ-৿]/;

export function detectScript(text: string | null | undefined): ScriptKind {
    if (!text) return 'latin';
    if (ARABIC_RE.test(text)) return 'arabic';
    if (BENGALI_RE.test(text)) return 'bengali';
    return 'latin';
}

export function hasComplexScript(text: string | null | undefined): boolean {
    return detectScript(text) !== 'latin';
}

/** Scans a batch of strings and returns the set of non-Latin scripts actually present,
 *  so the caller only loads/embeds fonts for scripts that are actually used. */
export function collectScripts(
    strings: Array<string | null | undefined>,
): Set<NonLatinScript> {
    const found = new Set<NonLatinScript>();
    for (const s of strings) {
        const script = detectScript(s);
        if (script !== 'latin') found.add(script);
    }
    return found;
}

const canvasFontCache = new Map<NonLatinScript, Promise<void>>();

/** Loads the webfonts needed for canvas rasterization (idempotent/cached - a repeat
 *  export in the same session doesn't refetch). Must be awaited before rasterizeLines(). */
export function ensureCanvasFontsLoaded(
    scripts: Iterable<NonLatinScript>,
): Promise<void[]> {
    const loads: Promise<void>[] = [];
    for (const script of scripts) {
        let existing = canvasFontCache.get(script);
        if (!existing) {
            const cfg = SCRIPT_FONTS[script];
            existing = Promise.all([
                new FontFace(cfg.canvasFamily, `url(${cfg.regularUrl})`, {
                    weight: '400',
                }).load(),
                new FontFace(cfg.canvasFamily, `url(${cfg.boldUrl})`, {
                    weight: '700',
                }).load(),
            ]).then(([regular, bold]) => {
                document.fonts.add(regular);
                document.fonts.add(bold);
            });
            canvasFontCache.set(script, existing);
        }
        loads.push(existing);
    }
    return Promise.all(loads);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

const base64Cache = new Map<string, Promise<string>>();

function fetchBase64(url: string): Promise<string> {
    let cached = base64Cache.get(url);
    if (!cached) {
        cached = fetch(url)
            .then((r) => r.arrayBuffer())
            .then(arrayBufferToBase64);
        base64Cache.set(url, cached);
    }
    return cached;
}

/** Embeds the real TTFs into this specific jsPDF document (fonts are per-instance, not
 *  global, so this must run once per `new jsPDF()`), purely so jsPDF's own width/wrap
 *  math (autoTable column sizing, splitTextToSize) has real glyph metrics to work with.
 *  Returns the registered jsPDF font family name per script, for use as `styles.font`. */
export async function registerPdfFonts(
    doc: { addFileToVFS: (name: string, data: string) => void; addFont: (name: string, family: string, style: string) => void },
    scripts: Iterable<NonLatinScript>,
): Promise<Partial<Record<ScriptKind, string>>> {
    const result: Partial<Record<ScriptKind, string>> = {};
    for (const script of scripts) {
        const cfg = SCRIPT_FONTS[script];
        const [regularB64, boldB64] = await Promise.all([
            fetchBase64(cfg.regularUrl),
            fetchBase64(cfg.boldUrl),
        ]);
        const regularFile = `${cfg.pdfFontName}-Regular.ttf`;
        const boldFile = `${cfg.pdfFontName}-Bold.ttf`;
        doc.addFileToVFS(regularFile, regularB64);
        doc.addFont(regularFile, cfg.pdfFontName, 'normal');
        doc.addFileToVFS(boldFile, boldB64);
        doc.addFont(boldFile, cfg.pdfFontName, 'bold');
        result[script] = cfg.pdfFontName;
    }
    return result;
}

export interface RasterResult {
    dataUrl: string;
    wMm: number;
    hMm: number;
    /** Distance in mm from the image's top edge to the first line's text baseline -
     *  lets a caller that knows a target baseline y (jsPDF's doc.text() convention)
     *  place this image at `y - firstLineAscentMm` instead of guessing an offset. */
    firstLineAscentMm: number;
}

const MM_PER_PX = 25.4 / 96;
/** Oversample the canvas so the embedded PNG stays crisp at print resolution. */
const OVERSAMPLE = 3;
/** Cushion (in CSS px) added around the measured ink bounds. `textBaseline: 'top'`
 *  relies on the font's nominal ascent metric, which for Noto's complex-script fonts
 *  doesn't always cover every conjunct/matra combination's actual ink - tall Bengali
 *  stacks in particular can render slightly above it and get clipped by the canvas
 *  edge. Measuring actualBoundingBox* (real rendered ink, not nominal font metrics)
 *  and adding this margin on top makes clipping a non-issue regardless of font quirks. */
const INK_MARGIN_PX = 3;

/** Renders one or more lines of non-Latin text to a PNG via canvas (correct shaping/
 *  bidi courtesy of the browser's own text engine) and returns it sized in mm, ready
 *  for jsPDF's addImage(). `fontPx` is a CSS px size (pt * 96/72). Sizes the canvas
 *  from each line's *actual measured ink bounds* rather than nominal font metrics, so
 *  tall marks/conjuncts that exceed the font's declared ascent never get clipped. */
export function rasterizeLines(
    lines: string[],
    opts: {
        script: NonLatinScript;
        fontPx: number;
        bold?: boolean;
        color: [number, number, number];
        align?: 'left' | 'center' | 'right';
    },
): RasterResult {
    const cfg = SCRIPT_FONTS[opts.script];
    const cleanLines = lines.length ? lines : [''];
    const fontSpec = `${opts.bold ? '700' : '400'} ${opts.fontPx}px "${cfg.canvasFamily}"`;
    const direction: CanvasDirection = opts.script === 'arabic' ? 'rtl' : 'ltr';
    const fallbackAscent = opts.fontPx * 0.8;
    const fallbackDescent = opts.fontPx * 0.25;

    const probe = document.createElement('canvas').getContext('2d')!;
    probe.font = fontSpec;
    probe.direction = direction;
    probe.textAlign = 'left';
    probe.textBaseline = 'alphabetic';

    const lineMetrics = cleanLines.map((line) => {
        const m = probe.measureText(line || ' ');
        const ascent =
            m.actualBoundingBoxAscent > 0 ? m.actualBoundingBoxAscent : fallbackAscent;
        const descent =
            m.actualBoundingBoxDescent > 0
                ? m.actualBoundingBoxDescent
                : fallbackDescent;
        const left = Math.max(0, m.actualBoundingBoxLeft || 0);
        const right = Math.max(m.actualBoundingBoxRight || 0, m.width);
        return { ascent, descent, left, right, advance: m.width };
    });

    const lineGapPx = opts.fontPx * 0.2;
    const maxLeftOverhang = Math.max(0, ...lineMetrics.map((m) => m.left));
    const contentWidthPx = Math.max(1, ...lineMetrics.map((m) => m.right));
    const widthPx = Math.ceil(maxLeftOverhang + contentWidthPx + INK_MARGIN_PX * 2);
    const contentHeightPx =
        lineMetrics.reduce((sum, m) => sum + m.ascent + m.descent, 0) +
        lineGapPx * (cleanLines.length - 1);
    const heightPx = Math.ceil(contentHeightPx + INK_MARGIN_PX * 2);

    const canvas = document.createElement('canvas');
    canvas.width = widthPx * OVERSAMPLE;
    canvas.height = heightPx * OVERSAMPLE;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(OVERSAMPLE, OVERSAMPLE);
    ctx.font = fontSpec;
    ctx.direction = direction;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = `rgb(${opts.color[0]}, ${opts.color[1]}, ${opts.color[2]})`;

    const align = opts.align || 'left';
    let firstLineAscentPx = lineMetrics[0].ascent;
    let cursorY = INK_MARGIN_PX;
    cleanLines.forEach((line, i) => {
        const m = lineMetrics[i];
        cursorY += m.ascent;
        if (i === 0) firstLineAscentPx = cursorY;
        const inkWidth = Math.max(m.right, m.advance);
        let x = maxLeftOverhang + INK_MARGIN_PX;
        if (align === 'center')
            x = maxLeftOverhang + INK_MARGIN_PX + (contentWidthPx - inkWidth) / 2;
        else if (align === 'right')
            x = maxLeftOverhang + INK_MARGIN_PX + (contentWidthPx - inkWidth);
        ctx.fillText(line, x, cursorY);
        cursorY += m.descent + lineGapPx;
    });

    return {
        dataUrl: canvas.toDataURL('image/png'),
        wMm: widthPx * MM_PER_PX,
        hMm: heightPx * MM_PER_PX,
        firstLineAscentMm: firstLineAscentPx * MM_PER_PX,
    };
}
