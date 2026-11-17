import { useEffect, useRef, useState, type MouseEvent } from 'react';
import wordmarkLight from '../assets/wordmark-light.svg';
import wordmarkDark from '../assets/wordmark-dark.svg';
import { cta, menu, nav } from '../content';
import { siteHref } from '../lib/links';
import { motionEnabled } from '../lib/motion';
import { MobileMenu } from './MobileMenu';
import { useAlbum } from './Album';
import { Icon } from './kit/Icon';
import { STICKER_IDS } from './kit/Sticker';
import '../styles/sections/header.css';

/** Landing page header. Plain full-width bar: transparent on the parquet hero with the ink wordmark, solid parquet
    with a hairline after 80 px, solid ink with the parquet wordmark while an ink band (every element marked
    `data-header-dark`: the word band, the footer) runs under it. Over the blue, red and yellow bands it stays the
    parquet bar (a decision: one calm bar, the colour belongs to the bands). The nav links to the topic pages (content.ts → nav,
    shared with PageHeader on the static pages); the landing page itself is not in it, so no item is current here. */
export function Header() {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [solid, setSolid] = useState(false);
  const [dark, setDark] = useState(false);
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

    // The solid bar takes the colour of what lies directly below it: ink while an ink band crosses the bar's lower
    // edge, the page surface otherwise. So it joins a band the moment the band reaches it and lets go the moment the
    // band has passed (never an ink bar over parquet or a parquet bar over ink). The observed strip is the 1 px line
    // at the bar's lower edge.
    const darkZones = [...document.querySelectorAll<HTMLElement>('[data-header-dark]')];
    const underBar = new Map<Element, boolean>();
    let darkIo: IntersectionObserver | undefined;
    const buildDark = () => {
      darkIo?.disconnect();
      const barH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      darkIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => underBar.set(entry.target, entry.isIntersecting));
        setDark(darkZones.some((el) => underBar.get(el)));
      }, { rootMargin: `${-Math.round(barH)}px 0px ${-Math.max(0, window.innerHeight - Math.round(barH) - 1)}px 0px` });
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

  // Sticker album (Easter egg): the chip shows how many of the six stickers have been found. A pointer extra, so it
  // is hidden from assistive technology and skipped by Tab; it scrolls to the album without moving focus there.
  const found = useAlbum().length;
  const toAlbum = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById('album')?.scrollIntoView({ behavior: motionEnabled() ? 'smooth' : 'auto', block: 'center' });
  };

  const isSolid = (solid && !dark) || menuOpen;
  const isDark = solid && dark && !menuOpen;

  return (
    <>
      <span ref={sentinelRef} className="header-sentinel" aria-hidden="true" />
      <header className={`site-header${isSolid ? ' is-solid' : ''}${isDark ? ' is-dark' : ''}`}>
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="Sponsuno, zum Seitenanfang">
            <img className="brand-on-light" src={wordmarkDark} alt="" width={141} height={24} />
            {/* Hidden until the bar turns ink: low priority, so React does not preload it with the first screen */}
            <img className="brand-on-dark" src={wordmarkLight} alt="" width={141} height={24} fetchPriority="low" />
          </a>
          <nav className="main-nav" aria-label="Hauptnavigation">
            <ul>
              {nav.map((item) => (
                <li key={item.href}><a href={siteHref(item.href, true)}>{item.label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="header-actions">
            {found > 0 && (
              <a className="tstk album-chip" data-tone="gelb" href="#album" aria-hidden="true" tabIndex={-1} onClick={toAlbum}>
                <Icon name="stern" size={14} />
                <span className="album-chip-n" key={found}>{found}/{STICKER_IDS.length}</span>
              </a>
            )}
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
