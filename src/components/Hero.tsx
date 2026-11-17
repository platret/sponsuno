import { hero, type Role } from '../content';
import { CourtLines } from './kit/CourtLines';
import { Icon } from './kit/Icon';
import { Sticker, TextSticker, type StickerId } from './kit/Sticker';
import '../styles/sections/hero.css';

/* The six picture stickers of the hero. Place and size of each live in hero.css (.hero-stk-<id>); here only the
   tilt and the nominal size (the kit uses it for its hairline; the real size comes from the slot). HEAD stickers are
   placed from the headline, the FLOOR sticker from the hall lines (the pennant stands on the red base line). Phones
   show four: ball, note, pretzel and the pennant. */
type Slot = { id: StickerId; size: number; rotate: number };
const HEAD: Slot[] = [
  { id: 'ball', size: 150, rotate: -8 },
  { id: 'startnummer', size: 116, rotate: 7 },
  { id: 'note', size: 96, rotate: -10 },
  { id: 'brezel', size: 128, rotate: 11 },
  { id: 'pfeife', size: 136, rotate: -12 },
];
const FLOOR: Slot[] = [{ id: 'wimpel', size: 104, rotate: 6 }];

const slot = (s: Slot) => (
  <span className={`hero-stk hero-stk-${s.id}`} key={s.id}>
    <Sticker id={s.id} size={s.size} rotate={s.rotate} data-draggable="" />
  </span>
);

/**
 * Hero (#top): parquet, one screen, centred. The launch signal as a yellow text sticker, the H1 as large as the width
 * allows with the accent word in blue, one lead sentence and the two role buttons, which preselect the waitlist role
 * and lead to #warteliste (the click handler only sets the role; App.tsx scrolls).
 *
 * Decoration, all aria-hidden: the hall lines behind (CourtLines, drawn once on load) and six stickers on and around
 * the headline. Each sticker sits in a slot (.hero-stk): the slot carries place, size, the load stagger and the scroll
 * drift; the sticker inside stays free for the kit (rotate, scale) and for the Easter-egg chunk, which makes every
 * [data-draggable] sticker draggable with `translate` and collectable. The two sticker layers (.hero-stickers over the
 * headline, .hero-floor over the lines) never catch the pointer, only the stickers do. The round arrow on the base
 * line leads to the next block. Classes prefixed hero-.
 */
export function Hero({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <CourtLines variant="hero" draw="load" className="hero-lines" />
      <div className="hero-inner">
        <div className="hero-head">
          <p className="hero-badge">
            <TextSticker tone="gelb" rotate={-4}>{hero.badge}</TextSticker>
          </p>
          <h1 className="hero-title" id="hero-title">
            {hero.titleStart} <span className="hero-accent">{hero.titleAccent}</span>
          </h1>
          <div className="hero-stickers" aria-hidden="true">
            {/* Phones only: the circle of the hall lines once more, small, behind the sticker band */}
            <CourtLines variant="hero" draw="load" className="hero-ring" />
            {HEAD.map(slot)}
          </div>
        </div>
        <p className="hero-lead">{hero.lead}</p>
        <div className="hero-actions">
          <a className="btn btn-tinte" href="#warteliste" onClick={() => onChooseRole(hero.ctaSeeker.role)}>{hero.ctaSeeker.label}</a>
          <a className="btn btn-outline" href="#warteliste" onClick={() => onChooseRole(hero.ctaSponsor.role)}>{hero.ctaSponsor.label}</a>
        </div>
      </div>
      <div className="hero-floor" aria-hidden="true">{FLOOR.map(slot)}</div>
      <a className="hero-next" href="#idee" aria-label={hero.scrollHint}>
        <Icon name="pfeil-unten" />
      </a>
    </section>
  );
}
