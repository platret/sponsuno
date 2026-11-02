import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { DEMO_TODAY, initialState, matchFor } from './data';
import { joinList } from './format';
import type { DemoState, Draft, DraftStatus, MatchResult, Partnership, PartnershipStatus, Reminder, Role, SeekerProfile, Sponsor } from './types';

// Demo state lives only in this browser (localStorage). Nothing is sent anywhere.
// Bump the version whenever the stored shape changes: older data is then dropped instead of crashing a view.
export const STORAGE_KEY = 'sponsuno-demo-v2';
const OLD_KEYS = ['sponsuno-demo-v1'];

export type Action =
  | { type: 'setRole'; role: Role }
  | { type: 'updateProfile'; patch: Partial<SeekerProfile> }
  | { type: 'toggleShortlist'; sponsorId: string }
  | { type: 'toggleHidden'; sponsorId: string }
  | { type: 'toggleSponsorShortlist'; seekerId: string }
  /** Seeker prepares a request: creates a draft to review. The partnership (state "anfrage") with partnershipId
   *  only appears once the draft is sent (simulated), see setDraftStatus. */
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

// Timestamps use the demo's fixed date (DEMO_TODAY) with the real time of day, so ordering stays consistent
const now = () => `${DEMO_TODAY}T${new Date().toTimeString().slice(0, 8)}`;

/** Request text, the same template as the KI-Manager's "Anfrage" (views/Assistant.tsx, generateDraft). */
function requestText(seeker: SeekerProfile, sponsor: Sponsor): Pick<Draft, 'subject' | 'body'> {
  const we = seeker.kind !== 'athlete';
  const I = (ich: string, wir: string) => (we ? wir : ich);
  const intro = we
    ? `Wir schreiben Ihnen für ${seeker.name} (${seeker.discipline}, Region ${seeker.region}).`
    : `Ich bin ${seeker.name} und trainiere in der Region ${seeker.region} (${seeker.discipline}).`;
  // Only claim an interest that really matches the discipline (the same check as matchInterest in the KI-Manager)
  const interest = sponsor.interests.find((i) => seeker.discipline.toLowerCase().includes(i.toLowerCase()));
  const goal = sponsor.goals[0];
  const offer = `was ${I('ich', 'wir')} anbieten ${I('kann', 'können')}`;
  const fit = interest
    ? `Sie interessieren sich für ${interest}, und Ihr Ziel «${goal}» passt zu dem, ${offer}:`
    : `Ihr Ziel «${goal}» passt zu dem, ${offer}:`;
  const offers = seeker.offers.slice(0, 3).map((t) => `– ${t}`).join('\n');
  const paragraphs = [
    intro,
    seeker.needs.length ? `Für die kommende Saison ${I('suche ich', 'suchen wir')} Unterstützung in Form von ${joinList(seeker.needs)}.` : '',
    goal && offers ? `${fit}\n${offers}` : '',
    `Hätten Sie in den nächsten Wochen Zeit für ein kurzes Gespräch? ${I('Ich komme', 'Wir kommen')} gerne bei Ihnen vorbei.`,
  ];
  return {
    subject: `Anfrage für eine Partnerschaft: ${seeker.discipline}`,
    body: ['Guten Tag', ...paragraphs.filter(Boolean), `Freundliche Grüsse\n${seeker.name}`].join('\n\n'),
  };
}

/** A sent request becomes a partnership in state "anfrage", unless one with this sponsor is still open. */
function partnershipFromRequest(state: DemoState, draft: Draft): Partnership | undefined {
  const seeker = state.seekers.find((s) => s.id === state.seekerId);
  const sponsor = state.sponsors.find((s) => s.id === draft.sponsorId);
  if (!seeker || !sponsor) return undefined;
  const open = state.partnerships.some((p) => p.seekerId === seeker.id && p.sponsorId === sponsor.id && p.status !== 'abgeschlossen' && p.status !== 'abgesagt');
  if (open) return undefined;
  const id = draft.partnershipId ?? `p-${draft.id}`;
  return {
    id,
    sponsorId: sponsor.id,
    seekerId: seeker.id,
    status: 'anfrage',
    start: '2027-03-01',
    end: '2027-10-31',
    support: { kind: seeker.needs.find((n) => sponsor.offers.includes(n)) ?? sponsor.offers[0], description: 'Noch zu vereinbaren', valueChf: 0 },
    deliverables: seeker.offers.slice(0, 2).map((text, i) => ({ id: `${id}-d${i + 1}`, text, due: '2027-05-31', done: false })),
    reviewDate: '2027-11-15',
    goals: sponsor.goals.slice(0, 2),
    notes: '',
  };
}

/** Reminders that repeat a deliverable or a status step follow the partnership they belong to. */
function syncReminders(reminders: Reminder[], p: Partnership): Reminder[] {
  return reminders.map((r) => {
    if (r.partnershipId !== p.id) return r;
    if (r.deliverableId) {
      const d = p.deliverables.find((x) => x.id === r.deliverableId);
      return d && d.done !== r.done ? { ...r, done: d.done } : r;
    }
    if (r.openWhile) {
      const done = !r.openWhile.includes(p.status);
      return done !== r.done ? { ...r, done } : r;
    }
    return r;
  });
}

/** Applies a change to one partnership and keeps its linked reminders in step. */
function withPartnership(state: DemoState, id: string, change: (p: Partnership) => Partnership): DemoState {
  const current = state.partnerships.find((p) => p.id === id);
  if (!current) return state;
  const next = change(current);
  return {
    ...state,
    partnerships: state.partnerships.map((p) => (p.id === id ? next : p)),
    reminders: syncReminders(state.reminders, next),
  };
}

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
      const draft: Draft = {
        id: action.draftId,
        type: 'anfrage',
        sponsorId: sponsor.id,
        ...requestText(seeker, sponsor),
        status: 'entwurf',
        updatedAt: now(),
        partnershipId: action.partnershipId,
      };
      return {
        ...state,
        drafts: [draft, ...state.drafts],
        shortlist: state.shortlist.includes(sponsor.id) ? state.shortlist : [...state.shortlist, sponsor.id],
        hidden: state.hidden.filter((id) => id !== sponsor.id),
      };
    }
    case 'setPartnershipStatus':
      return withPartnership(state, action.partnershipId, (p) => ({ ...p, status: action.status }));
    case 'toggleDeliverable':
      return withPartnership(state, action.partnershipId, (p) => ({
        ...p,
        deliverables: p.deliverables.map((d) => (d.id === action.deliverableId ? { ...d, done: !d.done } : d)),
      }));
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
    case 'setDraftStatus': {
      const draft = state.drafts.find((d) => d.id === action.draftId);
      if (!draft) return state;
      const drafts = state.drafts.map((d) => (d.id === draft.id ? { ...d, status: action.status, updatedAt: now() } : d));
      // Sending a request (simulated) is what makes it a request in Partnerschaften and in the sponsor cockpit
      const created = action.status === 'versendet' && draft.status !== 'versendet' && draft.type === 'anfrage'
        ? partnershipFromRequest(state, draft)
        : undefined;
      return created ? { ...state, drafts, partnerships: [...state.partnerships, created] } : { ...state, drafts };
    }
    case 'deleteDraft':
      return { ...state, drafts: state.drafts.filter((d) => d.id !== action.draftId) };
    case 'toggleReminder': {
      const reminder = state.reminders.find((r) => r.id === action.reminderId);
      if (!reminder) return state;
      // A reminder that repeats a deliverable ticks the deliverable too (and syncs back from there)
      if (reminder.partnershipId && reminder.deliverableId) {
        const toggled = withPartnership(state, reminder.partnershipId, (p) => ({
          ...p,
          deliverables: p.deliverables.map((d) => (d.id === reminder.deliverableId ? { ...d, done: !reminder.done } : d)),
        }));
        if (toggled !== state) return toggled;
      }
      return { ...state, reminders: state.reminders.map((r) => (r.id === reminder.id ? { ...r, done: !r.done } : r)) };
    }
    case 'reset':
      return initialState();
  }
}

/** Only what visitors can change is stored. Sponsors and the other profiles always come from data.ts. */
type Saved = Pick<DemoState, 'role' | 'partnerships' | 'drafts' | 'reminders' | 'shortlist' | 'hidden' | 'sponsorShortlist'> & { profile: SeekerProfile };

const toSaved = (s: DemoState): Saved => ({
  role: s.role,
  profile: s.seekers.find((x) => x.id === s.seekerId) ?? s.seekers[0],
  partnerships: s.partnerships,
  drafts: s.drafts,
  reminders: s.reminders,
  shortlist: s.shortlist,
  hidden: s.hidden,
  sponsorShortlist: s.sponsorShortlist,
});

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const hasKeys = (v: unknown, keys: string[]) => isObj(v) && keys.every((k) => v[k] !== undefined && v[k] !== null);
const listOf = (v: unknown, ok: (x: unknown) => boolean) => Array.isArray(v) && v.every(ok);
const isString = (x: unknown) => typeof x === 'string';

const okPartnership = (x: unknown) =>
  hasKeys(x, ['id', 'sponsorId', 'seekerId', 'status', 'start', 'end', 'support', 'deliverables', 'reviewDate', 'goals', 'notes'])
  && listOf((x as Record<string, unknown>).deliverables, (d) => hasKeys(d, ['id', 'text', 'due', 'done']))
  && listOf((x as Record<string, unknown>).goals, isString);
const okDraft = (x: unknown) => hasKeys(x, ['id', 'type', 'sponsorId', 'subject', 'body', 'status', 'updatedAt']);
const okReminder = (x: unknown) => hasKeys(x, ['id', 'date', 'text', 'href', 'done']);
const okProfile = (x: unknown) =>
  hasKeys(x, ['id', 'kind', 'name', 'discipline', 'region', 'bio', 'needs', 'preferredIndustries', 'budget', 'offers', 'reach'])
  && ['needs', 'preferredIndustries', 'offers'].every((k) => listOf((x as Record<string, unknown>)[k], isString))
  && listOf((x as Record<string, unknown>).reach, (r) => hasKeys(r, ['label', 'value']))
  && hasKeys((x as Record<string, unknown>).budget, ['min', 'max']);

function isSaved(v: unknown): v is Saved {
  return isObj(v)
    && (v.role === 'seeker' || v.role === 'sponsor')
    && okProfile(v.profile)
    && listOf(v.partnerships, okPartnership)
    && listOf(v.drafts, okDraft)
    && listOf(v.reminders, okReminder)
    && listOf(v.shortlist, isString)
    && listOf(v.hidden, isString)
    && listOf(v.sponsorShortlist, isString);
}

function load(): DemoState {
  const fresh = initialState();
  try {
    for (const key of OLD_KEYS) window.localStorage.removeItem(key);
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved: unknown = raw ? JSON.parse(raw) : null;
    if (!isSaved(saved) || saved.profile.id !== fresh.seekerId) return fresh;
    const seekers = fresh.seekers.map((s) => (s.id === saved.profile.id ? saved.profile : s));
    // Drop entries that point to sponsors or profiles no longer in data.ts
    const sponsorIds = new Set(fresh.sponsors.map((s) => s.id));
    const seekerIds = new Set(seekers.map((s) => s.id));
    return {
      ...fresh,
      role: saved.role,
      seekers,
      partnerships: saved.partnerships.filter((p) => sponsorIds.has(p.sponsorId) && seekerIds.has(p.seekerId)),
      drafts: saved.drafts.filter((d) => sponsorIds.has(d.sponsorId)),
      reminders: saved.reminders,
      shortlist: saved.shortlist.filter((id) => sponsorIds.has(id)),
      hidden: saved.hidden.filter((id) => sponsorIds.has(id)),
      sponsorShortlist: saved.sponsorShortlist.filter((id) => seekerIds.has(id)),
    };
  } catch {
    // Private mode, blocked storage or unreadable data: fall back to the fresh demo
    return fresh;
  }
}

/** Removes the stored demo state, e.g. from the error screen. */
export function clearStoredDemo() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing stored either
  }
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSaved(state)));
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
