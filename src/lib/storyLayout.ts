// Positions of every item on the story stage, per state and per layout (desktop split view / phone and tablet).
// The table is turned into plain CSS (custom properties per item and state) once at module load; Story.tsx
// renders it into a <style> tag, so the prerendered HTML already carries every state (no layout work in JS,
// CLS 0). Only translate, opacity and scale change between states (story.css). DESIGN.md -> Story.
import type { StoryState } from '../content';

export const STATES: StoryState[] = ['heute', 'kontakte', 'aufwand', 'erwartungen', 'linie', 'sortiert', 'match', 'danach'];
const SPOT: StoryState[] = ['kontakte', 'aufwand', 'erwartungen'];

// Each state starts from its parent's values: the findings are spotlights on "heute", the solution builds up.
const PARENT: Partial<Record<StoryState, StoryState>> = {
  kontakte: 'heute', aufwand: 'heute', erwartungen: 'heute', linie: 'heute', sortiert: 'linie', match: 'sortiert', danach: 'match',
};

/** x, y: centre in % of the stage (cqw / cqh), xo / yo: extra px, o: opacity, s: scale, f: 0 raw face / 1 clean face. */
interface Pos { x: number; y: number; xo: number; yo: number; o: number; s: number; f: number }
type Rec = Partial<Pos>;
type Track = Partial<Record<StoryState, Rec>>;

export interface StageItem {
  key: string;
  /** Spotlit in these finding states (opacity 1); all other chaos items recede there. */
  spot?: StoryState[];
  chaos?: boolean;
  d: Track;
  /** Phone and tablet layout; null hides the item there. */
  m: Track | null;
}

// The brass line sits at this share of the stage width (desktop / phone). story.css reads the same numbers.
export const LINE = { d: 52, m: 40 };

const off = { o: 0 };
const L = LINE.d;
const ML = LINE.m;
// Behind the line: the left window clips everything right of it, so a paper sliding there vanishes into it
const behind = { x: L + 14, o: 0 };
const mBehind = { x: ML + 18, o: 0 };

/**
 * A raw input (an input tile). By default it slides behind the line in "linie". `dl` / `ml` instead keep it at the
 * line in "linie": faint and small, half fed into it (the left window clips it at the line), above or below the
 * seeker queue. `ds` / `ms`: its "sortiert" state (default: behind the line).
 */
const paper = (
  key: string, spot: StoryState[], d: Rec, m: Rec | null,
  o: { dl?: Rec; ds?: Rec; ml?: Rec; ms?: Rec } = {},
): StageItem => ({
  key, spot, chaos: true,
  d: { heute: d, linie: o.dl ?? behind, sortiert: o.ds ?? behind, match: off },
  m: m && { heute: m, linie: o.ml ?? mBehind, sortiert: o.ms ?? mBehind, match: off },
});
const atLine = (y: number): Rec => ({ x: L, xo: 8, y, o: .3, s: .82 });

// Frame y centres (desktop three, phone two)
const FY = [19, 46, 73];
const MFY = [20, 55];
// The heap ("heute"): one loose column of inputs and seeker cards, one per row, each nudged left or right
// (desktop x 22-29 % keeps every tile inside the window left of the line at every desktop stage width).
const HY = [6, 16.75, 27.5, 38.25, 49, 59.75, 70.5, 81.25, 92];
const MHY = [9, 23, 37.5, 52, 66, 80.5];

export const STAGE_ITEMS: StageItem[] = [
  // ---- chaos: inputs (left window), the three findings mixed. In "linie" three queue at the line, the rest slide
  //      behind it. Phones show four of them (the longest labels do not fit the narrow window). ----
  paper('p-dossier', ['aufwand'], { x: 24, y: HY[0] }, { x: 20, y: MHY[0] }, { dl: atLine(9) }),
  paper('p-zustaendig', ['kontakte'], { x: 29, y: HY[1] }, { x: 20, y: MHY[1] }, { dl: atLine(77) }),
  paper('p-absage', ['aufwand'], { x: 23, y: HY[2] }, null),
  paper('p-gelohnt', ['erwartungen'], { x: 28, y: HY[4] }, null),
  paper('p-training', ['aufwand'], { x: 22, y: HY[5] }, null),
  paper('p-antwort', ['kontakte'], { x: 27, y: HY[6] }, { x: 20, y: MHY[3] }),
  paper('p-gegenleistung', ['erwartungen'], { x: 23, y: HY[8] }, { x: 20, y: MHY[4] }, {
    dl: atLine(86), ds: { o: 0 },
    ml: { x: ML, xo: 6, y: 86, o: .2, s: .62 }, ms: { o: 0 },
  }),

  // ---- seekers: in the heap (with their role), then straight in the queue (with their region), then behind the line ----
  {
    key: 's-0', chaos: true, spot: ['kontakte'],
    d: { heute: { x: 26, y: HY[3] }, linie: { x: 24, y: 34, f: 1 }, sortiert: { x: L + 16, o: 0, f: 1 }, match: off },
    m: { heute: { x: 20, y: MHY[2] }, linie: { x: 20, y: 38, f: 1, o: 1, s: 1 }, sortiert: { x: ML + 22, o: 0, f: 1 }, match: off },
  },
  {
    key: 's-1', chaos: true, spot: ['erwartungen'],
    d: { heute: { x: 26, y: HY[7] }, linie: { x: 24, y: 50, f: 1 }, sortiert: { x: L + 16, o: 0, f: 1 }, match: off },
    m: { heute: { x: 20, y: MHY[5] }, linie: { x: 20, y: 64, f: 1, o: 1, s: 1 }, sortiert: { x: ML + 22, o: 0, f: 1 }, match: off },
  },
  {
    key: 's-2',
    d: { heute: { x: -14, y: 66, o: 0, f: 1 }, linie: { x: 24, y: 66, o: 1 }, sortiert: { x: L + 16, o: 0 }, match: off },
    m: null,
  },

  // ---- companies: enter from the right edge in "linie", settle into their pair card in "sortiert" (the chip's disc
  //      lands on the card's company disc: card padding + half a disc to the right of the line, at the card's centre) ----
  ...[0, 1, 2].map((i): StageItem => ({
    key: `f-${i}`,
    d: { heute: { x: 116, y: [34, 50, 66][i], o: 0 }, linie: { x: 77, o: 1 }, sortiert: { x: L, xo: 130, y: FY[i], yo: 0, o: 0 }, match: off },
    m: i < 2 ? { heute: { x: 118, y: [38, 64][i], o: 0 }, linie: { x: 74, o: 1 }, sortiert: { x: ML, xo: 91, y: MFY[i], yo: 0, o: 0 }, match: off } : null,
  })),

  // ---- pair cards (right window): faint promise in "heute", gone in "linie", out from behind the line in "sortiert" ----
  ...[0, 1, 2].map((i): StageItem => ({
    key: `pair-${i}`,
    d: { heute: { x: L, y: FY[i], o: .2 }, linie: { xo: -150, o: 0 }, sortiert: { xo: 0, o: 1 }, match: { o: 0, s: i === 0 ? 1.04 : 1 } },
    m: i < 2 ? { heute: { x: ML, y: MFY[i], o: .2 }, linie: { xo: -130, o: 0 }, sortiert: { xo: 0, o: 1 }, match: { o: 0, s: i === 0 ? 1.04 : 1 } } : null,
  })),

  // ---- the four criteria, named once while the pairs come out: desktop a column at the line beside the lead
  //      pair (right-aligned against it), phones and tablets a row under the pairs, starting at the line ----
  {
    key: 'legend',
    d: { heute: { x: L, xo: -22, y: FY[0], o: 0 }, sortiert: { o: 1 }, match: off },
    m: { heute: { x: ML, y: 82, o: 0 }, sortiert: { o: 1 }, match: off },
  },

  // ---- the line, the lock discs on it, the column heads ----
  {
    key: 'line',
    d: { heute: { x: L, y: 50, o: .25 }, linie: { o: 1 }, match: { o: 0 } },
    m: { heute: { x: ML, y: 50, o: .25 }, linie: { o: 1 }, match: { o: 0 } },
  },
  ...[0, 1, 2].map((i): StageItem => ({
    key: `lock-${i}`,
    d: { heute: { x: L, y: FY[i], o: .2, s: 1 }, linie: { o: 0, s: .6 }, sortiert: { o: 1, s: 1 }, match: off },
    m: i < 2 ? { heute: { x: ML, y: MFY[i], o: .2 }, linie: { o: 0, s: .6 }, sortiert: { o: 1, s: 1 }, match: off } : null,
  })),
  {
    key: 'head-seeker',
    d: { heute: { x: 24, y: 22, o: 0 }, linie: { o: 1 }, sortiert: { o: 0 } },
    m: { heute: { x: 20, y: 22, o: 0 }, linie: { o: 1 }, sortiert: { o: 0 } },
  },
  {
    key: 'head-firm',
    d: { heute: { x: 77, y: 22, o: 0 }, linie: { o: 1 }, sortiert: { o: 0 } },
    m: { heute: { x: 74, y: 22, o: 0 }, linie: { o: 1 }, sortiert: { o: 0 } },
  },

  // ---- the match card grows out of the lead pair (centre and size of pair-0 in "sortiert"), then the KI-Manager ----
  {
    key: 'match',
    d: {
      heute: { x: 50, y: 47, o: 0, s: .92 }, sortiert: { x: L, xo: 126, y: FY[0], o: 0, s: .58 },
      match: { x: 50, xo: 0, y: 47, o: 1, s: 1 }, danach: { x: 28, y: 36, s: .9 },
    },
    m: {
      heute: { x: 50, y: 45, o: 0, s: .8 }, sortiert: { x: ML, xo: 109, y: MFY[0], o: 0, s: .66 },
      match: { x: 50, xo: 0, y: 45, o: 1, s: 1 }, danach: { y: 40, o: 0, s: .8 },
    },
  },
  {
    key: 'ki-draft',
    d: { heute: { x: 71, y: 66, o: 0 }, danach: { y: 60, o: 1 } },
    m: { heute: { x: 50, y: 42, o: 0 }, danach: { y: 36, o: 1 } },
  },
  {
    key: 'ki-deliv',
    d: { heute: { x: 64, y: 86, o: 0 }, danach: { y: 80, o: 1 } },
    m: { heute: { x: 50, y: 80, o: 0 }, danach: { y: 75, o: 1 } },
  },
];

const BASE: Pos = { x: 0, y: 0, xo: 0, yo: 0, o: 1, s: 1, f: 0 };

function resolve(item: StageItem, track: Track): Record<StoryState, Pos> {
  const out = {} as Record<StoryState, Pos>;
  for (const st of STATES) {
    const parent = PARENT[st];
    const base = parent ? out[parent] : BASE;
    const own = track[st] ?? {};
    const pos: Pos = { ...base, ...own };
    // Findings: spotlight on the heap, everything else in the heap recedes (unless the table says otherwise)
    if (item.chaos && st === 'heute' && own.o === undefined) pos.o = .78;
    if (item.chaos && SPOT.includes(st)) {
      const lit = item.spot?.includes(st);
      pos.o = own.o ?? (lit ? 1 : .26);
      pos.s = own.s ?? (lit ? 1.04 : .97);
    }
    out[st] = pos;
  }
  return out;
}

const num = (n: number) => String(Math.round(n * 100) / 100);
const decl = (p: Pos) => `--x:${num(p.x)};--y:${num(p.y)};--xo:${num(p.xo)}px;--yo:${num(p.yo)}px;--o:${num(p.o)};--s:${num(p.s)};--f:${num(p.f)}`;

function rules(item: StageItem, track: Track): string {
  const res = resolve(item, track);
  // Group states with identical declarations into one selector
  const groups = new Map<string, StoryState[]>();
  for (const st of STATES) {
    const d = decl(res[st]);
    groups.set(d, [...(groups.get(d) ?? []), st]);
  }
  const heute = decl(res.heute);
  let css = `.st-art[data-step] .it-${item.key}{${heute}}`;
  for (const [d, sts] of groups) {
    if (d === heute) continue;
    css += `.st-art:is(${sts.map((s) => `[data-step="${s}"]`).join(',')}) .it-${item.key}{${d}}`;
  }
  return css;
}

/** All stage positions as CSS. Desktop first; the phone/tablet block overrides it at the same specificity. */
export const stageCss: string = (() => {
  const desk = STAGE_ITEMS.map((it) => rules(it, it.d)).join('');
  const mob = STAGE_ITEMS.map((it) => (it.m ? rules(it, it.m) : `.st-art .it-${it.key}{display:none}`)).join('');
  return `${desk}@media (max-width:960px){${mob}}`;
})();

/** States in which an item is visible at all (used to keep the static snapshots small). */
export function visibleIn(item: StageItem, state: StoryState): boolean {
  const d = resolve(item, item.d)[state].o > 0;
  const m = item.m ? resolve(item, item.m)[state].o > 0 : false;
  return d || m;
}
