import { demo, hero, type Role } from '../content';
import { MatchCard } from './MatchCard';
import '../styles/sections/hero.css';

/** Navy hero: one sentence, one audience choice, the product shown as the match card. */
export function Hero({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  return (
    <section className="hero surface-navy" id="top" aria-labelledby="hero-title">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-badge">{hero.badge}</p>
          <h1 id="hero-title">
            {hero.titleStart} <span className="hero-accent">{hero.titleAccent}</span>
          </h1>
          <p className="hero-lead">{hero.lead}</p>
          <div className="hero-actions">
            <a className="btn btn-gold" href="#warteliste" onClick={() => onChooseRole(hero.ctaSeeker.role)}>{hero.ctaSeeker.label}</a>
            <a className="btn btn-ghost" href="#warteliste" onClick={() => onChooseRole(hero.ctaSponsor.role)}>{hero.ctaSponsor.label}</a>
          </div>
          <p className="hero-demo">
            <a className="link-arrow" href={demo.href}>
              {demo.link}
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </a>
            <span className="hero-demo-note">{demo.linkNote}</span>
          </p>
        </div>
        <MatchCard />
      </div>
    </section>
  );
}
