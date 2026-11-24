import { problem, story } from '../content';
import '../styles/sections/problem.css';

/**
 * «Heute» on Hafer (replaces the scroll story of the Graphit site): the interview findings, word for word from
 * content.ts → problem, as three numbered columns under a thin rule (Mobbin references: Beside, Escape).
 * Keeps the id #problem, which old links and the header logic know.
 */
export function Problem() {
  return (
    <section className="section surface-paper pb" id="problem" aria-labelledby="pb-title">
      <div className="container">
        <div className="pb-head" data-reveal="" data-scroll="rise">
          <p className="label">{story.labels.heute}</p>
          <h2 id="pb-title">{problem.title}</h2>
          <p className="section-intro">{problem.intro}</p>
        </div>
        <ol className="pb-list" role="list" data-scroll-stagger="">
          {problem.items.map((item, i) => (
            <li className="pb-item" key={item.title} data-reveal="" data-scroll="rise">
              <span className="pb-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
