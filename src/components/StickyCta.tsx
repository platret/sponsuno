import { useEffect, useState } from 'react';
import { stickyCta } from '../content';
import '../styles/sections/sticky-cta.css';

/** Phones only: a slim waitlist bar once the hero and the story are out of view, hidden again near the waitlist and footer. */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // The hero and the scroll story under it count as one opening block
    const hero = document.getElementById('top');
    const story = document.getElementById('problem');
    const waitlist = document.getElementById('warteliste');
    const footer = document.querySelector('footer');
    if (!hero || !waitlist || !('IntersectionObserver' in window)) return;
    let heroVisible = true;
    let storyVisible = false;
    let waitlistVisible = false;
    let footerVisible = false;
    const update = () => setShow(!heroVisible && !storyVisible && !waitlistVisible && !footerVisible);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === hero) heroVisible = e.isIntersecting;
        if (e.target === story) storyVisible = e.isIntersecting;
        if (e.target === waitlist) waitlistVisible = e.isIntersecting;
        if (e.target === footer) footerVisible = e.isIntersecting;
      });
      update();
    });
    io.observe(hero);
    io.observe(waitlist);
    if (story) io.observe(story);
    if (footer) io.observe(footer);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`sticky-cta${show ? ' is-shown' : ''}`} aria-hidden={!show}>
      <p>{stickyCta.text}</p>
      <a className="btn btn-sm btn-navy" href="#warteliste" tabIndex={show ? 0 : -1}>{stickyCta.button}</a>
    </div>
  );
}
