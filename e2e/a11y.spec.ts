import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Accessibility checks with axe-core (WCAG 2.x A/AA plus axe's best practices) on the landing page, the topic pages
// /kosten/ and /fragen/, and a legal page (one light theme, DESIGN.md -> Colour). Fails on serious and critical
// violations only (moderate ones are axe best practices, not WCAG failures).
//
// There is NO exception for any page or element. In particular the landing page's scroll effects must pass in every
// state axe can meet them in: the statement's words before they fill (their grey is 3.4:1 on parquet at 26 px and
// more, i.e. large text), the steps and doors while they draw, the word band while it slides. If an effect fails,
// fix the effect, not this file.
//
// Scanned with reduced motion: every piece is in its final state then (with motion, the reveals below the fold wait
// at opacity 0 for the scroll and axe would skip them). The landing page is scanned again with motion, as most
// visitors see it: at the top right after its load animations (the statement is still unfilled), and once more after
// scrolling through every block, so the reveals are in and the scroll effects are in the state a reader stops at.

const PAGES = ['/', '/kosten/', '/fragen/', '/impressum/'];
/** The blocks of the landing page that are scanned one by one with motion */
const BLOCKS = ['#top', '#idee', '.wb', '#ablauf', '#fuer-wen', '#warteliste', 'footer.ft'];
type Violation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

/** Waits for the time-based animations and transitions to end (the hero load, a reveal in view). Scroll-driven
    animations follow the scroll and are not waited for. */
async function settled(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) =>
      a.timeline !== document.timeline || a.playState !== 'running' || a.effect?.getComputedTiming().endTime === Infinity));
}

async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator('h1')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await settled(page);
}

/** Serious and critical violations as readable lines */
function failures(violations: Violation[]): string[] {
  const lines: string[] = [];
  for (const v of violations) {
    if (v.impact !== 'serious' && v.impact !== 'critical') continue;
    for (const node of v.nodes) {
      const selector = node.target.map(String).join(' ');
      lines.push(`${v.impact} ${v.id}: ${selector}\n    ${(node.failureSummary ?? v.help).replace(/\s*\n\s*/g, ' ')}`);
    }
  }
  return lines;
}

async function scan(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return failures(violations);
}

test.describe('axe, reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await open(page, path);
      expect(await scan(page)).toEqual([]);
    });
  }

  test.describe('phone (390 × 844)', () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    test('/', async ({ page }) => {
      await open(page, '/');
      expect(await scan(page)).toEqual([]);
    });
  });
});

test.describe('axe, with motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('/ at the top, the statement not yet filled', async ({ page }) => {
    await open(page, '/');
    await expect(page.locator('html')).toHaveClass(/(^|\s)motion(\s|$)/);
    expect(await scan(page)).toEqual([]);
    // The unfilled words are really part of that scan: the statement is rendered and its text is checked for contrast
    const { passes, incomplete, violations } = await new AxeBuilder({ page }).include('#idee').withRules(['color-contrast']).analyze();
    expect(failures(violations)).toEqual([]);
    expect(passes.length + incomplete.length).toBeGreaterThan(0);
  });

  test('/ block by block while scrolling, then the whole page', async ({ page }) => {
    await open(page, '/');
    for (const block of BLOCKS) {
      await test.step(block, async () => {
        // Bring the block's upper edge into the upper part of the window, as a reader would, and let its reveals run
        await page.locator(block).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120));
        await settled(page);
        const { violations } = await new AxeBuilder({ page }).include(block).analyze();
        expect(failures(violations)).toEqual([]);
      });
    }
    // Everything has been revealed by now: the whole page once more, from the end of the page
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await settled(page);
    expect(await scan(page)).toEqual([]);
  });

  test('/ with a collected sticker and the counter in the header', async ({ page }) => {
    await open(page, '/');
    await expect(page.locator('[data-wordmark].has-egg')).toHaveCount(1, { timeout: 15_000 });
    await page.locator('#top .stk[data-sticker="ball"][data-collectable]').click();
    await expect(page.locator('.site-header .album-chip')).toBeVisible();
    await settled(page);
    expect(await scan(page)).toEqual([]);
  });
});
