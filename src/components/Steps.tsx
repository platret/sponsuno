import type { ReactNode } from 'react';
import { match, steps } from '../content';
import { Sticker, TextSticker, type Vars } from './kit/Sticker';
import { Icon, type IconName } from './kit/Icon';
import { MatchCard } from './MatchCard';
import '../styles/sections/steps.css';


/** One court line behind a scene (kit line style: .cl-path), drawn in the scene's own 220 x 196 box. */
const SceneLine = ({ d, line }: { d: string; line: 'blau' | 'rot' | 'gruen' }) => (
  <svg className="steps-line" viewBox="0 0 220 196" focusable="false">
    <path className="cl-path" data-line={line} d={d} pathLength={1} fill="none" />
  </svg>
);

/** "4 von 4", cut from the match card's result line (content.ts), so the scene and the card always say the same.
    Empty when that line no longer holds such a figure: scene two then shows no score sticker (never an empty pill). */
const SCORE = /\d+ von \d+/.exec(match.result)?.[0] ?? '';

/** Rows of the little suggestion list in scene two: icon and disc colour; the first one is the highlighted match. */
const ROWS: { icon: IconName; tone: 'gelb' | 'blau' | 'gruen' }[] = [
  { icon: 'branche', tone: 'gelb' },
  { icon: 'haus', tone: 'blau' },
  { icon: 'unterstuetzung', tone: 'gruen' },
];

/**
 * The three scenes, composed from kit pieces. Each is one small picture (about 200 px) with one court line:
 * 1 both sides in one circle (ball and note for sport and culture, the pretzel for local business),
 * 2 a list of suggestions with the best one marked "4 von 4",
 * 3 the start number with a check: the match.
 * Pieces sit in .steps-p wrappers (position, hover); --d staggers their settle. Only the start number can be collected.
 */
const SCENES: ReactNode[] = [
  <>
    <SceneLine line="blau" d="M110 14a84 84 0 1 0 0 168a84 84 0 1 0 0-168Z" />
    <span className="steps-p steps-s1-note" style={{ '--d': '60ms' } as Vars}>
      <Sticker id="note" size={78} rotate={-11} collectable={false} />
    </span>
    <span className="steps-p steps-s1-ball" style={{ '--d': '0ms' } as Vars}>
      <Sticker id="ball" size={108} rotate={-8} collectable={false} />
    </span>
    <span className="steps-p steps-s1-brezel" style={{ '--d': '140ms' } as Vars}>
      <Sticker id="brezel" size={112} rotate={9} collectable={false} />
    </span>
  </>,
  <>
    <SceneLine line="rot" d="M6 176H170a34 34 0 0 0 34-34V8" />
    <span className="steps-p steps-card">
      {ROWS.map((row, r) => (
        <span className={r === 0 ? 'steps-row steps-row-on' : 'steps-row'} key={row.icon} style={{ '--d': `${r * 70}ms` } as Vars}>
          <span className={`steps-dot steps-dot-${row.tone}`}><Icon name={row.icon} size={14} /></span>
          <span className="steps-bars"><i /><i /></span>
        </span>
      ))}
    </span>
    {SCORE && (
      <span className="steps-p steps-score" style={{ '--d': '260ms' } as Vars}>
        <TextSticker tone="gelb" rotate={8}>{SCORE}</TextSticker>
      </span>
    )}
  </>,
  <>
    <SceneLine line="gruen" d="M10 90A100 100 0 0 0 210 90" />
    <span className="steps-p steps-s3-bib" style={{ '--d': '0ms' } as Vars}>
      <Sticker id="startnummer" size={150} rotate={-6} />
    </span>
    <span className="steps-p steps-check"><Icon name="check" size={30} /></span>
  </>,
];

/**
 * "So funktioniert es" (#ablauf, parkett-2): the H2, three steps as an ordered list (a sticker scene, the step number
 * as a small label, the title, one sentence), then the match card with its "Beispieldaten" label. On desktop the card
 * lies on the steps' own three columns, so its green result panel stands right under step three; on phones it follows
 * step three directly. Each step settles when it scrolls into view (data-reveal; the scene's line draws, its stickers
 * settle one after another) and reacts when the pointer is over it. Without motion or JS everything simply stands.
 * Classes prefixed steps-.
 */
export function Steps() {
  return (
    <section className="steps section surface-parkett-2" id="ablauf" aria-labelledby="ablauf-title">
      <div className="container">
        <h2 className="steps-title" id="ablauf-title">{steps.title}</h2>
        <ol className="steps-list">
          {steps.items.map((step, i) => (
            <li className="steps-item" key={step.title} data-reveal="" style={{ '--i': i } as Vars}>
              <div className={`steps-art steps-art-${i + 1}`} data-art={step.art} aria-hidden="true">
                {SCENES[i]}
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
