import { expect, type Page } from '@playwright/test';

// Shared by site.spec.ts and a11y.spec.ts (not a test file: Playwright only runs *.spec.ts).

/** The blocks of the landing page, in order */
export const BLOCKS = ['#top', '#idee', '.wb', '#ablauf', '#fuer-wen', '#warteliste', 'footer.ft'];

/** The six sticker ids of the album (STICKER_IDS in src/components/kit/Sticker.tsx) */
export const STICKERS = ['ball', 'note', 'brezel', 'startnummer', 'wimpel', 'pfeife'] as const;
export type StickerName = (typeof STICKERS)[number];

/**
 * The sticker budget of the landing page (DESIGN.md -> Stickers): six picture stickers, every id exactly once, all of
 * them collectable. Where each one lives: five in <main>, the whistle beside the album in the footer.
 */
export const STICKER_HOME: Record<StickerName, string> = {
  ball: '#top',
  note: '.wb',
  wimpel: '#fuer-wen .door-sport',
  brezel: '#fuer-wen .door-firma',
  startnummer: '#warteliste',
  pfeife: 'footer.ft',
};

/** Every sticker of the landing page that counts for the album (the album's own six slots do not) */
export const COLLECTABLE = 'main .stk[data-collectable], footer.ft .stk[data-collectable]';

/** The Easter-egg chunk loads when the browser is idle; it marks the footer wordmark once it runs. */
export async function eggsReady(page: Page) {
  await expect(page.locator('[data-wordmark].has-egg')).toHaveCount(1, { timeout: 15_000 });
}
