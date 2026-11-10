// Build-time prerender: renders each page to static HTML so content is visible before JS runs
// and crawlers see real text, and builds each page's <head> tags. Used by scripts/prerender.mjs;
// never shipped to the browser.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { StaticPage, type StaticPageId } from './components/StaticPage';
import { faq, legal } from './content';
import { MOVED_SECTIONS, pageHref } from './lib/links';
import { absoluteUrl, htmlFile, pageMeta, pages, site, SITE_URL, type PageId } from './pages';

export { htmlFile, pages, SITE_URL };
export { templateFiles } from './lib/templates';
export { THEME_SCRIPT } from './lib/theme';
export type { PageId };

export function render(id: PageId = 'home'): string {
  return renderToString(
    <StrictMode>
      {id === 'home' ? <App /> : <StaticPage id={id as StaticPageId} />}
    </StrictMode>,
  );
}

const escapeAttr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** <title> text of a page, HTML-escaped */
export const titleFor = (id: PageId): string => escapeAttr(pageMeta(id).title);

/**
 * Head tags of a page, injected at the <!--seo--> marker: description, canonical, Open Graph, Twitter card,
 * on the landing page the robots preview hint, the JSON-LD graph (WebSite, Organization) and the redirect of old
 * section links (movedScript), on /fragen/ the FAQPage JSON-LD, on the topic pages with scrollFx (/ki-manager/) the scroll motion gate (SCROLL_FX_SCRIPT). Canonical = og:url = absolute apex URL. The 404 page gets only noindex: it is served under any
 * unknown URL, so a canonical or og:url would point to the wrong place.
 */
export function headFor(id: PageId): string {
  const page = pageMeta(id);
  const url = absoluteUrl(page.path);
  const meta = (attr: 'name' | 'property', key: string, content: string) =>
    `<meta ${attr}="${key}" content="${escapeAttr(content)}">`;

  // The 404 page and notices (/warteliste/bestaetigt/) stay out of search: noindex only, no canonical or share tags
  if (page.kind === 'notfound' || page.kind === 'notice') return meta('name', 'robots', 'noindex');

  const tags = [
    meta('name', 'description', page.description),
    `<link rel="canonical" href="${escapeAttr(url)}">`,
    ...(id === 'home' ? [meta('name', 'robots', 'max-image-preview:large')] : []),
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', site.name),
    meta('property', 'og:locale', site.locale),
    meta('property', 'og:title', page.ogTitle ?? page.title),
    meta('property', 'og:description', page.description),
    meta('property', 'og:url', url),
    meta('property', 'og:image', site.ogImage),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:alt', site.ogImageAlt),
    meta('name', 'twitter:card', 'summary_large_image'),
  ];
  if (id === 'home') tags.push(`<script type="application/ld+json">${jsonLd(homeGraph())}</script>`, movedScript());
  if (id === 'fragen') tags.push(`<script type="application/ld+json">${jsonLd(faqGraph())}</script>`);
  if (page.kind === 'info' && page.scrollFx) tags.push(SCROLL_FX_SCRIPT);
  return tags.join('\n  ');
}

/**
 * Scroll motion on a topic page with `scrollFx` in pages.ts (today /ki-manager/: the pinned bento). These pages ship no
 * JavaScript module, so this inline script in the head sets only html.scroll-fx before the first paint, under the
 * same conditions as index.html (motion allowed, scroll timelines supported). Never html.motion: its data-reveal start states wait for the IntersectionObserver of the
 * landing page app, which these pages do not load. Everything that moves is pure CSS (data-scroll primitives in
 * site.css, the section rules under .scroll-fx); without the class every section shows its final layout.
 * /kosten/, /fragen/, /ueber-uns/ (and /fuer-firmen/) stay without it: their sections start right under the header, so rows, cards and
 * markers in the lower part of the first screen would load half-risen at many viewport sizes (DESIGN.md -> Motion).
 */
const SCROLL_FX_SCRIPT =
  "<script>if(matchMedia('(prefers-reduced-motion: no-preference)').matches&&window.CSS&&CSS.supports('animation-timeline','view()'))document.documentElement.classList.add('scroll-fx')</script>";

/**
 * Old links to sections that moved to their own page (/#kosten → /kosten/): an inline script in the landing page's
 * head sends them on before the first paint, so the homepage never flashes first. Built from MOVED_SECTIONS, so it
 * cannot drift; App.tsx keeps the same redirect for dev (no prerender) and for hash changes on the open page.
 */
function movedScript(): string {
  const targets = Object.fromEntries(Object.entries(MOVED_SECTIONS).map(([id, path]) => [id, pageHref(path)]));
  return `<script>(function(m){var h=location.hash.slice(1);if(Object.prototype.hasOwnProperty.call(m,h))location.replace(m[h])})(${jsonLd(targets)})</script>`;
}

/** JSON for a <script> element: "<" escaped so the text can never close the element. */
const jsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');

/**
 * Structured data of the landing page: WebSite and Organization in one graph, built from pages.ts and
 * content.ts so it cannot drift from the visible copy. Never add Review, AggregateRating, Product or Offer:
 * there are no reviews, products or prices (AGENTS.md, copy rule 2).
 */
function homeGraph() {
  const home = pageMeta('home');
  const orgId = `${SITE_URL}#organization`;
  const [street, cityLine] = legal.contact.postalAddress ?? [];
  const city = cityLine?.match(/^(\d{4})\s+(.+)$/);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        name: site.name,
        url: SITE_URL,
        inLanguage: site.language,
        publisher: { '@id': orgId },
      },
      {
        '@type': 'Organization',
        '@id': orgId,
        name: site.name,
        url: SITE_URL,
        logo: site.logo,
        description: home.description,
        ...(legal.contact.email ? { email: legal.contact.email } : {}),
        ...(street && city
          ? {
              address: {
                '@type': 'PostalAddress',
                streetAddress: street,
                postalCode: city[1],
                addressLocality: city[2],
                addressCountry: 'CH',
              },
            }
          : {}),
      },
    ],
  };
}

/** FAQPage of /fragen/, from faq.items (the questions shown on that page), part of the landing page's WebSite. */
function faqGraph() {
  const url = absoluteUrl(pageMeta('fragen').path);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#fragen`,
    url,
    inLanguage: site.language,
    // Minimal WebSite node, so the reference resolves on this page too (the full node is on the landing page)
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}#website`, name: site.name, url: SITE_URL },
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/** Names of the legal.contact fields that are still null (shown as pending on the legal pages). */
export function missingLegalContact(): string[] {
  return Object.entries(legal.contact).filter(([, value]) => value === null).map(([key]) => `legal.contact.${key}`);
}
