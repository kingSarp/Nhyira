# Domain and SEO

How the site is reached and found online, what has been set up, and what is still to do. Last updated 4 Nov 2026.

## The domain

- **Brand:** Akwaaba Invites ("akwaaba" is Twi for "welcome"). It names no particular event, so it covers weddings, naming ceremonies, birthdays and other gatherings. Set once in `SITE_NAME` (`lib/site.ts`).
- **Main address:** `https://www.akwaabainvites.com`. The bare `akwaabainvites.com` redirects to it (308).
- **Old address:** `https://nhyira-cyan.vercel.app` still serves the site, so links and QR passes sent before the move keep working. Keep it until every event that used it is over.
- **Registrar:** bought through Vercel (Nov 2026, about $12 a year), so Vercel manages its DNS. Renews yearly; keep the billing address on the Vercel payment method complete or the renewal fails.

Names considered and turned down, so nobody searches again: `nhyira.com`, `.app` and `.events` (taken); `nhyirarsvp.com` (hard to spell when heard); `rsvpghana.com` (the brand shouldn't be tied to Ghana); English names such as `blessedinvites.com` and `welcomeinvites.com` (not liked).

## Settings that must match the domain

| Where | Setting | Value |
|---|---|---|
| Vercel → Settings → Environment Variables | `NEXT_PUBLIC_SITE_URL` (Production) | `https://www.akwaabainvites.com` |
| Supabase → Authentication → URL Configuration | Site URL | `https://www.akwaabainvites.com` |
| Same page | Redirect URLs | `http://localhost:3000/**`, `https://www.akwaabainvites.com/**`, `https://*.akwaabainvites.com/**`, `https://nhyira-cyan.vercel.app/**` |

`NEXT_PUBLIC_SITE_URL` is built into the site: after changing it, **redeploy** (Deployments → ⋯ → Redeploy, build cache off). It feeds every link the app writes (`siteUrl()` in `lib/site.ts`): WhatsApp invites, sign-up links, QR passes, the usher login link and share-preview images. The Supabase reset-password email builds its link from the Site URL.

To confirm a change: open the live home page source and check that `og:image` starts with the new address; then run "Forgot password?" end to end.

## Guest links

| Link | Path | Example |
|---|---|---|
| Personal invite and pass QR | `/invite/<token>` | `/invite/kwame-ama-boateng-3f9a1b2c4d5e` |
| Shared sign-up (WhatsApp) | `/rsvp/<code>` | `/rsvp/22797c5e35` |
| Request a place | `/request/<code>` | `/request/ask-7hd2kx0pmz` |

The random part of each link is what stops people guessing someone else's invite; keep it. Older `/i/…` and `/join/…` links redirect (`next.config.ts`), and the check-in scanner reads both old and new QR codes (`lib/checkin.ts`). Sign-up codes made before Nov 2026 start with `join-`; "Make a new link" issues the shorter form, but retires the old link for good.

## Search: what is in place

- `robots.txt` (`app/robots.ts`): allows the site and points to the sitemap; blocks `/admin/`, `/checkin`, `/auth/` and `/styleguide`.
- `sitemap.xml` (`app/sitemap.ts`): the home page only.
- Canonical address on the home page, so `www`, the bare domain and `vercel.app` count as one site.
- Home page title "‹Couple names› · Akwaaba Invites"; site name "Akwaaba Invites" in the metadata. Share cards keep just the couple's names.
- Every personal or staff page is `noindex`: invites, sign-up, request, login, dashboard, check-in.
- Site icon: cream envelope with a gold heart seal on burgundy (`app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`).

Audit on 4 Nov 2026: not yet indexed by Google (domain a few days old); page served in about 0.6 s, 46 KB. "Akwaaba" is a crowded name (a Ghana travel app, an event-ticketing startup), so aim to rank for the exact phrase "Akwaaba Invites".

## Search: to do

### 1. Google Search Console (owner, about 10 minutes)

1. Go to [search.google.com/search-console](https://search.google.com/search-console) → Add property → **Domain** → `akwaabainvites.com`.
2. Google shows a TXT record. In Vercel → Domains → `akwaabainvites.com` → DNS Records, add it: type `TXT`, name `@`, value as given.
3. Back in Search Console, click Verify (can take a few minutes).
4. Sitemaps → submit `https://www.akwaabainvites.com/sitemap.xml`.
5. URL Inspection → `https://www.akwaabainvites.com/` → Request indexing.

Check back after a week: Pages report (indexed or not) and Performance (what people searched).

### 2. Akwaaba Invites front page (waiting for approval)

**Plan:** `www.akwaabainvites.com` becomes the Akwaaba Invites home page: digital invitations and RSVP for Ghanaian weddings and other events, how it works, and how to get in touch. That is the page that can rank for "Akwaaba Invites".

Each couple's site moves to its own subdomain, e.g. `shakespeare-bevlyn.akwaabainvites.com`, and is kept out of search (`noindex`), so their names, date and venue don't appear on Google.

**Until approved,** the couple's page is the home page and can be indexed. Decide whether to `noindex` it in the meantime.

**What it involves:**
- Copy for the front page (product description, contact). Don't invent claims or prices.
- Vercel: add the couple's subdomain (or a wildcard `*.akwaabainvites.com`) to the project; Supabase redirect URLs already allow `*.akwaabainvites.com`.
- Code: either deploy one copy per wedding (no code change; a new Supabase project each, and the free plan allows 2 active projects), or make the app serve many weddings from one deployment (a `weddings` table, every query scoped to a wedding, the subdomain picks the wedding). See ARCHITECTURE.md before choosing.

## Adding a wedding on its own subdomain (one copy per wedding)

1. Vercel → new project from the same repository, with its own Supabase project and environment variables (see README).
2. Domains → add `<couple>.akwaabainvites.com`. Vercel sets the DNS because it manages the domain.
3. Set `NEXT_PUBLIC_SITE_URL` to `https://<couple>.akwaabainvites.com` and redeploy.
4. In that Supabase project, set the Site URL and Redirect URLs to the subdomain.
5. Edit the wedding details on `/admin/details`, then test sign-up, an invite, a pass scan and "Forgot password?".
