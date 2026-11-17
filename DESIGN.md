# DESIGN.md – Sponsuno visual system

Design system **v2 «Turnhalle»** (November 2026). It replaced v1.0 («Graphit, Messing, Kalk») on the owner's direction of 2026-11-17: *alive, less text, stickers, Easter eggs, scroll effects, icons and vector graphics, animation that just works*. This file is the source of truth for how the website looks and moves. If the code and this file disagree, fix one of them in the same change.

Tokens are CSS custom properties in [`src/styles/tokens.css`](src/styles/tokens.css); the base layer is [`src/styles/site.css`](src/styles/site.css); the kit (stickers, icons, court lines, three scroll primitives) is [`src/styles/kit.css`](src/styles/kit.css) with its components in `src/components/kit/`; each section has its own stylesheet in `src/styles/sections/`.

## The idea

**Die Mehrzweckhalle.** One hall floor carries the lines of many sports, and in the evening the Musikgesellschaft rehearses there. Sport, culture and local business meet in that room, and the loop in the wordmark is itself such a line. So: ink type on a light parquet ground, coloured court lines that draw themselves as you scroll, and stickers (the kind clubs collect in albums) as the playful layer.

## Principles

1. **Big type, few words.** One giant word or one short sentence per screen, almost no body text. If a block needs a second paragraph, it is the wrong block.
2. **One idea per block.** Hero: the headline with stickers on it. Statement: words that fill. Word band: giant words that slide. Steps: three sticker scenes. Doors: two colour tiles with one drawing each. Waitlist: one giant line and the form. Do not add a second effect to a block.
3. **Colour comes as lines, stickers and a few full bands.** Text and buttons stay ink (on light) or parquet and yellow (on ink). The four line colours appear as court lines, stickers, icons and bands.
4. **Alive, but it just works.** Motion follows the scroll or answers the pointer; nothing starts by itself and runs longer than 5 s; every motion has a still final state for reduced motion, no JavaScript and browsers without scroll timelines.
5. **Made by people.** Stickers sit a little crooked, overlap letters and edges, and can be dragged. Exact alignment everywhere else (one container, one gutter, flush lockups) is what makes the crooked parts read as intended.
6. **Honest content without meta-clutter.** One launch signal per page, one discreet «Beispieldaten» label per illustration with example people or firms, no fake logos, numbers or testimonials, no stock photos (copy rules in AGENTS.md).
7. **Laut ist nur die Schlaufe, und die Sticker.** The logo stays untouched (see Logo).

What we removed and should not bring back: WebGL, canvas physics, 3D, scroll hijacking and smooth-scroll libraries, glass, gradients, drop shadows, stock photos on the landing page, the conveyor hero picture, the pinned scroll story, long explanatory sections on the landing page.

## Colour

Raw tokens (German names) in `tokens.css`. Contrast values are WCAG ratios, measured.

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| `--tinte` | `#1A1C20` | Text, logo, primary button on light, ink bands, footer | 15.5:1 on parkett, 14.0:1 on parkett-2, 9.8:1 on gelb |
| `--tinte-2` | `#2A2D33` | Cards and fields inside ink areas | |
| `--parkett` | `#F8F4EA` | Page ground, text on ink | 15.5:1 on tinte, 4.8:1 on rot, 7.3:1 on blau |
| `--parkett-2` | `#EFE8D8` | Alternate band, cards on parquet | |
| `--grau` | `#55585E` | Body text on parquet | 6.5:1 on parkett, 5.8:1 on parkett-2 |
| `--grau-hell` | `#B9BBBF` | Body text on ink | 8.9:1 on tinte, 7.2:1 on tinte-2 |
| `--blau` | `#1F4E9C` | Line colour; accent text and links on parquet; blue band | 7.3:1 on parkett, 6.5:1 on parkett-2; white on blau 8.0:1 |
| `--rot` | `#C23B24` | Line colour; red band; small text on parquet only where needed | 4.8:1 on parkett; white on rot 5.3:1 |
| `--gruen` | `#1A7552` | Line colour; green fills | 5.2:1 on parkett; white on gruen 5.7:1 |
| `--gelb` | `#EDBE3A` | Line colour; accent on ink; yellow band and button with ink text | 9.8:1 on tinte, 7.9:1 on tinte-2. **1.6:1 on parkett: never text on light** |
| `--linie` | `#E2DAC6` | Hairlines and card borders on parquet | |
| `--linie-dunkel` | `#3A3E45` | Borders inside ink areas | |
| `--weiss` | `#FFFFFF` | Die-cut border of stickers; text on blue, red and green | |
| `--error-on-dark` | `#F2C5B5` | Form error text on ink (documented extra) | 8.8:1 on tinte-2 |

**Role tokens** are the layer section CSS uses: `--bg`, `--bg-alt`, `--surface`, `--heading`, `--text`, `--line`, `--accent-text`, `--btn-bg` / `--btn-fg` / `--btn-bg-hover`, `--focus`. `:root` holds the parquet values (accent and focus blue). A block sets them for its ground with a surface class from `site.css`:

| Class | Ground | Roles |
| --- | --- | --- |
| `.surface-parkett`, `.surface-parkett-2` | parquet, parquet 2 | the `:root` roles (background only) |
| `.surface-tinte` | ink | headings parquet, text grau-hell, lines linie-dunkel, accent and focus yellow, cards tinte-2 |
| `.surface-blau`, `.surface-rot` | blue, red | text and focus white |
| `.surface-gelb` | yellow | text and focus ink |

Rules:
- Flat colours only: no gradients, no drop shadows, no glass. A sticker's hairline and the 1 px ring of floating pills (`box-shadow: 0 0 0 1px rgba(26,28,32,.12)`) are outlines, not shadows.
- Small text at least 4.5:1, checked by axe in CI on every page **without exceptions** (`e2e/a11y.spec.ts`). Never yellow text on light; red or green as small text only at 4.5:1 or more.
- At most one full colour band per screen where the order allows it. The one accepted exception is the run blue tile, red tile, yellow band at the end of the page (prescribed order).
- One light theme. No dark mode, no theme switch; `color-scheme: light` on `:root` and in every page's meta, plus `<meta name="darkreader-lock">`. `theme-color` is `#F8F4EA` on the landing page (opens on the parquet hero) and `#1A1C20` on every static page (opens on the ink header and band).
- Gone with v1.0: graphit, kalk, paper, brass, steel, ink, rule, every `--grad-*`. No old token name may appear in CSS that is built.

## Typography

| Role | Face | Notes |
| --- | --- | --- |
| H1, H2, giant words, big numerals, anything with `.display` | **Archivo Wide 800** (`--display`): one static instance of Archivo, width 125, weight 800 | tracking `-0.02em`, line-height 0.98 to 1.04, sentence case, `hyphens: manual` with soft hyphens in `content.ts` (the face is about 0.69 em per character: long German words need them) |
| Text, UI, labels, buttons | **Schibsted Grotesk 400 and 600** (`--sans`) | the wordmark's family. 700 is gone; never use it |

- Exactly **three font files** are preloaded and fetched on every page (Archivo Wide 800, Schibsted 400, Schibsted 600; core subsets, self-hosted, cut by `npm run fonts`). Metric-matched fallbacks (`Archivo Wide Fallback`, `Schibsted Fallback` on Arial, `tokens.css`) keep the swap from moving anything.
- Scale (`site.css`): `--fs-hero` `clamp(1.5rem, 8.6vw, 6.5rem)` (the hero H1 goes further, see Layout), `--fs-h1` `clamp(1.875rem, 1.1rem + 3.4vw, 3.75rem)`, `--fs-h2` `clamp(1.75rem, 1.2rem + 2.3vw, 3rem)`, `--fs-sub` up to 1.625rem, `--fs-h3` 1.25rem, `--fs-lead` up to 1.3125rem, `--fs-body` 1.125rem / 1.6, `--fs-small` 0.875rem, `--fs-label` 0.75rem.
- Labels (`.label`): uppercase, 12 px, 600, tracking 0.15em, in `--accent-text` (blue on parquet, yellow on ink, white on blue and red).
- H2s that should look like H3 on static pages carry `.pg-h3` (Schibsted 600).

## Shapes

- **Pills** (999 px) for every button and chip. Buttons: `.btn` plus `.btn-tinte` (ink fill: primary on parquet, parquet 2 and yellow), `.btn-gelb` (yellow fill: primary on ink), `.btn-parkett` (parquet fill: primary on blue and red), `.btn-outline` (2 px outline in `--heading`, any ground; `.btn-ghost` is its old name). `.btn-sm` is 44 px high.
- **Cards**: radius 20 px (`--radius`), 1 px `--line` border, no shadow. Small parts and inputs 8 px (`--radius-sm`).
- **Court lines**: 6 px stroke at 1440 px wide, 4 px on phones (`--cl-w`), round caps and joins, no fills, `vector-effect: non-scaling-stroke`.
- **Stickers**: flat fills from the palette, a white die-cut border (about 5 px at 96 px), one hairline `rgba(26,28,32,.12)` around the white, one ink line weight for the whole set, rotation between -12° and 12°, no shadows, no gradients.
- **Icons**: 24 px grid, 2 px stroke (it scales with the size), round caps and joins, `currentColor`.

## Kit (`src/components/kit/`, `src/styles/kit.css`)

Decoration is always `aria-hidden`. The kit stylesheet is unlayered and loaded before the section stylesheets, so a section rule wins a tie.

- **`Sticker`** (`id`: `ball`, `note`, `brezel`, `startnummer`, `wimpel`, `pfeife`; `size`, `rotate`, `collectable`, any span attribute). Markup `span.stk[data-sticker][data-collectable] > span.stk-in > svg`. The size is set inline (`--stk-size`): for a responsive size set `inline-size` on a selector more specific than `.stk`. `data-collected` turns the drawing into a dashed outline in `currentColor`. `rotate` and `scale` on `.stk` belong to the kit; code that moves a sticker uses `translate`. `BALL_PANELS` and `BALL_SEAMS` are exported for drawings that repeat the ball (the doors).
- **`TextSticker`** (`span.tstk[data-tone]`, tones gelb, blau, rot, gruen, tinte, parkett): a pill with the white border and real text (13 px, `--stk-fs`). Used for the launch signal, «Beispieldaten», «4 von 4», the album counter.
- **`Icon`** (`svg.icn`, names in `ICON_NAMES`): line icons for the statement points, match card chips, buttons and badges.
- **`CourtLines`** (`svg.cl`, variants `hero`, `page`, `band`, `door-sport`, `door-firma`; `draw="load" | "scroll"`): absolutely positioned in a `position: relative` parent. `data-line` picks the colour (blau, rot, gruen, gelb, hell). `BALL_PATH` (the yellow line of `door-sport`) is exported. Hidden under forced colours.
- **`.lg-badge`** (`legal.css`): the round sticker-style badge of the static pages (green check = decided, dashed slot = open, kit icons for kinds).

## Layout and section order

Container 1200 px (`--container`), gutter `clamp(1rem, 4vw, 2.5rem)`, section padding `--section-pad` `clamp(4.5rem, 3rem + 6vw, 8.5rem)`. No horizontal overflow from 320 to 2560 px.

**Landing page**, seven short blocks:

| # | Block | Ground | What it is |
| --- | --- | --- | --- |
| 1 | Header (`Header.tsx`) | transparent, parquet or ink | Wordmark, nav (So funktioniert es, Kosten, Fragen, Über uns), waitlist pill. Transparent on the hero; solid parquet with a hairline after 80 px; solid ink with the parquet wordmark and a yellow pill while an ink band (`data-header-dark`: word band, footer) crosses the bar's lower edge. Over blue, red and yellow it stays the parquet bar. Without JS always the solid parquet bar. |
| 2 | Hero (`#top`) | parquet | One screen, centred. Launch signal as a yellow text sticker, the H1 as large as the width allows (`clamp(1.5rem, min(8.6vw, 14svh), 12.5rem)`, two lines at every width, it breaks out of the container) with the accent word in blue, one lead sentence, two pill buttons. Behind: hall lines drawn once on load, hung so the red base line sits 56 px above the hero's lower edge. Six draggable, collectable stickers on and around the headline (phones: four, in a band of their own above the badge). A round arrow on the base line leads to the statement. |
| 3 | Statement (`#idee`) | parquet | Three sentences in Schibsted 600 (26 px phones, 44 px desktop), one per line, words filling from grey to ink; two round signs (ball on blue, shop on red: the colours of the two doors) in front of the first words. Then three points with a line icon in a 48 px ring (blue, red, green). |
| 4 | Word band (`.wb`) | ink | A small label and two rows of giant words that slide in opposite directions. At rest the rows are a lockup flush from gutter to gutter («Sport Kultur» over «Triathlon Chor Turnverein»; phones «Sport» over «Turnverein»); row two alternates parquet fill and outline. Three stickers sit on letters. Lane lines with yellow ticks at the upper and lower edge. The words are drawn by CSS from `data-word`; screen readers get the label and one plain list of all words. |
| 5 | So funktioniert es (`#ablauf`) | parquet 2 | H2, three steps, each a sticker scene (220 × 196 px, 1.2 × from 1100 px), a small number, a title and one sentence. Under them the match card («Beispieldaten»): two vector avatars and a green result panel with the criteria as chips; from 861 px its three columns equal the steps' columns. |
| 6 | Zwei Türen (`#fuer-wen`) | blue, red | Two full-height tiles side by side (stacked below 861 px): label, title in the display face, one sentence, parquet pill button with an arrow that sets the waitlist role. Each has one large white line drawing bottom right (a court whose ball rolls into the goal; a shop whose sign lights up) and one collectable sticker. |
| 7 | Warteliste (`#warteliste`) + Footer | yellow, then ink | Giant H2 in ink on yellow with a start-number sticker on its end, the form in an ink card, a whistle sticker on a parquet court line. Footer: link columns, the sticker album (landing page only), the giant loop wordmark in parquet, copyright. |

Two layers lie over and under the blocks: the **page tape line** (one yellow court line behind the content that comes out under the hero, crosses the page below it and runs down the margin beside the statement; only from 1240 px wide, where the margin is at least 60 px, and only with CSS anchor positioning) and the **Easter eggs** (see below).

Phones: a floating ink pill (`StickyCta`, white sticker edge, the closing line and the yellow button) appears once the hero has scrolled away and hides near the waitlist and the footer.

**Static pages** (`/kosten/`, `/fragen/`, `/ueber-uns/`, legal pages, 404, confirmation): ink header (`PageHeader`, not fixed) running into the ink **page head band** (`PageBand`): the H1 in the display face, the intro, and the hall motif: a centre circle rising from the lower edge, a yellow halfway line and one sticker on the centre spot, half over the edge (ball on `/kosten/`, whistle on `/fragen/`, pennant on `/ueber-uns/`, pretzel on `/impressum/`, note on `/datenschutz/`, start number with a green check on the confirmation page; the 404 page shows only the ball's dashed album slot: the sticker is missing). Text never crosses a line. Below it the parquet page surface. Topic pages end on the same yellow band as the landing page («Früh dabei sein.», ink button, one sticker on the upper edge). `/kosten/`: four cost cards two by two with round badges, the first card ink with «Keine» in the display face. `/fragen/`: full-width question cards with a yellow plus disc. `/ueber-uns/`: portraits cut like stickers, blue monograms, an ink status card. 404 and confirmation: links as large display rows with a round arrow button. Legal pages: one reading column (42rem), section and contents numbers in the display face.

## Motion

CSS only: scroll-driven animations (`animation-timeline: view()` / `scroll()`) as progressive enhancement, one IntersectionObserver for reveals, CSS transitions for hover and press. No animation or scroll library, no scroll hijacking, no smooth-scroll override, no canvas, no JavaScript per scroll frame.

**Gate.** `index.html` sets `html.motion` unless the visitor prefers reduced motion, and `html.scroll-fx` on top where the browser supports `animation-timeline: view()`. Static pages ship no script and get neither (their band draws once on load with plain CSS, guarded by `prefers-reduced-motion`).

**Fallbacks, the same for every effect.** The static style of an element is its final state; keyframes only describe where it starts.

| Situation | What the visitor gets |
| --- | --- |
| Scroll timelines (`.scroll-fx`) | scroll-linked motion |
| Motion, no scroll timelines (Firefox, older Safari) | the `data-reveal` fade (opacity + 12 px, once) and time-based draws when a block comes into view; rows untranslated, words in their final colour |
| Reduced motion | final state, nothing moves (checked in CI: zero running animations) |
| No JavaScript | final state, everything visible (checked in CI) |

**Rules.**
- Allowed properties: `opacity`, `translate`, `scale`, `rotate`, `clip-path`; for the three effects below also `color` and `background-color` (fill-words), `stroke-dashoffset` / `stroke-dasharray` (draw) and `offset-distance` (the ball on its path). Nothing else: no size, blur or filter animation, no layout shift.
- Scroll-linked progress is linear; time-based motion uses `--ease-out`.
- Nothing visible at scroll 0 starts hidden or half-animated. Where a block can be in view at load (tall screens), its effect starts whole (the statement is evenly grey and fills over the first 44 vh of scroll) or is switched off by a `min-height` query.
- Every element is final once it is comfortably in view (about 50 to 60 % down the viewport).
- Nothing starts by itself and runs longer than 5 s (WCAG 2.2.2). Load motion is over after about 1.5 s.
- Named `view-timeline`s set `view-timeline-inset: 0px`. Set `animation-timeline` and `animation-range` after any `animation` shorthand.
- Focus guard (`site.css`, `kit.css`): a `data-scroll` block that holds keyboard focus shows its final state at once.
- Never put `scale` or `translate` animations on an SVG element (wrap it in a `span`); `rotate` and `offset-distance` on SVG groups are used for the door ball only.

**Kit primitives** (`kit.css`):

| `data-scroll` | Does | Tune with | Still fallback |
| --- | --- | --- | --- |
| `draw` (on a container, or `draw="scroll"` on `CourtLines`) | its `.cl-path` lines draw with the scroll, each further path 5 vh later | `--draw-start`, `--draw-end`, `--draw-stagger` | lines fully drawn (no dash pattern is ever left) |
| `fill-words` (on a paragraph with `span.w` words, `--i` per word, `--n` on the block) | words go from grey to their own colour one after another | `--fill-from`, `--fill-to`, `--fill-soft` | final colour |
| `slide-x` (on a row; `data-dir="right"` reverses) | the row slides sideways across its pass through the viewport | `--slide`, `--slide-start`, `--slide-end`, `--scroll-timeline` | untranslated |

`data-draw="load"` draws court lines once on load (1 s each, 0.1 s stagger). Keyframes that may be reused in section CSS: `stk-settle`, `stk-wiggle`, `stk-pop`, `kit-draw`, `kit-fill`, `kit-slide-left`, `kit-slide-right`, `cl-roll`.

**Base primitives** (`site.css`, unchanged from v1.0): `data-reveal` (fade once), and `data-scroll="rise | fade | zoom-in | draw-x | draw-y | photo | frame | recede | group"` with the `--scroll-*` knobs. The landing page uses `rise` and `zoom-in` in the footer; the others remain for the parked pages.

**Stickers.** A small settle when they first appear (scale 0.9 to 1, rotating into place, 360 ms, once; inside a `data-reveal` block when it comes in), a wiggle on hover (fine pointers), a lift on press, a pop when collected.

**Per block.**
- Hero: lines draw on load, stickers are stuck on one after another (0.45 to about 1.3 s), then drift up at different speeds while the first screen scrolls away (`scroll(root)`; the pennant sways around its foot).
- Statement: `st-fill`, its own keyframe on the kit's timeline, starts from a **solid grey** (`rgb(132,133,135)`, 3.4:1 on parquet; the type is at least 26 px, large text) instead of the kit's 35 % alpha, so the unfilled words pass contrast. Final when the paragraph's top is at half height. The round signs fill with their word. The point rings draw once.
- Word band: both rows on the band's own view timeline, opposite directions; the lockup is hit when the band is mid-viewport. Lane lines draw with the scroll.
- Steps: each step reveals with a 90 ms stagger; inside, the line draws, the stickers settle one by one, the check pops (about 1 s). Match card: avatars, check and chips pop in turn.
- Doors: the drawing draws with the scroll (`--kit-draw`), the ball rides the tip of the yellow line and spins, the shop sign turns yellow at the end. On hover or keyboard focus the ball rolls in again and the sign flickers once.
- Waitlist: the parquet court line draws with the scroll (from 961 px). Footer: columns rise, the wordmark zooms in.
- Page tape line: drawn about 2.8 times as fast as the scroll, on the timeline of `<main>`.
- Static page band: lines draw once on load and the sticker settles (all done by 1.1 s); stickers wiggle on hover.

## Easter eggs

Optional layers on top of `aria-hidden` decoration (`src/lib/eggs.ts` with `src/styles/eggs.css`, a lazy chunk fetched when the browser is idle; the album store and markup are in `Album.tsx`).

1. **Stickeralbum.** A click or tap on any `[data-sticker][data-collectable]` collects it: the sticker leaves its dashed outline, its id counts once (copies of the same sticker in other blocks do not count again). A yellow counter chip (star, «2/6») appears in the header and the album in the footer fills its six slots. All six: a 1.5 s burst of little loop signs (none with reduced motion) and the line «Album voll. Sie haben ein Auge für Details.» Every id can be found on phones too (hero: ball, note, brezel, wimpel; steps and waitlist: startnummer; waitlist: pfeife).
2. **Drag.** Hero stickers (`data-draggable`) follow the pointer after a 6 px threshold, stay inside the hero and stay where they are dropped. A drag never collects.
3. **«tor».** Typing t, o, r outside a form field shows a sticker-style scoreboard («TOR! 1:0», counting up) bottom centre for 2 s.
4. **Loop.** A click on the loop of the giant footer wordmark makes its last «o» bounce twice (0.9 s; a clipped second copy of the same image moves, the logo's geometry is untouched).

Rules (also in AGENTS.md):
- **State in memory only.** No cookie, no `localStorage`, no `sessionStorage`, no IndexedDB: the Datenschutzerklärung says nothing is stored. A reload starts again at 0/6. CI checks this.
- **Never needed to use the page.** Nothing an egg shows is content; the page is complete without the chunk and without JavaScript (the album is prerendered empty with its hint).
- **Hidden from assistive technology and the keyboard.** Album, counter chip, scoreboard and stickers are `aria-hidden`; nothing is focusable (the chip has `tabindex="-1"`), nothing is announced, focus never moves.
- No listener per scroll frame; `touch-action: none` only on the draggable stickers themselves.

## Logo

Unchanged from v1.0. The wordmark **«sponsuno»** in lowercase, Schibsted Grotesk 700 outlines, where u and n share one stem and become a loop («so wie aus Verein und Firma eine Partnerschaft»). It is never set as text: no font has the loop. Files: `src/assets/wordmark-dark.svg` (ink, on light), `wordmark-light.svg` (parquet, on ink), `Sponsuno_Logo_dunkel.svg` / `_hell.svg` (the same, used by the parked demo). The loop alone (`src/assets/loop.svg`, `currentColor`) is the small mark: favicon and app icons (`public/favicon.svg`, and the PNG/ICO sizes generated from `src/assets/Sponsuno_Icon.svg`, a flat ink tile with a parquet loop, by `scripts/icons.mjs`). Clear space: the x-height of the wordmark all round. Minimum size: 16 px high on screen, 6 mm in print; below that the loop alone.

Never: stretch, rotate, recolour (single colour only: ink or parquet), add shadows or outlines, type «sponsuno» with a normal u and n, set the loop next to the word, or stick a sticker on the wordmark. The footer's bounce (Easter egg 4) moves a clipped copy for under a second and leaves the image as it was.

Share image (`public/og-image.png`, 1200 × 630, source `scripts/og/og-image.html`, rendered with Chromium): parquet ground, «Sponsoring, das zusammenpasst.» in Archivo Wide with the last word in blue, the ink loop wordmark, a blue circle and a red line, ball and note stickers, the launch signal as a yellow text sticker, the domain. No photos, faces or numbers. The sticker drawings in that file are copies: refresh them when `Sticker.tsx` changes.

Open: test the loop's legibility with three to five people who do not know Sponsuno; trademark check of name and logo (IGE, DACH) before the launch; CMYK and Pantone values for the palette with the printer.

## Imagery

- **No stock photos.** The landing page is built from vectors only (CI checks that it requests no raster image). Illustrations are stickers, line icons and court lines from the kit; all drawings are original and use only the palette.
- The only photos on the site are the founders' portraits on `/ueber-uns/` (real, consented, square JPEGs in `src/assets/photos/team-*.jpg`, cut like stickers with a white edge); a founder without a photo gets a blue monogram. Never stock or generated faces for the founders.
- Example people and firms appear only as vector avatars inside an illustration labelled «Beispieldaten» (the match card).
- Parked: the stock photos of the old audience section and match card stay in `src/assets/photos/` with their credits in `parkedPhotoCredits`; a photo that comes back needs its credit in `photoCredits` and the Symbolbild note (AGENTS.md).

## Parked

Not imported, not built; sources stay in the repo (list and how to bring one back: AGENTS.md → «Parked (not built)»).

- From the old landing page: the conveyor hero picture, the scroll story (`Story.tsx`, `StoryArt.tsx`, `lib/storyLayout.ts`, `story.css`, `story-art.css`), the proof line (`ProofLine.tsx`), the audience photo cards (`Audience.tsx`), the two-track «So funktioniert es» (`HowItWorks.tsx`), `InputIcon.tsx`. Their stylesheets were only renamed to the new tokens mechanically and have not been looked at in the new look. `Statement` and the parked story both use the class prefix `st-`: rename one before the story could ever come back.
- Pages: the product preview `/demo/` (`src/demo/`), `/fuer-firmen/`, `/ki-manager/`, the four guides (their block styles are in `guide-parked.css`). They compile with the new tokens but keep their v1.0 layouts; each needs a design pass before it is published again.
- Out of scope of v2 so far: the waitlist e-mails (live in Brevo in the v1.0 look), the README screenshots, the earlier logo kit in `brand/`.

## References

- soda.today (owner's reference for the feeling, 2026-11-17): full-colour bands, one giant word per screen, stickers on letters, a word that slides with the scroll, text that fills in, lots of space. A reference for feeling only: no asset, word or layout is copied.
- Sticker albums of sport clubs and the taped lines of a Swiss Mehrzweckhalle (the idea).
- Earlier research (v1.0, Mobbin): audience-named CTAs for a two-sided marketplace (SchoolAI, Later, Sweatpals); fee rows instead of plan cards (Fresha); a minimal waitlist block (Telescope).
