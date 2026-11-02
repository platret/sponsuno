import { useEffect, useState } from 'react';
import type { Role } from './content';
import { scrollToHash, startSmoothScroll } from './lib/motion';
import { useScrollReveals } from './hooks/useScrollReveals';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Ribbon } from './components/Ribbon';
import { Problems } from './components/Problems';
import { Steps } from './components/Steps';
import { Audiences } from './components/Audiences';
import { AiManager } from './components/AiManager';
import { Support } from './components/Support';
import { Pricing } from './components/Pricing';
import { Faq } from './components/Faq';
import { Waitlist } from './components/Waitlist';
import { Footer } from './components/Footer';

export default function App() {
  const [role, setRole] = useState<Role>('athlete');

  useEffect(() => startSmoothScroll(), []);
  useScrollReveals();

  // In-page links scroll smoothly below the floating header. Handlers that already
  // dealt with a click (e.g. the mobile menu) call preventDefault and are skipped here.
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
        <Hero />
        <Ribbon />
        <Problems />
        <Steps />
        <Audiences onChooseRole={setRole} />
        <AiManager />
        <Support />
        <Pricing />
        <Faq />
        <Waitlist role={role} onRoleChange={setRole} />
      </main>
      <Footer />
    </>
  );
}
