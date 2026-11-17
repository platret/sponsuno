import { statement } from '../content';
import '../styles/sections/statement.css';

/**
 * Statement (parquet, right under the hero): three short sentences in large type, then one row of three points
 * (proof.items, word for word). Static skeleton: each sentence is its own span, so the kit can fill the words from
 * grey to ink along the scroll and set an inline icon badge in front of a sentence. No heading of its own (the text is
 * the content); the points are a list. Classes prefixed st- (the parked scroll story used the same prefix; the two are
 * never built together).
 */
export function Statement() {
  return (
    <section className="st section surface-parkett">
      <div className="container">
        {/* TODO(kit): data-scroll="fill-words" on .st-text (words fill grey -> ink), and two small inline icon badges
            (<Icon> in a round sign) in front of the first words of sentences one and two */}
        <p className="st-text">
          {statement.sentences.map((sentence, i) => (
            <span className="st-sentence" key={sentence}>{i > 0 && ' '}{sentence}</span>
          ))}
        </p>
        <ul className="st-points">
          {statement.points.map((point) => (
            <li className="st-point" key={point.text}>
              {/* TODO(kit): <Icon name={point.icon} size={24} /> replaces the dot */}
              <span className="st-icon" data-icon={point.icon} aria-hidden="true" />
              <span className="st-point-text">{point.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
