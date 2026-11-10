// Builds the waitlist e-mails for Brevo from emails/src/ into emails/dist/ (see emails/README.md). Not part of the
// site build; run it by hand after a change and commit the outputs.
//   npm run emails                  emails/dist/*.html and *.txt (plain Node, no dependencies)
//   npm run emails -- --assets      also public/email/: the wordmark PNG (from WORDMARK.source) and the web fonts
//   npm run emails -- --previews    also emails/previews/*.png (desktop 600 px and mobile 375 px, light and dark,
//                                   plus an inverted and a no-web-font check); --assets and --previews use the
//                                   Playwright Chromium the e2e tests already install (npx playwright install chromium)
//
// Source format (emails/src/<name>.html): a leading comment with `key: value` lines (subject, preheader), then the
// card content after `<!-- @body -->` and the footer after `<!-- @footer -->`. layout.html wraps both. Styles:
// emails/src/inline.css is written into style="" attributes of every element with a matching class (class
// selectors only); the <style> block in layout.html stays in the head for dark mode, phones and Outlook.
// `<!-- @button href="…" label="…" width="…" -->` expands to a bulletproof button (VML for Outlook, padded <a>).
// %%NAME%% tokens come from `tokens` below. Brevo's own placeholders ({{ doubleoptin }}, {{ unsubscribe }}) pass
// through untouched.
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'emails/src');
const out = path.join(root, 'emails/dist');
const previews = path.join(root, 'emails/previews');
const args = new Set(process.argv.slice(2));

/** Where the hosted images and fonts live (public/email/ is deployed with the site). */
const ASSET_BASE = 'https://sponsuno.ch/email/';
/** The one logo asset of the e-mails. To swap the logo: change `source` (or the SVG), run `npm run emails -- --assets`.
    File names under /email/ use [a-z0-9.-] only: Cloudflare's static assets answer a path with "@" (or other
    characters it encodes) with a 307 to the encoded path, an extra hop that not every mail client or image proxy follows. */
// `plate`: a rounded navy plate inside the PNG behind the letters (CSS px). On the navy header it is invisible; in
// clients that invert the e-mail but not its images (Gmail apps, Outlook mobile in dark mode) the header turns light and
// the logo stays a navy badge with ivory letters. The header padding in inline.css and layout.html subtracts padX and
// padY, so the letters keep their place (left edge in line with the headline).
const WORDMARK = {
  source: 'src/assets/wordmark-light.svg',
  file: 'wordmark-light-2x.png',
  width: 150,
  halo: '#0B1830',
  plate: { color: '#0B1830', padX: 10, padY: 6, radius: 8 },
};
/** Web fonts for clients that load them (Apple Mail, iOS Mail); everything else uses the fallback stacks. */
const FONTS = [
  ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2', 'cormorant-garamond-600.woff2'],
  ['@fontsource/manrope/files/manrope-latin-400-normal.woff2', 'manrope-400.woff2'],
  ['@fontsource/manrope/files/manrope-latin-600-normal.woff2', 'manrope-600.woff2'],
];
const GMAIL_CLIP = 102 * 1024;
for (const file of [WORDMARK.file, ...FONTS.map(([, to]) => `fonts/${to}`)]) {
  if (!/^[a-z0-9.\/-]+$/.test(file)) throw new Error(`Asset name "${file}": use [a-z0-9.-] only (see WORDMARK)`);
}

// Postal address from the Impressum data (src/content.ts → legal.contact), so the footer never drifts from it.
const content = await readFile(path.join(root, 'src/content.ts'), 'utf8');
const addressMatch = content.match(/postalAddress:\s*\[([^\]]*)\]/);
if (!addressMatch) throw new Error('legal.contact.postalAddress not found in src/content.ts');
const address = [...addressMatch[1].matchAll(/'([^']*)'/g)].map((m) => m[1]);
const emailMatch = content.match(/contact:\s*\{[^}]*email:\s*'([^']+)'/);
if (!emailMatch || address.length === 0) throw new Error('legal.contact is incomplete in src/content.ts');

// The wordmark's height follows the SVG's viewBox, so a new logo keeps its proportions.
const svg = await readFile(path.join(root, WORDMARK.source), 'utf8');
const [, , vbW, vbH] = svg.match(/viewBox="([^"]+)"/)[1].trim().split(/[\s,]+/).map(Number);
const wordmarkHeight = Math.round((WORDMARK.width * vbH) / vbW);
const { plate } = WORDMARK;
/** Size of the PNG (CSS px): the wordmark plus its plate. */
const logoWidth = WORDMARK.width + 2 * plate.padX;
const logoHeight = wordmarkHeight + 2 * plate.padY;

const tokens = {
  ASSET_BASE,
  WORDMARK_SRC: ASSET_BASE + WORDMARK.file,
  WORDMARK_WIDTH: String(logoWidth),
  WORDMARK_HEIGHT: String(logoHeight),
  // Postal code and town stay on one line (&nbsp;), also on narrow phones
  ADDRESS_LINE: address.map((part) => part.replace(/^(\d{4,5}) /, '$1&nbsp;')).join(', '),
  ADDRESS_TEXT: address.join('\n'),
  CONTACT_EMAIL: emailMatch[1],
};

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function fillTokens(text, extra = {}) {
  const all = { ...tokens, ...extra };
  return text.replace(/%%([A-Z_]+)%%/g, (whole, name) => {
    if (!(name in all)) throw new Error(`Unknown token ${whole}`);
    return all[name];
  });
}

/** Parses `.a, .b { decl }` rules (class selectors only) into a map class → declarations, in file order. */
function parseInlineCss(css) {
  const rules = new Map();
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, selectors, body] of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = body.split(';').map((d) => d.trim()).filter(Boolean);
    for (const selector of selectors.split(',').map((s) => s.trim())) {
      if (!/^\.[\w-]+$/.test(selector)) throw new Error(`inline.css supports class selectors only: "${selector}"`);
      const name = selector.slice(1);
      rules.set(name, [...(rules.get(name) ?? []), ...decls]);
    }
  }
  return rules;
}

/** Writes the declarations of every class into the element's style attribute (its own style="" wins). */
function inlineStyles(html, rules) {
  const order = [...rules.keys()];
  return html.replace(/<([a-z][a-z0-9]*)(\s[^<>]*?)?(\/?)>/gi, (tag, name, attrs = '', selfClose) => {
    const classMatch = attrs.match(/\sclass="([^"]*)"/);
    if (!classMatch) return tag;
    const classes = classMatch[1].split(/\s+/).filter(Boolean);
    const decls = [];
    for (const cls of order) if (classes.includes(cls)) decls.push(...rules.get(cls));
    if (decls.length === 0) return tag;
    const styleMatch = attrs.match(/\sstyle="([^"]*)"/);
    if (styleMatch) decls.push(...styleMatch[1].split(';').map((d) => d.trim()).filter(Boolean));
    // Later declarations of the same property win; keep one of each.
    const byProp = new Map();
    for (const d of decls) {
      const prop = d.slice(0, d.indexOf(':')).trim().toLowerCase();
      byProp.delete(prop);
      byProp.set(prop, d.replace(/\s*:\s*/, ':'));
    }
    const style = [...byProp.values()].join(';');
    const rest = attrs.replace(/\sstyle="[^"]*"/, '');
    return `<${name}${rest} style="${style}"${selfClose ? ' /' : ''}>`;
  });
}

/** Bulletproof button: VML roundrect for Outlook on Windows, a padded <a> everywhere else. */
function button({ href, label, width = '260' }) {
  const w = Number(width);
  return `<table role="presentation" class="btn-table" border="0" cellpadding="0" cellspacing="0">
<tr><td class="btn-td" align="center">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:54px;v-text-anchor:middle;width:${w}px;" arcsize="19%" strokecolor="#9A7440" strokeweight="1px" fillcolor="#C4A36B"><w:anchorlock/><center style="color:#0B1830;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;">${label}</center></v:roundrect><![endif]-->
<!--[if !mso]><!--><a class="btn sans" href="${href}" target="_blank">${label}</a><!--<![endif]-->
</td></tr>
</table>`;
}

function expandMacros(html) {
  return html.replace(/<!--\s*@button\s+([\s\S]*?)-->/g, (_, attrText) => {
    const attrs = Object.fromEntries([...attrText.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    return button(attrs);
  });
}

function parseSource(text, name) {
  const meta = {};
  const head = text.match(/^\s*<!--([\s\S]*?)-->/);
  if (!head) throw new Error(`${name}: missing meta comment`);
  for (const line of head[1].split('\n')) {
    const m = line.match(/^\s*(\w+):\s*(.+?)\s*$/);
    if (m) meta[m[1]] = m[2];
  }
  const body = text.split('<!-- @body -->')[1]?.split('<!-- @footer -->')[0];
  const footer = text.split('<!-- @footer -->')[1];
  if (!meta.subject || !meta.preheader || body === undefined || footer === undefined) {
    throw new Error(`${name}: needs subject, preheader, <!-- @body --> and <!-- @footer -->`);
  }
  return { meta, body: body.trim(), footer: footer.trim() };
}

/** Checks the rules the README promises; throws with a list of problems. */
function check(name, html, text) {
  const problems = [];
  const size = Buffer.byteLength(html);
  if (size >= GMAIL_CLIP) problems.push(`${size} bytes, Gmail clips at ${GMAIL_CLIP}`);
  if (/%%[A-Z_]+%%/.test(html + text)) problems.push('unreplaced %%TOKEN%%');
  if (/<table(?![^>]*role="presentation")/.test(html)) problems.push('a <table> without role="presentation"');
  if (/<img(?![^>]*\salt=")/.test(html)) problems.push('an <img> without alt');
  if (/ß/.test(html + text)) problems.push('"ß" (Swiss spelling uses "ss")');
  // {{ params.DOIurl }} is the confirmation link of Brevo's API reference (create-doi-contact), the documented
  // alternative to {{ doubleoptin }}; every other contact or params placeholder is personalisation.
  if (/\{\{\s*(contact\.|params\.(?!DOIurl\s*\}\}))/.test(html + text)) problems.push('personalisation placeholder');
  if (name === 'doi-bestaetigung') {
    const doi = /\{\{\s*(doubleoptin|params\.DOIurl)\s*\}\}/;
    if (!/href="\{\{\s*(doubleoptin|params\.DOIurl)\s*\}\}"/.test(html)) problems.push('no {{ doubleoptin }} link');
    if (!doi.test(text)) problems.push('plain text has no {{ doubleoptin }} link');
  } else if (!html.includes('href="{{ unsubscribe }}"') || !text.includes('{{ unsubscribe }}')) {
    problems.push('no {{ unsubscribe }} link');
  }
  if (problems.length) throw new Error(`${name}:\n  - ${problems.join('\n  - ')}`);
  return size;
}

async function build() {
  const layout = await readFile(path.join(src, 'layout.html'), 'utf8');
  const rules = parseInlineCss(await readFile(path.join(src, 'inline.css'), 'utf8'));
  const names = (await readdir(src)).filter((f) => f.endsWith('.html') && f !== 'layout.html').map((f) => f.slice(0, -5));
  await mkdir(out, { recursive: true });
  const built = [];
  for (const name of names.sort()) {
    const { meta, body, footer } = parseSource(await readFile(path.join(src, `${name}.html`), 'utf8'), name);
    // Invisible filler after the preheader keeps clients from pulling body text into the inbox preview.
    const pad = '&#847;&zwnj;&nbsp;'.repeat(60);
    let html = layout.replace('%%BODY%%', body).replace('%%FOOTER%%', footer);
    html = fillTokens(expandMacros(html), {
      SUBJECT: escapeText(meta.subject),
      SUBJECT_ATTR: escapeAttr(meta.subject),
      PREHEADER: escapeText(meta.preheader),
      PREHEADER_PAD: pad,
    });
    html = inlineStyles(html, rules).replace(/\n{3,}/g, '\n\n');
    const text = fillTokens(await readFile(path.join(src, `${name}.txt`), 'utf8'));
    const size = check(name, html, text);
    await writeFile(path.join(out, `${name}.html`), html);
    await writeFile(path.join(out, `${name}.txt`), text);
    built.push(name);
    console.log(`emails/dist/${name}.html  ${(size / 1024).toFixed(1)} KB  ·  ${meta.subject}`);
  }
  return built;
}

async function chromium() {
  try {
    return (await import('@playwright/test')).chromium;
  } catch {
    throw new Error('Playwright is missing: npm install, then npx playwright install chromium');
  }
}

/** public/email/: wordmark PNG at 2× (transparent, with a navy halo for clients that invert the header) and fonts. */
async function assets() {
  const dir = path.join(root, 'public/email');
  await mkdir(path.join(dir, 'fonts'), { recursive: true });
  for (const [from, to] of FONTS) await copyFile(path.join(root, 'node_modules', from), path.join(dir, 'fonts', to));
  // A stroke under each fill (paint-order) draws a thin navy outline: invisible on the navy header, but it keeps the
  // ivory letters readable if a client lightens the header in dark mode. Stroke width in viewBox units.
  const halo = svg.replace(/<g fill="/g, `<g stroke="${WORDMARK.halo}" stroke-width="${(vbW / WORDMARK.width) * 1.6}" stroke-linejoin="round" paint-order="stroke" fill="`);
  const browser = await (await chromium()).launch();
  const page = await browser.newPage({ viewport: { width: logoWidth, height: logoHeight }, deviceScaleFactor: 2 });
  const plateStyle = `background:${plate.color};border-radius:${plate.radius}px;padding:${plate.padY}px ${plate.padX}px`;
  await page.setContent(`<body style="margin:0;background:transparent"><div style="${plateStyle}">${halo.replace('<svg ', `<svg width="${WORDMARK.width}" height="${wordmarkHeight}" style="display:block" `)}</div></body>`);
  await page.screenshot({ path: path.join(dir, WORDMARK.file), omitBackground: true });
  await browser.close();
  console.log(`public/email/${WORDMARK.file} (${logoWidth * 2} × ${logoHeight * 2}) and ${FONTS.length} fonts`);
}

/** emails/previews/<name>-<width>-<scheme>.png, with the hosted assets swapped for the local copies. */
async function renderPreviews(names) {
  await mkdir(previews, { recursive: true });
  const local = pathToFileURL(path.join(root, 'public/email')).href + '/';
  const browser = await (await chromium()).launch();
  const shots = [
    { width: 600, scheme: 'light' },
    { width: 600, scheme: 'dark' },
    { width: 375, scheme: 'light' },
    { width: 375, scheme: 'dark' },
    { width: 320, scheme: 'light' },
    // Rough stand-in for clients that invert colours themselves (Gmail apps, Outlook): everything inverted except images.
    { width: 600, scheme: 'light', variant: 'inverted' },
    // Gmail, Outlook and most webmail load no web fonts: the Georgia / Arial fallbacks.
    { width: 600, scheme: 'light', variant: 'no-webfonts' },
  ];
  for (const name of names) {
    const html = (await readFile(path.join(out, `${name}.html`), 'utf8')).replaceAll(ASSET_BASE, local);
    const file = path.join(previews, `.${name}.preview.html`);
    await writeFile(file, html);
    for (const { width, scheme, variant } of shots) {
      const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2, colorScheme: scheme });
      const page = await context.newPage();
      if (variant === 'no-webfonts') await page.route('**/*.woff2', (route) => route.abort());
      await page.goto(pathToFileURL(file).href);
      if (variant === 'inverted') {
        await page.addStyleTag({ content: 'html{filter:invert(1) hue-rotate(180deg);background:#fff} img{filter:invert(1) hue-rotate(180deg)}' });
      }
      await page.evaluate(() => document.fonts.ready);
      const shot = `${name}-${width}-${variant ?? scheme}.png`;
      await page.screenshot({ path: path.join(previews, shot), fullPage: true });
      await context.close();
    }
    await rm(file);
    console.log(`emails/previews/${name}-*.png`);
  }
  await browser.close();
}

const names = await build();
if (args.has('--assets')) await assets();
if (args.has('--previews')) await renderPreviews(names);
