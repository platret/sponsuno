import { faq } from '../content';
import { siteHref } from '../lib/links';
import '../styles/sections/faq.css';

/** Questions as native <details> rows: no JS, keyboard and screen reader support built in. */
export function Faq() {
  return (
    <section className="section surface-paper" id="fragen" aria-labelledby="fragen-title">
      <div className="container faq-grid">
        <div className="faq-head" data-reveal="" data-scroll="rise">
          <h2 id="fragen-title">{faq.title}</h2>
          <p className="section-intro faq-intro">
            {faq.introBefore}<a href="#warteliste">{faq.introLink}</a>{faq.introAfter}
          </p>
          <nav className="faq-guides" aria-labelledby="faq-guides-label">
            <span id="faq-guides-label">{faq.guidesLabel}</span>{' '}
            {faq.guides.map((guide, i) => (
              <span key={guide.href}>
                {i > 0 && <span aria-hidden="true"> · </span>}
                <a href={siteHref(guide.href, true)}>{guide.label}</a>
              </span>
            ))}
          </nav>
        </div>
        <div className="faq-list" data-reveal="" data-scroll="group">
          {faq.items.map((item) => (
            <details className="faq-item" data-scroll="rise" key={item.q}>
              <summary className="faq-q">
                <span className="faq-q-text">{item.q}</span>
                <span className="faq-icon" aria-hidden="true" />
              </summary>
              <div className="faq-a">
                <p>{item.a}</p>
                {item.link && <p className="faq-more"><a href={siteHref(item.link.href, true)}>{item.link.label}</a></p>}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
