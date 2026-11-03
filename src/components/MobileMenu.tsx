import { useEffect, useRef, type MouseEvent } from 'react';
import { cta, demo, menu, nav } from '../content';
import { scrollToHash } from '../lib/motion';

/** Full-height paper sheet under the header for narrow layouts. Modal: the page behind is inert. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const background = [document.querySelector('main'), document.querySelector('footer')];
    background.forEach((node) => { if (node) node.inert = open; });
    document.body.classList.toggle('menu-open', open);
    if (open) ref.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    return () => {
      background.forEach((node) => { if (node) node.inert = false; });
      document.body.classList.remove('menu-open');
    };
  }, [open]);

  const go = (event: MouseEvent<HTMLAnchorElement>) => {
    const hash = event.currentTarget.getAttribute('href') ?? '';
    if (!hash.startsWith('#')) { onClose(); return; }
    event.preventDefault();
    // Release the page first so the scroll target can take focus
    [document.querySelector('main'), document.querySelector('footer')].forEach((node) => { if (node) node.inert = false; });
    document.body.classList.remove('menu-open');
    onClose();
    scrollToHash(hash);
  };

  return (
    <div className="menu-sheet" id="menu" ref={ref} role="dialog" aria-modal="true" aria-label={menu.label} hidden={!open}>
      <nav aria-label={menu.label}>
        <ul className="menu-links">
          {nav.map((item) => <li key={item.id}><a href={`#${item.id}`} onClick={go}>{item.label}</a></li>)}
          <li><a href={demo.href} onClick={go}>{demo.link}</a></li>
        </ul>
        <a className="btn btn-navy menu-cta" href="#warteliste" onClick={go}>{cta.waitlist}</a>
      </nav>
    </div>
  );
}
