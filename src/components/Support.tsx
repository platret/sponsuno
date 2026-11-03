import type { ReactNode } from 'react';
import { support } from '../content';
import '../styles/sections/support.css';

type KindIcon = (typeof support.kinds)[number]['icon'];

/**
 * Line icons drawn in gold dark (stroke only, see support.css). Each glyph carries its own viewBox,
 * cropped so the three share a similar optical width (about 36px of the 40px box) and a common bottom edge.
 */
const icons: Record<KindIcon, { viewBox: string; glyph: ReactNode }> = {
  money: {
    viewBox: '5 -1 38 38',
    glyph: (
      <>
        <rect x="7" y="14" width="34" height="20" rx="3" />
        <circle cx="24" cy="24" r="4.5" />
      </>
    ),
  },
  gear: {
    viewBox: '3 0 42 42',
    glyph: (
      <>
        <circle cx="13" cy="31" r="8" />
        <circle cx="35" cy="31" r="8" />
        <path d="M13 31l7-12h11l4 12M20 19l5 12h-12M18 15h5M28 15h4l-1 4" />
      </>
    ),
  },
  shared: {
    viewBox: '6 3 36 36',
    glyph: (
      <>
        <path d="M8 36h32M12 36V22l12-8 12 8v14" />
        <path d="M20 36v-8h8v8" />
        <circle cx="24" cy="21" r="2.5" />
      </>
    ),
  },
};

/** Paper section: support is not only money. Three kinds side by side, separated by hairlines, no cards. */
export function Support() {
  return (
    <section className="section surface-paper sup" id="sachleistungen" aria-labelledby="sup-title">
      <div className="container">
        <div className="section-head sup-head">
          <span className="sup-rule" aria-hidden="true" />
          <h2 id="sup-title">{support.title}</h2>
          <p className="section-intro">{support.intro}</p>
        </div>
        <ul className="sup-kinds" role="list">
          {support.kinds.map((kind) => (
            <li className="sup-kind" data-reveal="" key={kind.icon}>
              <svg className="sup-icon" viewBox={icons[kind.icon].viewBox} width="40" height="40" aria-hidden="true" focusable="false">
                {icons[kind.icon].glyph}
              </svg>
              <h3 className="sup-kind-title">{kind.title}</h3>
              <p className="sup-kind-text">{kind.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
