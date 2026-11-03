// Injects the server-rendered pages into their dist HTML files, then removes the temporary SSR build.
// Landing page: hydrated by src/main.tsx. Legal pages: static, no JavaScript needed (src/legal/main.ts).
import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ssrDir = path.join(root, 'dist-ssr');

const pages = [
  { id: 'home', file: 'index.html' },
  { id: 'impressum', file: 'impressum/index.html' },
  { id: 'datenschutz', file: 'datenschutz/index.html' },
];

const { render, missingLegalContact } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
// Matches <div id="root"></div> and <div id="root" data-page="…"></div>
const marker = /<div id="root"([^>]*)><\/div>/;

for (const page of pages) {
  const file = path.join(root, 'dist', page.file);
  const html = await readFile(file, 'utf8');
  if (!marker.test(html)) throw new Error(`Empty <div id="root"> not found in dist/${page.file}`);
  await writeFile(file, html.replace(marker, (_, attrs) => `<div id="root"${attrs}>${render(page.id)}</div>`));
  console.log(`Prerendered dist/${page.file}`);
}

// The controller's contact data is required by DSG Art. 19 and DSGVO Art. 13 as soon as the pages are public.
const missing = missingLegalContact();
if (missing.length) {
  console.warn(`\nWARNING: ${missing.join(' and ')} still null. Impressum and Datenschutzerklärung show no way to`
    + ' reach the controller. Fill them in src/content.ts before deploying (see AGENTS.md, "Open before launch").\n');
}

await rm(ssrDir, { recursive: true, force: true });
