import type { CSSProperties, ReactNode, Ref } from 'react';
import { aiManager, match, story, type StoryState } from '../content';
import { STAGE_ITEMS, visibleIn } from '../lib/storyLayout';
import { InputIcon, type IconName } from './InputIcon';
import { MatchCard } from './MatchCard';
import '../styles/sections/story-art.css';

// Pieces of the story stage. All of it is decorative: the stage is aria-hidden; the text alternative is given once
// (story.artAlt in the hero).

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const Check = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>;

// The inputs of the "heute" picture (the hero's start frame uses its own set) and their icons
const PAPER_ICON = {
  dossier: 'pdf', absage: 'mail', antwort: 'clock', zustaendig: 'ask', training: 'pen', gegenleistung: 'open', gelohnt: 'chart',
} as const satisfies Record<string, IconName>;
type PaperKind = keyof typeof PAPER_ICON;

/** A raw input as an input tile, the same tile as in the hero (.in-tile): one size, never tilted. */
const Paper = ({ kind }: { kind: PaperKind }) => (
  <div className="in-tile paper"><InputIcon name={PAPER_ICON[kind]} /><span className="in-label">{story.papers[kind]}</span></div>
);

const Disc = ({ side, mark }: { side: 'seeker' | 'firm'; mark: string }) => (
  <span className={`disc disc-${side}`}>{mark}</span>
);

/** One fictional pair on one surface: seeker and company on the same grid (same disc style), then the region, the
    four criteria as dots (a ring for "teilweise" on Budget) and the score. Same order as the rows of the hero's
    product window. */
function PairCard({ index }: { index: number }) {
  const p = story.pairs[index];
  return (
    <div className="pc">
      {([['seeker', p.seeker], ['firm', p.firm]] as const).map(([side, who]) => (
        <p key={side} className="pc-row"><Disc side={side} mark={who.mark} /><span className="pc-name">{who.name}</span></p>
      ))}
      <p className="pc-foot">
        <span className="pc-meta">{p.region}</span>
        <span className="pc-dots">
          {match.criteria.map((c, k) => <i key={c} className={`pc-dot${k < p.score ? ' is-on' : ''}`} style={{ '--k': k } as Vars} />)}
        </span>
        <span className="pc-score">{story.scoreShort(p.score)}</span>
      </p>
    </div>
  );
}

/** Seeker as a card in the heap (with its role) and as a card in the queue (with its region): same size and surface
    as the input tiles' family, never tilted; the two faces crossfade. */
function SeekerChip({ index }: { index: number }) {
  const p = story.pairs[index];
  return (
    <>
      <div className="face face-raw chip">
        <Disc side="seeker" mark={p.seeker.mark} />
        <span className="chip-t"><span className="chip-role">{story.columns.seeker}</span><span className="chip-name">{p.seeker.name}</span></span>
      </div>
      <div className="face face-clean chip">
        <Disc side="seeker" mark={p.seeker.mark} />
        <span className="chip-t"><span className="chip-name">{p.seeker.name}</span><span className="chip-meta">{p.region}</span></span>
      </div>
    </>
  );
}

function FirmChip({ index }: { index: number }) {
  const p = story.pairs[index];
  return (
    <div className="chip chip-firm">
      <Disc side="firm" mark={p.firm.mark} />
      <span className="chip-t"><span className="chip-name">{p.firm.name}</span><span className="chip-meta">{p.region}</span></span>
    </div>
  );
}

function CriteriaLegend() {
  return (
    <p className="lg">
      {match.criteria.map((c, k) => (
        <span key={c} className="lg-chip"><i className="lg-chk" style={{ '--k': k } as Vars} />{c}</span>
      ))}
    </p>
  );
}

function LockDisc() {
  return <span className="lock"><Check /></span>;
}

function KiDraft() {
  const { draft } = aiManager;
  return (
    <div className="ki-draft">
      <p className="ki-app"><span className="ki-dot" />{draft.app}</p>
      <p className="ki-title">{draft.label}</p>
      <p className="ki-status">{draft.status}</p>
    </div>
  );
}

function KiDeliverables() {
  const { deliverables } = aiManager;
  const first = deliverables.items[0];
  return (
    <div className="ki-deliv">
      <p className="ki-deliv-title">{deliverables.title}</p>
      <p className="ki-row"><span className="ki-chk"><Check /></span><span>{first.text}</span><span className="ki-note">{first.note}</span></p>
    </div>
  );
}

function itemBody(key: string): { layer: 'l' | 'r' | 't'; kind: string; body: ReactNode; i?: number } {
  const paper = key.startsWith('p-') ? key.slice(2) : '';
  if (paper in PAPER_ICON) return { layer: 'l', kind: 'paper', body: <Paper kind={paper as PaperKind} /> };
  const [type, n] = key.split('-');
  const i = Number(n);
  switch (type) {
    case 's': return { layer: 'l', kind: 'seeker', body: <SeekerChip index={i} />, i };
    case 'f': return { layer: 'r', kind: 'firm', body: <FirmChip index={i} />, i };
    case 'pair': return { layer: 'r', kind: 'pair', body: <PairCard index={i} />, i };
    case 'lock': return { layer: 't', kind: 'lock', body: <LockDisc />, i };
    case 'line': return { layer: 't', kind: 'line', body: <span className="ln" /> };
    case 'head': return { layer: 't', kind: 'head', body: <span className="head-t">{n === 'seeker' ? story.columns.seeker : story.columns.sponsor}</span> };
    case 'match': return { layer: 't', kind: 'match', body: <MatchCard /> };
    case 'legend': return { layer: 't', kind: 'legend', body: <CriteriaLegend /> };
    case 'ki': return { layer: 't', kind: 'ki', body: n === 'draft' ? <KiDraft /> : <KiDeliverables /> };
    default: return { layer: 't', kind: 'misc', body: null };
  }
}

/**
 * The story stage. `live`: the one sticky stage whose data-step the observer changes (transitions run there).
 * Otherwise a static snapshot of one state that renders only the items visible in it.
 */
export function StageArt({ state, live = false, stageRef }: { state: StoryState; live?: boolean; stageRef?: Ref<HTMLDivElement> }) {
  const layers: Record<'l' | 'r' | 't', ReactNode[]> = { l: [], r: [], t: [] };
  for (const item of STAGE_ITEMS) {
    if (!live && !visibleIn(item, state)) continue;
    const { layer, kind, body, i } = itemBody(item.key);
    layers[layer].push(
      <div key={item.key} className={`it it-${kind} it-${item.key}`} style={i !== undefined ? ({ '--i': i } as Vars) : undefined}>{body}</div>,
    );
  }
  // The match card carries its own label ("Beispieldaten"): no stage caption there
  const caption = state === 'danach' ? 'planned' : state === 'match' ? null : ['linie', 'sortiert'].includes(state) ? 'solution' : 'heute';
  return (
    <div ref={stageRef} className={`st-art${live ? ' st-live' : ''}`} data-step={state}>
      <div className="st-win st-win-l">{layers.l}</div>
      <div className="st-win st-win-r">{layers.r}</div>
      {layers.t}
      <p className="st-cap">
        {live
          ? (['heute', 'solution', 'planned'] as const).map((c) => <span key={c} className={`cap cap-${c}`}>{story.captions[c]}</span>)
          : caption && <span className={`cap cap-${caption}`}>{story.captions[caption]}</span>}
      </p>
    </div>
  );
}
