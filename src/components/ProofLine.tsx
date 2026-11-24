import type { CSSProperties } from 'react';
import { proof } from '../content';
import '../styles/sections/proof.css';

/** Split a phrase into words for the scroll fill; the spaces stay plain text nodes, so lines break as before. */
function words(text: string, from: number) {
  return text.split(/(\s+)/).map((part, i) =>
    /^\s+$/.test(part) || part === ''
      ? part
      : <span className="proof-w" key={`${from}-${i}`} style={{ '--w': from + i / 2 } as CSSProperties}>{part}</span>,
  );
}

/** Under the hero on Hafer (D1 redesign, calmer 2026-11-25): one large statement, then the three proof points as one
    quiet row. Under html.scroll-fx the sheet widens out of the Tintenblau hero (data-scroll="frame" on .proof, the
    wrapper is Tintenblau behind it) and the statement fills in word by word while it scrolls up (proof.css). Words
    start at 60 % so the text keeps 3:1 (large text) at every point of the fill; the Bernstein word stays full. role="list" keeps list semantics in
    Safari/VoiceOver despite list-style: none. */
export function ProofLine() {
  const start = proof.statementStart.trim().split(/\s+/).length;
  return (
    <div className="proof-wrap">
      <div className="proof surface-paper" data-scroll="frame">
        <div className="container">
          <p className="proof-statement">
            {words(proof.statementStart, 0)}
            <span className="proof-w proof-accent" style={{ '--w': start } as CSSProperties}>{proof.statementAccent}</span>
            {words(proof.statementEnd, start + 1)}
          </p>
          <ul className="proof-items" role="list" data-scroll-stagger="">
            {proof.items.map((item) => (
              <li key={item} data-reveal="" data-scroll="fade">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
