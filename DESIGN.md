# DESIGN.md – Sponsuno visual system

The source of truth for colours and fonts is the **Sponsuno Corporate Design Manual v1.0 (November 2026)**. This file translates it into how the website uses them. It was rewritten in November 2026 after a research round (Mobbin heroes and landing pages, Awwwards winners, a palette analysis and an audit of the old page). If the code and this file disagree, fix one of them in the same change.

Tokens are CSS custom properties in [`src/styles/tokens.css`](src/styles/tokens.css); the landing page base layer is [`src/styles/site.css`](src/styles/site.css); each section has its own stylesheet in `src/styles/sections/`.

## Principles

1. **Calm, clear, credible.** The page must work for a 22-year-old athlete, a volunteer club board and an SME owner. Clarity first, then atmosphere.
2. **Calm motion that leads into the content.** Since November 2026 the page moves with the scroll: sections rise in, photos and frames open as you scroll into them, the hero recedes as the page moves on. Every movement is scroll-linked, small and finished by the time an element is comfortably in view; nothing bounces, spins or types. The gold line in the hero match card stays the one time-based "wow" and echoes in the steps line.
3. **Light page, navy frame, gold accent.** Light surfaces carry about 75% of the page. Navy is used for the hero and the closing waitlist + footer block. Gold is a flat accent (about 5%): never a surface, never a gradient, never a glow.
4. **Show the product, not decoration.** Product UI (the match card, the KI-Manager draft) explains Sponsuno better than abstract visuals.
5. **Honest content in honest form.** Fictional examples, AI images and stock photos are labelled (stock photos as "Symbolbild"). No fake logos, numbers or testimonials.

What we removed and should not bring back: WebGL shaders, the 3D emblem, tilted marquees, gold liquid sections, magnetic buttons, card tilt and glare, shine sweeps, rotating borders, scroll hijacking (Lenis), smooth-scroll overrides, glass navigation.

## Colour

| Token | Hex | CD name | Use |
| --- | --- | --- | --- |
| `--paper` | `#FBF9F4` | (card start) | Default page surface and the scrolled header |
| `--ivory` | `#F3EFE6` | Elfenbein | Alternate light band; all text on navy |
| `--navy` | `#0B1830` | Navy | Hero, waitlist + footer block, headings on light, primary button on light |
| `--navy-2` | `#1D2F52` | Navy mittel | End of the hero gradient; card fill inside navy areas |
| `--ink` | `#3B4560` | Textgrau | Body and secondary text on light |
| `--steel` | `#B9BFCB` | Stahlgrau | Secondary text on navy only (never on light: 1.6:1) |
| `--gold` | `#B08D57` | Gold | Non-text accents: logo dot and "uno", lines, rules |
| `--gold-light` | `#C4A36B` | Gold hell | Primary button on navy (navy label, 7.4:1), the accent word in the H1, text accents on navy |
| `--gold-dark` | `#6E5228` | Gold dunkel | All gold text and icons on light (6.3:1) |
| `--rule` | `#D9D2C1` | (card border) | Hairlines and card borders on light |
| `--card-dark-line` | `#33476F` | (dark card border) | Borders inside navy areas |

Rules:
- Gold text on light only in `--gold-dark`. `#B08D57` as text on light fails contrast (2.7:1).
- Button labels on gold are `--navy`.
- Flat fills. The only gradient is the subtle 135° navy gradient of navy surfaces.
- Documented extras outside the CD: `#F2C5B5` (form error text on navy). The demo adds its own few, listed under "Demo app".

## Typography

| Role | Family | Weight |
| --- | --- | --- |
| H1, H2, big numerals, the menu links | Cormorant Garamond (`--serif`), self-hosted | 600 (700 for the logo mark letters) |
| Everything else: H3, body, labels, buttons, product UI | Manrope (`--sans`), self-hosted | 400, 600 |

Scale (tokens in `site.css`): H1 `clamp(2.75rem, 1.4rem + 4.4vw, 5.5rem)` / 0.98; H2 `clamp(2.125rem, 1.5rem + 2.6vw, 3.5rem)` / 1.04; H3 1.1875rem Manrope 600; lead `clamp(1.125rem, …, 1.3125rem)`; body 1.0625rem / 1.6; small 0.9375rem; never below 0.75rem.

Rules: Cormorant never below about 28px and never for UI or body text. Sentence case, no all-caps labels, no letter-spaced eyebrows. Lining figures for numerals. Fonts come from `@fontsource` (Latin subset), not from Google's servers.

## Layout

- Container 1200 px, gutter `clamp(1rem, 4vw, 2.5rem)`, section padding `clamp(4.5rem, 3rem + 6vw, 8.5rem)`.
- Section order and surfaces: Hero (navy) → Proof line (paper) → Für wen Sponsuno gedacht ist (paper, `#fuer-wen`; the proof line's hairline separates the two paper bands) → Problem (ivory) → So funktioniert es, two tracks (paper) → KI-Manager bento (ivory) → Nicht nur Geld (paper) → Kosten (ivory) → FAQ (paper) → Team (ivory, `#team`) → Warteliste + Footer (navy, one continuous block).
- Für wen (`aud-`): four photo tiles (4:3, radius 16 px) with an H3 label and one small sentence, no cards. Four columns from 1024 px, two columns down to 601 px, below that one column with each photo full width above its text, items divided by hairlines (a small thumbnail made the subjects unreadable). One small note under the grid says the photos are Symbolbilder and links to the credits in the Impressum.
- Team (`team-`): four founders in a row (two columns below 961 px, also on phones), each above a hairline: a round portrait (96 px, 72 px on phones) with a gold hairline ring and an ivory gap (`box-shadow`, no layout shift; the portrait is inset 5 px so the ring's outer edge lines up with the column), the full name as H3, the provisional focus in small text. Without a photo the portrait is a monogram: initials in Cormorant 600, ivory on navy. A photo uses the same circle and ring. The header nav stays short; the footer links to `#team`.
- Radii: buttons 10 px, cards 16 px, large frames 20 px, small chips 999 px only where they are data (criteria, score).
- Header: plain bar, transparent over the hero, solid paper with a hairline after 80 px of scroll. Mobile: wordmark, Warteliste button, menu sheet.
- Phones: the hero fits one screen with the match card starting inside it; a slim sticky waitlist bar appears once the hero has scrolled away.
- Legal pages (Impressum, Datenschutz): slim static paper header (dark wordmark, "Zur Startseite"), one centred column of max 42rem on paper (the header content uses the same centred measure), an ivory table of contents, sections divided by hairlines, H2 in Cormorant at 28–36 px, then the navy footer standing alone (`.ft-standalone`, no top rule). Missing contact data is shown in Gold dunkel with a short gold rule, never hidden. No motion.
- Guide pages (Ratgeber, `guide.css`, prefix `gd-`): the legal-page layout (header, 42rem column, ivory table of contents, hairline sections, standalone footer) plus: a byline row ("Team Sponsuno · Stand"), a "planned" note with a 2 px gold rule on the left, numbered steps with Gold dunkel numerals, a letter template as a bordered ivory block (`figure` with a caption, `pre` in Manrope that keeps line breaks, selectable, no copy button), a closing row with the navy primary button (Warteliste) and a quiet underlined demo link with its note, and an ivory "Weiterlesen" box listing the other guides with their descriptions. No motion, no JavaScript.
- Footer columns: Plattform, Mehr, Ratgeber (the four guides), Rechtliches. They wrap on narrow screens; at 520 px and below they form a 2x2 grid.

## Motion

Plan agreed on 2026-11-03 (replaces the old "one signature moment" budget). CSS scroll-driven animations (`animation-timeline: view()`) as progressive enhancement; no animation or scroll library, no scroll hijacking, no smooth-scroll override, no JS per scroll frame.

**Gate.** `index.html` sets `html.motion` unless the visitor prefers reduced motion, and `html.scroll-fx` when motion is on and the browser supports `animation-timeline: view()` (Chrome, Edge, Safari 26). The primitives in `site.css` are additionally wrapped in `@supports` and `prefers-reduced-motion: no-preference`. Section-specific scroll rules are written under `.scroll-fx`.
- Without `.scroll-fx` but with `.motion` (Firefox): elements keep the `data-reveal` fade (IntersectionObserver, opacity + 12 px, 0.6 s, once). Frames, photos and lines are simply static.
- Reduced motion, no JS, prerendered HTML: final state, nothing moves. Reduced motion switched on mid-visit also drops all `.scroll-fx` animations.

**Rules.** Animate only `opacity`, `translate`, `scale` (individual transform properties) and `clip-path`; no colour, size, blur or filter animation. Scroll-linked progress is linear; time-based motion uses `--ease-out`. UI scales at most 0.92 → 1 (icons and portraits down to 0.86, the KI device frame 0.8 on desktop); photos 1.18 → 1 inside their frame. Dark surfaces (the KI device) and things inside a block that already fades (icons, portraits) scale without their own fade (`sfx-scale`): stacked or partial opacity turns navy into grey. Opacity reaches 1 at 60 % of an element's range, the motion ends after `--scroll-dist` (40 vh, 32 vh on phones) of scroll from the moment its top enters, i.e. when its top sits at about 60 % of the viewport. Nothing above the fold at scroll 0 is hidden (the hero only recedes on the way out, the proof line is static). Pinned budget: at most two, each at most one extra viewport, none below 600 px. Used: one, the KI-Manager bento (≥ 961 px wide and ≥ 700 px tall, 50 vh hold, see Per section); the sticky titles of Problem and FAQ are plain sticky layout. No layout shift: only transforms, opacity and clips change. `will-change` only on the two signature elements if profiling asks for it.

**Details that keep it honest.**
- Timelines are measured against the real viewport: the default is `view(block 0px)` and every named `view-timeline` sets `view-timeline-inset: 0px` (the `auto` inset would take `scroll-padding`, i.e. the header on top and the sticky bar on phones, and shift every range; on viewports taller than the 940 px hero cap the hero would load already receded).
- Focus guard (`site.css`): `.scroll-fx [data-scroll]:focus-within { animation-name: none }`. A block holding focus shows its final state at once, so keyboard focus never lands on half-faded text or a faded focus ring.
- Tall viewports: where a section can be in view at scroll 0 (portrait tablets and monitors), its scroll animations are switched off by `min-height` media queries (`audience.css` 1140/1340/1700 px, `problems.css` 2000 px), so nothing visible at load starts hidden.
- Forced colours: the drawn hairlines (`::before` in Problem, Nicht nur Geld, Team) are hidden, the real border shows.
- Compositing: `opacity`, `translate` and `scale` run on the compositor; never put them on an SVG element (Chrome does not composite individual transforms on SVG), wrap it in a `span` (support icons, price markers). `clip-path` animations (photo frames, the waitlist surface, the check-mark wipe) repaint on the main thread by design; they are few and short (profiled smooth at 4× CPU throttling).

### Primitives (`site.css`, tokens in `tokens.css`)

Put `data-scroll="…"` on an element; keep `data-reveal=""` next to it where a fallback fade is wanted. One value per element, never on an element with its own CSS animation (wrap it). All primitive selectors have zero specificity, so a section class overrides them.

| `data-scroll` | Does | Default range | Tune with |
| --- | --- | --- | --- |
| `rise` | opacity 0 → 1, `translate` from (`--scroll-x`, `--scroll-y`) to 0 | `cover 0` → `cover --scroll-dist` | `--scroll-x` (0), `--scroll-y` (40 px, 24 px on phones) |
| `fade` | opacity 0 → 1 | same | |
| `zoom-in` | opacity 0 → 1, `scale` `--scroll-zoom-from` → 1, `translate` `--scroll-zoom-y` → 0, origin 50 % 60 % | same | `--scroll-zoom-from` (.92), `--scroll-zoom-y` (16 px) |
| `draw-x` / `draw-y` | a line grows: `scale` 0 → 1 from the left / top | same | |
| `photo` | on the frame around an `img`/`picture`/`video`: frame clip `inset(--scroll-photo-inset round r)` → `inset(0 round r)`, image `scale` `--scroll-photo-from` → 1; sets `overflow: clip` and the radius | `cover 0` → `cover --scroll-dist-long` | `--scroll-photo-from` (1.18, 1.12 on phones), `--scroll-photo-inset` (4 %; any `inset()` offsets, e.g. `6% 8%`), `--scroll-photo-radius` (16 px) |
| `frame` | a surface opens: `clip-path: inset(--scroll-frame-inset round --scroll-frame-radius)` → `inset(0 round --scroll-frame-radius-end)` | `entry 0%` → `entry min(100%, --scroll-dist-long)` (final once fully in view) | `--scroll-frame-inset` (`0 clamp(.5rem, 3vw, 3rem)`, always smaller than the gutter), `--scroll-frame-radius` (28 px, 20 px on phones), `--scroll-frame-radius-end` (0) |
| `recede` | to opacity `--scroll-recede-opacity`, `translate` `--scroll-recede-y`, `scale` `--scroll-recede-scale` while scrolling out; rest state = start | `exit 0%` → `exit 100%` | `--scroll-recede-y` (−6 vh), `--scroll-recede-scale` (1), `--scroll-recede-opacity` (.4) |
| `group` | no animation; under `.scroll-fx` its `data-reveal` fade is switched off because its children animate | – | |

Shared knobs: `--scroll-timeline` (default `view()`; set it to a named `view-timeline` such as `--hero` to drive children from a section), `--scroll-range-start` / `--scroll-range-end` (any `animation-range` value; they inherit, so set them on the element unless the whole container should share them), `--scroll-i` (stagger index; each step adds `--scroll-stagger`, 4 vh, 0 on phones). `data-scroll-stagger` on a parent numbers its children 0–5. Keyframes `sfx-rise`, `sfx-fade`, `sfx-zoom`, `sfx-scale` (zoom without the fade, same knobs), `sfx-photo`, `sfx-photo-frame`, `sfx-frame`, `sfx-draw-x`, `sfx-draw-y`, `sfx-recede` may be reused in section CSS with own timelines (for pseudo-elements: name a `view-timeline` on the element and point the pseudo-element at it).

### Per section

| Section | Motion |
| --- | --- |
| Hero | Copy fades up once on load (time-based, as before). Match card: the gold line draws (1 s), criteria tick, score appears (time-based signature). On scroll-out (≥ 961 px): the copy recedes (−8 vh, opacity .4), the match card drifts less (−3 vh, scale .96), the glow sinks; all on the hero's `--hero` timeline. Phones: no recede. |
| Header | Solid bar after 80 px (class toggle from an IntersectionObserver sentinel, no scroll handler). |
| Proof line | Static (sits at the fold at load). |
| Für wen | Head rises; tiles rise with stagger (2 vh steps and 32 px on four columns); each photo opens from an inset (6 % / 8 % on four columns, 4 % below) and settles from 1.18 to 1 inside its frame. |
| Problem | Head rises (sticky on desktop); points rise one by one; their hairlines draw from the left. |
| Ablauf | Head rises; steps rise; the gold line between the numerals fills with scroll, segment by segment, and each numeral lights up (gold tint disc) as its step reaches the reading line. |
| KI-Manager (signature 1, "into the product", pinned moment 1 of 2) | The navy device frame zooms from .8 to 1 without fading (a translucent navy frame reads as a grey slab); the draft sheet rises inside it (`cover 20vh` → `45vh`); the two light cards slide in from the right (24 px, 2 vh stagger) and are final before the device. From 961 px wide and 700 px tall the bento sticks below the header for 50 vh of extra scroll (`.ai-pin`: sticky bento plus an empty hold block, under `.scroll-fx` and no-preference only); the device runs on the pin's timeline and settles at 60 % of the hold, before the pin releases. Short desktops (< 700 px tall): no pin, device .8 → 1 over 60 vh. Phones and tablets (≤ 960 px): device .92 → 1 with a 16 px lift, cards rise. |
| Nicht nur Geld | Gold rule draws; head rises; the three kinds rise with stagger, their hairlines draw, icons scale in (.86 → 1, no own fade; the zoom sits on a `span` around the SVG). |
| Kosten | Head rises; the card zooms in (.96); the rows stay still; check marks wipe in from the left (clip-path), the open circle scales and fades in from its centre (.6 → 1); each marker is final once its top sits at about 75 % of the viewport (`cover 4vh` → `cover 0.6 × --scroll-dist`); the note fades. |
| FAQ | Head rises (sticky on desktop); rows rise one by one. Opening a row keeps its native height animation. |
| Team | Head rises; founders rise with stagger (also on phones, two columns); hairlines draw; portraits scale in (.86 → 1, no own fade). |
| Warteliste (signature 2, "the page opens") | The navy surface opens from an inset rounded card to full bleed as it enters (ivory behind it, continuous with the team band); from 961 px the inset is `clamp(1.5rem, 4vw, 3.5rem)` on top and `clamp(2rem, 6vw, 6.5rem)` at the sides with 36 px corners, below that `clamp(.75rem, 2vw, 1.5rem)` / `clamp(.5rem, 3vw, 3rem)` with 28 px (20 px on phones). It is full bleed before the footer comes into view. Head and form rise. |
| Footer | Top rises; the wordmark rises and scales from .9 to 1; both end at `entry min(100%, --scroll-dist)`, final once fully in view or earlier (they sit at the end of the page). |
| Sticky bar (phones) | Unchanged: slides in after the hero (time-based). |
| Hover | Colour and underline changes only. |

## Logo

The current mark (rounded navy square with a serif "S." and the wordmark "Spons|uno") comes from the CD. On the website the header and the footer use the **wordmark alone** (`src/assets/wordmark-light.svg`, `wordmark-dark.svg`, cut from the CD logo files); the square is kept for favicon and app icons (`public/favicon.svg`, and the PNG/ICO sizes generated from `src/assets/Sponsuno_Icon.svg` by `scripts/icons.mjs`; the apple-touch icon is a full navy square because iOS rounds the corners itself).

Share image (`public/og-image.png`, 1200 × 630, source `scripts/og/og-image.html`): the 135° navy gradient, the light wordmark, one gold hairline, the headline in Cormorant 600 ivory, one line in Manrope steel that says the platform is planned, the domain in Gold hell. No photos, faces or numbers.

Recommendation from the research (needs the team and the CD owner): refine rather than replace. Build on the two-tone "Spons|uno" and the gold thread, e.g. a custom-drawn wordmark where a gold stroke joins "uno". Before any logo work, run a trademark check (Swissreg/IGE, EUIPO): Sponsoo (sponsoo.de) is an established DACH sport-sponsoring marketplace with a similar name and an S monogram.

## Demo app

The demo (`/demo/`) uses the same tokens (`src/styles/tokens.css`) in an app layout:

- Shell: navy sidebar (268 px, full height) with the role switch and navigation; the gold banner ("Demo mit fiktiven Daten") sits on top of the ivory content column (max 1180 px). Below 900 px the sidebar becomes a navy bottom tab bar, the role switch moves into a row above the view, and toasts appear at the top.
- Active navigation: gold-light icon, faint gold background, a 2 px gold inset line on the left.
- Cards: same light and dark card styles as the landing page, smaller padding (1.1–1.5 rem). Headings in Cormorant, body in Manrope 1 rem.
- Match criteria always appear in the same order with the same marks: gold check (passt), half circle (teilweise), muted cross (passt nicht), each with a text equivalent.
- Status badges: Anfrage and Im Gespräch gold, Vereinbart navy, Aktiv green (`#E3EDE4` / `#2E5A36`, demo only), Abgeschlossen and Abgesagt muted.
- Avatars: sponsors use the gold monogram, athletes and clubs the navy one. The AI-generated persona photo appears only where it is labelled "KI-generiertes Symbolbild".
- Selected tabs are navy with ivory text; form fields have a navy focus border plus the standard focus outline.
- Kit classes are prefixed `ui-`; each view prefixes its own classes (`ov-`, `mt-`, `ps-`, `as-`, `pf-`, `sp-`).

## Imagery

- Landing page: free stock photos (Pexels licence or Unsplash licence only), in `src/assets/photos/`: the athlete avatar in the hero match card and the four tiles of "Für wen Sponsuno gedacht ist". They are always labelled "Symbolbild" (match card label; a note under the tiles) and never presented as Sponsuno users, partners or customers. Every one has an entry in `photoCredits` (content.ts), which the Impressum lists.
- Choosing stock photos: real people in a Swiss, Alpine or plainly European setting, natural light, not posed-corporate. No legible brand logos or sponsor prints, no recognisable celebrities, no children as main subject. Prefer views where the people are not the point (backs, side views, hands at work).
- One grade for the set: after cropping, the audience tiles get one shared grade (saturation evened out, levels 3–98 %, a slight warm tint in the highlights and a navy tint in the shadows) so the four read as one series. Keep the grade when a tile is replaced.
- Preparing them: crop and resize with `sips` to at most twice the display size (tiles 640 × 480, match avatar 192 × 192), JPEG quality about 58–78, strip metadata (`jpegtran -copy none -optimize -progressive`), aim for under 100 KB each. Originals stay outside the repo (`../photo-originals/`). Every `<img>` gets `width`/`height`, a German `alt` that describes the picture, `decoding="async"` and `loading="lazy"` below the fold.
- Demo: the AI-generated persona portrait (`src/assets/symbolbild-mtb-192.jpg`) stays there, always labelled "KI-generiertes Symbolbild".
- Founders: no photos yet, monograms instead (see Layout → Team). Only real, consented photos of the four founders may replace them; never stock or generated faces.
- Next step: a consented photo day (athletes, a sport club, a culture club, a local business owner, the founders, two or three places in the region), graded consistently (warm highlights, navy-leaning shadows). Those photos then replace the stock Symbolbilder.
- Logo files come from the CD (`src/assets`). Do not recolour, stretch or add effects.

## References

Redesign research (November 2026), what each one lends:

- Attio, Plane, incident.io, Railway (Mobbin): three-layer hero (headline, one sentence, two CTAs) next to a product visual.
- SchoolAI, Later, Sweatpals (Mobbin): audience-named CTAs for a two-sided marketplace ("Ich suche Sponsoren" / "Ich möchte sponsern").
- Copilot Money (Mobbin): dark hero with one soft glow instead of a moving background.
- Klaviyo, Calendly, Mintlify (Mobbin): one framed product card as the hero visual.
- Oyster (Mobbin): two-track "how it works" (one track per side of the market).
- Sana, Claude (Mobbin): bento with one dark product card and small light cards.
- Fresha (Mobbin): fee rows instead of plan cards.
- Hims (Mobbin): two-column FAQ with a sticky title.
- Telescope (Mobbin): minimal waitlist block.
- Oryzo, Justin Jefferson (Awwwards): one signature idea, strict two-colour discipline, gold that reads as sport when it stays rare.
