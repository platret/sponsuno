import type { ReactNode } from 'react';
import { steps } from '../content';
import type { Vars } from './kit/Sticker';
import { Icon, type IconName } from './kit/Icon';
import { MatchCard } from './MatchCard';
import '../styles/sections/steps.css';

/** A kit line icon inside a drawing, at 1.5 x (36 units): its 2 px stroke then has the drawing's own weight of 3. */
const Glyph = ({ name, x, y }: { name: IconName; x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <Icon name={name} size={36} />
  </g>
);

/**
 * The three drawings, one hand: box 220 x 196, an ink line of 3 units, parquet fills, and exactly one accent shape per
 * drawing (blue, red, green). Each drawing is two layers of the same box: `ink`, and `accent`, which lies in a span
 * (.steps-go) over it, because that is the only part that moves and scale / translate animations never go on an SVG
 * element (DESIGN.md, Motion). All three stand on y 186 and start at x 2, so they share a baseline and the left edge
 * of the text below. Vocabulary: a circle with a person is the side that looks for sponsors, a rounded square with a
 * shop front is a firm.
 * 1 Both sides lead to one place (the pin).
 * 2 A short list of firms, the first row picked and pulled out.
 * 3 Two pieces that fit, with a check.
 */
const DRAWINGS: { ink: ReactNode; accent: ReactNode }[] = [
  {
    ink: (
      <>
        <circle className="steps-ink steps-paper" cx="30" cy="44" r="28" />
        <Glyph name="profil" x={12} y={26} />
        <rect className="steps-ink steps-paper" x="162" y="16" width="56" height="56" rx="14" />
        <Glyph name="branche" x={172} y={26} />
        <path className="steps-ink steps-draw" pathLength={1} d="M30 72V110a26 26 0 0 0 26 26H84" />
        <path className="steps-ink steps-draw" pathLength={1} d="M190 72V110a26 26 0 0 1-26 26H136" />
      </>
    ),
    accent: (
      <>
        <path className="steps-acc" d="M110 186C96 170 84 154 84 136a26 26 0 0 1 52 0C136 154 124 170 110 186Z" />
        <circle className="steps-on" cx="110" cy="136" r="9" />
      </>
    ),
  },
  {
    ink: (
      <>
        <rect className="steps-ink steps-paper" x="2" y="16" width="166" height="170" rx="16" />
        <rect className="steps-ink" x="25" y="91" width="20" height="20" rx="6" />
        <path className="steps-ink" d="M57 95H140M57 107H104" />
        <rect className="steps-ink" x="25" y="143" width="20" height="20" rx="6" />
        <path className="steps-ink" d="M57 147H132M57 159H96" />
      </>
    ),
    accent: (
      <>
        <rect className="steps-acc" x="15" y="29" width="181" height="40" rx="12" />
        <rect className="steps-on" x="25" y="39" width="20" height="20" rx="6" />
        <path className="steps-on-line" d="M57 43H140M57 55H104" />
      </>
    ),
  },
  {
    ink: (
      <>
        <rect className="steps-ink steps-paper" x="2" y="50" width="188" height="136" rx="18" />
        <path className="steps-ink" d="M90 50V104a16 16 0 1 1 0 28V186" />
        <Glyph name="profil" x={28} y={100} />
        <Glyph name="branche" x={134} y={100} />
      </>
    ),
    accent: (
      <>
        <circle className="steps-acc steps-knock" cx="184" cy="50" r="30" />
        <path className="steps-on-line" d="M171 51l9 9 17-18" />
      </>
    ),
  },
];

// One drawing per step, by position. A step added or removed in content.ts must not silently show an empty box:
// the prerender (npm run build) stops instead.
if (steps.items.length !== DRAWINGS.length) {
  throw new Error(`Steps: steps.items (content.ts) has ${steps.items.length} entries, Steps.tsx draws ${DRAWINGS.length}; add or remove a drawing`);
}

/**
 * "So funktioniert es" (#ablauf, parkett-2): the H2, three steps as an ordered list (a calm line drawing, the step
 * number as a small label, the title, one sentence), then the match card with its "Beispieldaten" tag. On wide
 * screens the card lies on the steps' own three columns, so its green result panel stands under step three; on phones
 * it follows step three directly. Each step fades in when it scrolls into view (data-reveal); then its accent shape pops in, and
 * it moves a little when the pointer is over the step. Without motion or JS everything simply stands.
 * No stickers in this block. Classes prefixed steps-.
 */
export function Steps() {
  return (
    <section className="steps section surface-parkett-2" id="ablauf" aria-labelledby="ablauf-title">
      <div className="container">
        <h2 className="steps-title" id="ablauf-title">{steps.title}</h2>
        <ol className="steps-list">
          {steps.items.map((step, i) => (
            <li className="steps-item" key={step.title} data-reveal="" style={{ '--i': i } as Vars}>
              <div className={`steps-art steps-art-${i + 1}`} aria-hidden="true">
                <svg className="steps-svg" viewBox="0 0 220 196" focusable="false">{DRAWINGS[i]?.ink}</svg>
                <span className="steps-go">
                  <svg className="steps-svg" viewBox="0 0 220 196" focusable="false">{DRAWINGS[i]?.accent}</svg>
                </span>
              </div>
              <span className="steps-num label" aria-hidden="true">{`0${i + 1}`}</span>
              <h3 className="steps-item-title">{step.title}</h3>
              <p className="steps-item-text">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="steps-match" data-reveal="">
          <MatchCard />
        </div>
      </div>
    </section>
  );
}
