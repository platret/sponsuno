import { useEffect, useState } from 'react';
import type { Role } from './content';
import { observeReveals, scrollToHash } from './lib/motion';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProofLine } from './components/ProofLine';
import { Audience } from './components/Audience';
import { Problems } from './components/Problems';
import { HowItWorks } from './components/HowItWorks';
import { AiManager } from './components/AiManager';
import { Support } from './components/Support';
import { Pricing } from './components/Pricing';
import { Faq } from './components/Faq';
import { Team } from './components/Team';
import { Waitlist } from './components/Waitlist';
import { Footer } from './components/Footer';
import { StickyCta } from './components/StickyCta';

export default function App() {
  const [role, setRole] = useState<Role>('athlete');

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
        <ProofLine />
        <Audience />
        <Problems />
        <HowItWorks onChooseRole={setRole} />
        <AiManager />
        <Support />
        <Pricing />
        <Faq />
        <Team />
        <Waitlist role={role} onRoleChange={setRole} />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
