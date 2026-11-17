import { wordband } from '../content';
import '../styles/sections/wordband.css';

/**
 * Word band (ink, full width): one small label and two rows of giant words in the display face, alternating parquet
 * fill and outline. The big rows are decoration: aria-hidden, each row set twice so it fills any width and can slide,
 * and the words are drawn by CSS from `data-word` (no second copy of the text in the page, nothing for find-in-page or
 * a contrast checker to trip over in the outline words). Screen readers get the label and the words as two plain lists. Static skeleton: the rows stand still, the second
 * shifted against the first. `data-header-dark` tells the landing header to turn ink while the band runs under it.
 * Classes prefixed wb-.
 */
export function WordBand() {
  return (
    <section className="wb surface-tinte" aria-labelledby="wb-label" data-header-dark="">
      <div className="container">
        <p className="label wb-label" id="wb-label">{wordband.label}</p>
      </div>
      {wordband.rows.map((row, r) => (
        <ul className="visually-hidden" key={r}>
          {row.map((word) => <li key={word}>{word}</li>)}
        </ul>
      ))}
      {/* TODO(kit): data-scroll="slide-x" on each .wb-row (opposite directions: --slide-dir 1 / -1), and three
          <Sticker> sitting on the letters in an aria-hidden layer .wb-stickers */}
      <div className="wb-rows" aria-hidden="true">
        {wordband.rows.map((row, r) => (
          <div className={`wb-row wb-row-${r + 1}`} key={r}>
            {[0, 1].map((copy) => (
              <span className="wb-set" key={copy}>
                {row.map((word, i) => (
                  <span className={`wb-word display${(i + copy * row.length) % 2 ? ' wb-outline' : ''}`} data-word={word} key={word} />
                ))}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
