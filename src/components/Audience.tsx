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
 * below the grid, credited in the Impressum), each with a short label and one sentence. No cards.
 */
export function Audience() {
  return (
    <section className="section surface-paper aud" id="fuer-wen" aria-labelledby="aud-title">
      <div className="container">
        <div className="section-head aud-head">
          <h2 id="aud-title">{audience.title}</h2>
          <p className="section-intro">{audience.intro}</p>
        </div>
        <ul className="aud-grid" role="list">
          {audience.items.map((item) => (
            <li className="aud-item" data-reveal="" key={item.image}>
              <img
                className="aud-photo"
                src={images[item.image]}
                alt={item.alt}
                width={640}
                height={480}
                loading="lazy"
                decoding="async"
              />
              <div className="aud-text">
                <h3 className="aud-label">{item.label}</h3>
                <p className="aud-desc">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="aud-note">
          {audience.noteBefore}<a href={pageHref(audience.noteLinkHref)}>{audience.noteLink}</a>{audience.noteAfter}
        </p>
      </div>
    </section>
  );
}
