import { useEffect, useRef, useState, type CSSProperties } from 'react';
import photo from '../assets/symbolbild-mtb-192.jpg';
import { match } from '../content';
import { motionEnabled, onceVisible } from '../lib/motion';

/**
 * The page's one signature moment: a fictional athlete and sponsor, joined by a gold line that draws
 * while the four criteria tick. Both cards are always visible; without motion (or JS) the final state shows.
 */
export function MatchCard() {
  const ref = useRef<HTMLElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionEnabled()) { setPlayed(true); return; }
    // Desktop: start shortly after load. Phone: start once the card is on screen.
    let timer = 0;
    const stop = onceVisible(el, () => { timer = window.setTimeout(() => setPlayed(true), 350); }, 0.4);
    return () => { stop(); window.clearTimeout(timer); };
  }, []);

  return (
    <figure ref={ref} className={`match${played ? ' is-played' : ''}`} aria-labelledby="match-label">
      <figcaption id="match-label" className="match-label">
        {match.label}<span aria-hidden="true"> · </span><span className="match-label-note">{match.imageNote}</span>
      </figcaption>

      <div className="match-party match-athlete">
        <img className="match-photo" src={photo} alt="" width={52} height={52} decoding="async" fetchPriority="high" />
        <div className="match-party-text">
          <p className="match-role">{match.athlete.role}</p>
          <p className="match-name">{match.athlete.name}</p>
          <p className="match-meta">{match.athlete.meta} · {match.athlete.need}</p>
        </div>
      </div>

      <div className="match-link">
        <span className="match-line" aria-hidden="true" />
        <div className="match-result">
          <ul className="match-criteria" aria-label="Übereinstimmung">
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
        <span className="match-mark" aria-hidden="true">{match.sponsor.mark}</span>
        <div className="match-party-text">
          <p className="match-role">{match.sponsor.role}</p>
          <p className="match-name">{match.sponsor.name}</p>
          <p className="match-meta">{match.sponsor.meta} · {match.sponsor.need}</p>
        </div>
      </div>
    </figure>
  );
}
