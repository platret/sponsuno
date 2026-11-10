import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { htmlFile, pages } from './src/pages.ts';
import { THEME_MARKER, THEME_SCRIPT } from './src/lib/theme.ts';

// One HTML entry per page in src/pages.ts (`${path}index.html`, or 404.html for the not-found page; prerendered by
// scripts/prerender.mjs),
// plus the clickable demo (/demo/, client-only, noindex, not in pages.ts).
const input: Record<string, string> = Object.fromEntries(
  pages.map((page) => [page.id === 'home' ? 'main' : page.id, resolve(import.meta.dirname, htmlFile(page))]),
);
input.demo = resolve(import.meta.dirname, 'demo/index.html');

// The theme script (src/lib/theme.ts) goes in place of the <!--theme--> marker at the top of the <head> of every page
// entry, in dev and in the build, so it runs before the stylesheets and the first paint. The demo has no marker: it
// stays light (data-theme="light" on its <html>, DESIGN.md -> Theme). A page entry without the marker fails the build.
const themeScript: Plugin = {
  name: 'sponsuno-theme-script',
  transformIndexHtml(html, ctx) {
    if (html.includes(THEME_MARKER)) return html.replace(THEME_MARKER, () => THEME_SCRIPT);
    if (!ctx.filename.replace(/\\/g, '/').endsWith('/demo/index.html')) {
      throw new Error(`${THEME_MARKER} marker not found in the <head> of ${ctx.filename}`);
    }
    return html;
  },
};

export default defineConfig({
  plugins: [react(), themeScript],
  build: {
    target: 'es2022',
    // No modulepreload polyfill (browsers without modulepreload simply load modules without the hint). Without it the
    // CSS-only entry of the static pages (src/static/main.ts) compiles to an empty module, whose <script> tag
    // scripts/prerender.mjs then drops, so legal pages and guides ship no JavaScript.
    modulePreload: { polyfill: false },
    rolldownOptions: {
      input,
      output: {
        // React is shared by the landing page and the demo (the static pages ship none): one chunk with a clear name
        // instead of one borrowed from an asset (Rolldown's codeSplitting groups replace Rollup's manualChunks).
        codeSplitting: {
          groups: [{ name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ }],
        },
      },
    },
  },
});
