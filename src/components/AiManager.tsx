import { useEffect, useRef, useState } from 'react';
import icon from '../assets/Sponsuno_Icon.svg';
import { aiManager, demo } from '../content';
import { gsap, motionEnabled, ScrollTrigger, useGSAP } from '../lib/motion';
import { SplitHeading } from './SplitHeading';

const { panel } = aiManager;

/** Types `text` out once `active` turns true. Returns the visible part (the full text until then). */
function useTypewriter(text: string, active: boolean) {
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => {
    if (!active) return;
    let i = 0;
    let timer = 0;
    const step = () => {
      i += Math.random() < 0.15 ? 2 : 1;
      setShown(text.slice(0, i));
      if (i < text.length) timer = window.setTimeout(step, 18 + Math.random() * 30);
      else timer = window.setTimeout(() => setShown(null), 1600);
    };
    step();
    return () => window.clearTimeout(timer);
  }, [text, active]);
  return { text: shown ?? text, typing: shown !== null };
}

/** The draft paragraph; kept as its own component so typing re-renders only this line. */
function TypedDraft({ active }: { active: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const draft = useTypewriter(panel.draft.text, active);
  return <p className={`draft${draft.typing ? ' is-typing' : ''}`} ref={ref}>{draft.text}</p>;
}

export function AiManager() {
  const figureRef = useRef<HTMLElement>(null);
  const [typing, setTyping] = useState(false);

  // The panel assembles itself, the meter fills, then the draft types out
  useGSAP(() => {
    const figure = figureRef.current;
    if (!figure || !motionEnabled()) return;
    const items = figure.querySelectorAll('.assistant-item');
    const meter = figure.querySelector('.meter span');
    gsap.set(figure, { opacity: 0, y: 40 });
    gsap.set(items, { opacity: 0, y: 26 });
    gsap.set(meter, { width: '0%' });
    ScrollTrigger.create({
      trigger: figure,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        // Reserve the draft's full height so typing does not shift the layout
        const draftEl = figure.querySelector<HTMLElement>('.draft');
        if (draftEl) draftEl.style.minHeight = `${draftEl.offsetHeight}px`;
        gsap.timeline()
          .to(figure, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', clearProps: 'transform' })
          .to(items, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.18, clearProps: 'transform' }, 0.25)
          .to(meter, { width: `${(2 / 3) * 100}%`, duration: 1.2, ease: 'power3.out' }, 0.8)
          .add(() => setTyping(true), 1.0);
      },
    });
  }, { scope: figureRef });

  return (
    <section className="section section-navy" id="ki-manager" aria-labelledby="ki-title">
      <div className="grain" aria-hidden="true" />
      <div className="container ai-grid">
        <div className="ai-copy">
          <SplitHeading id="ki-title" text={aiManager.title} />
          <p className="section-intro" data-reveal="">{aiManager.intro}</p>
          <ul className="ai-list">
            {aiManager.features.map((f) => (
              <li data-reveal="" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
          <p className="ai-note" data-reveal="">{aiManager.note}</p>
        </div>

        <figure className="assistant" ref={figureRef} aria-labelledby="assistant-caption">
          <div className="assistant-glow">
            <div className="assistant-panel">
              <div className="assistant-bar">
                <img src={icon} alt="" width={28} height={28} loading="lazy" decoding="async" />
                <span>{panel.name}</span>
                <span className="assistant-live" aria-hidden="true" />
              </div>

              <div className="assistant-item">
                <p className="assistant-label">{panel.reminder.label}</p>
                <p>{panel.reminder.text}</p>
                <div className="assistant-actions">
                  <span className="chip chip-gold">{panel.reminder.primary}</span>
                  <span className="chip">{panel.reminder.secondary}</span>
                </div>
              </div>

              <div className="assistant-item">
                <p className="assistant-label">{panel.deliverables.label}</p>
                <ul className="deliverables">
                  {panel.deliverables.items.map((d) => (
                    <li key={d.text} className={d.state === 'done' ? 'is-done' : d.state === 'progress' ? 'is-progress' : undefined}>
                      <span>{d.text}</span>
                      <span>{d.status}</span>
                      {d.state === 'progress' && (
                        <span className="meter" aria-hidden="true"><span style={{ width: `${(d.progress ?? 0) * 100}%` }} /></span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="assistant-item">
                <p className="assistant-label">{panel.draft.label}</p>
                <TypedDraft active={typing} />
                <p className="assistant-status">{panel.draft.status}</p>
              </div>
            </div>
          </div>
          <figcaption id="assistant-caption" className="assistant-caption">
            {aiManager.caption} <a href={`${demo.href}#/ki-manager`}>{demo.aiLink}</a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
