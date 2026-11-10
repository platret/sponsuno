import { expect, test, type Page, type Request } from '@playwright/test';

// The waitlist form with an endpoint (project `waitlist-live` in playwright.config.ts: a build with
// VITE_WAITLIST_ENDPOINT=/api/warteliste). Every answer of the Worker route is faked here with page.route, so no test
// ever reaches a real Worker or Brevo. Structure and behaviour only, no copy (see site.spec.ts).

/** Answers POST /api/warteliste with the given status and JSON; returns the requests the form sent. */
async function fakeRoute(page: Page, status: number, body: unknown): Promise<Request[]> {
  const requests: Request[] = [];
  await page.route('**/api/warteliste', (route) => {
    requests.push(route.request());
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  // Anything else off this host (there should be nothing) is refused
  await page.route(/^https?:\/\/(?!127\.0\.0\.1[:/]|localhost[:/])/, (route) => route.abort());
  return requests;
}

async function signUp(page: Page) {
  // Role chosen through the URL (App.tsx), not by clicking: the chips move while the section's scroll motion runs
  await page.goto('/?rolle=kulturverein#warteliste');
  const section = page.locator('#warteliste');
  const submit = section.locator('button[type="submit"]');
  await expect(submit).toBeEnabled(); // React has taken over the form
  await expect(section.locator('input[name="rolle"][value="kulturverein"]')).toBeChecked();
  await section.locator('#wl-email').fill('name@beispiel.ch');
  await submit.click();
  return section;
}

test('sends JSON with the honeypot field; 200 shows the double opt-in success without the e-mail route', async ({ page }) => {
  const requests = await fakeRoute(page, 200, { ok: true });
  const section = await signUp(page);
  await expect(section.getByRole('status')).toBeVisible();
  await expect(section.locator('form')).toHaveCount(0);
  await expect(section.getByRole('status').locator('a[href^="mailto:"]')).toHaveCount(0);

  expect(requests).toHaveLength(1);
  expect(requests[0].method()).toBe('POST');
  expect(requests[0].headers()['content-type']).toBe('application/json');
  expect(requests[0].postDataJSON()).toEqual({ rolle: 'kulturverein', email: 'name@beispiel.ch', website: '' });
});

test('503 not_configured switches to the e-mail route (nothing was stored)', async ({ page }) => {
  await fakeRoute(page, 503, { ok: false, reason: 'not_configured' });
  const section = await signUp(page);
  const status = section.getByRole('status');
  await expect(status).toBeVisible();
  await expect(status.locator('a[href^="mailto:"]')).toHaveCount(1);
  await expect(status.locator('a[href^="mailto:"]')).toHaveAttribute('href', /subject=/);
});

for (const [status, reason] of [[502, 'upstream_error'], [429, 'rate_limited'], [503, 'other']] as const) {
  test(`${status} ${reason} shows the error message and keeps the form`, async ({ page }) => {
    await fakeRoute(page, status, { ok: false, reason });
    const section = await signUp(page);
    await expect(section.locator('#wl-error')).toBeVisible();
    await expect(section.locator('#wl-error')).not.toBeEmpty();
    await expect(section.locator('form')).toHaveCount(1);
    await expect(section.locator('button[type="submit"]')).toBeEnabled();
  });
}

test('the honeypot field exists but is hidden from people and assistive technology', async ({ page }) => {
  await page.goto('/#warteliste');
  const honeypot = page.locator('#warteliste input[name="website"]');
  await expect(honeypot).toHaveCount(1);
  await expect(honeypot).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('#warteliste [aria-hidden="true"]:has(input[name="website"])')).toHaveCount(1);
});
