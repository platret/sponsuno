import { useEffect, useRef, useState } from 'react';
import wordmarkLight from '../assets/wordmark-light.svg';
import wordmarkDark from '../assets/wordmark-dark.svg';
import { cta, menu, nav } from '../content';
import { pageHref } from '../lib/links';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';
import '../styles/sections/header.css';

/** Landing page header. Plain full-width bar: transparent at the top, solid navy while the hero and the story run
    under it, solid on the page surface once it reaches it (paper, or navy in the dark theme). The theme switch has no
    React state: the inline head script runs it (ThemeToggle.tsx). The nav links to the topic pages (content.ts → nav, shared
    with PageHeader on the static pages); the landing page itself is not in it, so no item is current here. */
export function Header() {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [solid, setSolid] = useState(false);
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // No scroll handler: IntersectionObservers only. The bar turns solid once the sentinel (80 px down the
  // page) has scrolled out above the viewport.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const sentinel = sentinelRef.current;
    const solidIo = new IntersectionObserver(([entry]) => {
      setSolid(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    if (sentinel) solidIo.observe(sentinel);

    // While the navy hero or the navy story runs under the bar, the solid bar stays navy (no paper strip over
    // the pinned stage); it turns paper once the light page reaches it. The band is the bar's own height.
    const darkZones = [document.getElementById('top'), document.getElementById('problem')].filter((el): el is HTMLElement => el !== null);
    const underBar = new Map<Element, boolean>();
    let darkIo: IntersectionObserver | undefined;
    const buildDark = () => {
      darkIo?.disconnect();
      const barH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      darkIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => underBar.set(entry.target, entry.isIntersecting));
        setDark(darkZones.some((el) => underBar.get(el)));
      }, { rootMargin: `0px 0px ${-Math.max(0, window.innerHeight - barH)}px 0px` });
      darkZones.forEach((el) => darkIo!.observe(el));
    };
    buildDark();
    let resizeTimer = 0;
    const onResize = () => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(buildDark, 150); };
    window.addEventListener('resize', onResize);

    return () => {
      solidIo.disconnect(); darkIo?.disconnect();
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) { setMenuOpen(false); toggleRef.current?.focus(); }
    };
    const mq = window.matchMedia('(min-width: 961px)');
    const onMq = () => { if (mq.matches) setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [menuOpen]);

  const isSolid = (solid && !dark) || menuOpen;
  const isDark = solid && dark && !menuOpen;

  return (
    <>
      <span ref={sentinelRef} className="header-sentinel" aria-hidden="true" />
      <header className={`site-header${isSolid ? ' is-solid' : ''}${isDark ? ' is-dark' : ''}`}>
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="Sponsuno, zum Seitenanfang">
            <img className="brand-on-dark" src={wordmarkLight} alt="" width={118} height={30} />
            {/* Hidden until the bar turns paper (light theme only): low priority, so React does not preload it with the first screen */}
            <img className="brand-on-light" src={wordmarkDark} alt="" width={118} height={30} fetchPriority="low" />
          </a>
          <nav className="main-nav" aria-label="Hauptnavigation">
            <ul>
              {nav.map((item) => (
                <li key={item.href}><a href={pageHref(item.href)}>{item.label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            <a className="btn btn-sm header-cta" href="#warteliste">
              <span className="header-cta-long">{cta.waitlist}</span>
              <span className="header-cta-short">{cta.waitlistShort}</span>
            </a>
            <button
              ref={toggleRef}
              className="menu-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="visually-hidden">{menuOpen ? menu.close : menu.open}</span>
              <span className="menu-toggle-bars" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
