// Durable Object `WaitlistGuard` (wrangler.jsonc → durable_objects, migrations): one instance for the whole site (name
// "global"), so its limits hold across every Cloudflare location and for a whole day. The Rate Limiting bindings only
// count per location and per minute; a script with many addresses or one victim's address gets past them.
//
// - DAILY_CAP: at most this many double opt-in requests to Brevo per UTC day. Above it the route answers 503
//   not_configured and the form switches to its e-mail route, so the Brevo quota and the sender's reputation are safe.
// - PER_ADDRESS_PER_DAY: at most this many confirmation e-mails to one address per UTC day. More get the same silent
//   success as a known address, so nobody can flood an inbox and nothing reveals the limit.
//
// Privacy: no e-mail address is stored. The Worker sends the SHA-256 of the lowercased address; the guard hashes it
// again with a random salt of the day and keeps only that and a counter. At the first request of a new UTC day it
// deletes everything (including the salt), so no entry lives longer than about a day.
//
// Plain, erasable TypeScript only (no `cloudflare:workers` import): `npm test` runs it in Node with type stripping. A class
// that does not extend DurableObject is a valid Durable Object with a fetch() handler.

/** Brevo's free plan sends 300 e-mails per day (team/warteliste-setup.md, step 1), and every confirmed sign-up costs
    two (confirmation and welcome e-mail). 140 leaves room for both plus a few mails sent by hand. */
export const DAILY_CAP = 140;
export const PER_ADDRESS_PER_DAY = 2;

export type Verdict = 'ok' | 'daily_cap' | 'address_limit';

/** The part of Durable Object storage the guard uses (DurableObjectStorage in production, a Map in tests). */
export interface GuardStorage {
  get<T>(key: string): Promise<T | undefined>;
  put(entries: Record<string, unknown>): Promise<void>;
  deleteAll(): Promise<void>;
}

interface DayState {
  day: string;
  salt: string;
  count: number;
}

export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomHex(bytes: number): string {
  return [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Counts one request for `addressHash` (hex SHA-256 of the lowercased address) unless a limit is reached. */
export async function admit(
  storage: GuardStorage,
  addressHash: string,
  now: number,
  cap: number = DAILY_CAP,
  perAddress: number = PER_ADDRESS_PER_DAY,
): Promise<Verdict> {
  const day = new Date(now).toISOString().slice(0, 10);
  let state = await storage.get<DayState>('day');
  if (!state || state.day !== day) {
    await storage.deleteAll();
    state = { day, salt: randomHex(16), count: 0 };
    await storage.put({ day: state });
  }
  if (state.count >= cap) return 'daily_cap';
  const key = `a:${await sha256(`${state.salt}:${addressHash}`)}`;
  const sent = (await storage.get<number>(key)) ?? 0;
  if (sent >= perAddress) return 'address_limit';
  await storage.put({ day: { ...state, count: state.count + 1 }, [key]: sent + 1 });
  return 'ok';
}

/** Minimal shape of DurableObjectState. */
interface GuardState {
  storage: GuardStorage;
  blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>;
}

export class WaitlistGuard {
  private readonly state: GuardState;

  constructor(state: GuardState) {
    this.state = state;
  }

  /** POST { hash } → { verdict }. Requests run one after another, so two sign-ups never read the same count. */
  async fetch(request: Request): Promise<Response> {
    const data: unknown = await request.json().catch(() => null);
    const hash = data && typeof data === 'object' ? (data as { hash?: unknown }).hash : undefined;
    if (typeof hash !== 'string' || !/^[0-9a-f]{64}$/.test(hash)) return new Response(null, { status: 400 });
    const verdict = await this.state.blockConcurrencyWhile(() => admit(this.state.storage, hash, Date.now()));
    return Response.json({ verdict });
  }
}
