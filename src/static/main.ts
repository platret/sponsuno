// Entry of the static pages: the legal pages (impressum/, datenschutz/), the topic pages (kosten/ …, which also load
// sections.ts for their section styles), the 404 page and the notices; the parked guides would use it too. guide.css
// also styles the link box of the 404 page and /warteliste/bestaetigt/.
// In production the pages are fully prerendered (scripts/prerender.mjs) and need no JavaScript:
// this module only pulls in the styles, so the browser gets CSS and no React.
// In dev nothing is prerendered, so the page is rendered in the browser instead (data-page on #root).
import '../styles/fonts.css';
import '../styles/site.css';
import '../styles/sections/footer.css';
import '../styles/sections/legal.css';
import '../styles/sections/guide.css';
import '../styles/sections/notfound.css'; // the 404 page (NoticePage → NotFound), about 1 KB gzipped

if (import.meta.env.DEV) {
  const root = document.getElementById('root');
  const page = root?.dataset.page;
  if (root && page && !root.hasChildNodes()) {
    void import('./dev-render').then(({ renderStaticPage }) => renderStaticPage(root, page));
  }
}
