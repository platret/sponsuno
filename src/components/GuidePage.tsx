import { guidePage, guides, legal, type GuideBlock, type GuideId } from '../content';
import { pageMeta } from '../pages';
import { pageHref, siteHref, waitlistHref } from '../lib/links';
import { DOCX_TYPE, templateFile } from '../lib/templates';
import { Footer } from './Footer';
import { PageHeader } from './PageHeader';
import { rich } from './rich';
import '../styles/sections/legal.css';
import '../styles/sections/guide.css';

/**
 * Guide pages (Ratgeber: /sponsoren-finden/ …). Same layout as the legal pages (legal.css: slim header,
 * one 42rem column, table of contents, standalone footer) plus a few guide blocks (guide.css, prefix gd-).
 * Static: prerendered at build time, shipped without JavaScript. Copy in content.ts → guides,
 * title and description in src/pages.ts.
 */
export function GuidePage({ id }: { id: GuideId }) {
  const guide = guides[id];
  const { path } = pageMeta(id);

  return (
    <>
      <PageHeader />

      <main id="inhalt" className="lg">
        <div className="container">
          <article className="lg-col" aria-labelledby="lg-title">
            <h1 id="lg-title">{guide.title}</h1>
            <p className="lg-intro">{rich(guide.intro)}</p>
            <p className="lg-updated">{guidePage.byline} · {guidePage.updated}</p>
            <p className="gd-note">{guidePage.plannedNote}</p>

            <nav className="lg-toc" aria-labelledby="lg-toc-title">
              <p className="lg-toc-title" id="lg-toc-title">{legal.tocLabel}</p>
              <ol>
                {guide.sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}
              </ol>
            </nav>

            {guide.sections.map((section) => (
              <section className="lg-section" key={section.id} aria-labelledby={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                {section.blocks.map((block, i) => <Block block={block} key={i} id={id} />)}
              </section>
            ))}

            <nav className="gd-related" aria-labelledby="gd-related-title">
              <p className="gd-related-title" id="gd-related-title">{guidePage.relatedTitle}</p>
              <ul>
                {guide.related.map((other) => (
                  <li key={other}>
                    <a href={pageHref(pageMeta(other).path)}>
                      <span className="gd-related-name">{guides[other].title}</span>
                      <span className="gd-related-desc">{pageMeta(other).description}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </article>
        </div>
      </main>

      <Footer onLanding={false} current={path} />
    </>
  );
}

function Block({ block, id }: { block: GuideBlock; id: GuideId }) {
  switch (block.type) {
    case 'p':
      return <p>{rich(block.text)}</p>;
    case 'h3':
      return <h3>{block.text}</h3>;
    case 'list':
      return <ul className="lg-list">{block.items.map((item, i) => <li key={i}>{rich(item)}</li>)}</ul>;
    case 'steps':
      return <ol className="gd-steps">{block.items.map((item, i) => <li key={i}>{rich(item)}</li>)}</ol>;
    case 'template': {
      // The same text as a Word file, written to dist/ by scripts/prerender.mjs; size in whole KB, rounded up
      const file = templateFile(id, block);
      return (
        <figure className="gd-template">
          <figcaption>{block.label}</figcaption>
          <pre>{block.text}</pre>
          <p className="gd-template-download">
            <a href={pageHref(file.path)} download type={DOCX_TYPE}>
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M3 13h10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="gd-template-download-label">{guidePage.templateDownload}</span>
              <span className="gd-template-download-info">{guidePage.templateFileInfo(Math.ceil(file.bytes.length / 1024))}</span>
            </a>
          </p>
        </figure>
      );
    }
    case 'cta':
      return (
        <div className="gd-cta">
          <a className="btn btn-navy" href={waitlistHref(guides[id].waitlistRole)}>{guidePage.ctaWaitlist}</a>
          <a className="gd-cta-demo" href={siteHref(guidePage.ctaDemoHref, false)}>
            <span className="gd-cta-demo-label">{guidePage.ctaDemo}</span>
            <span className="gd-cta-demo-note">{guidePage.ctaDemoNote}</span>
          </a>
        </div>
      );
  }
}
