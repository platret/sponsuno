import '../styles/sections/page.css';
import { forFirms, infoPage, type InfoPageId, type Role } from '../content';
import { pageMeta } from '../pages';
import { pageHref, waitlistHref } from '../lib/links';
import { AiManager } from './AiManager';
import { Faq } from './Faq';
import { Footer } from './Footer';
import { PageHeader } from './PageHeader';
import { Pricing } from './Pricing';
import { Support } from './Support';
import { Team } from './Team';
import { rich } from './rich';

/** Role preselected by the waitlist links of a topic page (default: the form's default role) */
const ROLES: Partial<Record<InfoPageId, Role>> = { 'fuer-firmen': 'sponsor' };

/**
 * Topic pages reached from the header (/fuer-firmen/, /ki-manager/, /kosten/, /fragen/, /ueber-uns/). Static:
 * prerendered at build time, shipped without JavaScript and without motion (CSS from src/static/sections.ts).
 * KI-Manager, Kosten, Fragen and Über uns show the sections that used to be on the landing page; the first
 * section's title is the page's H1. Für Firmen uses the reading column of the guides. Every page ends with a
 * way back to the waitlist on the landing page.
 */
export function InfoPage({ id }: { id: InfoPageId }) {
  const { path } = pageMeta(id);
  const role = ROLES[id];

  return (
    <>
      <PageHeader current={{ path, kind: 'info' }} role={role} />
      {id === 'fuer-firmen' ? (
        <FirmsPage />
      ) : (
        <main id="inhalt" className="pg">
          {id === 'ki-manager' && <AiManager />}
          {id === 'kosten' && <><Pricing /><Support /></>}
          {id === 'fragen' && <Faq />}
          {id === 'ueber-uns' && <Team />}
          <PageEnd id={id} role={role} />
        </main>
      )}
      <Footer onLanding={false} current={path} />
    </>
  );
}

/** Closing block: the waitlist (on the landing page) as the primary button, the demo as a quiet link. */
function PageEnd({ id, role }: { id: InfoPageId; role?: Role }) {
  const more = infoPage.more[id];
  return (
    <section className="section surface-paper pg-end" aria-labelledby="pg-end-title">
      <div className="container">
        <h2 id="pg-end-title">{infoPage.endTitle}</h2>
        <p className="pg-end-text">{infoPage.endText}</p>
        {more && <p className="pg-end-more">{rich(more)}</p>}
        <div className="pg-end-actions">
          <a className="btn btn-navy" href={waitlistHref(role)}>{infoPage.endButton}</a>
          <a className="pg-end-demo" href={pageHref(infoPage.demoHref)}>
            <span className="pg-end-demo-label">{infoPage.demoLabel}</span>
            <span className="pg-end-demo-note">{infoPage.demoNote}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * /fuer-firmen/: first version in the reading column of the guides (legal.css, guide.css), built from the sponsor
 * copy that already exists (content.ts → forFirms).
 */
function FirmsPage() {
  const { steps, support, costs, end } = forFirms;
  const list = (items: readonly { title: string; text: string }[]) =>
    items.map((item) => <li key={item.title}><strong>{item.title}:</strong> {item.text}</li>);

  return (
    <main id="inhalt" className="lg">
      <div className="container">
        <article className="lg-col" aria-labelledby="lg-title">
          <h1 id="lg-title">{forFirms.title}</h1>
          <p className="lg-intro">{forFirms.intro}</p>
          <p className="gd-note">{forFirms.note}</p>

          <section className="lg-section" aria-labelledby={steps.id}>
            <h2 id={steps.id}>{steps.title}</h2>
            <p>{steps.intro}</p>
            <ol className="gd-steps">{list(steps.items)}</ol>
          </section>

          <section className="lg-section" aria-labelledby={support.id}>
            <h2 id={support.id}>{support.title}</h2>
            <p>{support.intro}</p>
            <ul className="lg-list">{list(support.items)}</ul>
          </section>

          <section className="lg-section" aria-labelledby={costs.id}>
            <h2 id={costs.id}>{costs.title}</h2>
            <p>{costs.intro}</p>
            <ul className="lg-list">{list(costs.items)}</ul>
            <p>{rich(costs.more)}</p>
          </section>

          <section className="lg-section" aria-labelledby={end.id}>
            <h2 id={end.id}>{end.title}</h2>
            <p>{end.text}</p>
            <div className="gd-cta">
              <a className="btn btn-navy" href={waitlistHref('sponsor')}>{end.button}</a>
              <a className="gd-cta-demo" href={pageHref(end.demoHref)}>
                <span className="gd-cta-demo-label">{end.demoLabel}</span>
                <span className="gd-cta-demo-note">{end.demoNote}</span>
              </a>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
