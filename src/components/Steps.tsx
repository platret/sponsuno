import { steps } from '../content';
import { MatchCard } from './MatchCard';
import '../styles/sections/steps.css';

/** Ground colour of each step's illustration slot (line colours; white numeral on blue, red and green) */
const TONES = ['blau', 'rot', 'gruen'] as const;

/**
 * "So funktioniert es" (#ablauf, parkett-2): the H2, three steps (illustration slot, title, one sentence) as an
 * ordered list, and under them the match card with its "Beispieldaten" label (on desktop one wide card on the steps'
 * three columns). Static skeleton: the illustration slot shows the step's number on a colour disc until the kit's
 * sticker-style illustration replaces it. Classes prefixed steps-.
 */
export function Steps() {
  return (
    <section className="steps section surface-parkett-2" id="ablauf" aria-labelledby="ablauf-title">
      <div className="container">
        <h2 className="steps-title" id="ablauf-title">{steps.title}</h2>
        <ol className="steps-list">
          {steps.items.map((step, i) => (
            <li className="steps-item" key={step.title}>
              {/* TODO(kit): a sticker-style illustration per step (data-art: profil, liste, handschlag) replaces the
                  number disc; keep .steps-art as the aria-hidden slot */}
              <div className={`steps-art steps-art-${TONES[i]}`} data-art={step.art} aria-hidden="true">
                <span className="steps-num display">{i + 1}</span>
              </div>
              <h3 className="steps-item-title">{step.title}</h3>
              <p className="steps-item-text">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="steps-match">
          <MatchCard />
        </div>
      </div>
    </section>
  );
}
