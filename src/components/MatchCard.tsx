import type { CSSProperties } from 'react';
import { match } from '../content';
import '../styles/sections/match.css';

/**
 * The fictional match (mountain biker and bike shop, four criteria, "Passt in 4 von 4 Kriterien"), shown in "So
 * funktioniert es" under the three steps. One card on the page surface: the "Beispieldaten" label (the card's one label,
 * copy rule 6), both parties on the same grid with vector avatars (no photo: a blue disc with a line figure for the
 * seeker, a yellow disc with the firm's initial), then under a hairline the four criteria as dots in the four line
 * colours with their names and the result as plain text. A figure with real text; static (the Steps section may
 * animate the dots via --i). Classes prefixed match-.
 */
export function MatchCard() {
  const parties = [
    { key: 'athlete', p: match.athlete, mark: (
      <span className="match-mark match-mark-seeker" aria-hidden="true">
        {/* TODO(kit): <Icon name="profil" size={24} /> may replace this figure */}
        <svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.6-3.8 3.4-6 7-6s6.4 2.2 7 6" /></svg>
      </span>
    ) },
    { key: 'sponsor', p: match.sponsor, mark: <span className="match-mark match-mark-firm" aria-hidden="true">{match.sponsor.mark}</span> },
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
