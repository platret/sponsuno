import { notFound, waitlistConfirmed } from '../content';
import { pageMeta } from '../pages';
import { pageHref, siteHref } from '../lib/links';
import { Footer } from './Footer';
import { PageBand, PageHeader } from './PageHeader';
import { rich } from './rich';
import '../styles/sections/legal.css';
import '../styles/sections/guide.css';
import '../styles/sections/notfound.css';

/** Short static pages with a title, one sentence, a list of links and a contact line (kind 'notfound' or 'notice'). */
export type NoticePageId = 'notfound' | 'warteliste-bestaetigt';


/**
 * - The 404 page (dist/404.html), served by Cloudflare with status 404 for every unknown URL
 *   (wrangler.jsonc → assets.not_found_handling).
 * - /warteliste/bestaetigt/, where Brevo sends people after they confirm their waitlist sign-up (worker/waitlist.ts).
 * Layout of the legal pages, links as in the guides' "Weiterlesen". Static and without JavaScript, noindex; every link
 * is absolute, because the 404 page is shown under any address.
 */
export function NoticePage({ id }: { id: NoticePageId }) {
  const { path, kind } = pageMeta(id);
  if (id === 'notfound') return <NotFound current={{ path, kind }} />;
  const content = waitlistConfirmed;

  return (
    <>
      <PageHeader current={{ path, kind }} />

      <main id="inhalt" className="lg">
        <PageBand titleId="lg-title" title={content.title} narrow>
          <p className="lg-intro">{content.intro}</p>
        </PageBand>
        <div className="container">
          <article className="lg-col" aria-labelledby="lg-title">
            <nav className="gd-related" aria-labelledby="nf-links-title">
              <p className="label gd-related-title" id="nf-links-title">{content.linksTitle}</p>
              <ul>
                {content.links.map((link) => (
                  <li key={link.label}>
                    <a href={siteHref(link.href, false)}>
                      <span className="gd-related-name">{link.label}</span>
                      <span className="gd-related-desc">{link.text}</span>
                      <Arrow />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {content.contact && <p className="nf-contact">{rich(content.contact)}</p>}
          </article>
        </div>
      </main>

      <Footer onLanding={false} />
    </>
  );
}

/** Arrow at the end of a "Weiterlesen" link (here and in GuidePage.tsx); decorative, the link text names the page. */
export function Arrow() {
  return (
    <svg className="gd-related-arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ARROW = <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>;

/**
 * The 404 page (redesigned 2026-11-25): one Tintenblau screen under the static header. A large «4 ◯ 4» where the 0 is
 * the pitch's centre circle on the halfway line; the ball has rolled out past the second 4 and the linesman's flag is
 * up, so the H1 reads «Abseits.». Then one plain sentence, the way home, the waitlist and three anchors. Pure CSS: on
 * load (motion allowed) the ball rolls out from the centre spot once and the flag goes up; otherwise the end state.
 * Every link is absolute (pageHref/siteHref), because the page is served under any URL.
 */
function NotFound({ current }: { current: { path: string; kind: ReturnType<typeof pageMeta>['kind'] } }) {
  return (
    <>
      <PageHeader current={current} />
      <main id="inhalt" className="nf">
        <section className="nf-screen" aria-labelledby="nf-title">
          <div className="container nf-inner">
            <p className="label nf-label">{notFound.label}</p>
            <div className="nf-art" aria-hidden="true">
              <span className="nf-four">4</span>
              <svg className="nf-zero" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" /><circle className="nf-spot" cx="50" cy="50" r="3" /></svg>
              <span className="nf-four">4</span>
              <span className="nf-ball">
                <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" /><path d="M20 9l7 5-3 8h-8l-3-8z" /><path d="M20 9V2M27 14l7-3M24 22l5 7M16 22l-5 7M13 14l-7-3" /></svg>
              </span>
              <span className="nf-flag">
                <svg viewBox="0 0 40 80"><path className="nf-pole" d="M6 78V6" /><path className="nf-cloth-a" d="M7 6h28v22H7z" /><path className="nf-cloth-b" d="M7 28L35 6v22z" /></svg>
              </span>
            </div>
            <h1 id="nf-title">{notFound.title}</h1>
            <p className="nf-intro">{notFound.intro}</p>
            <div className="nf-actions">
              <a className="btn btn-brass" href={pageHref('')}>{notFound.home}</a>
              <a className="link-arrow nf-wait" href={siteHref('#warteliste', false)}>{notFound.waitlist}{ARROW}</a>
            </div>
            <nav className="nf-links" aria-labelledby="nf-links-title">
              <p className="label" id="nf-links-title">{notFound.linksTitle}</p>
              <ul>
                {notFound.links.map((link) => (
                  <li key={link.label}><a href={siteHref(link.href, false)}>{link.label}</a></li>
                ))}
              </ul>
            </nav>
            {notFound.contact && <p className="nf-contact">{rich(notFound.contact)}</p>}
          </div>
        </section>
      </main>
      <Footer onLanding={false} />
    </>
  );
}
