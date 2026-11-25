// `npm run photos`: writes the AVIF versions of the content photos next to their JPEGs in src/assets/photos/.
// Not part of the build; run it after a photo was replaced and commit the outputs. The JPEGs are the masters here
// (cropped, resized and graded as in DESIGN.md -> Imagery) and stay the fallback inside <picture>; the AVIF files are
// encoded from them, so they keep the crop and the grade. sharp (devDependency) brings its own libvips: no system packages.
// No WebP: measured 2026-11-10 it saved little on the light tiles and was larger than the JPEG on the athlete tile
// (83.6 KB against 82.7 KB), and every browser without AVIF falls back to the JPEG.
import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dir = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'src', 'assets', 'photos');

// Per source JPEG: output widths (px) and AVIF quality (sharp's 1-100 scale; 55 keeps the tiles visually equal to the
// JPEG at display size, the small avatar gets 60 because a face at 52 px shows blocking sooner).
// Audience tiles: 640 x 480 masters; 480w serves 1x screens on the four-column grid (253 px tiles), 640w the rest.
const PHOTOS = {
  'audience-athlete.jpg': { widths: [480, 640], quality: 55 },
  'audience-firma.jpg': { widths: [480, 640], quality: 55 },
  'audience-kulturverein.jpg': { widths: [480, 640], quality: 55 },
  'audience-sportverein.jpg': { widths: [480, 640], quality: 55 },
  // Match card avatar (52 px circle): same size as the JPEG, so one file named like it
  'mtb-athlete-104.jpg': { widths: [104], quality: 60, sameName: true },
};

const jpegs = (await readdir(dir)).filter((f) => f.endsWith('.jpg'));
const unknown = jpegs.filter((f) => !PHOTOS[f]);
if (unknown.length) throw new Error(`No AVIF settings for ${unknown.join(', ')}: add them to PHOTOS in scripts/photos.mjs`);

for (const [file, { widths, quality, sameName }] of Object.entries(PHOTOS)) {
  const src = path.join(dir, file);
  const base = file.replace(/\.jpg$/, '');
  const { width: srcWidth } = await sharp(src).metadata();
  for (const width of widths) {
    if (width > srcWidth) throw new Error(`${file} is ${srcWidth}px wide, cannot make ${width}w`);
    const out = path.join(dir, sameName ? `${base}.avif` : `${base}-${width}w.avif`);
    // effort 9: slowest, smallest (a few seconds for all files). Metadata is dropped; the colours stay sRGB.
    const avif = await sharp(src).resize({ width }).avif({ quality, effort: 9 }).toBuffer();
    await writeFile(out, avif);
    const before = (await stat(src)).size;
    console.log(`${path.basename(out)}: ${avif.length} B (JPEG ${before} B at ${srcWidth}w)`);
  }
}
