// Data model of the clickable demo. Everything here is fictional (see data.ts).

export type Region =
  | 'Zürcher Oberland' | 'Winterthur' | 'Zürich' | 'Bern' | 'Luzern' | 'St. Gallen' | 'Basel' | 'Graubünden';

/** The four kinds of support Sponsuno plans to broker. */
export type SupportKind = 'Geld' | 'Material' | 'Dienstleistung' | 'Infrastruktur';

export type ProfileKind = 'athlete' | 'sportverein' | 'kulturverein';

/** Athlete or club looking for sponsors. */
export interface SeekerProfile {
  id: string;
  kind: ProfileKind;
  name: string;
  /** Sport or cultural discipline, e.g. "Langstrecken-Mountainbike", "Blasmusik". */
  discipline: string;
  region: Region;
  bio: string;
  needs: SupportKind[];
  /** Industries the seeker would like to work with. */
  preferredIndustries: string[];
  /** Yearly support sought, CHF. */
  budget: { min: number; max: number };
  /** Counter-services the seeker can offer. */
  offers: string[];
  /** Reach, shown as plain facts (fictional). */
  reach: { label: string; value: string }[];
}

/** Company that wants to sponsor. */
export interface Sponsor {
  id: string;
  name: string;
  industry: string;
  region: Region;
  about: string;
  offers: SupportKind[];
  /** Yearly budget for a single partnership, CHF. */
  budget: { min: number; max: number };
  /** What the sponsor wants out of it. */
  goals: string[];
  /** Disciplines the sponsor is interested in. */
  interests: string[];
  /** Short contact role, never a real person. */
  contact: string;
}

export type CriterionKey = 'region' | 'support' | 'industry' | 'budget';
export type CriterionState = 'match' | 'partial' | 'miss';

export interface Criterion {
  key: CriterionKey;
  label: string;
  state: CriterionState;
  /** One plain sentence explaining the state. */
  detail: string;
}

export interface MatchResult {
  sponsorId: string;
  seekerId: string;
  criteria: Criterion[];
  /** Number of criteria in state "match" (0–4). Partial counts as half for sorting only. */
  score: number;
  sortValue: number;
}

export type PartnershipStatus = 'anfrage' | 'gespraech' | 'vereinbart' | 'aktiv' | 'abgeschlossen';

export interface Deliverable {
  id: string;
  text: string;
  /** ISO date */
  due: string;
  done: boolean;
}

export interface Partnership {
  id: string;
  sponsorId: string;
  seekerId: string;
  status: PartnershipStatus;
  /** ISO dates */
  start: string;
  end: string;
  support: { kind: SupportKind; description: string; valueChf: number };
  deliverables: Deliverable[];
  /** Date both sides look back at the partnership ("Gemeinsam prüfen"). */
  reviewDate: string;
  goals: string[];
  notes: string;
}

export type DraftType = 'anfrage' | 'update' | 'verlaengerung' | 'dank';
export type DraftStatus = 'entwurf' | 'geprueft' | 'versendet';

export interface Draft {
  id: string;
  type: DraftType;
  sponsorId: string;
  subject: string;
  body: string;
  status: DraftStatus;
  /** ISO date-time */
  updatedAt: string;
}

export interface Reminder {
  id: string;
  /** ISO date */
  date: string;
  text: string;
  /** Hash route to open, e.g. "#/partnerschaften/p1" */
  href: string;
  done: boolean;
}

export type Role = 'seeker' | 'sponsor';

export interface DemoState {
  role: Role;
  /** The signed-in seeker (persona) and sponsor. */
  seekerId: string;
  sponsorId: string;
  seekers: SeekerProfile[];
  sponsors: Sponsor[];
  partnerships: Partnership[];
  drafts: Draft[];
  reminders: Reminder[];
  /** Sponsor ids the seeker shortlisted or hid. */
  shortlist: string[];
  hidden: string[];
  /** Seeker ids the sponsor marked as interesting. */
  sponsorShortlist: string[];
}
