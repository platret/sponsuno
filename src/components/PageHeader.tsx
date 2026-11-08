import { cta, legal, menu, nav, type Role } from '../content';
import type { PageKind } from '../pages';
import { navCurrent, pageHref, waitlistHref } from '../lib/links';
import wordmarkDark from '../assets/wordmark-dark.svg';
import '../styles/sections/legal.css';

type PageHeaderProps = {
  /** The current page: marks its nav item with aria-current */
  current: { path: string; kind: PageKind };
  /** Role preselected by the waitlist button (default: the form's default role) */
  role?: Role;
};

/**
 * Skip link and slim paper header of the static pages (topic pages, guides, legal pages): wordmark, the same nav as
 * the landing page header (content.ts → nav) and the waitlist button. No JavaScript: below 961 px the nav sits in a
 * native <details> menu that drops down under the bar.
 */
export function PageHeader({ current, role }: PageHeaderProps) {
  const links = nav.map((item) => (
    <li key={item.href}>
      <a href={pageHref(item.href)} aria-current={navCurrent(item.href, current)}>{item.label}</a>
    </li>
  ));

  return (
    <>
      <a className="skip-link" href="#inhalt">{legal.skipLink}</a>
      <header className="lg-header" id="top">
        <div className="container lg-header-inner">
          <a className="lg-brand" href={pageHref('')} aria-label={legal.homeLabel}>
            <img src={wordmarkDark} alt="" width={118} height={30} />
          </a>
          <nav className="lg-nav" aria-label="Hauptnavigation">
            <ul>{links}</ul>
          </nav>
          <a className="btn btn-sm btn-navy lg-cta" href={waitlistHref(role)}>
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
      </header>
    </>
  );
}
