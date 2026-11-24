import { useEffect, useRef, useState } from 'react';
import { hero, type Role } from '../content';
import { motionEnabled } from '../lib/motion';
import type { HeroField } from '../lib/heroField';
import '../styles/sections/hero.css';

/**
 * Tintenblau hero (Markenhandbuch D1, layout «Anstoss»): launch label, one large H1 with one Bernstein word, the halfway
 * line with the centre circle, then the lead and the two calls to action. Behind it the «Punkte» field (lib/heroField.ts,
 * WebGL, loaded after hydration): without JS, without WebGL or before it starts, the hero is plain Tintenblau, which
 * is also its final look under reduced motion apart from the dots (one still frame).
 * The dot wave runs longer than 5 s on its own, so the hero has a pause toggle (WCAG 2.2.2); it also stops off screen.
 */
export function Hero({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const field = useRef<HeroField | null>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let cancelled = false;
    import('../lib/heroField').then(({ startHeroField }) => {
      if (cancelled) return;
      field.current = startHeroField(el, !motionEnabled());
      if (field.current) setReady(true);
    });
    return () => { cancelled = true; field.current?.destroy(); field.current = null; };
  }, []);

  useEffect(() => { field.current?.setPaused(paused); }, [paused]);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title" data-header-dark="">
      <canvas className={`hero-field${ready ? ' is-on' : ''}`} ref={canvas} aria-hidden="true" />
      <div className="container hero-copy">
        <p className="label hero-badge">{hero.badge}</p>
        <h1 id="hero-title">
          {hero.titleStart} <span className="hero-accent">{hero.titleAccent}</span>
        </h1>
      </div>
      <div className="hero-pitch" aria-hidden="true">
        <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49.5" pathLength={100} /></svg>
      </div>
      <div className="container hero-foot">
        <p className="hero-lead">{hero.lead}</p>
        <div className="hero-buttons">
          <a className="btn btn-brass" href="#warteliste" onClick={() => onChooseRole(hero.ctaSeeker.role)}>{hero.ctaSeeker.label}</a>
          <a className="link-arrow hero-second" href="#warteliste" onClick={() => onChooseRole(hero.ctaSponsor.role)}>
            {hero.ctaSponsor.label}
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </a>
        </div>
      </div>
      {ready && (
        <button type="button" className="hero-pause" aria-label={hero.pauseLabel} aria-pressed={paused} onClick={() => setPaused((v) => !v)}>
          <svg viewBox="0 0 16 16" aria-hidden="true">{paused ? <path className="is-play" d="M5.5 4v8l6-4z" /> : <path d="M6 4.5v7M10 4.5v7" />}</svg>
        </button>
      )}
    </section>
  );
}
