import { useEffect, useRef, useState } from 'react';
import logoDark from '../assets/Sponsuno_Logo_dunkel.svg';
import photo from '../assets/symbolbild-mtb-192.jpg';
import { href, navigate, useRoute, type RouteName } from './router';
import { useDemo } from './store';
import { Avatar, Button, Icon, useToast, type IconName } from './ui';
import { kindLabel } from './format';
import type { Role } from './types';
import Overview from './views/Overview';
import Matches from './views/Matches';
import Partnerships from './views/Partnerships';
import Assistant from './views/Assistant';
import Profile from './views/Profile';
import SponsorCockpit from './views/SponsorCockpit';

interface NavItem { route: RouteName; label: string; icon: IconName }

const NAV: Record<Role, NavItem[]> = {
  seeker: [
    { route: 'uebersicht', label: 'Übersicht', icon: 'home' },
    { route: 'partner', label: 'Passende Partner', icon: 'match' },
    { route: 'partnerschaften', label: 'Partnerschaften', icon: 'handshake' },
    { route: 'ki-manager', label: 'KI-Manager', icon: 'sparkles' },
    { route: 'profil', label: 'Profil', icon: 'user' },
  ],
  sponsor: [
    { route: 'sponsor', label: 'Cockpit', icon: 'building' },
    { route: 'partnerschaften', label: 'Partnerschaften', icon: 'handshake' },
  ],
};

const HOME: Record<Role, RouteName> = { seeker: 'uebersicht', sponsor: 'sponsor' };

const TITLES: Record<RouteName, string> = {
  uebersicht: 'Übersicht',
  partner: 'Passende Partner',
  partnerschaften: 'Partnerschaften',
  'ki-manager': 'KI-Manager',
  profil: 'Profil',
  sponsor: 'Cockpit',
};

export default function DemoApp() {
  const { state, dispatch, seeker, sponsor } = useDemo();
  const route = useRoute();
  const toast = useToast();
  const mainRef = useRef<HTMLElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const firstRender = useRef(true);

  // Empty hash: open the home view of the current role
  useEffect(() => {
    if (!window.location.hash) window.location.replace(href(HOME[state.role]));
  }, [state.role]);

  // New view: title, scroll to top, move focus to the main region for keyboard and screen reader users
  useEffect(() => {
    document.title = `${TITLES[route.name]} · Sponsuno Demo`;
    if (firstRender.current) { firstRender.current = false; return; }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [route.name, route.param]);

  const switchRole = (role: Role) => {
    if (role === state.role) return;
    dispatch({ type: 'setRole', role });
    navigate(HOME[role]);
  };

  const reset = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    dispatch({ type: 'reset' });
    setConfirmReset(false);
    navigate('uebersicht');
    toast('Demo zurückgesetzt');
  };

  const nav = NAV[state.role];
  const isActive = (item: NavItem) => item.route === route.name;

  const view = (() => {
    switch (route.name) {
      case 'uebersicht': return <Overview />;
      case 'partner': return <Matches />;
      case 'partnerschaften': return <Partnerships />;
      case 'ki-manager': return <Assistant />;
      case 'profil': return <Profile />;
      case 'sponsor': return <SponsorCockpit />;
    }
  })();

  return (
    <div className="demo">
      <a className="skip-link" href="#demo-main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>Zum Inhalt springen</a>

      <div className="demo-banner" role="note">
        <p><strong>Demo mit fiktiven Daten.</strong> So soll Sponsuno funktionieren. Ihre Änderungen bleiben nur in diesem Browser, nichts wird gesendet.</p>
        <div className="demo-banner-actions">
          <button type="button" className="demo-banner-btn" onClick={reset} onBlur={() => setConfirmReset(false)}>
            <Icon name="reset" size={16} />{confirmReset ? 'Wirklich zurücksetzen?' : 'Demo zurücksetzen'}
          </button>
          <a className="demo-banner-btn" href="../"><Icon name="arrowLeft" size={16} />Zur Startseite</a>
        </div>
      </div>

      <div className="demo-body">
        <aside className="demo-sidebar" aria-label="Demo-Navigation">
          <a className="demo-brand" href={href(HOME[state.role])} aria-label="Sponsuno Demo, Startansicht">
            <img src={logoDark} alt="Sponsuno" width={132} height={31} />
            <span className="demo-brand-tag">Demo</span>
          </a>

          <div className="demo-role" role="radiogroup" aria-label="Ansicht wählen">
            {(['seeker', 'sponsor'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={state.role === r}
                className="demo-role-btn"
                onClick={() => switchRole(r)}
              >
                {r === 'seeker' ? 'Sportlerin' : 'Sponsor'}
              </button>
            ))}
          </div>

          <nav aria-label="Hauptbereiche">
            <ul className="demo-nav">
              {nav.map((item) => (
                <li key={item.route}>
                  <a href={href(item.route)} className={isActive(item) ? 'is-active' : undefined} aria-current={isActive(item) ? 'page' : undefined}>
                    <Icon name={item.icon} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="demo-account">
            {state.role === 'seeker'
              ? <Avatar name={seeker.name} src={seeker.id === 'lea' ? photo : undefined} size={40} />
              : <Avatar name={sponsor.name} tone="gold" size={40} />}
            <div>
              <p className="demo-account-name">{state.role === 'seeker' ? seeker.name : sponsor.name}</p>
              <p className="demo-account-role">{state.role === 'seeker' ? kindLabel[seeker.kind] : sponsor.industry}</p>
            </div>
          </div>
        </aside>

        <main className="demo-main" id="demo-main" ref={mainRef} tabIndex={-1}>
          {view}
        </main>
      </div>

      <nav className="demo-tabbar" aria-label="Hauptbereiche (mobil)">
        {nav.map((item) => (
          <a key={item.route} href={href(item.route)} className={isActive(item) ? 'is-active' : undefined} aria-current={isActive(item) ? 'page' : undefined}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
        <Button variant="quiet" size="sm" className="demo-tabbar-role" onClick={() => switchRole(state.role === 'seeker' ? 'sponsor' : 'seeker')}>
          {state.role === 'seeker' ? 'Als Sponsor' : 'Als Sportlerin'}
        </Button>
      </nav>
    </div>
  );
}
