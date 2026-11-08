// Base-aware links: links between pages are built from import.meta.env.BASE_URL instead of hardcoded paths.

import type { Role } from '../content';
import { pageMeta, type PageKind } from '../pages';

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

/** Query parameter that preselects a role in the landing page waitlist (read in App.tsx): /?rolle=sponsor#warteliste */
export const ROLE_PARAM = 'rolle';

/** Link to the landing page waitlist from another page, optionally with a preselected role. */
export const waitlistHref = (role?: Role): string => `${BASE}${role ? `?${ROLE_PARAM}=${role}` : ''}#warteliste`;

/**
 * Sections that moved from the landing page to their own page (November 2026). App.tsx sends an old link such as
 * /#kosten there with location.replace, so shared links keep working. Keys are the old section ids.
 */
export const MOVED_SECTIONS: Record<string, string> = {
  'ki-manager': pageMeta('ki-manager').path,
  kosten: pageMeta('kosten').path,
  sachleistungen: `${pageMeta('kosten').path}#sachleistungen`,
  fragen: pageMeta('fragen').path,
  team: pageMeta('ueber-uns').path,
};

/**
 * aria-current for a main navigation item (content.ts → nav): 'page' on the page it links to; 'true' for
 * "Ratgeber" (the first guide) on the other guides, so the section stays marked.
 */
export function navCurrent(href: string, current?: { path: string; kind: PageKind }): 'page' | 'true' | undefined {
  if (!current) return undefined;
  if (href === current.path) return 'page';
  if (current.kind === 'guide' && href === pageMeta('sponsoren-finden').path) return 'true';
  return undefined;
}
