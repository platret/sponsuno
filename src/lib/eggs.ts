// Easter eggs of the landing page (brief «Turnhalle»). Its own lazy chunk: App.tsx imports it once the page is idle,
// and the page works fully without it. Everything here is a pointer or keyboard extra on top of aria-hidden
// decoration: nothing takes focus, nothing is announced, nothing is needed to use the page.
// State lives in memory only (the album store in components/Album.tsx and a few variables below): no cookie, no
// localStorage, no sessionStorage, no IndexedDB. A reload starts again at 0/6.
//   1. Stickeralbum: a click or tap on any [data-sticker][data-collectable] collects it (each id once).
//   2. Drag: [data-draggable] stickers follow the mouse, stay inside the hero (below the header) and stay where they
//      are dropped. Mouse only: a finger that starts on a sticker scrolls and zooms the page as anywhere else (no
//      touch-action override), and a tap collects.
//   3. «tor»: typing t, o, r outside a form field shows a small scoreboard for two seconds.
//   4. Loop: a click on the loop of the giant footer wordmark makes its last «o» bounce twice.
// No listener runs per scroll frame.
import '../styles/eggs.css';
import { albumStore } from '../components/Album';
import { STICKER_IDS, type StickerId } from '../components/kit/Sticker';

/** A pointer that moved further than this (px) drags a sticker; less is a click that collects it */
const DRAG_START = 6;
/** How long the scoreboard stays (ms) */
const TOAST_TIME = 2000;
/** The wordmark's viewBox is 611.932 wide from x 4.028. As fractions of its width: where the loop («un») starts and
    how wide it is (the click area), and where the cut between the «n» (ends at 85.8 %) and the last «o» (starts at
    87.5 %) lies. eggs.css clips the two copies of the image at that cut (--egg-o), so all three live here. */
const LOOP_FROM = 0.665;
const LOOP_WIDTH = 0.193;
const O_FROM = 0.867;

const isStickerId = (value: string | undefined): value is StickerId =>
  (STICKER_IDS as readonly string[]).includes(value ?? '');

type Offset = { x: number; y: number };

/** Starts all four eggs. Returns a function that removes every listener and element it added. */
export function initEggs(goalWord: string): () => void {
  const undo: (() => void)[] = [];
  const on = <K extends keyof DocumentEventMap>(
    type: K, handler: (event: DocumentEventMap[K]) => void, options?: AddEventListenerOptions,
  ) => {
    document.addEventListener(type, handler, options);
    undo.push(() => document.removeEventListener(type, handler, options));
  };

  // ---------- 2. Drag (before the album: a drag must not count as a collecting click) ----------

  const offsets = new WeakMap<HTMLElement, Offset>();
  let drag: {
    el: HTMLElement; id: number; startX: number; startY: number; base: Offset;
    minX: number; maxX: number; minY: number; maxY: number; moved: boolean;
  } | null = null;
  /** The sticker that was just dragged: the click that follows its pointerup is not a find */
  let dropped: HTMLElement | null = null;

  on('pointerdown', (event) => {
    dropped = null;
    // Mouse only. Touch (and pen) keep the page's own gestures: a swipe that starts on a sticker scrolls.
    if (event.pointerType !== 'mouse' || !event.isPrimary || event.button !== 0) return;
    const el = (event.target as Element | null)?.closest?.<HTMLElement>('[data-draggable]');
    if (!el) return;
    // A drag that starts on a sticker must not select the text it passes over
    event.preventDefault();
    const bounds = (el.closest('[data-drag-bounds], .hero, section') ?? document.body).getBoundingClientRect();
    // Never under the fixed header: a sticker dropped there could not be reached again
    const ceiling = Math.max(bounds.top, document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0);
    const box = el.getBoundingClientRect();
    const base = offsets.get(el) ?? { x: 0, y: 0 };
    drag = {
      el, id: event.pointerId, startX: event.clientX, startY: event.clientY, base, moved: false,
      // How far the sticker may still travel in each direction before it would leave its bounds
      minX: base.x + Math.min(0, bounds.left - box.left), maxX: base.x + Math.max(0, bounds.right - box.right),
      minY: base.y + Math.min(0, ceiling - box.top), maxY: base.y + Math.max(0, bounds.bottom - box.bottom),
    };
  });

  on('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) <= DRAG_START) return;
      drag.moved = true;
      drag.el.classList.add('is-dragging');
      // Keep getting the moves when the pointer leaves the sticker (and the click that follows lands on it)
      try { drag.el.setPointerCapture(drag.id); } catch { /* pointer already gone */ }
    }
    const next = {
      x: Math.min(drag.maxX, Math.max(drag.minX, drag.base.x + dx)),
      y: Math.min(drag.maxY, Math.max(drag.minY, drag.base.y + dy)),
    };
    offsets.set(drag.el, next);
    drag.el.style.translate = `${Math.round(next.x)}px ${Math.round(next.y)}px`;
  });

  const drop = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    if (drag.moved) {
      drag.el.classList.remove('is-dragging');
      dropped = drag.el;
    }
    drag = null;
  };
  on('pointerup', drop);
  on('pointercancel', drop);

  // ---------- 1. Stickeralbum ----------

  on('click', (event) => {
    const el = (event.target as Element | null)?.closest?.<HTMLElement>('[data-sticker][data-collectable]');
    if (!el) return;
    if (el === dropped) { dropped = null; return; }
    const id = el.dataset.sticker;
    if (!isStickerId(id) || el.hasAttribute('data-collected')) return;
    // The clicked sticker leaves its dashed outline behind (kit.css pops it). Its id counts once in the album,
    // however many copies of it are stuck on the page; the album and the header chip follow the store.
    el.setAttribute('data-collected', '');
    albumStore.collect(id);
  });

  // ---------- 3. «tor» ----------

  let typed = '';
  let goals = 0;
  let toast: HTMLDivElement | null = null;
  let toastTimer = 0;
  const hideToast = () => {
    window.clearTimeout(toastTimer);
    toast?.remove();
    toast = null;
  };
  const showGoal = () => {
    goals += 1;
    hideToast();
    toast = document.createElement('div');
    toast.className = 'egg-toast';
    toast.setAttribute('aria-hidden', 'true');
    const word = document.createElement('span');
    word.className = 'egg-toast-word';
    word.textContent = goalWord;
    const score = document.createElement('span');
    score.className = 'egg-toast-score';
    score.textContent = `${goals}:0`;
    toast.append(word, score);
    document.body.append(toast);
    toastTimer = window.setTimeout(hideToast, TOAST_TIME);
  };
  undo.push(hideToast);

  on('keydown', (event) => {
    // Autofill and password managers dispatch keydown events without a `key` on form fields
    if (typeof event.key !== 'string' || event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as Element | null;
    if (target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) {
      typed = '';
      return;
    }
    typed = (typed + event.key.toLowerCase()).slice(-3);
    if (typed === 'tor') {
      typed = '';
      showGoal();
    }
  });

  // ---------- 4. Loop ----------

  // The wordmark stays the one <img> (its geometry is never touched). For the bounce a second copy of the same image
  // lies exactly on top, clipped to the last «o», while the first is clipped to everything before it: only that copy
  // moves (eggs.css). The loop gets an invisible click area of its own.
  const wordmark = document.querySelector<HTMLElement>('[data-wordmark]');
  const image = wordmark?.querySelector('img');
  if (wordmark && image) {
    const last = image.cloneNode(false) as HTMLImageElement;
    last.className = 'egg-o';
    last.alt = '';
    last.removeAttribute('loading');
    last.setAttribute('aria-hidden', 'true');
    const hit = document.createElement('span');
    hit.className = 'egg-loop';
    hit.setAttribute('aria-hidden', 'true');
    hit.style.left = `${LOOP_FROM * 100}%`;
    hit.style.width = `${LOOP_WIDTH * 100}%`;
    let bounceTimer = 0;
    const settle = () => {
      window.clearTimeout(bounceTimer);
      wordmark.classList.remove('is-bouncing');
    };
    const bounce = () => {
      if (wordmark.classList.contains('is-bouncing')) return;
      wordmark.classList.add('is-bouncing');
      // The animation runs under 1 s (and not at all with reduced motion): back to the single image afterwards
      bounceTimer = window.setTimeout(settle, 1000);
    };
    hit.addEventListener('click', bounce);
    wordmark.style.setProperty('--egg-o', `${O_FROM * 100}%`);
    wordmark.append(last, hit);
    wordmark.classList.add('has-egg');
    undo.push(() => {
      settle();
      last.remove();
      hit.remove();
      wordmark.style.removeProperty('--egg-o');
      wordmark.classList.remove('has-egg');
    });
  }

  return () => undo.forEach((fn) => fn());
}
