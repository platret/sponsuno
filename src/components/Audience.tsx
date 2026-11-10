import { audience, type AudienceImage } from '../content';
import { pageHref } from '../lib/links';
import athlete from '../assets/photos/audience-athlete.jpg';
import athlete480 from '../assets/photos/audience-athlete-480w.avif';
import athlete640 from '../assets/photos/audience-athlete-640w.avif';
import sportverein from '../assets/photos/audience-sportverein.jpg';
import sportverein480 from '../assets/photos/audience-sportverein-480w.avif';
import sportverein640 from '../assets/photos/audience-sportverein-640w.avif';
import kulturverein from '../assets/photos/audience-kulturverein.jpg';
import kulturverein480 from '../assets/photos/audience-kulturverein-480w.avif';
import kulturverein640 from '../assets/photos/audience-kulturverein-640w.avif';
import firma from '../assets/photos/audience-firma.jpg';
import firma480 from '../assets/photos/audience-firma-480w.avif';
import firma640 from '../assets/photos/audience-firma-640w.avif';
import '../styles/sections/audience.css';

/**
 * Per tile: the JPEG (640 x 480, 4:3; the master and the fallback, see src/assets/photos/ and photoCredits in
 * content.ts) and its AVIF versions at 480 and 640 px wide (written by `npm run photos`, scripts/photos.mjs).
 */
const images: Record<AudienceImage, { jpg: string; avif: string }> = {
  athlete: { jpg: athlete, avif: `${athlete480} 480w, ${athlete640} 640w` },
  sportverein: { jpg: sportverein, avif: `${sportverein480} 480w, ${sportverein640} 640w` },
  kulturverein: { jpg: kulturverein, avif: `${kulturverein480} 480w, ${kulturverein640} 640w` },
  firma: { jpg: firma, avif: `${firma480} 480w, ${firma640} 640w` },
};

/** Rendered tile width (audience.css): four columns of at most 253 px from 1024 px, two below, one below 601 px. */
const SIZES = '(min-width: 1024px) 253px, (min-width: 601px) 46vw, 92vw';

/**
 * Paper section under the proof line: who Sponsuno is meant for. Four stock photos (Symbolbilder, named as such in
 * the landing page footer and the Impressum, credited there), each with a short label, one sentence and a link to where that
 * side goes next ("two doors": seekers to a guide, companies to /fuer-firmen/). No cards.
 * Scroll motion (DESIGN.md -> Motion): head and tiles rise with stagger, each photo opens inside its frame (the frame
 * clips, the <picture> scales).
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
                <picture className="aud-picture">
                  <source type="image/avif" srcSet={images[item.image].avif} sizes={SIZES} />
                  <img
                    className="aud-photo"
                    src={images[item.image].jpg}
                    alt={item.alt}
                    width={640}
                    height={480}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
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
      </div>
    </section>
  );
}
