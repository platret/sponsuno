import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { album } from '../content';
import { Sticker, STICKER_IDS, type StickerId, type Vars } from './kit/Sticker';

// Sticker album (Easter egg, brief «Turnhalle»): six stickers are spread over the landing page; a click or tap on one
// collects it (lib/eggs.ts, a lazy chunk). What has been found lives in this module only: memory, gone with the next
// page load. No cookie, no localStorage, no sessionStorage (the Datenschutzerklärung says nothing is stored).
// The store is read by the album in the footer (below) and by the counter chip in the header (Header.tsx).

let found: readonly StickerId[] = [];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
const snapshot = () => found;

export const albumStore = {
  /** Adds a sticker to the album. Every id counts once; returns false if it was there already. */
  collect(id: StickerId): boolean {
    if (found.includes(id)) return false;
    found = [...found, id];
    listeners.forEach((listener) => listener());
    return true;
  },
};

/** The collected sticker ids, in the order they were found. Empty on the server and until the first find. */
export const useAlbum = (): readonly StickerId[] => useSyncExternalStore(subscribe, snapshot, snapshot);

/** How each sticker lies in its slot (degrees) */
const TILT = [-6, 5, -4, 7, -5, 4];

/** The loop sign (src/assets/loop.svg, same geometry), for the burst when the album is full */
const LOOP = 'M5 21.49L20.78 21.49L20.78 53.44C20.78 61.667 25.555 68.337 31.445 68.337C37.335 68.337 42.11 61.667 42.11 53.44L42.11 46.11L42.123 46.11C42.636 31.916 54.298 20.624 68.555 20.624C82.812 20.624 94.474 31.916 94.987 46.11L95 46.11L95 78.51L79.22 78.51L79.22 46.56C79.22 38.333 74.445 31.663 68.555 31.663C62.665 31.663 57.89 38.333 57.89 46.56L57.89 53.89L57.877 53.89C57.364 68.084 45.702 79.376 31.445 79.376C17.188 79.376 5.526 68.084 5.013 53.89L5 53.89Z';
/** Where each little loop of the burst flies to: x, y (in em of the burst) and its turn in degrees */
const BURST: [number, number, number][] = [
  [-9, -5, -40], [-5.5, -8, 25], [-2, -6, -15], [1.5, -9, 30], [5, -6.5, -25], [8.5, -8, 45], [-7, 3, 20], [7, 3.5, -30],
];

/** A handful of little loop signs that fly apart and fade (eggs.css, only with motion): the full album's burst, and
    the same one, smaller, on the header chip. Decoration inside aria-hidden parents. */
export function AlbumBurst() {
  return (
    <span className="alb-burst">
      {BURST.map(([x, y, turn], i) => (
        <svg
          key={i}
          viewBox="5 20.6 90 58.8"
          focusable="false"
          style={{ '--x': `${x}em`, '--y': `${y}em`, '--turn': `${turn}deg`, '--i': i } as Vars}
        >
          <path d={LOOP} />
        </svg>
      ))}
    </span>
  );
}

/**
 * The album in the footer (#album): the label, the count, one line, and six slots that show a dashed outline until
 * their sticker has been found. Prerendered empty; without the Easter-egg chunk it simply stays empty. A pointer
 * extra, so the whole block is hidden from assistive technology and holds nothing focusable. Styles: footer.css
 * (alb-), the burst and the pop of a new sticker in eggs.css (they can only happen once the chunk runs).
 * The finale (the six stickers hop one after another, the loop signs burst) waits until the full album is on
 * screen (.is-seen, one IntersectionObserver that exists only while a full album has not been seen): the sixth
 * sticker is always found screens away from the footer.
 */
export function Album() {
  const have = useAlbum();
  const total = STICKER_IDS.length;
  const full = have.length === total;
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!full || seen || !el) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) setSeen(true); }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [full, seen]);
  return (
    <div className={`alb${full ? ' is-full' : ''}${full && seen ? ' is-seen' : ''}`} id="album" aria-hidden="true" ref={ref}>
      <div className="alb-text">
        <p className="label alb-title">{album.title}</p>
        <p className="alb-count display">
          <span className="alb-num" key={have.length}>{have.length}</span>
          <span className="alb-of">/{total}</span>
        </p>
        <p className="alb-line">{full ? album.full : album.hint}</p>
      </div>
      <div className="alb-slots">
        {STICKER_IDS.map((id, i) => {
          const has = have.includes(id);
          return (
            <span className={`alb-slot${has ? ' is-found' : ''}`} key={id} style={{ '--k': i } as Vars}>
              <Sticker id={id} size={84} rotate={TILT[i]} collectable={false} data-collected={has ? undefined : ''} />
            </span>
          );
        })}
        {full && seen && <AlbumBurst />}
      </div>
    </div>
  );
}
