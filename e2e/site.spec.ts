import { expect, test, type Locator, type Page } from '@playwright/test';

// Browser smoke tests of the built site (`npm run build`, then `npm run test:e2e`). Few and stable on purpose: no
// screenshots, no animation timing, no copy (content.ts changes often); structure, ids and behaviour only.
// The landing page is the «Turnhalle» page (design system v2): hero, statement, word band, steps, two doors, waitlist,
// footer, plus the Easter eggs (lib/eggs.ts, a lazy chunk).

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

/** Resolves once the page has stopped scrolling (the same position for a few frames in a row). */
async function scrollSettled(page: Page) {
  await page.waitForFunction(() => new Promise<boolean>((resolve) => {
    let last = window.scrollY;
    let same = 0;
    const tick = () => {
      if (window.scrollY === last) same += 1; else { same = 0; last = window.scrollY; }
      if (same >= 10) resolve(true); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
}

/** The blocks of the landing page, in order */
const BLOCKS = ['#top', '#idee', '.wb', '#ablauf', '#fuer-wen', '#warteliste', 'footer.ft'];

/** The Easter-egg chunk loads when the browser is idle; it marks the footer wordmark once it runs. */
async function eggsReady(page: Page) {
  await expect(page.locator('[data-wordmark].has-egg')).toHaveCount(1, { timeout: 15_000 });
}

/** What the page has stored in the browser (the Datenschutzerklärung says: nothing) */
const stored = (page: Page) => page.evaluate(() => ({
  local: window.localStorage.length,
  session: window.sessionStorage.length,
  cookie: document.cookie,
}));
const NOTHING_STORED = { local: 0, session: 0, cookie: '' };

const waitlistRole = (page: Page, role: string): Locator => page.locator(`#warteliste input[name="rolle"][value="${role}"]`);

test('homepage loads without console errors and shows its H1', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toBeVisible();
  await page.waitForLoadState('networkidle');
  await eggsReady(page);
  expect(errors).toEqual([]);
});

test('homepage shows its seven blocks in order, built from vectors only', async ({ page }) => {
  const images: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'image') images.push(new URL(request.url()).pathname);
  });
  await page.goto('/');
  for (const block of BLOCKS) await expect(page.locator(block)).toHaveCount(1);
  const tops = await page.evaluate((selectors) =>
    selectors.map((s) => document.querySelector(s)!.getBoundingClientRect().top), BLOCKS);
  expect([...tops].sort((a, b) => a - b)).toEqual(tops);
  // Every block except the footer lives in <main>; the two doors are two tiles
  await expect(page.locator('main > section')).toHaveCount(BLOCKS.length - 1);
  await expect(page.locator('#fuer-wen article')).toHaveCount(2);
  // No photos on the landing page: scroll to the end, then only SVG files may have been requested
  await page.locator('footer.ft').scrollIntoViewIfNeeded();
  await page.waitForLoadState('networkidle');
  expect(images.filter((file) => !file.endsWith('.svg'))).toEqual([]);
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
      // Compare the path only ('So funktioniert es' is an in-page link, #ablauf)
      const expected = new URL(href, page.url()).pathname;
      await expect(page).toHaveURL((url) => url.pathname === expected);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
});

test('pages download only their preloaded font files (the core subsets)', async ({ page }) => {
  // src/styles/fonts.css: each face has a core file (preloaded) and an extra file for characters the site's own text
  // does not use; scripts/check-dist.mjs checks the text, this checks what the browser actually fetches.
  for (const path of ['/', '/kosten/', '/impressum/']) {
    await test.step(path, async () => {
      const fonts: string[] = [];
      const onRequest = (request: { resourceType(): string; url(): string }) => {
        if (request.resourceType() === 'font') fonts.push(new URL(request.url()).pathname);
      };
      page.on('request', onRequest);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.fonts.ready);
      page.off('request', onRequest);
      const preloads = await page.locator('link[rel="preload"][as="font"]').evaluateAll((els) =>
        els.map((el) => new URL((el as HTMLLinkElement).href).pathname));
      expect(fonts.every((f) => !f.includes('-extra-'))).toBe(true);
      if (preloads.length) expect([...new Set(fonts)].sort()).toEqual([...preloads].sort());
      expect(new Set(fonts).size).toBe(3);
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
  await expect(waitlistRole(page, 'sponsor')).toBeChecked();
  await expect(page).not.toHaveURL(/rolle=/);
});

test('the hero and door buttons preselect the waitlist role and lead to the form', async ({ page }) => {
  await page.goto('/');
  // The submit button is enabled once React has hydrated: only then do the role buttons work
  await expect(page.locator('#warteliste button[type="submit"]')).toBeEnabled();
  await expect(waitlistRole(page, 'athlete')).toBeChecked();

  const steps: [string, Locator, string][] = [
    ['hero, second button', page.locator('#top .hero-actions a').nth(1), 'sponsor'],
    ['hero, first button', page.locator('#top .hero-actions a').nth(0), 'athlete'],
    ['door for companies', page.locator('#fuer-wen .door-firma a.btn'), 'sponsor'],
    ['door for sport and culture', page.locator('#fuer-wen .door-sport a.btn'), 'athlete'],
  ];
  for (const [name, button, role] of steps) {
    await test.step(name, async () => {
      await button.click();
      await expect(waitlistRole(page, role)).toBeChecked();
      await expect(page).toHaveURL(/#warteliste$/);
      // Let the smooth scroll arrive before looking (and before the next click: Playwright's own scroll-into-view
      // in the middle of a smooth scroll would cut it short)
      await scrollSettled(page);
      await expect(page.locator('#warteliste h2')).toBeInViewport();
    });
  }
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

test('a dark system setting still shows the one light theme', async ({ page }) => {
  const look = () => page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return { scheme: root.colorScheme, bg: root.getPropertyValue('--bg').trim(), body: getComputedStyle(document.body).backgroundColor };
  });
  for (const path of ['/', '/impressum/']) {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(path);
    const light = await look();
    await page.emulateMedia({ colorScheme: 'dark' });
    expect(await look(), path).toEqual(light);
    expect(light.scheme, path).toBe('light');
  }
});

test.describe('Easter eggs (optional layer, state in memory only)', () => {
  test('collecting a sticker fills the album and the header counter and stores nothing', async ({ page }) => {
    await page.goto('/');
    await eggsReady(page);
    const chip = page.locator('.site-header .album-chip');
    const album = page.locator('#album');
    await expect(chip).toHaveCount(0);
    await expect(album.locator('.alb-slot')).toHaveCount(6);
    await expect(album.locator('.alb-slot.is-found')).toHaveCount(0);

    const ball = page.locator('#top .stk[data-sticker="ball"][data-collectable]');
    await ball.click();
    await expect(ball).toHaveAttribute('data-collected', '');
    await expect(chip).toHaveText('1/6');
    await expect(album.locator('.alb-num')).toHaveText('1');
    await expect(album.locator('.alb-slot.is-found')).toHaveCount(1);

    // A second copy of the same sticker (the ball in the word band) does not count twice; another sticker does
    await page.locator('.wb .stk[data-sticker="ball"][data-collectable]').first().dispatchEvent('click');
    await expect(chip).toHaveText('1/6');
    await page.locator('#top .stk[data-sticker="note"][data-collectable]').click();
    await expect(chip).toHaveText('2/6');
    await expect(album.locator('.alb-slot.is-found')).toHaveCount(2);

    // A pointer extra: the counter and the album are hidden from assistive technology and out of the tab order
    await expect(chip).toHaveAttribute('aria-hidden', 'true');
    await expect(chip).toHaveAttribute('tabindex', '-1');
    await expect(album).toHaveAttribute('aria-hidden', 'true');
    expect(await album.locator('a, button, input, [tabindex]:not([tabindex="-1"])').count()).toBe(0);

    expect(await stored(page)).toEqual(NOTHING_STORED);
    // In memory only: a reload starts again with an empty album
    await page.reload();
    await eggsReady(page);
    await expect(page.locator('.site-header .album-chip')).toHaveCount(0);
    await expect(page.locator('#album .alb-slot.is-found')).toHaveCount(0);
  });

  test('all six stickers fill the album', async ({ page }) => {
    await page.goto('/');
    await eggsReady(page);
    const ids = await page.locator('#album .alb-slot .stk').evaluateAll((els) => els.map((el) => el.getAttribute('data-sticker')));
    expect(ids).toHaveLength(6);
    for (const id of ids) {
      // A click event on the first copy of each sticker (where it is stuck does not matter here)
      await page.locator(`main .stk[data-sticker="${id}"][data-collectable]`).first().dispatchEvent('click');
    }
    await expect(page.locator('.site-header .album-chip')).toHaveText('6/6');
    await expect(page.locator('#album')).toHaveClass(/(^|\s)is-full(\s|$)/);
    await expect(page.locator('#album .alb-slot.is-found')).toHaveCount(6);
    expect(await stored(page)).toEqual(NOTHING_STORED);
  });

  test('dragging a hero sticker moves it and does not collect it', async ({ page }) => {
    await page.goto('/');
    await eggsReady(page);
    const sticker = page.locator('#top .stk[data-sticker="brezel"][data-draggable]');
    await expect(sticker).toBeVisible();
    // Wait for the stickers' load animation, so the measured place is the resting place
    await page.waitForFunction(() =>
      document.getAnimations().every((a) => a.timeline !== document.timeline || a.playState !== 'running'));
    const before = await sticker.boundingBox();
    if (!before) throw new Error('hero sticker has no box');
    const from = { x: before.x + before.width / 2, y: before.y + before.height / 2 };
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x - 60, from.y + 20, { steps: 6 });
    await page.mouse.move(from.x - 120, from.y + 40, { steps: 6 });
    await page.mouse.up();
    const after = await sticker.boundingBox();
    if (!after) throw new Error('hero sticker has no box after the drag');
    expect(Math.abs(after.x - before.x + 120)).toBeLessThanOrEqual(4);
    expect(Math.abs(after.y - before.y - 40)).toBeLessThanOrEqual(4);
    // It stays where it was dropped and was not collected by the click that ends the drag
    await expect(sticker).not.toHaveAttribute('data-collected');
    await expect(page.locator('.site-header .album-chip')).toHaveCount(0);
    await expect(page.locator('#album .alb-slot.is-found')).toHaveCount(0);
    expect(await stored(page)).toEqual(NOTHING_STORED);
  });

  test('typing «tor» shows the scoreboard, typing in the e-mail field does not', async ({ page }) => {
    await page.goto('/');
    await eggsReady(page);
    const toast = page.locator('.egg-toast');
    const email = page.locator('#wl-email');

    await email.focus();
    await page.keyboard.type('tor');
    await expect(email).toHaveValue('tor');
    await expect(toast).toHaveCount(0);

    await email.blur();
    await page.keyboard.type('tor');
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute('aria-hidden', 'true');
    await expect(toast.locator('.egg-toast-score')).toHaveText('1:0');
    // It leaves by itself (after two seconds)
    await expect(toast).toHaveCount(0, { timeout: 6000 });
    expect(await stored(page)).toEqual(NOTHING_STORED);
  });
});

test.describe('phone viewport (390 × 844)', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  for (const path of ['/', '/kosten/', '/impressum/']) {
    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      expect(await horizontalOverflow(page), 'overflow at the top').toBeLessThanOrEqual(0);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      expect(await horizontalOverflow(page), 'overflow at the bottom').toBeLessThanOrEqual(0);
    });
  }
});

test.describe('narrowest phone (320 × 568)', () => {
  test.use({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });

  test('/ has no horizontal overflow in any block', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    expect(await horizontalOverflow(page), 'overflow at the top').toBeLessThanOrEqual(0);
    for (const block of BLOCKS) {
      await page.locator(block).scrollIntoViewIfNeeded();
      expect(await horizontalOverflow(page), `overflow at ${block}`).toBeLessThanOrEqual(0);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    expect(await horizontalOverflow(page), 'overflow at the bottom').toBeLessThanOrEqual(0);
  });
});

/** Elements that are rendered but not at full opacity, or SVG lines that are not fully drawn */
async function unfinished(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const name = (el: Element) => `${el.tagName.toLowerCase()}.${el.getAttribute('class') ?? ''}`;
    const rendered = (el: Element) => el.getClientRects().length > 0;
    const faded = [...document.querySelectorAll('[data-reveal], [data-scroll], .stk, .tstk, .st-text .w')]
      .filter((el) => rendered(el) && getComputedStyle(el).opacity !== '1').map(name);
    // A drawn line has no dash pattern left (kit.css: the static style and the last keyframe)
    const undrawn = [...document.querySelectorAll('.cl-path')]
      .filter((el) => rendered(el) && getComputedStyle(el).strokeDasharray !== 'none').map(name);
    // The statement's words are in their final colour: the paragraph's own
    const text = document.querySelector('.st-text');
    const ink = text ? getComputedStyle(text).color : '';
    const grey = [...document.querySelectorAll('.st-text .w:not(.st-sign)')]
      .filter((el) => getComputedStyle(el).color !== ink).map(name);
    return [...faded, ...undrawn, ...grey];
  });
}

test.describe('prefers-reduced-motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('homepage shows everything and nothing animates', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/(^|\s)(motion|scroll-fx)(\s|$)/);
    await eggsReady(page);
    for (const block of BLOCKS) {
      await test.step(block, async () => {
        await page.locator(block).scrollIntoViewIfNeeded();
        await expect(page.locator(block)).toBeVisible();
        // Reveal and scroll start states apply only under html.motion: every piece is in its final state, and
        // no animation or transition is left running (the reduced-motion block in site.css ends them at once)
        expect(await unfinished(page)).toEqual([]);
        await expect.poll(() => page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)).toBe(0);
      });
    }
    await expect(page.locator('#warteliste h2')).toBeVisible();
    // The word band rests as its lockup: neither row is moved
    const moved = await page.locator('.wb-row').evaluateAll((rows) =>
      rows.filter((row) => !['none', '0px'].includes(getComputedStyle(row).translate) || getComputedStyle(row).transform !== 'none').length);
    expect(moved).toBe(0);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('homepage shows every block in its final state', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    for (const block of BLOCKS) await expect(page.locator(block)).toBeVisible();
    // Text and controls of every block are there
    await expect(page.locator('#top .hero-actions a')).toHaveCount(2);
    await expect(page.locator('#idee .st-point')).toHaveCount(3);
    await expect(page.locator('#ablauf .steps-item')).toHaveCount(3);
    await expect(page.locator('#ablauf .match')).toBeVisible();
    await expect(page.locator('#fuer-wen a.btn')).toHaveCount(2);
    await expect(page.locator('#warteliste form')).toBeVisible();
    await expect(page.locator('#warteliste #wl-email')).toBeVisible();
    // The prerendered form can never post natively: its button waits for the app
    await expect(page.locator('#warteliste button[type="submit"]')).toBeDisabled();
    // The album is prerendered empty; the counter chip belongs to the app
    await expect(page.locator('#album .alb-slot')).toHaveCount(6);
    await expect(page.locator('.album-chip')).toHaveCount(0);
    // Without the inline script there is no html.motion: nothing waits hidden, every line is drawn
    await expect(page.locator('html')).not.toHaveClass(/(^|\s)(js|motion|scroll-fx)(\s|$)/);
    expect(await page.locator('[data-reveal], [data-scroll], .stk, .tstk, .st-text .w').evaluateAll((els) =>
      els.filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).opacity !== '1').length)).toBe(0);
    expect(await page.locator('.cl-path').evaluateAll((els) =>
      els.filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).strokeDasharray !== 'none').length)).toBe(0);
    // The header is the solid bar
    expect(await page.locator('.site-header').evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  });
});
