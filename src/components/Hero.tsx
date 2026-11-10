import type { CSSProperties } from 'react';
import { demo, hero, story, type Role } from '../content';
import { CriteriaLegend, LockDisc, PairCard, Paper, type PaperKind } from './StoryArt';
import '../styles/sections/hero.css';

type Vars = CSSProperties & Record<`--${string}`, string | number>;

// Start frame of the story (Harvey-style): raw papers left of a thin gold line, ordered pairs right of it.
// Its own papers (never the ones on the story stage, which fades in as this picture fades out).
// x in px from the line (negative = left), y in % of the art height; m = phone position or null (hidden);
// b = height on the moving belt (html.motion), in array order along the belt.
const PAPERS: { kind: PaperKind; x: number; y: number; m: [number, number] | null; b: number }[] = [
  { kind: 'anfrage', x: -34, y: 50, m: [-22, 64], b: 50 },
  { kind: 'fragen', x: -364, y: 18, m: null, b: 22 },
  { kind: 'rueckruf', x: -200, y: 84, m: null, b: 82 },
  { kind: 'praesentation', x: -190, y: 36, m: [-80, 25], b: 40 },
  { kind: 'nachfassen', x: -350, y: 60, m: null, b: 72 },
  { kind: 'liste', x: -500, y: 46, m: null, b: 24 },
];

/** Navy hero, centred (Harvey frame): badge, H1, lead, the two audience buttons, the demo link, then the start
    frame of the scroll story inside the first viewport. The story itself follows in Story.tsx. */
export function Hero({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-copy" data-scroll="recede">
        <p className="hero-badge">{hero.badge}</p>
        <h1 id="hero-title">
          {hero.titleStart} <span className="hero-accent">{hero.titleAccent}</span>
        </h1>
        <p className="hero-lead">{hero.lead}</p>
        <div className="hero-actions">
          <div className="hero-buttons">
            <a className="btn btn-gold" href="#warteliste" onClick={() => onChooseRole(hero.ctaSeeker.role)}>{hero.ctaSeeker.label}</a>
            <a className="btn btn-ghost" href="#warteliste" onClick={() => onChooseRole(hero.ctaSponsor.role)}>{hero.ctaSponsor.label}</a>
          </div>
          <p className="hero-demo">
            <a className="link-arrow" href={demo.href}>
              {demo.link}
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </a>
          </p>
        </div>
      </div>

      {/* Wrapper carries the scroll recede; the pieces inside run their own short load animation */}
      <figure className="hero-art" data-scroll="recede">
        <div className="ha-canvas" aria-hidden="true">
          <div className="ha-win ha-win-l">
            {PAPERS.map((p, i) => (
              <Paper
                key={p.kind}
                kind={p.kind}
                className={`ha-paper${p.m ? '' : ' ha-mhide'}${p.x < -300 ? ' ha-far' : ''}`}
                style={{ '--hx': `${p.x}px`, '--hy': `${p.y}%`, '--mx': `${p.m?.[0] ?? 0}px`, '--my': `${p.m?.[1] ?? 0}%`, '--by': `${p.b}%`, '--i': i }}
              />
            ))}
          </div>
          <div className="ha-win ha-win-r">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`ha-pair${i === 0 ? ' ha-lead' : ' ha-mhide'}`} style={{ '--n': i } as Vars}>
                <PairCard index={i} lead={i === 0} />
              </div>
            ))}
          </div>
          <span className="ha-line" />
          <span className="ha-lock"><LockDisc /></span>
          <div className="ha-legend"><CriteriaLegend /></div>
        </div>
        <p className="visually-hidden">{story.artAlt}</p>
        <figcaption className="ha-cap">{story.captions.solution}</figcaption>
      </figure>
    </section>
  );
}
