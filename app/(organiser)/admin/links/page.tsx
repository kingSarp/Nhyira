import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CopyLink } from "@/components/organiser/CopyLink";
import { Button, Icon, Notice } from "@/components/ui";
import { EVENTS, type EventId } from "@/lib/content/wedding";
import { countOpenSignups, getSignupLinks, getWedding, listJoinRequests, type SignupLink, type SignupLinkKind } from "@/lib/data";
import { previewImages } from "@/lib/og";
import { siteUrl } from "@/lib/site";
import { replaceLink, saveOpenLink, saveRequestLink, toggleLink } from "../actions";

export const metadata: Metadata = { title: "Sign-up links" };

const path = { request: "request", open: "join" } as const;

function shareText(coupleNames: string, kind: SignupLinkKind, url: string) {
  return kind === "request"
    ? `${coupleNames} are getting married! If you'd like to join us, request a place here: ${url}`
    : `${coupleNames} are getting married! Sign up here to celebrate with us (one person per sign-up): ${url}`;
}

/** "Engagement, Church, Reception" in wedding order. */
const eventNames = (ids: EventId[]) =>
  EVENTS.filter((e) => ids.includes(e.id))
    .map((e) => e.shortName)
    .join(", ") || "No events";

/** What the link is doing right now, in the guest's terms, with the switch beside it. */
function StatusStrip({ link, onText, offText }: { link: SignupLink; onText: string; offText: string }) {
  const on = link.enabled;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-panel px-4 py-3">
      <p className="m-0 flex items-start gap-2.5 text-[16px]">
        <span aria-hidden className={`mt-[7px] inline-block size-2.5 flex-none rounded-full ${on ? "bg-success" : "bg-border"}`} />
        <span>
          <strong className={`font-semibold ${on ? "text-success" : "text-ink"}`}>{on ? "On" : "Off"}</strong>
          <span className="text-ink-2"> · {on ? onText : offText}</span>
        </span>
      </p>
      <form action={toggleLink.bind(null, link.kind, !on)}>
        <Button type="submit" variant={on ? "secondary" : "primary"} className="!h-11 px-5">
          {on ? "Turn off" : "Turn on"}
        </Button>
      </form>
    </div>
  );
}

/** Tap-to-toggle event chips. Native checkboxes, so they work without JavaScript. */
function EventChoices({ selected, legend, hint, error }: { selected: EventId[]; legend: string; hint?: string; error?: string }) {
  return (
    <fieldset className="m-0 border-0 p-0" aria-describedby={error ? "events-error" : undefined}>
      <legend className="type-label mb-1 p-0 text-ink-2">{legend}</legend>
      {hint && <p className="m-0 mb-2 text-[14px] text-ink-2">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {EVENTS.map((e) => (
          <label
            key={e.id}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-field px-4 text-[15px] has-[:checked]:border-2 has-[:checked]:border-accent has-[:checked]:px-[15px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-accent"
          >
            <input type="checkbox" name={`event_${e.id}`} defaultChecked={selected.includes(e.id)} className="size-4 accent-accent" />
            {e.name.replace(/^The /, "")}
          </label>
        ))}
      </div>
      {error && (
        <p id="events-error" className="m-0 mt-2 flex items-center gap-1.5 text-[14px] text-error">
          <Icon name="alert" size={16} />
          {error}
        </p>
      )}
    </fieldset>
  );
}

/**
 * Collapsed settings with a one-line summary. Opens by itself after a save or
 * an error, or while confirming "Make a new link", so the result is in view.
 */
function Settings({
  link,
  summary,
  open,
  confirming,
  children,
}: {
  link: SignupLink;
  summary: string;
  open: boolean;
  confirming: boolean;
  children: ReactNode;
}) {
  return (
    <details id={`${link.kind}-settings`} open={open || confirming} className="group border-t border-line">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-2 text-[15px] [&::-webkit-details-marker]:hidden">
        <span>
          <span className="text-ink">Settings</span>
          <span className="text-ink-2"> · {summary}</span>
        </span>
        <span aria-hidden className="transition-transform group-open:rotate-180">
          <Icon name="chevron" />
        </span>
      </summary>
      <div className="flex flex-col gap-6 pt-2 pb-4">
        {children}

        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <p className="type-label m-0 text-ink-2">Replace the link</p>
          {confirming ? (
            <div role="alert" className="flex flex-col gap-3 border border-error bg-field p-4">
              <strong className="font-semibold text-error">Make a new link?</strong>
              <p className="m-0 text-[15px]">
                The current link stops working for good, even if you turn it on again. Anyone who has it will see
                &ldquo;no longer taking sign-ups&rdquo;. People who already signed up keep their invitations.
              </p>
              <div className="flex flex-wrap gap-3">
                <form action={replaceLink.bind(null, link.kind)}>
                  <Button type="submit">Yes, make a new link</Button>
                </form>
                <Button href={`/admin/links#${link.kind}-title`} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="m-0 text-[15px] text-ink-2">
              If the link has gone somewhere it shouldn&apos;t,{" "}
              <Link href={`/admin/links?confirm=${link.kind}#${link.kind}-settings`}>make a new link</Link>. The old one stops working.
            </p>
          )}
          {link.retiredCodes.length > 0 && (
            <p className="m-0 text-[14px] text-ink-2">
              {link.retiredCodes.length} old {link.retiredCodes.length === 1 ? "link" : "links"} switched off for good.
            </p>
          )}
        </div>
      </div>
    </details>
  );
}

/** One shared link: status and switch, the numbers, the link and how to share it, then settings. */
async function LinkSection({
  link,
  title,
  lead,
  stat,
  status,
  preview,
  replaced,
  children,
}: {
  link: SignupLink;
  title: string;
  lead: string;
  stat: ReactNode;
  status: { on: string; off: string };
  preview?: ReactNode;
  replaced: boolean;
  children: ReactNode;
}) {
  const url = `${siteUrl()}/${path[link.kind]}/${link.code}`;
  const { coupleNames } = await getWedding();
  return (
    <section aria-labelledby={`${link.kind}-title`} className="flex flex-col gap-5 border-t-2 border-ink pt-5">
      <div className="flex flex-col gap-1">
        <h2 id={`${link.kind}-title`} className="m-0 text-[24px] font-normal">
          {title}
        </h2>
        <p className="m-0 max-w-[620px] text-[15px] text-ink-2">{lead}</p>
      </div>

      {replaced && (
        <Notice tone="success" icon="check" title="New link made">
          The old link no longer works. The new one is off until you turn it on.
        </Notice>
      )}

      <div className={preview ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]" : "flex flex-col"}>
        <div className="flex min-w-0 flex-col gap-5">
          <StatusStrip link={link} onText={status.on} offText={status.off} />
          {stat}
          <CopyLink url={url} label="Link" />
          {link.enabled && (
            <div>
              <Button variant="whatsapp" href={`https://wa.me/?text=${encodeURIComponent(shareText(coupleNames, link.kind, url))}`} external>
                Share on WhatsApp
              </Button>
            </div>
          )}
        </div>
        {preview}
      </div>

      {children}
    </section>
  );
}

function SaveButton() {
  return (
    <div>
      <Button type="submit" variant="secondary" className="!h-11 px-6">
        Save settings
      </Button>
    </div>
  );
}

export default async function LinksPage({ searchParams }: PageProps<"/admin/links">) {
  const sp = await searchParams;
  const [links, pending, signups, w] = await Promise.all([getSignupLinks(), listJoinRequests("pending"), countOpenSignups(), getWedding()]);
  const { open, request } = links;
  const card = previewImages(w).og[0];
  const left = open.limit !== null ? Math.max(0, open.limit - signups) : null;

  return (
    <main className="flex flex-col gap-12">
      <div className="flex flex-col gap-1">
        <h1 className="type-org-title m-0">Sign-up links</h1>
        <p className="m-0 max-w-[680px] text-ink-2">
          Share one link and people sign themselves up. Personal invitations from the guest list always work, whatever
          you do here.
        </p>
      </div>

      <LinkSection
        link={open}
        title="Open sign-up"
        lead="One seat per person, confirmed straight away. Each phone number can sign up once, and everyone gets their own invitation link."
        status={{ on: "anyone with the link can sign up.", off: "the link says it's not taking sign-ups." }}
        replaced={sp.replaced === "open"}
        stat={
          <div className="flex flex-col gap-2">
            <p className="m-0 flex items-baseline gap-2">
              <span className="text-[40px] leading-none tabular-nums">{signups}</span>
              <span className="text-ink-2">
                signed up{open.limit !== null ? ` of ${open.limit}` : ""}
                {left !== null && ` · ${left === 0 ? "full" : `${left} ${left === 1 ? "place" : "places"} left`}`}
              </span>
            </p>
            {open.limit !== null && (
              <div aria-hidden className="h-1.5 w-full max-w-[420px] bg-line">
                <div className="h-full bg-ink" style={{ width: `${Math.min(100, (signups / open.limit) * 100)}%` }} />
              </div>
            )}
          </div>
        }
        preview={
          <figure className="m-0 flex flex-col gap-2">
            <figcaption className="type-label text-ink-2">WhatsApp preview</figcaption>
            {/* The live card at its versioned URL; next/image would need query strings allowed for local images. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.url} alt="The card people see before they tap the link" width={1200} height={630} className="h-auto w-full border border-line" />
            <p className="m-0 text-[14px] text-ink-2">
              Names, date and photo come from <Link href="/admin/details">Wedding details</Link>.
            </p>
          </figure>
        }
      >
        <Settings
          link={open}
          summary={`${eventNames(open.events)} · ${open.limit !== null ? `limit ${open.limit}` : "no limit"}`}
          open={sp.saved === "open" || sp.error === "events"}
          confirming={sp.confirm === "open"}
        >
          <form action={saveOpenLink} className="flex flex-col gap-5">
            {sp.saved === "open" && <Notice tone="success" icon="check">Settings saved.</Notice>}
            <EventChoices selected={open.events} legend="Each sign-up gets one seat at" error={sp.error === "events" ? "Choose at least one event." : undefined} />
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
            <SaveButton />
          </form>
        </Settings>
      </LinkSection>

      <LinkSection
        link={request}
        title="Request a place"
        lead="People ask to come and say how many. Nothing is confirmed until you approve them in Requests, where you can also set their seats."
        status={{ on: "anyone with the link can send a request.", off: "the link says it's not taking requests." }}
        replaced={sp.replaced === "request"}
        stat={
          <p className="m-0 text-[16px]">
            {pending.length === 0 ? (
              <span className="text-ink-2">No requests waiting.</span>
            ) : (
              <Link href="/admin/requests">
                {pending.length} {pending.length === 1 ? "request" : "requests"} waiting for you
              </Link>
            )}
          </p>
        }
      >
        <Settings
          link={request}
          summary={`approved guests go to ${eventNames(request.events)}`}
          open={sp.saved === "request" || sp.error === "request-events"}
          confirming={sp.confirm === "request"}
        >
          <form action={saveRequestLink} className="flex flex-col gap-5">
            {sp.saved === "request" && <Notice tone="success" icon="check">Settings saved.</Notice>}
            <EventChoices
              selected={request.events}
              legend="Approved guests are invited to"
              hint="Their seats match the number they asked for. You can adjust each request before approving."
              error={sp.error === "request-events" ? "Choose at least one event." : undefined}
            />
            <SaveButton />
          </form>
        </Settings>
      </LinkSection>
    </main>
  );
}
