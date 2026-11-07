# AGENTS.md – Sponsuno website

Read this first in every session. It says what this project is, how it is built, and which rules are not negotiable. Visual rules live in [DESIGN.md](DESIGN.md); read that before touching anything visible.

## What this is

Sponsuno is a startup project of a four-person team in the programme Youngpreneurs Zürich 2026/27 (https://youngpreneurs.org/zuerich/). The planned platform matches athletes, sport clubs and culture clubs with sponsors from their region, starting in German-speaking Switzerland (long term: DACH). A personal AI sponsoring manager is planned to help with the partnership afterwards, plus separately billed marketing services (photo, video, content).

This repo holds:

1. The public **landing page** (`/`). It explains the idea and collects interest on a waitlist.
2. A **clickable demo** (`/demo/`) with fictional data, used to show the idea to sponsors, club boards and in pitches.
3. Four **guide pages** (Ratgeber: `/sponsoren-finden/`, `/sponsoring-anfrage/`, `/sponsoring-dossier/`, `/kultursponsoring/`) with practical advice, so the site can be found for searches like "Sponsoren finden" (see "SEO").
4. The legal pages `/impressum/` and `/datenschutz/`.

**The product does not exist yet.** No page may suggest otherwise.

- Live: https://sponsuno.ch and https://sponsuno.ch/demo/ (www.sponsuno.ch redirects to sponsuno.ch)
- Repo: https://github.com/platret/sponsuno (public)
- Language of the page: German, Swiss spelling, formal "Sie"

## Commands

Node 20.19 or newer (CI uses 22).

```bash
npm install
npm run dev        # http://localhost:5173/ and /demo/
npm run build      # typecheck, client build, prerender into dist/
npm run preview    # serve dist/ at http://localhost:4173/
npm run typecheck
```

`npm run build` must pass before every commit. There is no test suite yet; verify in a browser (see "Before you finish").

## Architecture

Vite + React 19 + TypeScript (strict). No UI framework, no CSS framework.

```
index.html              Vite entry. Inline script sets html.motion (and html.scroll-fx where scroll timelines work) before first paint, plus a reveal failsafe.
src/
  main.tsx              Hydrates the prerendered HTML (production) or renders fresh (dev).
  pages.ts              The list of prerendered pages: path, <title>, meta description, kind, sitemap flag. Plain data
                        (vite.config.ts imports it too). Drives the Vite inputs, the head tags and dist/sitemap.xml.
  entry-server.tsx      Build-time prerender (renderToString) of every page in pages.ts, plus headFor(): description,
                        canonical, Open Graph/Twitter tags and (landing page only) the JSON-LD graph. Never shipped to the browser.
  App.tsx               Page order, reveal observer, global in-page link handling, shared waitlist role state.
  content.ts            ALL visible copy, typed. Change text here, not in components.
  components/           One file per section (Hero, Story, ProofLine, Audience, HowItWorks, AiManager, Support, Pricing,
                        Faq, Team, Waitlist, Footer), plus Header, MobileMenu, StoryArt (papers, pair cards, stage), MatchCard,
                        StickyCta. Static pages: StaticPage (picks LegalPage for Impressum/Datenschutz or GuidePage for the
                        guides), PageHeader (their shared header), rich.tsx (text with inline links).
  lib/motion.ts         motionEnabled(), scrollFxEnabled(), scrollToHash(), observeReveals(). No animation library.
  lib/links.ts          pageHref(), siteHref(): base-aware links between pages (footer links work from every page).
  lib/storyLayout.ts    Positions of every item on the scroll-story stage per state and layout, turned into CSS at build time.
  static/main.ts        Entry of the static pages (legal pages, guides): styles only in production (no React shipped);
                        renders in the browser in dev (static/dev-render.tsx, by data-page on #root).
  styles/tokens.css     Design tokens (CD colours, fonts), shared with the demo.
  styles/site.css       Landing page base layer: type scale, surfaces, buttons, reveals, scroll-driven motion primitives (data-scroll).
  styles/sections/      One stylesheet per section, imported by its component.
  assets/               CD logos, header/footer wordmarks cut from them, AI-generated persona photo (demo only, labelled).
  assets/photos/        Stock photos (Pexels, labelled "Symbolbild", credited in photoCredits): match card avatar, audience tiles.
                        Resized copies only; the originals live outside the repo in ../photo-originals/.
  vite-env.d.ts         Types for import.meta.env (VITE_WAITLIST_ENDPOINT) and window.__introFailsafe. Add new env vars here.
public/                 Copied as-is: favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, og-image.png,
                        robots.txt, _headers (Cloudflare response headers). In code, import assets instead of hardcoding /paths.
                        Exception: icons and the share image live here on purpose, because crawlers and share previews
                        need stable, unhashed URLs. They are generated, not drawn by hand (see "SEO").
demo/index.html         Second Vite entry: the clickable demo (client-only, noindex, not in pages.ts or the sitemap).
<page>/index.html       One small Vite entry per static page in pages.ts (impressum/, datenschutz/, sponsoren-finden/,
                        sponsoring-anfrage/, sponsoring-dossier/, kultursponsoring/): data-page="<id>", a <title>
                        placeholder and the <!--seo--> marker in the head; prerendered, works without JS.
src/demo/               The demo app, see "The demo" below.
scripts/prerender.mjs   For every page in pages.ts: replaces <title> and <!--seo--> in dist/<path>index.html, injects the
                        server render, drops the empty module script of the static pages, then writes dist/sitemap.xml.
                        Fails if a marker is missing.
scripts/og/og-image.html  Source of public/og-image.png (rendered once with headless Chrome, see "SEO").
scripts/icons.mjs       Regenerates the PNG/ICO icons in public/ from src/assets/Sponsuno_Icon.svg (see "SEO").
.github/workflows/      deploy.yml: Cloudflare production deploy on main, preview per pull request.
wrangler.jsonc          Cloudflare Worker config: assets from dist/, custom domains sponsuno.ch and www.sponsuno.ch.
docs/                   Images for the README only.
```

### Conventions that the code relies on

- **Copy** comes from `src/content.ts`. Exceptions: a few accessibility labels are inline (skip link in `App.tsx`, nav and logo labels in `Header.tsx`, `aria-label` in `Footer.tsx`, the footer wordmark). Check those too when reviewing copy.
- **SSR-safe components**: the page is prerendered at build time. Never touch `window`, `document`, `matchMedia` or `localStorage` at module top level or during render; only inside effects or event handlers.
- **Motion gate**: `html.motion` is set only when the visitor does not prefer reduced motion (`motionEnabled()`). `html.scroll-fx` is set on top of it only when the browser supports `animation-timeline: view()` (`scrollFxEnabled()`). Every animation needs a still fallback that shows the final state: the static styles of an element are its final state, keyframes describe only where it starts.
- **Scroll motion** (plan and primitives in DESIGN.md → Motion): add `data-scroll="rise | fade | zoom-in | photo | frame | draw-x | draw-y | recede | group"` and keep `data-reveal=""` next to it where Firefox should still get the fade. Tune with the `--scroll-*` custom properties, never by copying the primitives. Section-specific scroll animations go in the section stylesheet under `.scroll-fx` and use `animation-timeline: view()` or a named `view-timeline`; set `animation-timeline` and `animation-range` after any `animation` shorthand (the shorthand resets them). Only `opacity`, `translate`, `scale`, `clip-path`. One `data-scroll` per element; never on an element that has its own CSS animation (wrap it). Every element must be final once its top is about 60 % down the viewport, and nothing visible at scroll 0 may start hidden. Elements at the end of the page (footer) end their range at `entry min(100%, var(--scroll-dist))` (final once fully in view, or earlier). Named `view-timeline`s set `view-timeline-inset: 0px`; never put `scale`/`translate` animations on an SVG element (wrap it in a `span`). A shared focus guard in `site.css` shows any `data-scroll` block holding focus in its final state; do not add per-section copies. Pinned sections: budget in DESIGN.md (max two, each at most one extra viewport, never below 600 px); one is used (KI-Manager).
- **Scroll story** (`Story.tsx`, DESIGN.md → Story): right under the hero, in place of the old Problem section (its copy, `problem` in `content.ts`, is the story's H2 and first steps). Text steps are normal content; two IntersectionObservers trigger one position check that sets `data-step` on the sticky stage (never stale after a jump or reload); CSS transitions do the rest. To move an item, edit the table in `lib/storyLayout.ts` (positions in % of the stage, per state, desktop and phone), not the CSS. All stage labels live in `content.ts` → `story`. Without JS, on screens up to 560 px tall and on phones with reduced motion every step shows its own static snapshot; keep that path complete when adding steps. The hero start frame and the stage use different papers (`story.papers`); keep it that way.
- **Reveals**: `data-reveal=""` alone fades an element in once (`observeReveals()` in `App.tsx`, CSS in `site.css`). Under `.scroll-fx`, elements that also carry `data-scroll` are skipped by the observer and the fade is neutralised.
- **No animation or scroll libraries** (GSAP, Lenis, Three.js were removed in the November 2026 redesign), no smooth-scroll override, no JS that runs on every scroll frame (use IntersectionObserver or CSS scroll timelines).
- **One look, no auto-darkening**: every HTML entry carries `<meta name="color-scheme" content="light dark">` and `<meta name="darkreader-lock">`, and `tokens.css` sets `color-scheme: light dark` on `:root` with `body { color-scheme: light; }`. Without the "light dark" declaration, Safari's Adaptive Dark Mode and extensions such as Noir repaint the page on phones in dark mode (ivory turns brown, navy turns light blue, headings vanish). Keep both metas on every new page, and give every surface its own background and text colour (never rely on browser defaults).
- **Section styles**: each section imports its own stylesheet from `src/styles/sections/` and prefixes its classes.
- **In-page links**: plain `<a href="#id">`. `App.tsx` intercepts them, scrolls below the fixed header and moves focus. A handler that does its own scrolling calls `preventDefault()`.
- **Links between pages**: build them with `pageHref()` / `siteHref()` from `lib/links.ts` (base path). Footer link hrefs in `content.ts` are `#id` (landing page section) or `path/` (page); on sub-pages section links lead back to the landing page.
- **Guide pages**: copy in `content.ts` → `guides` (blocks: `p`, `list`, `steps`, `h3`, `template`, `cta`), shared labels in `guidePage`, links between guides via `guideLinks` (footer column "Ratgeber", FAQ intro). Title and description in `src/pages.ts`. Layout = legal pages (`legal.css`) plus `guide.css` (prefix `gd-`). Every guide ends with "Wie Sponsuno dabei helfen soll" in planned wording, the `cta` block (waitlist with the guide's `waitlistRole`, demo) and "Weiterlesen".
- **Legal pages**: all text in `content.ts` → `legal` (and `photoCredits`). Unknown contact data stays `null` and renders as pending (`legal.pending`); `npm run build` prints a warning while a `legal.contact` field is null. Every third-party photo added to the site gets an entry in `photoCredits`, which the Impressum lists.
- **Photos**: stock photos only under the Pexels or Unsplash licence, labelled "Symbolbild", never presented as Sponsuno users. Rules for choosing and preparing them are in DESIGN.md → Imagery.
- **Team section** (`#team`, between FAQ and waitlist): names and provisional focus come from `team` in `content.ts`. Without a photo each person shows a monogram. A real, consented photo is added by importing a square JPEG in `content.ts` and setting `photo: { src, alt }` on that person; never use stock or generated faces for the founders.
- **Project status** (`projectStatus` in `content.ts`, rendered at the end of the team section): one line on the programme with a link to its official page, then a short dated sequence (done steps, then planned ones; the state is written out, the markers only echo it). Each step must stay true and dated: mark a step done only once it has happened, never add a date the team has not fixed, and update the list when the waitlist goes live. Sources: the interviews (autumn 2026) are the ones in `problem.intro`; "Website und Demo online, November 2026" is the repo history (demo and deploy to sponsuno.ch, 2026-11-03); the next interviews (companies and culture clubs, region Winterthur) come from the team's interview guide (`../team/interview-leitfaden.md`, outside the repo); the programme name and edition from https://youngpreneurs.org/zuerich/ and the programme plan PDF of 2026-07-01 (https://bfs.zh.ch/wp/wp-content/uploads/2026/07/Youngpreneurs-Zuerich-Planung-2026_27_01.07.2026.pdf: 16 modules, 1 September 2026 to 11 May 2027, Award Night 8 April 2027; a plan, so dates may move: the events listing on innovation.zuerich gives the Award Night as 13 April 2027, so it stays off the page). The "Später" step (waitlist stores sign-ups) has no fixed order or date; it is true as long as the form runs without `VITE_WAITLIST_ENDPOINT`. Wording: "Teil von Youngpreneurs Zürich" or "Ein Projekt im Programm Youngpreneurs Zürich"; the neutral short forms "Youngpreneurs-Projekt" (hero badge) and "im Youngpreneurs-Programm" (legal pages) are fine too. Name the programme once per section (the team intro does not repeat it). Never "gefördert durch", "Partner" or anything that suggests the programme, its schools or its funding partners (HWZ, Kanton Zürich, Stadt Winterthur) endorse Sponsuno; no `memberOf` or similar in the JSON-LD.
- **Waitlist**: posts JSON `{ rolle, email }` to `VITE_WAITLIST_ENDPOINT`. If the variable is empty (the case in production until the team sets up storage), the form stores nothing and says so: the intro (`waitlist.previewIntro` instead of `intro`), the hint and the confirmation offer a `mailto:` link to `legal.contact.email` with subject ("Warteliste: Sportverein") and body prefilled for the chosen role (`waitlist.mailSubject`, `mailBody`). The Datenschutzerklärung covers this ("Warteliste", "Kontakt per E-Mail", mail at Infomaniak); keep them in step. Its submit button stays disabled until React has hydrated, so the prerendered form can never POST natively to the host. After a (preview or real) success the box shows one next step for the chosen role (`waitlistNext` at the end of `content.ts`: a guide, labelled with its title, or the sponsor cockpit in the demo).
- **Waitlist role from the URL**: `/?rolle=<Role>#warteliste` (values of `Role` in `content.ts`: `athlete`, `sportverein`, `kulturverein`, `sponsor`) preselects the role; `App.tsx` reads it in an effect after hydration, ignores unknown values and then removes the parameter from the address bar (`history.replaceState`), so in-page links and a copied URL do not carry it. Build such links with `waitlistHref(role)` from `lib/links.ts`. Used by the guides' cta block (`waitlistRole` per guide, default role if unset) and by the demo (`../?rolle=…`, by the perspective shown). On the landing page itself the role buttons keep calling `onChooseRole` with plain `#warteliste` links.

## The demo (`src/demo/`)

A small React app with hash routing (`#/partner/velo`), so it works without server rewrites. It is not prerendered and carries `noindex`.

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
                "Auf die Warteliste" (sidebar on wide screens, end of every view below 900 px) leads to the landing page
                waitlist with the role of the perspective shown (seeker: athlete, sponsor: sponsor). The demo's few
                strings are inline, so content.ts stays out of the demo bundle.
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
6. Fictional examples (the mountain biker, the bike shop) must stay labelled as fictional, AI-generated images as AI-generated, and stock photos as "Symbolbild".
7. Culture clubs are part of the target group. Do not write copy that only speaks to sport.
8. Do not present the name or trademark as secured. The domain sponsuno.ch and the address hello@sponsuno.ch exist; do not invent other addresses.
9. Sustainability claims (reused equipment, shared event tech) are ideas being checked, not results.

## SEO

Goal: sponsuno.ch is the first result for "Sponsuno", and the guides can be found for "Sponsoren finden", "Sponsoring-Anfrage", "Sponsoring-Dossier" and "Kultursponsoring". Plan of November 2026; most of the brand-name work is outside the repo (see "Open before launch").

Rules for every page:
- **Every new indexable page** gets an entry in `src/pages.ts` with its own `title` (about 60 characters at most) and `description` (about 120–160), plus a Vite entry `<path>/index.html` with a `<title>` placeholder and the `<!--seo-->` marker (copy an existing guide entry). Canonical (absolute apex URL with a trailing slash), Open Graph and Twitter tags and the sitemap entry then come automatically. Do not write description, canonical, Open Graph/Twitter tags or JSON-LD into the HTML by hand: the build fails if it finds them.
- **Internal links** always end with a slash (`sponsoren-finden/`); Cloudflare answers `/folder` with a 307 to `/folder/`.
- **Structured data** only on the landing page, generated in `headFor('home')` from `pages.ts` and `content.ts`: WebSite, Organization (name, URL, logo, e-mail, postal address from `legal.contact`) and FAQPage from `faq.items`. Never Review, AggregateRating, Product or Offer markup (there are none). No `sameAs` until official profiles exist; no `founder` unless the team decides it.
- **Copy for search**: write for people, not keywords. No hidden text, keyword lists or doorway pages; no "Sponsor-Finder" phrasing. The guides follow the copy rules below like every other page: general advice, no numbers or amounts, interview findings only as "mehrere Befragte" and only those already on the landing page, tax only as one neutral sentence with a link to the ESTV, Sponsuno always described as planned, culture clubs always included. The team reads every new guide before it is merged.
- **Demo** stays `noindex` (meta tag plus `X-Robots-Tag` in `public/_headers`) and out of `pages.ts`; do not block it in `robots.txt`, or crawlers cannot see the noindex.
- **Brand name**: the name is not secured (see "Open before launch"). Do not present it as a registered mark in titles, descriptions or structured data.

Generated files in `public/` (commit the outputs; neither runs during `npm run build`, neither adds a dependency):
- Share image `public/og-image.png` (1200 × 630, under 200 KB): edit `scripts/og/og-image.html`, then
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --window-size=1200,630 --screenshot=public/og-image.png scripts/og/og-image.html`
  Its text is approved by the team; keep it in planned wording.
- Icons `favicon.ico` (16/32/48), `apple-touch-icon.png` (180, full navy square), `icon-192.png`, `icon-512.png` (also the Organization logo): `node scripts/icons.mjs` (macOS: Chrome and `sips`). Check the mark is still readable at 16 px.

`public/_headers` (Cloudflare Workers static assets): long cache for `/assets/*` (hashed), `X-Robots-Tag: noindex` for `/demo/*`, HSTS without `includeSubDomains`/`preload` (keeps the Infomaniak mail hostnames out of it). `vite preview` ignores this file; check it on a PR preview with `curl -sI`.

PR previews on `*.workers.dev` already get `x-robots-tag: noindex` from Cloudflare; the canonical tags point to the apex as a second safeguard. Do not change `workers_dev` or `preview_urls` for SEO reasons.

## Rules for data and privacy

- The team's research material (interview recordings, transcripts, persona sources, pitch, CD manual PDF) lives outside this repo and must never be committed. `.gitignore` excludes `_source/`.
- No personal data of interviewees or team members beyond first names in commits, docs or code. Exception (team decision, 2026-11-03): the four founders' full names (Aurel Eugster, Alex Platret, Maurice Strässle, Dozie Ilunga) appear in the Impressum, the Datenschutzerklärung and the founders section. Nothing else personal about them (no ages, schools, home addresses, private e-mails, social handles).
- The waitlist collects e-mail addresses. Impressum and Datenschutzerklärung exist (`/impressum/`, `/datenschutz/`). Before connecting a real endpoint: add the postal address and contact e-mail (`legal.contact`), and rewrite the "Warteliste" section of the Datenschutzerklärung (provider, data, storage period, unsubscribe), then update `legal.updated`.

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

- Hosting: Cloudflare Workers with static assets (`wrangler.jsonc`, Worker `sponsuno`, serves `dist/`). Custom domains sponsuno.ch and www.sponsuno.ch; a Cloudflare Redirect Rule sends www to the apex.
- Push to `main` → `.github/workflows/deploy.yml` builds and runs `wrangler deploy` (production). Pull requests from this repo run `wrangler preview --name pr-<number>` and get a preview URL on workers.dev.
- GitHub secrets: `CLOUDFLARE_API_TOKEN` (account-owned token: Workers Admin, Zone › Workers Routes › Edit on sponsuno.ch) and `CLOUDFLARE_ACCOUNT_ID`.
- DNS for sponsuno.ch is on Cloudflare. Never change or proxy the Infomaniak mail records (MX, SPF, DKIM `20261103._domainkey`, `_dmarc`, `autoconfig`, `autodiscover`).
- Keep Bot Fight Mode and other cookie-setting Cloudflare features off: the Datenschutzerklärung says no cookies are set.
- Workers observability is off (`observability.enabled: false`): the Datenschutzerklärung says no per-request logging is set up.
- To store real sign-ups, set the repository variable `VITE_WAITLIST_ENDPOINT` (Settings → Secrets and variables → Actions → Variables).

## Before you finish

1. `npm run build` passes (includes typecheck and prerender).
2. Push your branch and open a PR so CI builds it (pushes to other branches alone run no CI).
3. Check `npm run preview` in a browser at 1440 px and 375 px wide: no console errors, no horizontal scroll, the hero start frame shows and its lead pair comes out of the line, scrolling the story changes the stage once per step and scrolling back reverses it, the header stays navy over hero and story and turns paper after it, in-page links land below the header, the mobile menu opens and closes, the sticky waitlist bar appears on phones after the story. If you touched the demo, click through both roles at `/demo/`.
4. Check once with reduced motion emulated: everything visible, nothing moves (phones: the story shows one static picture per step). Check once without JS: the hero start frame and every story step with its picture. If you touched motion, also scroll slowly at 1440 px and 375 px in Chrome (every element is final by the time it is comfortably in view, nothing is half-faded when you stop) and check Firefox (fade fallback, nothing hidden).
5. Copy changes: re-read the copy rules above.
6. Update `DESIGN.md` if you changed tokens, components or motion; update this file if you changed architecture or rules; update `README.md` screenshots if the look changed noticeably.
7. Work on a branch, open a PR into `main`. Commit messages: imperative subject, short body explaining why.

## Open before launch

- [ ] Waitlist endpoint (`VITE_WAITLIST_ENDPOINT`) and a double opt-in flow (then also update the "Später" step in `projectStatus`)
- [x] Impressum and privacy notice (`/impressum/`, `/datenschutz/`, November 2026). The waitlist section must be rewritten before the endpoint goes live
- [x] Contact data in `legal.contact` (Klosterstrasse 34, 8406 Winterthur; hello@sponsuno.ch)
- [ ] Commission model: rate, trigger, paying side
- [ ] Name decision. Desk trademark check done 2026-11-03 (not legal advice): no SPONSUNO mark, company or domain anywhere checked (CH, EU, DE, AT, WIPO). Risk low to medium in CH (Sponsoo is active via sponsoo.ch but has no Swiss mark), high for an EU filing or DACH expansion: SPONSOO (EUTM 013271473) and SPONSU / SPONSUU / SPONZU (DBG, EUTM 019156718 / 019156613 / 019156702) cover sponsorship search in class 35. Next: attorney or IGE clearance opinion, then domains and a Swiss filing (IGE, CHF 350 online for 3 classes), or a rename away from SPONS-. Until decided, the page must not present the name as secured
- [ ] Logo refinement with the CD owner (see DESIGN.md → Logo)
- [x] Founders section (`#team`, November 2026) with monograms, and stock photos (Symbolbilder) for the match card and the audience section
- [ ] Real, consented photos of the founders (the team section is ready for them, see "Team section" above) and, later, own photos of athletes, clubs and a local business to replace the stock Symbolbilder
- [x] Domain sponsuno.ch on Cloudflare (November 2026). sponsuno.com was free on 2026-11-03 but is not registered
- [ ] Search visibility (outside the repo, see "SEO"): unpublish the old GitHub Pages copy of the site and set the repo website to https://sponsuno.ch; Google Search Console domain property (new DNS TXT record on `@`, never touch the SPF or other mail records), submit `https://sponsuno.ch/sitemap.xml` and request indexing for `/` and the guides; Bing Webmaster Tools (import from Search Console)
- [ ] Official profiles (LinkedIn company page, Instagram) with the same name, URL, e-mail and town; then add them to `sameAs` and the footer
