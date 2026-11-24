import { features, match, story } from '../content';
import '../styles/sections/features.css';

/** The one product picture: the list of suggestions, each pair with how many of the four criteria match. */
function ListPicture() {
  return (
    <div className="fx-ui">
      <p className="fx-bar"><span>{features.list.title}</span><span className="fx-tab">{features.list.tab}</span></p>
      <ul className="fx-list" role="list">
        {story.pairs.slice(0, 4).map((p) => (
          <li key={p.seeker.name}>
            <span className="fx-pair"><span className="fx-disc">{p.seeker.mark}</span><span className="fx-disc fx-disc-f">{p.firm.mark}</span></span>
            <span className="fx-names"><b>{p.seeker.name} · {p.firm.name}</b><small>{p.region}</small></span>
            <span className="fx-score">
              <span className="fx-dots">{match.criteria.map((c, k) => <i key={c} className={k < p.score ? 'is-on' : undefined} />)}</span>
              {story.scoreShort(p.score)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * «Mit Sponsuno» on Tintenblau (simpler since 2026-11-25, owner: "simpler and cleaner"): two columns. Left the head
 * and the three story steps (content.ts → story.steps) under thin pitch lines, right one large product picture, the
 * list «Passende Partner», readable at its real size. The picture is aria-hidden; the steps say the same in words.
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
          <div aria-hidden="true"><ListPicture /></div>
          <figcaption className="fx-caption">{features.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
