import { Fragment, type CSSProperties } from 'react';
import { statement } from '../content';
import { Icon, ICON_NAMES, type IconName } from './kit/Icon';
import '../styles/sections/statement.css';

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* The round signs in front of the first word of sentence one and two: the two sides of a sponsorship in the colours
   they have on the two doors further down (clubs blue, firms red). Sentence three (what Sponsuno does) has none. */
const SIGNS: ({ icon: IconName; tone: 'blau' | 'rot' } | null)[] = [
  { icon: 'ball', tone: 'blau' },
  { icon: 'branche', tone: 'rot' },
  null,
];

const isIcon = (name: string): name is IconName => (ICON_NAMES as string[]).includes(name);

/**
 * Statement (parquet, right under the hero): three short sentences in large type, then one row of three points
 * (proof.items, word for word). No heading of its own (the text is the content); the points are a list.
 *
 * The words fill from grey to ink along the scroll (kit primitive fill-words: every word is a span.w with its index
 * --i, the paragraph carries the count --n; spaces stay outside the spans, so screen readers, find-in-page and copy
 * get three normal sentences). The round signs are decoration (aria-hidden) and fill with their word; sign and first
 * word never part at a line break (.st-nb). Start colour, ranges and the tall-screen path are in statement.css.
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
            return (
              <span className="st-sentence" key={s}>
                {s > 0 && ' '}
                {words.map((word, w) => {
                  const i = index++;
                  const span = <span className="w" style={{ '--i': i } as Vars}>{word}</span>;
                  if (w > 0) return <Fragment key={w}> {span}</Fragment>;
                  if (!sign) return <Fragment key={w}>{span}</Fragment>;
                  return (
                    <span className="st-nb" key={w}>
                      <span className={`w st-sign st-sign-${sign.tone}`} style={{ '--i': i } as Vars} aria-hidden="true">
                        <Icon name={sign.icon} size={24} />
                      </span>
                      {span}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </p>
        <ul className="st-points">
          {statement.points.map((point, i) => (
            <li className="st-point" key={point.text} data-reveal="" style={{ '--st-i': i } as Vars}>
              <span className="st-icon" data-icon={point.icon} aria-hidden="true">
                <svg className="st-ring" viewBox="0 0 48 48" focusable="false">
                  <circle cx="24" cy="24" r="23" pathLength={1} transform="rotate(-90 24 24)" />
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
