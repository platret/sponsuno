import { useState } from 'react';
import { ribbon } from '../content';

/** Tilted gold band, styled like pitch-side advertising. Purely illustrative list of disciplines. */
export function Ribbon() {
  const [paused, setPaused] = useState(false);
  return (
    <div className="ribbon-clip">
      <div className={`ribbon${paused ? ' is-paused' : ''}`}>
        <button className="ribbon-pause" type="button" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
          <span className="visually-hidden">{paused ? ribbon.resume : ribbon.pause}</span>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path className="i-pause" d="M5 3.5v9M11 3.5v9" />
            <path className="i-play" d="M5 3l8 5-8 5z" />
          </svg>
        </button>
        <div className="ribbon-track">
          {/* The list is duplicated so the loop is seamless; the copy is hidden from assistive tech */}
          {[0, 1].map((copy) => (
            <ul key={copy} className="ribbon-list" aria-label={copy === 0 ? ribbon.label : undefined} aria-hidden={copy === 1 || undefined}>
              {ribbon.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
