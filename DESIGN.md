# DESIGN.md – Sponsuno visual system

The source of truth is the **Sponsuno Corporate Design Manual v1.0 (November 2026)**. This file translates it into the tokens, components and motion used on the website. If the code and this file disagree, fix one of them in the same change.

All tokens are CSS custom properties at the top of [`src/styles/site.css`](src/styles/site.css).

## Principles

1. **Navy and ivory carry the page, gold accents it.** Gold is for lines, dots, highlights, the "uno" in the logo and one accent section. It is never body text.
2. **One bold moment per screen.** The hero has the match animation; everything around it stays calm. New effects must replace attention, not add to it.
3. **Calm, valuable, regional.** Serif display type, generous space, soft diagonal gradients. Nothing that looks like a generic SaaS template (no icon-card grids for their own sake, no uppercase eyebrow labels, no neon).
4. **Honest content in honest form.** Fictional examples and AI images are labelled. No fake logos, numbers or testimonials as decoration.
5. **Motion explains, never blocks.** Everything readable without motion; every animation has a still state.

## Colour

| Token | Hex | CD name | Use |
| --- | --- | --- | --- |
| `--navy` | `#0B1830` | Navy | Dark backgrounds, text on light, logo wordmark |
| `--navy-2` | `#1D2F52` | Navy mittel | Second tone of dark gradients, dark cards |
| `--ivory` | `#F3EFE6` | Elfenbein | Light backgrounds, text on dark |
| `--paper` | `#FBF9F4` | (card start) | Alternate light section, light card gradient start |
| `--rule` | `#D9D2C1` | (card border) | 1 px borders and rules on light |
| `--gold` | `#B08D57` | Gold | Accents, dots, lines, the gold section |
| `--gold-light` | `#C4A36B` | Gold hell | Gold text and buttons on navy |
| `--gold-dark` | `#6E5228` | Gold dunkel | Gold text on light backgrounds (only this one, for contrast) |
| `--gold-pale` | `#D5BF93` | (gold gradient end) | End of gold gradients, highlights |
| `--steel` | `#B9BFCB` | Stahlgrau | Secondary text on navy, captions |
| `--ink` | `#3B4560` | Textgrau | Body text on light |
| `--card-dark-a` / `-b` | `#1A2D50` / `#132442` | (dark card) | Dark card gradient |
| `--card-dark-line` | `#33476F` | (dark card border) | 1 px borders on navy |

Rules:
- Body text: `--ink` on light, `--steel` or `--ivory` on navy, `--navy` on gold.
- Gold text on light only in `--gold-dark`. On navy use `--gold-light`.
- Gradients run diagonally (135°): dark `#0B1830 → #1D2F52`, light `#F3EFE6 → #B9BFCB`, gold `#B08D57 → #D5BF93`.
- No colours outside this table, except these documented ones: `#F2C5B5` for form error text on navy (`.form-error`, legible where CD reds are not defined), and the shader-only tones `#071022` (navy shade) and `#BC9A63` (gold silk base) in `src/lib/silk.ts`. The demo adds a status green (`#E3EDE4` background, `#2E5A36` text), a red (`#8A2C1F`, token `--danger`: overdue items and delete actions, `.ui-badge-danger`) and two near-ivory surfaces (`#F7F4EC` card gradient end, `#FFFDF8` input background), all in `src/demo/demo.css`. Anything else new needs to go into the CD first.

## Typography

Two families, from Google Fonts. No other weights.

| Role | Family | Weight |
| --- | --- | --- |
| Display, titles, card titles, wordmark, numerals | Cormorant Garamond (`--serif`) | 600, 700 |
| Body, labels, buttons, navigation | Manrope (`--sans`) | 400, 600 |

Scale (fluid, `clamp`):

| Element | Size | Line height |
| --- | --- | --- |
| Hero h1 | `clamp(3rem, 6vw, 5.6rem)`, 600 | 1.0 |
| Section h2 | `clamp(2.35rem, 4.8vw, 4rem)`, 600 | 1.02 |
| Card / item h3 | `1.625rem` (1.5rem in lists), 700 | 1.15 |
| Step numerals | `clamp(4.75rem, 8vw, 7rem)`, 600, lining figures | 0.85 |
| Footer wordmark | `clamp(4rem, 22vw, 19rem)`, 600 | 0.8 |
| Body | `1.0625rem` | 1.6 |
| Section intro | `1.125rem` | 1.6 |
| Small / captions | `0.8125–0.9375rem` | 1.5 |

Rules:
- Sentence case everywhere. No all-caps labels, no letter-spaced eyebrows.
- Headlines balance (`text-wrap: balance`); line length under about 70 characters for body text.
- Long German compounds in display sizes get a soft hyphen (`\u00AD`) in `content.ts`.

## Layout

- Container: max 1200 px, side gutter `--gutter` = `clamp(1rem, 4vw, 2.5rem)`.
- Section rhythm: vertical padding `--section-pad` = `clamp(5rem, 10vw, 8.5rem)`.
- Order of surfaces (as in the CD's presentation rule): start dark, then light and dark alternating, one gold accent, end dark:
  hero (navy) → ribbon (gold) → problems (ivory) → steps (paper) → audiences (ivory) → KI manager (navy) → in-kind (gold) → pricing (ivory) → FAQ (paper) → waitlist (navy) → footer (navy, gold hairline).
- Radius: `--radius` 16 px for cards; buttons, chips and the header are pills (999 px).
- Cards on light: gradient `--paper → --ivory`, 1 px `--rule` border. Cards on dark: gradient `--card-dark-a → --card-dark-b`, 1 px `--card-dark-line`. On gold: ivory cards without border.
- Breakpoints: 1080 (steps go 2×2), 1020 (header switches to burger), 960 (single column), 600 (phone), 360 (header CTA hides), and `max-height: 560px` for the landscape menu.

## Components

| Component | Where | Notes |
| --- | --- | --- |
| Buttons | `.btn` + `.btn-gold` / `.btn-navy` / `.btn-ghost`, `.btn-lg` | Gold is the primary action. `.btn-shine` adds a periodic light sweep below the label. Min height 48 px. |
| Header pill | `Header.tsx` | Floating glass (the only `backdrop-filter`), gold border, sliding active marker, 2 px gold progress line, hides while scrolling down. |
| Mobile menu | `MobileMenu.tsx` | Full-screen navy dialog, circular reveal from the burger, large serif links. |
| Split heading | `SplitHeading.tsx` | Every section title. Words rise from their own clipped line. |
| Match card | `MatchCard.tsx` | Ivory athlete card, glass-free navy sponsor card, criteria ledger, gold thread. |
| Ribbon | `Ribbon.tsx` | Gold band, rotated −2°, upright serif items separated by navy dots, pause button. |
| Checks list | `.checks` | Gold dot bullets with hairline separators. |
| Assistant panel | `AiManager.tsx` | Dark card inside a rotating conic gold border, chips, progress meter, typed draft. |
| FAQ | `Faq.tsx` | Native `<details>`; plus icon rotates into a gold ×. |
| Waitlist form | `Waitlist.tsx` | Role chips (2×2), pill email field with inline submit. |
| Emblem | `Emblem.tsx` | 3D logo in navy enamel with gold frame and gold dust. |
| Footer | `Footer.tsx` | Gold hairline on top, claim, link columns, round "to top" button, full-width wordmark. |

Icons: 48×48 viewBox, stroke only, `stroke-width: 1.6`, round caps and joins, `--gold-dark` on light.

## Motion

Libraries: GSAP 3 + ScrollTrigger, Lenis for smooth scrolling, a custom WebGL shader, Three.js for the emblem.

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(.16, 1, .3, 1)` | Most CSS transitions |
| GSAP default | `expo.out` (set globally via `gsap.defaults` in `lib/motion.ts`) | Reveals, intro |
| Reveal | 1.0–1.3 s, stagger 0.05–0.12 s, start at 86–88 % of the viewport | `data-reveal`, split headings |
| Hover | 0.25–0.6 s | Colour, tilt, glare |

Inventory (do not add without removing something):
- Hero intro: kicker, words of the h1, copy, then the match (thread draws 2 s, a spark rides the tip, criteria tick, sponsor dot pulses).
- Silk shader behind the hero and the gold section; reacts gently to the pointer.
- Ribbon marquee (42 s loop, pausable).
- Scroll reveals; steps rail scrubbed by scroll; step numerals roll up.
- Audience cards tilt with a glare; magnetic primary buttons.
- KI panel assembles, meter fills, draft types out; conic border orbits.
- Emblem idles, follows the pointer, spins with sparks after a waitlist sign-up.
- Footer wordmark rises with scroll, "uno" sheen, cursor spotlight.

Reduced motion (`html` without `.motion`): no smooth scrolling, shaders render one still frame, the match shows its final state, no reveals, no marquee, emblem is a still render.

## Demo app

The demo (`/sponsuno/demo/`) uses the same tokens (`src/styles/tokens.css`) in an app layout:

- Shell: navy sidebar (268 px, full height) with the role switch and navigation; the gold banner ("Demo mit fiktiven Daten") sits on top of the ivory content column (max 1180 px). Below 900 px the sidebar becomes a navy bottom tab bar, the role switch moves into a row above the view, and toasts appear at the top.
- Active navigation: gold-light icon, faint gold background, a 2 px gold inset line on the left.
- Cards: same light and dark card styles as the landing page, smaller padding (1.1–1.5 rem). Headings in Cormorant, body in Manrope 1 rem.
- Match criteria always appear in the same order with the same marks: gold check (passt), half circle (teilweise), muted cross (passt nicht), each with a text equivalent.
- Status badges: Anfrage and Im Gespräch gold, Vereinbart navy, Aktiv green (`#E3EDE4` / `#2E5A36`, demo only), Abgeschlossen and Abgesagt muted.
- Avatars: sponsors use the gold monogram, athletes and clubs the navy one. The AI-generated persona photo appears only where it is labelled "KI-generiertes Symbolbild".
- Selected tabs are navy with ivory text; form fields have a navy focus border plus the standard focus outline.
- Kit classes are prefixed `ui-`; each view prefixes its own classes (`ov-`, `mt-`, `ps-`, `as-`, `pf-`, `sp-`).

## Imagery

- Only the AI-generated persona portrait (labelled "KI-generiertes Symbolbild") is used. No stock photos of real people presented as users.
- The logo files come from the CD (`src/assets`). Do not recolour, stretch or add shadows to the flat logo. The 3D emblem and the footer wordmark effects are a deliberate exception that still needs sign-off from the branding owner.

## References

Researched on Mobbin (November 2026): Function (serif "how it works"), Trawelt (large step numerals), Upwork (audience split), Superhuman and Intercom (AI assistant preview), Origin and Slash (dark serif hero), Base (waitlist).
