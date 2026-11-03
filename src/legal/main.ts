// Entry for the legal pages (impressum/index.html, datenschutz/index.html).
// In production the pages are fully prerendered (scripts/prerender.mjs) and need no JavaScript:
// this module only pulls in the styles, so the browser gets CSS and no React.
// In dev nothing is prerendered, so the page is rendered in the browser instead.
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-600.css';
import '../styles/site.css';
import '../styles/sections/footer.css';
import '../styles/sections/legal.css';

if (import.meta.env.DEV) {
  const root = document.getElementById('root');
  const page = root?.dataset.page;
  if (root && !root.hasChildNodes() && (page === 'impressum' || page === 'datenschutz')) {
    void import('./dev-render').then(({ renderLegalPage }) => renderLegalPage(root, page));
  }
}
