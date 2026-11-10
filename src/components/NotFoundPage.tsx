import { notFound } from '../content';
import { pageMeta } from '../pages';
import { siteHref } from '../lib/links';
import { Footer } from './Footer';
import { PageBand, PageHeader } from './PageHeader';
import { rich } from './rich';
import '../styles/sections/legal.css';
import '../styles/sections/guide.css';

/**
 * The 404 page (dist/404.html), served by Cloudflare with status 404 for every unknown URL
 * (wrangler.jsonc → assets.not_found_handling). Layout of the legal pages, links as in the guides' "Weiterlesen".
 * Static and without JavaScript; every link is absolute, because the page is shown under any address.
 */
export function NotFoundPage() {
  const { path, kind } = pageMeta('notfound');

  return (
    <>
      <PageHeader current={{ path, kind }} />

      <main id="inhalt" className="lg">
        <PageBand titleId="lg-title" title={notFound.title} narrow>
          <p className="lg-intro">{notFound.intro}</p>
        </PageBand>
        <div className="container">
          <article className="lg-col" aria-labelledby="lg-title">
            <nav className="gd-related" aria-labelledby="nf-links-title">
              <p className="gd-related-title" id="nf-links-title">{notFound.linksTitle}</p>
              <ul>
                {notFound.links.map((link) => (
                  <li key={link.label}>
                    <a href={siteHref(link.href, false)}>
                      <span className="gd-related-name">{link.label}</span>
                      <span className="gd-related-desc">{link.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {notFound.contact && <p className="nf-contact">{rich(notFound.contact)}</p>}
          </article>
        </div>
      </main>

      <Footer onLanding={false} />
    </>
  );
}
