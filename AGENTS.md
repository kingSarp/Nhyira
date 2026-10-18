<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Nhyira — agent guide

Nhyira is a wedding invitation and RSVP site for a Ghanaian wedding. Each household opens a personal link from WhatsApp, sees its events and seat limit, and RSVPs without an account. Family organisers sign in to a dashboard for the headcount.

**Phase: backend.** Screens call `lib/data`, which talks to Supabase Postgres from the server (`lib/db.ts`). Organiser sign-in is Supabase Auth (`lib/auth.ts`, `proxy.ts`). Every organiser page and server action checks `getOrganiser()`. Never send the database URL or any secret to the browser; only `NEXT_PUBLIC_*` values may reach client code. Schema changes go in `db/schema.sql` and must stay safe to re-run.

## Read first

1. [ARCHITECTURE.md](ARCHITECTURE.md): folders, rendering model, data seam, conventions.
2. [DESIGN.md](DESIGN.md): surfaces, tokens, type roles, components, screen map.
3. [docs/design/tokens.json](docs/design/tokens.json): exact values. Wins over DESIGN.md.

## Commands

```bash
npm run db:setup  # create tables (needs .env.local, see README)
npm run dev     # http://localhost:3000 — /styleguide shows tokens and components
npm run lint
npm run build   # must pass before you call anything done
```

## Rules

- **Tokens only for colour.** Use `bg-paper`, `text-ink`, `text-ink-2`, `bg-accent`, `border-border` and so on; no hex values or arbitrary colours in components (event dress-colour swatches are content, not style). Prefer the `type-*` utilities; a one-off text size is fine when a design board specifies it.
- **Surfaces.** Guest pages live in `app/(guest)`, organiser pages in `app/(organiser)`. Components must not assume a surface. The organiser dashboard is a separate, professional tool: calm, dense, scannable. Don't carry guest flourishes (photos, script greetings) into it.
- **Primitives first.** Reuse `components/ui/*`. If a screen needs something new and reusable, add it there and show it on `/styleguide`.
- **Server Components by default.** `"use client"` only for leaf components that change state before submit.
- **Forms work without JavaScript.** Native `<form>`, `<label>`, `<fieldset>`/`<legend>`, radio inputs.
- **Accessibility is part of done:** visible focus, ≥ 44px targets, errors linked with `aria-describedby`, one `<h1>` per page, meaning never by colour alone.
- **Mobile first:** check 360px and 390px; dashboard also at 1280px.
- **No invented content.** Wedding facts come from `lib/content/wedding.ts`; unknowns are `[PLACEHOLDER]`.
- **No new dependencies** without saying why the platform can't do it.
- Don't edit `docs/design/source/` (reference only) or `app/fonts/` (self-hosted, OFL).

## When you finish a change

Run lint and build, look at the affected screens at phone width, and list what you changed and anything you couldn't do.
