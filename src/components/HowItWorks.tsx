import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { hero, howItWorks, type Role } from '../content';
import '../styles/sections/how.css';

type TrackKey = 'seeker' | 'sponsor';

const TRACKS: { key: TrackKey; role: Role; cta: string; btn: string }[] = [
  { key: 'seeker', role: hero.ctaSeeker.role, cta: hero.ctaSeeker.label, btn: 'btn-navy' },
  { key: 'sponsor', role: hero.ctaSponsor.role, cta: hero.ctaSponsor.label, btn: 'btn-outline' },
];

const NARROW = '(max-width: 960px)';
/** Screen-reader context for each step heading. Proposed as howItWorks.stepLabel in content.ts. */

/**
 * Two tracks, one process. Desktop: side by side. Phones: a tab switch shows one track at a time.
 * The server and the first client render are identical (both tracks, switch hidden), so without JS
 * both tracks simply stack. Once html.js is set before first paint (index.html), CSS shows the phone
 * layout before hydration and React only adds roles, aria-selected and data-active, so nothing moves.
 * The gold line between the numerals draws once per track.
 */
export function HowItWorks({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  const [tabs, setTabs] = useState(false);
  const [active, setActive] = useState<TrackKey>('seeker');
  const tabRefs = useRef<Record<TrackKey, HTMLButtonElement | null>>({ seeker: null, sponsor: null });

  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const sync = () => setTabs(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const select = (key: TrackKey, focus = false) => {
    setActive(key);
    if (focus) tabRefs.current[key]?.focus();
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = TRACKS.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    select(TRACKS[next].key, true);
  };

  return (
    <section className="how section surface-paper" id="ablauf" aria-labelledby="how-title">
      <div className="container">
        <header className="section-head" data-reveal="">
          <h2 id="how-title">{howItWorks.title}</h2>
          <p className="section-intro">{howItWorks.intro}</p>
        </header>

        <div className="how-switch-wrap" hidden={!tabs}>
          <p className="how-switch-label" id="how-switch-label">{howItWorks.switchLabel}</p>
          <div className="how-switch" role="tablist" aria-labelledby="how-switch-label">
            {TRACKS.map((t, i) => {
              const selected = active === t.key;
              return (
                <button
                  key={t.key}
                  ref={(el) => { tabRefs.current[t.key] = el; }}
                  type="button"
                  role="tab"
                  id={`how-tab-${t.key}`}
                  className="how-tab"
                  aria-selected={selected}
                  aria-controls={`how-panel-${t.key}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(t.key)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  {howItWorks.tracks[t.key].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="how-tracks" data-active={tabs ? active : undefined}>
          {TRACKS.map((t) => {
            const track = howItWorks.tracks[t.key];
            return (
              <div
                key={t.key}
                className={`how-track how-track-${t.key}`}
                id={`how-panel-${t.key}`}
                role={tabs ? 'tabpanel' : undefined}
                aria-labelledby={tabs ? `how-tab-${t.key}` : undefined}
                data-reveal=""
              >
                <p className="how-label" id={`how-label-${t.key}`}>{track.label}</p>
                <ol className="how-steps" role="list" aria-labelledby={`how-label-${t.key}`}>
                  {track.steps.map((step, i) => (
                    <li key={step.title} className="how-step" style={{ '--i': i } as CSSProperties}>
                      <span className="how-num" aria-hidden="true">{i + 1}</span>
                      <div className="how-step-body">
                        <h3>
                          <span className="visually-hidden">{`${track.label}, ${howItWorks.stepLabel} ${i + 1}: `}</span>
                          {step.title}
                        </h3>
                        <p>{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <a className={`btn ${t.btn} how-cta`} href="#warteliste" onClick={() => onChooseRole(t.role)}>
                  {t.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
