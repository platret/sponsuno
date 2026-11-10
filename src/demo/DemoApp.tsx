import { useEffect, useRef, useState } from 'react';
import logoDark from '../assets/Sponsuno_Logo_dunkel.svg';
import type { Role as WaitlistRole } from '../content';
import { href, navigate, useRoute, type RouteName } from './router';
import { useDemo } from './store';
import { Avatar, Icon, useToast, type IconName } from './ui';
import { profileKindLabel } from './format';
import type { Role } from './types';
import Overview from './views/Overview';
import Matches from './views/Matches';
import Partnerships from './views/Partnerships';
import Assistant from './views/Assistant';
import Profile from './views/Profile';
import SponsorCockpit from './views/SponsorCockpit';

/** short: label in the mobile tab bar, where five tabs share one row. */
interface NavItem { route: RouteName; label: string; short?: string; icon: IconName }

const NAV: Record<Role, NavItem[]> = {
  seeker: [
    { route: 'uebersicht', label: 'Übersicht', icon: 'home' },
    { route: 'partner', label: 'Passende Partner', short: 'Vorschläge', icon: 'match' },
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

/** Waitlist role preselected on the landing page (?rolle=, see App.tsx) for the perspective the visitor is viewing */
const WAITLIST_ROLE: Record<Role, WaitlistRole> = { seeker: 'athlete', sponsor: 'sponsor' };

/** Way back to the landing page waitlist: in the sidebar on wide screens, at the end of the view on narrow ones. */
function WaitlistCta({ role, className, tone }: { role: Role; className: string; tone: 'gold' | 'navy' }) {
  return (
    <div className={className}>
      <p>Sponsuno startet bald. Möchten Sie von Anfang an dabei sein?</p>
      <a className={`ui-btn ui-btn-md ui-btn-${tone}`} href={`../?rolle=${WAITLIST_ROLE[role]}#warteliste`}>Auf die Warteliste</a>
    </div>
  );
}

const ROLES: { role: Role; label: string }[] = [
  { role: 'seeker', label: 'Sportlerin' },
  { role: 'sponsor', label: 'Sponsor' },
];

/** Perspective switch: two toggle buttons (sidebar on wide screens, above the view on narrow ones). */
function RoleSwitch({ role, onChange, className }: { role: Role; onChange: (r: Role) => void; className?: string }) {
  return (
    <div className={`demo-role${className ? ` ${className}` : ''}`} role="group" aria-label="Ansicht wählen">
      {ROLES.map((r) => (
        <button key={r.role} type="button" aria-pressed={role === r.role} className="demo-role-btn" onClick={() => onChange(r.role)}>
          {r.label}
        </button>
      ))}
    </div>
  );
}

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

  // The URL decides the perspective: seeker-only views switch to the seeker role, the cockpit to the sponsor role.
  // Partnerschaften is shared and keeps the current role.
  useEffect(() => {
    const seekerOnly: RouteName[] = ['uebersicht', 'partner', 'ki-manager', 'profil'];
    if (seekerOnly.includes(route.name) && state.role !== 'seeker') dispatch({ type: 'setRole', role: 'seeker' });
    if (route.name === 'sponsor' && state.role !== 'sponsor') dispatch({ type: 'setRole', role: 'sponsor' });
  }, [route.name, state.role, dispatch]);

  // Empty hash: open the home view of the current role
  useEffect(() => {
    if (!window.location.hash) window.location.replace(href(HOME[state.role]));
  }, [state.role]);

  // New view: title, scroll to top, move focus to the main region for keyboard and screen reader users
  useEffect(() => {
    document.title = `${TITLES[route.name]} · Sponsuno Vorschau`;
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
    toast('Vorschau zurückgesetzt');
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

      <div className="demo-body">
        <div className="demo-banner" role="note">
          <p><strong>Vorschau mit Beispieldaten.</strong><span className="demo-banner-more"> Ihre Änderungen bleiben in diesem Browser, nichts wird gesendet.</span></p>
          <div className="demo-banner-actions">
            <button type="button" className="demo-banner-btn" onClick={reset} onBlur={() => setConfirmReset(false)}>
              <Icon name="reset" size={16} />
              {confirmReset
                ? <span>Wirklich zurücksetzen?</span>
                : <><span className="demo-banner-more">Vorschau zurücksetzen</span><span className="demo-banner-short">Zurücksetzen</span></>}
            </button>
            <a className="demo-banner-btn" href="../"><Icon name="arrowLeft" size={16} /><span>Startseite</span></a>
          </div>
        </div>

        <aside className="demo-sidebar" aria-label="Navigation der Vorschau">
          <a className="demo-brand" href={href(HOME[state.role])} aria-label="Sponsuno Vorschau, Startansicht">
            <img src={logoDark} alt="Sponsuno" width={132} height={31} />
            <span className="demo-brand-tag">Vorschau</span>
          </a>

          <RoleSwitch role={state.role} onChange={switchRole} />

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

          <WaitlistCta role={state.role} className="demo-waitlist" tone="gold" />

          <div className="demo-account">
            {state.role === 'seeker'
              ? <Avatar name={seeker.name} size={40} />
              : <Avatar name={sponsor.name} tone="gold" size={40} />}
            <div>
              <p className="demo-account-name">{state.role === 'seeker' ? seeker.name : sponsor.name}</p>
              <p className="demo-account-role">{state.role === 'seeker' ? profileKindLabel(seeker) : sponsor.industry}</p>
            </div>
          </div>
        </aside>

        <div className="demo-mobile-role">
          <span className="demo-mobile-role-label" aria-hidden="true">Ansicht</span>
          <RoleSwitch role={state.role} onChange={switchRole} className="demo-role-light" />
        </div>

        <main className="demo-main" id="demo-main" ref={mainRef} tabIndex={-1}>
          {view}
          <WaitlistCta role={state.role} className="demo-waitlist-end" tone="navy" />
        </main>
      </div>

      <nav className="demo-tabbar" aria-label="Hauptbereiche (mobil)">
        {nav.map((item) => (
          <a key={item.route} href={href(item.route)} className={isActive(item) ? 'is-active' : undefined} aria-current={isActive(item) ? 'page' : undefined}>
            <Icon name={item.icon} />
            <span>{item.short ?? item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
