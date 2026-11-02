import { useEffect } from 'react';
import { gsap, motionEnabled, ScrollTrigger, useGSAP } from '../lib/motion';

/**
 * Page-wide scroll reveals:
 * - [data-split] headings: words rise out of their own line box
 * - [data-reveal] elements: fade and rise in batches
 * Section-specific motion (steps rail, KI panel, footer wordmark) lives in those components.
 */
export function useScrollReveals() {
  useGSAP(() => {
    const problems = gsap.utils.toArray<HTMLElement>('.problem');
    if (!motionEnabled()) {
      problems.forEach((p) => p.classList.add('is-in'));
      return;
    }

    gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
      gsap.fromTo(el.querySelectorAll('.word > span'), { yPercent: 110 }, {
        yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      });
    });

    const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]');
    gsap.set(targets, { opacity: 0, y: 34 });
    ScrollTrigger.batch(targets, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09, clearProps: 'transform,opacity' });
        batch.forEach((el) => el.classList.add('is-in'));
      },
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  });

  // Content can change height after load (FAQ answers, waitlist success, typing). ScrollTrigger only
  // refreshes on window resize by itself, so watch the page height and refresh once it settles.
  useEffect(() => {
    let lastHeight = document.body.scrollHeight;
    let timer = 0;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastHeight) < 2) return;
      lastHeight = h;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, []);
}
