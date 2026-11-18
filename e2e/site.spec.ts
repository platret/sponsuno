import { expect, test, type Locator, type Page } from '@playwright/test';
import { BLOCKS, COLLECTABLE, STICKERS, STICKER_HOME, eggsReady, type StickerName } from './helpers.ts';

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

/** The one sticker with this id that counts for the album (in its block, STICKER_HOME), brought to the middle of the window */
async function findSticker(page: Page, id: StickerName): Promise<Locator> {
  // Each id is on the page exactly once, so there is no second copy to fall back on
  await expect(page.locator(COLLECTABLE).and(page.locator(`[data-sticker="${id}"]`)), `one collectable ${id} on the page`).toHaveCount(1);
  const sticker = page.locator(`${STICKER_HOME[id]} .stk[data-sticker="${id}"][data-collectable]`);
  await expect(sticker, `the ${id} is in ${STICKER_HOME[id]}`).toHaveCount(1);
  expect(await sticker.evaluate((el) => el.getClientRects().length > 0), `the ${id} is shown`).toBe(true);
  await sticker.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  // Wait until the sticker stands still (the scroll-linked row it rides on has caught up with the jump, its reveal
  // has settled). A click or tap that starts while it still moves makes Playwright retry with forced scrolls to
  // other alignments, and every such scroll slides the word band's rows again: the note at the end of «Kultur» is
  // then out of the window or under another word.
  await sticker.evaluate((el) => new Promise<void>((resolve) => {
    let last = '';
    let still = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const now = `${r.left} ${r.top} ${r.width}`;
      still = now === last ? still + 1 : 0;
      last = now;
      if (still >= 6) resolve(); else requestAnimationFrame(tick);
    };
    tick();
  }));
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
  // The hero alone cannot fill the album: it holds one sticker, the other five ids are further down the page
  await expect(page.locator('#top .stk')).toHaveCount(1);
  await expect(page.locator('#top .stk[data-collectable]')).toHaveCount(1);
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
  // Full, found at the top of the page: the chip marks it there, the album (screens away) has not been seen yet
  await expect(chip).toHaveClass(/(^|\s)is-full(\s|$)/);
  await expect(album).toHaveClass(/(^|\s)is-full(\s|$)/);
  await expect(album).not.toHaveClass(/(^|\s)is-seen(\s|$)/);
  await expect(album.locator('.alb-slot.is-found')).toHaveCount(6);
  // Nothing is left to find, and no sticker was counted twice
  await expect(page.locator(COLLECTABLE).and(page.locator(':not([data-collected])'))).toHaveCount(0);
  await expect(album.locator('.alb-num')).toHaveText('6');
  // The finale (the six stickers hop once) starts when the album comes on screen (the chip leads there)
  if (touch) await chip.tap(); else await chip.click();
  await expect(album).toHaveClass(/(^|\s)is-seen(\s|$)/);
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

    // Every id counts once: a second click on the collected ball changes nothing; another sticker does count
    await ball.click();
    await expect(chip).toHaveText('1/6');
    await expect(album.locator('.alb-slot.is-found')).toHaveCount(1);
    const note = await findSticker(page, 'note');
    await note.click();
    await expect(note).toHaveAttribute('data-collected', '');
    await expect(chip).toHaveText('2/6');
    await expect(album.locator('.alb-slot.is-found')).toHaveCount(2);
    // The album's own six stickers are only shown: they do not count and take no click
    await expect(album.locator('.stk')).toHaveCount(6);
    await expect(album.locator('.stk[data-collectable]')).toHaveCount(0);
    expect(await album.locator('.stk').evaluateAll((els) => els.filter((el) => getComputedStyle(el).pointerEvents !== 'none').length)).toBe(0);

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

  test('dragging the hero ball moves it and does not collect it; it never ends under the header', async ({ page }) => {
    await page.goto('/');
    await eggsReady(page);
    const sticker = page.locator('#top .stk[data-sticker="ball"][data-draggable]');
    await expect(sticker).toBeVisible();
    // The ball is the page's only draggable sticker
    await expect(page.locator('[data-draggable]')).toHaveCount(1);
    // Wait for the sticker's load animation, so the measured place is the resting place
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

    // What the ball lies on: the hero's tag, headline, lead, buttons and arrow (it must never, clean rule 1)
    const lyingOn = () => page.evaluate(() => {
      const a = document.querySelector('#top .stk[data-draggable]')!.getBoundingClientRect();
      return [...document.querySelectorAll('#top .hero-badge, #top .hero-title, #top .hero-lead, #top .hero-actions a, #top .hero-next')]
        .filter((el) => {
          const b = el.getBoundingClientRect();
          return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        })
        .map((el) => el.className);
    });
    expect(await lyingOn()).toEqual([]);

    // Dragged far up, it stops below the text it meets on the way (or at the header's lower edge where the way is
    // free) and can still be reached
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
    expect(await lyingOn()).toEqual([]);

    // Dragged onto a button, it stops beside it: the button stays free and still works
    const cta = page.locator('#top .hero-actions a').last();
    const target = await cta.boundingBox();
    const now = await sticker.boundingBox();
    if (!target || !now) throw new Error('no box before the third drag');
    await page.mouse.move(now.x + now.width / 2, now.y + now.height / 2);
    await page.mouse.down();
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 24 });
    await page.mouse.up();
    expect(await lyingOn()).toEqual([]);
    await expect(sticker).not.toHaveAttribute('data-collected');
    await cta.click();
    await expectLanded(page, '#warteliste');
    await expect(page.locator('.site-header .album-chip')).toHaveCount(0);
    expect(await stored(page)).toEqual(NOTHING_STORED);
  });

  test('a hovered sticker never tilts further than it rests (8 degrees at most)', async ({ page }) => {
    await page.goto('/');
    await eggsReady(page);
    const sticker = page.locator('#top .stk[data-sticker="ball"]');
    await page.waitForFunction(() =>
      document.getAnimations().every((a) => a.timeline !== document.timeline || a.playState !== 'running'));
    const box = await sticker.boundingBox();
    if (!box) throw new Error('hero sticker has no box');
    // Net tilt: the sticker's own rotation plus its inner layer's (the wiggle and the press turn that one)
    const sample = () => sticker.evaluate((el) => new Promise<number>((resolve) => {
      const deg = (node: Element) => parseFloat(getComputedStyle(node).rotate) || 0;
      const inner = el.querySelector('.stk-in')!;
      let worst = 0;
      const start = performance.now();
      const tick = () => {
        worst = Math.max(worst, Math.abs(deg(el) + deg(inner)));
        if (performance.now() - start < 650) requestAnimationFrame(tick); else resolve(worst);
      };
      tick();
    }));
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    expect(await sample()).toBeLessThanOrEqual(8.01);
    await page.mouse.down();
    expect(await sample()).toBeLessThanOrEqual(8.01);
    await page.mouse.up();
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
    // It leaves by itself (after 1.6 seconds)
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
          const hidden = [...document.querySelectorAll('[data-reveal], [data-scroll], .stk')]
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

  test('a finger on the hero ball neither drags it nor blocks scrolling', async ({ page }) => {
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
    const faded = [...document.querySelectorAll('[data-reveal], [data-scroll], .stk, .st-text .w')]
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
    expect(await page.locator('[data-reveal], [data-scroll], .stk, .st-text .w').evaluateAll((els) =>
      els.filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).opacity !== '1').length)).toBe(0);
    expect(await page.locator('.cl-path').evaluateAll((els) =>
      els.filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).strokeDasharray !== 'none').length)).toBe(0);
    // The header is the solid bar
    expect(await page.locator('.site-header').evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  });
});

// The clean rules of the landing page (DESIGN.md -> Principles, Shapes and Kit), checked in the still final state at
// the four widths the design is looked at: six picture stickers and no more, nothing else tilted, at most two line
// colours per block, and no hall line (or the hero ball) on or behind a headline, a text, a button or the form.
const CLEAN_VIEWPORTS = [[1440, 900], [1024, 768], [768, 1024], [390, 844]] as const;
/** The text and controls of each block that a line must keep clear of */
const CLEAR_OF: Record<string, string> = {
  // .hero-next: the round arrow stands in a gap of the base line, the line does not run behind it
  '#top': '.hero-badge .tag, .hero-title, .hero-lead, .hero-actions a, .hero-next',
  '.wb': '.wb-label, .wb-word',
  '#fuer-wen': '.door-label, .door-title, .door-text, .door-btn',
  '#warteliste': '.wl-title, .wl-intro, .wl-card',
};

test.describe('clean rules', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  for (const [width, height] of CLEAN_VIEWPORTS) {
    test(`${width} px: six stickers, nothing else tilted, two line colours per block, lines clear of the text`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await expect(page.locator('h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);

      await test.step('sticker budget: six picture stickers, each id once, all collectable', async () => {
        const stickers = await page.locator(COLLECTABLE).evaluateAll((els) => els.map((el) => ({
          id: el.getAttribute('data-sticker') ?? '',
          shown: el.getClientRects().length > 0,
          size: (el as HTMLElement).offsetWidth,
          tilt: Math.abs(parseFloat(getComputedStyle(el).rotate) || 0),
        })));
        expect(stickers.map((s) => s.id).sort()).toEqual([...STICKERS].sort());
        for (const id of STICKERS) {
          await expect(page.locator(`${STICKER_HOME[id]} .stk[data-sticker="${id}"][data-collectable]`), `${id} in ${STICKER_HOME[id]}`).toHaveCount(1);
        }
        // Nothing beside them: five in <main>, the whistle and the album's six slots in the footer, none elsewhere
        await expect(page.locator('main .stk')).toHaveCount(5);
        await expect(page.locator('main .stk[data-collectable]')).toHaveCount(5);
        await expect(page.locator('footer.ft .stk')).toHaveCount(7);
        await expect(page.locator('.stk')).toHaveCount(12);
        await expect(page.locator('#idee .stk, #ablauf .stk')).toHaveCount(0);
        // The hero ball is the only sticker that can be dragged
        await expect(page.locator('[data-draggable]')).toHaveCount(1);
        await expect(page.locator('#top .stk[data-sticker="ball"][data-draggable][data-collectable]')).toHaveCount(1);
        // Small and nearly upright: at most 96 px (72 px on phones), tilted by at most 8 degrees
        const max = width <= 760 ? 72 : 96;
        expect(stickers.filter((s) => !s.shown || s.size > max + 0.5 || s.tilt > 8)).toEqual([]);
      });

      await test.step('nothing but a sticker is rotated', async () => {
        const tilted = await page.evaluate(() => {
          const out: string[] = [];
          for (const el of document.querySelectorAll('.site-header, .site-header *, main *, footer.ft *, .sticky-cta, .sticky-cta *')) {
            if (el.closest('.stk')) continue;
            const style = getComputedStyle(el);
            const turned = style.rotate !== 'none' && (parseFloat(style.rotate.split(' ').pop() ?? '') || 0) !== 0;
            // matrix(a, b, c, d, tx, ty): b and c are zero unless the element is rotated or skewed
            const m = /^matrix(3d)?\(([^)]+)\)/.exec(style.transform);
            const n = (m?.[2] ?? '').split(',').map(Number);
            const skewed = m ? Math.abs(n[1] ?? 0) > 1e-4 || Math.abs(n[m[1] ? 4 : 2] ?? 0) > 1e-4 : false;
            if (turned || skewed) out.push(`${el.tagName.toLowerCase()}.${el.getAttribute('class') ?? ''}`);
          }
          return out;
        });
        expect(tilted).toEqual([]);
        // The old tilted text stickers are gone; labels are the flat tag
        await expect(page.locator('.tstk')).toHaveCount(0);
        await expect(page.locator('#top .hero-badge .tag')).toHaveCount(1);
        await expect(page.locator('#ablauf .match-label .tag')).toHaveCount(1);
      });

      await test.step('at most two line colours in any block (per door tile)', async () => {
        const colours = await page.evaluate((blocks) => {
          const groups = blocks.flatMap((b) => (b === '#fuer-wen' ? ['#fuer-wen .door-sport', '#fuer-wen .door-firma'] : [b]));
          return groups.map((group) => {
            const lines = [...document.querySelectorAll(`${group} .cl-path`)].filter((el) => el.getClientRects().length > 0);
            return [group, [...new Set(lines.map((el) => el.getAttribute('data-line')))].sort()] as const;
          });
        }, BLOCKS);
        expect(colours.filter(([, lines]) => lines.length > 2)).toEqual([]);
        // The hall lines are still there: the hero, the word band, both doors and the waitlist band carry some
        expect(colours.filter(([, lines]) => lines.length > 0).map(([group]) => group))
          .toEqual(['#top', '.wb', '#fuer-wen .door-sport', '#fuer-wen .door-firma', '#warteliste']);
      });

      await test.step('no line and no hero ball on or behind text, buttons or the form', async () => {
        const hits = await page.evaluate((clearOf) => {
          const name = (el: Element) => `${el.tagName.toLowerCase()}.${el.getAttribute('class') ?? ''}`;
          const out: string[] = [];
          for (const [block, texts] of Object.entries(clearOf)) {
            const marks = [...document.querySelectorAll(`${block} .cl-path, ${block} .cl-glow, ${block} .door-ball-move${block === '#top' ? ', #top .stk' : ''}`)]
              .filter((el) => el.getClientRects().length > 0);
            const words = [...document.querySelectorAll(texts.split(', ').map((t) => `${block} ${t}`).join(', '))]
              .filter((el) => el.getClientRects().length > 0);
            if (!marks.length || !words.length) out.push(`${block}: nothing to compare`);
            for (const mark of marks) {
              // A line's box is its geometry: add its stroke (and a little air)
              const a = mark.getBoundingClientRect();
              const pad = mark.matches('.stk') ? 0 : 4;
              for (const word of words) {
                const b = word.getBoundingClientRect();
                if (a.left - pad < b.right && a.right + pad > b.left && a.top - pad < b.bottom && a.bottom + pad > b.top) {
                  out.push(`${block}: ${name(mark)} meets ${name(word)}`);
                }
              }
            }
          }
          return out;
        }, CLEAR_OF);
        expect(hits).toEqual([]);
      });

      await test.step('the hero headline stays inside the page container, with side margins', async () => {
        const out = await page.evaluate(() => {
          const inner = document.querySelector('#top .hero-inner')!;
          const style = getComputedStyle(inner);
          const box = inner.getBoundingClientRect();
          const left = box.left + parseFloat(style.paddingLeft);
          const right = box.right - parseFloat(style.paddingRight);
          // The ink of every line of the headline (text nodes, so the centred block's empty sides do not count)
          const range = document.createRange();
          range.selectNodeContents(document.querySelector('#top .hero-title')!);
          return [...range.getClientRects()]
            .filter((r) => r.width > 0 && (r.left < left - 0.5 || r.right > right + 0.5))
            .map((r) => `${Math.round(r.left)}..${Math.round(r.right)} outside ${Math.round(left)}..${Math.round(right)}`);
        });
        expect(out).toEqual([]);
      });

      await test.step('«4 von 4» stands only in the match card', async () => {
        const outside = await page.evaluate(() => {
          const out: string[] = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (node.parentElement?.closest('.match, script, style')) continue;
            if (/4\s*(von|\/)\s*4/i.test(node.textContent ?? '')) out.push((node.textContent ?? '').trim());
          }
          return out;
        });
        expect(outside).toEqual([]);
        await expect(page.locator('#ablauf .match')).toContainText(/4\s+von\s+4/);
      });
    });
  }

  for (const [width, height] of [[1440, 900], [390, 844]] as const) {
    test(`${width} px: the album counter stays inside the header bar`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await eggsReady(page);
      await page.locator('#top .stk[data-sticker="ball"][data-collectable]').click();
      const chip = page.locator('.site-header .album-chip');
      await expect(chip).toBeVisible();
      // The bar is fixed and the chip hangs on its button: wherever the page is scrolled to, the chip lies inside
      // the bar and never on the page's content
      for (const block of BLOCKS) {
        await page.locator(block).evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }));
        const [bar, box] = [await page.locator('.site-header').boundingBox(), await chip.boundingBox()];
        if (!bar || !box) throw new Error('no box for the header or the chip');
        expect(box.y, block).toBeGreaterThanOrEqual(bar.y);
        expect(box.y + box.height, block).toBeLessThanOrEqual(bar.y + bar.height);
        expect(box.x, block).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, block).toBeLessThanOrEqual(width);
      }
    });
  }

  for (const [width, height] of [[1440, 900], [390, 844]] as const) {
    test(`${width} px: a static page has one small sticker, not collectable`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/kosten/');
      await expect(page.locator('h1')).toBeVisible();
      const stickers = page.locator('.stk');
      await expect(stickers).toHaveCount(1);
      await expect(page.locator('.stk[data-collectable]')).toHaveCount(0);
      await expect(page.locator('.lg-band .stk')).toHaveCount(1);
      const look = await stickers.evaluate((el) => ({
        size: (el as HTMLElement).offsetWidth,
        tilt: Math.abs(parseFloat(getComputedStyle(el).rotate) || 0),
      }));
      expect(look.size).toBeLessThanOrEqual(72.5);
      expect(look.tilt).toBeLessThanOrEqual(8);
    });
  }
});
