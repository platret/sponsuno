import icon from '../assets/Sponsuno_Icon.svg';
import { aiManager, demo } from '../content';
import { pageHref } from '../lib/links';
import '../styles/sections/ai.css';

const { draft, reminder, deliverables } = aiManager;

/**
 * Ivory section, the body of /ki-manager/ (InfoPage): what the planned AI manager is meant to do after a match.
 * Its title and intro are the page head band (InfoPage → PageBand, the H1), the card titles are H2 (styled as H3, .pg-h3). A bento grid shows one illustrative
 * draft (navy device frame) and two small light cards. The page ships no JavaScript module; an inline script in its
 * head sets html.scroll-fx (`scrollFx` in pages.ts, entry-server.tsx), so the scroll motion in ai.css runs: from
 * 961 px wide and 700-1999 px tall the bento pins while the device zooms in. Everything else stays still (draft sheet,
 * cards, caption; the device where it does not pin), because it sits in or near the first screen; with reduced
 * motion or without scroll timelines the final layout shows.
 */
export function AiManager() {
  return (
    <section className="section surface-ivory" id="ki-manager" aria-labelledby="ki-title">
      <div className="container">
        <figure className="ai-figure" aria-labelledby="ai-caption">
          {/* .ai-pin: plain block; under .scroll-fx on large screens it holds the bento in place for a short
              stretch while the device zooms in (ai.css, DESIGN.md -> Motion, pinned moment 1 of 2) */}
          <div className="ai-pin">
          <div className="ai-bento">
            <div className="ai-device" data-reveal="" data-scroll="zoom-in">
              <div className="ai-device-bar">
                <img className="ai-device-icon" src={icon} alt="" width={24} height={24} loading="lazy" decoding="async" />
                <p className="ai-device-app">{draft.app}</p>
              </div>
              <div className="ai-device-body">
                <p className="ai-draft-label">{draft.label}</p>
                <div className="ai-draft-sheet" data-scroll="rise">
                  <p className="ai-draft-text">{draft.text}</p>
                  <div className="ai-draft-foot">
                    <p className="ai-draft-status">
                      <span className="ai-draft-dot" aria-hidden="true" />
                      {draft.status}
                    </p>
                    <div className="ai-draft-actions">
                      <span className="ai-chip ai-chip-primary">{draft.primary}</span>
                      <span className="ai-chip ai-chip-outline">{draft.secondary}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ai-side" data-scroll-stagger="">
              <article className="ai-card" data-reveal="" data-scroll="rise">
                <h2 className="pg-h3">{reminder.title}</h2>
                <p className="ai-card-label">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="2" />
                    <path d="M2.25 6.5h11.5M5.5 1.75v3M10.5 1.75v3" />
                  </svg>
                  {reminder.label}
                </p>
                <p className="ai-card-text">{reminder.text}</p>
              </article>

              <article className="ai-card" data-reveal="" data-scroll="rise">
                <h2 className="pg-h3">{deliverables.title}</h2>
                <ul className="ai-checklist">
                  {deliverables.items.map((item) => (
                    <li key={item.text} className={item.done ? 'is-done' : undefined}>
                      <span className="ai-check" aria-hidden="true">
                        {item.done && <svg viewBox="0 0 16 16"><path d="M4.5 8.25l2.5 2.5 4.5-5" /></svg>}
                      </span>
                      <span className="ai-check-text">{item.text}</span>
                      <span className="ai-check-note">{item.note}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
          </div>

          <figcaption className="ai-caption" data-scroll="fade">
            <span id="ai-caption">{aiManager.caption}</span>
            <a className="link-arrow" href={pageHref(`${demo.href}#/ki-manager`)}>
              {aiManager.demoLink}
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
