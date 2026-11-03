import { useEffect, useRef, useState } from 'react';
import wordmarkLight from '../assets/wordmark-light.svg';
import wordmarkDark from '../assets/wordmark-dark.svg';
import { cta, demo, menu, nav, type SectionId } from '../content';
import { MobileMenu } from './MobileMenu';
import '../styles/sections/header.css';

/** Plain full-width bar: transparent over the navy hero, solid paper once the page scrolls. */
export function Header() {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = nav.map((item) => document.getElementById(item.id));
    const onScroll = () => {
      setSolid(window.scrollY > 80);
      const line = window.innerHeight * 0.35;
      let current: SectionId | null = null;
      sections.forEach((section, i) => {
        const r = section?.getBoundingClientRect();
        if (r && r.top <= line && r.bottom > line) current = nav[i].id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  const isSolid = solid || menuOpen;

  return (
    <>
      <header className={`site-header${isSolid ? ' is-solid' : ''}`}>
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="Sponsuno, zum Seitenanfang">
            <img className="brand-on-dark" src={wordmarkLight} alt="" width={118} height={30} />
            <img className="brand-on-light" src={wordmarkDark} alt="" width={118} height={30} />
          </a>
          <nav className="main-nav" aria-label="Hauptnavigation">
            <ul>
              {nav.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined}>{item.label}</a>
                </li>
              ))}
              <li><a href={demo.href}>{demo.nav}</a></li>
            </ul>
          </nav>
          <div className="header-actions">
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
