// Unit tests of the Worker's waitlist route with a mocked Brevo (`npm test`). No network, no Cloudflare runtime:
// the handler only uses standard fetch APIs, which Node has too.
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import worker from './index.ts';
import {
  allowedOrigin,
  BREVO_DOI_URL,
  handleWaitlist,
  MAX_BODY_BYTES,
  MemoryLimiter,
  REDIRECT_URL,
  validEmail,
  type RateLimiter,
  type WaitlistEnv,
} from './waitlist.ts';

const ORIGIN = 'https://sponsuno.ch';
const URL_ = 'https://sponsuno.ch/api/warteliste';

/** Fresh limiters per test, so the module-level fallback limiter never couples tests. */
const allow = (): RateLimiter => ({ limit: async () => ({ success: true }) });
const CONFIGURED: WaitlistEnv = {
  BREVO_API_KEY: 'test-key',
  BREVO_LIST_ID: '7',
  BREVO_DOI_TEMPLATE_ID: '12',
  WAITLIST_IP_LIMIT: allow(),
  WAITLIST_EMAIL_LIMIT: allow(),
};

function post(body: unknown, init: { origin?: string | null; type?: string; raw?: string } = {}): Request {
  const headers: Record<string, string> = { 'Content-Type': init.type ?? 'application/json', 'CF-Connecting-IP': '192.0.2.1' };
  const origin = init.origin === undefined ? ORIGIN : init.origin;
  if (origin) headers.Origin = origin;
  return new Request(URL_, { method: 'POST', headers, body: init.raw ?? JSON.stringify(body) });
}

const signUp = { email: 'name@beispiel.ch', rolle: 'sportverein', website: '' };

type Call = { url: string; init: RequestInit };
/** fetch stand-in that records the calls and answers with the given response. */
function brevo(answer: () => Response | Promise<Response>) {
  const calls: Call[] = [];
  const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} });
    return answer();
  }) as typeof fetch;
  return { calls, fetcher };
}

const neverCalled = brevo(() => {
  throw new Error('Brevo must not be called');
});

async function body(res: Response) {
  return (await res.json()) as { ok: boolean; reason?: string };
}

describe('POST /api/warteliste', () => {
  test('signs up via Brevo double opt-in with list, template, redirect and role', async () => {
    const { calls, fetcher } = brevo(() => new Response('{}', { status: 201 }));
    const res = await handleWaitlist(post(signUp), CONFIGURED, fetcher);
    assert.equal(res.status, 200);
    assert.deepEqual(await body(res), { ok: true });
    assert.equal(res.headers.get('Cache-Control'), 'no-store');

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, BREVO_DOI_URL);
    assert.equal(calls[0].init.method, 'POST');
    const headers = calls[0].init.headers as Record<string, string>;
    assert.equal(headers['api-key'], 'test-key');
    assert.ok(calls[0].init.signal, 'request has a timeout signal');
    assert.deepEqual(JSON.parse(String(calls[0].init.body)), {
      email: 'name@beispiel.ch',
      includeListIds: [7],
      templateId: 12,
      redirectionUrl: REDIRECT_URL,
      attributes: { ROLLE: 'sportverein' },
    });
  });

  test('accepts a form-encoded body and trims the address', async () => {
    const { calls, fetcher } = brevo(() => new Response(null, { status: 204 }));
    const raw = new URLSearchParams({ email: '  name@beispiel.ch ', rolle: 'sponsor', website: '' }).toString();
    const res = await handleWaitlist(post(null, { type: 'application/x-www-form-urlencoded', raw }), CONFIGURED, fetcher);
    assert.equal(res.status, 200);
    assert.equal(JSON.parse(String(calls[0].init.body)).email, 'name@beispiel.ch');
    assert.deepEqual(JSON.parse(String(calls[0].init.body)).attributes, { ROLLE: 'sponsor' });
  });

  test('a filled honeypot gets a silent success and never reaches Brevo', async () => {
    const res = await handleWaitlist(post({ ...signUp, website: 'https://spam.example' }), CONFIGURED, neverCalled.fetcher);
    assert.equal(res.status, 200);
    assert.deepEqual(await body(res), { ok: true });
  });

  test('without the secret or the IDs: 503 not_configured', async () => {
    for (const env of [
      {},
      { ...CONFIGURED, BREVO_API_KEY: '' },
      { ...CONFIGURED, BREVO_LIST_ID: '' },
      { ...CONFIGURED, BREVO_DOI_TEMPLATE_ID: 'abc' },
    ]) {
      const res = await handleWaitlist(post(signUp), env, neverCalled.fetcher);
      assert.equal(res.status, 503);
      assert.deepEqual(await body(res), { ok: false, reason: 'not_configured' });
    }
  });

  test('refuses foreign or missing origins', async () => {
    for (const origin of ['https://evil.example', 'https://sponsuno.ch.evil.example', null]) {
      const res = await handleWaitlist(post(signUp, { origin }), CONFIGURED, neverCalled.fetcher);
      assert.equal(res.status, 403, String(origin));
    }
  });

  test('validates e-mail and role', async () => {
    let res = await handleWaitlist(post({ ...signUp, email: 'keine-adresse' }), CONFIGURED, neverCalled.fetcher);
    assert.equal(res.status, 400);
    assert.equal((await body(res)).reason, 'invalid_email');
    res = await handleWaitlist(post({ ...signUp, rolle: 'admin' }), CONFIGURED, neverCalled.fetcher);
    assert.equal(res.status, 400);
    assert.equal((await body(res)).reason, 'invalid_rolle');
    res = await handleWaitlist(post(null, { raw: '{not json' }), CONFIGURED, neverCalled.fetcher);
    assert.equal(res.status, 400);
    res = await handleWaitlist(post(null, { raw: '["name@beispiel.ch"]' }), CONFIGURED, neverCalled.fetcher);
    assert.equal(res.status, 400);
  });

  test('refuses other methods, content types and large bodies', async () => {
    let res = await handleWaitlist(new Request(URL_, { method: 'GET', headers: { Origin: ORIGIN } }), CONFIGURED, neverCalled.fetcher);
    assert.equal(res.status, 405);
    assert.equal(res.headers.get('Allow'), 'POST');
    res = await handleWaitlist(post(signUp, { type: 'text/plain' }), CONFIGURED, neverCalled.fetcher);
    assert.equal(res.status, 415);
    res = await handleWaitlist(post({ ...signUp, pad: 'x'.repeat(MAX_BODY_BYTES) }), CONFIGURED, neverCalled.fetcher);
    assert.equal(res.status, 413);
  });

  test('an address Brevo already knows still answers ok (membership is not revealed)', async () => {
    for (const code of ['duplicate_parameter', 'duplicate_request', 'Request already processed']) {
      const { fetcher } = brevo(() => Response.json({ code, message: 'Contact already exist' }, { status: 400 }));
      const res = await handleWaitlist(post(signUp), CONFIGURED, fetcher);
      assert.equal(res.status, 200, code);
    }
  });

  test('other Brevo errors and timeouts become 502', async () => {
    const cases: (() => Response)[] = [
      () => Response.json({ code: 'invalid_parameter', message: 'Template does not exist' }, { status: 400 }),
      () => Response.json({ code: 'unauthorized', message: 'Key not found' }, { status: 401 }),
      () => new Response('oops', { status: 500 }),
      () => {
        throw new DOMException('The operation was aborted due to timeout', 'TimeoutError');
      },
    ];
    for (const answer of cases) {
      const res = await handleWaitlist(post(signUp), CONFIGURED, brevo(answer).fetcher);
      assert.equal(res.status, 502);
      assert.equal((await body(res)).ok, false);
    }
  });

  test('rate limited by IP or address: 429 before Brevo is called', async () => {
    const deny: RateLimiter = { limit: async () => ({ success: false }) };
    for (const env of [{ ...CONFIGURED, WAITLIST_IP_LIMIT: deny }, { ...CONFIGURED, WAITLIST_EMAIL_LIMIT: deny }]) {
      const res = await handleWaitlist(post(signUp), env, neverCalled.fetcher);
      assert.equal(res.status, 429);
      assert.equal(res.headers.get('Retry-After'), '60');
    }
  });

  test('the address is used as a rate-limit key only as a hash', async () => {
    const keys: string[] = [];
    const record: RateLimiter = { limit: async ({ key }) => (keys.push(key), { success: true }) };
    const { fetcher } = brevo(() => new Response('{}', { status: 201 }));
    await handleWaitlist(post(signUp), { ...CONFIGURED, WAITLIST_IP_LIMIT: record, WAITLIST_EMAIL_LIMIT: record }, fetcher);
    assert.deepEqual(keys[0], 'ip:192.0.2.1');
    assert.match(keys[1], /^mail:[0-9a-f]{64}$/);
    assert.ok(!keys.some((key) => key.includes('beispiel')));
  });
});

describe('Worker routing', () => {
  const env = { ...CONFIGURED, ASSETS: { fetch: async () => new Response('asset') } };

  test('other /api/* paths answer 404 JSON', async () => {
    const res = await worker.fetch(new Request('https://sponsuno.ch/api/anything'), env);
    assert.equal(res.status, 404);
    assert.deepEqual(await body(res), { ok: false, reason: 'not_found' });
    assert.equal(res.headers.get('Cache-Control'), 'no-store');
  });

  test('everything else goes to the static assets', async () => {
    const res = await worker.fetch(new Request('https://sponsuno.ch/kosten/'), env);
    assert.equal(await res.text(), 'asset');
  });
});

describe('helpers', () => {
  test('allowedOrigin', () => {
    for (const origin of ['https://sponsuno.ch', 'https://www.sponsuno.ch', 'http://localhost:5173', 'http://127.0.0.1:8787']) {
      assert.ok(allowedOrigin(origin, ORIGIN), origin);
    }
    // PR previews on workers.dev (and wrangler dev): only when the page posts to its own host
    const preview = 'https://pr-12-sponsuno.team.workers.dev';
    assert.ok(allowedOrigin(preview, preview));
    assert.ok(!allowedOrigin(preview, ORIGIN));
    assert.ok(!allowedOrigin('https://pr-12-sponsuno.attacker.workers.dev', preview));
    for (const origin of [
      'http://sponsuno.ch',
      'https://sponsuno.ch:8443',
      'https://other.team.workers.dev',
      'https://sponsuno.ch.evil.example',
      'https://localhost',
      'null',
    ]) assert.ok(!allowedOrigin(origin, ORIGIN), origin);
  });

  test('validEmail', () => {
    for (const email of ['name@beispiel.ch', 'a.b+tag@sub.example.com', 'x_y@xn--mller-kva.ch', "o'neil@firma.ch"]) {
      assert.ok(validEmail(email), email);
    }
    for (const email of [
      'name',
      'name@beispiel',
      '@beispiel.ch',
      'name@@beispiel.ch',
      'na me@beispiel.ch',
      '.name@beispiel.ch',
      'na..me@beispiel.ch',
      'name@-beispiel.ch',
      'name@beispiel.c',
      'name@beispiel.123',
      `${'a'.repeat(65)}@beispiel.ch`,
      `name@${'a'.repeat(250)}.ch`,
      'name@beispiel.ch\n',
    ]) {
      assert.ok(!validEmail(email), JSON.stringify(email));
    }
  });

  test('MemoryLimiter: fixed window per key', async () => {
    let now = 0;
    const limiter = new MemoryLimiter(2, 60_000, () => now);
    assert.equal((await limiter.limit({ key: 'a' })).success, true);
    assert.equal((await limiter.limit({ key: 'a' })).success, true);
    assert.equal((await limiter.limit({ key: 'a' })).success, false);
    assert.equal((await limiter.limit({ key: 'b' })).success, true);
    now = 60_000;
    assert.equal((await limiter.limit({ key: 'a' })).success, true);
  });
});
