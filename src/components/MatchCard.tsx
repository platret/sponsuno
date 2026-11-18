import { match } from '../content';
import type { Vars } from './kit/Sticker';
import { Tag } from './kit/Tag';
import { Icon, type IconName } from './kit/Icon';
import '../styles/sections/match.css';

/** The result line with "4 von 4" kept on one line (typography only: the words are match.result) */
const RESULT = match.result.replace(/(\d) von (\d)/, '$1\u00a0von\u00a0$2');

/** Line icon of each criterion, in the order of match.criteria (Region, Unterstützung, Branche, Budget) */
const CRITERIA_ICONS: IconName[] = ['region', 'unterstuetzung', 'branche', 'budget'];

/**
 * The fictional match (mountain biker and bike shop, four criteria, "Passt in 4 von 4 Kriterien"), shown in "So
 * funktioniert es" under the three steps. One parquet card: the "Beispieldaten" label as a flat outlined tag in the
 * card's top left corner (the card's one label, copy rule 6), both parties with flat vector avatars (no photo: a blue
 * disc with a person for the seeker, a red disc with a shop front for the firm, the colours of steps one and two and
 * of the two doors), then the green result panel: the result line in the display face and the four criteria as chips
 * with their line icons. Nothing is tilted.
 * A figure with real text. Inside a [data-reveal] block the avatars, the chips and the check settle one after another
 * (match.css, only under html.motion). Classes prefixed match-.
 */
export function MatchCard() {
  const parties = [
    { key: 'athlete', p: match.athlete, mark: 'seeker', icon: 'profil' },
    { key: 'sponsor', p: match.sponsor, mark: 'firm', icon: 'branche' },
  ] as const;
  return (
    <figure className="match">
      <figcaption className="match-label">
        <Tag tone="linie">{match.label}</Tag>
      </figcaption>
      {parties.map(({ key, p, mark, icon }) => (
        <div key={key} className={`match-party match-party-${mark}`}>
          <span className={`match-mark match-mark-${mark}`} aria-hidden="true"><Icon name={icon} size={28} /></span>
          <div className="match-party-text">
            <p className="match-role">{p.role}</p>
            <p className="match-name">{p.name}</p>
            <p className="match-meta">{p.meta} · {p.need}</p>
          </div>
        </div>
      ))}
      <div className="match-foot">
        <p className="match-score display">
          <span className="match-check" aria-hidden="true"><Icon name="check" size={20} /></span>
          {RESULT}
        </p>
        <ul className="match-criteria">
          {match.criteria.map((c, i) => (
            <li key={c} style={{ '--i': i } as Vars}>
              <Icon name={CRITERIA_ICONS[i] ?? 'check'} size={16} />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
