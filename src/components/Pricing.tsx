import { pricing } from '../content';
import '../styles/sections/pricing.css';

/** Ivory section, the first of /kosten/ (its title and intro are the page head band: InfoPage → PageBand): the cost
    model as one overview card. Decided points get a check, open ones a ring (plus pricing.openLabel as a tag when it
    is set). */
export function Pricing() {
  return (
    <section className="section surface-ivory price" id="kosten" aria-labelledby="price-title">
      <div className="container">
        <div className="price-main" data-reveal="" data-scroll="zoom-in">
          <dl className="price-card">
            {pricing.rows.map((row) => (
              <div className={`price-row price-row-${row.state}`} key={row.label}>
                <dt className="price-label">{row.label}</dt>
                <dd className="price-value">
                  {/* The span carries the scroll animation (an SVG with scale/translate is not composited) */}
                  {row.state === 'open' ? (
                    <span className="price-mark price-mark-open" aria-hidden="true">
                      <svg className="price-marker price-marker-open" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                        <circle cx="8" cy="8" r="5" />
                      </svg>
                    </span>
                  ) : (
                    <span className="price-mark price-mark-check" aria-hidden="true">
                      <svg className="price-marker price-check" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                        <path d="M3.5 8.5l3 3 6-7" />
                      </svg>
                    </span>
                  )}
                  <span className="price-value-text">
                    {row.value}
                    {row.state === 'open' && pricing.openLabel && (
                      <>
                        {' '}
                        <span className="price-tag">{pricing.openLabel}</span>
                      </>
                    )}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="price-note" data-scroll="fade">{pricing.note}</p>
        </div>
      </div>
    </section>
  );
}
