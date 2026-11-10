import { expect, test, type Page } from '@playwright/test';

// Browser smoke tests of the built site (`npm run build`, then `npm run test:e2e`). Few and stable on purpose: no
// screenshots, no animation timing, no copy (content.ts changes often); structure, ids and behaviour only.

/** Collects console errors and uncaught exceptions of a page. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

/** Never let a test reach a real waitlist endpoint (a build with VITE_WAITLIST_ENDPOINT would post to it). */
async function blockExternalRequests(page: Page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1[:/]|localhost[:/])/, (route) =>
    route.request().method() === 'GET' ? route.abort() : route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test('homepage loads without console errors and shows its H1', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('every header nav link leads to a page with an H1', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('.site-header nav a');
  const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const [i, href] of hrefs.entries()) {
    await test.step(href, async () => {
      if (i > 0) await page.goto('/');
      const errors = trackErrors(page);
      await links.nth(i).click();
      // Compare the path only: the demo adds its hash route (#/uebersicht) once it runs
      const expected = new URL(href, page.url()).pathname;
      await expect(page).toHaveURL((url) => url.pathname === expected);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
});

test('waitlist form rejects an invalid e-mail and accepts a valid one', async ({ page }) => {
  await blockExternalRequests(page);
  await page.goto('/#warteliste');
  const section = page.locator('#warteliste');
  const email = section.locator('#wl-email');
  const submit = section.locator('button[type="submit"]');

  await email.fill('keine-adresse');
  await submit.click(); // waits until hydration enables the button
  await expect(section.locator('#wl-error')).toBeVisible();
  await expect(section.locator('#wl-error')).not.toBeEmpty();
  await expect(email).toHaveAttribute('aria-invalid', 'true');

  await email.fill('name@beispiel.ch');
  await submit.click();
  await expect(section.getByRole('status')).toBeVisible();
  await expect(section.locator('form')).toHaveCount(0);
});

test('?rolle=sponsor preselects the sponsor role and is removed from the address', async ({ page }) => {
  await page.goto('/?rolle=sponsor#warteliste');
  await expect(page.locator('#warteliste input[name="rolle"][value="sponsor"]')).toBeChecked();
  await expect(page).not.toHaveURL(/rolle=/);
});

test('the waitlist confirmation page (Brevo redirect target) shows its H1 and stays out of search', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/warteliste/bestaetigt/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('an old section link (/#kosten) redirects to its topic page', async ({ page }) => {
  await page.goto('/#kosten');
  await expect(page).toHaveURL(/\/kosten\/$/);
  await expect(page.locator('h1')).toBeVisible();
});

test.describe('phone viewport (390 × 844)', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  for (const path of ['/', '/sponsoren-finden/']) {
    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      expect(await horizontalOverflow(page), 'overflow at the top').toBeLessThanOrEqual(0);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      expect(await horizontalOverflow(page), 'overflow at the bottom').toBeLessThanOrEqual(0);
    });
  }
});

test.describe('prefers-reduced-motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('homepage shows its content without motion', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/(^|\s)motion(\s|$)/);
    await page.locator('#warteliste').scrollIntoViewIfNeeded();
    await expect(page.locator('#warteliste h2')).toBeVisible();
    // Reveal start states (opacity 0) apply only under html.motion: every rendered reveal is in its final state
    const hidden = await page.locator('[data-reveal]').evaluateAll((els) =>
      els.filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).opacity !== '1').length);
    expect(hidden).toBe(0);
  });
});
