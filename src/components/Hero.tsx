import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { hero, match, story, type Role } from '../content';
import { InputIcon } from './InputIcon';
import '../styles/sections/hero.css';

type Vars = CSSProperties & Record<`--${string}`, string | number>;

// Start frame (DESIGN.md -> Story, "Hero start frame"): uniform input tiles, right-angled hairlines that merge in one
// brass node, a hairline from the node into one framed product window ("Passende Partner") where a new pair arrives
// at the top every few seconds. CSS only (hero.css); the still layout is the reduced-motion and no-JS picture.

// Hairlines in px, 1:1 with the layout (hero.css gives the wire column exactly this width and sizes the tiles to
// match), each branch starting at the tiles' right edge, so the whole run is in view at every width. Desktop: 4 tiles
// of 36 px, 12 px apart (centres 18, 66, 114, 162), merging at y 90. Phones: 3 tiles of 30 px, 8 px apart
// (centres 15, 53, 91), merging at y 53. r = 8 for every corner; the inner branches turn first, so nothing crosses.
const WIRES = {
  d: {
    w: 96, h: 180, y: 90, join: 32,
    branches: [
      ['M0 18H40A8 8 0 0 1 48 26V82A8 8 0 0 0 56 90', 'H96'],
      ['M0 66H16A8 8 0 0 1 24 74V82A8 8 0 0 0 32 90', 'H96'],
      ['M0 114H16A8 8 0 0 0 24 106V98A8 8 0 0 1 32 90', 'H96'],
      ['M0 162H40A8 8 0 0 0 48 154V98A8 8 0 0 1 56 90', 'H96'],
    ],
  },
  m: {
    w: 56, h: 106, y: 53, join: 24,
    branches: [
      ['M0 15H8A8 8 0 0 1 16 23V45A8 8 0 0 0 24 53', 'H56'],
      ['M0 53H24', 'H56'],
      ['M0 91H8A8 8 0 0 0 16 83V61A8 8 0 0 1 24 53', 'H56'],
    ],
  },
} as const;

function Wires({ v }: { v: 'd' | 'm' }) {
  const { w, h, y, join, branches } = WIRES[v];
  return (
    <svg className={`ha-wires ha-wires-${v}`} viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      {branches.map(([d], k) => <path key={k} className="ha-wire" d={d} />)}
      <path className="ha-wire" d={`M${join} ${y}H${w}`} />
      {branches.map(([d, end], k) => (
        <path key={`p${k}`} className="ha-pulse" d={d + end} pathLength={100} style={{ '--k': k } as Vars} />
      ))}
    </svg>
  );
}

function Row({ i }: { i: number }) {
  const p = story.pairs[i];
  return (
    <div className="ha-row" style={{ '--r': i } as Vars}>
      <span className="ha-discs"><span className="ha-disc ha-disc-s">{p.seeker.mark}</span><span className="ha-disc ha-disc-f">{p.firm.mark}</span></span>
      <span className="ha-names">{p.seeker.name}<span className="ha-sep"> · </span>{p.firm.name}</span>
      <span className="ha-region">{p.region}</span>
      <span className="ha-score">
        <span className="ha-dots">
          {match.criteria.map((c, k) => <i key={c} className={k < p.score ? 'is-on' : undefined} style={{ '--k': k } as Vars} />)}
        </span>
        {story.scoreShort(p.score)}
      </span>
    </div>
  );
}

/** Graphit hero, left-aligned on the grid: launch label, H1 with the brass accent word, lead, the two audience pills,
    then the start frame of the scroll story inside the first viewport. The story itself follows in
    Story.tsx. */
export function Hero({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  // The loop pauses while the picture is off screen (one observer, no per-frame script) and on request (the toggle)
  const art = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const el = art.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-off', !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-ground" aria-hidden="true" />
      <div className="container hero-copy" data-scroll="recede">
        <p className="label hero-badge">{hero.badge}</p>
        <h1 id="hero-title">
          {hero.titleStart} <span className="hero-accent">{hero.titleAccent}</span>
        </h1>
        <p className="hero-lead">{hero.lead}</p>
        <div className="hero-actions">
          <div className="hero-buttons">
            <a className="btn btn-brass" href="#warteliste" onClick={() => onChooseRole(hero.ctaSeeker.role)}>{hero.ctaSeeker.label}</a>
            <a className="btn btn-ghost" href="#warteliste" onClick={() => onChooseRole(hero.ctaSponsor.role)}>{hero.ctaSponsor.label}</a>
          </div>
        </div>
      </div>

      {/* Wrapper carries the scroll recede; the pieces inside run their own load animation and the loop */}
      <figure className="container hero-art" data-scroll="recede" data-paused={paused ? '' : undefined} ref={art}>
        <div className="ha-canvas" aria-hidden="true">
          <ul className="ha-tiles">
            {story.heroInputs.map((t) => (
              <li key={t.kind} className={`in-tile ha-tile${t.phone ? '' : ' ha-mhide'}`}>
                <InputIcon name={t.icon} />
                <span className="in-label">{story.papers[t.kind]}</span>
              </li>
            ))}
          </ul>
          <div className="ha-wirebox"><Wires v="d" /><Wires v="m" /></div>
          <span className="ha-node"><i /></span>
          <span className="ha-link"><i /></span>
          <div className="ha-win">
            <p className="ha-bar">
              <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5.5" cy="8" r="3" /><circle cx="10.5" cy="8" r="3" /></svg>
              <span className="ha-title">{story.heroWindow.title}</span>
              <span className="ha-tab">{story.heroWindow.tab}</span>
            </p>
            <div className="ha-list">{story.pairs.map((_, i) => <Row key={i} i={i} />)}</div>
          </div>
        </div>
        <p className="visually-hidden">{story.artAlt}</p>
        <button type="button" className="ha-play" aria-label={hero.pauseLabel} aria-pressed={paused} onClick={() => setPaused((v) => !v)}>
          <svg viewBox="0 0 16 16" aria-hidden="true">{paused ? <path className="ha-play-i" d="M5.5 4v8l6-4z" /> : <path d="M6 4.5v7M10 4.5v7" />}</svg>
        </button>
        <figcaption className="ha-cap">{story.captions.solution}</figcaption>
      </figure>
    </section>
  );
}
