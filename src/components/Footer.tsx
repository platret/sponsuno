import { contact, footer } from '../content';
import { siteHref } from '../lib/links';
import wordmark from '../assets/wordmark-light.svg';
import { Album } from './Album';
import { Sticker } from './kit/Sticker';
import '../styles/sections/footer.css';

// Kontakt column: the e-mail address as visible text (a mailto link) and the town of the postal address
// ('8406 Winterthur' -> 'Winterthur'), with the LinkedIn company page between them. Missing fields are left out; without both the column is not shown.
const CONTACT_EMAIL = contact.email;
const CONTACT_TOWN = contact.postalAddress?.find((line) => /^\d{4}\s/.test(line))?.replace(/^\d{4}\s+/, '') ?? null;

type FooterProps = {
  /** false on sub-pages (legal pages and guides): section links then lead back to the landing page */
  onLanding?: boolean;
  /** Page path of the current page ('impressum/'), marked with aria-current */
  current?: string;
};

/**
 * Ink closing block of every page (.surface-tinte): the claim and the link columns, the sticker album with the whistle
 * sticker beside it (landing page only), the giant loop wordmark in parquet and the copyright row. On the landing page it follows the yellow waitlist band; on
 * sub-pages it stands alone (ft-standalone). `data-header-dark` turns the landing header ink while the footer runs
 * under it.
 */
export function Footer({ onLanding = true, current }: FooterProps) {
  return (
    <footer className={`ft surface-tinte${onLanding ? '' : ' ft-standalone'}`} data-header-dark="">
      <div className="container">
        <div className="ft-top" data-reveal="" data-scroll="rise">
          <p className="ft-sub">{footer.sub}</p>
          <nav className="ft-cols" aria-label="Fusszeile">
            {footer.columns.map((col, i) => (
              <div className="ft-col" key={col.title}>
                <p className="ft-head label" id={`ft-head-${i}`}>{col.title}</p>
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
                <p className="ft-head label" id="ft-head-contact">{footer.contactTitle}</p>
                <ul aria-labelledby="ft-head-contact">
                  {CONTACT_EMAIL && (
                    <li><a className="ft-link ft-mail" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
                  )}
                  {contact.linkedin && <li><a className="ft-link" href={contact.linkedin}>LinkedIn</a></li>}
                  {CONTACT_TOWN && <li className="ft-text">{CONTACT_TOWN}</li>}
                </ul>
              </div>
            )}
          </nav>
        </div>

        {/* Sticker album (Easter egg, landing page only: the stickers are there). One quiet row under a hairline:
            the album, prerendered with six empty slots (the lazy chunk lib/eggs.ts fills it), and beside it the one
            sticker of the footer, the whistle: it counts for the album, so the row shows how the album works.
            Decoration: both are aria-hidden and hold nothing focusable. */}
        {onLanding && (
          <div className="ft-album">
            <Album />
            <Sticker id="pfeife" size={72} rotate={-8} className="ft-stk" data-reveal="" />
          </div>
        )}

        {/* The wrapper carries the scroll motion and is the frame the Easter-egg chunk works in (a click on the loop
            makes the last «o» bounce); the image and its geometry stay untouched. */}
        <div className="ft-wordmark" data-wordmark="" data-reveal="" data-scroll="zoom-in">
          <img src={wordmark} alt="Sponsuno" width={612} height={104} loading="lazy" decoding="async" />
        </div>

        <div className="ft-bottom">
          <p>{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
