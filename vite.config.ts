import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /sponsuno/. Override with BASE_PATH for other hosts (e.g. BASE_PATH=/ on Vercel).
export default defineConfig({
  base: process.env.BASE_PATH ?? '/sponsuno/',
  plugins: [react()],
  build: {
    target: 'es2022',
    // The largest chunk is Three.js for the 3D emblem, which only loads when the visitor scrolls near it.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      // Two pages: the landing page and the clickable demo (/demo/)
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        demo: resolve(import.meta.dirname, 'demo/index.html'),
      },
    },
  },
});
