import { useEffect, useState } from 'react';
import { stickyCta } from '../content';
import '../styles/sections/sticky-cta.css';

/** Phones only: a floating ink pill with the closing line and the yellow waitlist button, once the hero is out of
    view; hidden again from the two doors on (each tile has its own «Auf die Warteliste» button, and on the ink firm
    tile an ink pill would have no body of its own), near the waitlist and the footer. */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('top');
    const doors = document.getElementById('fuer-wen');
    const waitlist = document.getElementById('warteliste');
    const footer = document.querySelector('footer');
    if (!hero || !waitlist || !('IntersectionObserver' in window)) return;
    let heroVisible = true;
    let doorsVisible = false;
    let waitlistVisible = false;
    let footerVisible = false;
    const update = () => setShow(!heroVisible && !doorsVisible && !waitlistVisible && !footerVisible);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === hero) heroVisible = e.isIntersecting;
        if (e.target === doors) doorsVisible = e.isIntersecting;
        if (e.target === waitlist) waitlistVisible = e.isIntersecting;
        if (e.target === footer) footerVisible = e.isIntersecting;
      });
      update();
    });
    io.observe(hero);
    if (doors) io.observe(doors);
    io.observe(waitlist);
    if (footer) io.observe(footer);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`sticky-cta${show ? ' is-shown' : ''}`} aria-hidden={!show}>
      <p>{stickyCta.text}</p>
      <a className="btn btn-sm btn-gelb" href="#warteliste" tabIndex={show ? 0 : -1}>{stickyCta.button}</a>
    </div>
  );
}
