# ARCHITECTURE.md — Nhyira

What Nhyira is, how the code is laid out, and the rules that keep it simple. Product context lives in the plan doc ("Wedding Invite & RSVP Platform — Product Plan"); look and feel lives in [DESIGN.md](DESIGN.md).

## 1. What we are building (Release 1)

One shared sign-up link, sent on WhatsApp. Each guest sees the day, confirms with their name and phone (no account) and gets a pass with a QR code, which ushers scan at the entrance. Organisers can also keep a guest list with personal links and seat limits. Organisers sign in to a dashboard for the headcount, the links and the wedding details; ushers sign in to the check-in screen only.

**Current phase: backend.** Screens call a data layer (`lib/data`) that reads and writes Supabase Postgres from the server. Organisers sign in with email and password (Supabase Auth).

### Three ways in

| Way in | URL | Who sets the seats | Couple can switch off |
|---|---|---|---|
| **Open sign-up (the main one)** | `/join/<code>` | Fixed: 1 seat, confirmed straight away | Yes, plus an optional sign-up limit |
| Personal invite (guest list) | `/i/<token>` | The couple, when adding the household | No, always on |
| Request a place | `/request/<code>` | The couple, when approving the request | Yes |

Both shared links start **off**. Requests are approved with default seats (the party size they asked for); "Adjust seats" on a row overrides that for one person, and ticked rows can be approved or declined together. "Make a new link" retires the current `<code>` for good (it shows "no longer taking sign-ups" forever) and issues a new one, left off. Approved requests and open sign-ups become ordinary invitations with their own `/i/<token>`, marked `source: "request" | "open"`. A phone number can hold only one invitation or pending request.

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript strict | Read `node_modules/next/dist/docs/` before using an API you haven't checked; this version differs from older training data. |
| Styling | Tailwind CSS v4, CSS-first config in `app/globals.css` | No `tailwind.config.*`. Tokens are CSS variables mapped in `@theme inline`. |
| Fonts | `next/font/local`, files in `app/fonts/` | Self-hosted: no Google Fonts request at build or run time. |
| Images | `next/image`, files in `public/images/` | AVIF/WebP, sized per breakpoint. |
| Database | Supabase Postgres via `postgres` (porsager) | Server only, through the transaction pooler. Schema in `db/schema.sql`. |
| Auth | Supabase Auth email + password via `@supabase/ssr` | Organisers and ushers only; guests never sign in. |
| Hosting (next) | Vercel | |

No UI kit, no state library, no CSS-in-JS. Add a dependency only when the platform can't do it; say why in the PR.

Dependencies beyond the starter: **postgres** (SQL with real transactions; the open sign-up limit and phone checks need row locks, which the Supabase REST client can't do), **@supabase/ssr** + **@supabase/supabase-js** (sign-in, session cookies and photo storage), **qrcode** (the pass's QR code, as SVG on the server), **jsqr** (reads QR codes on the check-in screen in browsers without `BarcodeDetector`, i.e. iPhone Safari; loaded only there), **sharp** (already installed by Next for image optimisation), used to turn the preview card into a JPEG. `next/og` only outputs PNG, which is ~600 KB for a photo card, and WhatsApp drops preview images much over ~300 KB.

## 3. Folder layout

```
app/
  layout.tsx                 Root: <html>, fonts, metadata. No surface.
  globals.css                Tokens (both surfaces), Tailwind theme, type utilities.
  fonts/                     Self-hosted woff2 (SIL OFL).
  (guest)/                   data-surface="guest"
    layout.tsx
    page.tsx                 /            Home, save the date
    i/[token]/
      page.tsx               /i/[token]   Invite + RSVP (states 1a–1e)
      actions.ts             submitRsvp server action
      not-found.tsx          Invitation not found
    request/[code]/          /request/<code>  Request a place (form, sent, closed)
    join/[code]/             /join/<code>     Open one-seat sign-up (form, full, closed)
  (organiser)/               data-surface="organiser"
    layout.tsx
    login/page.tsx           /login       Sign in, forgot password, reset sent, link expired
    login/new-password/      /login/new-password  Choose a password (after the reset link)
    admin/
      layout.tsx             Header + tabs (Guests · Requests · Sign-up links · Wedding details · Team · Check-in)
      page.tsx               /admin           Guests: headcount, toolbar, search, one-line household list
      guests/new/            /admin/guests/new         Add a household
      guests/[token]/        /admin/guests/<token>     Edit or remove a household
      guests/import/         /admin/guests/import      Paste or upload a spreadsheet, preview, add
      guests/actions.ts      Household and import server actions
      send/page.tsx          /admin/send               One-at-a-time WhatsApp queue (invites, reminders)
      send/[token]/route.ts  Records "sent", then redirects to wa.me
      requests/page.tsx      /admin/requests  Inbox list: one line per request, ✓/✕ per row, bulk approve/decline; tap a name for details and seats
      links/page.tsx         /admin/links     Turn shared links on/off, new link, open-link settings
      details/page.tsx       /admin/details   Edit names, date, venue, time, programme, dress colours, contact, deadline, photos
      actions.ts             Dashboard server actions (requests, links)
      details/actions.ts     Wedding details and photo uploads
      team/                  /admin/team      Add, reset, change role, remove ushers and organisers
    checkin/                 /checkin         Entrance: scan passes, find guests (organisers and ushers)
      actions.ts             checkInGuest, undoGuest, searchGuests
    auth/confirm/route.ts    /auth/confirm  Where the password-reset email link lands
  og/route.ts, og/[token]/   /og, /og/<token>  WhatsApp preview cards (generic, per household)
  styleguide/page.tsx        /styleguide  Tokens + components, dev only
proxy.ts                     Refreshes the staff session on /admin, /login and /checkin
db/schema.sql                Tables, indexes, RLS. `npm run db:setup` runs it.
components/
  ui/                        Design-system primitives. No data fetching, no copy.
  guest/                     Guest-screen sections (Hero, Story, EventList + Programme, DayDetails, GuestPass, RsvpForm…)
  organiser/                 Dashboard sections (HeadcountCards, HouseholdList, DetailsForm, CouplePhotoForm,
                             StorySlotForm, CheckInDesk…)
  dev/                       Styleguide and screen stubs. Not used by real screens.
lib/
  content/wedding.ts         Fixed structure (event ids/names) and starting values for the editable details
  wedding.ts                 Stored details → what screens use (toWedding, normaliseDetails)
  wedding-form.ts            /admin/details field names, parsing, validation
  data/
    types.ts                 Invitation, EventResponse, Household, Headcount
    index.ts                 The data API screens call (getInvitation, listHouseholds…)
    signups.ts               Shared links, join requests, open sign-ups
    households.ts            Add, edit, remove, import households; mark sent
    ids.ts                   Personal-link tokens, phone normalisation
    rows.ts                  Database rows → app types
    wedding.ts               getWedding(), saving details, photo upload/delete (Storage)
    checkin.ts               checkIn, undoCheckIn, findGuests, arrivalCounts, peopleFor
    staff.ts                 listStaff, addStaff, resetStaffPassword, setStaffRole, removeStaff
  db.ts                      Postgres connection (server only)
  auth.ts                    getStaff() (organiser or usher), getOrganiser(); sign-ups must be off
  checkin.ts                 tokenFromScan(), CheckInView (shared by the scanner and its actions)
  shrink-photo.ts            Browser-side photo shrinking before upload
  supabase/server.ts         Supabase client for sign-in (cookies)
  supabase/admin.ts          Supabase admin client (secret key), server only: staff accounts
  rsvp.ts                    RSVP field names, parsing, validation (shared by form and action)
  signup-forms.ts            Request and open sign-up parsing, validation
  household-forms.ts         Household form + spreadsheet (CSV/TSV) parsing and validation
  households.ts              Dashboard answer lines, WhatsApp message
  site.ts                    Public site URL
  fonts.ts                   next/font/local definitions
  og.tsx                     Preview-card renderer (next/og → JPEG via sharp) and previewImages(): card URLs
                             carry a version (names, date, main photo), so WhatsApp and the CDN never reuse an old card.
                             Served by app/og (generic) and app/og/[token] (per household).
  format.ts                  Date and phone formatting (en-GB, Africa/Accra)
  cn.ts                      className joiner
assets/og/                   WOFF fonts for the card renderer (it can't read woff2)
docs/design/
  tokens.json                Design tokens (source of truth)
  source/                    Original Watercolor Garden extraction, unchanged
```

**Route groups** `(guest)` and `(organiser)` don't change URLs; they exist so each side gets its own surface and, later, its own auth rules.

## 4. Rendering model

- **Server Components by default.** Every page and section renders on the server.
- **Client Components only where the user changes something before submitting:** the RSVP form (attending toggles, add/remove seats, "same names as"), the photo upload forms (shrink before upload, preview), and the check-in scanner (camera). Mark them `"use client"` and keep them leaf-level.
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
| `invitations` | One row per household: seats and responses as JSON keyed by event id, `source`, `sent_at`, `checked_in_at` / `checked_in_by` |
| `join_requests` | "Request a place" submissions; `token` links to the invitation made on approval |
| `signup_links` | The two shared links: code, on/off, events, limit, retired codes |
| `wedding_details` | One row: the editable wedding details as JSON (see `WeddingDetails`) |

Wedding details (names, date, city, the day's time/venue/map link/programme/dress colours, contact, RSVP deadline, story photos) are data: one row in `wedding_details`, edited on `/admin/details`, validated by `lib/wedding-form.ts` and read with `getWedding()` (once per request, merged over the defaults in `lib/content/wedding.ts`, so a missing or old row still renders). The event itself is fixed in code (one, `wedding`: the whole day); its `id` matches the keys of a household's `seats` and `responses`. The parts of the day are the editable `programme`, wording only. Rows from the earlier three-event setup still load: extra keys are ignored. The main photo (with a top/centre/bottom framing choice) and the story photos are in the public `wedding-photos` Supabase Storage bucket; the row stores their URL and object path. With no main photo uploaded, the built-in `public/images/kay-ama.jpg` is used. Uploads are shrunk in the browser, re-encoded as JPEG with sharp on the server and written with the organiser's own session (bucket policies in `db/schema.sql` allow only signed-in users to write).

## 6. Screen states

Each guest state is the same route rendered from data, not a separate page:

| State | Condition |
|---|---|
| 1a First open | invitation found, no response, RSVP open |
| 1b Errors | server returned field errors for the submitted form |
| 1c Submitted | response just saved (redirect with `?sent=1`); shows the pass if they're coming |
| 1d Returning | response exists, RSVP open; the pass, then the form to change the reply (`?view=full` shows the whole invite) |
| 1e Closed | now is past the RSVP deadline; the pass if they're coming (this is what guests open on the day) |
| 2 Not found | token unknown → `notFound()` |

For review, `?preview=closed` forces 1e anywhere except Vercel production.

**RSVP form flow.** `components/guest/RsvpForm.tsx` (client) posts to `submitRsvp` (`actions.ts`). The action parses and validates with `lib/rsvp.ts`, then calls `saveResponse` and redirects to `?sent=1`. On errors it returns the submitted values and an error list; the form restores them, shows the summary and moves focus to it. Seat-name fields reveal with CSS (`:has(:checked)`), so the form works before JS loads; "Add a guest", "Remove" and "Same names as" need JS.

Organisers are the users in Supabase → Authentication → Users, added there by hand; there is no list in the code. They sign in at `/login` with email and password; Supabase gives the same "doesn't match" error for an unknown email and a wrong password. Other states come from search params (`?forgot=1`, `?reset=sent&email=`, `?error=link`). "Forgot password?" emails a reset link (Supabase only sends to existing users and says "sent" either way). The link lands on `/auth/confirm` (token hash from our email template, or a PKCE code from Supabase's default one) and opens `/login/new-password`; links that carry the session after `#` (sent from the Supabase dashboard) are picked up in the browser by `AuthLinkHandler`. Every account is staff (an organiser, or an usher when `app_metadata.role = "usher"`), so Supabase sign-ups must stay off: `getStaff()` reads that setting (cached 5 minutes) and locks everything while sign-ups are on. After sign-in, organisers land on `/admin` and ushers on `/checkin`. `proxy.ts` renews the session cookie; `getOrganiser()` verifies it on every dashboard page and action.

**The guest flow (one link).** The organiser shares the open sign-up link (`/join/<code>`). The guest sees the day (date, time, address, programme, dress colours), enters name and phone, and taps "Confirm my place": there are no event choices, because the day is one event (`EVENTS` in `lib/content/wedding.ts`) and the engagement, church service and reception are its `programme`, wording only. They land on their invitation (`/i/<token>?sent=1`), which shows their **pass**: a QR code of their invitation URL (`components/guest/GuestPass.tsx`, generated with `qrcode`). Self sign-ups never enter the "Send invites" queue (`needsInvite()` in `lib/households.ts`). The pass also shows on return visits and after replies close, i.e. on the day.

**Check-in.** `/checkin` (organisers and ushers) scans passes with the camera (the browser's `BarcodeDetector` where there is one, else `jsqr`), reads the token from the URL (`tokenFromScan`), and stamps `checked_in_at` / `checked_in_by` once; a second scan shows when and by whom. Guests without a pass are found by name or phone. Ushers are Supabase users with `app_metadata.role = "usher"`; `getStaff()` returns the role, ushers only reach `/checkin`.

**Team.** `/admin/team` lists staff and lets organisers add (organiser or usher, with a generated three-word password shown once), reset passwords, change roles and remove people. It uses the Supabase admin API with `SUPABASE_SECRET_KEY` (`lib/supabase/admin.ts`, server only; `lib/data/staff.ts`). `getStaff()` asks Supabase Auth on every request (`getUser`, not just the signed cookie), so a removal or role change applies immediately; it's cached per request. Organisers can't remove themselves or change their own role.

**Guest list.** Organisers add households one by one or import a spreadsheet (header row with Name, Greeting, Phone, Side, Seats, in any order; older sheets with Engagement / Church / Reception columns import as the largest of them; pasted from Excel/Sheets as tabs, or a CSV file). The import shows rows to fix first; only valid, non-duplicate rows are added, all at once. A phone number can belong to one household. Editing seats below the names already given keeps the first names. Sending goes through `/admin/send/<token>`, which stamps `sentAt` so the list shows "Not sent / Sent today", and the send queue walks through unsent invites, then "sent, no reply" reminders.

Dashboard filters and search are URL search params (`?q=&status=`), so they are shareable and work without JS. Households show as cards below 1024px and as a table above. "Send on WhatsApp" opens `wa.me/<number>` with the invite message and the household's link (`lib/households.ts`); set `NEXT_PUBLIC_SITE_URL` so the link points at the live site.

## 7. Conventions

- **Tokens only.** No hex values or arbitrary colours in components; use `bg-paper`, `text-ink-2`, `border-border` and the `type-*` utilities. New token → add to `docs/design/tokens.json` and `globals.css` together.
- **Copy** lives in the component that shows it, except wedding-specific facts, which come from `getWedding()`. Never invent them.
- **Accessibility:** real `<button>`, `<a>`, `<label>`; fieldsets with legends for each event; errors linked by `aria-describedby`; focus visible; tap targets ≥ 44px; one `<h1>` per page.
- **Dates** render in `en-GB`, timezone `Africa/Accra` (`lib/format.ts`).
- **Files:** components in PascalCase files, one component per file, named exports. Pages default-export.
- **Imports** use `@/` (project root).

## 8. Quality bar

- `npm run lint` and `npm run build` pass with no warnings before a change is done.
- Check each screen at 360px and 390px, and the dashboard at 1280px.
- Guest invite page: Lighthouse performance ≥ 90 on mobile; hero image under 150 KB.

## 9. Next

Done: Supabase tables, `lib/data` on Postgres, email + password sign-in with organiser and usher roles, deployed on Vercel (Dublin, next to the database), wedding details and photos editable from the dashboard, versioned WhatsApp preview cards, the one-link flow with QR passes and entrance check-in.

1. Run a full rehearsal: sign up through the shared link on a phone, open the pass, scan it on `/checkin` from an Android phone and an iPhone.
2. Custom SMTP in Supabase (Authentication → Emails) before other organisers or ushers need password resets; the built-in sender only reaches the Supabase organisation, a few emails an hour.
