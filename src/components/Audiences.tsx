import photo from '../assets/symbolbild-mtb-192.jpg';
import icon from '../assets/Sponsuno_Icon.svg';
import { audiences, type Role } from '../content';
import { usePointerTilt } from '../hooks/usePointerFx';
import { SplitHeading } from './SplitHeading';

export function Audiences({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  const lightRef = usePointerTilt<HTMLElement>();
  const darkRef = usePointerTilt<HTMLElement>();

  return (
    <section className="section section-ivory" id="fuer-wen" aria-labelledby="fuer-wen-title">
      <div className="container">
        <div className="section-head">
          <SplitHeading id="fuer-wen-title" text={audiences.title} />
        </div>
        <div className="audiences">
          <article className="audience audience-light" data-reveal="" ref={lightRef}>
            <div className="audience-top">
              <h3>{audiences.athletes.title}</h3>
              <img className="audience-photo" src={photo} alt="" width={96} height={96} loading="lazy" decoding="async" />
            </div>
            <ul className="checks">
              {audiences.athletes.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <a className="btn btn-navy" href="#warteliste">{audiences.athletes.cta}</a>
          </article>
          <article className="audience audience-dark" data-reveal="" ref={darkRef}>
            <div className="audience-top">
              <h3>{audiences.sponsors.title}</h3>
              <span className="audience-mark" aria-hidden="true">
                <img src={icon} alt="" width={56} height={56} loading="lazy" decoding="async" />
              </span>
            </div>
            <ul className="checks">
              {audiences.sponsors.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <a className="btn btn-gold" href="#warteliste" onClick={() => onChooseRole('sponsor')}>{audiences.sponsors.cta}</a>
          </article>
        </div>
      </div>
    </section>
  );
}
