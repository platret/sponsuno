import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
// Self-hosted fonts (no request to Google): Archivo Wide 800 and Schibsted Grotesk 400/600, subset by
// scripts/subset-fonts.mjs. Order: fonts, the base layer, the kit, then the app, whose components import their section
// stylesheets. (The base rules sit in the cascade layer `base`, so section and kit rules beat them in any order.)
import './styles/fonts.css';
import './styles/site.css';
// The kit (stickers, icons, court lines, its scroll primitives): once here, after the base layer and before the
// sections, so a section rule also wins a tie against the kit. The kit components import it too (same file, no copy).
import './styles/kit.css';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('#root missing in index.html');

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production builds ship prerendered HTML (scripts/prerender.mjs), which React hydrates.
// In dev the root is empty, so it renders from scratch.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
