import type { CSSProperties, ReactNode, Ref } from 'react';
import { aiManager, match, story, type StoryState } from '../content';
import { STAGE_ITEMS, visibleIn } from '../lib/storyLayout';
import { MatchCard } from './MatchCard';
import '../styles/sections/story-art.css';

// Pieces of the story graphic (hero start frame and the story stage). All of it is decorative: the parents
// mark it aria-hidden and give the text alternative once (story.artAlt in the hero).

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const Check = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>;
const Half = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="half"><circle cx="8" cy="8" r="5.5" /><path d="M8 2.5a5.5 5.5 0 0 1 0 11z" /></svg>
);

const scribble = (n: number, widths = [88, 70, 80, 56]) => (
  <span className="pp-lines">{Array.from({ length: n }, (_, k) => <i key={k} style={{ width: `${widths[k % widths.length]}%` }} />)}</span>
);

export type PaperKind = keyof Omit<typeof story.papers, 'pdfTag'>;

// Static tilt per paper (never animated: "straightening" is a crossfade between faces)
const TILT: Record<PaperKind, number> = {
  anfrage: -6, dossier: 5, absage: -3, antwort: 4, zustaendig: -5, liste: 3, training: 6, gegenleistung: -4, gelohnt: 3,
  nachfassen: 3, praesentation: -5, fragen: 5, rueckruf: -3,
};

const SHAPE: Record<PaperKind, string> = {
  anfrage: 'letter', dossier: 'pdf', absage: 'mail', antwort: 'env', zustaendig: 'sticky', liste: 'sheet', training: 'sticky',
  gegenleistung: 'small', gelohnt: 'small', nachfassen: 'mail', praesentation: 'pdf', fragen: 'sticky', rueckruf: 'small',
};

/** A raw paper: request letter, PDF, e-mail, envelope, sticky note, list or small question card. */
export function Paper({ kind, className = '', style }: { kind: PaperKind; className?: string; style?: Vars }) {
  const label = <span className="pp-lab">{story.papers[kind]}</span>;
  let body: ReactNode;
  const shape = SHAPE[kind];
  switch (shape) {
    case 'letter': body = <>{scribble(3)}{label}</>; break;
    case 'pdf': body = <><span className="pp-ear" /><span className="pp-tag">{story.papers.pdfTag}</span>{scribble(4, [80, 64, 72, 48])}{label}</>; break;
    case 'mail': body = <><span className="pp-dots"><b /><b /><b /></span>{label}{scribble(2, [86, 60])}</>; break;
    case 'env': body = <><svg className="pp-flap" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M1 1 L50 30 L99 1" /></svg>{label}</>; break;
    case 'sheet': body = <><span className="pp-grid" />{label}</>; break;
    case 'small': body = <><span className="pp-open" />{label}</>; break;
    default: body = label;
  }
  return (
    <div className={`paper pp-${shape} ${className}`} style={{ '--t': `${TILT[kind]}deg`, ...style } as Vars}>
      <div className="pp">{body}</div>
    </div>
  );
}

const Disc = ({ side, mark }: { side: 'seeker' | 'firm'; mark: string }) => (
  <span className={`disc disc-${side}`}>{mark}</span>
);

/** One fictional pair: seeker on top, company below, joined by a thin gold connector; four criteria dots and the score. */
export function PairCard({ index, lead = false }: { index: number; lead?: boolean }) {
  const p = story.pairs[index];
  const partial = p.score < 4;
  return (
    <div className={`pc${lead ? ' pc-lead' : ''}`}>
      <div className="pc-row">
        <Disc side="seeker" mark={p.seeker.mark} />
        <span className="pc-t"><span className="pc-name">{p.seeker.name}</span><span className="pc-meta">{p.region}</span></span>
      </div>
      <div className="pc-mid">
        <span className="pc-link" />
        <span className="pc-dots">
          {match.criteria.map((c, k) => (
            <i key={c} className={`pc-dot${partial && k === 3 ? ' is-half' : ''}`} style={{ '--k': k } as Vars}>
              {partial && k === 3 ? <Half /> : <Check />}
            </i>
          ))}
        </span>
      </div>
      <div className="pc-row">
        <Disc side="firm" mark={p.firm.mark} />
        <span className="pc-t"><span className="pc-name">{p.firm.name}</span><span className="pc-meta">{p.region}</span></span>
      </div>
      <p className={`pc-score${partial ? ' is-part' : ''}`}>
        {partial && <Half />}
        {lead ? match.result : story.scoreShort(p.score)}
      </p>
    </div>
  );
}

/** Seeker as a loose card in the heap (raw, tilted, with its role) and as a straight card in the queue (clean). */
function SeekerChip({ index }: { index: number }) {
  const p = story.pairs[index];
  return (
    <>
      <div className="face face-raw chip" style={{ '--t': `${[-4, 3, -3][index] ?? 0}deg` } as Vars}>
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

/** The four criteria, named once (the dots on the pair cards are unlabelled). Checks tick with the lead pair's dots. */
export function CriteriaLegend() {
  return (
    <p className="lg">
      {match.criteria.map((c, k) => (
        <span key={c} className="lg-chip"><i className="lg-chk" style={{ '--k': k } as Vars}><Check /></i>{c}</span>
      ))}
    </p>
  );
}

export function LockDisc() {
  return <span className="lock"><Check /></span>;
}

function KiDraft() {
  const { draft } = aiManager;
  return (
    <div className="ki-draft">
      <p className="ki-app"><span className="ki-dot" />{draft.app}<span className="ki-tag">{story.labels.planned}</span></p>
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

const PAPER_OF: Record<string, PaperKind> = {
  'p-anfrage': 'anfrage', 'p-dossier': 'dossier', 'p-liste': 'liste', 'p-antwort': 'antwort', 'p-zustaendig': 'zustaendig',
  'p-training': 'training', 'p-absage': 'absage', 'p-gegenleistung': 'gegenleistung', 'p-gelohnt': 'gelohnt',
};

function itemBody(key: string): { layer: 'l' | 'r' | 't'; kind: string; body: ReactNode; i?: number } {
  if (PAPER_OF[key]) return { layer: 'l', kind: 'paper', body: <Paper kind={PAPER_OF[key]} /> };
  const [type, n] = key.split('-');
  const i = Number(n);
  switch (type) {
    case 's': return { layer: 'l', kind: 'seeker', body: <SeekerChip index={i} />, i };
    case 'f': return { layer: 'r', kind: 'firm', body: <FirmChip index={i} />, i };
    case 'pair': return { layer: 'r', kind: 'pair', body: <PairCard index={i} lead={i === 0} />, i };
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
  // The match card carries its own label ("Beispiel mit fiktiven Angaben · Symbolbild"): no stage caption there
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
