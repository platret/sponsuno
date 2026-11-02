import { support } from '../content';
import { SilkCanvas } from './SilkCanvas';
import { SplitHeading } from './SplitHeading';

const icons = {
  money: (
    <>
      <circle cx="24" cy="24" r="17" />
      <circle cx="24" cy="24" r="11" />
      <path d="M24 17v14M20.5 20.5h5.2a2.6 2.6 0 0 1 0 5.2h-3.4a2.6 2.6 0 0 0 0 5.2h5.2" />
    </>
  ),
  gear: (
    <>
      <circle cx="13" cy="31" r="8" />
      <circle cx="35" cy="31" r="8" />
      <path d="M13 31l7-12h11l4 12M20 19l5 12h-12M18 15h5M28 15h4l-1 4" />
    </>
  ),
  shared: (
    <>
      <path d="M8 36h32M12 36V22l12-8 12 8v14" />
      <path d="M20 36v-8h8v8" />
      <circle cx="24" cy="21" r="2.5" />
    </>
  ),
};

/** The one gold accent section (per CD): liquid-gold shader with ivory cards, no borders. */
export function Support() {
  return (
    <section className="section section-gold" id="sachleistungen" aria-labelledby="sach-title">
      <SilkCanvas palette="gold" />
      <div className="container">
        <div className="section-head section-head-wide">
          <SplitHeading id="sach-title" text={support.title} />
          <p className="section-intro" data-reveal="">{support.intro}</p>
        </div>
        <div className="support-kinds">
          {support.kinds.map((kind) => (
            <div className="kind" data-reveal="" key={kind.title}>
              <svg className="kind-icon" viewBox="0 0 48 48" aria-hidden="true">{icons[kind.icon]}</svg>
              <h3>{kind.title}</h3>
              <p>{kind.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
