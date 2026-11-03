// Build-time prerender: renders each page to static HTML so content is visible before JS runs
// and crawlers see real text. Used by scripts/prerender.mjs; never shipped to the browser.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { LegalPage } from './components/LegalPage';
import { legal, type LegalPageId } from './content';

export type PageId = 'home' | LegalPageId;

export function render(page: PageId = 'home'): string {
  return renderToString(
    <StrictMode>
      {page === 'home' ? <App /> : <LegalPage page={page} />}
    </StrictMode>,
  );
}

/** Names of the legal.contact fields that are still null (shown as pending on the legal pages). */
export function missingLegalContact(): string[] {
  return Object.entries(legal.contact).filter(([, value]) => value === null).map(([key]) => `legal.contact.${key}`);
}
