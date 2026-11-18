import { expect, type Page } from '@playwright/test';

// Shared by site.spec.ts and a11y.spec.ts (not a test file: Playwright only runs *.spec.ts).

/** The blocks of the landing page, in order */
export const BLOCKS = ['#top', '#idee', '.wb', '#ablauf', '#fuer-wen', '#warteliste', 'footer.ft'];

/** The six sticker ids of the album (STICKER_IDS in src/components/kit/Sticker.tsx) */
export const STICKERS = ['ball', 'note', 'brezel', 'startnummer', 'wimpel', 'pfeife'];

/** The Easter-egg chunk loads when the browser is idle; it marks the footer wordmark once it runs. */
export async function eggsReady(page: Page) {
  await expect(page.locator('[data-wordmark].has-egg')).toHaveCount(1, { timeout: 15_000 });
}
