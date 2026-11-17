import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Accessibility checks with axe-core (WCAG 2.x A/AA plus axe's best practices) on the landing page, the topic pages
// /kosten/ and /fragen/, and a legal page (one light theme, DESIGN.md -> Theme). Fails on serious and critical violations only (moderate
// ones are axe best practices, not WCAG failures).
//
// Scanned with reduced motion: every piece is in its final state then (with motion, the reveals below the fold wait
// at opacity 0 for the scroll and axe would skip them, and the hero copy fades in for about a second). The landing
// page is scanned once more with motion, as most visitors see it, after its load animations have finished.

const PAGES = ['/', '/kosten/', '/fragen/', '/impressum/'];
type Violation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

/**
 * Exception, color-contrast only: text inside the two aria-hidden pictures of the landing page, the hero start frame
 * (.ha-canvas) and the story stage (.st-stage), while an element between the picture and the text is faded
 * (opacity < 1). The fade is the picture: in the hero window a new pair fades in at the top and the bottom one fades
 * out on every beat of the loop (hero.css, ha-row), the "heute" pairs on the story stage are dimmed on purpose
 * (story.css). Such text is part of a picture and has no contrast requirement (WCAG 1.4.3, "incidental"), and in the
 * loop the ratio depends on the moment axe looks. The same text at full opacity is still checked: the rows that stand
 * still here, and the hero rows of the still frame (the first three) and the input tiles in the test below.
 */
const FADED_ART = '.ha-canvas[aria-hidden="true"], .st-stage[aria-hidden="true"]';

async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator('h1')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  // Wait for the time-based animations and transitions to end (the hero load, a reveal in view). The hero loop runs
  // forever and scroll-driven animations follow the scroll, so neither is waited for.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) =>
      a.timeline !== document.timeline || a.playState !== 'running' || a.effect?.getComputedTiming().endTime === Infinity));
}

/** Serious and critical violations as readable lines, minus the faded-art exception above. */
async function failures(page: Page, violations: Violation[]): Promise<string[]> {
  const lines: string[] = [];
  for (const v of violations) {
    if (v.impact !== 'serious' && v.impact !== 'critical') continue;
    for (const node of v.nodes) {
      const selector = node.target.map(String).join(' ');
      if (v.id === 'color-contrast') {
        const faded = await page.evaluate(([sel, art]) => {
          const el = document.querySelector(sel);
          const picture = el?.closest(art);
          for (let e = el; e && picture && e !== picture; e = e.parentElement) {
            if (Number(getComputedStyle(e).opacity) < 1) return true;
          }
          return false;
        }, [selector, FADED_ART] as const);
        if (faded) continue;
      }
      lines.push(`${v.impact} ${v.id}: ${selector}\n    ${(node.failureSummary ?? v.help).replace(/\s*\n\s*/g, ' ')}`);
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
      expect(await failures(page, violations)).toEqual([]);
    });
  }

  test('hero window rows and input tiles meet 4.5:1 at full opacity', async ({ page }) => {
    // The loop fades rows in and out by design (see FADED_ART); their text colours must pass whenever a row is
    // fully visible. Reduced motion shows the still frame; this also lifts any fade, should one be added.
    await open(page, '/');
    await page.addStyleTag({ content: '.hero-art :is(.ha-row, .ha-tile, .ha-win) { opacity: 1 !important; }' });
    const { violations, passes } = await new AxeBuilder({ page }).include('.hero-art').withRules(['color-contrast']).analyze();
    const checked = passes.flatMap((p) => p.nodes).map((n) => n.html);
    for (const cls of ['ha-names', 'ha-region', 'ha-score', 'ha-title', 'in-label']) {
      expect(checked.some((html) => html.includes(`class="${cls}"`)), `axe checked .${cls}`).toBe(true);
    }
    expect(await failures(page, violations)).toEqual([]);
  });
});

test.describe('axe, with motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('/', async ({ page }) => {
    await open(page, '/');
    await expect(page.locator('html')).toHaveClass(/(^|\s)motion(\s|$)/);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(await failures(page, violations)).toEqual([]);
  });
});
