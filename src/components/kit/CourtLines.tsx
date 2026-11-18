// Court lines of the «Turnhalle» look: the lines of a hall floor as decoration. Always aria-hidden, absolutely
// positioned over its (position: relative) parent, never catches the pointer. Styles and the draw animations in
// styles/kit.css (.cl, .cl-path, data-scroll="draw", data-draw="load").
// Every path: fill none, pathLength 1, class cl-path, data-line with its colour; the stroke keeps its weight however
// the drawing is scaled (vector-effect: non-scaling-stroke).
import type { ReactNode } from 'react';
import type { Vars } from './Sticker';
import '../../styles/kit.css';

export type CourtLinesVariant = 'hero' | 'page' | 'band' | 'door-sport' | 'door-firma';
export type CourtLine = 'blau' | 'rot' | 'gruen' | 'gelb' | 'hell';

export type CourtLinesProps = {
  variant: CourtLinesVariant;
  className?: string;
  /**
   * "load": the lines draw once when the page loads (hero, under 1.5 s). "scroll": they draw with the scroll, with the
   * svg itself as the measured block. Leave it out when a container carries data-scroll="draw" (or for still lines).
   */
  draw?: 'load' | 'scroll';
};

const Line = ({ d, line, className }: { d: string; line: CourtLine; className?: string }) => (
  <path className={className ? `cl-path ${className}` : 'cl-path'} data-line={line} d={d} pathLength={1} fill="none" />
);

/* hero, wide screens (1440 x 900, covers its box, anchored to the right edge): the left two thirds stay calm.
   Circle: centre (1400, 360), r 320, only the part that can be seen is drawn.
   hero.css restates four things of these two drawings: the base line's distance from the lower edge (130 of 900
   wide, 144 of 844 on phones: .hero-lines), the x of the pennant's foot on it (1124 of 1440: .hero-stk-wimpel),
   and the order of the paths (the circle is child 1, the corner arc child 4: their colours are swapped there).
   Change them together. */
const HERO_WIDE = (
  <>
    <Line line="blau" d="M1460 45.7A320 320 0 1 0 1460 674.3" />
    <Line line="rot" d="M-20 770H1460" />
    <Line line="gruen" d="M1040 920V610A70 70 0 0 1 1110 540H1460" />
    <Line line="gelb" d="M-10 690A220 220 0 0 1 210 910" />
  </>
);
/* hero, phones (390 x 844): the same four lines, pushed to the right and lower edge. Circle: centre (420, 300), r 180 */
const HERO_NARROW = (
  <>
    <Line line="blau" d="M400 121.1A180 180 0 0 0 400 478.9" />
    <Line line="rot" d="M-10 700H400" />
    <Line line="gruen" d="M262 860V612A40 40 0 0 1 302 572H400" />
    <Line line="gelb" d="M-10 742A118 118 0 0 1 108 860" />
  </>
);

/* page: one tape line down the whole page, stretched to its box. Drawn for an expected shape of the page
   (wide: about 1440 x 5600, phones: about 390 x 7000); the turns stay round within about a third either way.
   Two numbers of the wide drawing are needed by the CSS that hangs and draws it (end of header.css); they go to the
   svg as custom properties, so they are stated once, next to the path:
   --pl-turn  where the line first turns to cross the page, as a share of the drawing's height (y 600 of 4000)
   --pl-len   the length of the path in the drawing's own units (about 4010 down plus 2520 across) */
const PAGE_BOX = { w: 1000, h: 4000 };
const PAGE_TURN_Y = 600;
const PAGE_LEN = 6530;
const PAGE_WIDE =
  'M940 -10V560a40 40 0 0 1-40 40H100a40 40 0 0 0-40 40V1960a40 40 0 0 0 40 40H440C580 2000 580 1850 490 1850C400 1850 400 2000 540 2000H900a40 40 0 0 1 40 40V3300a40 40 0 0 1-40 40H540a40 40 0 0 0-40 40V4010';
const PAGE_NARROW =
  'M388 -10V900a28 28 0 0 1-28 28H40a28 28 0 0 0-28 28V3400a28 28 0 0 0 28 28H150C250 3428 250 3328 190 3328C130 3328 130 3428 230 3428H360a28 28 0 0 1 28 28V5800a28 28 0 0 1-28 28H228a28 28 0 0 0-28 28V7210';

/* band: two lane lines with tick marks, stretched over a full-width band (only straight lines, so nothing distorts) */
const ticks = (y: number, dy: number, from: number) =>
  Array.from({ length: 12 }, (_, i) => `M${from + i * 120} ${y}v${dy}`).join('');

/* door-sport (600 x 600, from above): end line, goal area, goal; the ball's way into the goal (the ball itself is drawn
   by Doors.tsx on this path) */
export const BALL_PATH = 'M30 548C210 548 250 300 400 300H563';
/* door-firma (600 x 600, front): ground, shop with awning, window and door, the sign on the roof */
const SIGN = 'M216 96h168a16 16 0 0 1 16 16v36a16 16 0 0 1-16 16H216a16 16 0 0 1-16-16v-36a16 16 0 0 1 16-16Z';

function nested(wide: ReactNode, narrow: ReactNode, boxWide: string, boxNarrow: string, par: string) {
  return (
    <>
      <svg className="cl-wide" width="100%" height="100%" viewBox={boxWide} preserveAspectRatio={par}>{wide}</svg>
      <svg className="cl-narrow" width="100%" height="100%" viewBox={boxNarrow} preserveAspectRatio={par}>{narrow}</svg>
    </>
  );
}

export function CourtLines({ variant, className, draw }: CourtLinesProps) {
  const cls = `cl cl-${variant}${className ? ` ${className}` : ''}`;
  const shared = {
    className: cls,
    'aria-hidden': true,
    focusable: false,
    'data-draw': draw === 'load' ? 'load' : undefined,
    'data-scroll': draw === 'scroll' ? 'draw' : undefined,
  } as const;

  switch (variant) {
    case 'hero':
      return <svg {...shared}>{nested(HERO_WIDE, HERO_NARROW, '0 0 1440 900', '0 0 390 844', 'xMaxYMid slice')}</svg>;
    case 'page':
      return (
        <svg {...shared} style={{ '--pl-turn': PAGE_TURN_Y / PAGE_BOX.h, '--pl-len': `${PAGE_LEN}px` } as Vars}>
          {nested(<Line line="gelb" d={PAGE_WIDE} />, <Line line="gelb" d={PAGE_NARROW} />, `0 0 ${PAGE_BOX.w} ${PAGE_BOX.h}`, '0 0 400 7200', 'none')}
        </svg>
      );
    case 'band':
      return (
        <svg {...shared} viewBox="0 0 1440 240" preserveAspectRatio="none">
          <Line line="hell" d="M-10 36H1450" />
          <Line line="hell" d="M-10 204H1450" />
          <Line line="gelb" d={ticks(36, 20, 60)} />
          <Line line="gelb" d={ticks(204, -20, 120)} />
        </svg>
      );
    case 'door-sport':
      return (
        <svg {...shared} viewBox="0 0 600 600" preserveAspectRatio="xMaxYMax meet">
          <Line line="hell" d="M540 20V580" />
          <Line line="hell" d="M540 120A180 180 0 0 0 540 480" />
          <Line line="hell" d="M540 246h42a8 8 0 0 1 8 8v92a8 8 0 0 1-8 8h-42" />
          <Line line="gelb" d={BALL_PATH} />
        </svg>
      );
    case 'door-firma':
      return (
        <svg {...shared} viewBox="0 0 600 600" preserveAspectRatio="xMaxYMax meet">
          <path className="cl-glow" d={SIGN} />
          <Line line="hell" d="M40 548H560" />
          <Line line="hell" d="M110 548V300M490 300V548" />
          <Line line="hell" d="M90 262L124 196H476L510 262M90 262a35 35 0 0 0 70 0a35 35 0 0 0 70 0a35 35 0 0 0 70 0a35 35 0 0 0 70 0a35 35 0 0 0 70 0a35 35 0 0 0 70 0" />
          <Line line="hell" d="M162 356h132a10 10 0 0 1 10 10v92a10 10 0 0 1-10 10H162a10 10 0 0 1-10-10v-92a10 10 0 0 1 10-10Z" />
          <Line line="hell" d="M346 548V366a10 10 0 0 1 10-10h78a10 10 0 0 1 10 10V548M420 452v14" />
          <Line line="hell" d={`${SIGN}M248 164v32M352 164v32M244 130h112`} />
          <Line line="gelb" className="cl-rays" d="M300 72V44M186 84L168 62M414 84L432 62" />
        </svg>
      );
  }
}
