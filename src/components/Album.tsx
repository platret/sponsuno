import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { album } from '../content';
import { Sticker, STICKER_IDS, type StickerId, type Vars } from './kit/Sticker';

// Sticker album (Easter egg, brief «Turnhalle»): six stickers are on the landing page, each exactly once (hero ball,
// word band note, doors pennant and pretzel, waitlist start number, footer whistle); a click or tap on one collects it
// (lib/eggs.ts, a lazy chunk). What has been found lives in this module only: memory, gone with the next page load.
// No cookie, no localStorage, no sessionStorage (the Datenschutzerklärung says nothing is stored).
// The store is read by the album in the footer (below) and by the counter chip in the header (Header.tsx).

let found: readonly StickerId[] = [];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
const snapshot = () => found;

export const albumStore = {
  /** Adds a sticker to the album. Every id counts once; returns false if it was there already (a guard: each
      sticker is on the page once, and a collected one no longer takes clicks). */
  collect(id: StickerId): boolean {
    if (found.includes(id)) return false;
    found = [...found, id];
    listeners.forEach((listener) => listener());
    return true;
  },
};

/** The collected sticker ids, in the order they were found. Empty on the server and until the first find. */
export const useAlbum = (): readonly StickerId[] => useSyncExternalStore(subscribe, snapshot, snapshot);

/**
 * The album in the footer (#album): one quiet row. The label, the count and one line; beside them six small slots
 * that show a dashed outline until their sticker has been found (all upright: nothing in the album is tilted).
 * Prerendered empty; without the Easter-egg chunk it simply stays empty. A pointer extra, so the whole block is
 * hidden from assistive technology and holds nothing focusable. Styles: footer.css (alb-); the small motion of a
 * new sticker and of the finale in eggs.css (they can only happen once the chunk runs).
 * The finale is brief: the six stickers hop once, one after another, and the line changes. It waits until the full
 * album is on screen (.is-seen, one IntersectionObserver that exists only while a full album has not been seen):
 * the sixth sticker is usually found screens away from the footer.
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
        <p className="alb-head">
          <span className="label alb-title">{album.title}</span>
          <span className="alb-count display">
            <span className="alb-num" key={have.length}>{have.length}</span>
            <span className="alb-of">/{total}</span>
          </span>
        </p>
        <p className="alb-line">{full ? album.full : album.hint}</p>
      </div>
      <div className="alb-slots">
        {STICKER_IDS.map((id, i) => {
          const has = have.includes(id);
          return (
            <span className={`alb-slot${has ? ' is-found' : ''}`} key={id} style={{ '--k': i } as Vars}>
              <Sticker id={id} size={48} collectable={false} data-collected={has ? undefined : ''} />
            </span>
          );
        })}
      </div>
    </div>
  );
}
