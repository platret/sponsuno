// Motion and scrolling for the landing page. No animation library: CSS transitions plus one
// IntersectionObserver. The motion budget is in DESIGN.md (one signature moment, quiet reveals).

// index.html sets .motion on <html> before first paint unless the visitor prefers reduced motion.
export const motionEnabled = (): boolean => document.documentElement.classList.contains('motion');

export function headerOffset(): number {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) + 16;
}

/** Scroll to an in-page anchor below the fixed header and move keyboard focus there. */
export function scrollToHash(hash: string): void {
  const top = hash === '#top';
  const target = top ? document.getElementById('top') : document.querySelector<HTMLElement>(hash);
  if (!target) return;
  const y = top ? 0 : target.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top: y, behavior: motionEnabled() ? 'smooth' : 'auto' });
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  history.replaceState(null, '', hash);
}

/**
 * Adds .is-in to every [data-reveal] element once it scrolls into view. CSS (site.css) fades and
 * lifts it, only under html.motion; without motion or JS everything is simply visible.
 * Returns a cleanup function.
 */
export function observeReveals(root: ParentNode = document): () => void {
  const els = [...root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)')];
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

/** Calls `onEnter` once when `el` becomes at least `threshold` visible. Returns a cleanup function. */
export function onceVisible(el: Element, onEnter: () => void, threshold = 0.35): () => void {
  if (!('IntersectionObserver' in window)) { onEnter(); return () => {}; }
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    onEnter();
  }, { threshold });
  io.observe(el);
  return () => io.disconnect();
}
