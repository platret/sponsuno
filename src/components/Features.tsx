import { Fragment, useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { features, story } from '../content';
import { motionEnabled } from '../lib/motion';
import { ARTS } from './featuresArt';
import '../styles/sections/features.css';

const STEPS = [...story.steps.slice(0, 3), story.after];

/**
 * «Mit Sponsuno» on Tintenblau, id #ablauf (the nav's «So funktioniert es»; the separate how-it-works section was
 * removed 2026-11-25 as a repeat of this one) (fifth form, 2026-11-25, owner: a horizontal row with arrows, drawings like Fruitful's):
 * head with two arrow buttons on the right, then a horizontally scrolling row of four Hafer cards (the three story
 * steps and story.after), each with a drawing above its number, title and text. The row scrolls natively (touch,
 * trackpad, Shift + wheel, keyboard once focused) and snaps to the cards; the arrows move it by one card and are
 * disabled at either end. The drawings (featuresArt.tsx) are plain SVG until Motion arrives (FeaturesLive.tsx, after
 * hydration, only when motion is allowed); they are decorative (aria-hidden): the card text says the same in words.
 */
export function Features() {
  const rowRef = useRef<HTMLOListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [Live, setLive] = useState<ComponentType<{ children: ReactNode }> | null>(null);

  useEffect(() => {
    if (!motionEnabled()) return;
    let cancelled = false;
    import('./FeaturesLive').then((mod) => { if (!cancelled) setLive(() => mod.LiveArt); });
    return () => { cancelled = true; };
  }, []);

  // Arrow state follows the scroll position (the scroll listener only updates two booleans)
  const update = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [update, Live]); // Live: the row is mounted anew when Motion arrives

  const move = (dir: 1 | -1) => {
    const el = rowRef.current;
    const card = el?.querySelector<HTMLElement>('.fx-card');
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: motionEnabled() ? 'smooth' : 'auto' });
  };

  const Wrap = Live ?? Fragment;

  return (
    <section className="section surface-graphit fx" id="ablauf" aria-labelledby="fx-title" data-header-dark="">
      <div className="container fx-top">
        <div className="fx-head" data-reveal="" data-scroll="rise">
          <p className="label">{features.label}</p>
          <h2 id="fx-title">{features.title}</h2>
          <p className="section-intro">{features.intro}</p>
        </div>
        <div className="fx-arrows">
          <button type="button" className="fx-arrow" aria-label={features.prev} aria-controls="fx-row" disabled={atStart} onClick={() => move(-1)}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="fx-arrow" aria-label={features.next} aria-controls="fx-row" disabled={atEnd} onClick={() => move(1)}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <Wrap>
        <ol className="fx-row" id="fx-row" ref={rowRef} role="list" aria-label={features.scrollerLabel} tabIndex={0} data-scroll-stagger="">
          {STEPS.map((step, i) => {
            const Art = ARTS[i];
            return (
              <li className="fx-card" key={step.title} data-reveal="" data-scroll="rise">
                <div className="fx-art-box" aria-hidden="true"><Art /></div>
                <span className="fx-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            );
          })}
        </ol>
      </Wrap>
    </section>
  );
}
