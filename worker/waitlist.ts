// POST /api/warteliste: takes a waitlist sign-up from the form on the landing page (src/components/Waitlist.tsx) and
// asks Brevo to send the double opt-in e-mail (team/warteliste-setup.md, emails/README.md). Brevo adds the contact to
// the list only after the click on the confirmation link, then redirects to /warteliste/bestaetigt/.
//
// Dormant until the team has finished the Brevo setup: without the secret BREVO_API_KEY or the vars BREVO_LIST_ID and
// BREVO_DOI_TEMPLATE_ID (wrangler.jsonc) every valid request gets 503 { ok: false, reason: 'not_configured' }, and the
// form falls back to its e-mail route.
//
// Abuse limits, in this order: per-minute Rate Limiting bindings (per IP, IPv6 per /64, and per address), then the
// Durable Object WaitlistGuard (worker/guard.ts): a daily cap for the whole site and a daily limit per address.
//
// Privacy: no e-mail address is logged or stored here (Workers observability stays off). Rate limits and the guard get
// a SHA-256 hash of the address only (the guard salts it again per day and deletes it the next day).
//
// Plain, erasable TypeScript only (no enums, no parameter properties): `npm test` runs it in Node with type stripping.

import { sha256, type Verdict } from './guard.ts';

export const ROLES = ['athlete', 'sportverein', 'kulturverein', 'sponsor'] as const;
export type Role = (typeof ROLES)[number];

/** Where Brevo sends people after the click on the confirmation link (always the apex, also from PR previews). */
export const REDIRECT_URL = 'https://sponsuno.ch/warteliste/bestaetigt/';
export const BREVO_DOI_URL = 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation';
/** Brevo must answer within this time, or the sign-up fails with 502. */
export const BREVO_TIMEOUT_MS = 8000;
/** Largest accepted request body. A sign-up is well under 300 bytes. */
export const MAX_BODY_BYTES = 2048;

/** Minimal shape of a Cloudflare Rate Limiting binding (wrangler.jsonc → ratelimits). */
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface WaitlistEnv {
  /** Secret, set by the team only (wrangler secret put BREVO_API_KEY). Never in the repo. */
  BREVO_API_KEY?: string;
  /** Plain vars in wrangler.jsonc; empty until the team sends the IDs (setup doc, step 11). */
  BREVO_LIST_ID?: string;
  BREVO_DOI_TEMPLATE_ID?: string;
  /** Rate Limiting bindings; missing in previews and tests, then the in-memory limiter below is used. */
  WAITLIST_IP_LIMIT?: RateLimiter;
  WAITLIST_EMAIL_LIMIT?: RateLimiter;
  /** Durable Object namespace of WaitlistGuard (worker/guard.ts). Declared for production and previews in
      wrangler.jsonc; only the unit tests run without it, then the daily limits are skipped. */
  WAITLIST_GUARD?: GuardNamespace;
}

/** Minimal shape of a DurableObjectNamespace. */
export interface GuardNamespace {
  idFromName(name: string): unknown;
  get(id: unknown): { fetch(input: string, init?: RequestInit): Promise<Response> };
}

export type Reason =
  | 'method_not_allowed'
  | 'forbidden_origin'
  | 'unsupported_media_type'
  | 'too_large'
  | 'bad_request'
  | 'invalid_email'
  | 'invalid_rolle'
  | 'rate_limited'
  | 'not_configured'
  | 'upstream_error'
  | 'upstream_timeout'
  | 'not_found';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex',
};

export function json(status: number, body: { ok: true } | { ok: false; reason: Reason }, extra?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });
}

const fail = (status: number, reason: Reason, extra?: Record<string, string>) => json(status, { ok: false, reason }, extra);

// --- Origin ---

/**
 * Same-site check. Allowed: a page on the very host the request goes to (sponsuno.ch, a PR preview on workers.dev such
 * as `pr-12-sponsuno.<account>.workers.dev`, `wrangler dev`, which rewrites both to the route host), and sponsuno.ch and
 * www.sponsuno.ch themselves. No localhost exception: a dev server on another port could not call the route anyway (the
 * JSON POST needs a CORS preflight, which this route refuses). Requests without an Origin header (browsers always send
 * one with a POST) are refused. Together with JSON-only bodies this keeps other sites' pages out; it is no protection
 * against scripts, which can send any Origin: the rate limits and the guard handle those.
 */
export function allowedOrigin(origin: string | null, requestOrigin: string): boolean {
  if (!origin) return false;
  return origin === requestOrigin || origin === 'https://sponsuno.ch' || origin === 'https://www.sponsuno.ch';
}

// --- Input ---

/**
 * Simple, RFC-ish check, about as strict as the browser's type="email" plus a dotted ASCII domain with a TLD of at least
 * two letters (international domains arrive in their xn-- form from the browser). Brevo validates again.
 */
export function validEmail(email: string): boolean {
  if (email.length < 6 || email.length > 254) return false;
  const at = email.lastIndexOf('@');
  if (at < 1 || at > 64) return false;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  const labels = domain.split('.');
  if (labels.length < 2 || domain.length > 253) return false;
  if (!labels.every((label) => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label))) return false;
  return /^(?:[A-Za-z]{2,63}|xn--[A-Za-z0-9-]{1,59})$/.test(labels[labels.length - 1]);
}

export const validRole = (value: unknown): value is Role => typeof value === 'string' && (ROLES as readonly string[]).includes(value);

/** Reads at most `max` bytes of the body; null when it is longer. */
async function readBody(request: Request, max: number): Promise<string | null> {
  const declared = Number(request.headers.get('Content-Length') ?? '0');
  if (declared > max) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

type Fields = { email: string; rolle: string; website: string };

const field = (value: unknown): string => (typeof value === 'string' ? value : '');

/** JSON body → the three fields; null when the body is not a JSON object. */
function parseFields(text: string): Fields | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const record = data as Record<string, unknown>;
  return { email: field(record.email), rolle: field(record.rolle), website: field(record.website) };
}

// --- Configuration ---

/** A positive integer ID from a var, or null. */
function id(value: string | undefined): number | null {
  const trimmed = value?.trim() ?? '';
  if (!/^[1-9]\d{0,15}$/.test(trimmed)) return null;
  return Number(trimmed);
}

export interface BrevoConfig {
  apiKey: string;
  listId: number;
  templateId: number;
}

export function brevoConfig(env: WaitlistEnv): BrevoConfig | null {
  const apiKey = env.BREVO_API_KEY?.trim() ?? '';
  const listId = id(env.BREVO_LIST_ID);
  const templateId = id(env.BREVO_DOI_TEMPLATE_ID);
  if (!apiKey || listId === null || templateId === null) return null;
  return { apiKey, listId, templateId };
}

// --- Rate limits ---

/**
 * Fallback when a Rate Limiting binding is missing (PR previews, wrangler dev, tests): a fixed window per key in the
 * memory of one isolate. Weak on its own (isolates come and go, each Cloudflare location has its own), so the honeypot
 * and the bindings in production do the real work.
 */
export class MemoryLimiter implements RateLimiter {
  private readonly hits = new Map<string, { count: number; until: number }>();
  private readonly max: number;
  private readonly windowMs: number;
  private readonly now: () => number;

  constructor(max: number, windowMs: number, now: () => number = Date.now) {
    this.max = max;
    this.windowMs = windowMs;
    this.now = now;
  }

  async limit({ key }: { key: string }): Promise<{ success: boolean }> {
    const now = this.now();
    if (this.hits.size > 5000) {
      for (const [k, v] of this.hits) if (v.until <= now) this.hits.delete(k);
      if (this.hits.size > 5000) this.hits.clear();
    }
    const entry = this.hits.get(key);
    if (!entry || entry.until <= now) {
      this.hits.set(key, { count: 1, until: now + this.windowMs });
      return { success: true };
    }
    entry.count += 1;
    return { success: entry.count <= this.max };
  }
}

/** Same numbers as the bindings in wrangler.jsonc (period 60 s). */
export const IP_LIMIT = 10;
export const EMAIL_LIMIT = 3;
const memoryIp = new MemoryLimiter(IP_LIMIT, 60_000);
const memoryEmail = new MemoryLimiter(EMAIL_LIMIT, 60_000);

/**
 * Rate-limit key of a client address: IPv4 as is, IPv6 by its /64 prefix (one connection usually gets a whole /64, so
 * keying on the full address would give a single host a fresh key for every request).
 */
export function ipKey(ip: string | null): string {
  if (!ip) return 'ip:unknown';
  if (!ip.includes(':')) return `ip:${ip}`;
  const [head, tail = ''] = ip.toLowerCase().split('::');
  const left = head ? head.split(':') : [];
  const right = ip.includes('::') && tail ? tail.split(':') : [];
  // Only the first four groups matter, so an embedded IPv4 tail (64:ff9b::192.0.2.1) needs no special case.
  const groups = ip.includes('::') ? [...left, ...new Array<string>(Math.max(0, 8 - left.length - right.length)).fill('0'), ...right] : left;
  return `ip6:${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, '')).join(':')}::/64`;
}

/** False when the IP or the address has been used too often in the last minute (the latter stops mail bombing). */
async function withinLimits(request: Request, emailHash: string, env: WaitlistEnv): Promise<boolean> {
  const byIp = await (env.WAITLIST_IP_LIMIT ?? memoryIp).limit({ key: ipKey(request.headers.get('CF-Connecting-IP')) });
  if (!byIp.success) return false;
  const byEmail = await (env.WAITLIST_EMAIL_LIMIT ?? memoryEmail).limit({ key: `mail:${emailHash}` });
  return byEmail.success;
}

/** Daily limits of the Durable Object (worker/guard.ts); 'error' when it cannot be asked. */
async function askGuard(guard: GuardNamespace, emailHash: string): Promise<Verdict | 'error'> {
  try {
    const stub = guard.get(guard.idFromName('global'));
    const res = await stub.fetch('https://guard/admit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: emailHash }),
    });
    const answer = (await res.json()) as { verdict?: unknown };
    const verdict = answer.verdict;
    return verdict === 'ok' || verdict === 'daily_cap' || verdict === 'address_limit' ? verdict : 'error';
  } catch {
    return 'error';
  }
}

// --- Brevo ---

/** Brevo 400 codes that mean "this request or contact is already known" (duplicate_parameter, duplicate_request,
    "Request already processed"): answered like a success, so the form never tells anyone whether an address is already
    on the list. Kept narrow on purpose: a missing template or list must not look like a success. */
const ALREADY_KNOWN = /duplicate_parameter|duplicate_request|already/i;

async function askBrevo(config: BrevoConfig, email: string, rolle: Role, fetcher: typeof fetch): Promise<Response> {
  let res: Response;
  try {
    res = await fetcher(BREVO_DOI_URL, {
      method: 'POST',
      headers: { 'api-key': config.apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email,
        includeListIds: [config.listId],
        templateId: config.templateId,
        redirectionUrl: REDIRECT_URL,
        attributes: { ROLLE: rolle },
      }),
      signal: AbortSignal.timeout(BREVO_TIMEOUT_MS),
    });
  } catch (error) {
    const name = error instanceof Error ? error.name : '';
    return fail(502, name === 'TimeoutError' || name === 'AbortError' ? 'upstream_timeout' : 'upstream_error');
  }
  if (res.ok) return json(200, { ok: true });
  if (res.status === 400) {
    let code = '';
    try {
      const body = (await res.json()) as { code?: unknown; message?: unknown };
      code = `${field(body.code)} ${field(body.message)}`;
    } catch {
      // no JSON body: treat as an error below
    }
    if (ALREADY_KNOWN.test(code)) return json(200, { ok: true });
  } else {
    await res.body?.cancel();
  }
  // Status only, never the address: enough to see in `wrangler tail` that Brevo refused (key, IP lock, template).
  console.warn(`waitlist: Brevo answered ${res.status}`);
  return fail(502, 'upstream_error');
}

// --- Handler ---

export async function handleWaitlist(request: Request, env: WaitlistEnv, fetcher: typeof fetch = fetch): Promise<Response> {
  if (request.method !== 'POST') return fail(405, 'method_not_allowed', { Allow: 'POST' });
  if (!allowedOrigin(request.headers.get('Origin'), new URL(request.url).origin)) return fail(403, 'forbidden_origin');

  // JSON only: a cross-site browser request with this type always needs a CORS preflight, which this route refuses
  const contentType = (request.headers.get('Content-Type') ?? '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') return fail(415, 'unsupported_media_type');

  const text = await readBody(request, MAX_BODY_BYTES);
  if (text === null) return fail(413, 'too_large');
  const fields = parseFields(text);
  if (!fields) return fail(400, 'bad_request');

  // Honeypot (hidden field "website"): bots that fill it get the same answer as people, and nothing happens
  if (fields.website.trim() !== '') return json(200, { ok: true });

  const email = fields.email.trim();
  if (!validEmail(email)) return fail(400, 'invalid_email');
  if (!validRole(fields.rolle)) return fail(400, 'invalid_rolle');

  const config = brevoConfig(env);
  if (!config) return fail(503, 'not_configured');

  const emailHash = await sha256(email.toLowerCase());
  if (!(await withinLimits(request, emailHash, env))) return fail(429, 'rate_limited', { 'Retry-After': '60' });

  if (env.WAITLIST_GUARD) {
    const verdict = await askGuard(env.WAITLIST_GUARD, emailHash);
    // Daily cap reached, or the guard cannot be asked: like an unfinished setup, so the form offers its e-mail route
    if (verdict === 'daily_cap' || verdict === 'error') {
      console.warn(`waitlist: guard ${verdict}`);
      return fail(503, 'not_configured');
    }
    // This address already got its confirmation e-mails today: same answer as a success, no further e-mail
    if (verdict === 'address_limit') return json(200, { ok: true });
  }

  return askBrevo(config, email, fields.rolle, fetcher);
}
