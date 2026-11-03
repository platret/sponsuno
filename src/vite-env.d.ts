/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL that accepts a JSON POST of { rolle, email }. Empty = waitlist form only previews success. */
  readonly VITE_WAITLIST_ENDPOINT?: string;
}

interface Window {
  __revealFailsafe?: number;
}
