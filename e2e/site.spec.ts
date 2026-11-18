import { expect, test, type Locator, type Page } from '@playwright/test';
import { BLOCKS, STICKERS, eggsReady } from './helpers.ts';

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

/**
 * How far the target of an in-page link is from where it belongs: its upper edge flush under the fixed header (or the
 * page at scroll 0 for #top), and keyboard focus on it. [0, true] means the link has arrived. Polled after a click:
 * a smooth scroll that is cut short never gets there, so nothing here can hide a cancelled scroll.
 */
const landing = (page: Page, hash: string) => page.evaluate((id) => {
  const target = document.querySelector<HTMLElement>(id)!;
  const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'));
  const off = id === '#top' ? window.scrollY : target.getBoundingClientRect().top - bar;
  return [Math.round(Math.abs(off)), document.activeElement === target] as const;
}, hash);
async function expectLanded(page: Page, hash: string) {
  await expect.poll(() => landing(page, hash), { message: `landing of ${hash}` }).toEqual([0, true]);
}

/** What the page has stored in the browser (the Datenschutzerklärung says: nothing) */
const stored = (page: Page) => page.evaluate(async () => ({
  local: window.localStorage.length,
  session: window.sessionStorage.length,
  cookie: document.cookie,
  idb: (await window.indexedDB.databases()).length,
  caches: (await window.caches.keys()).length,
}));
const NOTHING_STORED = { local: 0, session: 0, cookie: '', idb: 0, caches: 0 };

/** The words of the word band that stand whole inside the window (a word's box without the gap after it) */
const wholeWords = (page: Page) => page.locator('.wb-word').evaluateAll((words) => words
  .filter((word) => {
    const box = word.getBoundingClientRect();
    return box.width > 0 && box.left >= 0 && box.right - parseFloat(getComputedStyle(word).paddingRight) <= window.innerWidth;
  })
  .map((word) => word.getAttribute('data-word')));

/** The first copy of a sticker that is shown and counts for the album, brought to the middle of the window */
async function findSticker(page: Page, id: string): Promise<Locator> {
  const copies = page.locator(`main .stk[data-sticker="${id}"][data-collectable]`);
  const shown = await copies.evaluateAll((els) => els.findIndex((el) => el.getClientRects().length > 0));
  expect(shown, `a collectable ${id} is shown`).toBeGreaterThanOrEqual(0);
  const sticker = copies.nth(shown);
  await sticker.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  return sticker;
}

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
      // The smooth scroll runs to its end: the band lands flush under the header and takes focus
      await expectLanded(page, '#warteliste');
      await expect(page.locator('#warteliste h2')).toBeInViewport();
    });
  }
});

test('in-page links arrive from the top, from mid-page and from the bottom: flush under the header, focus moved', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#warteliste button[type="submit"]')).toBeEnabled(); // the app handles the clicks
  await expect(page.locator('html')).toHaveClass(/(^|\s)motion(\s|$)/); // smooth scrolling is on
  const jump = (share: number) => page.evaluate((s) =>
    window.scrollTo({ top: Math.round((document.documentElement.scrollHeight - window.innerHeight) * s), behavior: 'instant' }), share);
  const steps: [string, number, string, string][] = [
    ['header nav from the top', 0, '.site-header nav a[href="#ablauf"]', '#ablauf'],
    ['header button from mid-page', 0.3, '.site-header a.header-cta', '#warteliste'],
    ['header nav from mid-page, upwards', 0.75, '.site-header nav a[href="#ablauf"]', '#ablauf'],
    ['footer link from the bottom', 1, 'footer.ft a[href="#ablauf"]', '#ablauf'],
    ['footer link from the bottom, to the block right above', 1, 'footer.ft a[href="#warteliste"]', '#warteliste'],
    ['footer link from the bottom to the top', 1, 'footer.ft a[href="#top"]', '#top'],
    ['hero arrow from the top', 0, '#top a.hero-next', '#idee'],
  ];
  for (const [name, from, link, hash] of steps) {
    await test.step(name, async () => {
      await jump(from);
      await page.locator(link).click();
      await expectLanded(page, hash);
      await expect(page).toHaveURL(new RegExp(`${hash}$`));
    });
  }
  // After "So funktioniert es" the ink word band ends exactly at the bar's lower edge: the bar is not ink there
  await jump(0);
  await page.locator('.site-header nav a[href="#ablauf"]').click();
  await expectLanded(page, '#ablauf');
  await expect(page.locator('.site-header')).not.toHaveClass(/(^|\s)is-dark(\s|$)/);
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

/** Collects all six stickers with a real click or tap each (the hero's ball last) and follows the album to its finale */
async function fillAlbum(page: Page, touch: boolean) {
  await page.goto('/');
  await eggsReady(page);
  const chip = page.locator('.site-header .album-chip');
  const album = page.locator('#album');
  // The hero alone cannot fill the album: two of its stickers count, the other ids are further down the page
  await expect(page.locator('#top .stk[data-collectable]')).toHaveCount(2);
  const order = [...STICKERS].reverse();
  expect(order.at(-1)).toBe('ball');
  for (const [i, id] of order.entries()) {
    await test.step(id, async () => {
      const sticker = await findSticker(page, id);
      // A real pointer: it fails if the sticker is covered, off screen or does not take pointer events
      if (touch) await sticker.tap(); else await sticker.click();
      await expect(sticker).toHaveAttribute('data-collected', '');
      await expect(chip).toHaveText(`${i + 1}/6`);
    });
  }
  // Full, found at the top of the page: the chip celebrates there, the album (screens away) has not been seen yet
  await expect(chip).toHaveClass(/(^|\s)is-full(\s|$)/);
  await expect(chip.locator('.alb-burst')).toHaveCount(1);
  await expect(album).toHaveClass(/(^|\s)is-full(\s|$)/);
  await expect(album).not.toHaveClass(/(^|\s)is-seen(\s|$)/);
  await expect(album.locator('.alb-burst')).toHaveCount(0);
  await expect(album.locator('.alb-slot.is-found')).toHaveCount(6);
  // The finale starts when the album comes on screen (the chip leads there)
  if (touch) await chip.tap(); else await chip.click();
  await expect(album).toHaveClass(/(^|\s)is-seen(\s|$)/);
  await expect(album.locator('.alb-burst')).toHaveCount(1);
  await expect(album).toBeInViewport();
  expect(await stored(page)).toEqual(NOTHING_STORED);
}

test.describe('Easter eggs (optional layer, state in memory only)', () => {
  test('collecting a sticker fills the album and the header counter and stores nothing', async ({ page }) => {
    await page.goto('/');
    await eggsReady(page);
    const chip = page.locator('.site-header .album-chip');
    const album = page.locator('#album');
    await expect(chip).toHaveCount(0);
    await expect(album.locator('.alb-slot')).toHaveCount(6);
    await expect(album.locator('.alb-slot.is-found')).toHaveCount(0);

    // The counter chip is out of the flow: when it appears, the nav and the button stay where they are
    const place = () => page.locator('.site-header nav a, .site-header .header-cta').evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().left)));
    const before = await place();

    const ball = page.locator('#top .stk[data-sticker="ball"][data-collectable]');
    await ball.click();
    await expect(ball).toHaveAttribute('data-collected', '');
    await expect(chip).toHaveText('1/6');
    expect(await place()).toEqual(before);
    await expect(album.locator('.alb-num')).toHaveText('1');
    await expect(album.locator('.alb-slot.is-found')).toHaveCount(1);

    // A second copy of the same sticker (the ball in the word band) does not count twice; another sticker does
    const second = page.locator('.wb .wb-row-1 .stk[data-sticker="ball"][data-collectable]');
    await second.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await second.click();
    await expect(second).toHaveAttribute('data-collected', '');
    await expect(chip).toHaveText('1/6');
    await page.locator('#top .stk[data-sticker="wimpel"][data-collectable]').click();
    await expect(chip).toHaveText('2/6');
    await expect(album.locator('.alb-slot.is-found')).toHaveCount(2);
    // A hero sticker that is only illustration there (the note) can be clicked without counting
    await page.locator('#top .stk[data-sticker="note"]').click();
    await expect(chip).toHaveText('2/6');

    // A pointer extra: counter and album are hidden from assistive technology and hold nothing that takes focus
    await expect(chip).toHaveAttribute('aria-hidden', 'true');
    expect(await chip.evaluate((el) => el.tagName === 'SPAN' && el.tabIndex === -1 && !el.hasAttribute('tabindex'))).toBe(true);
    await expect(album).toHaveAttribute('aria-hidden', 'true');
    expect(await page.locator('#album, .album-chip').locator('a, button, input, [tabindex]').count()).toBe(0);

    expect(await stored(page)).toEqual(NOTHING_STORED);
    // In memory only: a reload starts again with an empty album
    await page.reload();
    await eggsReady(page);
    await expect(page.locator('.site-header .album-chip')).toHaveCount(0);
    await expect(page.locator('#album .alb-slot.is-found')).toHaveCount(0);
  });

  test('all six stickers can be found with real clicks; the finale waits for the album to be on screen', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await fillAlbum(page, false);
  });

  test('dragging a hero sticker moves it and does not collect it; it never ends under the header', async ({ page }) => {
    await page.goto('/');
    await eggsReady(page);
    const sticker = page.locator('#top .stk[data-sticker="ball"][data-draggable]');
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
    // It stays where it was dropped and was not collected by the click that ends the drag (this one counts when clicked)
    await expect(sticker).toHaveAttribute('data-collectable', '');
    await expect(sticker).not.toHaveAttribute('data-collected');
    await expect(page.locator('.site-header .album-chip')).toHaveCount(0);
    await expect(page.locator('#album .alb-slot.is-found')).toHaveCount(0);

    // Dragged far up, it stops at the header's lower edge and can still be reached
    const mid = { x: after.x + after.width / 2, y: after.y + after.height / 2 };
    await page.mouse.move(mid.x, mid.y);
    await page.mouse.down();
    await page.mouse.move(mid.x, mid.y - 60, { steps: 6 });
    await page.mouse.move(mid.x, 2, { steps: 8 });
    await page.mouse.up();
    const top = await sticker.boundingBox();
    const bar = await page.locator('.site-header').boundingBox();
    if (!top || !bar) throw new Error('no box after the second drag');
    expect(top.y).toBeGreaterThanOrEqual(bar.y + bar.height - 1);
    expect(top.y).toBeLessThan(after.y);
    expect(await stored(page)).toEqual(NOTHING_STORED);
  });

  test('typing «tor» shows the scoreboard, typing in the e-mail field does not', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');
    await eggsReady(page);
    const toast = page.locator('.egg-toast');
    const email = page.locator('#wl-email');

    await email.focus();
    await page.keyboard.type('tor');
    await expect(email).toHaveValue('tor');
    await expect(toast).toHaveCount(0);
    // Autofill and password managers send keydown events without a key to form fields: no error, no scoreboard
    await email.evaluate((el) => {
      el.dispatchEvent(new Event('keydown', { bubbles: true }));
      document.body.dispatchEvent(new Event('keydown', { bubbles: true }));
    });
    await expect(toast).toHaveCount(0);

    await email.blur();
    await page.keyboard.type('tor');
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute('aria-hidden', 'true');
    await expect(toast.locator('.egg-toast-score')).toHaveText('1:0');
    // It leaves by itself (after two seconds)
    await expect(toast).toHaveCount(0, { timeout: 6000 });
    expect(errors).toEqual([]);
    expect(await stored(page)).toEqual(NOTHING_STORED);
  });

  test('a click on the loop of the footer wordmark makes its last «o» bounce, once', async ({ page }) => {
    await page.goto('/');
    await eggsReady(page);
    const wordmark = page.locator('[data-wordmark]');
    const loop = wordmark.locator('.egg-loop');
    await wordmark.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect(wordmark.locator('img')).toHaveCount(2);
    await expect(loop).toHaveAttribute('aria-hidden', 'true');
    await loop.click();
    await expect(wordmark).toHaveClass(/(^|\s)is-bouncing(\s|$)/);
    // The copy of the «o» is the only thing that moves, and the wordmark is one image again afterwards
    await expect(wordmark.locator('.egg-o')).toBeVisible();
    await expect(wordmark).not.toHaveClass(/(^|\s)is-bouncing(\s|$)/, { timeout: 4000 });
    await expect(wordmark.locator('.egg-o')).toBeHidden();
    expect(await stored(page)).toEqual(NOTHING_STORED);
  });
});

test.describe('motion without scroll timelines (Firefox, older Safari)', () => {
  test('every block fades in and nothing stays hidden or half drawn', async ({ page }) => {
    // The same path those browsers take: html.motion without html.scroll-fx (index.html asks CSS.supports)
    await page.addInitScript(() => {
      const supports = CSS.supports.bind(CSS) as (...args: string[]) => boolean;
      CSS.supports = ((...args: string[]) => (args.join(' ').includes('animation-timeline') ? false : supports(...args))) as typeof CSS.supports;
    });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/(^|\s)motion(\s|$)/);
    await expect(page.locator('html')).not.toHaveClass(/(^|\s)scroll-fx(\s|$)/);
    for (const block of BLOCKS) {
      await test.step(block, async () => {
        await page.locator(block).evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' }));
        // Everything in the upper two thirds of the window ends visible and drawn, and the word band stays at rest
        await expect.poll(() => page.evaluate(() => {
          const inView = (el: Element) => {
            const box = el.getBoundingClientRect();
            return box.width > 0 && box.bottom > 0 && box.top < window.innerHeight * 0.66;
          };
          const hidden = [...document.querySelectorAll('[data-reveal], [data-scroll], .stk, .tstk')]
            .filter((el) => inView(el) && getComputedStyle(el).opacity !== '1').length;
          const undrawn = [...document.querySelectorAll('.cl-path')]
            .filter((el) => inView(el) && getComputedStyle(el).strokeDasharray !== 'none').length;
          const moved = [...document.querySelectorAll('.wb-row, .wb-track')]
            .filter((el) => !['none', '0px'].includes(getComputedStyle(el).translate)).length;
          return [hidden, undrawn, moved];
        }), { timeout: 8000 }).toEqual([0, 0, 0]);
      });
    }
  });
});

test.describe('phone viewport (390 × 844)', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('the sticker album can be filled with taps', async ({ page }) => {
    await fillAlbum(page, true);
  });

  test('a finger on a hero sticker neither drags it nor blocks scrolling', async ({ page }) => {
    await page.goto('/');
    await eggsReady(page);
    const sticker = page.locator('#top .stk[data-sticker="ball"][data-draggable]');
    await page.waitForFunction(() =>
      document.getAnimations().every((a) => a.timeline !== document.timeline || a.playState !== 'running'));
    // The browser keeps the scroll gesture: no touch-action override on the sticker
    expect(await sticker.evaluate((el) => getComputedStyle(el).touchAction)).toBe('auto');
    // A touch pointer that moves 150 px across the sticker (what a swipe sends before the browser takes over):
    // the page must not cancel any of these events and must not start a drag. Synthesised pointer events, because
    // Chromium's own touch scroll gesture (Input.synthesizeScrollGesture) does not scroll in headless Linux (CI).
    const result = await sticker.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const fire = (type: string, dy: number) => {
        const ev = new PointerEvent(type, {
          bubbles: true, cancelable: true, composed: true, pointerId: 7, pointerType: 'touch', isPrimary: true,
          button: type === 'pointermove' ? -1 : 0, buttons: type === 'pointerup' ? 0 : 1, clientX: x, clientY: y + dy,
        });
        el.dispatchEvent(ev);
        return ev.defaultPrevented;
      };
      const prevented = [fire('pointerdown', 0), fire('pointermove', -50), fire('pointermove', -100),
        fire('pointermove', -150), fire('pointerup', -150)];
      return { prevented, translate: (el as HTMLElement).style.translate, dragging: el.classList.contains('is-dragging') };
    });
    expect(result.prevented).toEqual([false, false, false, false, false]);
    expect(result.translate).toBe('');
    expect(result.dragging).toBe(false);
    await expect(sticker).not.toHaveAttribute('data-collected');
  });

  test('after signing up the confirmation is on screen and the band keeps its height', async ({ page }) => {
    await blockExternalRequests(page);
    await page.goto('/#warteliste');
    const section = page.locator('#warteliste');
    const email = section.locator('#wl-email');
    await expect(section.locator('button[type="submit"]')).toBeEnabled();
    await email.fill('name@beispiel.ch');
    // Where an on-screen keyboard leaves the field: high in the window, most of the card above it
    await email.evaluate((el) => window.scrollBy({ top: el.getBoundingClientRect().top - 120, behavior: 'instant' }));
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await section.locator('button[type="submit"]').tap();
    const status = section.getByRole('status');
    await expect(status).toBeVisible();
    await expect(status).toBeFocused();
    await expect(status).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
    // Not under the fixed header either
    await expect.poll(async () => {
      const [box, bar] = await Promise.all([status.boundingBox(), page.locator('.site-header').boundingBox()]);
      return box !== null && bar !== null && box.y >= bar.y + bar.height;
    }).toBe(true);
  });

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
    // The word band rests as its lockup: no row is moved, and exactly these words stand whole in the band
    const moved = await page.locator('.wb-row').evaluateAll((rows) =>
      rows.filter((row) => !['none', '0px'].includes(getComputedStyle(row).translate) || getComputedStyle(row).transform !== 'none').length);
    expect(moved).toBe(0);
    expect(await wholeWords(page)).toEqual(['Sport', 'Kultur', 'Triathlon', 'Chor', 'Turnverein']);
    // Screen readers get the label and one list of words, every one of which is drawn in the band
    const listed = await page.locator('.wb ul.visually-hidden li').allTextContents();
    const drawn = await page.locator('.wb-word').evaluateAll((words) => words.map((word) => word.getAttribute('data-word')));
    expect(listed.length).toBeGreaterThan(0);
    expect(listed.filter((word) => !drawn.includes(word))).toEqual([]);
  });

  test.describe('phone (390 × 844)', () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    test('the word band rests on sport and culture, one word per row', async ({ page }) => {
      await page.goto('/');
      await page.locator('.wb').scrollIntoViewIfNeeded();
      expect(await wholeWords(page)).toEqual(['Sport', 'Kultur', 'Turnverein']);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    });
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
