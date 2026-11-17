import { useEffect, useState } from 'react';
import { album, waitlist, type Role } from './content';
import { observeReveals, scrollToHash } from './lib/motion';
import { MOVED_SECTIONS, pageHref, ROLE_PARAM } from './lib/links';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Statement } from './components/Statement';
import { WordBand } from './components/WordBand';
import { Steps } from './components/Steps';
import { Doors } from './components/Doors';
import { Waitlist } from './components/Waitlist';
import { Footer } from './components/Footer';
import { StickyCta } from './components/StickyCta';
import { CourtLines } from './components/kit/CourtLines';

/**
 * The landing page («Turnhalle», November 2026), seven short blocks: header, hero, statement, word band, how it works
 * (three steps), the two doors, waitlist + footer. Kosten, Fragen and Team are static pages of their own
 * (InfoPage.tsx), reached from the header. Parked and not imported: Story, StoryArt, ProofLine, Audience, HowItWorks.
 * Two layers lie over and under the blocks: the page tape line (one court line behind the content from the hero down,
 * drawn with the scroll; styles at the end of header.css) and the Easter eggs (lib/eggs.ts, loaded when idle).
 */
export default function App() {
  const [role, setRole] = useState<Role>('athlete');

  // Old links to a section that now has its own page (/#kosten, /#fragen …) go to that page. In the build an inline
  // script in the head does this before the first paint (movedScript in entry-server.tsx); this covers dev and a hash
  // typed or followed on the open page.
  useEffect(() => {
    const redirect = () => {
      const id = window.location.hash.slice(1);
      if (Object.hasOwn(MOVED_SECTIONS, id)) window.location.replace(pageHref(MOVED_SECTIONS[id]));
    };
    redirect();
    window.addEventListener('hashchange', redirect);
    return () => window.removeEventListener('hashchange', redirect);
  }, []);

  // Entry points elsewhere (guides, demo) link to /?rolle=<role>#warteliste to preselect the waitlist role
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get(ROLE_PARAM);
    const preset = waitlist.roles.find((r) => r.value === wanted);
    if (preset) setRole(preset.value);
    // Drop the parameter so in-page links and a shared URL do not carry a stale role
    if (wanted === null) return;
    params.delete(ROLE_PARAM);
    const rest = params.toString();
    const { pathname, hash } = window.location;
    window.history.replaceState(window.history.state, '', `${pathname}${rest ? `?${rest}` : ''}${hash}`);
  }, []);

  // Reveals start once the app runs; the inline failsafe in index.html is no longer needed.
  useEffect(() => {
    window.clearTimeout(window.__revealFailsafe);
    return observeReveals();
  }, []);

  // In-page links scroll below the fixed header and move focus. Handlers that already dealt with
  // a click (e.g. the mobile menu) call preventDefault and are skipped here.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      const hash = link?.getAttribute('href');
      if (!hash || hash.length < 2) return;
      e.preventDefault();
      scrollToHash(hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Easter eggs (sticker album, dragging, «tor», the loop): their own chunk, fetched once the browser is idle, so
  // they never compete with the first screen. The page is complete without them.
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const load = () => {
      import('./lib/eggs')
        .then((eggs) => { if (!cancelled) cleanup = eggs.initEggs(album.goal); })
        .catch(() => { /* optional layer: a failed fetch changes nothing on the page */ });
    };
    const idle = typeof window.requestIdleCallback === 'function';
    const handle = idle ? window.requestIdleCallback(load, { timeout: 4000 }) : window.setTimeout(load, 1500);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(handle); else window.clearTimeout(handle);
      cleanup?.();
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#inhalt">Zum Inhalt springen</a>
      <Header />
      <main id="inhalt">
        {/* One line of tape down the hall floor, behind everything: it shows on the parquet blocks and runs under
            the ink band and the colour tiles. Placement and drawing: end of header.css. */}
        <div className="page-line" data-scroll="draw" aria-hidden="true">
          <div className="page-line-fit"><CourtLines variant="page" /></div>
        </div>
        <Hero onChooseRole={setRole} />
        <Statement />
        <WordBand />
        <Steps />
        <Doors onChooseRole={setRole} />
        <Waitlist role={role} onRoleChange={setRole} />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
