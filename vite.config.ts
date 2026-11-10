import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { htmlFile, pages } from './src/pages.ts';
import { THEME_MARKER, THEME_SCRIPT } from './src/lib/theme.ts';
import { VIEW_FILES } from './src/demo/viewFiles.ts';

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

const DEMO_VIEW_MARKER = '<!--view-preload-->';

// The demo loads each view as its own chunk (src/demo/DemoApp.tsx), which the app only requests once it runs: one more
// round trip before the first view can paint. In the build, a small inline script (in place of the <!--view-preload-->
// marker near the top of demo/index.html: before the stylesheet, which would hold it back) reads the hash
// (#/sponsor …; empty or unknown: the overview, as in src/demo/router.ts) and preloads that view's JS and CSS (and the
// chunks only it needs) while the app itself loads. Vite's own loader still adds the stylesheet when the view loads.
const demoViewPreload: Plugin = {
  name: 'sponsuno-demo-view-preload',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      const entry = ctx.chunk;
      if (!ctx.bundle || !entry || !ctx.filename.replace(/\\/g, '/').endsWith('/demo/index.html')) return html;
      const chunks = Object.values(ctx.bundle).filter((c) => c.type === 'chunk');
      const loaded = new Set([entry.fileName, ...entry.imports]);
      const files: Record<string, string[]> = {};
      for (const [route, view] of Object.entries(VIEW_FILES)) {
        const chunk = chunks.find((c) => c.facadeModuleId?.replace(/\\/g, '/').endsWith(`/src/demo/views/${view}.tsx`));
        if (!chunk) throw new Error(`No chunk for src/demo/views/${view}.tsx (route ${route})`);
        files[route] = [chunk.fileName, ...chunk.imports.filter((f) => !loaded.has(f)), ...(chunk.viteMetadata?.importedCss ?? [])]
          .map((f) => `/${f}`);
      }
      const script = `(function(){var v=${JSON.stringify(files)},m=/^#\\/?([^/]*)/.exec(location.hash);`
        + `(v[m&&m[1]]||v.uebersicht).forEach(function(f){var l=document.createElement('link'),c=/\\.css$/.test(f);`
        + `l.rel=c?'preload':'modulepreload';if(c)l.as='style';l.crossOrigin='';l.href=f;document.head.appendChild(l)})})()`;
      if (!html.includes(DEMO_VIEW_MARKER)) throw new Error(`${DEMO_VIEW_MARKER} marker not found in demo/index.html`);
      return html.replace(DEMO_VIEW_MARKER, () => `<script>${script}</script>`);
    },
  },
};

export default defineConfig({
  plugins: [react(), themeScript, demoViewPreload],
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
