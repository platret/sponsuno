import { useEffect, useState } from 'react';
import { waitlist, type Role } from './content';
import { observeReveals, scrollToHash } from './lib/motion';
import { MOVED_SECTIONS, pageHref, ROLE_PARAM } from './lib/links';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Story } from './components/Story';
import { ProofLine } from './components/ProofLine';
import { Audience } from './components/Audience';
import { HowItWorks } from './components/HowItWorks';
import { Waitlist } from './components/Waitlist';
import { Footer } from './components/Footer';
import { StickyCta } from './components/StickyCta';

/**
 * The landing page: hero, scroll story, proof line, audience ("two doors"), how it works, waitlist. KI-Manager,
 * Kosten, Fragen and Team moved to their own static pages (InfoPage.tsx), reached from the header.
 */
export default function App() {
  const [role, setRole] = useState<Role>('athlete');

  // Old links to a section that now has its own page (/#kosten, /#fragen …) go to that page
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (Object.hasOwn(MOVED_SECTIONS, id)) window.location.replace(pageHref(MOVED_SECTIONS[id]));
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

  return (
    <>
      <a className="skip-link" href="#inhalt">Zum Inhalt springen</a>
      <Header />
      <main id="inhalt">
        <Hero onChooseRole={setRole} />
        <Story />
        <ProofLine />
        <Audience />
        <HowItWorks onChooseRole={setRole} />
        <Waitlist role={role} onRoleChange={setRole} />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
