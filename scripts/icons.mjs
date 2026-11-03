// Regenerates the PNG/ICO icons in public/ from src/assets/Sponsuno_Icon.svg. Not part of the build;
// run it by hand after the icon changes and commit the outputs (macOS: needs Google Chrome and sips).
//   node scripts/icons.mjs
// Outputs: icon-512.png and icon-192.png (rounded square, transparent corners; icon-512 is also the
// Organization logo in the JSON-LD), apple-touch-icon.png (180, full navy square: iOS rounds the corners
// itself) and favicon.ico (16, 32 and 48 px PNGs). public/favicon.svg stays as it is.
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (name) => path.join(root, 'public', name);
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const svg = pathToFileURL(path.join(root, 'src/assets/Sponsuno_Icon.svg')).href;
const tmp = await mkdtemp(path.join(tmpdir(), 'sponsuno-icons-'));

// Renders the icon at 512 px. full = navy gradient behind it, so the rounded corners disappear.
async function render(out, full) {
  const bg = full ? 'linear-gradient(135deg, #0B1830, #1D2F52)' : 'transparent';
  const html = path.join(tmp, `${full ? 'full' : 'round'}.html`);
  await writeFile(html, `<body style="margin:0;background:${bg}"><img src="${svg}" width="512" height="512" style="display:block">`);
  execFileSync(chrome, ['--headless', '--hide-scrollbars', '--default-background-color=00000000',
    '--window-size=512,512', `--screenshot=${out}`, pathToFileURL(html).href], { stdio: 'ignore' });
}
const resize = (src, size, out) => execFileSync('sips', ['-z', String(size), String(size), src, '--out', out], { stdio: 'ignore' });

const round = path.join(tmp, 'round-512.png');
const full = path.join(tmp, 'full-512.png');
await render(round, false);
await render(full, true);
await writeFile(pub('icon-512.png'), await readFile(round));
resize(round, 192, pub('icon-192.png'));
resize(full, 180, pub('apple-touch-icon.png'));

// favicon.ico: an ICONDIR header plus one directory entry per size, each pointing at an embedded PNG.
const sizes = [16, 32, 48];
const images = [];
for (const size of sizes) {
  const out = path.join(tmp, `ico-${size}.png`);
  resize(round, size, out);
  images.push(await readFile(out));
}
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(size, entry); // width
  header.writeUInt8(size, entry + 1); // height
  header.writeUInt16LE(1, entry + 4); // colour planes
  header.writeUInt16LE(32, entry + 6); // bits per pixel
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
await writeFile(pub('favicon.ico'), Buffer.concat([header, ...images]));
await rm(tmp, { recursive: true, force: true });
console.log('Wrote public/icon-512.png, icon-192.png, apple-touch-icon.png, favicon.ico');
