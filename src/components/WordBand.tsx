import { wordband } from '../content';
import { CourtLines } from './kit/CourtLines';
import { Sticker } from './kit/Sticker';
import '../styles/sections/wordband.css';

/* The band's one sticker, the note, sits on the upper right corner of this word of row one (place and size in
   wordband.css, .wb-note, in em of the word, so it keeps its corner at every size). It is in the page exactly once and is the album's note. */
const NOTE_WORD = 'Kultur';

// The lockup in wordband.css is built from row one being exactly two words with the note's word second (on phones
// row one rests on that word). A word that is renamed or moved in content.ts must not silently lose the sticker or
// break the lockup: the prerender (npm run build) stops instead.
const [MAIN, EXAMPLES] = wordband.rows;
if (MAIN.length !== 2 || MAIN[1] !== NOTE_WORD) {
  throw new Error(`WordBand: row one of wordband.rows (content.ts) must be two words ending in "${NOTE_WORD}"; update NOTE_WORD and the lockup in wordband.css`);
}

/** One run of words. `from` continues the fill/outline alternation of row two across its copies. */
function Words({ words, alternate = false, from = 0, note = false }: { words: string[]; alternate?: boolean; from?: number; note?: boolean }) {
  return (
    <>
      {words.map((word, i) => (
        <span className={`wb-word display${alternate && (from + i) % 2 ? ' wb-outline' : ''}`} data-word={word} key={word}>
          {note && word === NOTE_WORD && <Sticker id="note" size={72} rotate={6} className="wb-note" data-reveal="" />}
        </span>
      ))}
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
 * «Sport Kultur» over «Triathlon Chor Turnverein». On phones one word fills a row, so row one is set twice: first a
 * copy that rests on «Sport» (.wb-track-1b, phones only, no sticker), then row one itself, set back by one word so
 * it rests on «Kultur» and sliding the other way; the lockup is «Sport» / «Kultur» / «Turnverein», and culture is on
 * screen at rest (copy rule 7). Copies before and after the words (.wb-pre, .wb-post) keep the band full while the
 * rows slide.
 *
 * The label sits on the page container (the left edge of the header and of every other block); the rows are a
 * full-bleed graphic. Decoration is kept to two things: one small sticker, the note on «Kultur» (it moves with its row and can be
 * collected for the sticker album), and two thin yellow lane lines near the upper and lower edge, which draw with
 * the scroll. No line passes behind the label or the words.
 *
 * The giant rows are decoration: aria-hidden, and the words are drawn by CSS from `data-word` (no second copy of the
 * text in the page, nothing for find-in-page or a contrast checker to trip over in the outline words). Screen readers
 * get the label and all words once as one plain list (exactly the words that are shown). `data-header-dark` tells the
 * landing header to turn ink while the band runs under it. Classes prefixed wb-.
 */
export function WordBand() {
  return (
    <section className="wb surface-tinte" aria-labelledby="wb-label" data-header-dark="">
      <CourtLines variant="band" draw="scroll" className="wb-line wb-line-top" />
      <CourtLines variant="band" draw="scroll" className="wb-line wb-line-end" />
      <p className="container label wb-label" id="wb-label">{wordband.label}</p>
      <ul className="visually-hidden">
        {wordband.rows.flat().map((word) => <li key={word}>{word}</li>)}
      </ul>
      <div className="wb-rows" aria-hidden="true">
        {/* Phones only (wordband.css): row one once more, resting on its first word */}
        <div className="wb-track wb-track-1b">
          <div className="wb-row wb-row-1b" data-scroll="slide-x">
            <span className="wb-set wb-pre"><Words words={MAIN} /></span>
            <span className="wb-set"><Words words={MAIN} /></span>
          </div>
        </div>
        <div className="wb-track wb-track-1">
          <div className="wb-row wb-row-1" data-scroll="slide-x">
            <span className="wb-set wb-pre"><Words words={MAIN} /></span>
            <span className="wb-set"><Words words={MAIN} note /></span>
            <span className="wb-set wb-post"><Words words={MAIN} /></span>
          </div>
        </div>
        <div className="wb-track wb-track-2">
          <div className="wb-row wb-row-2" data-scroll="slide-x">
            <span className="wb-set"><Words words={EXAMPLES} alternate /></span>
            <span className="wb-set wb-post"><Words words={EXAMPLES.slice(0, 3)} alternate from={EXAMPLES.length} /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
