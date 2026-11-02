import { problem } from '../content';
import { SplitHeading } from './SplitHeading';

export function Problems() {
  return (
    <section className="section section-ivory section-problem" id="problem" aria-labelledby="problem-title">
      <div className="container">
        <div className="section-head">
          <SplitHeading id="problem-title" text={problem.title} />
          <p className="section-intro" data-reveal="">{problem.intro}</p>
        </div>
        <div className="problems">
          {problem.items.map((item) => (
            <div className="problem" data-reveal="" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
