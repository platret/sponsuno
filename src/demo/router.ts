import { useSyncExternalStore } from 'react';

// Hash routing keeps the demo working on GitHub Pages without server rewrites: #/partner/velo

export type RouteName = 'uebersicht' | 'partner' | 'partnerschaften' | 'ki-manager' | 'profil' | 'sponsor';

export interface Route {
  name: RouteName;
  /** Optional id, e.g. a sponsor, partnership or draft id. */
  param?: string;
}

const ROUTES: RouteName[] = ['uebersicht', 'partner', 'partnerschaften', 'ki-manager', 'profil', 'sponsor'];

export function parseHash(hash: string): Route {
  const [name, param] = hash.replace(/^#\/?/, '').split('/');
  if (ROUTES.includes(name as RouteName)) return { name: name as RouteName, param: param ? decodeURIComponent(param) : undefined };
  return { name: 'uebersicht' };
}

export const href = (name: RouteName, param?: string) => `#/${name}${param ? `/${encodeURIComponent(param)}` : ''}`;

export function navigate(name: RouteName, param?: string) {
  window.location.hash = href(name, param);
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => '');
  return parseHash(hash);
}
