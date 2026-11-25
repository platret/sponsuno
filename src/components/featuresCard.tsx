import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { Check, Handshake, MapPin, Sparkles } from 'lucide-react';
import { features, match, story } from '../content';

/* The product card of «Mit Sponsuno» (Features.tsx) without Motion: the three states, the frame and a static card.
   FeaturesLive.tsx (loaded after hydration, desktop only) fills MotionKit with Motion's `m` components, so the same
   states animate there while the landing page's first JavaScript carries no Motion code. */

const card = features.card;

export type MotionKitValue = {
  div: (props: Record<string, unknown>) => ReactNode;
  span: (props: Record<string, unknown>) => ReactNode;
  list: object;
  row: object;
} | null;
/** Motion's `m.div`/`m.span` and the stagger variants, provided by FeaturesLive.tsx; null = plain elements */
export const MotionKit = createContext<MotionKitValue>(null);
/** False until the visitor has moved to another step: the first state shows at once */
export const AnimateIn = createContext(false);

function Row({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  const kit = useContext(MotionKit);
  if (kit) { const D = kit.div; return <D className={className} style={style} variants={kit.row}>{children}</D>; }
  return <div className={className} style={style}>{children}</div>;
}
function Rows({ children }: { children: ReactNode }) {
  const kit = useContext(MotionKit);
  const animateIn = useContext(AnimateIn);
  if (kit) { const D = kit.div; return <D variants={kit.list} initial={animateIn ? 'hidden' : false} animate="show">{children}</D>; }
  return <div>{children}</div>;
}

const Dots = ({ score }: { score: number }) => (
  <span className="fx-dots">{match.criteria.map((c, k) => <i key={c} className={k < score ? 'is-on' : undefined} />)}</span>
);

function ProfileState() {
  return (
    <Rows>
      <Row className="fx-who">
        <span className="fx-sq">{card.profile.mark}</span>
        <span>
          <b>{card.profile.name}</b>
          <small><MapPin aria-hidden="true" />{card.profile.place}</small>
        </span>
      </Row>
      {card.profile.rows.map((r) => (
        <Row key={r.k} className="fx-field">
          <span className="fx-k">{r.k}</span>
          <span className="fx-v">{r.v}</span>
          <Check className="fx-ok" aria-hidden="true" />
        </Row>
      ))}
    </Rows>
  );
}

function SuggestState() {
  return (
    <Rows>
      <Row className="fx-sub"><Sparkles aria-hidden="true" />{card.suggestions.title}</Row>
      {card.suggestions.items.map((f, i) => (
        <Row key={f.name} className={`fx-firm${i === 0 ? ' is-top' : ''}`}>
          <span className="fx-sq fx-sq-firm">{f.mark}</span>
          <span className="fx-firm-name"><b>{f.name}</b><small>{f.meta}</small></span>
          <span className="fx-score"><Dots score={f.score} />{story.scoreShort(f.score)}</span>
        </Row>
      ))}
    </Rows>
  );
}

function MatchState() {
  const kit = useContext(MotionKit);
  const animateIn = useContext(AnimateIn);
  const S = kit?.span;
  return (
    <Rows>
      <Row className="fx-pair">
        <span className="fx-sq">{card.profile.mark}</span>
        {S
          ? <S className="fx-link" initial={animateIn ? { scaleX: 0 } : false} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} />
          : <span className="fx-link" />}
        <span className="fx-sq fx-sq-firm">{card.match.firmMark}</span>
      </Row>
      <Row className="fx-result">{match.result}</Row>
      <Row className="fx-criteria">
        {match.criteria.map((c) => <span key={c}><Check aria-hidden="true" />{c}</span>)}
      </Row>
      <Row className="fx-agreed"><Handshake aria-hidden="true" />{card.match.agreed}</Row>
    </Rows>
  );
}

export const STATES = [ProfileState, SuggestState, MatchState];

/** Card chrome: the three tabs (current one dark) and the one "Beispieldaten" label, then the body. */
export function CardFrame({ step, children }: { step: number; children: ReactNode }) {
  return (
    <div className="fx-card">
      <div className="fx-bar">
        <span className="fx-tabs">
          {card.tabs.map((t, i) => <span key={t} className={i === step ? 'is-on' : undefined}>{t}</span>)}
        </span>
        <span className="fx-example">{card.label}</span>
      </div>
      <div className="fx-body">{children}</div>
    </div>
  );
}

export function StaticCard({ step }: { step: number }) {
  const State = STATES[step];
  return <CardFrame step={step}><State /></CardFrame>;
}
