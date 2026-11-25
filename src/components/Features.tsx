import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import { features, story } from '../content';
import { StaticCard } from './featuresCard';
import '../styles/sections/features.css';

/**
 * «Mit Sponsuno» on Tintenblau (fourth form, 2026-11-25, owner's Mobbin references Unfair, Fruitful and Profound): the
 * three story steps on the left on a rail with numbered dots, one Hafer product card on the right that stays in view
 * and changes with the step in the middle of the screen (profile → suggestions → match). Scroll decides the step
 * (IntersectionObserver), nothing advances by itself. Motion (motion.dev) animates the card on desktop, loaded
 * after hydration (FeaturesLive.tsx); until then, and on phones, the card is static (featuresCard.tsx). Lucide draws the
 * icons. Below 961 px and without JS each step shows its own static card instead. The cards
 * are aria-hidden: the step text says the same in words.
 */
const STEPS = story.steps.slice(0, 3);

export function Features() {
  const [active, setActive] = useState(0);
  const [Live, setLive] = useState<ComponentType<{ step: number }> | null>(null);

  // The animated card (Motion) only where the sticky stage shows: desktop width. Loaded after hydration.
  useEffect(() => {
    if (!window.matchMedia('(min-width: 961px)').matches) return;
    let cancelled = false;
    import('./FeaturesLive').then((mod) => { if (!cancelled) setLive(() => mod.LiveCard); });
    return () => { cancelled = true; };
  }, []);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="section surface-graphit fx" id="mit-sponsuno" aria-labelledby="fx-title" data-header-dark="">
      <div className="container">
        <div className="fx-head" data-reveal="" data-scroll="rise">
          <p className="label">{features.label}</p>
          <h2 id="fx-title">{features.title}</h2>
          <p className="section-intro">{features.intro}</p>
        </div>
        <div className="fx-layout">
          <div className="fx-steps-wrap" style={{ '--fx-p': active / (STEPS.length - 1) } as CSSProperties}>
            <span className="fx-rail" aria-hidden="true"><span className="fx-rail-fill" /></span>
            <ol className="fx-steps" role="list">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  ref={(el) => { stepRefs.current[i] = el; }}
                  data-i={i}
                  className={`fx-step${i === active ? ' is-active' : ''}${i < active ? ' is-done' : ''}`}
                >
                  <span className="fx-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  <div className="fx-inline" aria-hidden="true"><StaticCard step={i} /></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="fx-stage" aria-hidden="true">
            <div className="fx-sticky">
              {Live ? <Live step={active} /> : <StaticCard step={active} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
