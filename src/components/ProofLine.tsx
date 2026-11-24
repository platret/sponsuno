import { proof } from '../content';
import '../styles/sections/proof.css';

/** Under the hero on Hafer (D1 redesign): one large statement (Mobbin/soda.today: a calm sentence instead of a feature
    strip), then the three proof points and the example disciplines as one quiet row. role="list" keeps list
    semantics in Safari/VoiceOver despite list-style: none. */
export function ProofLine() {
  return (
    <div className="proof surface-paper">
      <div className="container">
        <p className="proof-statement" data-reveal="" data-scroll="rise">
          {proof.statementStart}<span className="proof-accent">{proof.statementAccent}</span>{proof.statementEnd}
        </p>
        <ul className="proof-items" role="list">
          {proof.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="proof-disciplines">
          <span className="label proof-label" id="proof-disciplines-label">{proof.disciplinesLabel}</span>
          <ul className="proof-list" role="list" aria-labelledby="proof-disciplines-label">
            {proof.disciplines.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
