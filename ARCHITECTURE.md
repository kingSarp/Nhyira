# ARCHITECTURE.md — Nhyira

What Nhyira is, how the code is laid out, and the rules that keep it simple. Product context lives in the plan doc ("Wedding Invite & RSVP Platform — Product Plan"); look and feel lives in [DESIGN.md](DESIGN.md).

## 1. What we are building (Release 1)

A personal invitation per household, opened from a WhatsApp link. Guests see their events and seat limit and RSVP without an account. The couple and family organisers sign in to a dashboard to see the headcount and send links.

**Current phase: backend.** Screens call a data layer (`lib/data`) that reads and writes Supabase Postgres from the server. Organisers sign in with email and password (Supabase Auth).

### Three ways in

| Way in | URL | Who sets the seats | Couple can switch off |
|---|---|---|---|
| Personal invite (guest list) | `/i/<token>` | The couple, when adding the household | No, always on |
| Request a place | `/request/<code>` | The couple, when approving the request | Yes |
| Open sign-up, one seat | `/join/<code>` | Fixed: 1 seat per event the couple ticks | Yes, plus an optional sign-up limit |

Both shared links start **off**. Requests are approved with default seats (the party size at each event ticked on the request link's settings); "Adjust seats" on a row overrides that for one person, and ticked rows can be approved or declined together. "Make a new link" retires the current `<code>` for good (it shows "no longer taking sign-ups" forever) and issues a new one, left off. Approved requests and open sign-ups become ordinary invitations with their own `/i/<token>`, marked `source: "request" | "open"`. A phone number can hold only one invitation or pending request.

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript strict | Read `node_modules/next/dist/docs/` before using an API you haven't checked; this version differs from older training data. |
| Styling | Tailwind CSS v4, CSS-first config in `app/globals.css` | No `tailwind.config.*`. Tokens are CSS variables mapped in `@theme inline`. |
| Fonts | `next/font/local`, files in `app/fonts/` | Self-hosted: no Google Fonts request at build or run time. |
| Images | `next/image`, files in `public/images/` | AVIF/WebP, sized per breakpoint. |
| Database | Supabase Postgres via `postgres` (porsager) | Server only, through the transaction pooler. Schema in `db/schema.sql`. |
| Auth | Supabase Auth email + password via `@supabase/ssr` | Organisers only; guests never sign in. |
| Hosting (next) | Vercel | |

No UI kit, no state library, no CSS-in-JS. Add a dependency only when the platform can't do it; say why in the PR.

Dependencies beyond the starter: **postgres** (SQL with real transactions; the open sign-up limit and phone checks need row locks, which the Supabase REST client can't do), **@supabase/ssr** + **@supabase/supabase-js** (email-link sign-in and session cookies), **sharp** (already installed by Next for image optimisation), used to turn the preview card into a JPEG. `next/og` only outputs PNG, which is ~600 KB for a photo card, and WhatsApp drops preview images much over ~300 KB.

## 3. Folder layout

```
app/
  layout.tsx                 Root: <html>, fonts, metadata. No surface.
  globals.css                Tokens (both surfaces), Tailwind theme, type utilities.
  fonts/                     Self-hosted woff2 (SIL OFL).
  (guest)/                   data-surface="guest"
    layout.tsx
    page.tsx                 /            Home, save the date
    opengraph-image.tsx      Generic preview card (home page, shared sign-up links)
    i/[token]/
      page.tsx               /i/[token]   Invite + RSVP (states 1a–1e)
      actions.ts             submitRsvp server action
      not-found.tsx          Invitation not found
    request/[code]/          /request/<code>  Request a place (form, sent, closed)
    join/[code]/             /join/<code>     Open one-seat sign-up (form, full, closed)
      opengraph-image.tsx    WhatsApp preview card for this household (JPEG, ~55 KB)
  (organiser)/               data-surface="organiser"
    layout.tsx
    login/page.tsx           /login       Sign in, forgot password, reset sent, link expired
    login/new-password/      /login/new-password  Choose a password (after the reset link)
    admin/
      layout.tsx             Header + tabs (Guests · Requests · Sign-up links)
      page.tsx               /admin           Guests: headcount, toolbar, search, one-line household list
      guests/new/            /admin/guests/new         Add a household
      guests/[token]/        /admin/guests/<token>     Edit or remove a household
      guests/import/         /admin/guests/import      Paste or upload a spreadsheet, preview, add
      guests/actions.ts      Household and import server actions
      send/page.tsx          /admin/send               One-at-a-time WhatsApp queue (invites, reminders)
      send/[token]/route.ts  Records "sent", then redirects to wa.me
      requests/page.tsx      /admin/requests  Inbox list: one line per request, ✓/✕ per row, bulk approve/decline; tap a name for details and seats
      links/page.tsx         /admin/links     Turn shared links on/off, new link, open-link settings
      actions.ts             Organiser server actions
    auth/confirm/route.ts    /auth/confirm  Where the password-reset email link lands
  styleguide/page.tsx        /styleguide  Tokens + components, dev only
proxy.ts                     Refreshes the organiser session on /admin and /login
db/schema.sql                Tables, indexes, RLS. `npm run db:setup` runs it.
components/
  ui/                        Design-system primitives. No data fetching, no copy.
  guest/                     Guest-screen sections (Hero, Story, EventList, RsvpForm…)
  organiser/                 Dashboard sections (HeadcountCards, HouseholdList…)
  dev/                       Styleguide and screen stubs. Not used by real screens.
lib/
  content/wedding.ts         Couple, events, story photos, contact, deadline. Edit per wedding.
  data/
    types.ts                 Invitation, EventResponse, Household, Headcount
    index.ts                 The data API screens call (getInvitation, listHouseholds…)
    signups.ts               Shared links, join requests, open sign-ups
    households.ts            Add, edit, remove, import households; mark sent
    ids.ts                   Personal-link tokens, phone normalisation
    rows.ts                  Database rows → app types
  db.ts                      Postgres connection (server only)
  auth.ts                    getOrganiser(), ADMIN_EMAILS allowlist
  supabase/server.ts         Supabase client for sign-in (cookies)
  rsvp.ts                    RSVP field names, parsing, validation (shared by form and action)
  signup-forms.ts            Request and open sign-up parsing, validation
  household-forms.ts         Household form + spreadsheet (CSV/TSV) parsing and validation
  households.ts              Dashboard answer lines, WhatsApp message
  site.ts                    Public site URL
  fonts.ts                   next/font/local definitions
  og.tsx                     Preview-card renderer (next/og → JPEG via sharp)
assets/og/                   WOFF fonts for the card renderer (it can't read woff2)
  format.ts                  Date and phone formatting (en-GB, Africa/Accra)
  cn.ts                      className joiner
docs/design/
  tokens.json                Design tokens (source of truth)
  source/                    Original Watercolor Garden extraction, unchanged
```

**Route groups** `(guest)` and `(organiser)` don't change URLs; they exist so each side gets its own surface and, later, its own auth rules.

## 4. Rendering model

- **Server Components by default.** Every page and section renders on the server.
- **Client Components only where the user changes something before submitting:** the RSVP form (attending toggles, add/remove seats, "same names as"), dashboard search-as-you-type if we add it. Mark them `"use client"` and keep them leaf-level.
- **Forms work without JavaScript first.** The RSVP form posts with a native `<form action>`; client code only enhances it. Choice-card selection styling uses CSS `:has(:checked)`, not state.
- **`cacheComponents` is off** (`next.config.ts`). Every page is personal to one guest or one signed-in organiser, so we render per request. Revisit only for the public home page.

## 5. Data layer (the seam)

Screens never import `lib/db` or Supabase directly. They call `lib/data`:

```ts
getInvitation(token: string): Promise<Invitation | null>
listHouseholds(filter?: { q?: string; status?: ReplyStatus }): Promise<Household[]>
getHeadcount(): Promise<Headcount[]>
```

They query Postgres directly from the server as the database owner (`DATABASE_URL`, Supabase's transaction pooler on port 6543, `prepare: false`). Row level security is on with no policies, so the public Supabase keys can't read the tables. Writes that check-then-insert (join requests, open sign-ups, approvals, household edits) run in one transaction and lock the row they depend on; a unique `phone_key` (normalised number) backs up the one-phone-one-household rule. Writes are server actions in each route's `actions.ts`.

| Table | Holds |
|---|---|
| `invitations` | One row per household: seats and responses as JSON keyed by event id, `source`, `sent_at` |
| `join_requests` | "Request a place" submissions; `token` links to the invitation made on approval |
| `signup_links` | The two shared links: code, on/off, events, limit, retired codes |

Wedding content (names, events, venues, dress colours, story photos, deadline) is static config in `lib/content/wedding.ts`, not data. Each event has an `id` that matches the keys of a household's `seats`.

## 6. Screen states

Each guest state is the same route rendered from data, not a separate page:

| State | Condition |
|---|---|
| 1a First open | invitation found, no response, RSVP open |
| 1b Errors | server returned field errors for the submitted form |
| 1c Submitted | response just saved (redirect with `?sent=1`) |
| 1d Returning | response exists, RSVP open (`?view=full` shows the whole invite with the form pre-filled) |
| 1e Closed | now is past `wedding.rsvpDeadline` |
| 2 Not found | token unknown → `notFound()` |

For review, `?preview=closed` forces 1e anywhere except Vercel production.

**RSVP form flow.** `components/guest/RsvpForm.tsx` (client) posts to `submitRsvp` (`actions.ts`). The action parses and validates with `lib/rsvp.ts`, then calls `saveResponse` and redirects to `?sent=1`. On errors it returns the submitted values and an error list; the form restores them, shows the summary and moves focus to it. Seat-name fields reveal with CSS (`:has(:checked)`), so the form works before JS loads; "Add a guest", "Remove" and "Same names as" need JS.

Organisers sign in at `/login` with email and password; only addresses in `ADMIN_EMAILS` are tried against Supabase, and anyone else gets the same "doesn't match" error. Other states come from search params (`?forgot=1`, `?reset=sent&email=`, `?error=link`). "Forgot password?" (also how an organiser sets their first password) emails a reset link, again only to `ADMIN_EMAILS`. The link lands on `/auth/confirm` (token hash from our email template, or a PKCE code from Supabase's default one), which starts the session, re-checks the allowlist and opens `/login/new-password`. Supabase sign-ups are turned off; organisers are added under Authentication → Users. `proxy.ts` renews the session cookie; `getOrganiser()` verifies it on every dashboard page and action.

**Guest list.** Organisers add households one by one or import a spreadsheet (header row with Name, Greeting, Phone, Side, Engagement, Church, Reception, in any order; pasted from Excel/Sheets as tabs, or a CSV file). The import shows rows to fix first; only valid, non-duplicate rows are added, all at once. A phone number can belong to one household. Editing seats below the names already given keeps the first names. Sending goes through `/admin/send/<token>`, which stamps `sentAt` so the list shows "Not sent / Sent today", and the send queue walks through unsent invites, then "sent, no reply" reminders.

Dashboard filters and search are URL search params (`?q=&status=`), so they are shareable and work without JS. Households show as cards below 1024px and as a table above. "Send on WhatsApp" opens `wa.me/<number>` with the invite message and the household's link (`lib/households.ts`); set `NEXT_PUBLIC_SITE_URL` so the link points at the live site.

## 7. Conventions

- **Tokens only.** No hex values or arbitrary colours in components; use `bg-paper`, `text-ink-2`, `border-border` and the `type-*` utilities. New token → add to `docs/design/tokens.json` and `globals.css` together.
- **Copy** lives in the component that shows it, except wedding-specific facts, which come from `lib/content/wedding.ts`. Unknown facts are `[PLACEHOLDER]`, never invented.
- **Accessibility:** real `<button>`, `<a>`, `<label>`; fieldsets with legends for each event; errors linked by `aria-describedby`; focus visible; tap targets ≥ 44px; one `<h1>` per page.
- **Dates** render in `en-GB`, timezone `Africa/Accra` (`lib/format.ts`).
- **Files:** components in PascalCase files, one component per file, named exports. Pages default-export.
- **Imports** use `@/` (project root).

## 8. Quality bar

- `npm run lint` and `npm run build` pass with no warnings before a change is done.
- Check each screen at 360px and 390px, and the dashboard at 1280px.
- Guest invite page: Lighthouse performance ≥ 90 on mobile; hero image under 150 KB.

## 9. Next

Done: Supabase tables, `lib/data` on Postgres, email + password sign-in.

1. **Photo uploads from the dashboard** (admin only): Supabase Storage bucket, an upload screen under `/admin/photos`, and `lib/content` image slots read from the bucket instead of `public/images/`. The current photos are stand-ins until then.
2. Deploy to Vercel (set `DATABASE_URL`, the Supabase keys, `ADMIN_EMAILS` and `NEXT_PUBLIC_SITE_URL`, so preview cards and links use the live address), run the 15–20 household validation test.
