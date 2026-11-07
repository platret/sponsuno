import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { pages } from './src/pages.ts';

// One HTML entry per page in src/pages.ts (`${path}index.html`, prerendered by scripts/prerender.mjs),
// plus the clickable demo (/demo/, client-only, noindex, not in pages.ts).
const input: Record<string, string> = Object.fromEntries(
  pages.map((page) => [page.id === 'home' ? 'main' : page.id, resolve(import.meta.dirname, `${page.path}index.html`)]),
);
input.demo = resolve(import.meta.dirname, 'demo/index.html');

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    // No modulepreload polyfill (browsers without modulepreload simply load modules without the hint). Without it the
    // CSS-only entry of the static pages (src/static/main.ts) compiles to an empty module, whose <script> tag
    // scripts/prerender.mjs then drops, so legal pages and guides ship no JavaScript.
    modulePreload: { polyfill: false },
    rollupOptions: {
      input,
      output: {
        // React is shared by the landing page and the demo (the static pages ship none): give its chunk a clear name instead of one borrowed from an asset
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
        },
      },
    },
  },
});
