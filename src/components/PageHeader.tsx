import { legal } from '../content';
import { pageHref } from '../lib/links';
import wordmarkDark from '../assets/wordmark-dark.svg';
import '../styles/sections/legal.css';

/** Skip link and slim paper header of the static pages (legal pages and guides): wordmark and "Zur Startseite". */
export function PageHeader() {
  return (
    <>
      <a className="skip-link" href="#inhalt">{legal.skipLink}</a>
      <header className="lg-header" id="top">
        <div className="container lg-header-inner">
          <a className="lg-brand" href={pageHref('')} aria-label={legal.homeLabel}>
            <img src={wordmarkDark} alt="" width={118} height={30} />
          </a>
          <a className="lg-home" href={pageHref('')}>{legal.backHome}</a>
        </div>
      </header>
    </>
  );
}
