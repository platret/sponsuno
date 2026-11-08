// Entry of the static pages: the legal pages (impressum/, datenschutz/), the guides (sponsoren-finden/ …) and the
// topic pages (ki-manager/ …, which also load sections.ts for their section styles).
// In production the pages are fully prerendered (scripts/prerender.mjs) and need no JavaScript:
// this module only pulls in the styles, so the browser gets CSS and no React.
// In dev nothing is prerendered, so the page is rendered in the browser instead (data-page on #root).
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-600.css';
import '../styles/site.css';
import '../styles/sections/footer.css';
import '../styles/sections/legal.css';
import '../styles/sections/guide.css';

if (import.meta.env.DEV) {
  const root = document.getElementById('root');
  const page = root?.dataset.page;
  if (root && page && !root.hasChildNodes()) {
    void import('./dev-render').then(({ renderStaticPage }) => renderStaticPage(root, page));
  }
}
