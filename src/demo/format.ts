import { DEMO_TODAY } from './data';
import type { DraftStatus, DraftType, PartnershipStatus, ProfileKind } from './types';

const chf = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 });
const dateLong = new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
const dateShort = new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'short' });

/** "CHF 3’500" */
export const formatChf = (n: number) => `CHF ${chf.format(n)}`;
export const formatRange = (r: { min: number; max: number }) => `CHF ${chf.format(r.min)} bis ${chf.format(r.max)}`;
/** "20. November 2026" */
export const formatDate = (iso: string) => dateLong.format(new Date(`${iso.slice(0, 10)}T12:00:00`));
/** "20. Nov." */
export const formatDateShort = (iso: string) => dateShort.format(new Date(`${iso.slice(0, 10)}T12:00:00`));

/** Whole days from the demo's fixed today to `iso` (negative = past). */
export function daysUntil(iso: string): number {
  const a = new Date(`${DEMO_TODAY}T12:00:00`).getTime();
  const b = new Date(`${iso.slice(0, 10)}T12:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** "heute", "morgen", "in 18 Tagen", "vor 3 Tagen" */
export function relativeDays(iso: string): string {
  const d = daysUntil(iso);
  if (d === 0) return 'heute';
  if (d === 1) return 'morgen';
  if (d === -1) return 'gestern';
  if (d > 1) return d >= 14 ? `in ${Math.round(d / 7)} Wochen` : `in ${d} Tagen`;
  return `vor ${-d} Tagen`;
}

export const statusLabel: Record<PartnershipStatus, string> = {
  anfrage: 'Anfrage',
  gespraech: 'Im Gespräch',
  vereinbart: 'Vereinbart',
  aktiv: 'Aktiv',
  abgeschlossen: 'Abgeschlossen',
};

export const draftTypeLabel: Record<DraftType, string> = {
  anfrage: 'Anfrage',
  update: 'Update',
  verlaengerung: 'Verlängerung',
  dank: 'Dank',
};

export const draftStatusLabel: Record<DraftStatus, string> = {
  entwurf: 'Entwurf',
  geprueft: 'Geprüft',
  versendet: 'Versendet (simuliert)',
};

export const kindLabel: Record<ProfileKind, string> = {
  athlete: 'Sportlerin oder Sportler',
  sportverein: 'Sportverein',
  kulturverein: 'Kulturverein',
};

/** Initials for monogram avatars: "Velogeschäft Oberland" → "VO" */
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
