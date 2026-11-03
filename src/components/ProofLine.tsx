import { proof } from '../content';
import '../styles/sections/proof.css';

/** Quiet band under the hero: three proof points, then example disciplines. Static; later a logo row.
    role="list" keeps list semantics in Safari/VoiceOver despite list-style: none. */
export function ProofLine() {
  return (
    <div className="proof surface-paper">
      <div className="container">
        <ul className="proof-items" role="list">
          {proof.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="proof-disciplines">
          <span className="proof-label" id="proof-disciplines-label">{proof.disciplinesLabel}</span>
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
