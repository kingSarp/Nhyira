# DESIGN.md — "Watercolor Garden"

Extracted from the *yaw & Lady* wedding-site template (The Knot editor, desktop view). Values were sampled from a screenshot, so hex codes are close approximations, not the exact source values. Where the screenshot couldn't settle something (states, forms, mobile), this file picks a default that fits the look; those are marked **(inferred)**. Machine-readable values: `tokens.json`. When the two disagree, `tokens.json` wins.

> Scope note: the pink "Publish" / "Close website" buttons and the peach notice bar are The Knot's **editor chrome**, not the site design. They are excluded, except that the peach bar's tone is kept as `blush-50`.

---

## 1. Visual Theme & Atmosphere

Romantic, quiet, editorial. It reads like a letterpress invitation turned into a web page.

- **One bold gesture, everything else restrained.** A large watercolor floral cluster (burgundy peonies, blush garden rose, sage eucalyptus, pink astilbe) bleeds off the top-right corner. All other elements are monochrome charcoal type on white.
- **Asymmetric art, symmetric type.** The flowers sit off-axis; every line of text is centered.
- **Lots of air.** About 60% of the hero is empty white space. The type is small relative to the canvas, which makes it feel calm.
- **Hand-made against typeset.** A flowing calligraphic script for the names, set against wide-tracked uppercase serif for labels.
- Mood words: *heirloom, garden, soft, ceremonial, unhurried.*

## 2. Color Palette & Roles

| Token | Hex | Role | Text-safe? |
|---|---|---|---|
| `neutral.paper` | `#FFFFFF` | Page background (dominant) | — |
| `neutral.ink` | `#3A3A3A` | Names, headings, nav, primary text | ✅ 11.37:1 |
| `neutral.ink-2` | `#5E5E5E` | Body copy, sub-dates, captions | ✅ 6.48:1 |
| `neutral.muted` | `#8C8C8C` | Input borders; text only at ≥24px | ⚠️ 3.36:1 (large only) |
| `neutral.line` | `#D9D6D3` | Decorative dividers (e.g. the rule under the URL bar) | ❌ decor only |
| `blush.50` | `#FDF4EF` | Soft panels, notice bars | — (background) |
| `blush.200` | `#F3D3CD` | Petal pink: chips, selected rows | — (background) |
| `blush.400` | `#D98E8A` | Rose, illustration only | ❌ 2.57:1 |
| `burgundy.600` | `#7A1F33` | **The single accent**: primary buttons, links, focus | ✅ 10.14:1 |
| `burgundy.700` | `#5E1726` | Accent hover/pressed | ✅ 12.91:1 (white on it) |
| `sage.400` | `#8EA787` | Leaf green, illustration only | ❌ 2.62:1 |
| `sage.700` | `#4F6B4A` | Text-safe green: success, "Attending" | ✅ 5.94:1 |
| `semantic.error` | `#A3261F` | Brick red for errors **(inferred)** | ✅ 7.36:1 |

**Proportion:** about 85% paper, 10% ink, 5% color. The color comes almost entirely from the illustration; in UI, burgundy is used sparingly and nothing else is chromatic.

## 3. Typography Rules

Two families only.

| Family | Use | Notes |
|---|---|---|
| **Great Vibes** (fallback Pinyon Script) | Couple names / monogram only | Closest open match to the template's calligraphic script; the original font is unconfirmed. Never more than one script line per screen. |
| **Source Serif 4** (fallback Georgia) | Everything else | Matches the transitional serif in "WEDDING DAY" and the nav. |

| Style | Size / line-height | Tracking | Case | Sample |
|---|---|---|---|---|
| `display-script` | 88 / 1.1 | 0 | As typed (lowercase is fine: "yaw & Lady") | Hero names |
| `eyebrow-date` | 24 / 1.3 | 0.18em | UPPERCASE | DATE TO BE ANNOUNCED |
| `heading-1` | 40 / 1.2 | 0.16em | UPPERCASE | WEDDING DAY |
| `heading-2` | 28 / 1.3 | 0.04em | Title Case | Ceremony |
| `nav` | 20 / 1.4 | 0.12em | Title Case | Our Story |
| `body` | 18 / 1.65 | 0.01em | Sentence | Paragraphs |
| `caption` | 15 / 1.5 | 0.08em | Title Case | Date To Be Announced (sub-line) |
| `button` | 16 / 1, weight 600 | 0.14em | UPPERCASE | RSVP |

Rules: everything is regular weight (400) except buttons. Wide tracking applies only to uppercase and nav. Body text is never tracked wide. Use the `&` glyph from the script face as an ornament. Set body copy in `ink-2`, not lighter.

## 4. Component Stylings

**Top navigation (seen).** A centered row of text links in `nav` style, `ink` color, with about 44px between items. The active item gets a 2px `ink` underline that extends about 10px past each side of the word, with 8px of space below the text. Hover is **(inferred)**: a 1px `ink-2` underline. No background, no bar, no logo slot; the hero names act as the logo.

**Hero (seen).** Script names, then an eyebrow date 32px below, then the nav 64px below that. Everything is centered. The illustration is absolutely positioned at the top-right, about 45% of the viewport width, and is decorative (`aria-hidden`).

**Section header (seen).** `heading-1` centered, followed by a `caption` sub-line in `ink-2` 12px below. Each section starts 128px below the previous one.

**Buttons (inferred).**
- *Primary:* `burgundy.600` fill, white `button` text, pill radius, 52px tall, 32px horizontal padding. Hover and pressed use `burgundy.700`. Disabled uses a `blush.200` fill with `ink-2` text and no pointer.
- *Secondary:* transparent with a 1px `ink` border and `ink` text, pill radius. Hover gives a `blush.50` fill.
- *Text link:* `burgundy.600` with an underline offset of 3px.
- *Focus (all):* 2px `burgundy.600` outline with a 3px offset.

**Form fields (inferred, RSVP).** Labels in `caption` uppercase, `ink`. Inputs are 52px tall with a white fill, 1px `muted` border (3.36:1, which passes the 3:1 non-text rule), radius 2px, and `body` text. On focus the border becomes 2px `burgundy.600`. On error the border becomes `semantic.error`, with a message below in `error` + an icon.

**Cards / info blocks (inferred: Travel, Things to Do).** No border and no shadow, with square corners. Content is a full-bleed photo, then `heading-2`, then body. Optionally sits on a `blush.50` panel with 48px padding.

**Notices.** A `blush.50` bar with `ink` text at `caption` size, centered, with a link in `ink` underlined (matching the "Publish your website" bar).

**Floating action (seen in editor; reuse for RSVP).** A white pill or rounded square with the `shadow.float` shadow and an icon above the label.

## 5. Layout Principles

- **Centered single column.** Text max width is 680px (`reading-max`). Grids such as the photo gallery and wedding party may go up to 1120px (`content-max`).
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Gaps between sections are 128px; stacked elements within a section are 24–48px apart.
- **Hero height:** about 640px on desktop, with type vertically centered slightly below the middle so the flowers get the top.
- **Illustration overlaps the edge.** Flowers are allowed to bleed off the viewport and sit beneath the nav, but never behind body text.
- **Rhythm:** heading-1 → caption → 48px → content. Repeat this for every section.

## 6. Depth & Elevation

The style is essentially **flat**. Depth comes from the watercolor's own layering, not from UI shadows.

| Level | Token | Use |
|---|---|---|
| 0 | `shadow.none` | Everything by default: cards, images, nav |
| 1 | `shadow.float` `0 4px 16px rgba(58,58,58,.12)` | Floating action pill only |
| 2 | `shadow.overlay` `0 12px 40px rgba(58,58,58,.16)` | Modals, dropdowns |

Hierarchy comes from scale, tracking and white space, not from z-depth.

## 7. Do's and Don'ts

**Do**
- Keep a single accent, burgundy, and use it only for things people act on.
- Center the text and leave the illustration off-axis.
- Use uppercase plus wide tracking for labels, and Title Case for nav.
- Leave white space; a section that feels "too empty" is usually right.
- Use `ink-2` for small grey text.

**Don't**
- Don't use `muted`, `sage.400`, `blush.400` or `line` for text below 24px. All four fail WCAG AA (see the audit below).
- Don't put white text on sage or rose fills (2.6:1).
- Don't add borders or shadows to cards, or gradients anywhere.
- Don't use the script face for anything but the names. Never use it for nav, buttons, or body.
- Don't use bold headings. The look depends on regular weight.
- Don't introduce a second illustration cluster on the same screen.
- Don't use The Knot's editor pink (`#E94BC8`). It isn't part of this design.

## 8. Responsive Behavior

| Breakpoint | Changes |
|---|---|
| ≥1200 (desktop) | As specified. |
| 768–1199 (tablet) | `display-script` 72px, `heading-1` 32px. Illustration shrinks to 55% width. Nav wraps onto two centered lines if needed. |
| <768 (mobile) **(inferred)** | `display-script` 56px, `eyebrow-date` 16px, `heading-1` 26px, `body` 17px. Side gutter 20px. Section gap drops to 80px. The nav collapses to a centered "Menu" text button that opens a full-screen white sheet with stacked 24px links. The illustration is cropped to the top-right corner at about 70% width, sitting above the names and never overlapping them. Grids become one column. Buttons go full width. |

Touch targets are at least 44px. The nav underline stays 2px at every size.

## 9. Agent Prompt Guide

Paste this block into every build ticket's design-spec field, together with `tokens.json`:

```
DESIGN SPEC — Watercolor Garden (tokens.json is the source of truth)
- Background #FFFFFF. Text #3A3A3A (primary) / #5E5E5E (secondary). Single accent #7A1F33 (hover #5E1726) for buttons, links, focus.
- Fonts: "Great Vibes" ONLY for couple names; "Source Serif 4" for everything else, weight 400 (buttons 600).
- Labels/headings: UPPERCASE, letter-spacing 0.14–0.18em. Nav: Title Case, 0.12em, active = 2px underline.
- Everything centered; text max-width 680px; section gap 128px; spacing scale 4/8/12/16/24/32/48/64/96/128.
- Flat: no card borders, no shadows (except floating action + modals), square corners; buttons are pills.
- Watercolor floral art top-right, decorative, aria-hidden; never behind text.
- NEVER use #8C8C8C, #8EA787, #D98E8A or #D9D6D3 for text under 24px. Error #A3261F, success #4F6B4A.
- Mobile <768: 20px gutters, script 56px, H1 26px, nav → "Menu" sheet, single column, full-width buttons.
```

**Example prompts**
- *"Build the RSVP page using the Watercolor Garden spec: heading-1 'RSVP', caption sub-line, a form with name, email, attending (radio), meal choice (select), and a note, with a primary pill submit. Show error states using semantic.error."*
- *"Add a 'Things to Do' section: three borderless cards in a 3-column grid (1 column on mobile), image, heading-2, body, and a burgundy text link."*

---

## Appendix — WCAG 2.2 contrast audit

AA thresholds: 4.5:1 for normal text, 3:1 for large text (≥24px, or ≥18.66px bold) and for UI component boundaries.

| Foreground | Background | Ratio | Normal text | Large text | Verdict |
|---|---|---|---|---|---|
| ink `#3A3A3A` | paper | 11.37 | ✅ AAA | ✅ | Pass |
| ink-2 `#5E5E5E` | paper | 6.48 | ✅ AA | ✅ | Pass |
| **muted `#8C8C8C`** | paper | **3.36** | ❌ | ✅ | **FAIL for body text** |
| ink | blush-50 | 10.49 | ✅ AAA | ✅ | Pass |
| ink-2 | blush-50 | 5.98 | ✅ AA | ✅ | Pass |
| **muted** | blush-50 | **3.10** | ❌ | ✅ (barely) | **FAIL for body text** |
| ink | blush-200 | 8.13 | ✅ AAA | ✅ | Pass |
| ink-2 | blush-200 | 4.63 | ✅ AA | ✅ | Pass (disabled button) |
| burgundy-600 | paper | 10.14 | ✅ AAA | ✅ | Pass |
| white | burgundy-600 | 10.14 | ✅ AAA | ✅ | Pass |
| white | burgundy-700 | 12.91 | ✅ AAA | ✅ | Pass |
| burgundy-600 | blush-50 | 9.35 | ✅ AAA | ✅ | Pass |
| burgundy-600 | blush-200 | 7.25 | ✅ AAA | ✅ | Pass |
| **sage-400 `#8EA787`** | paper | **2.62** | ❌ | ❌ | **FAIL** |
| **white** | sage-400 | **2.62** | ❌ | ❌ | **FAIL** |
| sage-700 `#4F6B4A` | paper | 5.94 | ✅ AA | ✅ | Pass (replacement) |
| **rose `#D98E8A`** | paper | **2.57** | ❌ | ❌ | **FAIL** |
| error `#A3261F` | paper | 7.36 | ✅ AAA | ✅ | Pass |
| **line `#D9D6D3`** | paper | **1.45** | ❌ | ❌ | **FAIL** as a UI boundary (decor only) |

**Flagged in the source screenshot:** the small grey sub-line "Date To Be Announced" under WEDDING DAY appears to be about `#8C8C8C` at about 15px. That's 3.36:1, which **fails AA**. This system moves it to `ink-2` (6.48:1). Everything else visible in the template passes.