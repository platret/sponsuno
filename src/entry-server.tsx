// Build-time prerender: renders the page to static HTML so content is visible before JS runs
// and crawlers see real text. Used by scripts/prerender.mjs; never shipped to the browser.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
