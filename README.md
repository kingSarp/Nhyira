# Nhyira

Personal wedding invitations and RSVP for Kay & Ama. Each household opens its own link from WhatsApp; family organisers see the headcount on a dashboard.

Data lives in Supabase Postgres; organisers sign in with email and password (Supabase Auth).

## Set up

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` (Supabase → **Connect** → **Transaction pooler**, with your database password).
3. `npm run db:setup`: creates the tables. Safe to run again; it never deletes anything.
4. In Supabase → **Authentication**:
   - **URL Configuration**: Site URL is the live address (`https://nhyira-cyan.vercel.app`). Add `http://localhost:3000/**` and `https://nhyira-cyan.vercel.app/**` under Redirect URLs.
   - **Emails → Reset Password**: replace the link in the template with
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`
     so the link works even when the email opens in a different browser.
   - **Users → Add user → Create new user** for each organiser (auto-confirm on; any password, it gets replaced).
   - **Sign In / Providers**: turn off **Allow new users to sign up**, so only people you add can have an account.
5. `npm run dev` → http://localhost:3000/login → **Forgot password?** to set your password.

| URL | What |
| --- | --- |
| `/` | Home, save the date |
| `/i/<token>` | A household's invitation (copy one from the dashboard) |
| `/login`, `/admin` | Organiser sign-in and dashboard |
| `/styleguide` | Design tokens and components (not on the live site) |

Organisers are the users you add in Supabase → Authentication → Users. The dashboard stays locked while Supabase sign-ups are on. Password-reset emails use Supabase's built-in sender, which only delivers to members of your Supabase organisation, a few per hour; add other organisers to the organisation, or connect your own SMTP (Authentication → Emails → SMTP) before the wedding.

Read [AGENTS.md](AGENTS.md), [ARCHITECTURE.md](ARCHITECTURE.md) and [DESIGN.md](DESIGN.md) before changing code.
