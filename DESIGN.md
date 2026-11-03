# DESIGN.md – Sponsuno visual system

The source of truth for colours and fonts is the **Sponsuno Corporate Design Manual v1.0 (November 2026)**. This file translates it into how the website uses them. It was rewritten in November 2026 after a research round (Mobbin heroes and landing pages, Awwwards winners, a palette analysis and an audit of the old page). If the code and this file disagree, fix one of them in the same change.

Tokens are CSS custom properties in [`src/styles/tokens.css`](src/styles/tokens.css); the landing page base layer is [`src/styles/site.css`](src/styles/site.css); each section has its own stylesheet in `src/styles/sections/`.

## Principles

1. **Calm, clear, credible.** The page must work for a 22-year-old athlete, a volunteer club board and an SME owner. Clarity first, then atmosphere.
2. **One signature moment.** The gold line in the hero match card (athlete → four criteria → sponsor) is the only "wow" effect. It echoes once in the steps section. Nothing else moves except quiet fade-ins.
3. **Light page, navy frame, gold accent.** Light surfaces carry about 75% of the page. Navy is used for the hero and the closing waitlist + footer block. Gold is a flat accent (about 5%): never a surface, never a gradient, never a glow.
4. **Show the product, not decoration.** Product UI (the match card, the KI-Manager draft) explains Sponsuno better than abstract visuals.
5. **Honest content in honest form.** Fictional examples, AI images and stock photos are labelled (stock photos as "Symbolbild"). No fake logos, numbers or testimonials.

What we removed and should not bring back: WebGL shaders, the 3D emblem, tilted marquees, gold liquid sections, magnetic buttons, card tilt and glare, shine sweeps, rotating borders, scroll hijacking (Lenis), glass navigation.

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

## Motion

| What | How |
| --- | --- |
| Hero copy | Fades up once on load (CSS keyframes, staggered 0–0.26 s) |
| Match card (signature) | Cards visible at once; the gold line draws (1 s), the four criteria tick (0.12 s stagger), the score appears. Starts when the card is on screen. |
| Steps | The gold line through the step numerals draws once when the track scrolls in |
| Everything else | `data-reveal`: opacity + 12 px rise, 0.6 s, once |
| Hover | Colour and underline changes only |

No animation library. `lib/motion.ts` provides `observeReveals()` and `onceVisible()`; native scrolling with `scroll-padding`. Without `html.motion` (reduced motion) or without JS, everything shows its final state.

## Logo

The current mark (rounded navy square with a serif "S." and the wordmark "Spons|uno") comes from the CD. On the website the header and the footer use the **wordmark alone** (`src/assets/wordmark-light.svg`, `wordmark-dark.svg`, cut from the CD logo files); the square is kept for favicon and app icons.

Recommendation from the research (needs the team and the CD owner): refine rather than replace. Build on the two-tone "Spons|uno" and the gold thread, e.g. a custom-drawn wordmark where a gold stroke joins "uno". Before any logo work, run a trademark check (Swissreg/IGE, EUIPO): Sponsoo (sponsoo.de) is an established DACH sport-sponsoring marketplace with a similar name and an S monogram.

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
