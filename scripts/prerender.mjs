// Injects the server-rendered pages into their dist HTML files, writes dist/sitemap.xml,
// then removes the temporary SSR build.
// Pages come from src/pages.ts (re-exported by entry-server.tsx). For each page:
// - <title> is replaced with the page title and the <!--seo--> marker with its head tags (headFor)
// - the empty <div id="root"> gets the server render
// - stylesheets under 4 KB are inlined, and the font preloads move behind the stylesheets
// Landing page: hydrated by src/main.tsx. Legal pages and guides: static, CSS only, no JavaScript (src/static/main.ts).
import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ssrDir = path.join(root, 'dist-ssr');

const { render, headFor, titleFor, pages, SITE_URL, missingLegalContact } =
  await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

// Matches <div id="root"></div> and <div id="root" data-page="…"></div>
const rootMarker = /<div id="root"([^>]*)><\/div>/;
const titleMarker = /<title>[^<]*<\/title>/;
const seoMarker = '<!--seo-->';
const moduleScript = /\s*<script type="module" crossorigin src="\/([^"]+)"><\/script>/g;

// The static pages' entry (src/static/main.ts) only imports CSS, but Vite still emits an empty module for it
// (nothing but /* empty css */ comments). Drop the <script> tags that load such a module, so these pages ship no JavaScript.
async function dropEmptyModules(html) {
  let out = html;
  for (const [tag, src] of html.matchAll(moduleScript)) {
    const code = await readFile(path.join(root, 'dist', src), 'utf8');
    if (code.replace(/\/\*[\s\S]*?\*\//g, '').trim() === '') out = out.replace(tag, '');
  }
  return out;
}

// Tiny stylesheets (the @font-face rules, a few hundred bytes each) go inline: one render-blocking request less for
// each. Only when every url() in them is absolute or a data: URI, so the inlined rules still point to the same files.
const stylesheet = /<link rel="stylesheet" crossorigin href="\/([^"]+\.css)">/g;
const INLINE_CSS_MAX = 4096;
async function inlineTinyCss(html) {
  let out = html;
  for (const [tag, href] of html.matchAll(stylesheet)) {
    const css = (await readFile(path.join(root, 'dist', href), 'utf8')).trim();
    if (css.length < INLINE_CSS_MAX && !/url\(\s*(?!["']?(\/|data:))/.test(css)) out = out.replace(tag, `<style>${css}</style>`);
  }
  return out;
}

// The font preloads of the HTML entries end up before the stylesheets and scripts that Vite adds at the end of the
// head. Move them behind those, so the CSS is requested first (over HTTP/1.1 the six connections go in document order).
const fontPreload = /\n\s*<link rel="preload" href="[^"]+\.woff2" as="font"[^>]*>/g;
function fontPreloadsLast(html) {
  const tags = html.match(fontPreload) ?? [];
  return tags.length ? html.replace(fontPreload, '').replace('</head>', `${tags.join('').slice(1)}\n</head>`) : html;
}

for (const page of pages) {
  const file = `${page.path}index.html`;
  const filePath = path.join(root, 'dist', file);
  const html = await readFile(filePath, 'utf8');
  if (!rootMarker.test(html)) throw new Error(`Empty <div id="root"> not found in dist/${file}`);
  if (!titleMarker.test(html)) throw new Error(`<title> not found in dist/${file}`);
  if (!html.includes(seoMarker)) throw new Error(`${seoMarker} marker not found in the <head> of dist/${file}`);
  if (/<meta name="description"|<link rel="canonical"|<meta property="og:|<meta name="twitter:|application\/ld\+json/.test(html)) {
    throw new Error(`dist/${file} has its own description, canonical, Open Graph/Twitter tags or JSON-LD: remove them, they come from headFor() and src/pages.ts`);
  }
  const prerendered = html
    .replace(titleMarker, `<title>${titleFor(page.id)}</title>`)
    .replace(seoMarker, headFor(page.id))
    .replace(rootMarker, (_, attrs) => `<div id="root"${attrs}>${render(page.id)}</div>`);
  const out = fontPreloadsLast(await inlineTinyCss(page.kind === 'home' ? prerendered : await dropEmptyModules(prerendered)));
  await writeFile(filePath, out);
  console.log(`Prerendered dist/${file}`);
}

// Sitemap: every page with index: true, absolute apex URLs with a trailing slash. No lastmod (nobody would keep it accurate).
const urls = pages.filter((page) => page.index).map((page) => `  <url><loc>${SITE_URL}${page.path}</loc></url>`);
await writeFile(
  path.join(root, 'dist', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
);
console.log(`Wrote dist/sitemap.xml (${urls.length} URLs)`);

// The controller's contact data is required by DSG Art. 19 and DSGVO Art. 13 as soon as the pages are public.
const missing = missingLegalContact();
if (missing.length) {
  console.warn(`\nWARNING: ${missing.join(' and ')} still null. Impressum and Datenschutzerklärung show no way to`
    + ' reach the controller. Fill them in src/content.ts before deploying (see AGENTS.md, "Open before launch").\n');
}

await rm(ssrDir, { recursive: true, force: true });
