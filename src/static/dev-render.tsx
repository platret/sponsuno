// Dev only (see main.ts): renders a static page in the browser because dev serves it without prerendering.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StaticPage, type StaticPageId } from '../components/StaticPage';
import { pages } from '../pages';

export function renderStaticPage(root: HTMLElement, id: string): void {
  const page = pages.find((p) => p.id === id && p.kind !== 'home');
  if (!page) throw new Error(`data-page="${id}" is not a static page in src/pages.ts`);
  createRoot(root).render(
    <StrictMode>
      <StaticPage id={page.id as StaticPageId} />
    </StrictMode>,
  );
}
