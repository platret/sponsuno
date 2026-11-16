// Line icons of the input tiles (hero start frame and the story stage's "heute" picture): 16 px, drawn inline, stroked
// in the tile's text colour (.in-tile svg in hero.css). One set, so both pictures speak the same visual language.
const PATHS = {
  mail: 'M2.5 4.5h11v8h-11zM2.5 4.5 8 9l5.5-4.5',
  pdf: 'M4 1.5h5.5l3 3v10H4zM9.5 1.5v3h3M6 8.5h4.5M6 11h3',
  ask: 'M2.5 3.5h11v7.5H7l-3 2.5V11H2.5zM6.5 6a1.5 1.5 0 1 1 1.5 1.5V8.5',
  call: 'M5 2.5 6.5 5.5 5 6.5a7 7 0 0 0 4.5 4.5l1-1.5 3 1.5-.5 2.5a1 1 0 0 1-1 .5A10 10 0 0 1 2.5 4a1 1 0 0 1 .5-1z',
  clock: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 1 0 0-11zM8 5v3.25l2 1.25',
  pen: 'M10.5 2.5l3 3L6 13H3v-3zM9 4l3 3',
  chart: 'M2.5 13.5h11M4.5 11V8.5M8 11V4.5M11.5 11V7',
  open: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 1 0 0-11zM6.5 6.5A1.5 1.5 0 1 1 8 8v1M8 11v.25',
} as const;

export type IconName = keyof typeof PATHS;

export const InputIcon = ({ name }: { name: IconName }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d={PATHS[name]} /></svg>
);
