import { Fragment } from 'react';
import { statement } from '../content';
import { Icon, ICON_NAMES, type IconName } from './kit/Icon';
import type { Vars } from './kit/Sticker';
import '../styles/sections/statement.css';


/* The round signs, one per sentence, in a hanging column of their own (so every line of text shares one left edge):
   the two sides of a sponsorship in the colours they have on the two doors further down (clubs blue, firms red), and
   an ink check for what Sponsuno does with them. A sentence without an entry simply has an empty first column. */
const SIGNS: { icon: IconName; tone: 'blau' | 'rot' | 'tinte' }[] = [
  { icon: 'ball', tone: 'blau' },
  { icon: 'branche', tone: 'rot' },
  { icon: 'check', tone: 'tinte' },
];

const isIcon = (name: string): name is IconName => (ICON_NAMES as string[]).includes(name);

/**
 * Statement (parquet, right under the hero): three short sentences in large type, then one row of three points
 * (proof.items, word for word). No heading of its own (the text is the content); the points are a list.
 *
 * The words fill from grey to ink along the scroll (kit primitive fill-words: every word is a span.w with its index
 * --i, the paragraph carries the count --n; spaces stay outside the spans, so screen readers, find-in-page and copy
 * get three normal sentences). Each sentence is a small grid: the round sign in the first column, the words in the
 * second (.st-words), so a wrapped line hangs under the sentence's first word and all text starts on one edge. The
 * signs are decoration (aria-hidden) and fill with their first word. Start colour, ranges and the tall-screen path
 * are in statement.css.
 * Browsers without scroll timelines get the plain reveal (data-reveal), no JS and reduced motion the final state.
 * The points appear one after another (data-reveal with a delay from --st-i), their rings draw once.
 * Classes prefixed st- (the parked scroll story used the same prefix; the two are never built together).
 */
export function Statement() {
  const sentences = statement.sentences.map((sentence) => sentence.split(' '));
  const total = sentences.reduce((sum, words) => sum + words.length, 0);
  let index = 0;

  return (
    <section className="st section surface-parkett" id="idee">
      <div className="container">
        <p className="st-text" data-scroll="fill-words" data-reveal="" style={{ '--n': total } as Vars}>
          {sentences.map((words, s) => {
            const sign = SIGNS[s];
            const first = index;
            return (
              <span className="st-sentence" key={s}>
                {sign && (
                  <span className={`w st-sign st-sign-${sign.tone}`} style={{ '--i': first } as Vars} aria-hidden="true">
                    <Icon name={sign.icon} size={24} />
                  </span>
                )}
                <span className="st-words">
                  {s > 0 && ' '}
                  {words.map((word, w) => (
                    <Fragment key={w}>
                      {w > 0 && ' '}
                      <span className="w" style={{ '--i': index++ } as Vars}>{word}</span>
                    </Fragment>
                  ))}
                </span>
              </span>
            );
          })}
        </p>
        <ul className="st-points">
          {statement.points.map((point, i) => (
            <li className="st-point" key={point.text} data-reveal="" style={{ '--st-i': i } as Vars}>
              <span className="st-icon" data-icon={point.icon} aria-hidden="true">
                <svg className="st-ring" viewBox="0 0 48 48" focusable="false">
                  {/* A full circle as a path that starts at twelve o'clock (where the ring starts to draw) */}
                  <path d="M24 1a23 23 0 1 1 0 46a23 23 0 1 1 0-46" pathLength={1} />
                </svg>
                {isIcon(point.icon) && <Icon name={point.icon} size={22} />}
              </span>
              <span className="st-point-text">{point.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
