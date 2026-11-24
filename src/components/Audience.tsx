import { audience, hero, type AudienceImage, type Role } from '../content';
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

/** Rendered photo width (audience.css): two cards of at most 584 px from 961 px, one card below. */
const SIZES = '(min-width: 961px) 584px, 92vw';

/**
 * «Für wen» on Hafer 2 (D1 redesign): two cards (Mobbin reference: Supabase), the people who look for support and the
 * companies. Each card has one photo on top (stock photos, Symbolbilder, named as such in the landing page footer and the
 * Impressum, credited there), the groups in words and one call to action that preselects the waitlist role.
 */
export function Audience({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  return (
    <section className="section surface-kalk aud" id="fuer-wen" aria-labelledby="aud-title">
      <div className="container">
        <div className="section-head aud-head" data-reveal="" data-scroll="rise">
          <h2 id="aud-title">{audience.title}</h2>
          <p className="section-intro">{audience.intro}</p>
        </div>
        <ul className="aud-grid" role="list" data-scroll-stagger="">
          {audience.cards.map((card, c) => {
            const first = audience.items[card.items[0]];
            const cta = card.role === 'sponsor' ? hero.ctaSponsor.label : hero.ctaSeeker.label;
            return (
              <li className={`aud-card aud-card-${c}`} data-reveal="" data-scroll="rise" key={card.title}>
                <div className="aud-frame" data-scroll="photo">
                  <picture className="aud-picture">
                    <source type="image/avif" srcSet={images[first.image].avif} sizes={SIZES} />
                    <img className="aud-photo" src={images[first.image].jpg} alt={first.alt} width={640} height={480} loading="lazy" decoding="async" />
                  </picture>
                </div>
                <div className="aud-body">
                  <h3>{card.title}</h3>
                  {card.items.length === 1 && <p className="aud-text">{first.text}</p>}
                  <ul className="aud-groups" role="list">
                    {(card.items.length > 1 ? card.items.map((i) => audience.items[i]) : audience.firmGroups).map((g) => (
                      <li key={g.label}><b>{g.label}</b><span>{g.text}</span></li>
                    ))}
                  </ul>
                  <a className={`btn ${c === 0 ? 'btn-graphit' : 'btn-outline'} aud-cta`} href="#warteliste" onClick={() => onChooseRole(card.role)}>{cta}</a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
