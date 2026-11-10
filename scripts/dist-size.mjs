// Size budget of the built site (dist/), run by scripts/check-dist.mjs (`npm run check:dist`). Plain Node, no dependencies.
// Measures what a first visit downloads, per file as the server sends it (gzip -9; brotli q11 for information), prints
// a table on every run and returns a problem for every budget that is exceeded:
// - landing page JS: its module script, the modulepreloads and everything they import statically (not the lazy chunks)
// - landing page CSS: its stylesheets plus its inline <style> blocks (each counted by its own gzip size)
// - demo JS: its module script, the modulepreloads, their static imports, plus the largest first view (the view chunks
//   the inline preload script in demo/index.html loads for a deep link, `<!--view-preload-->` in vite.config.ts)
// - each static page's CSS (every page except / and /demo/): stylesheets plus inline <style> blocks
// Budgets sit about 10% above the sizes measured on 2026-11-10 (AGENTS.md → Performance budget). Raise one only with a
// reason in the commit message, and update the numbers in AGENTS.md in the same change.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

/** Budgets in bytes, gzip -9. Measured 2026-11-10: 84,658 (React 67,543 + main 17,115) / 15,549 / 89,820 (#/ki-manager;
    #/uebersicht 85,176) / 10,469 (the topic pages with sections-*.css; the guides and legal pages 6,532). */
export const BUDGETS = {
  homeJs: 93_000,
  homeCss: 17_100,
  demoJs: 98_800,
  staticCss: 11_500,
};

const gzip = (buf) => gzipSync(buf, { level: 9 }).length;
const brotli = (buf) => brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT } }).length;

/** Static imports and re-exports of a built chunk (`import{…}from"./x.js"`, `import"./x.js"`, `export{…}from"./x.js"`);
    dynamic import("./x.js") is not matched, so lazy chunks stay out. */
const STATIC_IMPORT = /(?:^|[;}\s])(?:import|export)\s*(?:[\w$*{},\s]+?\s*from\s*)?["'](\.{1,2}\/[^"']+\.js)["']/g;

/**
 * Every JavaScript file a page loads before it runs: module scripts, modulepreloads and their static imports, as
 * dist-relative paths starting with /assets/. `extra` adds more entry files (the demo's first view).
 */
export async function initialScripts(dist, tags, scripts, extra = []) {
  const entries = [
    ...scripts.map(({ attrs }) => attrs.src),
    ...tags
      .filter(({ name, attrs }) => name === 'link' && attrs.rel?.toLowerCase().split(/\s+/).includes('modulepreload'))
      .map(({ attrs }) => attrs.href),
    ...extra,
  ].filter((src) => src?.startsWith('/assets/') && src.endsWith('.js'));
  const seen = new Set();
  const queue = [...entries];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    const code = await readFile(path.join(dist, file), 'utf8').catch(() => '');
    for (const [, spec] of code.matchAll(STATIC_IMPORT)) queue.push(path.posix.join(path.posix.dirname(file), spec));
  }
  return [...seen];
}

const stylesheets = (tags) =>
  tags
    .filter(({ name, attrs }) => name === 'link' && attrs.rel?.toLowerCase().split(/\s+/).includes('stylesheet'))
    .map(({ attrs }) => attrs.href)
    .filter((href) => href?.startsWith('/assets/'));

/** Inline <style> bodies of a page (the parse in check-dist.mjs keeps only scripts, so read them from the raw HTML). */
const inlineStyles = (html) => [...html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map((m) => m[1]);

/** The first-view map of the demo's inline preload script: { view: [files] }. */
function demoViews(html) {
  const json = html.match(/var v=(\{[\s\S]*?\}),m=/)?.[1];
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * @param dist absolute path of dist/
 * @param pages Map of dist-relative HTML file → { tags, scripts } (from check-dist.mjs)
 * @returns {{ rows: string[], problems: string[] }}
 */
export async function checkSizes(dist, pages) {
  const problems = [];
  const cache = new Map();
  async function size(file) {
    if (!cache.has(file)) {
      const buf = await readFile(path.join(dist, file)).catch(() => null);
      cache.set(file, buf ? { raw: buf.length, gz: gzip(buf), br: brotli(buf) } : null);
      if (!buf) problems.push(`dist${file}: referenced, but missing`);
    }
    return cache.get(file) ?? { raw: 0, gz: 0, br: 0 };
  }
  const sum = (sizes) => sizes.reduce((a, s) => ({ raw: a.raw + s.raw, gz: a.gz + s.gz, br: a.br + s.br }), { raw: 0, gz: 0, br: 0 });
  const inline = (css) => {
    const buf = Buffer.from(css);
    return { raw: buf.length, gz: gzip(buf), br: brotli(buf) };
  };
  const cssOf = async (file) => {
    const { tags } = pages.get(file);
    const html = await readFile(path.join(dist, file), 'utf8');
    const linked = stylesheets(tags);
    const styles = inlineStyles(html);
    return { total: sum([...(await Promise.all(linked.map(size))), ...styles.map(inline)]), parts: [...linked.map((f) => path.posix.basename(f)), ...(styles.length ? [`${styles.length} inline`] : [])] };
  };

  const rows = [];
  const row = (label, s, budget, parts) => {
    const over = budget !== undefined && s.gz > budget;
    rows.push({ label, s, budget, over, parts });
    if (over) problems.push(`size budget: ${label} is ${kb(s.gz)} gzipped, budget ${kb(budget)} (BUDGETS in scripts/dist-size.mjs; see AGENTS.md → Performance budget)`);
  };

  const home = pages.get('index.html');
  if (home) {
    const js = await initialScripts(dist, home.tags, home.scripts);
    row('/ JS (initial)', sum(await Promise.all(js.map(size))), BUDGETS.homeJs, js.map((f) => path.posix.basename(f)));
    const css = await cssOf('index.html');
    row('/ CSS', css.total, BUDGETS.homeCss, css.parts);
    const html = await readFile(path.join(dist, 'index.html'));
    row('/ HTML', { raw: html.length, gz: gzip(html), br: brotli(html) }, undefined, ['index.html']);
  } else problems.push('dist/index.html: missing, cannot measure the landing page');

  const demo = pages.get('demo/index.html');
  if (demo) {
    const html = await readFile(path.join(dist, 'demo/index.html'), 'utf8');
    const views = demoViews(html);
    if (!views) problems.push('dist/demo/index.html: no first-view preload map (var v={…}) found, cannot measure the demo; see <!--view-preload--> in vite.config.ts');
    let worst = null;
    for (const [view, files] of Object.entries(views ?? { '': [] })) {
      const js = await initialScripts(dist, demo.tags, demo.scripts, files);
      const total = sum(await Promise.all(js.map(size)));
      if (!worst || total.gz > worst.total.gz) worst = { view, js, total };
    }
    row(`/demo/ JS (initial, largest first view${worst.view ? `: #/${worst.view}` : ''})`, worst.total, BUDGETS.demoJs, worst.js.map((f) => path.posix.basename(f)));
    const viewCss = (views?.[worst.view] ?? []).filter((f) => f.endsWith('.css'));
    const css = sum(await Promise.all([...stylesheets(demo.tags), ...viewCss].map(size)));
    row(`/demo/ CSS (same view)`, css, undefined, [...stylesheets(demo.tags), ...viewCss].map((f) => path.posix.basename(f)));
  } else problems.push('dist/demo/index.html: missing, cannot measure the demo');

  // Static pages: one row per distinct set of stylesheets (most pages share one), the budget applies to each page
  const groups = new Map();
  for (const file of pages.keys()) {
    if (file === 'index.html' || file === 'demo/index.html') continue;
    const css = await cssOf(file);
    const key = `${css.total.gz} ${css.parts.join(' ')}`;
    if (!groups.has(key)) groups.set(key, { css, files: [] });
    groups.get(key).files.push(file);
  }
  for (const { css, files } of [...groups.values()].sort((a, b) => b.css.total.gz - a.css.total.gz)) {
    const names = files.map((f) => `/${f.replace(/(^|\/)index\.html$/, '$1')}`);
    const label = `static CSS: ${names.length > 3 ? `${names.slice(0, 2).join(' ')} +${names.length - 2} more` : names.join(' ')}`;
    row(label, css.total, BUDGETS.staticCss, css.parts);
  }

  return { rows: table(rows), problems };
}

const kb = (bytes) => `${(bytes / 1000).toFixed(1)} KB`;

function table(rows) {
  const width = Math.max(...rows.map((r) => r.label.length));
  const pad = (s, n) => String(s).padStart(n);
  const out = [`${'size (first visit)'.padEnd(width)}  ${pad('raw', 9)}  ${pad('gzip', 9)}  ${pad('brotli', 9)}  ${pad('budget', 9)}`];
  for (const { label, s, budget, over } of rows) {
    out.push(`${label.padEnd(width)}  ${pad(kb(s.raw), 9)}  ${pad(kb(s.gz), 9)}  ${pad(kb(s.br), 9)}  ${pad(budget === undefined ? '-' : kb(budget), 9)}${over ? '  OVER' : ''}`);
  }
  out.push(...rows.filter((r) => r.parts.length).map((r) => `  ${r.label}: ${r.parts.join(', ')}`));
  return out;
}
