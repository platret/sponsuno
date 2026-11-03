import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    // The largest chunk is Three.js for the 3D emblem, which only loads when the visitor scrolls near it.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      // Pages: the landing page, the clickable demo (/demo/) and the two legal pages (prerendered, no JS)
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        demo: resolve(import.meta.dirname, 'demo/index.html'),
        impressum: resolve(import.meta.dirname, 'impressum/index.html'),
        datenschutz: resolve(import.meta.dirname, 'datenschutz/index.html'),
      },
      output: {
        // React is shared by the landing page and the demo (the legal pages ship none): give its chunk a clear name instead of one borrowed from an asset
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
        },
      },
    },
  },
});
