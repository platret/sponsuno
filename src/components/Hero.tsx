import { hero, type Role } from '../content';
import '../styles/sections/hero.css';

/**
 * Hero (#top): parquet, one screen, centred. The launch signal as a yellow pill, the H1 in the display face with the
 * accent word in blue, one lead sentence and the two role buttons, which preselect the waitlist role and lead to
 * #warteliste (the click handler only sets the role; App.tsx scrolls). Static skeleton: court lines, stickers and
 * motion are added on top by the kit (see the TODO(kit) marks); everything here is the final, readable state.
 * Classes prefixed hero-.
 */
export function Hero({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      {/* TODO(kit): <CourtLines variant="hero" /> here, as the first child (decorative, behind .hero-inner) */}
      <div className="container hero-inner">
        {/* TODO(kit): the launch signal becomes <TextSticker tone="gelb" rotate={-4}>{hero.badge}</TextSticker>;
            .hero-badge then only keeps the spacing */}
        <p className="hero-badge"><span className="hero-badge-pill">{hero.badge}</span></p>
        <h1 className="hero-title" id="hero-title">
          {hero.titleStart} <span className="hero-accent">{hero.titleAccent}</span>
        </h1>
        <p className="hero-lead">{hero.lead}</p>
        <div className="hero-actions">
          <a className="btn btn-tinte" href="#warteliste" onClick={() => onChooseRole(hero.ctaSeeker.role)}>{hero.ctaSeeker.label}</a>
          <a className="btn btn-outline" href="#warteliste" onClick={() => onChooseRole(hero.ctaSponsor.role)}>{hero.ctaSponsor.label}</a>
        </div>
      </div>
      {/* TODO(kit): five to six <Sticker> (ball, note, brezel, startnummer, wimpel, pfeife) in an aria-hidden layer
          .hero-stickers after .hero-inner: scattered around the headline, a few overlapping letters and the edge */}
    </section>
  );
}
