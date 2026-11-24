import { useRef, useState, type KeyboardEvent } from 'react';
import { hero, howItWorks, type Role } from '../content';
import '../styles/sections/how.css';

type TrackKey = 'seeker' | 'sponsor';

const TRACKS: { key: TrackKey; role: Role; cta: string }[] = [
  { key: 'seeker', role: hero.ctaSeeker.role, cta: hero.ctaSeeker.label },
  { key: 'sponsor', role: hero.ctaSponsor.role, cta: hero.ctaSponsor.label },
];

/**
 * «So funktioniert es» (D1 redesign, 2026-11-24): a segmented switch between the two tracks, then the four steps of the
 * chosen track side by side under a thin rule, numbered 01-04 (Mobbin references: Beside, Escape), and one call to
 * action. No cards. The prerender shows both tracks; once html.js is set (before first paint) CSS shows only the
 * active one, so without JS both tracks simply stack and the switch stays hidden.
 */
export function HowItWorks({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  const [active, setActive] = useState<TrackKey>('seeker');
  const tabRefs = useRef<Record<TrackKey, HTMLButtonElement | null>>({ seeker: null, sponsor: null });

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = TRACKS.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(TRACKS[next].key);
    tabRefs.current[TRACKS[next].key]?.focus();
  };

  return (
    <section className="how section surface-paper" id="ablauf" aria-labelledby="how-title">
      <div className="container">
        <div className="how-head" data-reveal="" data-scroll="rise">
          <div>
            <h2 id="how-title">{howItWorks.title}</h2>
            <p className="section-intro">{howItWorks.intro}</p>
          </div>
          <div className="how-switch" role="tablist" aria-label={howItWorks.switchLabel}>
            {TRACKS.map((t, i) => (
              <button
                key={t.key}
                ref={(el) => { tabRefs.current[t.key] = el; }}
                type="button"
                role="tab"
                id={`how-tab-${t.key}`}
                className="how-tab"
                aria-selected={active === t.key}
                aria-controls={`how-panel-${t.key}`}
                tabIndex={active === t.key ? 0 : -1}
                onClick={() => setActive(t.key)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                {howItWorks.tracks[t.key].label}
              </button>
            ))}
          </div>
        </div>

        {TRACKS.map((t) => {
          const track = howItWorks.tracks[t.key];
          return (
            <div
              key={t.key}
              className="how-track"
              id={`how-panel-${t.key}`}
              role="tabpanel"
              aria-labelledby={`how-tab-${t.key}`}
              data-on={active === t.key ? '' : undefined}
            >
              <p className="label how-label">{track.label}</p>
              <ol className="how-steps" role="list" data-scroll-stagger="">
                {track.steps.map((step, i) => (
                  <li key={step.title} className="how-step" data-reveal="" data-scroll="rise">
                    <span className="how-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <h3>
                      <span className="visually-hidden">{`${howItWorks.stepLabel} ${i + 1}: `}</span>
                      {step.title}
                    </h3>
                    <p>{step.text}</p>
                  </li>
                ))}
              </ol>
              <a className="btn btn-graphit how-cta" href="#warteliste" onClick={() => onChooseRole(t.role)}>{t.cta}</a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
