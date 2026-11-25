import { features, match, story } from '../content';
import '../styles/sections/features.css';

/** The one picture (simpler since 2026-11-25, owner: "more simplistic"): two sides, one line between them, and how
    many of the four criteria match. No app chrome. Example data (match in content.ts). */
function MatchPicture() {
  return (
    <div className="fx-match">
      <div className="fx-sides">
        <div className="fx-side">
          <span className="fx-sq">M</span>
          <b>{features.seekerName}</b>
          <small>{match.athlete.meta}</small>
        </div>
        <span className="fx-link" />
        <div className="fx-side">
          <span className="fx-sq fx-sq-f">{match.sponsor.mark}</span>
          <b>{match.sponsor.name}</b>
          <small>{match.sponsor.meta}</small>
        </div>
      </div>
      <p className="fx-score">{features.score}</p>
      <ul className="fx-criteria" role="list">
        {match.criteria.map((c) => <li key={c}>{c}</li>)}
      </ul>
    </div>
  );
}

/**
 * «Mit Sponsuno» on Tintenblau (simpler since 2026-11-25, owner: "simpler and cleaner"): two columns. Left the head
 * and the three story steps (content.ts → story.steps) under thin pitch lines, right one simple picture: two sides, one
 * line, «4 von 4» and the four criteria. The picture is aria-hidden; the steps say the same in words.
 * One "Beispieldaten" caption under it (copy rule 6).
 */
export function Features() {
  return (
    <section className="section surface-graphit fx" id="mit-sponsuno" aria-labelledby="fx-title" data-header-dark="">
      <div className="container fx-grid">
        <div className="fx-copy">
          <div data-reveal="" data-scroll="rise">
            <p className="label">{features.label}</p>
            <h2 id="fx-title">{features.title}</h2>
            <p className="section-intro">{features.intro}</p>
          </div>
          <ul className="fx-steps" role="list" data-scroll-stagger="">
            {story.steps.map((step) => (
              <li className="fx-step" key={step.title} data-reveal="" data-scroll="rise">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <figure className="fx-figure" data-reveal="" data-scroll="rise">
          <div aria-hidden="true"><MatchPicture /></div>
          <figcaption className="fx-caption">{features.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
