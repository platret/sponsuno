// Base-aware links. The site is served under a base path (/sponsuno/ on GitHub Pages, see vite.config.ts),
// so links between pages are built from import.meta.env.BASE_URL instead of hardcoded paths.

const BASE = import.meta.env.BASE_URL;

/** Absolute href for a page path relative to the site root: '' = landing page, 'demo/', 'impressum/'. */
export const pageHref = (path: string): string => `${BASE}${path}`;

/**
 * Href for a site link from content.ts ('#id' = section of the landing page, 'path/' = page).
 * On the landing page anchors stay plain ('#ablauf') so App.tsx can scroll them below the fixed header;
 * on other pages they point back to the landing page. '#top' always stays on the current page.
 */
export function siteHref(href: string, onLanding: boolean): string {
  if (href.startsWith('#')) return onLanding || href === '#top' ? href : `${BASE}${href}`;
  if (/^[a-z]+:/i.test(href)) return href;
  return pageHref(href);
}

/** True for links that leave the site. */
export const isExternal = (href: string): boolean => /^https?:\/\//i.test(href);
