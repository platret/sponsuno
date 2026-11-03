import { footer } from '../content';
import wordmark from '../assets/wordmark-light.svg';
import '../styles/sections/footer.css';

// Proposed as footer.legalNote in content.ts; local until it lands there.

/** Navy closing block, part two: continues the waitlist without a seam and ends on the logotype. */
export function Footer() {
  return (
    <footer className="ft">
      <div className="container">
        <div className="ft-top">
          <p className="ft-sub">{footer.sub}</p>
          <nav className="ft-cols" aria-label="Fusszeile">
            {footer.columns.map((col, i) => (
              <div className="ft-col" key={col.title}>
                <p className="ft-head" id={`ft-head-${i}`}>{col.title}</p>
                <ul aria-labelledby={`ft-head-${i}`}>
                  {col.links.map((link) => (
                    <li key={link.href}><a className="ft-link" href={link.href}>{link.label}</a></li>
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
          <p className="ft-legal">{footer.legalNote}</p>
        </div>
      </div>
    </footer>
  );
}
