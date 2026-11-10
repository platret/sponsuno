// Which characters the self-hosted fonts cover (AGENTS.md -> Performance budget, "Fonts"). Plain Node, no dependencies:
// read by scripts/subset-fonts.mjs (writes the font files) and scripts/check-dist.mjs (checks the built pages).
//
// Every face comes in two files with disjoint unicode-ranges (src/styles/fonts.css):
// - core: what the site's text uses, plus a small margin (all of Basic Latin, German, the French accents of Swiss
//   names, Swiss typographic punctuation). Preloaded; the only file a page downloads.
// - extra: the rest of fontsource's "latin" subset, which the site shipped before (all of Latin-1, General
//   Punctuation, € ™ − …). Loaded by the browser only when a character from it appears, e.g. typed into a demo form.
// New text with a character outside CORE fails `npm run check:dist`: add it here, then run `npm run fonts`.
// Known cost of the split: no kerning between a core and an extra glyph (they come from different files), so a name
// typed into the demo such as "Ángel" or "Muñoz" can sit up to about 1 px off. Shipped text is never affected. Moving
// the other French, Italian, Spanish and Portuguese accents (ÁÂÊËÍÎÏÑÒÓÔÙÚÛáãìíñòóõúœ) into CORE would cost 2.6 KB
// on every page (Cormorant 600 +1.0 KB, Manrope 400 +0.8 KB, Manrope 600 +0.7 KB; all Latin-1 letters +5.6 KB),
// measured 2026-11-10, so they stay in extra.

/** fontsource's "latin" unicode-range (unicode.json in the @fontsource packages, v5): the union of core and extra. */
export const LATIN_RANGE =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

const span = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join('');

/** The core subset, as characters. */
export const CORE = [
  span(0x20, 0x7e), // Basic Latin
  '\u00A0\u00AD', // no-break space, soft hyphen
  '§©«°·»×', // Latin-1 symbols in the text (« » quotes, · separators, © footer, × close buttons)
  'ÄÖÜäöüß', // German
  'àâçèéêëîïôùûÀÇÈÉ', // French accents of Swiss names and places
  '–—‘’‚“”„…•‹›€', // dashes, quotes (’ is also the de-CH thousands separator of Intl.NumberFormat), ellipsis, bullet
].join('');

/** Characters the text may use although no subset has them: they render in a system font, as before. */
export const FALLBACK_OK = '⌘';

/** Parses a CSS unicode-range ("U+0000-00FF,U+0131") into a Set of code points. */
export function parseRange(range) {
  const points = new Set();
  for (const part of range.split(',')) {
    const [from, to = from] = part.trim().replace(/^U\+/i, '').split('-').map((hex) => parseInt(hex, 16));
    for (let cp = from; cp <= to; cp++) points.add(cp);
  }
  return points;
}

/** Writes a Set of code points as a compact CSS unicode-range. */
export function toRange(points) {
  const sorted = [...points].sort((a, b) => a - b);
  const parts = [];
  const hex = (cp) => cp.toString(16).toUpperCase().padStart(4, '0');
  for (let i = 0; i < sorted.length; i++) {
    const from = sorted[i];
    while (sorted[i + 1] === sorted[i] + 1) i++;
    parts.push(from === sorted[i] ? `U+${hex(from)}` : `U+${hex(from)}-${hex(sorted[i])}`);
  }
  return parts.join(',');
}

export const CORE_POINTS = new Set([...CORE].map((ch) => ch.codePointAt(0)));
const isControl = (cp) => cp < 0x20 || (cp >= 0x7f && cp <= 0x9f);
/** The extra subset: the rest of LATIN_RANGE (without control characters, which have no glyphs). */
export const EXTRA_POINTS = new Set([...parseRange(LATIN_RANGE)].filter((cp) => !CORE_POINTS.has(cp) && !isControl(cp)));
