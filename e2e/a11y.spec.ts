import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Accessibility checks with axe-core (WCAG 2.x A/AA plus axe's best practices) on the landing page, a topic page with
// sections, /kosten/, a guide and the demo, in both themes. Fails on serious and critical violations only (moderate
// ones, like the demo banner outside a landmark, are axe best practices, not WCAG failures).
//
// Scanned with reduced motion: every piece is in its final state then (with motion, the reveals below the fold wait
// at opacity 0 for the scroll and axe would skip them, and the hero copy fades in for about a second). The landing
// page is scanned once more with motion, as most visitors see it, after its load animations have finished.

const PAGES = ['/', '/fuer-firmen/', '/kosten/', '/sponsoren-finden/', '/demo/'];
const THEMES = ['light', 'dark'] as const;
type Theme = (typeof THEMES)[number];
type Violation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

/**
 * Exception, color-contrast only: text inside the two aria-hidden pictures of the landing page, the hero start frame
 * (.ha-canvas) and the story stage (.st-stage), while an element between the picture and the text is faded
 * (opacity < 1). The fade is the picture: the pairs on the hero belt fade out as they travel right (hero.css,
 * ha-out), the "heute" pairs on the story stage are dimmed on purpose (story.css). Such text is part of a picture and
 * has no contrast requirement (WCAG 1.4.3, "incidental"), and on the belt the ratio depends on the moment axe looks
 * (it made the Lighthouse score flip between 97 and 100). The same text at full opacity is still checked: the lead
 * pair here, and every hero pair in the test below.
 */
const FADED_ART = '.ha-canvas[aria-hidden="true"], .st-stage[aria-hidden="true"]';

async function open(page: Page, path: string, theme: Theme) {
  await page.emulateMedia({ colorScheme: theme });
  await page.addInitScript((value) => {
    try {
      localStorage.setItem('sponsuno-theme', value);
    } catch {
      // storage blocked: the system setting (emulated above) gives the same theme
    }
  }, theme);
  await page.goto(path);
  if (path === '/demo/') {
    // The demo renders in the browser and keeps its light look in both themes (data-theme="light" in its HTML)
    await expect(page.locator('#demo-main h1')).toBeVisible();
    await expect(page.locator('.demo-view-pending')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  } else {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  }
  await page.evaluate(() => document.fonts.ready);
  // Wait for the time-based animations and transitions to end (the hero load, a reveal in view). The belt runs
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

  for (const theme of THEMES) {
    for (const path of PAGES) {
      test(`${path} (${theme})`, async ({ page }) => {
        await open(page, path, theme);
        const { violations } = await new AxeBuilder({ page }).analyze();
        expect(await failures(page, violations)).toEqual([]);
      });
    }

    test(`hero pair cards meet 4.5:1 at full opacity (${theme})`, async ({ page }) => {
      // The belt fades its pairs out by design (see FADED_ART); their text colours must pass whenever a pair is
      // fully visible. Reduced motion lays the pairs out side by side; this lifts the step-wise dimming.
      await open(page, '/', theme);
      await page.addStyleTag({ content: '.hero-art .ha-pair { opacity: 1 !important; }' });
      const { violations, passes } = await new AxeBuilder({ page }).include('.hero-art').withRules(['color-contrast']).analyze();
      expect(passes.flatMap((p) => p.nodes).length, 'axe checked the pair text').toBeGreaterThan(0);
      expect(await failures(page, violations)).toEqual([]);
    });
  }
});

test.describe('axe, with motion', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  for (const theme of THEMES) {
    test(`/ (${theme})`, async ({ page }) => {
      await open(page, '/', theme);
      await expect(page.locator('html')).toHaveClass(/(^|\s)motion(\s|$)/);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(await failures(page, violations)).toEqual([]);
    });
  }
});
