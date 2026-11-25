import { useContext } from 'react';
import { ArtKit, Frame, draw, pop, redraw, useV } from './featuresArt';

/* The four drawings of «Für wen» (Audience.tsx), in the system of the «Mit Sponsuno» drawings (featuresArt.tsx: grid 4,
   margin 32, line weights 2 and 3, radii 4 / 8, D1 colours, Bernstein for the one thing that matters). Plain SVG in
   their final state until Motion arrives (FeaturesLive.tsx → ArtKit); then they build up once in view, and at most one
   thing reacts on hover, never something that is joined to another part. */

const VB = '0 0 240 180';
const EASE = [0.22, 1, 0.36, 1] as const;
type St = { entered: boolean } | undefined;

/** Sportlerinnen und Sportler: a jersey, and on it the sponsor's patch. No hover motion. */
export function AthleteArt() {
  const { g: G, path: P, rect: R } = useContext(ArtKit);
  const v = useV();
  return (
    <Frame v={v} viewBox={VB} className="aud-art">
      <G {...v(pop(0))}>
        {/* drawn 4 inside its edge; the 8 wide round-joined outline in the same colour gives the 4 radius */}
        <P className="a-ink a-soft" d="M90 44 L106 40 Q120 54 134 40 L150 44 L172 66 L158 80 L150 74 V140 H90 V74 L82 80 L68 66 Z" />
        <P className="a-wire a-wire-light" d="M106 44 Q120 58 134 44" />
      </G>
      <G {...v(pop(0.3))}>
        <R className="a-light" x={100} y={76} width={40} height={24} rx={4} />
        <R className="a-ink" x={122} y={86} width={10} height={4} rx={2} />
      </G>
      <P className="a-mark a-mark-amber" d="M113 83 a5 5 0 1 1 0 10 a5 5 0 1 1 0 -10" {...v(redraw(0.5))} />
    </Frame>
  );
}

/** Sportvereine: a pitch with two teams. Hover: the ball rolls across the halfway line to the Tintenblau team. */
export function ClubArt() {
  const { g: G, path: P, circle: C } = useContext(ArtKit);
  const v = useV();
  const ink = [[68, 60], [92, 100], [64, 124]];
  const amber = [[172, 56], [148, 84], [176, 120]];
  const ball = {
    hidden: { opacity: 0, scale: 0.9 },
    show: (s: St) => ({ opacity: 1, scale: 1, x: 0, y: 0, transition: { duration: s?.entered ? 0.7 : 0.6, ease: EASE, delay: s?.entered ? 0 : 0.85 } }),
    hover: { x: -34, y: -2, transition: { duration: 0.8, ease: EASE } },
  };
  return (
    <Frame v={v} viewBox={VB} className="aud-art">
      <P className="a-pitch" d="M36 32 H204 Q208 32 208 36 V144 Q208 148 204 148 H36 Q32 148 32 144 V36 Q32 32 36 32 Z" {...v(draw(0))} />
      <P className="a-pitch" d="M120 32 V148" {...v(draw(0.15))} />
      <P className="a-pitch" d="M120 74 A16 16 0 1 1 120 106 A16 16 0 1 1 120 74" {...v(draw(0.25))} />
      <P className="a-pitch" d="M32 70 H48 V110 H32 M208 70 H192 V110 H208" {...v(draw(0.3))} />
      {ink.map(([x, y], i) => <G key={`i${i}`} {...v(pop(0.5 + i * 0.06))}><C className="a-ink" cx={x} cy={y} r={6} /></G>)}
      {amber.map(([x, y], i) => <G key={`a${i}`} {...v(pop(0.55 + i * 0.06))}><C className="a-amber" cx={x} cy={y} r={6} /></G>)}
      <C className="a-light" cx={140} cy={102} r={5} {...v(ball)} />
    </Frame>
  );
}

/** Kulturvereine: two notes on a staff, joined by a Bernstein beam (no hover motion). */
export function CultureArt() {
  const { g: G, path: P } = useContext(ArtKit);
  const v = useV();
  const beam = {
    hidden: { scaleX: 0 },
    show: (s: St) => ({ scaleX: 1, transition: { duration: 0.6, ease: EASE, delay: s?.entered ? 0 : 0.6 } }),
  };
  const head = (x: number, y: number) => `M${x - 9} ${y + 2} c0 -5 6 -9 12 -9 c4 0 6 2 6 5 c0 5 -6 9 -12 9 c-4 0 -6 -2 -6 -5 Z`;
  return (
    <Frame v={v} viewBox={VB} className="aud-art">
      {[68, 80, 92, 104, 116].map((y, i) => <P key={y} className="a-staff" d={`M32 ${y} H208`} {...v(draw(i * 0.05))} />)}
      <G {...v(pop(0.3))}>
        <P className="a-ink" d={head(98, 116)} />
        <P className="a-stem" d="M106.5 114 V62" />
      </G>
      <G {...v(pop(0.38))}>
        <P className="a-ink" d={head(146, 104)} />
        <P className="a-stem" d="M154.5 102 V50" />
      </G>
      <P className="a-amber" d="M105 56 L156 44 V52 L105 64 Z" {...v(beam, { transformBox: 'fill-box', transformOrigin: 'left center' })} />
    </Frame>
  );
}

/** Firmen aus der Region: a small shop front under a Bernstein awning. No hover motion: nothing here moves on its own. */
export function FirmArt() {
  const { g: G, rect: R, path: P } = useContext(ArtKit);
  const v = useV();
  // eight stripes of 16 across the awning, each ending in a scallop; the outer two carry the 4 radius on top
  const stripe = (i: number) => {
    const x = 56 + i * 16;
    const top = i === 0 ? `M56 44 A4 4 0 0 1 60 40 H72` : i === 7 ? `M168 40 H180 A4 4 0 0 1 184 44` : `M${x} 40 H${x + 16}`;
    return `${top} V64 A8 8 0 0 1 ${x} 64 Z`;
  };
  const stripes = (odd: number) => [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => i % 2 === odd).map(stripe).join(' ');
  return (
    <Frame v={v} viewBox={VB} className="aud-art">
      <G {...v(pop(0))}>
        <R className="a-light" x={68} y={56} width={104} height={92} rx={4} />
        <R className="a-mist" x={80} y={92} width={40} height={32} rx={4} />
        <P className="a-ink2" d="M132 148 V100 A4 4 0 0 1 136 96 H156 A4 4 0 0 1 160 100 V148 Z" />
      </G>
      <G {...v(pop(0.25))}>
        <P className="a-amber" d={stripes(0)} />
        <P className="a-amber-soft" d={stripes(1)} />
      </G>
    </Frame>
  );
}

export const AUDIENCE_ARTS = [AthleteArt, ClubArt, CultureArt, FirmArt];
