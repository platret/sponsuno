import type { ReactNode } from 'react';
import { cta, legal, menu, nav, type Role } from '../content';
import type { PageKind } from '../pages';
import { navCurrent, pageHref, siteHref, waitlistHref } from '../lib/links';
import wordmarkLight from '../assets/wordmark-light.svg';
import { Icon } from './kit/Icon';
import { Sticker, type StickerId } from './kit/Sticker';
import '../styles/sections/legal.css';

type PageHeaderProps = {
  /** The current page: marks its nav item with aria-current */
  current: { path: string; kind: PageKind };
  /** Role preselected by the waitlist button (default: the form's default role) */
  role?: Role;
};

/**
 * Skip link and slim ink header of the static pages (topic pages, guides, legal pages, 404): the parquet wordmark, the
 * same nav as the landing page header (content.ts → nav) and the yellow waitlist button. Ink (.surface-tinte);
 * PageBand continues it with the H1 and the court lines. No JavaScript: below 961 px the nav sits in a native <details>
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
      <header className="lg-header surface-tinte" id="top">
        <div className="container lg-header-inner">
          <a className="lg-brand" href={pageHref('')} aria-label={legal.homeLabel}>
            <img src={wordmarkLight} alt="" width={141} height={24} />
          </a>
          <nav className="lg-nav" aria-label="Hauptnavigation">
            <ul>{links}</ul>
          </nav>
          <div className="lg-actions">
            <a className="btn btn-sm btn-gelb lg-cta" href={waitlistHref(role)}>
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
  /** The one small sticker of the page (72 px at most, never collectable): on the centre spot of the band's court
      lines, half over the band's lower edge. Decorative. Default: the ball (the parked guides and /fuer-firmen/
      pass none). */
  sticker?: StickerId;
  /** The sticker is missing: only its dashed album slot is shown (the 404 page) */
  missing?: boolean;
  /** A green check badge above the H1 (the confirmation page). Decorative: the title says it. */
  done?: boolean;
  /** Intro, note … under the H1 */
  children?: ReactNode;
};

/**
 * Page head band of the static pages, the first child of <main>: the H1 and its intro on ink, right under the ink
 * header (legal.css → .lg-band). The title starts in column 1. On the right, a piece of the hall floor: the centre
 * circle rising from the band's lower edge (parquet line), the halfway line through it (yellow) and one small sticker
 * on the centre spot, half on the page below. It is the only sticker of a static page. All of it is decoration
 * (aria-hidden). The lines draw once on load and the sticker settles, in CSS only (these pages ship no script); with
 * reduced motion everything stands still.
 */
export function PageBand({ titleId, title, narrow = false, eyebrow, sticker = 'ball', missing = false, done = false, children }: PageBandProps) {
  return (
    <div className="lg-band surface-tinte">
      <div className="lg-band-art" aria-hidden="true">
        {/* Both lines keep the rule of kit/CourtLines.tsx: with a stroke that does not scale, Chromium sizes the dash
            of the draw animation in user units but lays it out in px, so a path must never be shorter in units than
            on screen. The arc is drawn in 300 units for a box of at most 288 px (legal.css: twice --r, 9rem at
            most); the halfway line is a <line> in an svg without a viewBox (one unit is one px). */}
        <svg className="cl lg-band-arc" viewBox="-150 -150 300 150" focusable="false">
          <path className="cl-path" data-line="hell" d="M-146 6V0A146 146 0 0 1 146 0V6" pathLength={1} />
        </svg>
        <svg className="cl lg-band-line" focusable="false">
          <line className="cl-path" data-line="gelb" x1="50%" y1="-4%" x2="50%" y2="104%" pathLength={1} />
        </svg>
      </div>
      <Sticker
        id={sticker}
        size={72}
        rotate={missing ? 0 : -6}
        collectable={false}
        className={missing ? 'lg-band-stk lg-band-slot' : 'lg-band-stk'}
        data-collected={missing ? '' : undefined}
      />
      <div className="container">
        <div className={narrow ? 'lg-band-inner lg-band-narrow' : 'lg-band-inner'}>
          {done && <span className="lg-badge lg-badge-gruen lg-band-badge" aria-hidden="true"><Icon name="check" size={28} /></span>}
          {eyebrow && <p className="label lg-band-label">{eyebrow}</p>}
          <h1 id={titleId}>{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
