import { features, story } from '../content';
import '../styles/sections/features.css';

/* Three plain diagrams in one visual language (squares, the halfway line and centre circle of the pitch, one Bernstein
   line), telling the three steps as a progression: both sides on their own half → Sponsuno suggests who fits → they
   meet. Filled Hafer square = club or athlete, outlined square = firm. No example data, so no "Beispieldaten" label.
   Decorative (aria-hidden): the step text says the same in words. */

const Pitch = () => (
  <g className="fx-pitch">
    <line x1="160" y1="0" x2="160" y2="200" />
    <circle cx="160" cy="100" r="34" />
  </g>
);

function SidesDiagram() {
  return (
    <svg viewBox="0 0 320 200">
      <Pitch />
      <rect className="fx-seeker" x="58" y="62" width="44" height="44" />
      <rect className="fx-firm" x="218.75" y="62.75" width="42.5" height="42.5" />
      <text className="fx-label" x="80" y="134">{features.diagram.seeker}</text>
      <text className="fx-label" x="240" y="134">{features.diagram.firm}</text>
    </svg>
  );
}

function SuggestDiagram() {
  return (
    <svg viewBox="0 0 320 200">
      <Pitch />
      <line className="fx-option-line" x1="102" y1="100" x2="226" y2="46" />
      <line className="fx-option-line" x1="102" y1="100" x2="226" y2="154" />
      <line className="fx-match-line" x1="102" y1="100" x2="226" y2="100" />
      <rect className="fx-seeker" x="58" y="78" width="44" height="44" />
      <rect className="fx-firm fx-firm-dim" x="226.75" y="32.75" width="26.5" height="26.5" />
      <rect className="fx-firm" x="226.75" y="86.75" width="26.5" height="26.5" />
      <rect className="fx-firm fx-firm-dim" x="226.75" y="140.75" width="26.5" height="26.5" />
    </svg>
  );
}

function MatchDiagram() {
  return (
    <svg viewBox="0 0 320 200">
      <Pitch />
      <line className="fx-match-line" x1="102" y1="84" x2="218" y2="84" />
      <rect className="fx-seeker" x="58" y="62" width="44" height="44" />
      <rect className="fx-firm" x="218.75" y="62.75" width="42.5" height="42.5" />
      <text className="fx-score" x="160" y="156">{features.diagram.score}</text>
    </svg>
  );
}

const DIAGRAMS = [SidesDiagram, SuggestDiagram, MatchDiagram];

/**
 * «Mit Sponsuno» on Tintenblau (third form, 2026-11-25, after the owner found the earlier pictures too busy; Mobbin
 * references: Browserbase, Notion and Granola «How it works»): head, then the three story steps side by side, each a
 * plain diagram above its title and text (content.ts → story.steps).
 */
export function Features() {
  return (
    <section className="section surface-graphit fx" id="mit-sponsuno" aria-labelledby="fx-title" data-header-dark="">
      <div className="container">
        <div className="fx-head" data-reveal="" data-scroll="rise">
          <p className="label">{features.label}</p>
          <h2 id="fx-title">{features.title}</h2>
          <p className="section-intro">{features.intro}</p>
        </div>
        <ol className="fx-steps" role="list" data-scroll-stagger="">
          {story.steps.slice(0, 3).map((step, i) => {
            const Diagram = DIAGRAMS[i];
            return (
              <li className="fx-step" key={step.title} data-reveal="" data-scroll="rise">
                <div className="fx-panel" aria-hidden="true"><Diagram /></div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
