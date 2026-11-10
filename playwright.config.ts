import { defineConfig, devices } from '@playwright/test';

// Browser smoke tests against the built site (run `npm run build` first): `npm run test:e2e`.
// `vite preview` serves dist/ on a fixed port of its own, so it never collides with a dev server or another preview.
// Project `waitlist-live` (e2e/waitlist-live.spec.ts) needs the form with an endpoint, which dist/ never has (CI builds
// without VITE_WAITLIST_ENDPOINT): a second, client-only build in dist-e2e/ with VITE_WAITLIST_ENDPOINT=/api/warteliste on
// its own port. Its tests answer /api/warteliste themselves (page.route); there is no Worker behind it.
const PORT = 4199;
const LIVE_PORT = 4198;
const CI = !!process.env.CI;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['github'], ['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /waitlist-live\.spec\.ts/ },
    {
      name: 'waitlist-live',
      use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${LIVE_PORT}` },
      testMatch: /waitlist-live\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: `npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
      url: `http://127.0.0.1:${PORT}/`,
      reuseExistingServer: !CI,
      timeout: 30_000,
    },
    {
      command: `npx vite build --outDir dist-e2e --emptyOutDir --logLevel warn && npx vite preview --outDir dist-e2e --host 127.0.0.1 --port ${LIVE_PORT} --strictPort`,
      env: { VITE_WAITLIST_ENDPOINT: '/api/warteliste' },
      url: `http://127.0.0.1:${LIVE_PORT}/`,
      reuseExistingServer: !CI,
      timeout: 180_000,
    },
  ],
});
