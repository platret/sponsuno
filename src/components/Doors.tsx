import { doors, type Role } from '../content';
import { BALL_PATH, CourtLines } from './kit/CourtLines';
import { Sticker } from './kit/Sticker';
import { Icon } from './kit/Icon';
import '../styles/sections/doors.css';

/**
 * Ground of each tile: blue (the one brand colour) for sport and culture, ink for companies. Never red or yellow:
 * those are accent colours (DESIGN.md -> Colour, the surface rule); the firm tile keeps its yellow shop sign and the
 * pretzel sticker as its small accents.
 */
const SURFACE = { sport: 'surface-blau', firma: 'surface-tinte' } as const;

/**
 * The ball of the court drawing: a plain yellow disc (the drawing's one accent, not a sticker), laid over the court
 * lines in the same viewBox. It follows BALL_PATH, the yellow line of the kit's door-sport drawing: it rides the tip
 * of that line while the line draws with the scroll, and rolls in again when the tile is hovered or holds focus.
 * Rest state: in the goal.
 */
const Ball = () => (
  <svg className="door-ball" viewBox="0 0 600 600" preserveAspectRatio="xMaxYMax meet" focusable="false">
    <circle className="door-ball-move" r="20" style={{ offsetPath: `path('${BALL_PATH}')`, offsetDistance: '100%' }} />
  </svg>
);

/**
 * The two doors (#fuer-wen): two full-height tiles side by side (stacked on phones), one per side of the market,
 * blue and ink. Each: an uppercase label, the title, one sentence and a parquet pill button with an arrow that sets the
 * waitlist role and leads to #warteliste (the click handler only sets the role; App.tsx scrolls). The section's H2 is
 * read by screen readers only; the tile titles are H3.
 * Each tile carries one white line drawing (aria-hidden) in its lower right corner that draws with the scroll as it
 * comes into view: a court seen from above whose ball rolls into the goal (blue), a shop whose sign lights up yellow
 * (ink). One reaction on hover or keyboard focus per tile: the ball rolls in again, the sign flickers.
 * One small collectable sticker per tile, part of the drawing: the pennant stands where the ball's line starts, the
 * pretzel lies in the shop window. Classes prefixed door-.
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
            <div className="door-art" data-scroll="draw" data-reveal="" aria-hidden="true">
              {tile.id === 'sport' ? (
                <>
                  <CourtLines variant="door-sport" />
                  <Ball />
                  <Sticker id="wimpel" size={72} rotate={4} className="door-stk" data-reveal="" />
                </>
              ) : (
                <>
                  <CourtLines variant="door-firma" />
                  <Sticker id="brezel" size={72} rotate={-6} className="door-stk" data-reveal="" />
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
