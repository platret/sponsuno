import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, useGSAP);
// House easing for every tween (see DESIGN.md → Motion)
gsap.defaults({ ease: 'expo.out' });

export { gsap, ScrollTrigger, useGSAP };

// index.html sets .motion on <html> before first paint unless the visitor prefers reduced motion.
export const motionEnabled = (): boolean => document.documentElement.classList.contains('motion');

export const finePointer = (): boolean => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isNarrow = (maxWidth: number): boolean => window.matchMedia(`(max-width: ${maxWidth}px)`).matches;

/* ---------- Smooth scrolling ---------- */

let lenis: Lenis | null = null;

export function startSmoothScroll(): () => void {
  if (!motionEnabled()) return () => {};
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export const stopSmoothScroll = () => lenis?.stop();
export const resumeSmoothScroll = () => lenis?.start();

export function headerOffset(): number {
  const css = getComputedStyle(document.documentElement);
  return parseFloat(css.getPropertyValue('--header-h')) + parseFloat(css.getPropertyValue('--header-gap')) + 20;
}

/** Scroll to an in-page anchor below the floating header and move keyboard focus there. */
export function scrollToHash(hash: string): void {
  const top = hash === '#top';
  const target = top ? document.getElementById('top') : document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (lenis) {
    // Lenis already subtracts the CSS scroll-padding-top (header height), so no extra offset here
    lenis.scrollTo(top ? 0 : target, { duration: 1.4 });
  } else {
    const y = top ? 0 : target.getBoundingClientRect().top + window.scrollY - headerOffset() + 8;
    window.scrollTo({ top: y, behavior: motionEnabled() ? 'smooth' : 'auto' });
  }
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  history.replaceState(null, '', hash);
}

/** Scroll an element into the middle-ish of the viewport (used before the waitlist celebration on phones). */
export function scrollIntoFocus(el: HTMLElement): void {
  if (lenis) lenis.scrollTo(el, { offset: -window.innerHeight * 0.3, duration: 1 });
  else el.scrollIntoView({ block: 'center', behavior: motionEnabled() ? 'smooth' : 'auto' });
}

/* ---------- Events ---------- */

export const JOINED_EVENT = 'sponsuno:joined';
