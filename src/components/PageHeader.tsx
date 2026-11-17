import type { ReactNode } from 'react';
import { cta, legal, menu, nav, type Role } from '../content';
import type { PageKind } from '../pages';
import { navCurrent, pageHref, siteHref, waitlistHref } from '../lib/links';
import wordmarkLight from '../assets/wordmark-light.svg';
import '../styles/sections/legal.css';

type PageHeaderProps = {
  /** The current page: marks its nav item with aria-current */
  current: { path: string; kind: PageKind };
  /** Role preselected by the waitlist button (default: the form's default role) */
  role?: Role;
};

/**
 * Skip link and slim graphit header of the static pages (topic pages, guides, legal pages, 404): wordmark, the same nav
 * as the landing page header (content.ts → nav) and the waitlist button. Graphit by design, so every page opens like
 * the landing page; PageBand continues it with the H1. No JavaScript: below 961 px the nav sits in a native <details>
 * menu that drops down under the bar.
 */
export function PageHeader({ current, role }: PageHeaderProps) {
  const links = nav.map((item) => (
    <li key={item.href}>
      <a href={siteHref(item.href, false)} aria-current={navCurrent(item.href, current)}>{item.label}</a>
    </li>
  ));

  return (
    <>
      <a className="skip-link" href="#inhalt">{legal.skipLink}</a>
      <header className="lg-header" id="top">
        <div className="container lg-header-inner">
          <a className="lg-brand" href={pageHref('')} aria-label={legal.homeLabel}>
            <img src={wordmarkLight} alt="" width={141} height={24} />
          </a>
          <nav className="lg-nav" aria-label="Hauptnavigation">
            <ul>{links}</ul>
          </nav>
          <div className="lg-actions">
            <a className="btn btn-sm btn-brass lg-cta" href={waitlistHref(role)}>
              <span className="lg-cta-long">{cta.waitlist}</span>
              <span className="lg-cta-short">{cta.waitlistShort}</span>
            </a>
            <details className="lg-menu">
              <summary>
                <span className="visually-hidden">{menu.label}</span>
                <span className="lg-menu-bars" aria-hidden="true" />
              </summary>
              <nav className="lg-menu-sheet" aria-label={menu.label}>
                <ul>{links}</ul>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}

type PageBandProps = {
  /** id of the H1 (sections and articles below point their aria-labelledby at it) */
  titleId: string;
  title: string;
  /** Reading-column pages (legal pages, guides, Für Firmen, 404): the band text keeps to the reading column's 42rem */
  narrow?: boolean;
  /** Short line above the H1, set as a label (legal pages and guides: the date of the text, the byline) */
  eyebrow?: ReactNode;
  /** Intro, note … under the H1 */
  children?: ReactNode;
};

/**
 * Page head band of the static pages, the first child of <main>: the H1 and its intro on graphit, right under the graphit
 * header (legal.css → .lg-band). Starts in column 1 like every title; calm: no picture, no motion.
 */
export function PageBand({ titleId, title, narrow = false, eyebrow, children }: PageBandProps) {
  return (
    <div className="lg-band">
      <div className="container">
        <div className={narrow ? 'lg-band-inner lg-band-narrow' : 'lg-band-inner'}>
          {eyebrow && <p className="label lg-band-label">{eyebrow}</p>}
          <h1 id={titleId}>{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
