import { hero, type Role } from '../content';
import { CourtLines } from './kit/CourtLines';
import { Icon } from './kit/Icon';
import { Sticker } from './kit/Sticker';
import { Tag } from './kit/Tag';
import '../styles/sections/hero.css';

/**
 * Hero (#top): parquet, one screen, centred on the page container. The launch signal as a flat yellow tag, the H1 in
 * the display face with the accent word in blue, one lead sentence and the two role buttons, which preselect the
 * waitlist role and lead to #warteliste (the click handler only sets the role; App.tsx scrolls).
 *
 * Decoration, all aria-hidden: two hall lines that frame the lower right of the block (CourtLines: the red base line
 * and a blue corner arc, drawn once on load) and one sticker, the ball. It sits on a line, clear of every text: on
 * the arc from 761 px, at the right end of the base line on phones (hero.css). The ball sits in a slot (.hero-ball):
 * the slot carries place, size, the load delay and the scroll drift; the sticker inside stays free for the kit
 * (rotate, scale) and for the Easter-egg chunk, which lets it be dragged with `translate` (mouse only, never onto the
 * text or a button) and collected for the album. The slot never catches the pointer, only the sticker does. The round
 * arrow stands in a gap of the base line (the line stops before it and goes on after it: no line runs behind a
 * button) and leads to the next block.
 * Classes prefixed hero-.
 */
export function Hero({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      {/* The base line in two strips, left and right of the round arrow, then the corner arc */}
      <CourtLines variant="band" line="rot" draw="load" className="hero-line hero-line-a" />
      <CourtLines variant="band" line="rot" draw="load" className="hero-line hero-line-b" />
      <CourtLines variant="hero" draw="load" className="hero-arc" />
      <div className="container hero-inner">
        <p className="hero-badge">
          <Tag tone="gelb" dot>{hero.badge}</Tag>
        </p>
        <h1 className="hero-title" id="hero-title">
          {hero.titleStart} <span className="hero-accent">{hero.titleAccent}</span>
        </h1>
        <p className="hero-lead">{hero.lead}</p>
        <div className="hero-actions">
          <a className="btn btn-tinte" href="#warteliste" onClick={() => onChooseRole(hero.ctaSeeker.role)}>{hero.ctaSeeker.label}</a>
          <a className="btn btn-outline" href="#warteliste" onClick={() => onChooseRole(hero.ctaSponsor.role)}>{hero.ctaSponsor.label}</a>
        </div>
      </div>
      {/* The nominal size is for the kit's hairline; the real size comes from the slot (at most 96 px, 56 px on phones) */}
      <span className="hero-ball" aria-hidden="true">
        <Sticker id="ball" size={96} rotate={-6} data-draggable="" />
      </span>
      <a className="hero-next" href="#idee" aria-label={hero.scrollHint}>
        <Icon name="pfeil-unten" />
      </a>
    </section>
  );
}
