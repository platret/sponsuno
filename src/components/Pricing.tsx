import { pricing } from '../content';
import { SplitHeading } from './SplitHeading';

export function Pricing() {
  return (
    <section className="section section-ivory" id="kosten" aria-labelledby="kosten-title">
      <div className="container pricing">
        <div className="pricing-head">
          <SplitHeading id="kosten-title" text={pricing.title} />
          <p className="section-intro" data-reveal="">{pricing.intro}</p>
        </div>
        <div className="pricing-rows">
          {pricing.rows.map((row) => (
            <div className="price-row" data-reveal="" key={row.title}>
              <h3>{row.title}</h3>
              <p>{row.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
