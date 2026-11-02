import { useEffect, useRef } from 'react';
import { cta, footer } from '../content';
import { finePointer, gsap, motionEnabled, useGSAP } from '../lib/motion';

/** Footer with a full-width wordmark: letters rise with scroll, "uno" carries a gold sheen and a cursor light. */
export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!motionEnabled()) return;
    gsap.fromTo(wordmarkRef.current?.children ?? [], { yPercent: 55, opacity: 0 }, {
      yPercent: 0, opacity: 1, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: footerRef.current, start: 'top 85%', end: 'bottom bottom', scrub: 0.8 },
    });
  }, { scope: footerRef });

  useEffect(() => {
    const el = footerRef.current;
    const spans = [...(wordmarkRef.current?.querySelectorAll<HTMLElement>('.wm-a, .wm-b') ?? [])];
    if (!el || !motionEnabled() || !finePointer()) return;
    const onMove = (e: PointerEvent) => spans.forEach((s) => {
      const r = s.getBoundingClientRect();
      s.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      s.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    const onLeave = () => spans.forEach((s) => s.style.setProperty('--mx', '-50%'));
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <footer className="site-footer" ref={footerRef}>
      <div className="grain" aria-hidden="true" />
      <div className="container footer-top">
        <div className="footer-claim">
          <p className="footer-lead">{footer.lead}</p>
          <p className="footer-sub">{footer.sub}</p>
          <a className="btn btn-gold btn-shine" href="#warteliste">{cta.waitlist}</a>
        </div>
        <nav className="footer-cols" aria-label="Fusszeile">
          {footer.columns.map((col) => (
            <div key={col.title}>
              <p className="footer-head">{col.title}</p>
              <ul>
                {col.links.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}
              </ul>
            </div>
          ))}
        </nav>
        <a className="to-top" href="#top">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /></svg>
          <span className="visually-hidden">{footer.toTop}</span>
        </a>
      </div>

      <div className="footer-wordmark" ref={wordmarkRef} aria-hidden="true">
        <span className="wm-a">Spons</span><span className="wm-b">uno</span><span className="wm-dot" />
      </div>

      <div className="container footer-bottom">
        <p>{footer.copyright}</p>
        <p>{footer.program}</p>
      </div>
    </footer>
  );
}
