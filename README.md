# Nhyira

Personal wedding invitations and RSVP for Yaw & Lady. Each household opens its own link from WhatsApp; family organisers see the headcount on a dashboard.

**Phase:** frontend only, built against mock data in `lib/data`.

```bash
npm install
npm run dev        # http://localhost:3000
```

| URL | What |
| --- | --- |
| `/styleguide` | Design tokens and components on both surfaces |
| `/` | Home, save the date |
| `/i/kwame-ama-boateng-0001` | Invite for a household that has replied |
| `/i/asante-family-000000002` | Invite for a household that hasn't replied |
| `/i/anything-else-000000000` | Invitation not found |
| `/login`, `/admin` | Organiser screens |

Read [AGENTS.md](AGENTS.md), [ARCHITECTURE.md](ARCHITECTURE.md) and [DESIGN.md](DESIGN.md) before changing code.
