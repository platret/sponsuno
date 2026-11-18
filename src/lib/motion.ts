// Motion and scrolling for the landing page. No animation library: CSS scroll-driven animations
// (data-scroll, site.css) where supported, otherwise CSS transitions plus one IntersectionObserver
// (data-reveal). Nothing here runs per scroll frame. The motion plan is in DESIGN.md -> Motion.

// index.html sets .motion on <html> before first paint unless the visitor prefers reduced motion.
export const motionEnabled = (): boolean => document.documentElement.classList.contains('motion');

// index.html also sets .scroll-fx when motion is on and the browser supports animation-timeline: view().
export const scrollFxEnabled = (): boolean => document.documentElement.classList.contains('scroll-fx');

/** Height of the fixed header: an in-page link lands with its target flush under the bar (the blocks are full-bleed
    bands with their own padding, so no strip of the band before may stay visible). For links the browser follows
    itself (/#warteliste from another page) header.css does the same with scroll-margin-top on the blocks. */
export function headerOffset(): number {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
}

/** How long the focus move waits for the smooth scroll when the browser never reports its end (ms) */
const SCROLL_END_TIMEOUT = 1200;
/** Ends the wait of the link before, when a second link is followed while the page still scrolls */
let stopWaiting: (() => void) | null = null;

/**
 * Scroll to an in-page anchor below the fixed header and move keyboard focus there.
 * Focus moves once the scroll has ended (the `scrollend` event, or after SCROLL_END_TIMEOUT where it is missing),
 * never while a smooth scroll runs: a browser may end the running scroll when focus changes. Without motion the
 * jump is instant and so is the focus. Focus is left alone if the visitor has put it somewhere else in between.
 */
export function scrollToHash(hash: string): void {
  const top = hash === '#top';
  const target = top ? document.getElementById('top') : document.querySelector<HTMLElement>(hash);
  if (!target) return;
  stopWaiting?.();
  const limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const y = top ? 0 : Math.min(limit, Math.max(0, Math.round(target.getBoundingClientRect().top + window.scrollY - headerOffset())));
  const from = document.activeElement;
  const focusTarget = () => {
    const now = document.activeElement;
    if (now && now !== from && now !== document.body) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };
  history.replaceState(null, '', hash);

  if (!motionEnabled() || Math.abs(y - window.scrollY) < 2) {
    window.scrollTo({ top: y, behavior: 'auto' });
    focusTarget();
    return;
  }
  let timer = 0;
  const stop = () => {
    window.clearTimeout(timer);
    window.removeEventListener('scrollend', arrived);
    stopWaiting = null;
  };
  const arrived = () => { stop(); focusTarget(); };
  stopWaiting = stop;
  window.addEventListener('scrollend', arrived);
  timer = window.setTimeout(arrived, SCROLL_END_TIMEOUT);
  window.scrollTo({ top: y, behavior: 'smooth' });
}

/**
 * Adds .is-in to every [data-reveal] element once it scrolls into view. CSS (site.css) fades and
 * lifts it, only under html.motion; without motion or JS everything is simply visible.
 * Under html.scroll-fx, elements that also carry data-scroll are animated by the scroll timeline
 * instead: they get .is-in at once and are not observed.
 * Returns a cleanup function.
 */
export function observeReveals(root: ParentNode = document): () => void {
  const all = [...root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)')];
  const scrollDriven = scrollFxEnabled();
  const els = scrollDriven ? all.filter((el) => !el.hasAttribute('data-scroll')) : all;
  if (scrollDriven) all.forEach((el) => { if (el.hasAttribute('data-scroll')) el.classList.add('is-in'); });
  if (!motionEnabled() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return () => {};
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
