import { useEffect, useRef } from 'react';
import { theme } from '../content';

/**
 * Light/dark switch in every header (Header on the landing page, PageHeader on the static pages). No React state and
 * no handler here: the inline head script (THEME_SCRIPT in lib/theme.ts) handles the click on [data-theme-toggle],
 * saves the choice and sets aria-pressed (so the label stays "Dunkles Design" and the pressed state says whether it is
 * on). Hidden by CSS until that script has run (site.css: html[data-theme] .theme-toggle). Moon in the light theme,
 * sun in the dark one.
 * Where React renders the button in the browser (landing page, dev), the script may have synced the switches before it
 * existed, so the effect copies the current state once on mount. It reads the attribute, it keeps no state.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.setAttribute('aria-pressed', String(document.documentElement.getAttribute('data-theme') === 'dark'));
  }, []);
  return (
    <button ref={ref} className={`theme-toggle ${className}`.trim()} type="button" data-theme-toggle="" aria-label={theme.toggle}>
      <svg className="theme-icon-moon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7Z" />
      </svg>
      <svg className="theme-icon-sun" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <circle cx="10" cy="10" r="3.5" />
        <path d="M10 1.75v2M10 16.25v2M1.75 10h2M16.25 10h2M4.17 4.17l1.41 1.41M14.42 14.42l1.41 1.41M4.17 15.83l1.41-1.41M14.42 5.58l1.41-1.41" />
      </svg>
    </button>
  );
}
