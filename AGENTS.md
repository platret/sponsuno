# AGENTS.md – Sponsuno website

Read this first in every session. It says what this project is, how it is built, and which rules are not negotiable. Visual rules live in [DESIGN.md](DESIGN.md); read that before touching anything visible.

## What this is

Sponsuno is a startup project of a four-person team in the Youngpreneurs programme. The planned platform matches athletes, sport clubs and culture clubs with sponsors from their region, starting in German-speaking Switzerland (long term: DACH). A personal AI sponsoring manager is planned to help with the partnership afterwards, plus separately billed marketing services (photo, video, content).

This repo holds two things:

1. The public **landing page** (`/sponsuno/`). It explains the idea and collects interest on a waitlist.
2. A **clickable demo** (`/sponsuno/demo/`) with fictional data, used to show the idea to sponsors, club boards and in pitches.

**The product does not exist yet.** Neither page may suggest otherwise.

- Live: https://platret.github.io/sponsuno/ and https://platret.github.io/sponsuno/demo/
- Repo: https://github.com/platret/sponsuno (public)
- Language of the page: German, Swiss spelling, formal "Sie"

## Commands

Node 20.19 or newer (CI uses 22).

```bash
npm install
npm run dev        # http://localhost:5173/sponsuno/ and /sponsuno/demo/
npm run build      # typecheck, client build, prerender into dist/
npm run preview    # serve dist/ at http://localhost:4173/sponsuno/
npm run typecheck
```

`npm run build` must pass before every commit. There is no test suite yet; verify in a browser (see "Before you finish").

## Architecture

Vite + React 19 + TypeScript (strict). No UI framework, no CSS framework.

```
index.html              Vite entry. Inline script sets html.motion before first paint, plus a reveal failsafe.
src/
  main.tsx              Hydrates the prerendered HTML (production) or renders fresh (dev).
  entry-server.tsx      Build-time prerender (renderToString). Never shipped to the browser.
  App.tsx               Page order, reveal observer, global in-page link handling, shared waitlist role state.
  content.ts            ALL visible copy, typed. Change text here, not in components.
  components/           One file per section (Hero, ProofLine, Problems, HowItWorks, AiManager, Support, Pricing, Faq,
                        Waitlist, Footer), plus Header, MobileMenu, MatchCard, StickyCta.
  lib/motion.ts         motionEnabled(), scrollToHash(), observeReveals(), onceVisible(). No animation library.
  styles/tokens.css     Design tokens (CD colours, fonts), shared with the demo.
  styles/site.css       Landing page base layer: type scale, surfaces, buttons, reveals.
  styles/sections/      One stylesheet per section, imported by its component.
  assets/               CD logos, header/footer wordmarks cut from them, AI-generated persona photo (labelled).
  vite-env.d.ts         Types for import.meta.env (VITE_WAITLIST_ENDPOINT) and window.__introFailsafe. Add new env vars here.
public/                 Copied as-is (favicon.svg). In code, import assets instead of hardcoding /paths (the base path is /sponsuno/).
demo/index.html         Second Vite entry: the clickable demo (client-only, noindex).
src/demo/               The demo app, see "The demo" below.
scripts/prerender.mjs   Injects the server render into dist/index.html (landing page only).
.github/workflows/      Builds on pushes to main, on pull requests and on manual runs; deploys only from main.
docs/                   Images for the README only.
```

### Conventions that the code relies on

- **Copy** comes from `src/content.ts`. Exceptions: a few accessibility labels are inline (skip link in `App.tsx`, nav and logo labels in `Header.tsx`, `aria-label` in `MatchCard.tsx` and `Footer.tsx`, the footer wordmark). Check those too when reviewing copy.
- **SSR-safe components**: the page is prerendered at build time. Never touch `window`, `document`, `matchMedia` or `localStorage` at module top level or during render; only inside effects or event handlers.
- **Motion gate**: `html.motion` is set only when the visitor does not prefer reduced motion. Check it with `motionEnabled()`. Every animation needs a still fallback that shows the final state.
- **Reveals**: add `data-reveal=""` to an element to fade it in on scroll (`observeReveals()` in `App.tsx`, CSS in `site.css`). Do not add other motion without updating the motion budget in DESIGN.md: the hero match card is the one signature moment.
- **No animation or scroll libraries** (GSAP, Lenis, Three.js were removed in the November 2026 redesign). CSS transitions and IntersectionObserver are enough.
- **Section styles**: each section imports its own stylesheet from `src/styles/sections/` and prefixes its classes.
- **In-page links**: plain `<a href="#id">`. `App.tsx` intercepts them, scrolls below the fixed header and moves focus. A handler that does its own scrolling calls `preventDefault()`.
- **Waitlist**: posts JSON `{ rolle, email }` to `VITE_WAITLIST_ENDPOINT`. If the variable is empty, the form only previews success and stores nothing.

## The demo (`src/demo/`)

A small React app with hash routing (`#/partner/velo`), so it works on GitHub Pages without server rewrites. It is not prerendered and carries `noindex`.

```
types.ts        Data model: SeekerProfile, Sponsor, Partnership, Draft, Reminder, DemoState
data.ts         Fictional data, DEMO_TODAY (fixed "today": 2026-11-02), matchFor() (the four criteria)
store.tsx       DemoProvider + useDemo(): state, dispatch(action), derived matches. Persists only user-changeable
                slices to localStorage (key sponsuno-demo-v2, shape-checked on load); sponsors come from data.ts.
router.ts       useRoute(), href(), navigate()
format.ts       CHF, dates, relative days, labels
ui.tsx          UI kit (Button, Card, Badge, CriteriaList, ScoreBadge, Tabs, Field, ChipGroup, toasts, icons)
demo.css        Shell and UI kit styles (classes ui-*, demo-*)
DemoApp.tsx     Shell: banner, sidebar with role switch, mobile role row and tab bar, view switch, focus on route change.
                The URL decides the role: seeker views switch to the seeker, #/sponsor to the sponsor.
main.tsx        Error boundary with a reset, in case stored data does not fit the code.
views/          One view per route, each with its own CSS file and class prefix
```

Two roles: **seeker** (persona Lea Keller, mountain biker, from the team's persona work) and **sponsor** (Velogeschäft Oberland). Views: Übersicht, Passende Partner, Partnerschaften (both roles), KI-Manager, Profil, Sponsor-Cockpit.

Rules for the demo:
- Every name, company and figure is fictional and generic. Never use real companies, clubs or people.
- Nothing is sent. Every "send" or "contact" action is labelled as simulated. The KI-Manager writes from local templates and says so; never present it as real AI output.
- Requests: "Anfrage vorbereiten" only creates a draft. The partnership (status `anfrage`) appears when that draft is sent (simulated) in the KI-Manager. A sponsor can decline (`abgesagt`, distinct from `abgeschlossen`).
- If you change the stored shape, bump the storage key in `store.tsx` so old browser data is dropped.
- State changes go through `dispatch` actions in `store.tsx`. Add new actions there, not ad-hoc state in views, when data must survive navigation.
- Dates relative to `DEMO_TODAY`, never `new Date()` for "today".
- The banner "Demo mit fiktiven Daten" stays visible on every view.

## Rules for copy (non-negotiable)

These come from the team's project rules. Breaking them makes the page say things that are not true.

1. German with Swiss spelling: always "ss", never "ß". Formal "Sie". Sober and direct; no advertising phrases, no emojis, no hype.
2. **Nothing is invented.** No numbers, partners, customers, testimonials, quotes, awards, press logos or user counts. There are none yet.
3. **The product is planned, not live.** Describe features with "soll", "geplant" or "ist gedacht". Never claim that matching, the AI manager or payments work today.
4. **Open decisions stay open.** Commission rate, what triggers it and which side pays are not decided. Treatment of existing contacts, renewals and in-kind sponsoring is not decided. Say so; do not guess. The only fixed points: commission instead of subscription; marketing services billed separately (model undecided).
5. Interviews (five, autumn 2026, from the team's personal network) are not representative. Phrase findings as "mehrere Befragte", never as market facts. Never quote interviewees by name on the page.
6. Fictional examples (the mountain biker, the bike shop) must stay labelled as fictional, and AI-generated images as AI-generated.
7. Culture clubs are part of the target group. Do not write copy that only speaks to sport.
8. Do not present the name, trademark or a domain as secured. No `@sponsuno.com` addresses until a domain exists.
9. Sustainability claims (reused equipment, shared event tech) are ideas being checked, not results.

## Rules for data and privacy

- The team's research material (interview recordings, transcripts, persona sources, pitch, CD manual PDF) lives outside this repo and must never be committed. `.gitignore` excludes `_source/`.
- No personal data of interviewees or team members beyond first names in commits, docs or code.
- The waitlist collects e-mail addresses. Before connecting a real endpoint, an Impressum and a privacy notice (Swiss revDSG) must exist on the site.

## Performance budget

Targets: LCP under 2.5 s on a throttled mid-range phone, CLS under 0.1, homepage JavaScript under 150 KB gzipped (after the November 2026 redesign it is about 73 KB: React plus the app). Check with a mobile Lighthouse run before releases.

- Do not add dependencies casually; justify each one. No WebGL on the landing page.
- Images: sized to their display size (2× max), with `width`/`height`, `loading="lazy"` below the fold.
- Fonts: only Cormorant Garamond 600/700 and Manrope 400/600 (CD), self-hosted Latin subsets via `@fontsource`. Do not add weights or families.

## Accessibility

- Every animation has a reduced-motion path (no movement, final state visible).
- Visible focus everywhere (`:focus-visible` uses `--focus`, set per surface).
- The mobile menu is a modal dialog: background `inert`, Escape closes, focus returns to the toggle.
- Moving content longer than 5 s needs a pause control (there is none on the page now; keep it that way).
- Small text contrast at least 4.5:1. Gold text on light backgrounds only in Gold dunkel (#6E5228).
- Form errors are announced (`role="alert"`) and linked via `aria-describedby`.

## Deploy

- Push to `main` → GitHub Actions builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`). Pull requests get a build check but no deploy.
- **One-time setting:** Settings → Pages → Build and deployment → Source must be **GitHub Actions**. With "Deploy from a branch" GitHub would serve the unbuilt `index.html` and the site would be blank.
- The site is served under `/sponsuno/`; `vite.config.ts` sets `base` from `BASE_PATH` (default `/sponsuno/`). For a root domain (e.g. Vercel), build with `BASE_PATH=/`.
- To store real sign-ups, set the repository variable `VITE_WAITLIST_ENDPOINT` (Settings → Secrets and variables → Actions → Variables).

## Before you finish

1. `npm run build` passes (includes typecheck and prerender).
2. Push your branch and open a PR so CI builds it (pushes to other branches alone run no CI).
3. Check `npm run preview` in a browser at 1440 px and 375 px wide: no console errors, no horizontal scroll, the hero match card shows and its line draws, in-page links land below the header, the mobile menu opens and closes, the sticky waitlist bar appears on phones after the hero. If you touched the demo, click through both roles at `/sponsuno/demo/`.
4. Check once with reduced motion emulated: everything visible, nothing moves.
5. Copy changes: re-read the copy rules above.
6. Update `DESIGN.md` if you changed tokens, components or motion; update this file if you changed architecture or rules; update `README.md` screenshots if the look changed noticeably.
7. Work on a branch, open a PR into `main`. Commit messages: imperative subject, short body explaining why.

## Open before launch

- [ ] Waitlist endpoint (`VITE_WAITLIST_ENDPOINT`) and a double opt-in flow
- [ ] Impressum and privacy notice
- [ ] Commission model: rate, trigger, paying side
- [ ] Trademark check (Swissreg/IGE, EUIPO): "Sponsoo" (sponsoo.de) is a similar name in the same market
- [ ] Logo refinement with the CD owner (see DESIGN.md → Logo)
- [ ] Real, consented photos (athletes, clubs, a local business, the founders) and a founders section
- [ ] Domain decision (the team prefers a .com; availability is not checked)
