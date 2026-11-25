import { Fragment, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { audience, type Role } from '../content';
import { motionEnabled } from '../lib/motion';
import { AUDIENCE_ARTS } from './audienceArt';
import { LinkArrowLabel } from './LinkArrowLabel';
import '../styles/sections/audience.css';

/**
 * «Für wen» on Hafer 2 (redrawn 2026-11-25, owner: "make beautiful graphics"; Mobbin references Mural and Maze): four
 * Hafer cards in a 2 × 2 grid, each with the group and one sentence on the left, a drawing on a coloured tile on the
 * right (audienceArt.tsx), and a link that preselects the waitlist role. No photos any more (the stock photos and
 * their credits left the site with this change). The drawings are decorative (aria-hidden) and plain SVG until Motion
 * arrives (the same FeaturesLive.tsx chunk as «Mit Sponsuno», only when motion is allowed).
 */
export function Audience({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  const [Live, setLive] = useState<ComponentType<{ children: ReactNode }> | null>(null);
  useEffect(() => {
    if (!motionEnabled()) return;
    let cancelled = false;
    import('./FeaturesLive').then((mod) => { if (!cancelled) setLive(() => mod.LiveArt); });
    return () => { cancelled = true; };
  }, []);
  const Wrap = Live ?? Fragment;

  return (
    <section className="section surface-kalk aud" id="fuer-wen" aria-labelledby="aud-title">
      <div className="container">
        <div className="section-head aud-head" data-reveal="" data-scroll="rise">
          <h2 id="aud-title">{audience.title}</h2>
          <p className="section-intro">{audience.intro}</p>
        </div>
        <Wrap>
          <ul className="aud-grid" role="list" data-scroll-stagger="">
            {audience.items.map((item, i) => {
              const Art = AUDIENCE_ARTS[i];
              return (
                <li className={`aud-card aud-card-${i}`} data-reveal="" data-scroll="rise" key={item.label}>
                  <div className="aud-body">
                    <h3>{item.label}</h3>
                    <p>{item.text}</p>
                    <a className="link-arrow link-arrow-wrap aud-cta" href="#warteliste" onClick={() => onChooseRole(item.role)}>
                      <LinkArrowLabel label={item.cta} />
                    </a>
                  </div>
                  <div className="aud-tile" aria-hidden="true"><Art /></div>
                </li>
              );
            })}
          </ul>
        </Wrap>
      </div>
    </section>
  );
}
