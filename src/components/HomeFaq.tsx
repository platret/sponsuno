import { homeFaq } from '../content';
import { pageMeta } from '../pages';
import { pageHref } from '../lib/links';
import '../styles/sections/home-faq.css';

/** Landing page FAQ (2026-11-25): the head on the left, four questions on the right as native <details> rows under
    thin rules, then the link to /fragen/. Same two-column rhythm as «Heute». No JS. */
export function HomeFaq() {
  return (
    <section className="section surface-kalk hf" aria-labelledby="hf-title">
      <div className="container hf-grid">
        <div className="hf-head" data-reveal="" data-scroll="rise">
          <h2 id="hf-title">{homeFaq.title}</h2>
          <a className="link-arrow hf-more" href={pageHref(pageMeta('fragen').path)}>
            {homeFaq.link}
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </a>
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
