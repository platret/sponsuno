// Dev only (see main.ts): renders a legal page in the browser because dev serves it without prerendering.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { LegalPageId } from '../content';
import { LegalPage } from '../components/LegalPage';

export function renderLegalPage(root: HTMLElement, page: LegalPageId): void {
  createRoot(root).render(
    <StrictMode>
      <LegalPage page={page} />
    </StrictMode>,
  );
}
