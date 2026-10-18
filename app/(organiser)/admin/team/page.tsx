import type { Metadata } from "next";
import Link from "next/link";
import { AddMemberForm, ResetPasswordButton } from "@/components/organiser/TeamForms";
import { Badge, Button, Notice } from "@/components/ui";
import { getStaff, getWedding, listStaff, type StaffMember } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import { hasAdminKey } from "@/lib/supabase/admin";
import { changeTeamRole, removeTeamMember } from "./actions";

export const metadata: Metadata = { title: "Team" };

const lastSeen = (iso: string | null) =>
  iso
    ? `Last signed in ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Accra" }).format(new Date(iso))}`
    : "Hasn't signed in yet";

function Member({ m, isMe, confirming, loginUrl, coupleNames }: { m: StaffMember; isMe: boolean; confirming: boolean; loginUrl: string; coupleNames: string }) {
  const other = m.role === "usher" ? "organiser" : "usher";
  return (
    <li id={`m-${m.id}`} className="flex flex-col gap-3 border-b border-line py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 break-all text-[17px]">
            {m.email}
            {isMe && <span className="text-ink-2"> (you)</span>}
          </p>
          <p className="m-0 text-[14px] text-ink-2">{lastSeen(m.lastSignInAt)}</p>
        </div>
        <Badge tone={m.role === "organiser" ? "attending" : "waiting"}>{m.role === "organiser" ? "Organiser" : "Usher"}</Badge>
      </div>

      {!isMe && (
        <div className="flex flex-wrap items-start gap-x-6 gap-y-1">
          <ResetPasswordButton id={m.id} loginUrl={loginUrl} coupleNames={coupleNames} />
          <form action={changeTeamRole.bind(null, m.id, other)}>
            <button type="submit" className="flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 text-[15px] text-accent underline underline-offset-[3px]">
              {other === "organiser" ? "Make organiser" : "Make usher"}
            </button>
          </form>
          <Link href={`/admin/team?remove=${m.id}#m-${m.id}`} className="flex min-h-11 items-center text-[15px] text-error">
            Remove
          </Link>
        </div>
      )}

      {confirming && (
        <div role="alert" className="flex flex-col gap-3 border border-error bg-field p-4">
          <strong className="font-semibold text-error">Remove {m.email}?</strong>
          <p className="m-0 text-[15px]">They&apos;re signed out straight away and can&apos;t sign in again. You can add them back later.</p>
          <div className="flex flex-wrap gap-3">
            <form action={removeTeamMember.bind(null, m.id)}>
              <Button type="submit">Yes, remove</Button>
            </form>
            <Button href="/admin/team" variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

export default async function TeamPage({ searchParams }: PageProps<"/admin/team">) {
  const sp = await searchParams;
  const loginUrl = `${siteUrl()}/login`;

  if (!hasAdminKey()) {
    return (
      <main className="flex max-w-[680px] flex-col gap-4">
        <h1 className="type-org-title m-0">Team</h1>
        <Notice tone="info" title="One-time setup needed">
          To add ushers and organisers from here, the site needs your Supabase secret key. In Supabase → Project Settings → API
          Keys → Secret keys, create a key, then add it to Vercel as <code>SUPABASE_SECRET_KEY</code> and redeploy.
        </Notice>
      </main>
    );
  }

  const [me, staff, { coupleNames }] = await Promise.all([getStaff(), listStaff(), getWedding()]);
  const organisers = staff.filter((s) => s.role === "organiser");
  const ushers = staff.filter((s) => s.role === "usher");
  const list = (people: StaffMember[]) => (
    <ul className="m-0 list-none border-t border-line p-0">
      {people.map((m) => (
        <Member key={m.id} m={m} isMe={m.id === me?.id} confirming={sp.remove === m.id} loginUrl={loginUrl} coupleNames={coupleNames} />
      ))}
    </ul>
  );

  return (
    <main className="flex flex-col gap-10">
      <div className="flex max-w-[680px] flex-col gap-1">
        <h1 className="type-org-title m-0">Team</h1>
        <p className="m-0 text-ink-2">
          Ushers can only check guests in. Organisers can do everything, including adding people here. Changes take effect at once.
        </p>
      </div>

      {typeof sp.removed === "string" && (
        <Notice tone="success" icon="check">
          {sp.removed} removed.
        </Notice>
      )}
      {sp.changed === "1" && (
        <Notice tone="success" icon="check">
          Role changed.
        </Notice>
      )}
      {sp.error === "self" && <Notice tone="error">You can&apos;t remove yourself or change your own role.</Notice>}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="ushers-title" className="flex flex-col gap-3">
            <h2 id="ushers-title" className="m-0 text-[22px] font-normal">
              Ushers <span className="text-ink-2">· {ushers.length}</span>
            </h2>
            {ushers.length ? list(ushers) : <p className="m-0 text-ink-2">No ushers yet. Add them on this page before the day.</p>}
          </section>
          <section aria-labelledby="organisers-title" className="flex flex-col gap-3">
            <h2 id="organisers-title" className="m-0 text-[22px] font-normal">
              Organisers <span className="text-ink-2">· {organisers.length}</span>
            </h2>
            {list(organisers)}
          </section>
        </div>

        <section aria-labelledby="add-title" className="flex flex-col gap-4 self-start border-t-2 border-ink pt-5">
          <h2 id="add-title" className="m-0 text-[22px] font-normal">
            Add someone
          </h2>
          <p className="m-0 text-[15px] text-ink-2">
            We make their account and a password for you to send them. They sign in at {loginUrl.replace(/^https?:\/\//, "")}.
          </p>
          <AddMemberForm loginUrl={loginUrl} coupleNames={coupleNames} />
        </section>
      </div>
    </main>
  );
}
