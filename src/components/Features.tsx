import { features, match, story } from '../content';
import '../styles/sections/features.css';

const Check = () => (
  <svg className="fx-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
);

/** Card 1: a profile, the way a club or an athlete fills it in. */
function ProfilePicture() {
  return (
    <div className="fx-ui">
      <p className="fx-bar"><span>{features.profile.title}</span></p>
      <div className="fx-who">
        <span className="fx-disc">L</span>
        <span><b>{match.athlete.name}</b><small>{match.athlete.role}</small></span>
      </div>
      <dl className="fx-rows">
        {features.profile.rows.map((r) => (
          <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>
        ))}
      </dl>
    </div>
  );
}

/** Card 2: the list of suggestions, each pair with how many of the four criteria match. */
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

/** Card 3: one match, with the criteria both sides can see before anyone writes. */
function MatchPicture() {
  return (
    <div className="fx-ui">
      <p className="fx-bar"><span>{features.match.title}</span></p>
      <div className="fx-duo">
        <span className="fx-who"><span className="fx-disc">L</span><span><b>Mountainbikerin</b><small>{match.athlete.meta}</small></span></span>
        <span className="fx-who"><span className="fx-disc fx-disc-f">{match.sponsor.mark}</span><span><b>{match.sponsor.name}</b><small>{match.sponsor.meta}</small></span></span>
      </div>
      <ul className="fx-criteria" role="list">
        {match.criteria.map((c) => <li key={c}><Check />{c}</li>)}
      </ul>
      <p className="fx-result">{match.result}</p>
      <p className="fx-agreed"><Check />{features.match.agreed}</p>
    </div>
  );
}

const PICTURES = [ProfilePicture, ListPicture, MatchPicture];

/**
 * «Mit Sponsuno» on Tintenblau: three cards, each a small product picture (Hafer panel on Tinte 2) above one of the
 * story steps (content.ts → story.steps). Mobbin references: Cursor and Linear feature cards. The pictures are
 * aria-hidden; their text says the same in words. One "Beispieldaten" caption for all three (copy rule 6).
 */
export function Features() {
  return (
    <section className="section surface-graphit fx" id="mit-sponsuno" aria-labelledby="fx-title" data-header-dark="">
      <div className="container">
        <div className="section-head" data-reveal="" data-scroll="rise">
          <p className="label">{features.label}</p>
          <h2 id="fx-title">{features.title}</h2>
          <p className="section-intro">{features.intro}</p>
        </div>
        <ul className="fx-grid" role="list" data-scroll-stagger="">
          {story.steps.map((step, i) => {
            const Picture = PICTURES[i];
            return (
              <li className="fx-card" key={step.title} data-reveal="" data-scroll="rise">
                <div className="fx-picture" aria-hidden="true"><Picture /></div>
                <div className="fx-text">
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="fx-caption">{features.caption}</p>
      </div>
    </section>
  );
}
