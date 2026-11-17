import { support } from '../content';
import { Icon, type IconName } from './kit/Icon';
import '../styles/sections/support.css';

type KindIcon = (typeof support.kinds)[number]['icon'];

/** Badge of each kind: a line icon of the kit on a coloured disc (.lg-badge, legal.css) */
const BADGES: Record<KindIcon, { icon: IconName; tone: string }> = {
  money: { icon: 'budget', tone: '' },
  gear: { icon: 'unterstuetzung', tone: ' lg-badge-rot' },
  shared: { icon: 'handschlag', tone: ' lg-badge-gruen' },
};

/** Parquet section: support is not only money. Title in column 1, the three kinds below as three cards, each with a
    sticker-style badge. No motion. */
export function Support() {
  return (
    <section className="section surface-parkett sup" id="sachleistungen" aria-labelledby="sup-title">
      <div className="container">
        <div className="section-head sup-head">
          <h2 id="sup-title">{support.title}</h2>
          <p className="section-intro">{support.intro}</p>
        </div>
        <ul className="sup-kinds" role="list">
          {support.kinds.map((kind) => (
            <li className="sup-kind" key={kind.icon}>
              <span className={`lg-badge${BADGES[kind.icon].tone}`} aria-hidden="true">
                <Icon name={BADGES[kind.icon].icon} size={28} />
              </span>
              <h3 className="sup-kind-title">{kind.title}</h3>
              <p className="sup-kind-text">{kind.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
