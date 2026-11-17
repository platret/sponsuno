// Stickers of the «Turnhalle» look (brief: design system v2): six flat vector drawings with a white die-cut border,
// plus the pill-shaped text sticker. Decorative: the drawings are aria-hidden, a TextSticker carries real text.
// Styles in styles/kit.css (.stk, .tstk). All drawings are original and use only the palette of tokens.css.
//
// How a drawing is built (viewBox 0 0 120 120, the same recipe for all six, so the set reads as one hand):
//   1. `sil`: the silhouette. Each entry is drawn twice behind the artwork with round joins: once as the hairline
//      (.stk-edge) and once in white (.stk-cut), 6.25 units wider than the artwork on every side (5 px at 96 px).
//      `w` is the width of the artwork's own ink pass on that shape (7 for filled shapes: 3.5 units of outline
//      outside the geometry; the full stroke width for stroked shapes such as the pretzel or the cord).
//   2. `art`: an ink pass (.stk-o: the same shapes, filled and stroked in ink, 7 units wide), then the flat fills on
//      top, then ink lines (.stk-l, 3.5 units) and white highlights (.stk-h). One line weight for the whole set.
//   3. `slot`: a rough outline of the whole sticker, shown dashed when the sticker has been collected.
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import '../../styles/kit.css';

export const STICKER_IDS = ['ball', 'note', 'brezel', 'startnummer', 'wimpel', 'pfeife'] as const;
export type StickerId = (typeof STICKER_IDS)[number];

type Sil = { d: string; w?: number; open?: boolean };
type Drawing = { sil: Sil[]; slot: string; shift?: string; art: ReactNode };

/* ---- ball: a generic two-tone hall ball, four curved panels around an off-centre pole ---- */
const BALL = 'M60 17a43 43 0 1 0 0 86a43 43 0 1 0 0-86Z';
const BALL_PANELS = 'M52 50C63 37 80 29 94 34A43 43 0 0 1 96 83C83 85 62 72 52 50ZM52 50C40 60 28 78 31 92A43 43 0 0 1 19 46C30 38 43 42 52 50Z';
const BALL_SEAMS = 'M52 50C63 37 80 29 94 34M52 50C62 72 83 85 96 83M52 50C40 60 28 78 31 92M52 50C43 42 30 38 19 46';

/* ---- note: a beamed pair ---- */
const NOTE_HEADS = 'M48.5 84.4a13 10 -20 1 1-25 9.2a13 10 -20 1 1 25-9.2ZM93.5 74.4a13 10 -20 1 1-25 9.2a13 10 -20 1 1 25-9.2Z';
const NOTE_STEMS = 'M42 30h7v56h-7ZM87 21h7v55h-7Z';
const NOTE_BEAM = 'M42 23.8L94 13v15L42 38.8Z';
const NOTE = `${NOTE_HEADS}${NOTE_STEMS}${NOTE_BEAM}`;

/* ---- brezel: one strand, drawn as a thick line; the two arms lie on top ---- */
const BREZEL = 'M31 87C43 72 54 62 60 54C66 46 70 34 82 29C96 24 106 40 104 58C102 82 80 100 60 100C40 100 18 82 16 58C14 40 24 24 38 29C50 34 54 46 60 54C66 62 77 72 89 87';
// Each arm: a short ink piece (its outline lies over the strand below) and a longer fill piece that hides the ink
// cap at the inner end.
const BREZEL_A_INK = 'M31 87C38.2 78 45.04 70.8 50.66 64.75';
const BREZEL_A = 'M31 87C43 72 54 62 60 54';
const BREZEL_B_INK = 'M45.66 33.89C52.13 39.75 55.5 48 60 54C66 62 77 72 89 87';
const BREZEL_B = 'M16 58C14 40 24 24 38 29C50 34 54 46 60 54C66 62 77 72 89 87';

/* ---- startnummer: a start number bib, four pins, "4/4" ---- */
const BIB = 'M28 28h64a8 8 0 0 1 8 8v48a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8V36a8 8 0 0 1 8-8Z';

/* ---- wimpel: a club pennant on a short stick ---- */
const WIMPEL_STICK = 'M26 20h8v80a4 4 0 0 1-8 0Z';
const WIMPEL_KNOB = 'M30 9a6 6 0 1 0 0 12a6 6 0 1 0 0-12Z';
const WIMPEL_FLAG = 'M34 24L101 47.2Q105.6 49 101 50.8L34 74Z';

/* ---- pfeife: a referee whistle on a short cord ---- */
const PFEIFE_BODY = 'M19 42H74A26 26 0 1 1 48.3 64H19a5 5 0 0 1-5-5V47a5 5 0 0 1 5-5Z';
const PFEIFE_RING = 'M100 43.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13Z';
const PFEIFE_CORD = 'M101 48C108 36 102 21 88 19C75 17 70 29 58 28C48 27 44 19 34 21';

const DRAWINGS: Record<StickerId, Drawing> = {
  ball: {
    sil: [{ d: BALL, w: 7 }],
    slot: 'M60 10a50 50 0 1 0 0 100a50 50 0 1 0 0-100Z',
    art: (
      <>
        <path className="stk-o" d={BALL} />
        <path className="stk-gelb" d={BALL} />
        <path className="stk-blau" d={BALL_PANELS} />
        <path className="stk-l" d={BALL_SEAMS} />
        <path className="stk-h" d="M45 27a36 36 0 0 1 13-3" />
      </>
    ),
  },
  note: {
    sil: [{ d: NOTE, w: 7 }, { d: 'M46 31L90 22V76L48 84Z' }],
    slot: 'M38 21L92 9.5a5 5 0 0 1 6 5V72a17 15 -20 0 1-32 14L56 88a17 15 -20 1 1-18-15Z',
    art: (
      <>
        <path className="stk-o" d={NOTE} />
        <path className="stk-rot" d={NOTE} />
        <path className="stk-h" d="M28 86.5a8 6 -20 0 1 7-4.5M73 76.5a8 6 -20 0 1 7-4.5" />
      </>
    ),
  },
  brezel: {
    sil: [{ d: BREZEL, w: 19, open: true }, { d: 'M34 42L60 60L86 42L92 62L60 90L28 62Z' }],
    slot: 'M60 31C66 16 90 9 103 25C118 43 113 78 94 96C80 109 40 109 26 96C7 78 2 43 17 25C30 9 54 16 60 31Z',
    art: (
      <>
        <path className="stk-ko" d={BREZEL} />
        <path className="stk-kf" d={BREZEL} />
        <path className="stk-ko" d={BREZEL_A_INK} />
        <path className="stk-kf" d={BREZEL_A} />
        <path className="stk-ko" d={BREZEL_B_INK} />
        <path className="stk-kf" d={BREZEL_B} />
        <path className="stk-salt" d="M24 32h.01M17 60h.01M27 83h.01M48 98h.01M76 96h.01M99 72h.01M97 36h.01M47 68h.01M73 69h.01" />
      </>
    ),
  },
  startnummer: {
    sil: [{ d: BIB, w: 7 }],
    slot: 'M26 20h68a12 12 0 0 1 12 12v56a12 12 0 0 1-12 12H26a12 12 0 0 1-12-12V32a12 12 0 0 1 12-12Z',
    art: (
      <>
        <path className="stk-o" d={BIB} />
        <path className="stk-parkett" d={BIB} />
        <path className="stk-blau" d="M20 43v-7a8 8 0 0 1 8-8h64a8 8 0 0 1 8 8v7Z" />
        <path className="stk-rot" d="M20 81h80v3a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8Z" />
        <path className="stk-l" d="M20 43h80M20 81h80" />
        <path className="stk-pin" d="M28 35.5h.01M92 35.5h.01M28 86.5h.01M92 86.5h.01" />
        <path className="stk-num" d="M43 73V51L30 66h19M63 49L55 75M83 73V51L70 66h19" />
      </>
    ),
  },
  wimpel: {
    shift: 'translate(-5 3)',
    sil: [{ d: `${WIMPEL_STICK}${WIMPEL_KNOB}${WIMPEL_FLAG}`, w: 7 }],
    slot: 'M19.5 15a10.5 10.5 0 0 1 21 0v1.5L104.5 38.5a10.5 10.5 0 0 1 0 21L40.5 81.5V100a10.5 10.5 0 0 1-21 0Z',
    art: (
      <>
        <path className="stk-o" d={`${WIMPEL_STICK}${WIMPEL_FLAG}`} />
        <path className="stk-parkett2" d={WIMPEL_STICK} />
        <path className="stk-o" d={WIMPEL_FLAG} />
        <path className="stk-gruen" d={WIMPEL_FLAG} />
        <path className="stk-gelb" d="M34 24L47 28.5V69.5L34 74Z" />
        <path className="stk-l" d="M47 28.5V69.5" />
        <path className="stk-loop" d="M56 53.5C64 56.5 76 46.5 70 41.5C64 36.5 59 50.5 68 54.5C73 56.5 79 54.5 83 50.5" />
        <path className="stk-o" d={WIMPEL_KNOB} />
        <path className="stk-gelb" d={WIMPEL_KNOB} />
      </>
    ),
  },
  pfeife: {
    shift: 'translate(-2 6)',
    sil: [{ d: PFEIFE_BODY, w: 7 }, { d: PFEIFE_RING, w: 3.5, open: true }, { d: PFEIFE_CORD, w: 10, open: true }, { d: 'M44 30H96V44H44Z' }],
    slot: 'M19 32H42C35 24 27 28 28 19C29 9 44 9 55 18C66 21 72 7 89 9C108 11 118 30 112 46C116 52 114 60 109 64A36 36 0 1 1 41 74H19A15 15 0 0 1 4 59V47A15 15 0 0 1 19 32Z',
    art: (
      <>
        <path className="stk-l" d={PFEIFE_RING} />
        <path className="stk-co" d={PFEIFE_CORD} />
        <path className="stk-cf" d={PFEIFE_CORD} />
        <path className="stk-o" d={PFEIFE_BODY} />
        <path className="stk-blau" d={PFEIFE_BODY} />
        <path className="stk-gelb" d="M28 42v22h-9a5 5 0 0 1-5-5V47a5 5 0 0 1 5-5Z" />
        <path className="stk-tinte" d="M50 42h13v6.5a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2Z" />
        <path className="stk-l" d="M28 42v22" />
        <path className="stk-o" d="M74 59a9 9 0 1 0 0 18a9 9 0 1 0 0-18Z" />
        <path className="stk-parkett" d="M74 59a9 9 0 1 0 0 18a9 9 0 1 0 0-18Z" />
        <path className="stk-h" d="M88 57a18 18 0 0 1 4 11" />
      </>
    ),
  },
};

type Custom = CSSProperties & Record<`--${string}`, string | number>;

export type StickerProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'id'> & {
  id: StickerId;
  /** Width and height in px (the box; the drawing fills it up to its die-cut border). Default 96. */
  size?: number;
  /** Rotation in degrees (brief: between -12 and 12). Default 0. */
  rotate?: number;
  /** Counts for the sticker album (data-collectable). Default true. */
  collectable?: boolean;
};

export function Sticker({ id, size = 96, rotate = 0, className, collectable = true, style, ...rest }: StickerProps) {
  const drawing = DRAWINGS[id];
  const vars: Custom = { '--stk-size': `${size}px`, '--stk-rot': `${rotate}deg`, '--stk-n': size, ...style };
  return (
    <span
      {...rest}
      className={className ? `stk ${className}` : 'stk'}
      data-sticker={id}
      data-collectable={collectable ? '' : undefined}
      aria-hidden="true"
      style={vars}
    >
      <span className="stk-in">
        <svg viewBox="0 0 120 120" focusable="false">
          <g transform={drawing.shift}>
            <g className="stk-edge">
              {drawing.sil.map((s, i) => (
                <path key={i} d={s.d} style={s.w ? ({ '--w': `${s.w}px` } as Custom) : undefined} />
              ))}
            </g>
            <g className="stk-cut">
              {drawing.sil.map((s, i) => (
                <path
                  key={i}
                  d={s.d}
                  data-open={s.open ? '' : undefined}
                  style={s.w ? ({ '--w': `${s.w}px` } as Custom) : undefined}
                />
              ))}
            </g>
            <g className="stk-art">{drawing.art}</g>
            <path className="stk-slot" d={drawing.slot} />
          </g>
        </svg>
      </span>
    </span>
  );
}

export type TextStickerTone = 'gelb' | 'blau' | 'rot' | 'gruen' | 'tinte' | 'parkett';

export type TextStickerProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /** Fill colour; the text colour follows (at least 4.5:1 on every tone). Default gelb. */
  tone?: TextStickerTone;
  /** Rotation in degrees. Default 0. */
  rotate?: number;
  children: ReactNode;
};

/** Pill-shaped sticker with real, selectable text. Scale it with the custom property --stk-fs (default 13px). */
export function TextSticker({ tone = 'gelb', rotate = 0, className, style, children, ...rest }: TextStickerProps) {
  const vars: Custom = { '--stk-rot': `${rotate}deg`, ...style };
  return (
    <span {...rest} className={className ? `tstk ${className}` : 'tstk'} data-tone={tone} style={vars}>
      {children}
    </span>
  );
}
