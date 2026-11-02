import { useEffect, useRef, type MouseEvent, type RefObject } from 'react';
import { cta, demo, menu, nav } from '../content';
import { gsap, motionEnabled, resumeSmoothScroll, scrollToHash, stopSmoothScroll } from '../lib/motion';

export interface MenuState {
  open: boolean;
  /** Play the closing animation (skipped when a link was chosen, so the scroll starts at once). */
  animate: boolean;
  returnFocus: boolean;
}

interface MobileMenuProps {
  state: MenuState;
  onClose: (animate?: boolean, returnFocus?: boolean) => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}

/** Full-screen menu for narrow layouts. Behaves as a modal dialog: the page behind is inert. */
export function MobileMenu({ state, onClose, toggleRef }: MobileMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const background = [document.querySelector('main'), document.querySelector('footer')];
    const animate = motionEnabled();
    tween.current?.kill();

    if (state.open) {
      el.hidden = false;
      background.forEach((node) => { if (node) node.inert = true; });
      document.body.classList.add('menu-open');
      stopSmoothScroll();
      if (animate) {
        tween.current = gsap.fromTo(el, { clipPath: 'circle(0% at 92% 4%)' }, { clipPath: 'circle(150% at 92% 4%)', duration: 0.8, ease: 'expo.out' });
        gsap.fromTo(el.querySelectorAll('.menu-links a'), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.1 });
        gsap.fromTo(el.querySelectorAll('.menu-cta, .menu-note'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 0.35 });
      }
      el.querySelector<HTMLAnchorElement>('a')?.focus();
      return;
    }

    if (el.hidden) return;
    background.forEach((node) => { if (node) node.inert = false; });
    document.body.classList.remove('menu-open');
    resumeSmoothScroll();
    if (animate && state.animate) {
      tween.current = gsap.to(el, { clipPath: 'circle(0% at 92% 4%)', duration: 0.5, ease: 'expo.in', onComplete: () => { el.hidden = true; } });
    } else {
      el.hidden = true;
    }
    if (state.returnFocus) toggleRef.current?.focus();
  }, [state, toggleRef]);

  const go = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const hash = event.currentTarget.getAttribute('href') ?? '#top';
    // Release the page now (not in the next effect), so the scroll and focus below can happen
    [document.querySelector('main'), document.querySelector('footer')].forEach((node) => { if (node) node.inert = false; });
    document.body.classList.remove('menu-open');
    resumeSmoothScroll();
    onClose(false, false);
    scrollToHash(hash);
  };

  return (
    <div className="menu-overlay" id="menu" ref={ref} role="dialog" aria-modal="true" aria-label={menu.label} data-lenis-prevent hidden>
      <nav aria-label={menu.label}>
        <ul className="menu-links">
          {nav.map((item) => (
            <li key={item.id}><a href={`#${item.id}`} onClick={go}>{item.label}</a></li>
          ))}
          <li><a href={demo.href}>{demo.hero}</a></li>
        </ul>
        <a className="btn btn-gold menu-cta" href="#warteliste" onClick={go}>{cta.waitlist}</a>
        <p className="menu-note">{menu.note}</p>
      </nav>
    </div>
  );
}
