# DESIGN.md – Sponsuno visual system

Design system **v2 «Turnhalle»** (November 2026). It replaced v1.0 («Graphit, Messing, Kalk») on the owner's direction of 2026-11-17: *alive, less text, stickers, Easter eggs, scroll effects, icons and vector graphics, animation that just works*. A clean-up pass followed on 2026-11-18 (owner: *«stickers are okay but a bit of a gimmick, make it look cleaner»*): firms should trust this site with money, so the playful layer was cut back to the **clean rules** below. A colour pass followed the same day (owner, after the clean-up was described to him: *«it looks a lot playful»*): what still read like a toy box was a full blue tile beside a full red tile, followed by a full yellow band. Since then the **surface rule** holds (see Colour): large surfaces are parquet, ink and one brand colour, blue; red, yellow and green are accents only. This file is the source of truth for how the website looks and moves. If the code and this file disagree, fix one of them in the same change.

Tokens are CSS custom properties in [`src/styles/tokens.css`](src/styles/tokens.css); the base layer is [`src/styles/site.css`](src/styles/site.css); the kit (stickers, icons, court lines, three scroll primitives) is [`src/styles/kit.css`](src/styles/kit.css) with its components in `src/components/kit/`; each section has its own stylesheet in `src/styles/sections/`.

## The idea

**Die Mehrzweckhalle.** One hall floor carries the lines of many sports, and in the evening the Musikgesellschaft rehearses there. Sport, culture and local business meet in that room, and the loop in the wordmark is itself such a line. So: ink type on a light parquet ground, ink and blue as the only other grounds, a few thin court lines that draw themselves as you scroll, and six small stickers (the kind clubs collect in albums) as the one playful layer.

## Principles

1. **Big type, few words.** One giant word or one short sentence per screen, almost no body text. If a block needs a second paragraph, it is the wrong block.
2. **One idea per block.** Hero: the headline. Statement: words that fill. Word band: giant words that slide. Steps: three calm line drawings. Doors: two tiles, blue and ink, with one drawing each. Waitlist: one giant line and the form in an ink card. Do not add a second effect to a block.
3. **Three grounds, colour as an accent.** Large surfaces are parquet, ink and blue, nothing else (the surface rule, see Colour). Text and buttons stay ink (on light) or parquet and yellow (on ink). Red, yellow and green appear only small: court lines, stickers, icons, signs and tags, the yellow button on ink, the green match result. Never more than two colours of court lines in one block (clean rule 3), and a drawing has one accent colour (clean rule 5).
4. **Alive, but it just works.** Motion follows the scroll or answers the pointer; nothing starts by itself and runs longer than 5 s; every motion has a still final state for reduced motion, no JavaScript and browsers without scroll timelines.
5. **Calm first, one wink per block at most.** Everything sits on the page container (the header's left and right edges), upright and flat. The six stickers are the only things that sit a little crooked; exact alignment everywhere else is what makes them read as intended.
6. **Honest content without meta-clutter.** One launch signal per page, one discreet «Beispieldaten» label per illustration with example people or firms, no fake logos, numbers or testimonials, no stock photos (copy rules in AGENTS.md).
7. **Laut ist nur die Schlaufe.** The logo stays untouched (see Logo).

### The clean rules (2026-11-18, binding; `e2e/site.spec.ts` → «clean rules» checks 1 to 3, the headline of rule 4 and «4 von 4» at 1440, 1024, 768 and 390 px)

1. **Sticker budget.** The landing page holds exactly **six** picture stickers, every sticker id exactly once, every one collectable (the album has six slots): the ball in the hero (on a hall line, never on or over the tag, headline, lead or buttons, also when it is dragged; the only draggable one), the note in the word band (on the upper right corner of «Kultur», hiding no letter), the pennant in the blue door tile and the pretzel in the shop window of the ink one (both part of the drawing), the start number above the waitlist title, the whistle beside the album in the footer. Statement, steps and match card carry none. At most 96 px (72 px up to 760 px wide), tilted by at most 8° either way, at rest and in motion (settle, hover and press turn a sticker towards upright, never further out). A static page has one small sticker in its page head band (72 px at most, not collectable) and no other.
2. **Nothing else is tilted.** Labels are the flat `Tag` (no tilted pills, no white die-cut edges on anything but the six stickers). Avatars, signs, badges, portraits, the album's slots, the counter chip and the «TOR!» scoreboard are flat and upright.
3. **Hall lines are thin and few.** 3 px at 1440 px wide, 2 px on phones. At most **two** line colours visible in any one block. No line passes behind a headline, a text, a button or a form field at any width: lines live in margins, corners and along block edges. The hero's base line stops before the round arrow and goes on after it (a gap of 12 px either side), so it does not run behind that button either. No decorative tick marks or rays.
4. **Alignment and air.** Content sits on the container grid; the hero headline stays big and centred but inside the container with visible side margins; blocks share one vertical rhythm (`--section-pad`: statement, word band, steps, doors, waitlist).
5. **Illustrations in one calm style:** an ink (or, on the blue and the ink door tile, white) line of even weight plus one accent colour per drawing. No sticker piles.

What we removed and should not bring back: WebGL, canvas physics, 3D, scroll hijacking and smooth-scroll libraries, glass, gradients, drop shadows, stock photos on the landing page, the conveyor hero picture, the pinned scroll story, long explanatory sections on the landing page.

## Colour

Raw tokens (German names) in `tokens.css`. Contrast values are WCAG ratios, measured.

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| `--tinte` | `#1A1C20` | **Surface** (word band, firm door tile, waitlist card, static header and page head band, footer); text, logo, primary button on light | 15.5:1 on parkett, 14.0:1 on parkett-2, 9.8:1 on gelb (the yellow button) |
| `--tinte-2` | `#2A2D33` | Cards and fields inside ink areas | |
| `--parkett` | `#F8F4EA` | **Surface** (page ground: hero, statement, waitlist); text on ink; the pill button on blue and on the ink door tile | 15.5:1 on tinte, 7.3:1 on blau |
| `--parkett-2` | `#EFE8D8` | **Surface** (alternate band: steps), cards on parquet | |
| `--grau` | `#55585E` | Body text on parquet | 6.5:1 on parkett, 5.8:1 on parkett-2 |
| `--grau-hell` | `#B9BBBF` | Body text on ink | 8.9:1 on tinte, 7.2:1 on tinte-2 |
| `--blau` | `#1F4E9C` | **Surface, the one brand colour** (sport door tile, closing band of the topic pages); line colour; accent text and links on parquet | 7.3:1 on parkett, 6.5:1 on parkett-2; white on blau 8.0:1, parkett on blau 7.3:1 |
| `--rot` | `#C23B24` | **Accent only, never a surface.** Line colour (the hero's base line), small round signs and badges with a white icon, the picked row of step 2 | 4.8:1 on parkett; white on rot 5.3:1 |
| `--gruen` | `#1A7552` | **Accent only, never a surface.** The match card's result panel (the one green that carries meaning) and check badges | 5.2:1 on parkett; white on gruen 5.7:1 |
| `--gelb` | `#EDBE3A` | **Accent only, never a surface.** Line colour (word band, waitlist), tags, labels and underlines on ink, the primary button on ink with ink text, the shop sign and the ball of the door drawings | 9.8:1 on tinte, 7.9:1 on tinte-2. **1.6:1 on parkett: never text on light** (the waitlist's yellow line on parquet is decoration and carries no meaning) |
| `--linie` | `#E2DAC6` | Hairlines and card borders on parquet | |
| `--linie-dunkel` | `#3A3E45` | Borders inside ink areas | |
| `--weiss` | `#FFFFFF` | Die-cut border of the picture stickers (nothing else has one); text on blue and on the small red and green signs; the line drawings of the two door tiles | 8.0:1 on blau, 17.1:1 on tinte |
| `--error-on-dark` | `#F2C5B5` | Form error text on ink (documented extra) | 8.8:1 on tinte-2 |

**Role tokens** are the layer section CSS uses: `--bg`, `--bg-alt`, `--surface`, `--heading`, `--text`, `--line`, `--accent-text`, `--btn-bg` / `--btn-fg` / `--btn-bg-hover`, `--focus`. `:root` holds the parquet values (accent and focus blue). A block sets them for its ground with a surface class from `site.css`:

| Class | Ground | Roles |
| --- | --- | --- |
| `.surface-parkett`, `.surface-parkett-2` | parquet, parquet 2 | the `:root` roles (background only) |
| `.surface-tinte` | ink | headings parquet, text grau-hell, lines linie-dunkel, accent and focus yellow, cards tinte-2 |
| `.surface-blau` | blue | text and focus white |

There is no red, yellow or green surface class (`.surface-rot` and `.surface-gelb` were removed on 2026-11-18).

**The surface rule (2026-11-18, binding; `e2e/site.spec.ts` → «surface rule»).**
1. Large surfaces use three colours only: parquet (`--parkett`, `--parkett-2`), ink (`--tinte`, `--tinte-2`) and **one** brand colour, blue (`--blau`).
2. Red, yellow and green are accent colours: thin lines, small signs and icons, tags, stickers, the primary yellow button on ink, the green result panel of the match card. Never a full-width band, a tile or a panel. The test: nothing that is at least two fifths of the window wide (a door tile is exactly half) and taller than 200 px has red, yellow or green as its background, on any page, at 1440 and 390 px. The match card's green panel is named and skipped there and checked on its own: a column of at most half the card from 1040 px, a low row inside the card's padding (at most 120 px high) between 600 and 1039 px, the card's foot on phones.
3. Block sequence of the landing page, top to bottom: parquet hero, parquet statement, ink word band, parquet-2 steps, blue | ink doors, parquet waitlist, ink footer. Topic pages: ink header and page head band, parquet-2 and parquet sections, a blue closing band, ink footer. Legal pages, 404 and confirmation: ink head, parquet page, ink footer.
4. No two neighbouring blocks may look like one surface. Where two would merge, separate them with the thin line token (`--linie`, `--linie-dunkel` on ink) or with spacing, never with a new colour. Today only hero and statement share a ground (both parquet): the hero's base line and the section padding keep them apart.
5. Do not add colour to make a block louder. The waitlist is the destination of the page through size (the giant H2), air (the full section padding) and the page's one ink card with the yellow button, not through a colour ground.

Rules:
- Flat colours only: no gradients, no drop shadows, no glass. A sticker's hairline, the 1 px hairline border of floating pills (the phone waitlist pill, the scoreboard) and the 2 px ring in the bar's colour around the counter badge are outlines, not shadows.
- Small text at least 4.5:1, checked by axe in CI on every page **without exceptions** (`e2e/a11y.spec.ts`). Never yellow text on light; red or green as small text only at 4.5:1 or more.
- Blue is used sparingly even as a surface: one blue block per page (the sport door tile on the landing page, the closing band on a topic page).
- One light theme. No dark mode, no theme switch; `color-scheme: light` on `:root` and in every page's meta, plus `<meta name="darkreader-lock">`. `theme-color` is `#F8F4EA` on the landing page (opens on the parquet hero) and `#1A1C20` on every static page (opens on the ink header and band).
- Gone with v1.0: graphit, kalk, paper, brass, steel, ink, rule, every `--grad-*`. No old token name may appear in CSS that is built.

## Typography

| Role | Face | Notes |
| --- | --- | --- |
| H1, H2, giant words, big numerals, anything with `.display` | **Archivo Wide 800** (`--display`): one static instance of Archivo, width 125, weight 800 | tracking `-0.02em`, line-height 0.98 to 1.04, sentence case, `hyphens: manual` with soft hyphens in `content.ts` (the face is about 0.69 em per character: long German words need them) |
| Text, UI, labels, buttons | **Schibsted Grotesk 400 and 600** (`--sans`) | the wordmark's family. 700 is gone; never use it |

- Exactly **three font files** are preloaded and fetched on every page (Archivo Wide 800, Schibsted 400, Schibsted 600; core subsets, self-hosted, cut by `npm run fonts`). Metric-matched fallbacks (`Archivo Wide Fallback`, `Schibsted Fallback` on Arial, `tokens.css`) keep the swap from moving anything.
- Scale (`site.css`; the hero H1 has its own size, `--hero-fs` in `hero.css`, see Layout): `--fs-h1` `clamp(1.875rem, 1.1rem + 3.4vw, 3.75rem)`, `--fs-h2` `clamp(1.75rem, 1.2rem + 2.3vw, 3rem)`, `--fs-sub` up to 1.625rem, `--fs-h3` 1.25rem, `--fs-lead` up to 1.3125rem, `--fs-body` 1.125rem / 1.6, `--fs-small` 0.875rem, `--fs-label` 0.75rem.
- Labels (`.label`): uppercase, 12 px, 600, tracking 0.15em, in `--accent-text` (blue on parquet, yellow on ink, white on blue).
- H2s that should look like H3 on static pages carry `.pg-h3` (Schibsted 600).

## Shapes

- **Pills** (999 px) for every button and chip. Buttons: `.btn` plus `.btn-tinte` (ink fill: primary on parquet and parquet 2), `.btn-gelb` (yellow fill: primary on ink; the header button over ink, the waitlist submit button, the phone pill), `.btn-parkett` (parquet fill: primary on blue, and on the ink door tile so the two doors carry the same button), `.btn-outline` (2 px outline in `--heading`, any ground). `.btn-sm` is 44 px high. Hover colours apply only where a pointer can hover (`@media (hover: hover)`): on touch screens a tapped button keeps its colour.
- **Cards**: radius 20 px (`--radius`), 1 px `--line` border, no shadow. Small parts and inputs 8 px (`--radius-sm`).
- **Tags** (`.tag`): flat pills for labels (launch signal, «Beispieldaten», the album counter): a fill from the palette or a 1 px outline, 12 to 16 px Schibsted 600, never rotated, no white edge.
- **Court lines**: thin, 3 px stroke at 1440 px wide, 2 px on phones (`--cl-w`, one weight for every line on the site), round caps and joins, no fills, `vector-effect: non-scaling-stroke`. The two door drawings cannot use a stroke that does not scale (the ball would leave the tip of its line), so they set the same weight as a share of the drawing, per range of widths (`--door-line` in `doors.css`: within about half a pixel of `--cl-w`). At most two line colours per block; never behind text (clean rule 3).
- **Stickers**: flat fills from the palette, a white die-cut border (about 5 px at 96 px), one hairline `rgba(26,28,32,.12)` around the white, one ink line weight for the whole set, at most 96 px (72 px on phones) and rotated by at most 8° either way, no shadows, no gradients. Six on the landing page, no more (clean rule 1).
- **Icons**: 24 px grid, 2 px stroke (it scales with the size), round caps and joins, `currentColor`.

## Kit (`src/components/kit/`, `src/styles/kit.css`)

Decoration is always `aria-hidden`. The kit stylesheet is unlayered and loaded before the section stylesheets, so a section rule wins a tie.

- **`Sticker`** (`id`: `ball`, `note`, `brezel`, `startnummer`, `wimpel`, `pfeife`; `size`, `rotate`, `collectable` (default true; `false` for a sticker that is only illustration), any span attribute). Markup `span.stk[data-sticker][data-collectable] > span.stk-in > svg`. The size is set inline (`--stk-size`): for a responsive size set `inline-size` on a selector more specific than `.stk`. `data-collected` turns the drawing into a dashed outline in `currentColor` (ink at half strength on parquet, 3.2:1; white on the two door tiles). `rotate` and `scale` on `.stk` belong to the kit; code that moves a sticker uses `translate`. `Vars`, the one type for style objects with custom properties, is exported here. No drawing repeats a sticker (the ball of the blue door is a plain yellow disc). The kit sets no cursor: a sticker looks clickable or draggable only once the Easter-egg chunk runs (`eggs.css`).
- **`Tag`** (`span.tag[data-tone]`, tones gelb, blau, rot, gruen, tinte, parkett, and `linie`: unfilled with a 1 px outline in the text colour of its surface; `dot` puts a small round dot before the text): the flat label with real text (13 px, scale with `--tag-fs`). Never rotated, no white edge. Used for the launch signal (yellow, with the dot), «Beispieldaten» (outlined) and the album counter in the header. It replaced the tilted `TextSticker` on 2026-11-18; do not bring that back.
- **`Icon`** (`svg.icn`, names in `ICON_NAMES`): line icons for the statement points, match card chips, buttons and badges.
- **`CourtLines`** (`svg.cl`, variants `hero` (the blue corner arc), `band` (one straight line across its box; `line` picks its colour, default gelb: the word band's two lane lines and the waitlist's line; the hero's red base line is two such strips, left and right of the round arrow), `door-sport`, `door-firma`; `draw="load" | "scroll"`): absolutely positioned in a `position: relative` parent, each in a box no larger than the line needs (a line's box never lies behind text: axe could not measure the contrast there). `data-line` picks the colour (blau, rot, gelb, hell). `BALL_PATH` (the yellow line of `door-sport`) is exported. Straight lines are `<line>` elements in an svg without a viewBox (one unit is one px), and a curve is drawn in at least as many units as it has px on screen: with a stroke that does not scale, Chromium breaks a line drawn in a small stretched viewBox into dashes while it draws. The page head band's one line, the parquet centre circle (`PageHeader.tsx`), follows the same rule. Hidden under forced colours.
- **`.lg-badge`** (`legal.css`): the flat round badge of the static pages, upright and without a rim (green check = decided, dashed ring = open, kit icons for kinds).

## Layout and section order

Container 1200 px (`--container`), gutter `clamp(1rem, 4vw, 2.5rem)`, section padding `--section-pad` `clamp(4.5rem, 3rem + 6vw, 8.5rem)`. No horizontal overflow from 320 to 2560 px.

**Landing page**, seven short blocks:

| # | Block | Ground | What it is |
| --- | --- | --- | --- |
| 1 | Header (`Header.tsx`) | transparent, parquet or ink | Wordmark, nav (So funktioniert es, Kosten, Fragen, Über uns), waitlist pill. Transparent on the hero; solid parquet with a hairline after 80 px; solid ink with the parquet wordmark and a yellow pill while an ink band (`data-header-dark`: word band, footer) crosses the bar's lower edge. Over the two door tiles (blue and ink; the ink tile is not marked) it stays the parquet bar, also below 861 px, where the tiles are stacked and the ink tile is as wide as the window: deliberately, because the bar is parquet over the blue tile just before and one block should not flip it. Without JS always the solid parquet bar. |
| 2 | Hero (`#top`) | parquet | One screen, centred on the page container. Launch signal as a flat yellow tag, the H1 with the accent word in blue (from 481 px two lines at `clamp(1.5rem, min(8.6vw, 14svh), 6.5rem)`: it fills the 1200 px container at most, with visible side margins; on phones a stack of four lines, «Sponsoring, / das / zusammen- / passt.», at `clamp(1.75rem, min(12.4vw, 6.2svh), 3.75rem)`, about 47 px at 390 px wide, so it is the biggest type of the first screen), one lead sentence, two pill buttons. Two thin hall lines drawn once on load frame the lower right: the red base line 56 px above the hero's lower edge and, from 761 px, a blue quarter arc in the corner (radius 18vw, at most 16rem). One sticker, the ball (72 to 96 px, 56 px up to 760 px wide): on the middle of the arc, on phones at the right end of the base line; it can be dragged with the mouse (never onto the text or a button) and counts for the album. Neither line nor ball ever lies on or behind the tag, headline, lead or a button (the sums are in `hero.css`). A round arrow at the height of the base line, in a gap of that line, leads to the statement. Height `min(100svh, 60rem, 62vw + 20rem)`; phones the full first screen (at most 60rem), between 481 and 760 px wide at most 44rem. |
| 3 | Statement (`#idee`) | parquet | Three sentences in Schibsted 600 (26 px phones, 44 px desktop), one per line, words filling from grey to ink; each has a flat round sign in a hanging column of its own (ball on blue, shop on red: the sign colours of the two sides, as on the match card's avatars; a check on ink for Sponsuno's sentence; upright, no rim), so every line of text, wrapped or not, starts on one edge. Then three points with a line icon in a 48 px ring (all three rings blue). No stickers, no court line. |
| 4 | Word band (`.wb`) | ink | A small label on the page container and two rows of giant words that slide in opposite directions. Row one is «Sport Kultur», row two the disciplines. At rest the rows are a lockup flush from gutter to gutter: «Sport Kultur» over «Triathlon Chor Turnverein»; on phones (up to 640 px) one word per row, «Sport» / «Kultur» / «Turnverein» (row one is set a second time there: the copy comes first and rests on «Sport», row one itself rests on «Kultur» and slides the other way, so culture is on screen at rest). Row two alternates parquet fill and outline. One small sticker, the note, is stuck on the upper right corner of «Kultur» (48 to 72 px; it hides no letter and is whole inside the window at rest). The band's padding is the section padding of every block; two thin yellow lane lines lie in it near the band's upper and lower edge, clear of label and words; no ticks. The words are drawn by CSS from `data-word`; screen readers get the label and one plain list of exactly the words that are drawn. |
| 5 | So funktioniert es (`#ablauf`) | parquet 2 | H2, three steps, each a calm line drawing (220 × 196 px, 264 px wide from 1100 px: an ink line of 3 units, parquet fills, one flat accent shape: a blue pin, a red picked row, a green check disc), a small number, a title and one sentence. No stickers, no «4 von 4» outside the card. Under them the match card: the «Beispieldaten» tag (outlined) in its top left corner, two flat vector avatars (blue disc for the seeker, red for the firm) and a green result panel with the criteria as chips; from 1040 px its three columns equal the steps' columns and its outer edges are the container's (the panel is the third column); from 600 px the two parties stand side by side and the result is one compact rounded row inside the card's padding (score left, criteria right, about 52 px high, two rows at the narrow end), never a green band across the card; below that one column with the panel as the card's foot. |
| 6 | Zwei Türen (`#fuer-wen`) | blue, ink | Two full-height tiles side by side (stacked below 861 px): label (white on blue, parquet on ink: one light label per tile, yellow stays with the drawings), title in the display face, one sentence (white on blue, parquet on ink), parquet pill button with an arrow that sets the waitlist role (the same button on both tiles). The firm tile is ink, not red (surface rule); its small accents are the yellow shop sign and the pretzel sticker. The copy starts on the container's left edge (blue) and one inner gutter right of the page's middle (ink); the tiles' top padding is the section padding. Each has one white line drawing in its lower right corner, below the copy (or, where the tiles are stacked but wide, 600 to 860 px, partly beside it; never behind it) (a court whose ball, a plain yellow disc, rolls into the goal; a shop whose sign lights up yellow): white lines of one weight plus one yellow accent. One small collectable sticker per tile, part of the drawing (44 to 72 px): the pennant stands where the ball's line starts, the pretzel lies in the shop window. Stacked, both drawings end on the container's right edge. |
| 7 | Warteliste (`#warteliste`) + Footer | parquet, then ink | The destination of the page, on the lighter parquet (not parquet 2, so it differs from the steps block): one thin yellow court line from edge to edge in the band's upper margin (all that is left of the former yellow band), the start-number sticker on it above the end of the title (96 px, phones 72 px); then the giant H2 in ink (one line from 961 px, also in the fallback face) and the form in an ink card with the yellow submit button (from 961 px it stands beside the intro, in columns 5 to 12 and from 1200 px in columns 6 to 12, so it stays a card on its calm ground and never reads as a second ink band above the ink footer; below 961 px it fills the container and the band keeps half a section padding more under it; after sending it keeps the form's height, the confirmation stands in its middle and is scrolled into view). No line runs behind the title, the intro or the form. Footer: link columns; from 700 px the four link columns span the container; under a hairline one quiet row with the sticker album (label, count, hint, six small slots: an empty one is a neutral dashed ring) and beside it the whistle sticker (72 px, phones 64 px; landing page only; once collected it is gone from there, it sits in its slot); the giant loop wordmark in parquet; copyright. |

One optional layer lies over the blocks: the **Easter eggs** (see below). The page tape line of the first Turnhalle pass (one yellow court line behind the content from the hero down) was removed on 2026-11-18: every hall line belongs to a block.

In-page links land with their block flush under the header (no strip of the band before stays visible); keyboard focus follows when the scroll has ended.

Phones: a floating flat ink pill (`StickyCta`: a parquet hairline at 40 %, 3.6:1 on ink, the closing line and the yellow button) appears once the hero has scrolled away and is gone again from the two doors on (each tile has its own waitlist button, and on the ink firm tile the ink pill would have no body of its own), so also near the waitlist and the footer. It is seen over the statement, the word band and the steps. The «TOR!» scoreboard has the same hairline.

**Static pages** (`/kosten/`, `/fragen/`, `/ueber-uns/`, legal pages, 404, confirmation): ink header (`PageHeader`, not fixed) running into the ink **page head band** (`PageBand`): the H1 in the display face, the intro, and the hall motif in one line: a thin parquet centre circle rising from the band's lower edge, which is itself the halfway line, and one small sticker on the centre spot. There is no vertical line (until 2026-11-18 a yellow one ran up to the header, straight down from the yellow waitlist button; its short parquet successor read as a string the sticker hung from). The sticker is small (56 to 72 px, not collectable, the page's only one), half over the edge (ball on `/kosten/`, whistle on `/fragen/`, pennant on `/ueber-uns/`, pretzel on `/impressum/`, note on `/datenschutz/`, start number with a green check on the confirmation page; the 404 page shows only the ball's dashed album slot: the sticker is missing). Text never crosses a line. Below it the parquet page surface. Topic pages end on a blue band («Früh dabei sein.» in white, a parquet button; text only, no sticker and no line): the page's one colour surface, between its last parquet section and the ink footer. `/kosten/`: four cost cards two by two with flat round badges, the first card ink with «Keine» in the display face. `/fragen/`: full-width question cards with a yellow plus disc. `/ueber-uns/`: flat round portraits (upright, no rim), blue monograms, the project status as one more parquet card with small green check marks (not ink: with the blue closing band and the ink footer after it the page would end on three dark slabs). 404 and confirmation: links as large display rows with a round arrow button. Legal pages: one reading column (42rem), section and contents numbers in the display face.

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
- Never put `scale` or `translate` animations on an SVG element (wrap it in a `span`: the accent layer of the step drawings is such a span); `offset-distance` on an SVG circle is used for the door ball only (it does not spin).

**Kit primitives** (`kit.css`):

| `data-scroll` | Does | Tune with | Still fallback |
| --- | --- | --- | --- |
| `draw` (on a container, or `draw="scroll"` on `CourtLines`) | its `.cl-path` lines draw with the scroll, each further path 5 vh later | `--draw-start`, `--draw-end`, `--draw-stagger` | lines fully drawn (no dash pattern is ever left) |
| `fill-words` (on a paragraph with `span.w` words, `--i` per word, `--n` on the block) | words go from grey to their own colour one after another | `--fill-from`, `--fill-to`, `--fill-soft` | final colour |
| `slide-x` (on a row) | the row slides from its place to `--slide` (negative: left, positive: right) across its pass through the viewport | `--slide`, `--slide-start`, `--slide-end`, `--scroll-timeline` | untranslated |

`data-draw="load"` draws court lines once on load (1 s each by default, 0.1 s stagger; tune with `--draw-time` and `--draw-delay`). Keyframes that may be reused in section CSS: `stk-settle`, `stk-wiggle`, `stk-pop`, `kit-draw`, `kit-fill`, `kit-slide-left`.

**Base primitives** (`site.css`, unchanged from v1.0): `data-reveal` (fade once), and `data-scroll="rise | fade | zoom-in | draw-x | draw-y | photo | frame | recede | group"` with the `--scroll-*` knobs. The landing page uses `rise` and `zoom-in` in the footer; the others remain for the parked pages.

**Stickers.** A small settle when they first appear (scale 0.9 to 1, turning into place, 360 ms, once; inside a `data-reveal` block when it comes in), a wiggle on hover (fine pointers), a lift on press, a pop when collected. These are the only rotations in motion on the page, and only on the six stickers; all of them stay between upright and the sticker's resting tilt (e2e samples a hovered and a pressed sticker).

**Per block.**
- Hero: the base line draws on load (its two halves one after the other, past the arrow), the arc follows when the line comes by, then the ball is stuck on (all done in about 1.35 s); while the first screen scrolls away the ball drifts up by 20 px (`scroll(root)`).
- Statement: `st-fill`, its own keyframe on the kit's timeline, starts from a **solid grey** (`rgb(132,133,135)`, 3.4:1 on parquet, 3.36 exactly; the type is at least 26 px, large text) instead of the kit's 35 % alpha, so the unfilled words pass contrast. Final when the paragraph's top is at half height. The round signs fill with their word. The point rings draw once.
- Word band: all rows on the band's own view timeline, neighbours in opposite directions (phones: three rows, the two copies of row one swap their words); the lockup is hit when the band is mid-viewport. The two lane lines draw with the scroll (the upper one from the left, the lower one from the right) and are whole when the lockup stands.
- Steps: each step reveals with a 90 ms stagger; inside, the two connector lines of drawing one draw and each accent shape pops in (about 1 s). One small hover reaction per step, on its accent. Match card: avatars, check and chips pop in turn.
- Doors: the drawing draws with the scroll (`--kit-draw`), the ball rides the tip of the yellow line, the shop sign turns yellow at the end. On hover or keyboard focus the ball rolls in again and the sign flickers once.
- Waitlist: the yellow court line draws with the scroll, from the left towards the sticker. Footer: columns rise, the wordmark zooms in.
- Static page band: the circle draws once on load, then the sticker appears and settles (all done by 1.1 s).

## Easter eggs

Optional layers on top of `aria-hidden` decoration (`src/lib/eggs.ts` with `src/styles/eggs.css`, a lazy chunk fetched when the browser is idle; the album store and markup are in `Album.tsx`).

1. **Stickeralbum.** A click or tap on any `[data-sticker][data-collectable]` collects it: the sticker leaves its dashed outline (the whistle beside the album leaves none: it moves into its slot next to it) and its id counts once. The six ids are on the page once each, on phones as on desktop: the ball in the hero, the note in the word band (on «Kultur»), the pennant and the pretzel in the two doors, the start number in the waitlist band, the whistle beside the album in the footer. The hero alone cannot fill the album (it holds one sticker). A small flat yellow tag (star, «2/6») appears after the first find: a plain `span` worn as a badge on the upper right corner of the header's waitlist button, always inside the bar (never on the page's content) and out of the flow at every width (nothing in the bar moves when it appears; e2e checks both); a click on it scrolls to the album. The album in the footer fills its six slots. All six: the chip swells once (0.4 s) where the visitor is; the album's own finale (the six stickers hop once in turn, about 0.7 s) waits until the full album is on screen (`.is-seen`), and the line reads «Album voll. Sie haben ein Auge für Details.» No burst, no confetti; with reduced motion only the line changes.
2. **Drag.** The hero ball (`data-draggable`, the only one) follows the mouse after a 6 px threshold, stays inside the hero and below the header, keeps 8 px clear of the hero's tag, headline, lead, buttons and arrow (it slides along them and cannot be parked on one), and stays where it is dropped. A drag never collects. Mouse only: a finger that starts on the sticker scrolls and zooms the page as anywhere else, and a tap collects.
3. **«tor».** Typing t, o, r outside a form field shows a small flat scoreboard («TOR! 1:0», counting up; an ink pill with the score on yellow) bottom centre for 1.6 s.
4. **Loop.** A click on the loop of the giant footer wordmark makes its last «o» bounce twice (0.9 s; a clipped second copy of the same image moves, the logo's geometry is untouched).

Rules (also in AGENTS.md):
- **State in memory only.** No cookie, no `localStorage`, no `sessionStorage`, no IndexedDB, no Cache Storage: the Datenschutzerklärung says nothing is stored. A reload starts again at 0/6. CI checks this.
- **Never needed to use the page.** Nothing an egg shows is content; the page is complete without the chunk and without JavaScript (the album is prerendered empty with its hint).
- **Hidden from assistive technology and the keyboard.** Album, counter chip, scoreboard and stickers are `aria-hidden`; nothing is focusable (the chip is a `span`, not a link or button), nothing is announced, focus never moves.
- **Never in the way of the page's own gestures.** No listener per scroll frame, no `touch-action` override, no drag on touch; cursors (`pointer`, `grab`) come with the chunk, so nothing looks clickable before it works.

## Logo

Unchanged from v1.0. The wordmark **«sponsuno»** in lowercase, Schibsted Grotesk 700 outlines, where u and n share one stem and become a loop («so wie aus Verein und Firma eine Partnerschaft»). It is never set as text: no font has the loop. Files: `src/assets/wordmark-dark.svg` (ink, on light), `wordmark-light.svg` (parquet, on ink), `Sponsuno_Logo_dunkel.svg` / `_hell.svg` (the same, used by the parked demo). The loop alone (`src/assets/loop.svg`, `currentColor`) is the small mark: favicon and app icons (`public/favicon.svg`, and the PNG/ICO sizes generated from `src/assets/Sponsuno_Icon.svg`, a flat ink tile with a parquet loop, by `scripts/icons.mjs`). Clear space: the x-height of the wordmark all round. Minimum size: 16 px high on screen, 6 mm in print; below that the loop alone.

Never: stretch, rotate, recolour (single colour only: ink or parquet), add shadows or outlines, type «sponsuno» with a normal u and n, set the loop next to the word, or stick a sticker on the wordmark. The footer's bounce (Easter egg 4) moves a clipped copy for under a second and leaves the image as it was.

Share image (`public/og-image.png`, 1200 × 630, source `scripts/og/og-image.html`, rendered with Chromium): parquet ground, «Sponsoring, das zusammenpasst.» in Archivo Wide with the last word in blue, the ink loop wordmark, the hero's two thin lines (red base line, blue corner arc) with the ball sticker on the arc, the launch signal as a flat yellow tag, the domain. One sticker, nothing else tilted, no photos, faces or numbers. The sticker drawing in that file is a copy: refresh it when `Sticker.tsx` changes.

Open: test the loop's legibility with three to five people who do not know Sponsuno; trademark check of name and logo (IGE, DACH) before the launch; CMYK and Pantone values for the palette with the printer.

## Imagery

- **No stock photos.** The landing page is built from vectors only (CI checks that it requests no raster image). Illustrations are stickers, line icons and court lines from the kit; all drawings are original and use only the palette.
- The only photos on the site are the founders' portraits on `/ueber-uns/` (real, consented, square JPEGs in `src/assets/photos/team-*.jpg`, shown as flat round portraits); a founder without a photo gets a blue monogram. Never stock or generated faces for the founders.
- Example people and firms appear only as vector avatars inside an illustration labelled «Beispieldaten» (the match card).
- Parked: the stock photos of the old audience section and match card stay in `src/assets/photos/` with their credits in `parkedPhotoCredits`; a photo that comes back needs its credit in `photoCredits` and the Symbolbild note (AGENTS.md).

## Parked

Not imported, not built; sources stay in the repo (list and how to bring one back: AGENTS.md → «Parked (not built)»).

- From the old landing page: the conveyor hero picture, the scroll story (`Story.tsx`, `StoryArt.tsx`, `lib/storyLayout.ts`, `story.css`, `story-art.css`), the proof line (`ProofLine.tsx`), the audience photo cards (`Audience.tsx`), the two-track «So funktioniert es» (`HowItWorks.tsx`), `InputIcon.tsx`. Their stylesheets were only renamed to the new tokens mechanically and have not been looked at in the new look. `Statement` and the parked story both use the class prefix `st-`: rename one before the story could ever come back.
- Pages: the product preview `/demo/` (`src/demo/`), `/fuer-firmen/`, `/ki-manager/`, the four guides (their block styles are in `guide-parked.css`). They compile with the new tokens but keep their v1.0 layouts; each needs a design pass before it is published again.
- Out of scope of v2 so far: the waitlist e-mails (live in Brevo in the v1.0 look), the README screenshots, the earlier logo kit in `brand/`.

## References

- soda.today (owner's reference for the feeling, 2026-11-17): full-colour bands, one giant word per screen, stickers on letters, a word that slides with the scroll, text that fills in, lots of space. A reference for feeling only: no asset, word or layout is copied. Since the clean-up pass of 2026-11-18 the stickers are a detail (six of them), not the look; since the colour pass of the same day the full-colour bands are gone too (surface rule: parquet, ink and blue).
- Sticker albums of sport clubs and the taped lines of a Swiss Mehrzweckhalle (the idea).
- Earlier research (v1.0, Mobbin): audience-named CTAs for a two-sided marketplace (SchoolAI, Later, Sweatpals); fee rows instead of plan cards (Fresha); a minimal waitlist block (Telescope).
