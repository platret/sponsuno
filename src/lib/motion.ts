// Motion and scrolling for the landing page. No animation library: CSS scroll-driven animations
// (data-scroll, site.css) where supported, otherwise CSS transitions plus one IntersectionObserver
// (data-reveal). Nothing here runs per scroll frame. The motion plan is in DESIGN.md -> Motion.

// index.html sets .motion on <html> before first paint unless the visitor prefers reduced motion.
export const motionEnabled = (): boolean => document.documentElement.classList.contains('motion');

// index.html also sets .scroll-fx when motion is on and the browser supports animation-timeline: view().
export const scrollFxEnabled = (): boolean => document.documentElement.classList.contains('scroll-fx');

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
