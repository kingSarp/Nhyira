import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CopyLink } from "@/components/organiser/CopyLink";
import { Badge, Button, Notice } from "@/components/ui";
import { wedding } from "@/lib/content/wedding";
import { countOpenSignups, getSignupLinks, listJoinRequests, type SignupLink, type SignupLinkKind } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import { replaceLink, saveOpenLink, saveRequestLink, toggleLink } from "../actions";

export const metadata: Metadata = { title: "Sign-up links" };

const path = { request: "request", open: "join" } as const;

function shareText(kind: SignupLinkKind, url: string) {
  return kind === "request"
    ? `${wedding.coupleNames} are getting married! If you'd like to join us, request a place here: ${url}`
    : `${wedding.coupleNames} are getting married! Sign up here to celebrate with us (one person per sign-up): ${url}`;
}

function LinkCard({
  link,
  title,
  description,
  stat,
  confirming,
  replaced,
  children,
}: {
  link: SignupLink;
  title: string;
  description: string;
  stat: string;
  confirming: boolean;
  replaced: boolean;
  children?: ReactNode;
}) {
  const url = `${siteUrl()}/${path[link.kind]}/${link.code}`;
  return (
    <section aria-labelledby={`${link.kind}-title`} className="flex flex-col gap-5 border-t-2 border-ink pt-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex max-w-[560px] flex-col gap-1">
          <h2 id={`${link.kind}-title`} className="m-0 text-[22px] font-normal">
            {title}
          </h2>
          <p className="m-0 text-[15px] text-ink-2">{description}</p>
        </div>
        <Badge tone={link.enabled ? "attending" : "waiting"}>{link.enabled ? "On" : "Off"}</Badge>
      </div>

      {replaced && (
        <Notice tone="success" icon="check" title="New link made">
          The old link no longer works. The new one is off until you turn it on.
        </Notice>
      )}

      <CopyLink url={url} label="Shareable link" />
      <p className="m-0 text-[15px] text-ink-2">{stat}</p>

      <div className="flex flex-wrap items-center gap-3">
        <form action={toggleLink.bind(null, link.kind, !link.enabled)}>
          <Button type="submit" variant={link.enabled ? "secondary" : "primary"}>
            {link.enabled ? "Turn off" : "Turn on"}
          </Button>
        </form>
        {link.enabled && (
          <Button variant="whatsapp" href={`https://wa.me/?text=${encodeURIComponent(shareText(link.kind, url))}`} external>
            Share on WhatsApp
          </Button>
        )}
        <Link href={`/admin/links?confirm=${link.kind}#${link.kind}-title`} className="flex min-h-11 items-center text-[15px]">
          Make a new link
        </Link>
      </div>

      {confirming && (
        <div role="alert" className="flex flex-col gap-3 border border-error bg-field p-4">
          <strong className="font-semibold text-error">Make a new link?</strong>
          <p className="m-0 text-[15px]">
            The current link will stop working for good, even if you turn sign-ups on again. Anyone who already has it
            will see &ldquo;no longer taking sign-ups&rdquo;. People who already signed up keep their invitations.
          </p>
          <div className="flex flex-wrap gap-3">
            <form action={replaceLink.bind(null, link.kind)}>
              <Button type="submit">Yes, make a new link</Button>
            </form>
            <Button href="/admin/links" variant="secondary">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {link.retiredCodes.length > 0 && (
        <p className="m-0 text-[14px] text-ink-2">
          {link.retiredCodes.length} old {link.retiredCodes.length === 1 ? "link" : "links"} switched off for good.
        </p>
      )}

      {children}
    </section>
  );
}

export default async function LinksPage({ searchParams }: PageProps<"/admin/links">) {
  const sp = await searchParams;
  const [links, pending, signups] = await Promise.all([getSignupLinks(), listJoinRequests("pending"), countOpenSignups()]);
  const open = links.open;

  return (
    <main className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="type-org-title m-0">Sign-up links</h1>
        <p className="m-0 max-w-[680px] text-ink-2">
          Personal invitations from the guest list always work. These two shared links are extra ways in, and you can
          switch each one on or off at any time.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <LinkCard
          link={links.request}
          title="Request a place"
          description="Anyone with the link can ask to come and say how many people. You approve or decline each request and set their seats."
          stat={`${pending.length} ${pending.length === 1 ? "request" : "requests"} waiting for you.`}
          confirming={sp.confirm === "request"}
          replaced={sp.replaced === "request"}
        >
          <form action={saveRequestLink} className="flex flex-col gap-4 bg-panel p-4">
            {sp.saved === "request" && <Notice tone="success" icon="check">Settings saved.</Notice>}
            <fieldset className="m-0 border-0 p-0">
              <legend className="type-label mb-1 p-0">Events approved guests are invited to</legend>
              <p className="m-0 mb-2 text-[14px] text-ink-2">Their seats match the number they asked for. You can still adjust each request.</p>
              <div className="flex flex-col gap-1">
                {wedding.events.map((e) => (
                  <label key={e.id} className="flex min-h-11 items-center gap-3 text-[16px]">
                    <input type="checkbox" name={`event_${e.id}`} defaultChecked={links.request.events.includes(e.id)} className="size-5 accent-accent" />
                    {e.name}
                  </label>
                ))}
              </div>
              {sp.error === "request-events" && <p className="m-0 mt-1 text-[14px] text-error">Choose at least one event.</p>}
            </fieldset>
            <div>
              <Button type="submit" variant="secondary">
                Save settings
              </Button>
            </div>
          </form>
        </LinkCard>

        <LinkCard
          link={open}
          title="Open sign-up, one seat"
          description="Anyone with the link can sign themselves up for one seat and is confirmed straight away. Each phone number can sign up once."
          stat={`${signups} signed up${open.limit !== null ? ` of a limit of ${open.limit}` : ""}.`}
          confirming={sp.confirm === "open"}
          replaced={sp.replaced === "open"}
        >
          <form action={saveOpenLink} className="flex flex-col gap-4 bg-panel p-4">
            {sp.saved === "open" && <Notice tone="success" icon="check">Settings saved.</Notice>}
            <fieldset className="m-0 border-0 p-0">
              <legend className="type-label mb-2 p-0">Events a sign-up can attend</legend>
              <div className="flex flex-col gap-1">
                {wedding.events.map((e) => (
                  <label key={e.id} className="flex min-h-11 items-center gap-3 text-[16px]">
                    <input type="checkbox" name={`event_${e.id}`} defaultChecked={open.events.includes(e.id)} className="size-5 accent-accent" />
                    {e.name}
                  </label>
                ))}
              </div>
              {sp.error === "events" && <p className="m-0 mt-1 text-[14px] text-error">Choose at least one event.</p>}
            </fieldset>
            <label className="flex flex-col gap-1.5">
              <span className="type-label text-ink-2">Stop after this many sign-ups (optional)</span>
              <input
                type="number"
                name="limit"
                min={1}
                inputMode="numeric"
                placeholder="No limit"
                defaultValue={open.limit ?? ""}
                className="h-11 w-40 rounded-input border border-border bg-field px-3 text-[17px] text-ink focus:border-2 focus:border-accent focus:px-[11px] focus:outline-none"
              />
            </label>
            <div>
              <Button type="submit" variant="secondary">
                Save settings
              </Button>
            </div>
          </form>
        </LinkCard>
      </div>
    </main>
  );
}
