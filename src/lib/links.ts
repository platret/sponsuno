// Base-aware links: links between pages are built from import.meta.env.BASE_URL instead of hardcoded paths.

import type { Role } from '../content';

const BASE = import.meta.env.BASE_URL;

/** Absolute href for a page path relative to the site root: '' = landing page, 'kosten/', 'impressum/'. */
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

/** Props for links that leave the site (owner, 2026-11-25: external links open in a new tab, Sponsuno stays open).
    Pair them with newTabHint (content.ts) for screen readers. */
export const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** True for links that leave the site. */
export const isExternal = (href: string): boolean => /^https?:\/\//i.test(href);

/**
 * Where the waitlist posts sign-ups. Empty (production until the team sets up storage): the form stores nothing, and the
 * waitlist and FAQ intros offer an e-mail to contact.email (content.ts) instead. Read at build time, so prerendered pages match.
 */
export const WAITLIST_ENDPOINT = import.meta.env.VITE_WAITLIST_ENDPOINT?.trim() ?? '';

/** Query parameter that preselects a role in the landing page waitlist (read in App.tsx): /?rolle=sponsor#warteliste */
export const ROLE_PARAM = 'rolle';

/** Link to the landing page waitlist from another page, optionally with a preselected role. */
export const waitlistHref = (role?: Role): string => `${BASE}${role ? `?${ROLE_PARAM}=${role}` : ''}#warteliste`;

/**
 * Old landing page anchors whose section no longer exists (Kosten moved out in November 2026 and was parked on
 * 2026-11-25). App.tsx sends an old link such as /#kosten on with location.replace, so shared links keep working. Keys are the old section ids. /#ki-manager is no
 * longer listed: its page is parked (pages.ts → parkedPages), so the old link simply opens the top of the homepage.
 */
export const MOVED_SECTIONS: Record<string, string> = {
  // Since 2026-11-25 the FAQ (#fragen) and the team (#team) are landing page sections again; the old cost anchors go
  // to the FAQ, which holds the cost question.
  kosten: '#fragen',
  sachleistungen: '#fragen',
};

/** aria-current for a main navigation item (content.ts → nav): 'page' on the page it links to. */
export function navCurrent(href: string, current?: { path: string }): 'page' | undefined {
  return current && href === current.path ? 'page' : undefined;
}
