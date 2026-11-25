import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Accessibility checks with axe-core (WCAG 2.x A/AA plus axe's best practices) on the landing page, the 404 page
// and a legal page (one light theme, DESIGN.md -> Theme). Fails on serious and critical violations only (moderate
// ones are axe best practices, not WCAG failures).
//
// Scanned with reduced motion: every piece is in its final state then (with motion, the reveals below the fold wait
// at opacity 0 for the scroll and axe would skip them, and the hero copy fades in for about a second). The landing
// page is scanned once more with motion, as most visitors see it, after its load animations have finished.

const PAGES = ['/', '/404.html', '/impressum/'];
type Violation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator('h1')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  // Wait for the time-based animations and transitions to end (the hero load, a reveal in view). Scroll-driven
  // animations follow the scroll, so they are not waited for; the hero dot field is a canvas (no CSS animation).
  await page.waitForFunction(() =>
    document.getAnimations().every((a) =>
      a.timeline !== document.timeline || a.playState !== 'running' || a.effect?.getComputedTiming().endTime === Infinity));
}

/** Serious and critical violations as readable lines. No exceptions: since the D1 redesign (2026-11-24) the landing page
 *  has no faded pictures; the product pictures of «Mit Sponsuno» are aria-hidden but still checked at full opacity. */
function failures(violations: Violation[]): string[] {
  const lines: string[] = [];
  for (const v of violations) {
    if (v.impact !== 'serious' && v.impact !== 'critical') continue;
    for (const node of v.nodes) {
      lines.push(`${v.impact} ${v.id}: ${node.target.map(String).join(' ')}\n    ${(node.failureSummary ?? v.help).replace(/\s*\n\s*/g, ' ')}`);
    }
  }
  return lines;
}

test.describe('axe, reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await open(page, path);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(failures(violations)).toEqual([]);
    });
  }
});

test.describe('axe, with motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('/', async ({ page }) => {
    await open(page, '/');
    await expect(page.locator('html')).toHaveClass(/(^|\s)motion(\s|$)/);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(failures(violations)).toEqual([]);
  });
});
