# ARCHITECTURE.md — Nhyira

What Nhyira is, how the code is laid out, and the rules that keep it simple. Product context lives in the plan doc ("Wedding Invite & RSVP Platform — Product Plan"); look and feel lives in [DESIGN.md](DESIGN.md).

## 1. What we are building (Release 1)

A personal invitation per household, opened from a WhatsApp link. Guests see their events and seat limit and RSVP without an account. The couple and family organisers sign in to a dashboard to see the headcount and send links.

**Current phase: frontend only.** Screens are built against typed mock data behind a data layer (`lib/data`). Supabase, auth and server actions come next, behind the same functions, so screens don't change when the backend lands.

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript strict | Read `node_modules/next/dist/docs/` before using an API you haven't checked; this version differs from older training data. |
| Styling | Tailwind CSS v4, CSS-first config in `app/globals.css` | No `tailwind.config.*`. Tokens are CSS variables mapped in `@theme inline`. |
| Fonts | `next/font/local`, files in `app/fonts/` | Self-hosted: no Google Fonts request at build or run time. |
| Images | `next/image`, files in `public/images/` | AVIF/WebP, sized per breakpoint. |
| Backend (next phase) | Supabase Postgres + Auth, server actions | One `invitations` table; see the plan doc §7a. |
| Hosting (next phase) | Vercel | |

No UI kit, no state library, no CSS-in-JS. Add a dependency only when the platform can't do it; say why in the PR.

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
      not-found.tsx          Invitation not found
      opengraph-image.tsx    WhatsApp preview card (next phase)
  (organiser)/               data-surface="organiser"
    layout.tsx
    login/page.tsx           /login       Sign in, link sent, expired
    admin/page.tsx           /admin       Dashboard
  styleguide/page.tsx        /styleguide  Tokens + components, dev only
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
    mock.ts                  Mock households. Replaced by Supabase in the next phase.
  fonts.ts                   next/font/local definitions
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

Screens never import mock data or Supabase directly. They call `lib/data`:

```ts
getInvitation(token: string): Promise<Invitation | null>
listHouseholds(filter?: { q?: string; status?: ReplyStatus }): Promise<Household[]>
getHeadcount(): Promise<Headcount[]>
```

Today these read `lib/data/mock.ts`. Next phase they query Supabase with the service-role key on the server; signatures stay the same. Writes (`submitRsvp`, `sendMagicLink`) will be server actions in each route's `actions.ts`.

Wedding content (names, events, venues, dress colours, story photos, deadline) is static config in `lib/content/wedding.ts`, not data. Each event has an `id` that matches the keys of a household's `seats`.

## 6. Screen states

Each guest state is the same route rendered from data, not a separate page:

| State | Condition |
|---|---|
| 1a First open | invitation found, no response, RSVP open |
| 1b Errors | server returned field errors for the submitted form |
| 1c Submitted | response just saved (redirect with `?sent=1`) |
| 1d Returning | response exists, RSVP open |
| 1e Closed | now is past `wedding.rsvpDeadline` |
| 2 Not found | token unknown → `notFound()` |

Organiser `/login` states come from search params (`?sent=1`, `?error=link`). Dashboard filters and search are URL search params (`?q=&status=`), so they are shareable and work without JS.

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

## 9. Next phase (not started)

1. Supabase project, `invitations` table, RLS on with no policies (server-only access).
2. `lib/data` reads Supabase; `submitRsvp` server action with validation against seat limits.
3. Email magic-link auth for `/admin`, allowlist from `ADMIN_EMAILS`, session refresh in `proxy.ts`.
4. `opengraph-image.tsx` per household.
5. Deploy to Vercel, run the 15–20 household validation test.
