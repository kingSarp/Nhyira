# Nhyira

Personal wedding invitations and RSVP for Yaw & Lady. Each household opens its own link from WhatsApp; family organisers see the headcount on a dashboard.

Data lives in Supabase Postgres; organisers sign in with an emailed link (Supabase Auth).

## Set up

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` (Supabase → **Connect** → **Transaction pooler**, with your database password).
3. `npm run db:setup`: creates the tables. Safe to run again; it never deletes anything.
4. In Supabase → **Authentication**:
   - **URL Configuration**: Site URL `http://localhost:3000` while testing (your live address once deployed). Add `http://localhost:3000/**` and the live address + `/**` under Redirect URLs.
   - **Emails → Magic Link**: replace the link in the template with
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
     so the link works even when the email opens in a different browser.
5. `npm run dev` → http://localhost:3000/login

| URL | What |
| --- | --- |
| `/` | Home, save the date |
| `/i/<token>` | A household's invitation (copy one from the dashboard) |
| `/login`, `/admin` | Organiser sign-in and dashboard |
| `/styleguide` | Design tokens and components (not on the live site) |

Only emails in `ADMIN_EMAILS` can sign in. Supabase's built-in email sender only delivers to members of your Supabase organisation, a few per hour; add other organisers to the organisation, or connect your own SMTP (Authentication → Emails → SMTP) before the wedding.

Read [AGENTS.md](AGENTS.md), [ARCHITECTURE.md](ARCHITECTURE.md) and [DESIGN.md](DESIGN.md) before changing code.
