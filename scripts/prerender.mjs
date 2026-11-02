// Injects the server-rendered app into dist/index.html, then removes the temporary SSR build.
import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ssrDir = path.join(root, 'dist-ssr');
const indexPath = path.join(root, 'dist', 'index.html');

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
const html = await readFile(indexPath, 'utf8');
const marker = '<div id="root"></div>';
if (!html.includes(marker)) throw new Error(`${marker} not found in dist/index.html`);

await writeFile(indexPath, html.replace(marker, `<div id="root">${render()}</div>`));
await rm(ssrDir, { recursive: true, force: true });
console.log('Prerendered dist/index.html');
