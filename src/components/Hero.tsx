import { useEffect, useRef } from 'react';
import { cta, demo, hero } from '../content';
import { finePointer, gsap, motionEnabled, useGSAP } from '../lib/motion';
import { useMagnetic } from '../hooks/usePointerFx';
import { MatchCard, type MatchHandle } from './MatchCard';
import { SilkCanvas } from './SilkCanvas';
import { SplitHeading } from './SplitHeading';

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const matchRef = useRef<MatchHandle>(null);
  const ctaRef = useMagnetic<HTMLAnchorElement>();

  // Intro: kicker, headline word by word, then copy, then the match plays.
  useGSAP((_, contextSafe) => {
    const root = document.documentElement;
    let cancelled = false;
    const run = contextSafe!(() => {
      if (cancelled) return;
      window.clearTimeout(window.__introFailsafe);
      const matchApi = matchRef.current;
      if (!motionEnabled()) { matchApi?.showFinal(); return; }
      if (root.classList.contains('intro-done')) { matchApi?.playWhenVisible(); return; }
      gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => root.classList.add('intro-done') })
        .fromTo('.hero-kicker', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9 }, 0.1)
        .set('[data-intro-title]', { opacity: 1 }, 0.2)
        .fromTo('[data-intro-title] .word > span', { yPercent: 115, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.08 }, 0.2)
        .fromTo('.hero-lead, .hero-actions, .hero-note', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.6)
        .add(() => matchRef.current?.playWhenVisible(), 0.45);
    });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(run);
    return () => { cancelled = true; };
  }, { scope: heroRef });

  // Pointer light and a gentle tilt of the match card
  useEffect(() => {
    const el = heroRef.current;
    const stage = el?.querySelector<HTMLElement>('.match-stage');
    if (!el || !stage || !motionEnabled() || !finePointer()) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
      stage.style.setProperty('--ry', `${(px - 0.5) * 8}deg`);
      stage.style.setProperty('--rx', `${(0.5 - py) * 6}deg`);
    };
    const onLeave = () => {
      stage.style.setProperty('--ry', '0deg');
      stage.style.setProperty('--rx', '0deg');
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section className="hero" id="top" ref={heroRef}>
      <SilkCanvas palette="navy" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker" data-intro="">{hero.kicker}</p>
          <SplitHeading as="h1" text={hero.title} reveal={false} data-intro-title="" />
          <p className="hero-lead" data-intro="">{hero.lead}</p>
          <div className="hero-actions" data-intro="">
            <a className="btn btn-gold btn-shine btn-lg" href="#warteliste" ref={ctaRef}>{cta.waitlist}</a>
            <a className="btn btn-ghost btn-lg" href={demo.href}>{demo.hero}</a>
          </div>
          <p className="hero-note" data-intro="">{hero.note} {demo.heroNote}</p>
        </div>
        <MatchCard ref={matchRef} />
      </div>
    </section>
  );
}
