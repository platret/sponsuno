import { useImperativeHandle, useLayoutEffect, useRef, type Ref } from 'react';
import photo from '../assets/symbolbild-mtb-192.jpg';
import { match } from '../content';
import { createMatchController, type MatchController } from '../lib/match';

export type MatchHandle = Pick<MatchController, 'play' | 'showFinal' | 'playWhenVisible'>;

/**
 * The hero's one orchestrated moment: a fictional athlete and sponsor get matched on four criteria.
 * Without JS (or before the controller runs) everything shows in its final state.
 */
export function MatchCard({ ref }: { ref?: Ref<MatchHandle> }) {
  const figureRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const sparkRef = useRef<HTMLSpanElement>(null);
  const anchorARef = useRef<HTMLSpanElement>(null);
  const anchorBRef = useRef<HTMLSpanElement>(null);
  const controller = useRef<MatchController | null>(null);

  // Layout effect, not a passive one: the hero's intro (a parent layout effect) may call the handle
  // right after hydration, and child layout effects are guaranteed to have run by then.
  useLayoutEffect(() => {
    const [figure, stage, path, glow, spark, anchorA, anchorB] = [
      figureRef.current, stageRef.current, pathRef.current, glowRef.current, sparkRef.current, anchorARef.current, anchorBRef.current,
    ];
    if (!figure || !stage || !path || !glow || !spark || !anchorA || !anchorB) return;
    const c = createMatchController({ figure, stage, path, glow, spark, anchorA, anchorB });
    controller.current = c;
    return () => {
      c.destroy();
      controller.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    play: () => controller.current?.play(),
    showFinal: () => controller.current?.showFinal(),
    playWhenVisible: () => controller.current?.playWhenVisible(),
  }), []);

  const replay = () => {
    if (document.documentElement.classList.contains('motion')) controller.current?.play();
    else controller.current?.showFinal();
  };

  return (
    <figure className="match" ref={figureRef} aria-labelledby="match-caption">
      <div className="match-stage" ref={stageRef}>
        <svg className="match-thread" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="thread-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#D5BF93" />
              <stop offset="1" stopColor="#B08D57" />
            </linearGradient>
          </defs>
          <path className="thread-glow" ref={glowRef} d="" />
          <path className="thread-line" ref={pathRef} d="" />
        </svg>
        <span className="thread-spark" ref={sparkRef} aria-hidden="true" />

        <article className="party party-athlete" data-step="1">
          <img className="party-photo" src={photo} alt="" width={64} height={64} decoding="async" fetchPriority="high" />
          <div>
            <p className="party-role">{match.athlete.role}</p>
            <h2 className="party-name">{match.athlete.name}</h2>
            <p className="party-meta">{match.athlete.region}</p>
            <p className="party-need">{match.athlete.need}</p>
          </div>
          <span className="party-dot" ref={anchorARef} aria-hidden="true" />
        </article>

        <ol className="criteria" aria-label="Übereinstimmung">
          {match.criteria.map((c, i) => (
            <li key={c.key} data-step={i + 2}>
              <span className="criteria-key">{c.key}</span>
              <span className="criteria-val">{c.value}</span>
              <span className="tick" aria-hidden="true" />
            </li>
          ))}
        </ol>

        <p className="match-result" data-step={match.criteria.length + 2}>{match.result}</p>

        <article className="party party-sponsor" data-step="1">
          <span className="party-mark" aria-hidden="true">{match.sponsor.mark}</span>
          <div>
            <p className="party-role">{match.sponsor.role}</p>
            <h2 className="party-name">{match.sponsor.name}</h2>
            <p className="party-meta">{match.sponsor.region}</p>
            <p className="party-need">{match.sponsor.need}</p>
          </div>
          <span className="party-dot" ref={anchorBRef} aria-hidden="true" />
        </article>
      </div>
      <figcaption id="match-caption" className="match-caption">
        <span>{match.caption}</span>
        <button className="replay" type="button" onClick={replay}>{match.replay}</button>
      </figcaption>
    </figure>
  );
}
