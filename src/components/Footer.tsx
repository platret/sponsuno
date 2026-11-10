import { footer, legal } from '../content';
import { siteHref } from '../lib/links';
import wordmark from '../assets/wordmark-light.svg';
import '../styles/sections/footer.css';

// Kontakt column: the e-mail address as visible text (a mailto link) and the town of the postal address
// ('8406 Winterthur' -> 'Winterthur'). Missing fields are left out; without both the column is not shown.
const CONTACT_EMAIL = legal.contact.email;
const CONTACT_TOWN = legal.contact.postalAddress?.find((line) => /^\d{4}\s/.test(line))?.replace(/^\d{4}\s+/, '') ?? null;

type FooterProps = {
  /** false on sub-pages (legal pages and guides): section links then lead back to the landing page */
  onLanding?: boolean;
  /** Page path of the current page ('impressum/'), marked with aria-current */
  current?: string;
};

/**
 * Navy closing block. On the landing page it continues the waitlist without a seam; on sub-pages it
 * stands alone (ft-standalone). Ends on the logotype and the legal row.
 */
export function Footer({ onLanding = true, current }: FooterProps) {
  return (
    <footer className={`ft${onLanding ? '' : ' ft-standalone'}`}>
      <div className="container">
        <div className="ft-top" data-reveal="" data-scroll="rise">
          <p className="ft-sub">{footer.sub}</p>
          <nav className="ft-cols" aria-label="Fusszeile">
            {footer.columns.map((col, i) => (
              <div className="ft-col" key={col.title}>
                <p className="ft-head" id={`ft-head-${i}`}>{col.title}</p>
                <ul aria-labelledby={`ft-head-${i}`}>
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <a
                        className="ft-link"
                        href={siteHref(link.href, onLanding)}
                        aria-current={current === link.href ? 'page' : undefined}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {(CONTACT_EMAIL || CONTACT_TOWN) && (
              <div className="ft-col">
                <p className="ft-head" id="ft-head-contact">{footer.contactTitle}</p>
                <ul aria-labelledby="ft-head-contact">
                  {CONTACT_EMAIL && (
                    <li><a className="ft-link ft-mail" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
                  )}
                  {CONTACT_TOWN && <li className="ft-text">{CONTACT_TOWN}</li>}
                </ul>
              </div>
            )}
          </nav>
        </div>

        <img className="ft-wordmark" src={wordmark} alt="Sponsuno" width={600} height={152} loading="lazy" decoding="async" data-reveal="" data-scroll="zoom-in" />

        <div className="ft-bottom">
          <p>{footer.copyright}</p>
          {/* The audience photos are on the landing page only, so only its footer names them */}
          {onLanding && (
            <p>
              {footer.photoNote.before}
              <a href={siteHref(footer.photoNote.href, onLanding)}>{footer.photoNote.link}</a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
