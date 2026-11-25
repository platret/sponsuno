import { createContext, useContext, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

/* The four illustrations of «Mit Sponsuno» (Features.tsx) and the kit that the four «Für wen» drawings
   (audienceArt.tsx) share, drawn after Fruitful's «How it works» (owner's reference, 2026-11-25), redrawn as one
   system on 2026-11-25:

   - Grid 4, outer margin 32 inside every viewBox (360 × 200 here, 240 × 180 for «Für wen»).
   - Module 40: blocks and list rows are 40 high; chips 24, marks 12; a "text line" is a 4 high pill.
   - Radii: 8 on shapes from 32 up, 4 on smaller ones and on free shapes (jersey), pills and circles otherwise.
   - Two line weights: 2 for connectors and structure (wires, pitch, staff), 3 for marks (ticks, stems, rings).
   - Colours: D1 only. Tintenblau carries, the tints and Hafer support, Bernstein is the one thing that matters.
   - Connectors run from centre to centre behind the shapes they join, so nothing ever shows a gap.

   Without Motion every element is a plain SVG element in its final state (prerender, no JS, phones before the chunk,
   reduced motion). FeaturesLive.tsx fills ArtKit with Motion's `m` elements: once a drawing is half in view its
   shapes fade and scale in from their own centre and its connectors draw (0.6 s, ease-out, short stagger). On hover
   one thing happens per drawing, and nothing that is joined to something else moves: a Bernstein trace runs along
   the connectors, a tick draws again, the ball rolls. */

type Kit = { live: boolean; svg: ElementType; g: ElementType; path: ElementType; rect: ElementType; circle: ElementType };
export const ArtKit = createContext<Kit>({ live: false, svg: 'svg', g: 'g', path: 'path', rect: 'rect', circle: 'circle' });

const EASE = [0.22, 1, 0.36, 1] as const;
const DUR = 0.6;

/** Resolved by Motion with the drawing's state: once the entry has played, returning from hover has no delay */
type St = { entered: boolean } | undefined;
const after = (s: St, delay: number) => (s?.entered ? 0 : delay);

/** A connector or mark draws in */
export const draw = (delay: number) => ({
  hidden: { pathLength: 0, opacity: 0 },
  show: (s: St) => ({
    pathLength: 1, opacity: 1,
    transition: { pathLength: { duration: DUR, ease: EASE, delay: after(s, delay) }, opacity: { duration: 0.01, delay: after(s, delay) } },
  }),
});

/** A shape fades and scales in from its own centre (v() sets the transform origin) */
export const pop = (delay: number) => ({
  hidden: { opacity: 0, scale: 0.9 },
  show: (s: St) => ({ opacity: 1, scale: 1, transition: { duration: DUR, ease: EASE, delay: after(s, delay) } }),
});

/** A mark that draws in (ticks, the sponsor's ring). It used to draw again on hover; dropped 2026-11-25 because the
    mark vanished for a moment first, which read as a glitch. Hover is left to traces and the ball. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const redraw = (delay: number, _hoverDelay = 0) => draw(delay);

/** A Bernstein line that runs along a connector on hover and fades when the pointer leaves (rendered only when live) */
export const trace = (hoverDelay = 0) => ({
  hidden: { pathLength: 0, opacity: 0 },
  show: { opacity: 0, transition: { duration: 0.3 }, transitionEnd: { pathLength: 0 } },
  hover: {
    pathLength: 1, opacity: 1,
    transition: { pathLength: { duration: 0.55, ease: EASE, delay: hoverDelay }, opacity: { duration: 0.01, delay: hoverDelay } },
  },
});

const CENTRE: CSSProperties = { transformBox: 'fill-box', transformOrigin: 'center' };

type V = ((variants: object, origin?: CSSProperties) => object) & { frame: object };

/** Motion props for one element, only when live (plain SVG elements must not get them). `v.frame` goes on <Frame>. */
export function useV(): V {
  const { live } = useContext(ArtKit);
  const state = useRef({ entered: false }).current;
  const v = ((variants: object, origin: CSSProperties = CENTRE) => (live ? { variants, custom: state, style: origin } : {})) as V;
  v.frame = live
    ? { custom: state, onViewportEnter: () => { window.setTimeout(() => { state.entered = true; }, 1800); } }
    : {};
  return v;
}

export function Frame({ children, v, viewBox = '0 0 360 200', className = 'fx-art' }: { children: ReactNode; v: V; viewBox?: string; className?: string }) {
  const { live, svg: Svg } = useContext(ArtKit);
  const motionProps = live ? { initial: 'hidden', whileInView: 'show', whileHover: 'hover', viewport: { once: true, amount: 0.5 }, ...v.frame } : {};
  return <Svg className={className} viewBox={viewBox} {...motionProps}>{children}</Svg>;
}

/** Two text lines (4 high pills) */
export const Lines = ({ x, y, w, cls = 'a-line' }: { x: number; y: number; w: number; cls?: string }) => (
  <>
    <rect className={cls} x={x} y={y} width={w} height={4} rx={2} />
    <rect className={cls} x={x} y={y + 8} width={Math.round(w * 0.6)} height={4} rx={2} />
  </>
);

/** 1 · Beide Seiten an einem Ort: one profile branching into what it brings (region, needs, offer).
    Hover: a Bernstein trace runs from the profile into the three blocks. */
export function ProfileArt() {
  const { g: G, path: P, rect: R, circle: C, live } = useContext(ArtKit);
  const v = useV();
  const wires = ['M180 52 C180 104 100 96 100 148', 'M180 52 V148', 'M180 52 C180 104 260 96 260 148'];
  const blocks = [{ x: 80, cls: 'a-mist' }, { x: 160, cls: 'a-ink' }, { x: 240, cls: 'a-amber-soft' }];
  return (
    <Frame v={v}>
      {wires.map((d, i) => <P key={d} className="a-wire" d={d} {...v(draw(0.25 + i * 0.08))} />)}
      {live && wires.map((d, i) => <P key={`t${d}`} className="a-wire a-wire-amber" d={d} {...v(trace(i * 0.08))} />)}
      <G {...v(pop(0))}>
        <R className="a-amber" x={124} y={32} width={112} height={40} rx={8} />
        <C className="a-light" cx={144} cy={52} r={12} />
        <Lines x={168} y={46} w={52} cls="a-line-light" />
      </G>
      {blocks.map((b, i) => <G key={b.x} {...v(pop(0.5 + i * 0.08))}><R className={b.cls} x={b.x} y={128} width={40} height={40} rx={8} /></G>)}
    </Frame>
  );
}

/** 2 · Vorschläge statt kalter Anfragen: a short list of firms, the one that fits in Bernstein and ticked.
    No hover motion. */
export function SuggestArt() {
  const { g: G, rect: R, circle: C, path: P } = useContext(ArtKit);
  const v = useV();
  const row = (y: number, on: boolean) => (
    <>
      <R className={on ? 'a-amber' : 'a-light'} x={68} y={y} width={224} height={40} rx={8} />
      <R className={on ? 'a-ink' : 'a-mist'} x={76} y={y + 8} width={24} height={24} rx={4} />
      <Lines x={112} y={y + 14} w={72} cls={on ? 'a-line-light' : 'a-line'} />
    </>
  );
  return (
    <Frame v={v}>
      <G {...v(pop(0))}>{row(32, false)}</G>
      <G {...v(pop(0.08))}>{row(80, true)}<C className="a-light" cx={272} cy={100} r={12} /></G>
      <G {...v(pop(0.16))}>{row(128, false)}</G>
      <P className="a-mark a-mark-amber" d="M266.5 100.5l3.5 3.5 6.5-7" {...v(redraw(0.55))} />
    </Frame>
  );
}

/** 3 · Ein Match: both sides meet in the Bernstein circle with a tick, the four criteria fulfilled below.
    Hover: a Bernstein trace runs from both sides into the circle. */
export function MatchArt() {
  const { g: G, path: P, rect: R, circle: C, live } = useContext(ArtKit);
  const v = useV();
  const wires = ['M88 84 H180', 'M272 84 H180'];
  return (
    <Frame v={v}>
      {wires.map((d, i) => <P key={d} className="a-wire" d={d} {...v(draw(0.2 + i * 0.08))} />)}
      {live && wires.map((d) => <P key={`t${d}`} className="a-wire a-wire-amber" d={d} {...v(trace(0))} />)}
      <G {...v(pop(0))}><R className="a-ink" x={68} y={64} width={40} height={40} rx={8} /></G>
      <G {...v(pop(0.08))}><R className="a-mist" x={252} y={64} width={40} height={40} rx={8} /></G>
      <G {...v(pop(0.45))}><C className="a-amber" cx={180} cy={84} r={24} /></G>
      <P className="a-mark a-mark-light" d="M170.5 84.5l6.5 6.5 12.5-13" {...v({ ...redraw(0.7, 0.35) })} />
      {[0, 1, 2, 3].map((i) => (
        <G key={i} {...v(pop(0.8 + i * 0.06))}><R className="a-amber-soft" x={144 + i * 20} y={136} width={12} height={12} rx={4} /></G>
      ))}
    </Frame>
  );
}

/** 4 · Und danach: the KI-Manager switched on, branching into drafts, reminders and agreed returns.
    Entry: the knob slides from off to on inside its track. Hover: a Bernstein trace runs out to the three tasks. */
export function ManagerArt() {
  const { g: G, path: P, rect: R, circle: C, live } = useContext(ArtKit);
  const v = useV();
  const wires = ['M136 100 C192 100 192 52 248 52', 'M136 100 H248', 'M136 100 C192 100 192 148 248 148'];
  const tasks = [{ y: 32, cls: 'a-mist' }, { y: 80, cls: 'a-ink' }, { y: 128, cls: 'a-amber-soft' }];
  const knob = {
    hidden: { x: -40 },
    show: (s: St) => ({ x: 0, transition: { duration: 0.7, ease: EASE, delay: after(s, 0.2) } }),
  };
  return (
    <Frame v={v}>
      {wires.map((d, i) => <P key={d} className="a-wire" d={d} {...v(draw(0.5 + i * 0.08))} />)}
      {live && wires.map((d, i) => <P key={`t${d}`} className="a-wire a-wire-amber" d={d} {...v(trace(i * 0.08))} />)}
      <G {...v(pop(0))}>
        <R className="a-amber" x={68} y={80} width={80} height={40} rx={20} />
        <C className="a-light" cx={128} cy={100} r={16} {...v(knob)} />
      </G>
      {tasks.map((t, i) => (
        <G key={t.y} {...v(pop(0.75 + i * 0.08))}>
          <R className={t.cls} x={204} y={t.y} width={88} height={40} rx={8} />
          <Lines x={216} y={t.y + 14} w={48} cls="a-line-light" />
        </G>
      ))}
    </Frame>
  );
}

export const ARTS = [ProfileArt, SuggestArt, MatchArt, ManagerArt];
