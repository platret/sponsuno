import { contact, faq } from '../content';
import { siteHref, waitlistHref, WAITLIST_ENDPOINT } from '../lib/links';
import '../styles/sections/faq.css';

/** The body of /fragen/: the questions as native <details> rows (no JS, keyboard and screen reader support built
    in), in one column under the page head band (title = the page's H1, intro and guide links: FaqIntro). The answers
    also feed the FAQPage JSON-LD of that page (entry-server.tsx). */
// While the waitlist stores nothing, "tell us on the waitlist" would be a promise we cannot keep: offer the e-mail instead
// (same switch as the waitlist intro). Without a contact address no intro is shown.
const CONTACT = contact.email;

/** Intro and guide links of /fragen/, under the H1 in the page head band (InfoPage → PageBand) */
export function FaqIntro() {
  return (
    <>
      {WAITLIST_ENDPOINT ? (
        <p className="section-intro faq-intro">
          {faq.introBefore}<a href={waitlistHref()}>{faq.introLink}</a>{faq.introAfter}
        </p>
      ) : CONTACT ? (
        <p className="section-intro faq-intro">
          {faq.previewIntroBefore}<a href={`mailto:${CONTACT}`}>{CONTACT}</a>{faq.previewIntroAfter}
        </p>
      ) : null}
      <nav className="faq-guides" aria-labelledby="faq-guides-label">
        <span id="faq-guides-label">{faq.guidesLabel}</span>{' '}
        {faq.guides.map((guide, i) => (
          <span key={guide.href}>
            {i > 0 && <span aria-hidden="true"> · </span>}
            <a href={siteHref(guide.href, false)}>{guide.label}</a>
          </span>
        ))}
      </nav>
    </>
  );
}

export function Faq() {
  return (
    <section className="section surface-paper" id="fragen" aria-labelledby="fragen-title">
      <div className="container">
        <div className="faq-list" data-reveal="" data-scroll="group">
          {faq.items.map((item) => (
            <details className="faq-item" data-scroll="rise" key={item.q}>
              <summary className="faq-q">
                <span className="faq-q-text">{item.q}</span>
                <span className="faq-icon" aria-hidden="true" />
              </summary>
              <div className="faq-a">
                <p>{item.a}</p>
                {item.link && <p className="faq-more"><a href={siteHref(item.link.href, false)}>{item.link.label}</a></p>}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
