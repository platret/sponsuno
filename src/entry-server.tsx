// Build-time prerender: renders each page to static HTML so content is visible before JS runs
// and crawlers see real text, and builds each page's <head> tags. Used by scripts/prerender.mjs;
// never shipped to the browser.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { StaticPage } from './components/StaticPage';
import { faq, legal } from './content';
import { absoluteUrl, pageMeta, pages, site, SITE_URL, type PageId } from './pages';

export { pages, SITE_URL };
export { templateFiles } from './lib/templates';
export type { PageId };

export function render(id: PageId = 'home'): string {
  return renderToString(
    <StrictMode>
      {id === 'home' ? <App /> : <StaticPage id={id} />}
    </StrictMode>,
  );
}

const escapeAttr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** <title> text of a page, HTML-escaped */
export const titleFor = (id: PageId): string => escapeAttr(pageMeta(id).title);

/**
 * Head tags of a page, injected at the <!--seo--> marker: description, canonical, Open Graph, Twitter card,
 * and on the landing page the robots preview hint and the JSON-LD graph. Canonical = og:url = absolute apex URL.
 */
export function headFor(id: PageId): string {
  const page = pageMeta(id);
  const url = absoluteUrl(page.path);
  const meta = (attr: 'name' | 'property', key: string, content: string) =>
    `<meta ${attr}="${key}" content="${escapeAttr(content)}">`;

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
  if (id === 'home') tags.push(`<script type="application/ld+json">${jsonLd(homeGraph())}</script>`);
  return tags.join('\n  ');
}

/** JSON for a <script> element: "<" escaped so the text can never close the element. */
const jsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');

/**
 * Structured data of the landing page: WebSite, Organization and FAQPage in one graph, built from
 * pages.ts and content.ts so it cannot drift from the visible copy. Never add Review, AggregateRating,
 * Product or Offer: there are no reviews, products or prices (AGENTS.md, copy rule 2).
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
        alternateName: 'sponsuno.ch',
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
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}#fragen`,
        inLanguage: site.language,
        mainEntity: faq.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
}

/** Names of the legal.contact fields that are still null (shown as pending on the legal pages). */
export function missingLegalContact(): string[] {
  return Object.entries(legal.contact).filter(([, value]) => value === null).map(([key]) => `legal.contact.${key}`);
}
