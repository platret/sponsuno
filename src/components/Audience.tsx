import { audience, type AudienceImage } from '../content';
import { pageHref } from '../lib/links';
import athlete from '../assets/photos/audience-athlete.jpg';
import sportverein from '../assets/photos/audience-sportverein.jpg';
import kulturverein from '../assets/photos/audience-kulturverein.jpg';
import firma from '../assets/photos/audience-firma.jpg';
import '../styles/sections/audience.css';

/** All four files are 640 x 480 (4:3), see src/assets/photos/ and photoCredits in content.ts. */
const images: Record<AudienceImage, string> = { athlete, sportverein, kulturverein, firma };

/**
 * Paper section under the proof line: who Sponsuno is meant for. Four stock photos (Symbolbilder, labelled
 * below the grid, credited in the Impressum), each with a short label, one sentence and a link to where that
 * side goes next ("two doors": seekers to a guide, companies to /fuer-firmen/). No cards.
 * Scroll motion (DESIGN.md -> Motion): head and tiles rise with stagger, each photo opens inside its frame.
 */
export function Audience() {
  return (
    <section className="section surface-paper aud" id="fuer-wen" aria-labelledby="aud-title">
      <div className="container">
        <div className="section-head aud-head" data-reveal="" data-scroll="rise">
          <h2 id="aud-title">{audience.title}</h2>
          <p className="section-intro">{audience.intro}</p>
        </div>
        <ul className="aud-grid" role="list" data-scroll-stagger="">
          {audience.items.map((item) => (
            <li className="aud-item" data-reveal="" data-scroll="rise" key={item.image}>
              {/* Frame for the scroll motion: it opens from a slight inset while the photo settles inside it */}
              <div className="aud-frame" data-scroll="photo">
                <img
                  className="aud-photo"
                  src={images[item.image]}
                  alt={item.alt}
                  width={640}
                  height={480}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="aud-text">
                <h3 className="aud-label">{item.label}</h3>
                <p className="aud-desc">{item.text}</p>
                <a className="link-arrow aud-link" href={pageHref(item.link.href)}>
                  {item.link.label}
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                </a>
              </div>
            </li>
          ))}
        </ul>
        <p className="aud-note" data-reveal="" data-scroll="fade">
          {audience.noteBefore}<a href={pageHref(audience.noteLinkHref)}>{audience.noteLink}</a>{audience.noteAfter}
        </p>
      </div>
    </section>
  );
}
