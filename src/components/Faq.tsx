import { faq } from '../content';
import '../styles/sections/faq.css';

/** Questions as native <details> rows: no JS, keyboard and screen reader support built in. */
export function Faq() {
  return (
    <section className="section surface-paper" id="fragen" aria-labelledby="fragen-title">
      <div className="container faq-grid">
        <div className="faq-head" data-reveal="">
          <h2 id="fragen-title">{faq.title}</h2>
          <p className="section-intro faq-intro">
            {faq.introBefore}<a href="#warteliste">{faq.introLink}</a>{faq.introAfter}
          </p>
        </div>
        <div className="faq-list" data-reveal="">
          {faq.items.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary className="faq-q">
                <span className="faq-q-text">{item.q}</span>
                <span className="faq-icon" aria-hidden="true" />
              </summary>
              <div className="faq-a">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
