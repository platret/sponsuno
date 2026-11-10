# AGENTS.md – Sponsuno website

Read this first in every session. It says what this project is, how it is built, and which rules are not negotiable. Visual rules live in [DESIGN.md](DESIGN.md); read that before touching anything visible.

## What this is

Sponsuno is a startup project of a four-person team in the programme Youngpreneurs Zürich 2026/27 (https://youngpreneurs.org/zuerich/). The planned platform matches athletes, sport clubs and culture clubs with sponsors from their region, starting in German-speaking Switzerland (long term: DACH). A personal AI sponsoring manager is planned to help with the partnership afterwards, plus separately billed marketing services (photo, video, content).

This repo holds:

1. The public **landing page** (`/`). It explains the idea and collects interest on a waitlist. Since November 2026 it is kept short (hero, scroll story, proof line, audience, how it works, waitlist); the rest lives on topic pages.
2. Five **topic pages** reached from the header: `/fuer-firmen/`, `/ki-manager/`, `/kosten/` (with "Nicht nur Geld"), `/fragen/`, `/ueber-uns/` (team and project status).
3. A **clickable product preview** (`/demo/`, called "Vorschau" / "Produktvorschau" on the site) with example data, used to show the product to sponsors, club boards and in pitches. Code, URL and docs keep the name "demo".
4. Four **guide pages** (Ratgeber: `/sponsoren-finden/`, `/sponsoring-anfrage/`, `/sponsoring-dossier/`, `/kultursponsoring/`) with practical advice, so the site can be found for searches like "Sponsoren finden" (see "SEO").
5. The legal pages `/impressum/` and `/datenschutz/`.
6. A **404 page** (`dist/404.html`), which Cloudflare serves with status 404 for every unknown URL.

**The product does not exist yet.** No page may claim that it works today. Since 2026-11-10 the site still reads like a confident SaaS page before its launch (see "Rules for copy": product voice, one launch signal per page).

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

`npm run build` must pass before every commit. CI also runs `npm run typecheck`, `npm run check:dist` and `npm run test:e2e` on every PR (see "CI"); still verify visual changes in a browser (see "Before you finish").

## Architecture

Vite + React 19 + TypeScript (strict). No UI framework, no CSS framework.

```
index.html              Vite entry. Inline script sets html.motion (and html.scroll-fx where scroll timelines work) before first paint, plus a reveal failsafe.
                        Like every page entry it carries the <!--theme--> marker at the top of its head (see "Theme").
src/
  main.tsx              Hydrates the prerendered HTML (production) or renders fresh (dev).
  pages.ts              The list of prerendered pages: path, <title>, meta description, kind, sitemap flag. Plain data
                        (vite.config.ts imports it too). Drives the Vite inputs, the head tags and dist/sitemap.xml.
                        htmlFile() names each page's HTML file: `<path>index.html`, except the 404 page (kind
                        `notfound`, path and file `404.html`).
  entry-server.tsx      Build-time prerender (renderToString) of every page in pages.ts, plus headFor(): description,
                        canonical, Open Graph/Twitter tags and the JSON-LD (landing page: WebSite and Organization; /fragen/: FAQPage
                        with a minimal WebSite node in isPartOf), plus on the landing page the inline redirect of old section
                        links (movedScript, built from MOVED_SECTIONS, runs before the first paint).
                        The 404 page gets only `<meta name="robots" content="noindex">` (no canonical, no share tags).
                        Never shipped to the browser.
  App.tsx               Page order, reveal observer, global in-page link handling, shared waitlist role state, and the
                        redirect of old section links (/#kosten …) to the topic pages (MOVED_SECTIONS in lib/links.ts) for
                        dev and for hash changes on the open page (the build does it earlier, see entry-server.tsx).
  content.ts            ALL visible copy, typed. Change text here, not in components.
  components/           One file per section (Hero, Story, ProofLine, Audience, HowItWorks, AiManager, Support, Pricing,
                        Faq, Team, Waitlist, Footer), plus Header, MobileMenu, StoryArt (papers, pair cards, stage), MatchCard,
                        StickyCta, ThemeToggle (the light/dark switch of both headers). AiManager, Support, Pricing, Faq and Team are only used on the topic pages now (their first title
                        is the page's H1). LinkArrowLabel (label and arrow of a `link-arrow link-arrow-wrap` whose label can
                        wrap: the arrow stays after the last word). Static pages: StaticPage (picks LegalPage, GuidePage or InfoPage by the page's kind in
                        pages.ts), InfoPage (the topic pages and their closing block), NotFoundPage (the 404 page), PageHeader
                        (their shared navy header with the site nav, plus PageBand: the navy page head band with the H1), rich.tsx
                        (text with inline links).
  lib/motion.ts         motionEnabled(), scrollFxEnabled(), scrollToHash(), observeReveals(). No animation library.
  lib/links.ts          pageHref(), siteHref(): base-aware links between pages (footer links work from every page);
                        waitlistHref(), navCurrent() (aria-current of the nav), MOVED_SECTIONS, and WAITLIST_ENDPOINT
                        (VITE_WAITLIST_ENDPOINT, read by the waitlist form, the FAQ intro and the closing lines of the topic pages).
  lib/theme.ts          THEME_SCRIPT, the one inline head script of the light/dark theme (see "Theme"), plus its storage key and
                        the <!--theme--> marker. Plain data: vite.config.ts imports it.
  lib/templates.ts      Word (.docx) versions of the guide templates, built from the same text: a minimal writer
                        (stored ZIP, fixed date, so the same text gives the same bytes). No dependency.
  lib/storyLayout.ts    Positions of every item on the scroll-story stage per state and layout, turned into CSS at build time.
  static/main.ts        Entry of the static pages (legal pages, guides, topic pages): styles only in production (no React
                        shipped); renders in the browser in dev (static/dev-render.tsx, by data-page on #root).
  static/sections.ts    Second entry of the topic pages only (not /fuer-firmen/, which needs only the guide styles; its two
                        own blocks, pg-cockpit and pg-talk, live in guide.css): the section stylesheets they need (page.css,
                        ai, pricing, support, faq, team), so the guides and legal pages do not load them. CSS only, its
                        script is dropped (/ki-manager/ keeps only its inline scroll-fx script in the head).
  styles/tokens.css     Design tokens (CD colours, fonts) and the theme tokens (--bg, --text … per theme), shared with the demo.
  styles/site.css       Landing page base layer: type scale, surfaces, buttons, reveals, scroll-driven motion primitives (data-scroll).
  styles/sections/      One stylesheet per section, imported by its component.
  assets/               CD logos, header/footer wordmarks cut from them, AI-generated persona photo (demo only, labelled).
  assets/photos/        Stock photos (Pexels, credited in photoCredits; named as Symbolbilder in the landing page footer and the
                        Impressum, see "Photos"): match card avatar, audience tiles.
                        Resized copies only; the originals live outside the repo in ../photo-originals/.
  vite-env.d.ts         Types for import.meta.env (VITE_WAITLIST_ENDPOINT) and window.__introFailsafe. Add new env vars here.
public/                 Copied as-is: favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, og-image.png,
                        robots.txt, _headers (Cloudflare response headers, incl. the basic security headers). In code, import assets instead of hardcoding /paths.
                        Exception: icons and the share image live here on purpose, because crawlers and share previews
                        need stable, unhashed URLs. They are generated, not drawn by hand (see "SEO").
demo/index.html         Second Vite entry: the clickable demo (client-only, noindex, not in pages.ts or the sitemap). Pinned to
                        the light theme (data-theme="light" on <html>, no theme script).
<page>/index.html       One small Vite entry per static page in pages.ts (impressum/, datenschutz/, the four guides, and
                        the topic pages fuer-firmen/, ki-manager/, kosten/, fragen/, ueber-uns/; all but fuer-firmen/ add a
                        second script tag for static/sections.ts): data-page="<id>", a <title> placeholder, the <!--theme--> and <!--seo-->
                        markers in the head; prerendered, works without JS.
404.html                Vite entry of the 404 page (data-page="notfound", same shape as the static page entries). Shown
                        under any URL, so every URL in it and in NotFoundPage must be absolute (pageHref/siteHref are).
src/demo/               The demo app, see "The demo" below.
vite.config.ts          Entries from pages.ts plus the demo; a small plugin puts THEME_SCRIPT in place of <!--theme--> in every page
                        entry (dev and build) and fails on a page entry without the marker.
scripts/prerender.mjs   For every page in pages.ts: replaces <title> and <!--seo--> in dist/<path>index.html (fails if the theme
                        script is missing), injects the
                        server render, drops the empty module script of the static pages, inlines stylesheets under
                        4 KB, moves the font preloads behind the stylesheets, then writes dist/sitemap.xml and the
                        guide templates as Word files (dist/vorlagen/*.docx). Fails if a marker is missing.
scripts/og/og-image.html  Source of public/og-image.png (rendered once with headless Chrome, see "SEO").
scripts/icons.mjs       Regenerates the PNG/ICO icons in public/ from src/assets/Sponsuno_Icon.svg (see "SEO").
.github/workflows/      deploy.yml: `check` job (typecheck, build, check:dist, Playwright), then Cloudflare deploy on main or a preview per pull request.
wrangler.jsonc          Cloudflare Worker config: assets from dist/ with `not_found_handling: "404-page"` (unknown URLs get
                        dist/404.html with status 404), custom domains sponsuno.ch and www.sponsuno.ch.
docs/                   Images for the README only.
```

### Conventions that the code relies on

- **Copy** comes from `src/content.ts`. Exceptions: a few accessibility labels are inline (skip link in `App.tsx`, nav and logo labels in `Header.tsx`, `aria-label` in `Footer.tsx`, the footer wordmark). Check those too when reviewing copy.
- **SSR-safe components**: the page is prerendered at build time. Never touch `window`, `document`, `matchMedia` or `localStorage` at module top level or during render; only inside effects or event handlers.
- **Motion gate**: `html.motion` is set only when the visitor does not prefer reduced motion (`motionEnabled()`). `html.scroll-fx` is set on top of it only when the browser supports `animation-timeline: view()` (`scrollFxEnabled()`). Exception: `/ki-manager/` sets `html.scroll-fx` alone (see "Topic pages"). Every animation needs a still fallback that shows the final state: the static styles of an element are its final state, keyframes describe only where it starts.
- **Scroll motion** (plan and primitives in DESIGN.md → Motion): add `data-scroll="rise | fade | zoom-in | photo | frame | draw-x | draw-y | recede | group"` and keep `data-reveal=""` next to it where Firefox should still get the fade. Tune with the `--scroll-*` custom properties, never by copying the primitives. Section-specific scroll animations go in the section stylesheet under `.scroll-fx` and use `animation-timeline: view()` or a named `view-timeline`; set `animation-timeline` and `animation-range` after any `animation` shorthand (the shorthand resets them). Only `opacity`, `translate`, `scale`, `clip-path`. One `data-scroll` per element; never on an element that has its own CSS animation (wrap it). Every element must be final once its top is about 60 % down the viewport, and nothing visible at scroll 0 may start hidden. Elements at the end of the page (footer) end their range at `entry min(100%, var(--scroll-dist))` (final once fully in view, or earlier). Named `view-timeline`s set `view-timeline-inset: 0px`; never put `scale`/`translate` animations on an SVG element (wrap it in a `span`). A shared focus guard in `site.css` shows any `data-scroll` block holding focus in its final state; do not add per-section copies. Pinned sections: budget in DESIGN.md (max two, each at most one extra viewport, never below 600 px); one is used: the KI-Manager bento on `/ki-manager/` (`ai.css`, see "Topic pages").
- **Scroll story** (`Story.tsx`, DESIGN.md → Story): right under the hero, in place of the old Problem section (its copy, `problem` in `content.ts`, is the story's H2 and first steps). Text steps are normal content; two IntersectionObservers trigger one position check that sets `data-step` on the sticky stage (never stale after a jump or reload); CSS transitions do the rest. To move an item, edit the table in `lib/storyLayout.ts` (positions in % of the stage, per state, desktop and phone), not the CSS. All stage labels live in `content.ts` → `story`. Without JS, on screens up to 560 px tall and on phones with reduced motion every step shows its own static snapshot; keep that path complete when adding steps. The snapshots are prerendered; after hydration `Story.tsx` drops them while the stage is pinned (its `PINNED` query mirrors the "Pinned" media query in `story.css`: change both together). The hero start frame and the stage use different papers (`story.papers`); keep it that way.
- **Reveals**: `data-reveal=""` alone fades an element in once (`observeReveals()` in `App.tsx`, CSS in `site.css`). Under `.scroll-fx`, elements that also carry `data-scroll` are skipped by the observer and the fade is neutralised.
- **No animation or scroll libraries** (GSAP, Lenis, Three.js were removed in the November 2026 redesign), no smooth-scroll override, no JS that runs on every scroll frame (use IntersectionObserver or CSS scroll timelines).
- **Theme (light/dark, since 2026-11-10)**: two themes, chosen by the visitor with the sun/moon switch in every header (`ThemeToggle.tsx`; label "Dunkles Design", `aria-pressed` says whether it is on). Default: the system setting; an explicit choice is saved in `localStorage` (`sponsuno-theme`: `light` | `dark`) and wins on every page. One inline script does all of it (`THEME_SCRIPT` in `lib/theme.ts`): `vite.config.ts` puts it in place of the `<!--theme-->` marker at the top of every page entry's head (before the stylesheets, so there is no flash), it sets `html[data-theme]`, handles every switch with one delegated click listener on `[data-theme-toggle]` (works on the static pages, which ship no JavaScript module; on the landing page React has no theme state and must not get one), keeps `aria-pressed` in step and follows a system change while nothing is saved. A switch on an open page sets `html.theme-switching` for one frame (`site.css` turns every transition off), so nothing fades between the themes. The Datenschutzerklärung names the key (section "Helles und dunkles Design" and the summary); keep it in step if the storage changes. Every new page entry needs the marker (the build fails without it). Without JavaScript there is no `data-theme`: `tokens.css` follows `prefers-color-scheme` and the switch stays hidden (`html[data-theme] .theme-toggle`). Colours: section CSS uses the theme tokens of `tokens.css` (`--bg`, `--bg-alt`, `--surface`, `--heading`, `--text`, `--line`, `--accent-text`, `--btn-*`, `--edge`, `--focus`) for everything that follows the theme; surfaces that are navy by design (hero, story, KI device, waitlist, footer, the static header and page head band) keep the raw CD tokens in both themes. Never use `--paper`, `--ivory`, `--ink`, `--rule` or `--gold-dark` for a page surface or its text in new CSS. The demo stays light (`data-theme="light"` on its `<html>`, no script): its stylesheets use the CD colours directly. This is the one place where a saved dark choice does not hold (open: a dark demo palette is a separate job). Every HTML entry still carries `<meta name="color-scheme" content="light dark">` and `<meta name="darkreader-lock">`, so Safari's Adaptive Dark Mode and extensions such as Noir or Dark Reader leave the page alone (it handles dark mode itself); `tokens.css` sets `color-scheme` per theme so form controls and scrollbars match. `theme-color` is navy (`#0B1830`) on every page and in both themes, because every page now opens on navy. Give every surface its own background and text colour (never rely on browser defaults).
- **Section styles**: each section imports its own stylesheet from `src/styles/sections/` and prefixes its classes.
- **In-page links**: plain `<a href="#id">`. `App.tsx` intercepts them, scrolls below the fixed header and moves focus. A handler that does its own scrolling calls `preventDefault()`.
- **Links between pages**: build them with `pageHref()` / `siteHref()` from `lib/links.ts` (base path). Footer link hrefs in `content.ts` are `#id` (landing page section) or `path/` (page); on sub-pages section links lead back to the landing page. Only `#ablauf`, `#fuer-wen`, `#problem`, `#warteliste` and `#top` exist on the landing page now; link everything else to its page (`pageMeta(id).path`).
- **Navigation**: one list, `nav` in `content.ts` (Für Firmen, KI-Manager, Kosten, Ratgeber → `/sponsoren-finden/`, Über uns, Vorschau → `/demo/`), rendered by `Header` and `MobileMenu` on the landing page and by `PageHeader` on every static page, each followed by the waitlist button. `PageHeader` marks the current page with `aria-current="page"` (and "Ratgeber" with `aria-current="true"` on the other guides) via `navCurrent()`. Static pages have no JS, so below 961 px their nav sits in a native `<details>` menu; unlike the landing page menu it does not close on Escape or when focus leaves it (accepted: it scrolls away with the page and covers no focused element). Both headers use the same gaps (`.header-inner`, `.lg-header-inner`: 2rem, 1.25rem from 1140 px down), so the nav does not jump between pages. The static header is not fixed, so static pages set `scroll-padding-top: 1rem` (`legal.css`) instead of the landing page's header offset. "Fragen" is in the footer and linked from Kosten and Für Firmen.
- **Static page head** (since 2026-11-10): every topic page, guide, legal page and the 404 page opens like the landing page, on navy in both themes: the navy `PageHeader` (light wordmark, gold Warteliste button, theme switch) and under it, as the first child of `<main>`, the navy page head band (`PageBand`: the H1 and its intro; guides add the byline, legal pages the date, `/fuer-firmen/` its launch note). The band's H1 keeps the id the article or section below points its `aria-labelledby` at. On the topic pages the band holds the first section's title and intro (`TopicBand` in `InfoPage.tsx`; the FAQ intro and guide links are `FaqIntro` in `Faq.tsx`), so `AiManager`, `Pricing`, `Faq` and `Team` start with their content. Below the band the page follows the theme.
- **Topic pages** (`InfoPage.tsx`, kind `info` in `pages.ts`): static, no JavaScript module, no `html.motion` (its `data-reveal` start states wait for the landing page app's observer). A page with `scrollFx: true` in `pages.ts` (only `/ki-manager/`) gets one inline script in its head (`SCROLL_FX_SCRIPT` in `entry-server.tsx`; `static/dev-render.tsx` does the same in dev) that sets `html.scroll-fx` under the same conditions as `index.html`, so its CSS scroll motion runs: from 961 px wide and 700–1999 px tall the bento pins 2rem from the top (the static header is not fixed; `.pg .ai-pin`) while the device zooms in from a still .86, starting only once the bento has risen to 224 px from the top, a fixed line above its load position. Everything else on the page is still under `.scroll-fx .pg` (`ai.css`, `page.css`): the draft sheet, the cards and the caption at every width, the device wherever it does not pin, and the footer, because they sit in or near the first screen (or, the footer, to match the other topic pages). `/kosten/`, `/fragen/`, `/ueber-uns/` and `/fuer-firmen/` stay without it: their sections start right under the header, so rows, cards and markers in the lower part of the first screen would load half-risen. Before switching `scrollFx` on for another page, check every viewport (phones to 1440 × 1600) at scroll 0: nothing in the first screen may start hidden or half-animated. KI-Manager, Kosten (Pricing + Support), Fragen and Über uns show the former landing page sections; the first section's title and intro sit in the page head band as the page's H1 (see "Static page head"), headings under it that look like H3 are H2 with `.pg-h3` (valid order). Each ends with a closing block (`infoPage` in `content.ts`; its line `endText` opens with "Sponsuno startet bald in der Deutschschweiz.", the launch signal of these pages, and promises a reply after a sign-up, so it follows the waitlist switch, see "Waitlist") linking to the landing page waitlist (`waitlistHref(role)`, `sponsor` on Für Firmen) and the product preview (`demo.link`, no note). Für Firmen (`forFirms` at the end of `content.ts`, after `legal`) uses the guides' reading column: H1, intro and the launch note in the page head band (`forFirms.note`, "Bald verfügbar in der Deutschschweiz.", the page's one launch signal), a prominent box linking the demo's sponsor cockpit (`cockpitLink`), then "Was Sponsuno für Ihre Firma tut" (the Firmen steps of `howItWorks`), "Wie Sie unterstützen können" (`support`), "Was Vereine, Sportlerinnen und Sportler bieten können" (the Gegenleistungen of the guides "Sponsoren finden" and "Kultursponsoring", from the company's side), "Konditionen" (what is decided, then what is announced before the launch; copy rule 4: keep it in step with `pricing` and the rule) and the closing row (waitlist with `rolle=sponsor`, cockpit link, and an invitation to a talk by e-mail to `legal.contact.email`, taken from the "Als Nächstes" step in `projectStatus`; update or drop it when that step changes). It is built only from copy that already exists on the site. It is linked from the header, the footer, the Firmen audience tile and the Firmen track in `#ablauf` (`howItWorks.sponsorLinks`: the cockpit and `firmsLink`). `cockpitLink` and `firmsLink` near the top of `content.ts` keep these labels the same everywhere. Old links to moved sections (`/#ki-manager`, `/#kosten`, `/#sachleistungen`, `/#fragen`, `/#team`) are sent to the new pages with `location.replace`: in the build by an inline script in the landing page's head (`movedScript` in `entry-server.tsx`, before the first paint), in dev and on a hash change by `App.tsx`. Both read `MOVED_SECTIONS`; add an entry there when another section moves. Without JavaScript an old link shows the top of the homepage (the topic pages are in the header nav). A query string on such a link (`?rolle=…`) is dropped.
- **Guide pages**: copy in `content.ts` → `guides` (blocks: `p`, `list`, `steps`, `h3`, `template`, `cta`), shared labels in `guidePage`, links between guides via `guideLinks` (footer column "Ratgeber", FAQ intro). Title and description in `src/pages.ts`. Layout = legal pages (`legal.css`) plus `guide.css` (prefix `gd-`). Every `template` block (letter or outline, placeholders in [eckigen Klammern]) names its Word file (`file: '<name>-vorlage.docx'`): the build writes the same text to `dist/vorlagen/<file>` (`lib/templates.ts`, A4, Arial, de-CH, a footer line naming sponsuno.ch from `guidePage.templateFooter`) and the block shows a plain `<a download>` with type and size (`DOCX, 7 KB`, computed from the file). Edit the text in `content.ts` only, never a .docx by hand. The files exist only after `npm run build` (the links 404 in `npm run dev`); they are not in the sitemap and get `noindex` and a one-hour cache in `public/_headers`. Guides carry no note about Sponsuno at the top. Every guide ends with "So hilft Ihnen Sponsuno" (opens with "Sponsuno startet bald …", the guide's one launch signal, then product voice), the `cta` block (waitlist with the guide's `waitlistRole`, product preview) and "Weiterlesen".
- **Footer**: link columns from `footer.columns` in `content.ts`, then a "Kontakt" column (`footer.contactTitle`) built in `Footer.tsx` from `legal.contact`: the e-mail address as visible text and `mailto:` link, and the town taken from the postal-code line of `postalAddress` ("8406 Winterthur" → "Winterthur"). Missing fields are left out. No phone number, no other addresses (copy rule 8). The bottom row holds the copyright and, on the landing page only (its audience photos), `footer.photoNote` ("Fotos: Symbolbilder, Bildnachweise", linked to the Impressum). No programme line (Youngpreneurs is named only on `/ueber-uns/`).
- **404 page** (`NotFoundPage.tsx`, copy in `content.ts` → `notFound`): legal page layout, H1 "Diese Seite gibt es nicht (mehr)", one sentence, then the links of the guides' "Weiterlesen" box (Startseite, Ratgeber, Für Firmen, Produktvorschau, Warteliste) and one small line offering `legal.contact.email` to report a broken link (left out without an address). Static, no JS, noindex, not in the sitemap. `vite preview` does not serve it for unknown URLs; open `/404.html` to check it, and test the real 404 on a PR preview (`curl -sI <preview>/gibtsnicht`).
- **Legal pages**: all text in `content.ts` → `legal` (and `photoCredits`). Unknown contact data stays `null` and renders as pending (`legal.pending`); `npm run build` prints a warning while a `legal.contact` field is null. Every third-party photo added to the site gets an entry in `photoCredits`, which the Impressum lists.
- **Photos**: stock photos only under the Pexels or Unsplash licence, never presented as Sponsuno users (no names on a photo of a real person, except inside an illustration labelled "Beispieldaten"). Since 2026-11-10 the word "Symbolbild" stays out of the content flow: the audience photos are named as Symbolbilder once in the landing page footer (`footer.photoNote`) and in the Impressum ("Hinweis zum Inhalt", credits in `photoCredits`); the match card is covered by its "Beispieldaten" label. Pexels and Unsplash require no visible credit; keep the Impressum credits anyway. Rules for choosing and preparing them are in DESIGN.md → Imagery.
- **Team section** (`#team`, on `/ueber-uns/`): names and provisional focus come from `team` in `content.ts`. Without a photo each person shows a monogram. A real, consented photo is added by importing a square JPEG in `content.ts` and setting `photo: { src, alt }` on that person; never use stock or generated faces for the founders.
- **Project status** (`projectStatus` in `content.ts`, rendered at the end of the team section): one line on the programme with a link to its official page, then a short dated sequence (done steps, then planned ones; the state is written out, the markers only echo it). Each step must stay true and dated: mark a step done only once it has happened, never add a date the team has not fixed, and update the list when the waitlist goes live. Sources: the interviews (autumn 2026) are the ones in `problem.intro`; "Website und Demo online, November 2026" is the repo history (demo and deploy to sponsuno.ch, 2026-11-03); the next interviews (companies and culture clubs, region Winterthur) come from the team's interview guide (`../team/interview-leitfaden.md`, outside the repo); the programme name and edition from https://youngpreneurs.org/zuerich/ and the programme plan PDF of 2026-07-01 (https://bfs.zh.ch/wp/wp-content/uploads/2026/07/Youngpreneurs-Zuerich-Planung-2026_27_01.07.2026.pdf: 16 modules, 1 September 2026 to 11 May 2027, Award Night 8 April 2027; a plan, so dates may move: the events listing on innovation.zuerich gives the Award Night as 13 April 2027, so it stays off the page). The "Später" step (waitlist stores sign-ups) has no fixed order or date; it is true as long as the form runs without `VITE_WAITLIST_ENDPOINT`. **The programme is named only here** (owner's direction 2026-11-10): `/ueber-uns/` is the one page that mentions Youngpreneurs, with the link to its official page. Nowhere else: not in the hero, proof line, footer, legal pages, meta descriptions, JSON-LD or share image (the homepage bundle carries `pages.ts`, so the Über uns description leaves it out too). Wording: "Ein Projekt im Programm Youngpreneurs Zürich" or "Teil von Youngpreneurs Zürich". Name the programme once (the team intro does not repeat it). Never "gefördert durch", "Partner" or anything that suggests the programme, its schools or its funding partners (HWZ, Kanton Zürich, Stadt Winterthur) endorse Sponsuno; no `memberOf` or similar in the JSON-LD.
- **Waitlist**: posts JSON `{ rolle, email }` to `VITE_WAITLIST_ENDPOINT`. If the variable is empty (the case in production until the team sets up storage), the form stores nothing and says so: the intro (`waitlist.previewIntro` instead of `intro`), the hint and the confirmation offer a `mailto:` link to `legal.contact.email` with subject ("Warteliste: Sportverein") and body prefilled for the chosen role (`waitlist.mailSubject`, `mailBody(role, label)`). The body ends with at most three optional lines under "Freiwillige Angaben:" that the sender fills in or deletes (seekers: "Region oder Gemeinde", "Sportart oder Sparte"; sponsor: "Firma und Branche", "Region"; all: "Für ein kurzes Gespräch offen: ja / nein"); they are text in the visitor's own e-mail, not form fields, and nothing is sent by the site. The FAQ intro on `/fragen/` follows the same switch (`WAITLIST_ENDPOINT` in `lib/links.ts`): with an endpoint it points to the waitlist (`faq.introBefore` …), without one it offers the address (`faq.previewIntroBefore` …). So do the closing lines of the topic pages (`infoPage.endText` / `previewEndText`, `forFirms.end.text` / `previewText`, picked by `closingLine()` in `InfoPage.tsx`; left out without a contact address); their button still leads to the landing page waitlist, which explains the e-mail route. Copy that mentions the waitlist without this switch (true either way, it promises no reply): the guides' "So hilft Ihnen Sponsuno" paragraphs ("Wer auf der Warteliste steht, erfährt zuerst vom Start.") and the FAQ answer "Wann geht es los?". Preview wording is plain, not apologetic: "Die Anmeldung läuft vorerst per E-Mail, das Formular speichert nichts." The Datenschutzerklärung covers all this ("Warteliste", including the optional lines, "Kontakt per E-Mail", mail at Infomaniak); keep them in step. Its submit button stays disabled until React has hydrated, so the prerendered form can never POST natively to the host. After a (preview or real) success the box shows one next step for the chosen role (`waitlistNext` at the end of `content.ts`: a guide, labelled with its title, or the sponsor cockpit in the demo).
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
main.tsx        Error boundary with a reset, in case stored data does not fit the code. Without JavaScript, demo/index.html
                shows one line in #root (a <noscript>, class demo-noscript) with a link to the landing page.
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
- The banner "Vorschau mit Beispieldaten" stays visible on every view (wide screens add "Ihre Änderungen bleiben in diesem Browser, nichts wird gesendet."); that is the one general note. User-facing text calls the demo "Vorschau"; describe features in product voice ("Der KI-Manager bereitet … vor", "Sponsuno vergleicht Ihr Profil …"), but keep every simulation label: "(simuliert)" on every send or contact action and its toast, "keine echte KI" on the KI-Manager's suggestion. Since 2026-11-10 (owner: less meta-text) routine toasts and hints do not repeat "In der Vorschau wird nichts versendet"; a note naming the preview stays only where it explains a step that exists only in the preview (simulating the sponsor's answer, acting for both sides).

## Rules for copy (non-negotiable)

These come from the team's project rules. Breaking them makes the page say things that are not true.

**Owner's direction (2026-11-10)**, which overrides older wording rules here and in DESIGN.md: the site reads like a real SaaS page before its launch ("coming soon"), not like a school project. It also asked for a light/dark switch that holds across pages and for the subpages to open like the (navy) homepage (see "Theme" and "Static page head" above). No meta-text such as "Demo", "fiktiv", "geplant", "ist gedacht", "noch nicht in Betrieb", "Diese Seite beschreibt, wie es gedacht ist" next to every element; Youngpreneurs only on `/ueber-uns/`. What stays non-negotiable is listed below: confident, but never untrue.

1. German with Swiss spelling: always "ss", never "ß". Formal "Sie". Sober and direct; no advertising phrases, no emojis, no hype. Crisp CTAs ("Auf die Warteliste", "Produktvorschau ansehen").
2. **Nothing is invented.** No numbers, partners, customers, testimonials, quotes, awards, press logos, user counts or launch dates. There are none yet.
3. **Product voice, launch signal, nothing claimed as live.** Describe features in present or future product voice ("Sponsuno schlägt Firmen vor …", "Mit Sponsuno …", "So hilft Ihnen Sponsuno"), not with "soll", "geplant" or "ist gedacht". Every page carries **one** clear launch signal and no more: the hero badge "Bald verfügbar in der Deutschschweiz" (landing page), the closing line "Sponsuno startet bald in der Deutschschweiz." (topic pages), the note on `/fuer-firmen/`, the first sentence of "So hilft Ihnen Sponsuno" (guides); plus the waitlist. Never say that matching, the AI manager or payments work today, never give a launch date ("bald", "zum Start", "vor dem Start" are fine). Exceptions that stay factual: the Impressum's "Hinweis zum Inhalt" (the product has not launched; legally relevant), the Datenschutzerklärung, and "Stand des Projekts" on `/ueber-uns/`.
4. **Open decisions stay open.** Commission rate, what exactly triggers it and which side pays are not decided. Treatment of existing contacts, renewals and in-kind sponsoring is not decided. Phrase them like a SaaS pricing page ("Geben wir vor dem Start bekannt"), never guess, and never address the reader as the paying side ("Sie zahlen nur bei Erfolg" is wrong while the paying side is open). The only fixed points: no subscription or base fee; a commission when a partnership comes about; marketing services (photo, video, content) billed separately (model undecided).
5. Interviews (five, autumn 2026, from the team's personal network) are not representative. Phrase findings as "mehrere Befragte", never as market facts. Never quote interviewees by name on the page. They stay in the story on the landing page and in the guides, honestly dated.
6. Example people and companies (the mountain biker, the bike shop, the pairs) carry **one** discreet "Beispieldaten" label per illustration (hero start frame caption, story stage caption, match card, KI-Manager bento, the product preview's banner), never more. AI-generated images stay labelled as AI-generated ("KI-generiertes Symbolbild" in the preview). Stock photos: see "Photos" above (named once in the landing page footer and in the Impressum).
7. Culture clubs are part of the target group. Do not write copy that only speaks to sport.
8. Do not present the name or trademark as secured. The domain sponsuno.ch and the address hello@sponsuno.ch exist; do not invent other addresses.
9. Sustainability claims (reused equipment, shared event tech) are ideas being checked, not results ("Eine Idee, die wir prüfen").
10. **Youngpreneurs only on `/ueber-uns/`** (team section and "Stand des Projekts", with the link to youngpreneurs.org/zuerich). Check with `grep -ril youngpreneur dist` after a build: only `dist/ueber-uns/index.html` may match. Never "gefördert durch" or "Partner" (see "Project status").
11. The waitlist stores nothing yet (no endpoint): say so plainly, without apology ("Die Anmeldung läuft vorerst per E-Mail"), and keep the `mailto:` route.

## SEO

Goal: sponsuno.ch is the first result for "Sponsuno", and the guides can be found for "Sponsoren finden", "Sponsoring-Anfrage", "Sponsoring-Dossier" and "Kultursponsoring". Plan of November 2026; most of the brand-name work is outside the repo (see "Open before launch").

Rules for every page:
- **Every new indexable page** gets an entry in `src/pages.ts` with its own `title` (about 60 characters at most) and `description` (about 120–160), plus a Vite entry `<path>/index.html` with a `<title>` placeholder and the `<!--seo-->` marker (copy an existing guide entry). Canonical (absolute apex URL with a trailing slash), Open Graph and Twitter tags and the sitemap entry then come automatically. Do not write description, canonical, Open Graph/Twitter tags or JSON-LD into the HTML by hand: the build fails if it finds them.
- **Internal links** always end with a slash (`sponsoren-finden/`); Cloudflare answers `/folder` with a 307 to `/folder/`.
- **Structured data** only on the landing page and `/fragen/`, generated in `headFor()` from `pages.ts` and `content.ts`: on the landing page WebSite and Organization (name, URL, logo, e-mail, postal address from `legal.contact`), on `/fragen/` FAQPage from `faq.items` (the questions shown there). Never Review, AggregateRating, Product or Offer markup (there are none). No `sameAs` until official profiles exist; no `founder` unless the team decides it.
- **Copy for search**: write for people, not keywords. No hidden text, keyword lists or doorway pages; no "Sponsor-Finder" phrasing. The guides follow the copy rules below like every other page: general advice, no numbers or amounts, interview findings only as "mehrere Befragte" and only those already on the landing page, tax only as one neutral sentence with a link to the ESTV, Sponsuno described in product voice with the guide's one launch signal (see copy rules), culture clubs always included. The team reads every new guide before it is merged.
- **Demo** stays `noindex` (meta tag plus `X-Robots-Tag` in `public/_headers`) and out of `pages.ts`; do not block it in `robots.txt`, or crawlers cannot see the noindex. Its share tags (Open Graph, Twitter card: title "Sponsuno: Produktvorschau mit Beispieldaten", the same `og-image.png`, og:url `https://sponsuno.ch/demo/`) are written by hand in `demo/index.html`, the one exception to the rule above, because `headFor()` and the prerender check cover only `pages.ts`. Keep them in step with `site` in `pages.ts`. A dedicated demo share image would need the team's approval of its text.
- **Site name in Google**: the homepage WebSite JSON-LD has `name: "Sponsuno"` and no `alternateName`. Never add the domain as `alternateName`: Google then shows "sponsuno.ch" instead of "Sponsuno" above the results. `og:site_name` is "Sponsuno".
- **Brand name**: the name is not secured (see "Open before launch"). Do not present it as a registered mark in titles, descriptions or structured data.

Generated files in `public/` (commit the outputs; neither runs during `npm run build`, neither adds a dependency):
- Share image `public/og-image.png` (1200 × 630, under 200 KB): edit `scripts/og/og-image.html`, then
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --window-size=1200,630 --screenshot=public/og-image.png scripts/og/og-image.html`
  Its line reads "Bald verfügbar in der Deutschschweiz" since 2026-11-10 (owner's direction); keep it in step with the hero badge and `site.ogImageAlt`.
- Icons `favicon.ico` (16/32/48), `apple-touch-icon.png` (180, full navy square), `icon-192.png`, `icon-512.png` (also the Organization logo): `node scripts/icons.mjs` (macOS: Chrome and `sips`). Check the mark is still readable at 16 px.

`public/_headers` (Cloudflare Workers static assets): long cache for `/assets/*` (hashed), `X-Robots-Tag: noindex` for `/demo/*`, one-hour cache and `noindex` for `/vorlagen/*` (the guide templates as Word files: unhashed URLs), and on every response HSTS without `includeSubDomains`/`preload` (keeps the Infomaniak mail hostnames out of it) plus basic security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` (no page can be framed, not even by the site; to embed the demo in pitch slides, detach it for `/demo/*` with `! X-Frame-Options`) and `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()` (extend it before a page needs one of these). No Content-Security-Policy yet: the inline scripts (motion gate, reveal failsafe, the redirect of old section links) and the JSON-LD would need hashes or nonces first, and a wrong policy breaks the page silently. `vite preview` ignores this file; check it on a PR preview with `curl -sI`.

PR previews on `*.workers.dev` already get `x-robots-tag: noindex` from Cloudflare; the canonical tags point to the apex as a second safeguard. Do not change `workers_dev` or `preview_urls` for SEO reasons.

## Rules for data and privacy

- The team's research material (interview recordings, transcripts, persona sources, pitch, CD manual PDF) lives outside this repo and must never be committed. `.gitignore` excludes `_source/`.
- No personal data of interviewees or team members beyond first names in commits, docs or code. Exception (team decision, 2026-11-03): the four founders' full names (Aurel Eugster, Alex Platret, Maurice Strässle, Dozie Ilunga) appear in the Impressum, the Datenschutzerklärung and the founders section. Nothing else personal about them (no ages, schools, home addresses, private e-mails, social handles).
- The waitlist collects e-mail addresses. Impressum and Datenschutzerklärung exist (`/impressum/`, `/datenschutz/`). Before connecting a real endpoint: add the postal address and contact e-mail (`legal.contact`), and rewrite the "Warteliste" section of the Datenschutzerklärung (provider, data, storage period, unsubscribe), then update `legal.updated`.

## Performance budget

Targets: LCP under 2.5 s on a throttled mid-range phone, CLS under 0.1, homepage JavaScript under 150 KB gzipped (about 96 KB: React 69 KB plus the app 27 KB), CSS about 16 KB and HTML about 16 KB gzipped, under 1,100 elements after hydration. Check with a mobile Lighthouse run before releases.

Last measured 2026-11-07 (`vite preview`, Lighthouse 12.8 mobile, simulated throttling; median of three): landing page performance 96, FCP 1.96 s, LCP 2.48 s (just under the target; Lantern counts the JavaScript in, because the unthrottled run paints after hydration), TBT 0, CLS 0, 1,009 elements, two render-blocking stylesheets; guide page (`/sponsoren-finden/`) 100, FCP 0.91 s, LCP 1.36 s. Accessibility, best practices and SEO 100 on both. In a Chrome trace at 390 px with Slow 4G and 4× CPU the landing page paints its LCP (the hero lead) at about 1.6 s with CLS 0.

- Do not add dependencies casually; justify each one. No WebGL on the landing page.
- Images: sized to their display size (2× max), with `width`/`height`, `loading="lazy"` below the fold. Images hidden at load (the dark header wordmark) get `fetchPriority="low"`, which also keeps React from preloading them.
- Fonts: only Cormorant Garamond 600/700 and Manrope 400/600 (CD), self-hosted Latin subsets via `@fontsource`. Do not add weights or families. Every prerendered page preloads the three faces of its first screen (Manrope 400/600, Cormorant 600) from its `index.html`; Cormorant 700 (monogram discs only) is not preloaded. Preloads compete with the CSS for bandwidth, so do not add more.
- Stylesheets under 4 KB (the `@font-face` rules) are inlined by `scripts/prerender.mjs`; the rest stays in cacheable files.
- Scroll story: the per-step snapshots (about half of the landing page's elements) stay in the prerendered HTML for the no-JS path; `Story.tsx` drops them after hydration while the stage is pinned.

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

## CI

Every pull request (forks included) and every push to `main` runs the `check` job in `.github/workflows/deploy.yml`; the `deploy` job (production or PR preview) waits for it, so a failing check deploys nothing.

1. `npm run typecheck` (`tsc -b`: app, `vite.config.ts`, and the Playwright files via `tsconfig.e2e.json`; a plain `tsc -p .` checks nothing, the root tsconfig only holds references)
2. `npm run build`, without `VITE_WAITLIST_ENDPOINT` so the tests never sign up to the real waitlist (the deploy job builds again with it and runs `check:dist` on that build too)
3. `npm run check:dist` (`scripts/check-dist.mjs`, no dependencies): every indexable page has one `<h1>`, a title, a meta description and a canonical matching its path; 404 and demo carry noindex; the sitemap and the pages agree; every internal `href`/`src` resolves to a file in `dist/` (with a trailing slash for pages) and every `#anchor` exists in its target; JSON-LD parses; only `/` and `/demo/` load a script file (inline scripts are fine); `404.html` uses no relative URLs
4. `npm run test:e2e` (Playwright, Chromium only, `e2e/site.spec.ts`, `vite preview` on port 4199): homepage without console errors, header nav, waitlist validation and confirmation (external requests are stubbed), `?rolle=sponsor`, the `/#kosten` redirect, no horizontal overflow at 390 × 844, reduced motion. Keep the tests few and independent of copy; no screenshot diffs or animation timing.

Run locally before pushing (once: `npx playwright install chromium`):

```bash
npm run typecheck && npm run build && npm run check:dist && npm run test:e2e
```

On a failure in CI, the Playwright report and traces are attached to the run as the artifact `playwright-report`.

## Before you finish

1. `npm run build` passes (includes typecheck and prerender).
2. Push your branch and open a PR so CI builds it (pushes to other branches alone run no CI).
3. Check `npm run preview` in a browser at 1440 px and 375 px wide, in both themes (the header switch; reload with a dark system setting and nothing saved: dark): no console errors, no horizontal scroll, the hero start frame shows and its lead pair comes out of the line, scrolling the story changes the stage once per step and scrolling back reverses it, the header stays navy over hero and story and turns to the page surface after it (paper, or navy in the dark theme), in-page links land below the header, the mobile menu opens and closes, the sticky waitlist bar appears on phones after the story. On the topic pages and a guide: the nav marks the current page, the menu opens below 961 px without JS, the closing button lands on the landing page waitlist. If you touched the demo, click through both roles at `/demo/`.
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
- [x] Founders section (`#team`, November 2026, now on `/ueber-uns/`) with monograms, and stock photos (Symbolbilder) for the match card and the audience section
- [ ] Real, consented photos of the founders (the team section is ready for them, see "Team section" above) and, later, own photos of athletes, clubs and a local business to replace the stock Symbolbilder
- [x] Domain sponsuno.ch on Cloudflare (November 2026). sponsuno.com was free on 2026-11-03 but is not registered
- [ ] Search visibility (outside the repo, see "SEO"): unpublish the old GitHub Pages copy of the site and set the repo website to https://sponsuno.ch; Google Search Console domain property (new DNS TXT record on `@`, never touch the SPF or other mail records), submit `https://sponsuno.ch/sitemap.xml` and request indexing for `/` and the guides; Bing Webmaster Tools (import from Search Console)
- [ ] Official profiles (LinkedIn company page, Instagram) with the same name, URL, e-mail and town; then add them to `sameAs` and the footer
