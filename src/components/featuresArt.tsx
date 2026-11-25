import { createContext, useContext, type ElementType, type ReactNode } from 'react';

/* The four illustrations of «Mit Sponsuno» (Features.tsx), drawn after Fruitful's «How it works» (owner's reference,
   2026-11-25): soft rounded blocks joined by curved lines, in the D1 colours only (Tintenblau, Bernstein, their tints
   and Hafer 2). The rounded corners are for these drawings only; UI stays square.
   Without Motion every element is a plain SVG element in its final state (prerender, no JS, phones before the chunk,
   reduced motion). FeaturesLive.tsx fills ArtKit with Motion's `m` elements: lines then draw in, blocks pop in once
   the card is in view, and parts react when the pointer is over a card. */

type Kit = { live: boolean; svg: ElementType; g: ElementType; path: ElementType; rect: ElementType; circle: ElementType };
export const ArtKit = createContext<Kit>({ live: false, svg: 'svg', g: 'g', path: 'path', rect: 'rect', circle: 'circle' });

const EASE = [0.22, 1, 0.36, 1];
const draw = (delay: number) => ({
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: 0.9, delay, ease: EASE }, opacity: { duration: 0.01, delay } } },
});
const pop = (delay: number, hoverY = -4) => ({
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20, delay } },
  hover: { y: hoverY, transition: { type: 'spring', stiffness: 300, damping: 18 } },
});

/** Motion props for one element, only when live (plain SVG elements must not get them) */
function useV() {
  const { live } = useContext(ArtKit);
  return (variants: object) => (live ? { variants } : {});
}

function Frame({ children }: { children: ReactNode }) {
  const { live, svg: Svg } = useContext(ArtKit);
  const motionProps = live ? { initial: 'hidden', whileInView: 'show', whileHover: 'hover', viewport: { once: true, amount: 0.5 } } : {};
  return <Svg className="fx-art" viewBox="0 0 360 200" {...motionProps}>{children}</Svg>;
}

/** Two short text lines inside a block */
const Lines = ({ x, y, w, cls = 'a-line' }: { x: number; y: number; w: number; cls?: string }) => (
  <>
    <rect className={cls} x={x} y={y} width={w} height={5} rx={2.5} />
    <rect className={cls} x={x} y={y + 11} width={w * 0.6} height={5} rx={2.5} />
  </>
);

/** 1 · Beide Seiten an einem Ort: one profile branching into what it brings (region, needs, offer). */
export function ProfileArt() {
  const { g: G, path: P, rect: R } = useContext(ArtKit);
  const v = useV();
  return (
    <Frame>
      <P className="a-wire a-wire-mist" d="M180 62 C180 98 110 92 110 126" {...v(draw(0.35))} />
      <P className="a-wire a-wire-ink" d="M180 62 V126" {...v(draw(0.45))} />
      <P className="a-wire a-wire-amber" d="M180 62 C180 98 250 92 250 126" {...v(draw(0.55))} />
      <G {...v(pop(0))}>
        <R className="a-amber" x={128} y={22} width={104} height={40} rx={10} />
        <Lines x={144} y={34} w={60} cls="a-line-light" />
      </G>
      <G {...v(pop(0.75))}><R className="a-mist" x={86} y={126} width={48} height={48} rx={10} /></G>
      <G {...v(pop(0.85))}><R className="a-ink" x={156} y={126} width={48} height={48} rx={10} /></G>
      <G {...v(pop(0.95))}><R className="a-amber-soft" x={226} y={126} width={48} height={48} rx={10} /></G>
    </Frame>
  );
}

/** 2 · Vorschläge statt kalter Anfragen: a short list of firms, the one that fits picked out. */
export function SuggestArt() {
  const { g: G, rect: R, circle: C, path: P } = useContext(ArtKit);
  const v = useV();
  const rows = [
    { y: 26, x: 92, cls: 'a-oat', delay: 0.1 },
    { y: 128, x: 92, cls: 'a-oat', delay: 0.2 },
  ];
  return (
    <Frame>
      {rows.map((r) => (
        <G key={r.y} {...v(pop(r.delay, -2))}>
          <R className={r.cls} x={r.x} y={r.y} width={196} height={46} rx={12} />
          <R className="a-mist" x={r.x + 10} y={r.y + 10} width={26} height={26} rx={7} />
          <Lines x={r.x + 48} y={r.y + 15} w={90} />
        </G>
      ))}
      <G {...v(pop(0.45, -6))}>
        <R className="a-amber" x={68} y={74} width={224} height={52} rx={13} />
        <R className="a-ink" x={80} y={86} width={28} height={28} rx={7} />
        <Lines x={122} y={93} w={100} cls="a-line-light" />
        <C className="a-light" cx={268} cy={100} r={12} />
        <P className="a-check" d="M262 100.5l4 4 8-8.5" {...v(draw(0.9))} />
      </G>
    </Frame>
  );
}

/** 3 · Ein Match: both sides meet in the centre circle, the four criteria fulfilled below. */
export function MatchArt() {
  const { g: G, path: P, rect: R, circle: C } = useContext(ArtKit);
  const v = useV();
  return (
    <Frame>
      <P className="a-wire a-wire-ink" d="M104 92 C140 92 140 92 158 92" {...v(draw(0.3))} />
      <P className="a-wire a-wire-mist" d="M256 92 C220 92 220 92 202 92" {...v(draw(0.4))} />
      <G {...v(pop(0))}><R className="a-ink" x={56} y={68} width={48} height={48} rx={10} /></G>
      <G {...v(pop(0.1))}><R className="a-mist" x={256} y={68} width={48} height={48} rx={10} /></G>
      <G {...v(pop(0.7, -6))}>
        <C className="a-amber" cx={180} cy={92} r={24} />
        <P className="a-check a-check-light" d="M170 92.5l7 7 14-15" {...v(draw(1))} />
      </G>
      {[0, 1, 2, 3].map((i) => (
        <G key={i} {...v(pop(1 + i * 0.08, -3))}>
          <R className="a-amber-soft" x={137 + i * 24} y={146} width={14} height={14} rx={4} />
        </G>
      ))}
    </Frame>
  );
}

/** 4 · Und danach: the KI-Manager switched on, branching into drafts, reminders and agreed returns. */
export function ManagerArt() {
  const { g: G, path: P, rect: R, circle: C } = useContext(ArtKit);
  const v = useV();
  const knob = { hidden: { x: -36 }, show: { x: 0, transition: { type: 'spring', stiffness: 220, damping: 18, delay: 0.25 } }, hover: { x: -4 } };
  return (
    <Frame>
      <P className="a-wire a-wire-mist" d="M150 100 C196 100 196 52 244 52" {...v(draw(0.5))} />
      <P className="a-wire a-wire-ink" d="M150 100 H244" {...v(draw(0.6))} />
      <P className="a-wire a-wire-amber" d="M150 100 C196 100 196 148 244 148" {...v(draw(0.7))} />
      <G {...v(pop(0))}>
        <R className="a-amber" x={58} y={76} width={92} height={48} rx={24} />
        <G {...v(knob)}><C className="a-light" cx={126} cy={100} r={18} /></G>
      </G>
      <G {...v(pop(0.9))}><R className="a-mist" x={244} y={34} width={58} height={36} rx={9} /></G>
      <G {...v(pop(1))}><R className="a-ink" x={244} y={82} width={58} height={36} rx={9} /></G>
      <G {...v(pop(1.1))}><R className="a-amber-soft" x={244} y={130} width={58} height={36} rx={9} /></G>
    </Frame>
  );
}

export const ARTS = [ProfileArt, SuggestArt, MatchArt, ManagerArt];
