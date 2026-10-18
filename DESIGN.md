# DESIGN.md — Nhyira

How Nhyira looks and why. Read this before building or changing any screen.

- **Source of truth for values:** [`docs/design/tokens.json`](docs/design/tokens.json). `app/globals.css` implements it. If this file and the tokens disagree, the tokens win.
- **Screens:** the Claude Design canvas "Watercolor Garden Design System" (R1 flow & screens page). Each screen below names its board.
- **Origin:** [`docs/design/source/watercolor-garden.DESIGN.md`](docs/design/source/watercolor-garden.DESIGN.md), extracted from the *yaw & Lady* template. Kept unchanged for reference.

---

## 1. Two surfaces, one system

The approved R1 screens use two related looks. They share semantic token names, so components never hard-code a hex value; the surface decides what `accent` or `paper` means.

| Surface | Screens | Feel | Set by |
|---|---|---|---|
| **guest** | Invite, RSVP states, thanks, returning, closed, not found, home, WhatsApp preview | A printed invitation: warm cream paper, full-bleed photos of the couple, italic Cormorant display, burgundy accent | `app/(guest)/layout.tsx` → `data-surface="guest"` |
| **organiser** | Sign in, reset password, dashboard | Watercolor Garden: white paper, charcoal ink, quiet uppercase labels, one burgundy accent | `app/(organiser)/layout.tsx` → `data-surface="organiser"` |

Why two: guests see the invitation once and should feel celebrated; Auntie Efua uses the dashboard often and needs it calm and scannable. **Decision (17 Oct 2026): the dashboard stays a separate, professional tool**, not a themed copy of the invite. They stay one family through the same serif body, the same burgundy family, pill buttons and 2px-radius inputs.

## 2. Colour

Semantic tokens (Tailwind classes in brackets). Values per surface are in `tokens.json`.

| Token | Guest | Organiser | Use |
|---|---|---|---|
| `paper` (`bg-paper`) | #FBF7F0 | #FFFFFF | Page background |
| `panel` (`bg-panel`) | #F3E9DA | #FDF4EF | RSVP panel, notices, empty states |
| `field` (`bg-field`) | #FFFFFF | #FFFFFF | Inputs, choice cards |
| `ink` (`text-ink`) | #2B2321 | #3A3A3A | Primary text |
| `ink-2` (`text-ink-2`) | #5A4E48 | #5E5E5E | Body, meta, captions |
| `border` (`border-border`) | #9A8D84 | #8C8C8C | Input / card boundary only |
| `line` (`border-line`) | #DCCFBF | #D9D6D3 | Decorative rules only |
| `accent` (`bg-accent`, `text-accent`) | #6E1423 | #7A1F33 | Buttons, links, selected, focus |
| `eyebrow` | #8A6A3B | #5E5E5E | Uppercase eyebrows |
| `script` | #9C5D6E | #3A3A3A | Great Vibes lines |
| `success` / `error` | #4F6B4A / #A3261F | same | States, always with an icon or word |
| `success-tint`, `error-tint`, `quiet-tint` | — | #E7EEE5, #F8E3E0, #F1EFED | Dashboard badges and notices |

**Contrast (WCAG 2.2 AA), all checked:** every text pairing above is ≥ 4.5:1 except `script` and `eyebrow` (4.68:1, still pass). `border` passes the 3:1 non-text rule (3.02 guest, 3.36 organiser). `line` (1.4:1) is never a functional boundary. White text sits on photos only over the scrim.

**Proportion:** mostly paper and photography; burgundy only on things people act on.

## 3. Type

Three self-hosted families (`app/fonts/`, SIL OFL), loaded in `lib/fonts.ts`:

| Family | Tailwind | Use |
|---|---|---|
| Cormorant Garamond 300/400/500, italic 300/400 | `font-display` | Guest headings, couple names, event names |
| Great Vibes 400 | `font-script` | The `&` between names; a guest greeting line; organiser couple names. **One script line per screen.** |
| Source Serif 4 400/600, italic 400 | `font-serif` (default) | Everything else |

Type roles are utilities in `globals.css`, so screens use the role, not raw sizes:

| Utility | Spec | Example |
|---|---|---|
| `type-hero` | Cormorant italic 300, 68/0.95 | Kay & Ama on the hero |
| `type-title` | Cormorant italic 300, 42/1.05 | Will you join us? |
| `type-event` | Cormorant 400, 30/1.1 | The Wedding |
| `type-legend` | Cormorant 500, 24/1.2 | RSVP fieldset legend |
| `type-greeting` | Great Vibes 40/1.1, `script` colour | Kwame & Ama |
| `type-eyebrow` | 12px, 0.3em, uppercase, `eyebrow` | THE CELEBRATIONS |
| `type-dateline` | 14px, 0.4em | 13 · 02 · 2027 |
| `type-label` | 12px guest / 14px organiser, uppercase, tracked | GUEST 1, EMAIL |
| `type-button` | 600, uppercase, 0.2em guest / 0.14em organiser | SEND MY REPLY |
| `type-org-title` | 22px, 0.16em, uppercase | GUEST LIST SIGN IN |

Rules: body text is never bold or wide-tracked. Weight 600 is for buttons and short emphasis inside notices only. Inputs are at least 16px so phones don't zoom.

## 4. Components

Built in `components/ui/`. Every one reads semantic tokens only, so it works on both surfaces.

| Component | Spec | Seen on |
|---|---|---|
| `Button` | Pill. Guest 56px tall, organiser 52px. `primary`: accent fill, on-accent text. `secondary`: 1px ink border, transparent. `whatsapp`: 1px success border, success text, chat icon. Full width on guest screens. Renders a `next/link` when given `href`. | All |
| `TextField`, `TextArea` | Uppercase label above. 52px, white field, 1px `border`, 2px radius. Focus: 2px accent. Error: 2px error border + message with icon, wired with `aria-invalid` / `aria-describedby`. | RSVP, sign in, search |
| `ChoiceCard` | A `<label>` wrapping a radio. 56px, white, 1px border. Checked: 2px accent border on paper (CSS `:has(:checked)`, no JS). Error: 2px error border. | RSVP |
| `SeatGroup` | Paper panel inside the RSVP panel holding guest-name fields, "Remove", "+ Add a guest (n seats left)", "Same names as …". | RSVP |
| `Badge` | Pill. `seats` (outline accent, "ADMITS 2"), `attending`, `declined`, `waiting`. | Events, dashboard |
| `FilterChip` | 44px pill link, 1px border; active = ink fill, white text, `aria-current`. | Dashboard |
| `Notice` | Panel with icon and text. Tones `info` (panel), `success` (success-tint), `error` (error-tint, `role="alert"`). | Closed, reset sent, expired |
| `ErrorSummary` | White box, 1px error border, title + jump links to each problem field. | RSVP with errors |
| `CoupleNames` | "Kay *&* Ama": display italic with a Great Vibes ampersand. Sizes `hero`, `lg`, `md`. | Guest screens |
| `Photo` | `next/image` fill, cover, optional bottom scrim and caption (year + label). Placeholder fill `line`. | Hero, story, thanks |
| `ExpandableRow` | One-line list row for long organiser lists: optional tick box, a summary button that opens a full-width details panel, round icon actions (≥ 44px). Used by Guests and Requests. | Dashboard |
| `GuestPass` | White box on paper, 1px `line`: eyebrow "YOUR PASS", QR code (black on white, 220px, whatever the theme), name in display 30px, `seats` badge, date/venue meta, instruction or "Checked in at …" in success. | Invite 1c/1d/1e |
| `DayDetails`, `Programme` | When / Where / Programme / Dress colours as eyebrow-labelled rows; the programme is a list with a left `line` rule, time right-aligned. | Sign-up, invite |
| `Icon` | Inline stroke SVGs: alert, mail, lock, search, close, whatsapp, check, chevron, copy, users, pencil, plus, upload, send. `aria-hidden` unless labelled. | All |

Focus is always visible: 2px accent outline, 3px offset.

## 5. Layout

- **Mobile first.** Design at 390px, test at 360px. Guest pages are a single column with a 28px gutter; photos run full bleed.
- **Guest page rhythm:** hero photo (≈780px tall on phones) → personal greeting with the roses sprig → story photo grid (6px gaps) → rose break → events list (rules between events) → RSVP panel → closing photo.
- **Organiser:** 20px gutter on phones, `max-w-[1200px]` centered on desktop. Dashboard turns its household list into a table at ≥ 1024px.
- **Spacing scale:** Tailwind's 4px scale (4, 8, 12, 16, 24, 32, 48, 56, 64, 96, 128).
- **Elevation:** flat. Shadows only for a floating action or overlay (`shadow-float`, `shadow-overlay`).
- **Radius:** photos and panels square; inputs 2px; buttons, chips, badges pills.

## 6. Imagery

The main photo and the four story photos are uploaded by organisers on `/admin/details` (Supabase Storage); `public/images/kay-ama.jpg` is the built-in main photo until one is uploaded, and the story section stays hidden until all four exist. Always `next/image` with `sizes`, `object-cover` and a set focal point (`object-position`), because guests load them over mobile data. `roses.png` is the decorative sprig: `alt=""`.

## 7. Do and don't

**Do**
- Use semantic tokens and type utilities. No raw hex in components.
- Keep one script line per screen and one accent.
- Put meaning in words and icons, not colour alone (badges say "Attending").
- Keep tap targets ≥ 44px.

**Don't**
- Add shadows, gradients (except the photo scrim) or rounded cards.
- Use `line` or `border` colours for text.
- Use Inter, Geist or system UI fonts.
- Invent copy, numbers or names; wedding facts come from `getWedding()` (edited on `/admin/details`).

## 8. Screen map (R1)

| Route | Surface | Boards |
|---|---|---|
| `/` | guest | 3 · Home / save the date |
| `/i/[token]` | guest | 1a first open · 1b filling in, errors · 1c submitted · 1d returning · 1e closed (1c/1d/1e show the pass when coming) |
| `/i/[token]` (unknown) | guest | 2 · Invitation not found |
| `/og`, `/og/[token]` | guest | 6 · WhatsApp preview, with and without photo |
| `/request/<code>` | guest | Request a place: form, sent, closed (no board; built from the system) |
| `/join/<code>` | guest | The main sign-up: the day's details, name + phone, "Confirm my place"; full; closed (no board; built from the system) |
| `/login` | organiser | 4a sign in · forgot password · 4b reset sent · 4c link expired · new password (built from the system) |
| `/admin` | organiser | 5a dashboard mobile + desktop · 5b search, no matches |
| `/admin/requests`, `/admin/links`, `/admin/details` | organiser | Requests, Sign-up links and Wedding details tabs (no board; built from the system) |
| `/checkin` | organiser | Entrance: camera scanner, result panel (success / already / not found), name or phone search. Organisers and ushers. (Built from the system.) |
| `/admin/guests/new`, `/admin/guests/<token>`, `/admin/guests/import`, `/admin/send` | organiser | Add/edit household, import, send queue (no board; built from the system) |
| `/styleguide` | both | Tokens and components (development only) |
