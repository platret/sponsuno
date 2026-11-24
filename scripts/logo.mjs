// Draws the Sponsuno wordmark and symbol (Markenhandbuch, Entwurf D1, November 2026), so the logo files never depend
// on a font being installed. Not part of the build; run it by hand after a logo change and commit the outputs:
//   node scripts/logo.mjs
// Construction (handbook page 02): the wordmark is "sponsuno" set in Unbounded Bold; "spons" and "o" are the font's
// own outlines (harfbuzzjs). The loop (die Schlaufe) takes the place of "un" and is drawn geometrically here, not
// taken from the font: a U bowl and an n arch, the n being the U turned 180 degrees, sharing the middle stem, so the
// loop is point-symmetric. Its centreline is two half superellipses (exponent P) joined by straight stems; the outline
// is what an upright elliptical pen (STEM wide, BOWL tall) leaves along that centreline, so the stroke stays even all
// the way round (stems as heavy as the font's, bowls a little lighter, as round strokes are in the font). Flat cuts
// at the font's flat x-height (top of the left stem) and the baseline (foot of the right stem); the round bowls
// overshoot both by the font's overshoot. Counters as wide as the n's. Spacing: the u's left and the n's right
// sidebearing. The outline is fitted with cubic Béziers (under 0.25 units from the exact curve) and written as a
// filled path.
// Outputs (colours from tokens.css):
//   src/assets/wordmark-light.svg  Hafer letters, Bernstein loop (on Tintenblau: header, footer)
//   src/assets/wordmark-dark.svg   Tintenblau letters and loop (on Hafer, small sizes: one colour, handbook page 03)
//   src/assets/Sponsuno_Icon.svg   the symbol: Bernstein loop on a Tintenblau square (app icon)
//   public/favicon.svg             same symbol
//   src/assets/loop.svg            the loop alone, currentColor (watermark of the static pages' head band)
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
const sfnt = await subsetFont(woff2, 'sponu', { targetFormat: 'sfnt' });
const font = new hb.Font(new hb.Face(new hb.Blob(sfnt)));
const gid = (ch) => font.glyph(ch.codePointAt(0));
const ext = (ch) => font.glyphExtents(gid(ch));
const adv = (ch) => font.glyphHAdvance(gid(ch));

/** Applies (x, y) => [x', y'] to every point of an absolute SVG path (M L Q C Z). */
function mapPath(d, fn) {
  return d.replace(/([MLQCZ])([^MLQCZ]*)/g, (_, cmd, args) => {
    const n = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    const out = [];
    for (let i = 0; i < n.length; i += 2) out.push(...fn(n[i], n[i + 1]).map((v) => +v.toFixed(2)));
    return cmd + out.join(' ');
  });
}

// Loop measures in font units (1000 upm), taken from Unbounded Bold's n and u.
const n = ext('n');
const STEM = 204;        // stem width of n and u
const BOWL = 172;        // vertical weight of the bowls (the font's u and n arches: 166)
const COUNTER = 265;     // counter width of the n (271 to 536)
const FLAT = 571;        // flat x-height: top of the u's stems
const OVER = 16.5;       // overshoot of round shapes (o, u: -16; n, o: 588)
const DEPTH = 200;       // vertical semi-axis of the bowl centreline (leaves a short straight in the middle stem)
const P = 2.4;           // superellipse exponent of the centreline (2 = ellipse; the o is about 2.2 outside)

/**
 * Fits one cubic Bézier with fixed end tangents to the curve f(u), u0..u1 (least squares with Newton
 * reparameterisation); splits in two while the deviation exceeds tol.
 */
function fitCubic(f, u0, u1, T0, T3, tol = 0.25, depth = 0) {
  const N = 64;
  const S = Array.from({ length: N + 1 }, (_, i) => f(u0 + ((u1 - u0) * i) / N));
  const P0 = S[0], P3 = S[N];
  let t = [0];
  for (let i = 1; i <= N; i++) t.push(t[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
  t = t.map((v) => v / t[N]);
  const at = (al, be, s) => {
    const m = 1 - s, P1 = [P0[0] + al * T0[0], P0[1] + al * T0[1]], P2 = [P3[0] - be * T3[0], P3[1] - be * T3[1]];
    return [0, 1].map((k) => m * m * m * P0[k] + 3 * m * m * s * P1[k] + 3 * m * s * s * P2[k] + s * s * s * P3[k]);
  };
  let al = 0, be = 0;
  for (let it = 0; it < 30; it++) {
    let c11 = 0, c12 = 0, c22 = 0, x1 = 0, x2 = 0;
    for (let i = 0; i <= N; i++) {
      const s = t[i], m = 1 - s;
      const b0 = m * m * m, b1 = 3 * m * m * s, b2 = 3 * m * s * s, b3 = s * s * s;
      const A1 = [T0[0] * b1, T0[1] * b1], A2 = [-T3[0] * b2, -T3[1] * b2];
      const r = [0, 1].map((k) => S[i][k] - (b0 + b1) * P0[k] - (b2 + b3) * P3[k]);
      c11 += A1[0] ** 2 + A1[1] ** 2; c12 += A1[0] * A2[0] + A1[1] * A2[1]; c22 += A2[0] ** 2 + A2[1] ** 2;
      x1 += A1[0] * r[0] + A1[1] * r[1]; x2 += A2[0] * r[0] + A2[1] * r[1];
    }
    const det = c11 * c22 - c12 * c12;
    al = (x1 * c22 - x2 * c12) / det; be = (c11 * x2 - c12 * x1) / det;
    t = t.map((s, i) => {
      const h = 1e-4, q = at(al, be, s), qp = at(al, be, s + h), qm = at(al, be, s - h);
      const d1 = [(qp[0] - qm[0]) / (2 * h), (qp[1] - qm[1]) / (2 * h)];
      const d2 = [(qp[0] - 2 * q[0] + qm[0]) / (h * h), (qp[1] - 2 * q[1] + qm[1]) / (h * h)];
      const e = [q[0] - S[i][0], q[1] - S[i][1]];
      const step = (e[0] * d1[0] + e[1] * d1[1]) / (d1[0] ** 2 + d1[1] ** 2 + e[0] * d2[0] + e[1] * d2[1]);
      return Math.min(1, Math.max(0, s - step));
    });
  }
  const err = Math.max(...S.map((p, i) => { const q = at(al, be, t[i]); return Math.hypot(q[0] - p[0], q[1] - p[1]); }));
  if (err > tol && depth < 4) {
    const um = (u0 + u1) / 2, a = f(um - 1e-5), b = f(um + 1e-5), l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const Tm = [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    return [...fitCubic(f, u0, um, T0, Tm, tol, depth + 1), ...fitCubic(f, um, u1, Tm, T3, tol, depth + 1)];
  }
  return [[P0, [P0[0] + al * T0[0], P0[1] + al * T0[1]], [P3[0] - be * T3[0], P3[1] - be * T3[1]], P3]];
}

// The loop, y up, ink from x = 0 to W. U bowl centreline: from the left stem's centre to the middle stem's centre.
const W = 3 * STEM + 2 * COUNTER;
const A = (STEM + COUNTER) / 2;                    // horizontal semi-axis of the centreline
const cxU = STEM / 2 + A, cyU = -OVER + BOWL / 2 + DEPTH;
if (cyU > FLAT / 2) throw new Error('DEPTH too large: the bowls would overlap in the middle stem');
const se = (v) => Math.sign(v) * Math.abs(v) ** (2 / P);
/** Point on the U outline at angle th (pi..2pi, lower half): side +1 outside, -1 inside. */
function bowl(th, side) {
  const x = A * se(Math.cos(th)), y = DEPTH * se(Math.sin(th));
  let nx = (Math.sign(x) * Math.abs(x / A) ** (P - 1)) / A, ny = (Math.sign(y) * Math.abs(y / DEPTH) ** (P - 1)) / DEPTH;
  const l = Math.hypot(nx, ny); nx /= l; ny /= l;
  const a = STEM / 2, b = BOWL / 2, h = Math.hypot(a * nx, b * ny); // support point of the elliptical pen
  return [cxU + x + (side * a * a * nx) / h, cyU + y + (side * b * b * ny) / h];
}
const pi = Math.PI, down = [0, -1], up = [0, 1], right = [1, 0], left = [-1, 0];
const innerU = [...fitCubic((u) => bowl(u, -1), pi, 1.5 * pi, down, right), ...fitCubic((u) => bowl(u, -1), 1.5 * pi, 2 * pi, right, up)];
const outerU = [...fitCubic((u) => bowl(u, 1), 2 * pi, 1.5 * pi, down, left), ...fitCubic((u) => bowl(u, 1), 1.5 * pi, pi, left, up)];
const turn = (seg) => seg.map(([x, y]) => [W - x, FLAT - y]); // 180 degrees about the loop's centre
const innerN = innerU.map(turn), outerN = outerU.map(turn);
const pt = ([x, y]) => `${+x.toFixed(2)} ${+y.toFixed(2)}`;
const curves = (segs) => `L${pt(segs[0][0])}` + segs.map((s) => `C${pt(s[1])} ${pt(s[2])} ${pt(s[3])}`).join('');
// One contour: left stem top, inner U, middle stem (left face), outer n, right stem foot, inner n, middle stem
// (right face), outer U, back up the left stem.
const loopPath = `M0 ${FLAT}L${STEM} ${FLAT}${curves(innerU)}${curves(outerN)}L${W} 0L${W - STEM} 0`
  + `${curves(innerN)}${curves(outerU)}Z`;
const loopTop = FLAT + OVER, loopBottom = -OVER;

// Pen positions: letters in font units, y up. The loop takes the place of "un".
const parts = [];
let pen = 0;
for (const ch of 'spons') {
  parts.push({ d: font.glyphToPath(gid(ch)), x: pen, role: 'letter' });
  pen += adv(ch);
}
const lsb = ext('u').xBearing, rsb = adv('n') - n.xBearing - n.width;
parts.push({ d: loopPath, x: pen + lsb, role: 'loop' });
pen += lsb + W + rsb;
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
const loopD = mapPath(loopPath, (x, y) => [x, -y]);
const size = 512, scale = (size * 0.6) / W;
const tx = (size - W * scale) / 2, ty = (size - (loopTop - loopBottom) * scale) / 2 + loopTop * scale;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Sponsuno">`
  + `<rect width="${size}" height="${size}" fill="${TINTE}"/>`
  + `<path fill="${BERNSTEIN}" transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(5)})" d="${loopD}"/></svg>\n`;
await writeFile(path.join(root, 'src/assets/Sponsuno_Icon.svg'), icon);
await writeFile(path.join(root, 'public/favicon.svg'), icon);

// The loop alone in currentColor: the faint watermark of the static pages' head band (legal.css, as a CSS mask)
const loopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${(-loopTop).toFixed(2)} ${W} ${(loopTop - loopBottom).toFixed(2)}" aria-hidden="true">`
  + `<path fill="currentColor" d="${loopD}"/></svg>\n`;
await writeFile(path.join(root, 'src/assets/loop.svg'), loopSvg);

console.log(`wordmark ${w} × ${h} (ratio ${(w / h).toFixed(3)}), loop ${W} × ${loopTop - loopBottom}, stem ${STEM}`);
