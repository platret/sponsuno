// Line icons of the «Turnhalle» look: 24 px grid, 2 px stroke, round caps and joins, no fills, currentColor.
// One hand for the whole set; original drawings. Decorative (aria-hidden): the text next to an icon carries the meaning.
import '../../styles/kit.css';

const PATHS = {
  // a person: head and shoulders
  profil: 'M12 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8ZM4.5 20.5a7.5 7.5 0 0 1 15 0',
  // a list with three bullets
  liste: 'M9.5 6h10.5M9.5 12h10.5M9.5 18h10.5M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  // two hands meeting
  handschlag: 'M2.5 6.5v9M21.5 6.5v9M2.5 8l5-1.5 4.5 2 4.5-2 5 1.5M2.5 14.5l3.5 1 4.2 3.7a2 2 0 0 0 2.6 0l4.2-3.7 3.5-1M12 8.5l-3.2 3.3a1.6 1.6 0 0 0 2.3 2.2l2.4-2.3 3.3 3.5',
  // a map pin
  region: 'M12 21.5c-3.6-3.5-6.5-7.1-6.5-11a6.5 6.5 0 0 1 13 0c0 3.9-2.9 7.5-6.5 11ZM12 8a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5Z',
  // two coins
  budget: 'M9 3a6 6 0 1 0 0 12a6 6 0 1 0 0-12ZM15 9a6 6 0 1 1-6 6M9 6.8v4.4',
  // a shop front with an awning
  branche: 'M3 9.5L5 4h14l2 5.5M3 9.5a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0M4.5 13v7h15v-7M10 20v-4.5h4V20',
  // a gift box
  unterstuetzung: 'M3 7.5h18v4H3ZM4.5 11.5V20h15v-8.5M12 7.5V20M12 7.5C10.5 4 7.5 3.2 6.8 5c-.6 1.6 1.7 2.5 5.2 2.5ZM12 7.5C13.5 4 16.5 3.2 17.2 5c.6 1.6-1.7 2.5-5.2 2.5Z',
  // arrow right
  pfeil: 'M4.5 12h15M13.5 6l6 6-6 6',
  // arrow down
  'pfeil-unten': 'M12 4.5v15M6 13.5l6 6 6-6',
  // an envelope
  mail: 'M5 5.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2ZM3.5 8.5l8.5 5.5 8.5-5.5',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  // a five-point star
  stern: 'M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9Z',
  // a house
  haus: 'M3.5 11.5L12 4l8.5 7.5M5.5 10V20h13V10M10 20v-5.5h4V20',
  // a beamed pair of notes
  musik: 'M9.5 17.5V6L19 4v11.5M9.5 17.5a2.75 2.75 0 1 1-5.5 0a2.75 2.75 0 1 1 5.5 0ZM19 15.5a2.75 2.75 0 1 1-5.5 0a2.75 2.75 0 1 1 5.5 0Z',
  // the hall ball of the sticker set
  ball: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18ZM10.3 9.9c2.3-2.7 5.9-4.4 8.8-3.3M10.3 9.9c2.1 4.6 6.5 7.3 9.2 6.9M10.3 9.9c-2.5 2.1-5 5.9-4.4 8.8M10.3 9.9C8.4 8.2 5.7 7.4 3.4 9.1',
} as const;

export type IconName = keyof typeof PATHS;
export const ICON_NAMES = Object.keys(PATHS) as IconName[];

export type IconProps = {
  name: IconName;
  /** Width and height in px. Default 24 (the stroke scales with it: 2 px at 24). */
  size?: number;
  className?: string;
};

export function Icon({ name, size = 24, className }: IconProps) {
  return (
    <svg
      className={className ? `icn ${className}` : 'icn'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
