import { wordband } from '../content';
import { CourtLines } from './kit/CourtLines';
import { Sticker, type StickerId } from './kit/Sticker';
import '../styles/sections/wordband.css';

/* The three stickers of the band and the word each one sits on (place and size in wordband.css, .wb-stk-<id>, in em
   of the word, so they stay on their letter at every size): the ball in the o of Sport, the note on the l of Kultur,
   the pennant on the T of Turnverein. `size` is the nominal size the kit uses for its hairline. */
const STICKERS: Record<string, { id: StickerId; size: number; rotate: number }> = {
  Sport: { id: 'ball', size: 120, rotate: -9 },
  Kultur: { id: 'note', size: 104, rotate: 8 },
  Turnverein: { id: 'wimpel', size: 96, rotate: -7 },
};

/** One run of words. `from` continues the fill/outline alternation of row two across its copies. */
function Words({ words, alternate, from = 0, stickers = false }: { words: string[]; alternate: boolean; from?: number; stickers?: boolean }) {
  return (
    <>
      {words.map((word, i) => {
        const sticker = stickers ? STICKERS[word] : undefined;
        return (
          <span className={`wb-word display${alternate && (from + i) % 2 ? ' wb-outline' : ''}`} data-word={word} key={word}>
            {sticker && (
              <Sticker id={sticker.id} size={sticker.size} rotate={sticker.rotate} className={`wb-stk wb-stk-${sticker.id}`} data-reveal="" />
            )}
          </span>
        );
      })}
    </>
  );
}

/**
 * Word band (ink, full width): one small label and two rows of giant words in the display face that slide in opposite
 * directions with the scroll (kit primitive slide-x on each row, both on the band's own view timeline). Row one is
 * Sport, Kultur, Gewerbe in parquet; row two the disciplines, alternating parquet fill and outline.
 *
 * At rest (no motion, and half way through the pass) the two rows are a lockup that fills the band from gutter to
 * gutter: row one starts at the left gutter, row two ends at the right one (sizes in wordband.css). Copies before and
 * after the words (.wb-pre, .wb-post) keep the band full while the rows slide. Three stickers sit on letters and move
 * with their row; they can be collected (sticker album). The lane lines behind draw with the scroll.
 *
 * The giant rows are decoration: aria-hidden, and the words are drawn by CSS from `data-word` (no second copy of the
 * text in the page, nothing for find-in-page or a contrast checker to trip over in the outline words). Screen readers
 * get the label and all words once as one plain list. `data-header-dark` tells the landing header to turn ink while
 * the band runs under it. Classes prefixed wb-.
 */
export function WordBand() {
  const [main, examples] = wordband.rows;
  return (
    <section className="wb surface-tinte" aria-labelledby="wb-label" data-header-dark="">
      {/* Lane lines: the kit's band drawing twice, each clipped to one line with its ticks (upper and lower edge) */}
      <div className="wb-lane wb-lane-top"><CourtLines variant="band" draw="scroll" className="wb-lines" /></div>
      <div className="wb-lane wb-lane-end"><CourtLines variant="band" draw="scroll" className="wb-lines" /></div>
      <p className="label wb-label" id="wb-label">{wordband.label}</p>
      <ul className="visually-hidden">
        {wordband.rows.flat().map((word) => <li key={word}>{word}</li>)}
      </ul>
      <div className="wb-rows" aria-hidden="true">
        <div className="wb-track wb-track-1">
          <div className="wb-row wb-row-1" data-scroll="slide-x">
            <span className="wb-set wb-pre"><Words words={main} alternate={false} /></span>
            <span className="wb-set"><Words words={main} alternate={false} stickers /></span>
            <span className="wb-set wb-post"><Words words={main} alternate={false} /></span>
          </div>
        </div>
        <div className="wb-track wb-track-2">
          <div className="wb-row wb-row-2" data-scroll="slide-x">
            <span className="wb-set"><Words words={examples} alternate stickers /></span>
            <span className="wb-set wb-post"><Words words={examples.slice(0, 3)} alternate from={examples.length} /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
