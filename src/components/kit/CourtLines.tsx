// Court lines of the «Turnhalle» look: the lines of a hall floor as decoration. Always aria-hidden, absolutely
// positioned over its (position: relative) parent, never catches the pointer. Styles and the draw animations in
// styles/kit.css (.cl, .cl-path, data-scroll="draw", data-draw="load").
// Every path: fill none, pathLength 1, class cl-path, data-line with its colour; the stroke keeps its weight however
// the drawing is scaled (vector-effect: non-scaling-stroke: 3 px at 1440 px wide, 2 px on phones). The two door
// drawings are the exception: doors.css gives their lines one weight as a share of the drawing's box.
import '../../styles/kit.css';

export type CourtLinesVariant = 'hero' | 'band' | 'door-sport' | 'door-firma';
export type CourtLine = 'blau' | 'rot' | 'gelb' | 'hell';

type Shared = {
  className?: string;
  /**
   * "load": the lines draw once when the page loads (hero, under 1.5 s). "scroll": they draw with the scroll, with the
   * svg itself as the measured block (the word band's lane lines). Leave it out when a container carries
   * data-scroll="draw" (or for still lines).
   */
  draw?: 'load' | 'scroll';
};
/** `line`: the colour of the one line of variant "band" (default gelb); the other variants bring their own colours */
export type CourtLinesProps = Shared & (
  | { variant: 'band'; line?: CourtLine }
  | { variant: Exclude<CourtLinesVariant, 'band'> }
);

const Line = ({ d, line, className }: { d: string; line: CourtLine; className?: string }) => (
  <path className={className ? `cl-path ${className}` : 'cl-path'} data-line={line} d={d} pathLength={1} fill="none" />
);

/* A straight line across the whole box at the height `y` (in percent of the box). The svg around it has no viewBox, so
   one user unit is one px and the dash of the draw animation is exactly as long as the line at every width. (With a
   stroke that does not scale, Chromium sizes the dash by the path's length in user units but lays it out in px: a
   line drawn in a small stretched viewBox would break into dashes while it draws.) */
const Across = ({ line, y }: { line: CourtLine; y: string }) => (
  <line className="cl-path" data-line={line} x1="0" y1={y} x2="100%" y2={y} pathLength={1} />
);

/* hero: the corner arc (blue), a quarter circle around the lower right corner of its box; its radius is the side of
   the box (hero.css, .hero-arc: a square of the arc's radius in the hero's lower right corner, standing on the base
   line). Drawn in 320 units for a radius of at most 320 px (hero.css keeps it at 16rem or less), so the path is never
   shorter in units than on screen and the draw animation's dash always covers it. The hero's red base line is not
   part of this drawing: Hero.tsx sets it as two "band" strips, left and right of the round arrow, so no line runs
   behind that button and the lines' boxes never lie behind the text (axe can then measure every contrast).

   band: one straight line across its box, in the colour of the prop `line` (the hero's base line in red, the word
   band's two yellow lane lines, the waitlist band's parquet line). */

/* door-sport (600 x 600, from above): end line, goal area, goal; the ball's way into the goal in yellow (the ball
   itself is drawn by Doors.tsx on this path, and the pennant sticker stands on the path's start: doors.css restates
   30 548). doors.css gives the lines of both door drawings one weight as a share of the box (no non-scaling stroke). */
export const BALL_PATH = 'M30 548C210 548 250 300 400 300H563';
/* door-firma (600 x 600, front): ground, shop with awning, window and door, the sign on the roof (its fill, .cl-glow,
   is the drawing's one yellow). doors.css restates the window's centre (228 412: the pretzel sticker) and the right
   end of the ground line (560: it lies on the page container's edge). */
const SIGN = 'M216 96h168a16 16 0 0 1 16 16v36a16 16 0 0 1-16 16H216a16 16 0 0 1-16-16v-36a16 16 0 0 1 16-16Z';

export function CourtLines(props: CourtLinesProps) {
  const { variant, className, draw } = props;
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
      return (
        <svg {...shared} viewBox="0 0 320 320" preserveAspectRatio="xMaxYMax meet">
          <Line line="blau" d="M0 320A320 320 0 0 1 320 0" />
        </svg>
      );
    case 'band':
      return <svg {...shared}><Across line={props.line ?? 'gelb'} y="50%" /></svg>;
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
        </svg>
      );
  }
}
