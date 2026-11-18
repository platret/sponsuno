import { wordband } from '../content';
import { CourtLines } from './kit/CourtLines';
import { Sticker, type StickerId } from './kit/Sticker';
import '../styles/sections/wordband.css';

/* The three stickers of the band and the word each one sits on (place and size in wordband.css, .wb-stk-<id>, in em
   of the word, so they stay on their letter at every size): the ball in the o of Sport, the note on the second u of
   Kultur, the pennant on the T of Turnverein. `size` is the nominal size the kit uses for its hairline. */
const STICKERS: Record<string, { id: StickerId; size: number; rotate: number }> = {
  Sport: { id: 'ball', size: 120, rotate: -9 },
  Kultur: { id: 'note', size: 104, rotate: 8 },
  Turnverein: { id: 'wimpel', size: 96, rotate: -7 },
};

// The stickers are looked up by word, and three of the album's ids are found here on phones. A word that is renamed
// in content.ts must not silently lose its sticker: the prerender (npm run build) stops instead.
const [MAIN, EXAMPLES] = wordband.rows;
for (const word of Object.keys(STICKERS)) {
  if (!wordband.rows.flat().includes(word)) {
    throw new Error(`WordBand: no word "${word}" in wordband.rows (content.ts) for its sticker; update STICKERS and the lockup in wordband.css`);
  }
}
if (MAIN.length !== 2) throw new Error('WordBand: row one must be exactly the two words of the lockup (wordband.css)');

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
 * Word band (ink, full width): one small label and rows of giant words in the display face that slide in opposite
 * directions with the scroll (kit primitive slide-x on each row, all on the band's own view timeline). Row one is
 * Sport and Kultur in parquet; row two the disciplines, alternating parquet fill and outline.
 *
 * At rest (no motion, and half way through the pass) the rows are a lockup that fills the band from gutter to gutter:
 * row one starts at the left gutter, row two ends at the right one (sizes in wordband.css). From 641 px the lockup is
 * «Sport Kultur» over «Triathlon Chor Turnverein». On phones one word fills a row, so row one is set twice: «Sport»
 * (with Kultur following outside the band) and under it the same two words starting with «Kultur» (.wb-track-1b,
 * phones only), sliding the other way; the lockup is «Sport» / «Kultur» / «Turnverein», and culture is on screen at
 * rest (copy rule 7). Copies before and after the words (.wb-pre, .wb-post) keep the band full while the rows slide.
 * Three stickers sit on letters and move with their row; they can be collected (sticker album). The lane lines behind
 * draw with the scroll.
 *
 * The giant rows are decoration: aria-hidden, and the words are drawn by CSS from `data-word` (no second copy of the
 * text in the page, nothing for find-in-page or a contrast checker to trip over in the outline words). Screen readers
 * get the label and all words once as one plain list (exactly the words that are shown). `data-header-dark` tells the
 * landing header to turn ink while the band runs under it. Classes prefixed wb-.
 */
export function WordBand() {
  const swapped = [MAIN[1], MAIN[0]];
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
            <span className="wb-set wb-pre"><Words words={MAIN} alternate={false} /></span>
            <span className="wb-set"><Words words={MAIN} alternate={false} stickers /></span>
            <span className="wb-set wb-post"><Words words={MAIN} alternate={false} /></span>
          </div>
        </div>
        {/* Phones only (wordband.css): row one once more, starting with its second word and sliding the other way */}
        <div className="wb-track wb-track-1b">
          <div className="wb-row wb-row-1b" data-scroll="slide-x">
            <span className="wb-set wb-pre"><Words words={swapped} alternate={false} /></span>
            <span className="wb-set"><Words words={swapped} alternate={false} stickers /></span>
          </div>
        </div>
        <div className="wb-track wb-track-2">
          <div className="wb-row wb-row-2" data-scroll="slide-x">
            <span className="wb-set"><Words words={EXAMPLES} alternate stickers /></span>
            <span className="wb-set wb-post"><Words words={EXAMPLES.slice(0, 3)} alternate from={EXAMPLES.length} /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
