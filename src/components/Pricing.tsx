import { pricing } from '../content';
import { Icon } from './kit/Icon';
import '../styles/sections/pricing.css';

/** Parkett-2 section, the first of /kosten/ (its title and intro are the page head band: InfoPage → PageBand): the cost
    model as four cards, two by two. Each card: a round badge (decided: green with a check; open: an empty dashed
    slot, plus pricing.openLabel as a tag when it is set), the item as a label and the answer in large type. The first
    card (no subscription, no base fee: the page's promise) is the ink one, its answer set in the display face. */
export function Pricing() {
  return (
    <section className="section surface-parkett-2 price" id="kosten" aria-labelledby="price-title">
      <div className="container">
        <dl className="price-grid">
          {pricing.rows.map((row, i) => (
            <div className={`price-row${i === 0 ? ' surface-tinte' : ''}`} key={row.label}>
              <dt className="price-label">
                <span className={`lg-badge price-mark ${row.state === 'open' ? 'lg-badge-offen' : 'lg-badge-gruen'}`} aria-hidden="true">
                  {row.state !== 'open' && <Icon name="check" />}
                </span>
                {row.label}
              </dt>
              <dd className={i === 0 ? 'price-value display' : 'price-value'}>
                {row.value}
                {row.state === 'open' && pricing.openLabel && (
                  <>
                    {' '}
                    <span className="price-tag">{pricing.openLabel}</span>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className="price-note">{pricing.note}</p>
      </div>
    </section>
  );
}
