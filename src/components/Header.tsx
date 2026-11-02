import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import logoDark from '../assets/Sponsuno_Logo_dunkel.svg';
import { cta, demo, menu, nav, type SectionId } from '../content';
import { MobileMenu, type MenuState } from './MobileMenu';

/** Floating glass pill: sliding gold marker on the active section, scroll progress, hides while scrolling down. */
export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<SectionId | null>(null);
  const [menuState, setMenuState] = useState<MenuState>({ open: false, animate: true, returnFocus: false });
  const menuOpenRef = useRef(false);
  menuOpenRef.current = menuState.open;

  // Scroll: progress, hide/show and scroll spy. Classes are set directly to avoid a render per frame.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const sections = nav.map((item) => document.getElementById(item.id));
    let lastY: number | null = null;
    let anchorY = 0;
    let direction = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      header.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : '0');
      header.classList.toggle('is-scrolled', y > 10);

      // Hide after 40px of scrolling down, show after 40px up. Jumps (anchors, reloads) never hide it.
      const focusInside = header.contains(document.activeElement);
      if (lastY === null || Math.abs(y - lastY) > 300) {
        anchorY = y;
        header.classList.remove('is-hidden');
      } else {
        const dir = Math.sign(y - lastY);
        if (dir && dir !== direction) { direction = dir; anchorY = lastY; }
        if (y <= 520 || menuOpenRef.current || focusInside || anchorY - y > 40) header.classList.remove('is-hidden');
        else if (y - anchorY > 40) header.classList.add('is-hidden');
      }
      lastY = y;

      const line = window.innerHeight * 0.4;
      let current: SectionId | null = null;
      sections.forEach((section, i) => {
        if (section && section.getBoundingClientRect().top <= line) current = nav[i].id;
      });
      const last = sections[sections.length - 1];
      if (last && last.getBoundingClientRect().bottom < line) current = null;
      setActive((prev) => (prev === current ? prev : current));
    };

    const onFocusIn = () => header.classList.remove('is-hidden');
    window.addEventListener('scroll', onScroll, { passive: true });
    header.addEventListener('focusin', onFocusIn);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      header.removeEventListener('focusin', onFocusIn);
    };
  }, []);

  // Slide the gold marker under the active link
  const placeIndicator = useCallback(() => {
    const indicator = indicatorRef.current;
    const link = active ? listRef.current?.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
    if (!indicator) return;
    if (!link) { indicator.classList.remove('is-on'); return; }
    indicator.style.left = `${link.offsetLeft}px`;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.classList.add('is-on');
  }, [active]);
  useLayoutEffect(placeIndicator, [placeIndicator]);
  useEffect(() => {
    window.addEventListener('resize', placeIndicator);
    return () => window.removeEventListener('resize', placeIndicator);
  }, [placeIndicator]);

  // Menu: Escape closes it, and it closes itself when the layout switches to desktop
  const closeMenu = useCallback((animate = true, returnFocus = true) => {
    setMenuState((s) => (s.open ? { open: false, animate, returnFocus } : s));
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    const mq = window.matchMedia('(min-width: 1021px)');
    const onMq = () => { if (mq.matches) closeMenu(false, false); };
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [closeMenu]);

  return (
    <>
      <header className="site-header" ref={headerRef}>
        <div className="header-pill">
          <a className="brand" href="#top" aria-label="Sponsuno, zum Seitenanfang">
            <img src={logoDark} alt="Sponsuno" width={146} height={34} />
          </a>
          <nav className="main-nav" aria-label="Hauptnavigation">
            <ul ref={listRef}>
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={active === item.id ? 'is-active' : undefined}
                    aria-current={active === item.id ? 'location' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li><a href={demo.href} className="nav-demo">{demo.nav}</a></li>
            </ul>
            <span className="nav-indicator" ref={indicatorRef} aria-hidden="true" />
          </nav>
          <a className="btn btn-gold btn-shine nav-cta" href="#warteliste">
            <span className="nav-cta-long">{cta.waitlist}</span>
            <span className="nav-cta-short">{cta.waitlistShort}</span>
          </a>
          <button
            ref={toggleRef}
            className="nav-toggle"
            type="button"
            aria-expanded={menuState.open}
            aria-controls="menu"
            onClick={() => (menuState.open ? closeMenu() : setMenuState({ open: true, animate: true, returnFocus: false }))}
          >
            <span className="visually-hidden">{menuState.open ? menu.close : menu.open}</span>
            <span className="nav-toggle-bars" aria-hidden="true" />
          </button>
          <span className="header-progress" aria-hidden="true" />
        </div>
      </header>
      <MobileMenu state={menuState} onClose={closeMenu} toggleRef={toggleRef} />
    </>
  );
}
