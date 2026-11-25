import { homeFaq } from '../content';
import '../styles/sections/home-faq.css';

/** Landing page FAQ (#fragen, 2026-11-25; the header, the footer and old /fragen/ links lead here): the title on the
    left (sticky on wide screens), all questions on the right as native <details> rows under thin rules. Same
    two-column rhythm as «Heute». No JS. The FAQPage JSON-LD of the landing page is built from the same list. */
export function HomeFaq() {
  return (
    <section className="section surface-kalk hf" id="fragen" aria-labelledby="hf-title">
      <div className="container hf-grid">
        <div className="hf-head" data-reveal="" data-scroll="rise">
          <h2 id="hf-title">{homeFaq.title}</h2>
        </div>
        <div className="hf-list" data-reveal="" data-scroll="rise">
          {homeFaq.items.map((item) => (
            <details className="hf-item" key={item.q}>
              <summary className="hf-q">
                <span>{item.q}</span>
                <span className="hf-icon" aria-hidden="true" />
              </summary>
              <p className="hf-a">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
