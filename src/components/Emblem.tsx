import { useEffect, useRef } from 'react';
import icon from '../assets/Sponsuno_Icon.svg';
import { motionEnabled } from '../lib/motion';

/**
 * 3D logo emblem. Three.js (and the scene) load only when the visitor scrolls near it.
 * The flat logo stays visible as a fallback until the canvas is live, or if WebGL fails.
 */
export function Emblem() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      import('../lib/emblem')
        .then(({ mountEmblem }) => {
          if (!cancelled) cleanup = mountEmblem(host, { reduceMotion: !motionEnabled() });
        })
        .catch((err) => console.warn('Emblem could not start:', err));
    }, { rootMargin: '900px 0px' });
    io.observe(host);
    return () => {
      cancelled = true;
      io.disconnect();
      cleanup?.();
    };
  }, []);

  return (
    <div className="emblem" ref={ref}>
      <img className="emblem-fallback" src={icon} alt="" width={200} height={200} loading="lazy" decoding="async" />
      <div className="emblem-halo" aria-hidden="true" />
    </div>
  );
}
