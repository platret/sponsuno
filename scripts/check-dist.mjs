// Checks the built site in dist/ (run after `npm run build`): `npm run check:dist`. Plain Node, no dependencies.
// Fails with a list of problems when
// - an indexable page lacks exactly one <h1>, a <title>, a meta description or a canonical matching its path on
//   https://sponsuno.ch/ (404.html, the client-only demo and the waitlist confirmation are exempt), or carries noindex
// - one of those noindex pages lacks <meta name="robots" content="noindex">, or is missing
// - a URL in dist/sitemap.xml has no page in dist/ or is a noindex page, or an indexable page is missing from the sitemap
// - an internal href/src (links, assets, srcset, og:image) does not resolve to a file in dist/, or an #anchor does
//   not exist in the target page (pages rendered only in the browser, like the demo's hash routes, are skipped)
// - a JSON-LD block is not valid JSON
// - a page other than the landing page and the demo loads a script file (the static pages ship no JavaScript by
//   design: scripts/prerender.mjs drops their empty module; inline scripts in the head are fine)
// - 404.html, which is served under any URL, uses a relative URL
import { readdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE_URL = 'https://sponsuno.ch/';
const SITE_ORIGIN = new URL(SITE_URL).origin;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

/** Pages that may load JavaScript files (relative to dist/). */
const SCRIPT_PAGES = new Set(['index.html', 'demo/index.html']);
/** Pages exempt from the SEO head checks; they must carry noindex instead (pages.ts: index: false, plus the demo). */
const NOINDEX_PAGES = new Set(['404.html', 'demo/index.html', 'warteliste/bestaetigt/index.html']);

const problems = [];
const fail = (file, message) => problems.push(`dist/${file}: ${message}`);

async function exists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function isDir(dir) {
  try {
    return (await stat(dir)).isDirectory();
  } catch {
    return false;
  }
}

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith('.html')) out.push(path.relative(dist, full).split(path.sep).join('/'));
  }
  return out.sort();
}

// --- Minimal HTML reading (the build output is regular, but inline scripts and comments may contain anything) ---

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (value) =>
  value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10));
    return ENTITIES[code.toLowerCase()] ?? match;
  });

const tagPattern = /<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;
const attrPattern = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function attributes(source) {
  const attrs = {};
  for (const [, name, dq, sq, bare] of source.matchAll(attrPattern)) attrs[name.toLowerCase()] = decode(dq ?? sq ?? bare ?? '');
  return attrs;
}

/** Scripts (with their attributes and body) and every other tag; script/style bodies and comments are not scanned. */
function parse(html) {
  const scripts = [];
  const body = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi, (_, name, attrs, content) => {
      if (name.toLowerCase() === 'script') scripts.push({ attrs: attributes(attrs), content });
      return `<${name}${attrs}></${name}>`;
    });
  const tags = [...body.matchAll(tagPattern)].map(([, name, attrs]) => ({ name: name.toLowerCase(), attrs: attributes(attrs ?? '') }));
  const title = body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim() ?? '';
  return { scripts, tags, title };
}

/** URL path of a page in dist/: index.html → /, kosten/index.html → /kosten/, 404.html → /404.html */
const pagePath = (file) => `/${file.replace(/(^|\/)index\.html$/, '$1')}`;

/** True when the page's content is rendered only in the browser (empty #root), so its ids are not in the HTML. */
const clientRendered = (html) => /<div id="root"[^>]*>\s*<\/div>/.test(html);

// --- Read every page ---

if (!(await isDir(dist))) {
  console.error('dist/ not found: run `npm run build` first.');
  process.exit(1);
}

const files = await htmlFiles(dist);
const pages = new Map();
for (const file of files) {
  const html = await readFile(path.join(dist, file), 'utf8');
  const parsed = parse(html);
  const ids = new Set();
  for (const { name, attrs } of parsed.tags) {
    if (attrs.id) ids.add(attrs.id);
    if (name === 'a' && attrs.name) ids.add(attrs.name);
  }
  pages.set(file, { ...parsed, ids, clientRendered: clientRendered(html) });
}

for (const file of NOINDEX_PAGES) if (!pages.has(file)) fail(file, 'missing (listed in NOINDEX_PAGES of scripts/check-dist.mjs)');

const meta = (tags, key, value) => tags.find((t) => t.name === 'meta' && t.attrs[key]?.toLowerCase() === value)?.attrs.content;
const noindex = (tags) => /\bnoindex\b/i.test(meta(tags, 'name', 'robots') ?? '');

// --- Head and structure of every page ---

const canonicalPages = new Set();
for (const [file, { tags, title, scripts }] of pages) {
  if (!title) fail(file, 'missing or empty <title>');

  if (NOINDEX_PAGES.has(file)) {
    if (!noindex(tags)) fail(file, 'needs <meta name="robots" content="noindex">');
  } else {
    const h1 = tags.filter((t) => t.name === 'h1').length;
    if (h1 !== 1) fail(file, `has ${h1} <h1> elements, expected exactly 1`);
    if (!meta(tags, 'name', 'description')?.trim()) fail(file, 'missing or empty <meta name="description">');
    if (noindex(tags)) fail(file, 'is an indexable page but has robots noindex');
    const canonicals = tags.filter((t) => t.name === 'link' && t.attrs.rel?.toLowerCase().split(/\s+/).includes('canonical'));
    const expected = new URL(pagePath(file), SITE_URL).href;
    if (canonicals.length !== 1) fail(file, `has ${canonicals.length} canonical links, expected 1 (${expected})`);
    else if (canonicals[0].attrs.href !== expected) fail(file, `canonical is ${canonicals[0].attrs.href}, expected ${expected}`);
    else canonicalPages.add(expected);
  }

  for (const { attrs, content } of scripts) {
    if (attrs.type?.toLowerCase() === 'application/ld+json') {
      try {
        JSON.parse(content);
      } catch (error) {
        fail(file, `JSON-LD block does not parse: ${error.message}`);
      }
    }
    if (attrs.src !== undefined && !SCRIPT_PAGES.has(file)) {
      fail(file, `loads the script ${attrs.src}, but static pages ship no JavaScript (inline scripts are fine; see the empty-module drop in scripts/prerender.mjs)`);
    }
  }
  if (!SCRIPT_PAGES.has(file)) {
    for (const { name, attrs } of tags) {
      if (name === 'link' && attrs.rel?.toLowerCase().split(/\s+/).includes('modulepreload')) {
        fail(file, `preloads the module ${attrs.href}, but static pages ship no JavaScript`);
      }
    }
  }
}

// --- Sitemap ---

const sitemapFile = path.join(dist, 'sitemap.xml');
if (!(await exists(sitemapFile))) {
  problems.push('dist/sitemap.xml: missing');
} else {
  const locs = [...(await readFile(sitemapFile, 'utf8')).matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)].map((m) => decode(m[1]));
  if (!locs.length) problems.push('dist/sitemap.xml: no <loc> entries');
  for (const loc of locs) {
    if (!loc.startsWith(SITE_URL)) {
      problems.push(`dist/sitemap.xml: ${loc} is not on ${SITE_URL}`);
      continue;
    }
    const { pathname } = new URL(loc);
    const file = decodeURIComponent(pathname.slice(1)) + (pathname.endsWith('/') ? 'index.html' : '');
    if (!pages.has(file)) problems.push(`dist/sitemap.xml: ${loc} has no page (dist/${file} missing)`);
    else if (NOINDEX_PAGES.has(file)) problems.push(`dist/sitemap.xml: ${loc} is a noindex page`);
  }
  for (const url of canonicalPages) if (!locs.includes(url)) problems.push(`dist/sitemap.xml: indexable page ${url} is missing`);
}

// --- Internal links and assets ---

/** Every URL a tag points to: href, src, srcset, poster, and the share image in og:image / twitter:image. */
function urlsOf({ name, attrs }) {
  const urls = [];
  for (const key of ['href', 'xlink:href', 'src', 'poster']) if (attrs[key] !== undefined) urls.push(attrs[key]);
  for (const key of ['srcset', 'imagesrcset']) {
    if (attrs[key]) urls.push(...attrs[key].split(',').map((part) => part.trim().split(/\s+/)[0]).filter(Boolean));
  }
  const property = (attrs.property ?? attrs.name ?? '').toLowerCase();
  if (name === 'meta' && /^(og|twitter):(image|url)$/.test(property) && attrs.content) urls.push(attrs.content);
  return urls;
}

const SKIP_SCHEME = /^(mailto|tel|sms|javascript|data|blob):/i;

for (const [file, { tags, ids }] of pages) {
  const base = new URL(pagePath(file), SITE_URL);
  for (const tag of tags) {
    for (const raw of urlsOf(tag)) {
      const href = raw.trim();
      if (!href || SKIP_SCHEME.test(href)) continue;
      let url;
      try {
        url = new URL(href, base);
      } catch {
        fail(file, `invalid URL "${href}"`);
        continue;
      }
      if (url.origin !== SITE_ORIGIN) continue; // external link

      // 404.html is served under every unknown URL, so a relative URL in it would resolve against that URL
      if (file === '404.html' && !/^(\/|#|[a-z][a-z\d+.-]*:)/i.test(href)) fail(file, `relative URL "${href}" (use an absolute path)`);

      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        fail(file, `badly encoded URL "${href}"`);
        continue;
      }
      let target = pathname.slice(1);
      if (target === '' || target.endsWith('/')) target += 'index.html';
      if (!(await exists(path.join(dist, target)))) {
        if (await exists(path.join(dist, target, 'index.html'))) {
          fail(file, `<${tag.name}> "${href}" needs a trailing slash (Cloudflare answers ${pathname} with a redirect)`);
        } else {
          fail(file, `<${tag.name}> "${href}" points to dist/${target}, which does not exist`);
        }
        continue;
      }

      const hash = url.hash.slice(1);
      // Only fragments that name an element: not empty, not a hash route (#/partner), not a text fragment (#:~:text=)
      if (!hash || hash.startsWith('/') || hash.startsWith(':~:')) continue;
      const targetPage = target === file ? { ids, clientRendered: false } : pages.get(target);
      if (!targetPage || targetPage.clientRendered) continue; // not an HTML page, or ids only exist in the browser
      let id;
      try {
        id = decodeURIComponent(hash);
      } catch {
        id = hash;
      }
      // #top scrolls to the top of the page even without such an element (HTML spec)
      if (!targetPage.ids.has(id) && id.toLowerCase() !== 'top') {
        fail(file, `<${tag.name}> "${href}": no element with id="${id}" in dist/${target}`);
      }
    }
  }
}

// --- Report ---

if (problems.length) {
  console.error(`check-dist: ${problems.length} problem${problems.length === 1 ? '' : 's'} in dist/\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('');
  process.exit(1);
}
console.log(`check-dist: ${files.length} HTML pages OK (head tags, sitemap, internal links and anchors, JSON-LD, no scripts on static pages)`);
