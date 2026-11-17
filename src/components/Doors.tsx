import { doors, type Role } from '../content';
import '../styles/sections/doors.css';

/** Ground of each tile: blue for sport and culture, red for companies (white text on both) */
const SURFACE = { sport: 'surface-blau', firma: 'surface-rot' } as const;

/**
 * The two doors (#fuer-wen): two full-height colour tiles side by side (stacked on phones), one per side of the
 * market. Each: an uppercase label, the title, one sentence and a parquet pill button that sets the waitlist role
 * and leads to #warteliste (the click handler only sets the role; App.tsx scrolls). The section's H2 is read by screen
 * readers only; the tile titles are H3. Static skeleton: each tile keeps an aria-hidden slot for its large line
 * illustration. Classes prefixed door-.
 */
export function Doors({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  return (
    <section className="door-sec" id="fuer-wen" aria-labelledby="fuer-wen-title">
      <h2 className="visually-hidden" id="fuer-wen-title">{doors.title}</h2>
      <div className="door-grid">
        {doors.tiles.map((tile) => (
          <article className={`door door-${tile.id} ${SURFACE[tile.id]}`} key={tile.id} aria-labelledby={`door-${tile.id}-title`}>
            {/* TODO(kit): <CourtLines variant="door-sport" /> / "door-firma" and the tile's large line illustration
                (a ball rolling along a court line into a goal; a shop front whose sign lights up) in .door-art */}
            <div className="door-art" data-door={tile.id} aria-hidden="true" />
            <div className="door-body">
              <p className="label door-label">{tile.label}</p>
              <h3 className="door-title display" id={`door-${tile.id}-title`}>{tile.title}</h3>
              <p className="door-text">{tile.text}</p>
              <a className="btn btn-parkett door-btn" href="#warteliste" onClick={() => onChooseRole(tile.role)}>
                {doors.button}
                {/* TODO(kit): <Icon name="pfeil" size={20} /> after the label */}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
