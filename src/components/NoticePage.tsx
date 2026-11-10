import { notFound, waitlistConfirmed } from '../content';
import { pageMeta } from '../pages';
import { siteHref } from '../lib/links';
import { Footer } from './Footer';
import { PageBand, PageHeader } from './PageHeader';
import { rich } from './rich';
import '../styles/sections/legal.css';
import '../styles/sections/guide.css';

/** Short static pages with a title, one sentence, a list of links and a contact line (kind 'notfound' or 'notice'). */
export type NoticePageId = 'notfound' | 'warteliste-bestaetigt';

const CONTENT = { notfound: notFound, 'warteliste-bestaetigt': waitlistConfirmed } satisfies Record<NoticePageId, unknown>;

/**
 * - The 404 page (dist/404.html), served by Cloudflare with status 404 for every unknown URL
 *   (wrangler.jsonc → assets.not_found_handling).
 * - /warteliste/bestaetigt/, where Brevo sends people after they confirm their waitlist sign-up (worker/waitlist.ts).
 * Layout of the legal pages, links as in the guides' "Weiterlesen". Static and without JavaScript, noindex; every link
 * is absolute, because the 404 page is shown under any address.
 */
export function NoticePage({ id }: { id: NoticePageId }) {
  const { path, kind } = pageMeta(id);
  const content = CONTENT[id];

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
              <p className="gd-related-title" id="nf-links-title">{content.linksTitle}</p>
              <ul>
                {content.links.map((link) => (
                  <li key={link.label}>
                    <a href={siteHref(link.href, false)}>
                      <span className="gd-related-name">{link.label}</span>
                      <span className="gd-related-desc">{link.text}</span>
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
