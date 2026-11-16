import photo from '../assets/photos/mtb-athlete-104.jpg';
import photoAvif from '../assets/photos/mtb-athlete-104.avif';
import type { CSSProperties } from 'react';
import { match } from '../content';

/**
 * The fictional match (mountain biker and bike shop, four criteria, "Passt in 4 von 4 Kriterien"). Shown on the
 * story stage in the "match" step, where it grows out of the lead pair card. One surface in the pair card's
 * language: both parties on the same grid (photo and brass disc the same size), then under a hairline the four
 * criteria as brass dots with their names and the result as plain text. Presentational only: the dots tick and the
 * result appears when the live stage reaches "match" (story.css); snapshots and reduced motion show the final state.
 * Decorative there (the stage is aria-hidden; the step text carries the meaning).
 */
export function MatchCard() {
  const parties = [
    { key: 'athlete', p: match.athlete, mark: (
      // AVIF with the JPEG as fallback (scripts/photos.mjs)
      <picture className="match-picture">
        <source type="image/avif" srcSet={photoAvif} />
        <img className="match-photo" src={photo} alt="" width={48} height={48} decoding="async" loading="lazy" />
      </picture>
    ) },
    { key: 'sponsor', p: match.sponsor, mark: <span className="match-mark">{match.sponsor.mark}</span> },
  ];
  return (
    <figure className="match">
      <figcaption className="match-label">{match.label}</figcaption>
      {parties.map(({ key, p, mark }) => (
        <div key={key} className="match-party">
          {mark}
          <div className="match-party-text">
            <p className="match-role">{p.role}</p>
            <p className="match-name">{p.name}</p>
            <p className="match-meta">{p.meta} · {p.need}</p>
          </div>
        </div>
      ))}
      <div className="match-foot">
        <ul className="match-criteria">
          {match.criteria.map((c, i) => (
            <li key={c} style={{ '--i': i } as CSSProperties}><i className="match-dot" />{c}</li>
          ))}
        </ul>
        <p className="match-score">{match.result}</p>
      </div>
    </figure>
  );
}
