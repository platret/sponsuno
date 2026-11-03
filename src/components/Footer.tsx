import { footer } from '../content';
import { siteHref } from '../lib/links';
import wordmark from '../assets/wordmark-light.svg';
import '../styles/sections/footer.css';

type FooterProps = {
  /** false on sub-pages (Impressum, Datenschutz): section links then lead back to the landing page */
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
        <div className="ft-top">
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
          </nav>
        </div>

        <img className="ft-wordmark" src={wordmark} alt="Sponsuno" width={600} height={152} loading="lazy" decoding="async" data-reveal="" />

        <div className="ft-bottom">
          <p>{footer.copyright}</p>
          <p>{footer.program}</p>
        </div>
      </div>
    </footer>
  );
}
