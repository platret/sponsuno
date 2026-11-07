import photo from '../assets/photos/mtb-athlete-192.jpg';
import type { CSSProperties } from 'react';
import { match } from '../content';

/**
 * The fictional match (mountain biker and bike shop, four criteria, "Passt in 4 von 4 Kriterien"). Shown on the
 * story stage in the "match" step, where it grows out of the lead pair card. Presentational only: the gold line
 * draws and the criteria tick when the live stage reaches "match" (story.css); snapshots and reduced motion show
 * the final state. Decorative there (the stage is aria-hidden; the step text carries the meaning).
 */
export function MatchCard() {
  return (
    <figure className="match">
      <figcaption className="match-label">
        {match.label}<span> · </span><span className="match-label-note">{match.imageNote}</span>
      </figcaption>

      <div className="match-party match-athlete">
        <img className="match-photo" src={photo} alt="" width={52} height={52} decoding="async" loading="lazy" />
        <div className="match-party-text">
          <p className="match-role">{match.athlete.role}</p>
          <p className="match-name">{match.athlete.name}</p>
          <p className="match-meta">{match.athlete.meta} · {match.athlete.need}</p>
        </div>
      </div>

      <div className="match-link">
        <span className="match-line" />
        <div className="match-result">
          <ul className="match-criteria">
            {match.criteria.map((c, i) => (
              <li key={c} style={{ '--i': i } as CSSProperties}>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
                {c}
              </li>
            ))}
          </ul>
          <p className="match-score">{match.result}</p>
        </div>
      </div>

      <div className="match-party match-sponsor">
        <span className="match-mark">{match.sponsor.mark}</span>
        <div className="match-party-text">
          <p className="match-role">{match.sponsor.role}</p>
          <p className="match-name">{match.sponsor.name}</p>
          <p className="match-meta">{match.sponsor.meta} · {match.sponsor.need}</p>
        </div>
      </div>
    </figure>
  );
}
