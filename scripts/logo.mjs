// Draws the Sponsuno wordmark and symbol (Markenhandbuch, Entwurf D1, November 2026) from the glyph outlines of
// Unbounded Bold, so the logo files never depend on a font being installed. Not part of the build; run it by hand
// after a logo change and commit the outputs:
//   node scripts/logo.mjs
// Construction (handbook page 02): the wordmark is "sponsuno" set in Unbounded Bold. The "u" is the "n" of the font
// turned 180 degrees; "u" and the following "n" share the middle stem, so the pair forms one point-symmetric loop
// (die Schlaufe). Baseline and x-height are those of the font.
// Outputs (colours from tokens.css):
//   src/assets/wordmark-light.svg  Hafer letters, Bernstein loop (on Tintenblau: header, footer)
//   src/assets/wordmark-dark.svg   Tintenblau letters and loop (on Hafer, small sizes: one colour, handbook page 03)
//   src/assets/Sponsuno_Icon.svg   the symbol: Bernstein loop on a Tintenblau square (app icon)
//   public/favicon.svg             same symbol
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';
import * as hb from 'harfbuzzjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TINTE = '#1A2B40';
const HAFER = '#ECE6DA';
const BERNSTEIN = '#F2873A';

const woff2 = await readFile(path.join(root, 'node_modules/@fontsource/unbounded/files/unbounded-latin-700-normal.woff2'));
const sfnt = await subsetFont(woff2, 'sponlu', { targetFormat: 'sfnt' });
const font = new hb.Font(new hb.Face(new hb.Blob(sfnt)));
const gid = (ch) => font.glyph(ch.codePointAt(0));

/** Applies (x, y) => [x', y'] to every point of an absolute SVG path (M L Q C Z, as harfbuzz writes it). */
function mapPath(d, fn) {
  return d.replace(/([MLQCZ])([^MLQCZ]*)/g, (_, cmd, args) => {
    const n = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    const out = [];
    for (let i = 0; i < n.length; i += 2) out.push(...fn(n[i], n[i + 1]).map((v) => +v.toFixed(2)));
    return cmd + out.join(' ');
  });
}

const ext = (ch) => font.glyphExtents(gid(ch));
const pts = (contour) => contour.replace(/[MLQCZ]/g, ' ').trim().split(/[\s,]+/).map(Number)
  .reduce((acc, v, i, all) => (i % 2 ? acc : [...acc, [v, all[i + 1]]]), []);
// Unbounded's n has a slanted spur on its left stem; the handbook loop has plain vertical stems. So the loop is built
// from a clean left stem (the foot of the font's left stem, carried straight up to the x-height) plus the font's own
// arch and right stem (the other contour of the n).
const n = ext('n');
const xh = n.yBearing; // x-height = top of the n arch (no overshoot in Unbounded)
const nRight = n.xBearing + n.width;
const contours = font.glyphToPath(gid('n')).split('Z').filter(Boolean).map((c) => `${c}Z`);
const spur = contours.find((c) => Math.min(...pts(c).map(([x]) => x)) === n.xBearing);
const arch = contours.find((c) => c !== spur);
const foot = pts(spur).filter(([, y]) => y === 0).map(([x]) => x);
const L = Math.min(...foot);
const stem = Math.max(...foot) - L;
const clean = `M${L},${xh}L${L + stem},${xh}L${L + stem},0L${L},0Z${arch}`;
const nLeft = L;
const cx = (L + nRight) / 2;
const cy = xh / 2;

// Pen positions: letters in font units, y up. The loop takes the place of "un".
const parts = [];
let pen = 0;
for (const ch of 'spons') {
  parts.push({ d: font.glyphToPath(gid(ch)), x: pen, role: 'letter' });
  pen += font.glyphHAdvance(gid(ch));
}
const nPath = clean;
const uPath = mapPath(nPath, (x, y) => [2 * cx - x, 2 * cy - y]); // n turned 180° about its own centre
const shift = nRight - stem - nLeft; // puts the n's left stem on the u's right stem
parts.push({ d: uPath, x: pen, role: 'loop' });
parts.push({ d: nPath, x: pen + shift, role: 'loop' });
pen += shift + font.glyphHAdvance(gid('n'));
parts.push({ d: font.glyphToPath(gid('o')), x: pen, role: 'letter' });

// Flip to SVG coordinates and find the ink box
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
const placed = parts.map((p) => ({
  role: p.role,
  d: mapPath(p.d, (x, y) => {
    const X = x + p.x, Y = -y;
    minX = Math.min(minX, X); maxX = Math.max(maxX, X); minY = Math.min(minY, Y); maxY = Math.max(maxY, Y);
    return [X, Y];
  }),
}));
const w = +(maxX - minX).toFixed(2), h = +(maxY - minY).toFixed(2);
const box = `${minX.toFixed(2)} ${minY.toFixed(2)} ${w} ${h}`;
const join = (role) => placed.filter((p) => p.role === role).map((p) => p.d).join('');

const wordmark = (letters, loop) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" role="img" aria-label="Sponsuno">`
  + `<path fill="${letters}" d="${join('letter')}"/><path fill="${loop}" d="${join('loop')}"/></svg>\n`;

await writeFile(path.join(root, 'src/assets/wordmark-light.svg'), wordmark(HAFER, BERNSTEIN));
await writeFile(path.join(root, 'src/assets/wordmark-dark.svg'), wordmark(TINTE, TINTE));

// Symbol: the loop alone, centred on a square (60 % of the width), square corners (Kanten statt Rundungen)
const loopD = mapPath(uPath, (x, y) => [x, -y]) + mapPath(nPath, (x, y) => [x + shift, -y]);
const lw = nRight + shift - nLeft, lh = xh;
const size = 512, scale = (size * 0.6) / lw;
const tx = (size - lw * scale) / 2 - nLeft * scale, ty = (size - lh * scale) / 2 + xh * scale;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Sponsuno">`
  + `<rect width="${size}" height="${size}" fill="${TINTE}"/>`
  + `<path fill="${BERNSTEIN}" transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(5)})" d="${loopD}"/></svg>\n`;
await writeFile(path.join(root, 'src/assets/Sponsuno_Icon.svg'), icon);
await writeFile(path.join(root, 'public/favicon.svg'), icon);

console.log(`wordmark ${w} × ${h} (ratio ${(w / h).toFixed(3)}), stem ${stem}, x-height ${xh}`);
