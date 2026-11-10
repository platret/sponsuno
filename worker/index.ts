// Worker `sponsuno` (wrangler.jsonc → main). Static assets in dist/ are served by Cloudflare without running this script;
// `assets.run_worker_first: ["/api/*"]` sends only /api/* here, so the pages stay pure assets (no Worker invocation,
// no added latency). AGENTS.md → Architecture, team/warteliste-setup.md.
import { handleWaitlist, json, type WaitlistEnv } from './waitlist.ts';

// Durable Object class of the binding WAITLIST_GUARD (wrangler.jsonc): must be exported from the main module
export { WaitlistGuard } from './guard.ts';

interface Env extends WaitlistEnv {
  /** Static assets binding (wrangler.jsonc → assets.binding) */
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/warteliste' || pathname === '/api/warteliste/') return handleWaitlist(request, env);
    if (pathname === '/api' || pathname.startsWith('/api/')) return json(404, { ok: false, reason: 'not_found' });
    // Not reached with run_worker_first limited to /api/*; kept so a config change cannot break the site
    return env.ASSETS.fetch(request);
  },
};
