// Every prerendered page of the site, in one list. It drives:
// - the Vite inputs (vite.config.ts): each page needs a small HTML entry at `${path}index.html`
// - the <head> of each page (title, description, canonical, Open Graph, JSON-LD: headFor() in entry-server.tsx)
// - dist/sitemap.xml (entries with index: true; written by scripts/prerender.mjs)
// The not-found page (kind 'notfound') is the one exception to `${path}index.html`: its file is dist/404.html, which
// Cloudflare serves with status 404 for every unknown URL (wrangler.jsonc → assets.not_found_handling).
// Plain data without asset imports, so vite.config.ts can import it too. The demo (/demo/) is not listed:
// it is client-only, keeps its static noindex and stays out of the sitemap.
// Rule (AGENTS.md → SEO): every new page gets an entry here with its own title and description.

/** Canonical origin. Canonicals, og:url and the sitemap use absolute URLs on the apex with a trailing slash. */
export const SITE_URL = 'https://sponsuno.ch/';

export const site = {
  name: 'Sponsuno',
  locale: 'de_CH',
  language: 'de-CH',
  /** Share image (public/og-image.png, 1200 × 630, source scripts/og/og-image.html) */
  ogImage: `${SITE_URL}og-image.png`,
  ogImageAlt: 'Sponsuno: Sponsoren finden für Sport und Kultur. Bald verfügbar in der Deutschschweiz.',
  /** Organization logo for structured data (public/icon-512.png) */
  logo: `${SITE_URL}icon-512.png`,
};

/** home = landing page (hydrated); legal, guide and info = static pages without JavaScript (info: the topic pages
    reached from the header: Für Firmen, KI-Manager, Kosten, Fragen, Über uns); notfound = the 404 page (static,
    noindex, no canonical, no share tags) */
export type PageKind = 'home' | 'legal' | 'guide' | 'info' | 'notfound';

export type PageId =
  | 'home'
  | 'fuer-firmen'
  | 'ki-manager'
  | 'kosten'
  | 'fragen'
  | 'ueber-uns'
  | 'impressum'
  | 'datenschutz'
  | 'sponsoren-finden'
  | 'sponsoring-anfrage'
  | 'sponsoring-dossier'
  | 'kultursponsoring'
  | 'notfound';

export type PageMeta = {
  id: PageId;
  /** Path relative to the site root, with a trailing slash ('' = landing page). The not-found page has no URL of its
      own: its path is its file name, '404.html' (see htmlFile) */
  path: string;
  /** <title>; keep it under about 60 characters so it is not cut off on phones */
  title: string;
  /** Meta description, about 120 to 160 characters */
  description: string;
  /** Title for social previews when it should differ from <title> */
  ogTitle?: string;
  kind: PageKind;
  /** Topic pages only: scroll motion on (html.scroll-fx set by an inline script in the head, see headFor). Only where
      nothing in the first screen at load starts half-animated; today /ki-manager/ (the pinned bento) */
  scrollFx?: true;
  /** false = left out of the sitemap */
  index: boolean;
};

export const pages: PageMeta[] = [
  {
    id: 'home',
    path: '',
    title: 'Sponsuno – Sponsoren finden für Sport und Kultur',
    description: 'Sponsuno bringt Sportlerinnen, Sportler, Sport- und Kulturvereine mit passenden Sponsoren aus ihrer Region zusammen. Bald in der Deutschschweiz.',
    kind: 'home',
    index: true,
  },
  {
    id: 'fuer-firmen',
    path: 'fuer-firmen/',
    title: 'Sponsoring für Firmen aus der Region | Sponsuno',
    description: 'Für Gewerbe und KMU: Mit Sponsuno finden Firmen Sportlerinnen, Sportler, Sport- und Kulturvereine aus der Region, die passen. Bald in der Deutschschweiz.',
    kind: 'info',
    index: true,
  },
  {
    id: 'ki-manager',
    path: 'ki-manager/',
    title: 'Der KI-Sponsoringmanager von Sponsuno',
    description: 'Der KI-Manager von Sponsuno entwirft Anfragen, erinnert an Termine und behält Gegenleistungen im Blick. Bald verfügbar in der Deutschschweiz.',
    kind: 'info',
    scrollFx: true,
    index: true,
  },
  {
    id: 'kosten',
    path: 'kosten/',
    title: 'Kosten: Provision statt Abo | Sponsuno',
    description: 'Kein Abo, keine Grundgebühr: Sponsuno arbeitet mit einer Provision, wenn eine Partnerschaft zustande kommt. Die Konditionen folgen vor dem Start.',
    kind: 'info',
    index: true,
  },
  {
    id: 'fragen',
    path: 'fragen/',
    title: 'Fragen und Antworten zu Sponsuno',
    description: 'Antworten auf häufige Fragen zu Sponsuno: Provision, interessierte Firmen, Aufwand, Gegenleistungen, für wen Sponsuno ist und wann es losgeht.',
    kind: 'info',
    index: true,
  },
  {
    id: 'ueber-uns',
    path: 'ueber-uns/',
    title: 'Über uns: das Team hinter Sponsuno',
    description: 'Das Team hinter Sponsuno: vier Personen, ihre Aufgaben im Team und der aktuelle Stand des Projekts, von den ersten Gesprächen bis zu den nächsten Schritten.',
    kind: 'info',
    index: true,
  },
  {
    id: 'sponsoren-finden',
    path: 'sponsoren-finden/',
    title: 'Sponsoren finden für Vereine, Sportlerinnen und Sportler',
    description: 'Sponsoren finden in der Schweiz: wie Sportlerinnen, Sportler, Sport- und Kulturvereine Firmen aus ihrer Region auswählen, ansprechen und als Partner behalten.',
    kind: 'guide',
    index: true,
  },
  {
    id: 'sponsoring-anfrage',
    path: 'sponsoring-anfrage/',
    title: 'Sponsoring-Anfrage schreiben: Muster und Tipps | Sponsuno',
    description: 'Sponsoring-Anfrage für Verein, Sportlerin oder Sportler: Aufbau, ein Musterbrief zum Anpassen und Tipps für Anfragen an Firmen in der Schweiz.',
    kind: 'guide',
    index: true,
  },
  {
    id: 'sponsoring-dossier',
    path: 'sponsoring-dossier/',
    title: 'Sponsoring-Dossier erstellen: Aufbau und Inhalt | Sponsuno',
    description: 'Was in ein Sponsoring-Dossier gehört: Aufbau Seite für Seite, Sponsoringpakete und Gegenleistungen, für Sportlerinnen, Sportler, Sport- und Kulturvereine.',
    kind: 'guide',
    index: true,
  },
  {
    id: 'kultursponsoring',
    path: 'kultursponsoring/',
    title: 'Kultursponsoring: Sponsoren für Chor, Musikverein, Theater',
    description: 'Sponsoren finden für Chor, Musikgesellschaft, Theaterverein oder Band: welche Firmen in Frage kommen, mögliche Gegenleistungen und wie Sie anfragen.',
    kind: 'guide',
    index: true,
  },
  {
    id: 'impressum',
    path: 'impressum/',
    title: 'Impressum – Sponsuno',
    description: 'Impressum der Website sponsuno.ch: verantwortliche Personen, Kontakt, Hinweise zum Inhalt, Haftungsausschluss und Bildnachweise.',
    kind: 'legal',
    index: true,
  },
  {
    id: 'datenschutz',
    path: 'datenschutz/',
    title: 'Datenschutzerklärung – Sponsuno',
    description: 'Datenschutzerklärung von Sponsuno: welche Daten beim Besuch der Website bearbeitet werden, Hosting bei Cloudflare, keine Cookies, kein Tracking, Ihre Rechte.',
    kind: 'legal',
    index: true,
  },
  {
    // Served by Cloudflare with status 404 for any unknown URL. Not in the sitemap, noindex, no canonical (headFor).
    // The description is never output (headFor gives this page only the robots noindex); PageMeta just requires one.
    id: 'notfound',
    path: '404.html',
    title: 'Seite nicht gefunden – Sponsuno',
    description: 'Diese Seite gibt es auf sponsuno.ch nicht (mehr).',
    kind: 'notfound',
    index: false,
  },
];

/** HTML file of a page, relative to the project root (Vite entry) and to dist/: `${path}index.html`, or 404.html. */
export const htmlFile = (page: PageMeta): string => (page.kind === 'notfound' ? page.path : `${page.path}index.html`);

/** Absolute canonical URL of a page path ('' → https://sponsuno.ch/). */
export const absoluteUrl = (path: string): string => `${SITE_URL}${path}`;

export function pageMeta(id: PageId): PageMeta {
  const page = pages.find((p) => p.id === id);
  if (!page) throw new Error(`Unknown page id: ${id}`);
  return page;
}
