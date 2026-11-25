import { useContext } from 'react';
import { ArtKit, Frame, draw, pop, useV } from './featuresArt';

/* The four drawings of «Für wen» (Audience.tsx, 2026-11-25), in the same language as the «Mit Sponsuno» drawings:
   soft rounded shapes in Tintenblau, Bernstein, their tints and Hafer, nothing else. Plain SVG in their final state
   until Motion arrives (FeaturesLive.tsx → ArtKit); then they build up once in view and react on hover. */

const VB = '0 0 240 180';

/** Sportlerinnen und Sportler: a jersey, and on it the sponsor's patch. */
export function AthleteArt() {
  const { g: G, path: P, rect: R } = useContext(ArtKit);
  const v = useV();
  return (
    <Frame viewBox={VB} className="aud-art">
      <G {...v(pop(0, -3))}>
        <P className="a-ink a-soft-ink" d="M92 38 L106 30 Q120 42 134 30 L148 38 L172 62 L156 78 L146 70 L146 144 Q120 150 94 144 L94 70 L84 78 L68 62 Z" />
        <P className="a-collar" d="M106 31 Q120 45 134 31" />
      </G>
      <G {...v(pop(0.45, -7))}>
        <R className="a-light" x={104} y={70} width={32} height={20} rx={5} />
        <R className="a-amber" x={110} y={77} width={20} height={6} rx={3} />
      </G>
      <G {...v(pop(0.6, -2))}><R className="a-amber" x={94} y={118} width={52} height={7} rx={3.5} /></G>
    </Frame>
  );
}

/** Sportvereine: a pitch with two teams. */
export function ClubArt() {
  const { g: G, path: P, circle: C } = useContext(ArtKit);
  const v = useV();
  const ink = [[80, 62], [88, 118], [104, 90]];
  const amber = [[154, 66], [142, 114], [164, 96]];
  return (
    <Frame viewBox={VB} className="aud-art">
      <P className="a-pitch" d="M50 36 H190 Q200 36 200 46 V134 Q200 144 190 144 H50 Q40 144 40 134 V46 Q40 36 50 36 Z" {...v(draw(0))} />
      <P className="a-pitch" d="M120 36 V144" {...v(draw(0.25))} />
      <P className="a-pitch" d="M120 72 A18 18 0 1 1 120 108 A18 18 0 1 1 120 72" {...v(draw(0.35))} />
      <P className="a-pitch" d="M40 72 H56 V108 H40 M200 72 H184 V108 H200" {...v(draw(0.45))} />
      {ink.map(([x, y], i) => <G key={`i${i}`} {...v(pop(0.6 + i * 0.08, -5))}><C className="a-ink" cx={x} cy={y} r={7} /></G>)}
      {amber.map(([x, y], i) => <G key={`a${i}`} {...v(pop(0.7 + i * 0.08, -5))}><C className="a-amber" cx={x} cy={y} r={7} /></G>)}
      <G {...v(pop(0.95, -8))}><C className="a-light" cx={124} cy={92} r={4} /></G>
    </Frame>
  );
}

/** Kulturvereine: two beamed notes on a staff. */
export function CultureArt() {
  const { g: G, path: P } = useContext(ArtKit);
  const v = useV();
  return (
    <Frame viewBox={VB} className="aud-art">
      {[58, 72, 86, 100, 114].map((y, i) => (
        <P key={y} className="a-staff" d={`M36 ${y} H204`} {...v(draw(i * 0.06))} />
      ))}
      <G {...v(pop(0.4, -6))}>
        <P className="a-ink" d="M86 124 c0 -8 10 -14 20 -12 c8 2 10 9 6 14 c-5 7 -26 8 -26 -2 Z" />
        <P className="a-stem" d="M111 117 V54" />
      </G>
      <G {...v(pop(0.5, -9))}>
        <P className="a-ink" d="M136 112 c0 -8 10 -14 20 -12 c8 2 10 9 6 14 c-5 7 -26 8 -26 -2 Z" />
        <P className="a-stem" d="M161 105 V42" />
      </G>
      <P className="a-beam" d="M111 56 L161 44" {...v(draw(0.75))} />
      <G {...v(pop(0.9, -4))}><P className="a-amber" d="M190 34 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" /></G>
    </Frame>
  );
}

/** Firmen aus der Region: a shop front with an awning. */
export function FirmArt() {
  const { g: G, rect: R, circle: C } = useContext(ArtKit);
  const v = useV();
  return (
    <Frame viewBox={VB} className="aud-art">
      <G {...v(pop(0, -2))}>
        <R className="a-light" x={62} y={60} width={116} height={86} rx={6} />
        <R className="a-mist" x={78} y={92} width={38} height={30} rx={4} />
        <R className="a-ink2" x={130} y={96} width={32} height={50} rx={4} />
      </G>
      <G {...v(pop(0.3, -6))}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <R className={i % 2 ? 'a-amber-soft' : 'a-amber'} x={54 + i * 22} y={44} width={22} height={18} />
            <C className={i % 2 ? 'a-amber-soft' : 'a-amber'} cx={65 + i * 22} cy={62} r={11} />
          </g>
        ))}
      </G>
      <G {...v(pop(0.55, -4))}><R className="a-amber" x={96} y={24} width={48} height={12} rx={6} /></G>
    </Frame>
  );
}

export const AUDIENCE_ARTS = [AthleteArt, ClubArt, CultureArt, FirmArt];
