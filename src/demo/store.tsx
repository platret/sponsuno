import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { initialState, matchFor } from './data';
import type { DemoState, Draft, DraftStatus, MatchResult, Partnership, PartnershipStatus, Role, SeekerProfile, Sponsor } from './types';

// Demo state lives only in this browser (localStorage). Nothing is sent anywhere.
const STORAGE_KEY = 'sponsuno-demo-v1';

export type Action =
  | { type: 'setRole'; role: Role }
  | { type: 'updateProfile'; patch: Partial<SeekerProfile> }
  | { type: 'toggleShortlist'; sponsorId: string }
  | { type: 'toggleHidden'; sponsorId: string }
  | { type: 'toggleSponsorShortlist'; seekerId: string }
  /** Seeker asks a sponsor: creates a partnership in state "anfrage" plus a draft to review. Returns via draftId. */
  | { type: 'requestPartnership'; sponsorId: string; draftId: string; partnershipId: string }
  | { type: 'setPartnershipStatus'; partnershipId: string; status: PartnershipStatus }
  | { type: 'toggleDeliverable'; partnershipId: string; deliverableId: string }
  | { type: 'addDeliverable'; partnershipId: string; text: string; due: string }
  | { type: 'updateNotes'; partnershipId: string; notes: string }
  | { type: 'createDraft'; draft: Draft }
  | { type: 'updateDraft'; draftId: string; patch: Partial<Pick<Draft, 'subject' | 'body'>> }
  | { type: 'setDraftStatus'; draftId: string; status: DraftStatus }
  | { type: 'deleteDraft'; draftId: string }
  | { type: 'toggleReminder'; reminderId: string }
  | { type: 'reset' };

const now = () => new Date().toISOString().slice(0, 19);

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'setRole':
      return { ...state, role: action.role };
    case 'updateProfile':
      return { ...state, seekers: state.seekers.map((s) => (s.id === state.seekerId ? { ...s, ...action.patch } : s)) };
    case 'toggleShortlist':
      return {
        ...state,
        shortlist: state.shortlist.includes(action.sponsorId) ? state.shortlist.filter((id) => id !== action.sponsorId) : [...state.shortlist, action.sponsorId],
        hidden: state.hidden.filter((id) => id !== action.sponsorId),
      };
    case 'toggleHidden':
      return {
        ...state,
        hidden: state.hidden.includes(action.sponsorId) ? state.hidden.filter((id) => id !== action.sponsorId) : [...state.hidden, action.sponsorId],
        shortlist: state.shortlist.filter((id) => id !== action.sponsorId),
      };
    case 'toggleSponsorShortlist':
      return {
        ...state,
        sponsorShortlist: state.sponsorShortlist.includes(action.seekerId)
          ? state.sponsorShortlist.filter((id) => id !== action.seekerId)
          : [...state.sponsorShortlist, action.seekerId],
      };
    case 'requestPartnership': {
      const seeker = state.seekers.find((s) => s.id === state.seekerId);
      const sponsor = state.sponsors.find((s) => s.id === action.sponsorId);
      if (!seeker || !sponsor) return state;
      const partnership: Partnership = {
        id: action.partnershipId,
        sponsorId: sponsor.id,
        seekerId: seeker.id,
        status: 'anfrage',
        start: '2027-03-01',
        end: '2027-10-31',
        support: { kind: seeker.needs.find((n) => sponsor.offers.includes(n)) ?? sponsor.offers[0], description: 'Noch zu vereinbaren', valueChf: 0 },
        deliverables: seeker.offers.slice(0, 2).map((text, i) => ({ id: `${action.partnershipId}-d${i + 1}`, text, due: '2027-05-31', done: false })),
        reviewDate: '2027-11-15',
        goals: sponsor.goals.slice(0, 2),
        notes: '',
      };
      const draft: Draft = {
        id: action.draftId,
        type: 'anfrage',
        sponsorId: sponsor.id,
        subject: `Anfrage für eine Partnerschaft: ${seeker.discipline}`,
        body: `Guten Tag\n\nIch bin ${seeker.name} (${seeker.discipline}, ${seeker.region}) und suche für die nächste Saison Unterstützung in Form von ${seeker.needs.join(' und ')}.\n\nIhr Interesse an ${sponsor.interests[0]} und Ihr Ziel «${sponsor.goals[0]}» passen gut zu dem, was ich bieten kann: ${seeker.offers.slice(0, 3).join(', ')}.\n\nHätten Sie Zeit für ein kurzes Gespräch?\n\nFreundliche Grüsse\n${seeker.name}`,
        status: 'entwurf',
        updatedAt: now(),
      };
      return {
        ...state,
        partnerships: [...state.partnerships, partnership],
        drafts: [draft, ...state.drafts],
        shortlist: state.shortlist.includes(sponsor.id) ? state.shortlist : [...state.shortlist, sponsor.id],
      };
    }
    case 'setPartnershipStatus':
      return { ...state, partnerships: state.partnerships.map((p) => (p.id === action.partnershipId ? { ...p, status: action.status } : p)) };
    case 'toggleDeliverable':
      return {
        ...state,
        partnerships: state.partnerships.map((p) => p.id !== action.partnershipId ? p : {
          ...p,
          deliverables: p.deliverables.map((d) => (d.id === action.deliverableId ? { ...d, done: !d.done } : d)),
        }),
      };
    case 'addDeliverable':
      return {
        ...state,
        partnerships: state.partnerships.map((p) => p.id !== action.partnershipId ? p : {
          ...p,
          deliverables: [...p.deliverables, { id: `${p.id}-d${p.deliverables.length + 1}-${Date.now().toString(36)}`, text: action.text, due: action.due, done: false }],
        }),
      };
    case 'updateNotes':
      return { ...state, partnerships: state.partnerships.map((p) => (p.id === action.partnershipId ? { ...p, notes: action.notes } : p)) };
    case 'createDraft':
      return { ...state, drafts: [action.draft, ...state.drafts] };
    case 'updateDraft':
      return { ...state, drafts: state.drafts.map((d) => (d.id === action.draftId ? { ...d, ...action.patch, status: d.status === 'versendet' ? d.status : 'entwurf', updatedAt: now() } : d)) };
    case 'setDraftStatus':
      return { ...state, drafts: state.drafts.map((d) => (d.id === action.draftId ? { ...d, status: action.status, updatedAt: now() } : d)) };
    case 'deleteDraft':
      return { ...state, drafts: state.drafts.filter((d) => d.id !== action.draftId) };
    case 'toggleReminder':
      return { ...state, reminders: state.reminders.map((r) => (r.id === action.reminderId ? { ...r, done: !r.done } : r)) };
    case 'reset':
      return initialState();
  }
}

function load(): DemoState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState(), ...JSON.parse(raw) } as DemoState;
  } catch {
    // Private mode or blocked storage: fall back to the fresh demo
  }
  return initialState();
}

interface DemoContextValue {
  state: DemoState;
  dispatch: (action: Action) => void;
  seeker: SeekerProfile;
  sponsor: Sponsor;
  sponsorById: (id: string) => Sponsor | undefined;
  seekerById: (id: string) => SeekerProfile | undefined;
  /** Matches for the signed-in seeker, best first (hidden sponsors included; filter in the view). */
  matches: MatchResult[];
  /** Matches of every seeker for the signed-in sponsor, best first. */
  sponsorMatches: MatchResult[];
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable: the demo still works for this visit
    }
  }, [state]);

  const value = useMemo<DemoContextValue>(() => {
    const seeker = state.seekers.find((s) => s.id === state.seekerId) ?? state.seekers[0];
    const sponsor = state.sponsors.find((s) => s.id === state.sponsorId) ?? state.sponsors[0];
    const sponsorById = (id: string) => state.sponsors.find((s) => s.id === id);
    const seekerById = (id: string) => state.seekers.find((s) => s.id === id);
    const matches = state.sponsors.map((sp) => matchFor(seeker, sp)).sort((a, b) => b.sortValue - a.sortValue);
    const sponsorMatches = state.seekers.map((se) => matchFor(se, sponsor)).sort((a, b) => b.sortValue - a.sortValue);
    return { state, dispatch, seeker, sponsor, sponsorById, seekerById, matches, sponsorMatches };
  }, [state]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>');
  return ctx;
}

/** Short unique id for new drafts and partnerships. */
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
