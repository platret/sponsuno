/**
 * The view module of each route (src/demo/views/<name>.tsx). Each view is its own chunk (JS and CSS): DemoApp.tsx
 * loads them from this map, and vite.config.ts uses it to let demo/index.html preload the chunk of the view the URL
 * opens, in parallel with the app instead of after it. Plain data without imports, so vite.config.ts can use it
 * (DemoApp.tsx checks that it covers every RouteName).
 */
export const VIEW_FILES = {
  uebersicht: 'Overview',
  partner: 'Matches',
  partnerschaften: 'Partnerships',
  'ki-manager': 'Assistant',
  profil: 'Profile',
  sponsor: 'SponsorCockpit',
} as const;
