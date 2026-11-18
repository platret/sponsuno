import { doors, type Role } from '../content';
import { BALL_PATH, CourtLines } from './kit/CourtLines';
import { BALL_PANELS, BALL_SEAMS, Sticker } from './kit/Sticker';
import { Icon } from './kit/Icon';
import '../styles/sections/doors.css';

/** Ground of each tile: blue for sport and culture, red for companies (white text on both) */
const SURFACE = { sport: 'surface-blau', firma: 'surface-rot' } as const;

/**
 * The hall ball of the sticker set as a small drawing of its own (the kit's ball panels and seams, centred on 0 0),
 * laid over the court drawing in the same viewBox; it follows BALL_PATH, the yellow line of the kit's door-sport
 * drawing: it rides the tip of the yellow line while the line draws with the scroll, and rolls in again when the tile is hovered
 * or holds focus. Rest state: in the goal.
 */
const Ball = () => (
  <svg className="door-ball" viewBox="0 0 600 600" preserveAspectRatio="xMaxYMax meet" focusable="false">
    <g className="door-ball-move" style={{ offsetPath: `path('${BALL_PATH}')`, offsetDistance: '100%' }}>
      <g className="door-ball-spin">
        <g transform="scale(.8) translate(-60 -60)">
          <circle className="door-ball-cut" cx="60" cy="60" r="52.5" />
          <circle className="door-ball-ink" cx="60" cy="60" r="46.5" />
          <circle className="door-ball-gelb" cx="60" cy="60" r="43" />
          <path className="door-ball-blau" d={BALL_PANELS} />
          <path className="door-ball-seam" d={BALL_SEAMS} />
        </g>
      </g>
    </g>
  </svg>
);

/**
 * The two doors (#fuer-wen): two full-height colour tiles side by side (stacked on phones), one per side of the
 * market. Each: an uppercase label, the title, one sentence and a parquet pill button with an arrow that sets the
 * waitlist role and leads to #warteliste (the click handler only sets the role; App.tsx scrolls). The section's H2 is
 * read by screen readers only; the tile titles are H3.
 * Each tile carries one large white line drawing (aria-hidden) in its lower right corner that draws with the scroll
 * as it comes into view: a court seen from above whose ball rolls into the goal (blue), a shop whose sign lights up
 * yellow (red). One reaction on hover or keyboard focus per tile: the ball rolls in again, the sign flickers and
 * shines. One collectable sticker per tile: the note on the court (sport and culture), the pretzel in the shop window.
 * Classes prefixed door-.
 */
export function Doors({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  return (
    <section className="door-sec" id="fuer-wen" aria-labelledby="fuer-wen-title">
      <h2 className="visually-hidden" id="fuer-wen-title">{doors.title}</h2>
      <div className="door-grid">
        {doors.tiles.map((tile) => (
          <article className={`door door-${tile.id} ${SURFACE[tile.id]}`} key={tile.id} aria-labelledby={`door-${tile.id}-title`}>
            <div className="door-body">
              <p className="label door-label">{tile.label}</p>
              <h3 className="door-title display" id={`door-${tile.id}-title`}>{tile.title}</h3>
              <p className="door-text">{tile.text}</p>
              <a className="btn btn-parkett door-btn" href="#warteliste" onClick={() => onChooseRole(tile.role)}>
                {doors.button}
                <Icon name="pfeil" size={20} className="door-btn-icon" />
              </a>
            </div>
            {/* data-scroll="draw": the kit draws the lines along this box's way into the viewport; data-reveal is the
                fade for browsers without scroll timelines */}
            <div className="door-art" data-door={tile.id} data-scroll="draw" data-reveal="" aria-hidden="true">
              {tile.id === 'sport' ? (
                <>
                  <CourtLines variant="door-sport" />
                  <Ball />
                  <Sticker id="note" size={96} rotate={-9} className="door-stk" data-reveal="" />
                </>
              ) : (
                <>
                  <CourtLines variant="door-firma" />
                  <Sticker id="brezel" size={72} rotate={-7} className="door-stk" data-reveal="" />
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
