import { Fragment } from 'react';
import { legal, newTabHint, photoCredits, type LegalBlock, type LegalPageId } from '../content';
import { NEW_TAB } from '../lib/links';
import { Footer } from './Footer';
import { PageBand, PageHeader } from './PageHeader';
import { rich } from './rich';
import '../styles/sections/legal.css';

/**
 * Impressum and Datenschutzerklärung (/impressum/, /datenschutz/). Static: prerendered at build time
 * and shipped without JavaScript (src/static/main.ts only loads the styles). All text is in content.ts → legal.
 */
export function LegalPage({ page }: { page: LegalPageId }) {
  const content = legal[page];
  const path = `${page}/`;

  return (
    <>
      <PageHeader current={{ path, kind: 'legal' }} />

      <main id="inhalt" className="lg">
        <PageBand titleId="lg-title" title={content.title} narrow eyebrow={legal.updated}>
          <p className="lg-intro">{rich(content.intro)}</p>
        </PageBand>
        <div className="container">
          <article className="lg-col lg-doc" aria-labelledby="lg-title">
            <nav className="lg-toc" aria-labelledby="lg-toc-title">
              <p className="label lg-toc-title" id="lg-toc-title">{legal.tocLabel}</p>
              <ol>
                {content.sections.map((s) => <li key={s.id}><a href={`#${s.id}`}><span>{s.title}</span></a></li>)}
              </ol>
            </nav>

            {content.sections.map((section) => (
              <section className="lg-section" key={section.id} aria-labelledby={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                {section.blocks.map((block, i) => <Block block={block} key={i} />)}
              </section>
            ))}
          </article>
        </div>
      </main>

      <Footer onLanding={false} current={path} />
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'p':
      return <p>{rich(block.text)}</p>;
    case 'h3':
      return <h3>{block.text}</h3>;
    case 'list':
      return <ul className="lg-list">{block.items.map((item, i) => <li key={i}>{rich(item)}</li>)}</ul>;
    case 'persons':
      return <ul className="lg-persons">{legal.persons.map((name) => <li key={name}>{name}</li>)}</ul>;
    case 'contact':
      return <Contact />;
    case 'credits':
      return <Credits />;
  }
}

function Pending() {
  return <span className="lg-pending">{legal.pending}</span>;
}

function Contact() {
  const { postalAddress, email } = legal.contact;
  return (
    <dl className="lg-contact">
      <div>
        <dt>{legal.project}</dt>
        <dd>{legal.projectNote}</dd>
      </div>
      <div>
        <dt>{legal.contactLabels.postalAddress}</dt>
        <dd>{postalAddress ? postalAddress.map((line) => <Fragment key={line}>{line}<br /></Fragment>) : <Pending />}</dd>
      </div>
      <div>
        <dt>{legal.contactLabels.email}</dt>
        <dd>{email ? <a href={`mailto:${email}`}>{email}</a> : <Pending />}</dd>
      </div>
    </dl>
  );
}

function Credits() {
  const c = legal.credits;
  return (
    <>
      <p>{c.teamWork}</p>
      <h3>{c.photosLabel}</h3>
      {photoCredits.length === 0 ? (
        <p>{c.photosNone}</p>
      ) : (
        <ul className="lg-list">
          {photoCredits.map((photo) => (
            <li key={photo.sourceUrl}>
              {photo.subject}: {c.photoBy} {photo.photographer}, <a href={photo.sourceUrl} {...NEW_TAB}>{photo.source}<span className="visually-hidden">{newTabHint}</span></a>,{' '}
              {photo.licenceUrl ? <a href={photo.licenceUrl} {...NEW_TAB}>{photo.licence}<span className="visually-hidden">{newTabHint}</span></a> : photo.licence}
            </li>
          ))}
        </ul>
      )}
      {c.aiImages.length > 0 && (
        <>
          <h3>{c.aiLabel}</h3>
          <ul className="lg-list">{c.aiImages.map((text) => <li key={text}>{text}</li>)}</ul>
        </>
      )}
      <p>{c.fonts}</p>
    </>
  );
}
