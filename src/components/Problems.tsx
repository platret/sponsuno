import { problem } from '../content';
import '../styles/sections/problems.css';

/** Ivory section: what interviewees told us, as three points beside the heading (not a sequence, so no numerals).
    Scroll motion: head and points rise, the hairlines between the points draw from the left (problems.css). */
export function Problems() {
  return (
    <section className="prob section surface-ivory" id="problem" aria-labelledby="problem-title">
      <div className="container prob-grid">
        <div className="prob-head" data-reveal="" data-scroll="rise">
          <h2 id="problem-title">{problem.title}</h2>
          <p className="section-intro">{problem.intro}</p>
        </div>
        <ul className="prob-list" role="list">
          {problem.items.map((item) => (
            <li className="prob-item" key={item.title} data-reveal="" data-scroll="rise">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
