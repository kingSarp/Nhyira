import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  Badge,
  Button,
  ChoiceCard,
  CoupleNames,
  ErrorSummary,
  FilterChip,
  Notice,
  Photo,
  PhotoCaption,
  TextArea,
  TextField,
} from "@/components/ui";
import { wedding } from "@/lib/content/wedding";
import { dotDate } from "@/lib/format";

export const metadata: Metadata = { title: "Styleguide", robots: { index: false, follow: false } };

const swatches = [
  ["paper", "bg-paper"],
  ["panel", "bg-panel"],
  ["ink", "bg-ink"],
  ["ink-2", "bg-ink-2"],
  ["border", "bg-border"],
  ["line", "bg-line"],
  ["accent", "bg-accent"],
  ["eyebrow", "bg-eyebrow"],
  ["script", "bg-script"],
  ["success", "bg-success"],
  ["error", "bg-error"],
  ["quiet-tint", "bg-quiet-tint"],
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-6">
      <h3 className="type-label m-0 text-ink-2">{title}</h3>
      {children}
    </section>
  );
}

function Surface({ name }: { name: "guest" | "organiser" }) {
  const guest = name === "guest";
  return (
    <div data-surface={name} className="flex min-w-0 flex-1 flex-col gap-8 px-5 py-10 sm:px-8">
      <header className="flex flex-col gap-1">
        <p className="type-eyebrow m-0">Surface</p>
        <h2 className="m-0 type-title">{guest ? "Guest" : "Organiser"}</h2>
        <p className="m-0 text-ink-2">
          {guest ? "Invite, RSVP, thanks, closed, not found, home." : "Sign in and dashboard."}
        </p>
      </header>

      <Section title="Colour">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {swatches.map(([label, cls]) => (
            <div key={label} className="flex flex-col gap-1">
              <div className={`h-12 border border-line ${cls}`} />
              <span className="text-[13px] text-ink-2">{label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        {guest ? (
          <div className="flex flex-col gap-4">
            <CoupleNames size="hero" stacked as="p" />
            <p className="type-dateline m-0">{dotDate(wedding.date)}</p>
            <p className="type-greeting m-0">Kwame &amp; Ama</p>
            <p className="type-title m-0">Will you join us?</p>
            <p className="type-event m-0">The Reception</p>
            <p className="type-legend m-0">The Wedding</p>
            <p className="type-eyebrow m-0">The celebrations</p>
            <p className="m-0">Body 17/1.6 — come witness the beginning of our forever.</p>
            <p className="type-meta m-0">Sat 13 Feb · 2:00 PM · Movenpick Ambassador Hotel</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="m-0 font-script text-[44px] leading-tight">Yaw &amp; Lady</p>
            <p className="type-org-title m-0">Guest list sign in</p>
            <p className="m-0 text-[18px]">12 of 40 households have replied</p>
            <p className="type-stat m-0">
              26 <small className="text-[16px] text-ink-2">/ 96</small>
            </p>
            <p className="type-label m-0">Search households</p>
            <p className="m-0 text-ink-2">Body in ink-2. Never bold, never wide-tracked.</p>
          </div>
        )}
      </Section>

      <Section title="Buttons">
        <div className="flex flex-col gap-3">
          <Button fullWidth={guest}>{guest ? "Send my reply" : "Email me a sign-in link"}</Button>
          <Button variant="secondary" fullWidth={guest}>
            {guest ? "Change my reply" : "Send it again"}
          </Button>
          <Button disabled fullWidth={guest}>
            Closed
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button variant="whatsapp">Send on WhatsApp</Button>
            <Button variant="whatsapp" disabled>
              Add a phone number to send
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Fields">
        <TextField id={`${name}-name`} label="Guest 1" defaultValue="Kwame Boateng" />
        <TextField
          id={`${name}-name-2`}
          label="Guest 2"
          placeholder="Full name"
          error="Enter a name, or remove this seat."
          action={<button type="button" className="min-h-8 bg-transparent p-0 text-[16px] text-accent underline">Remove</button>}
        />
        <TextArea id={`${name}-note`} label="A note for the couple" placeholder="Optional" />
      </Section>

      <Section title="Choice cards">
        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="type-legend mb-1 p-0">
            The Wedding <Badge tone="seats" className="ml-2 align-middle">Admits 2</Badge>
          </legend>
          <ChoiceCard name={`${name}-e2`} defaultChecked>
            Joyfully attending
          </ChoiceCard>
          <ChoiceCard name={`${name}-e2`}>Can&apos;t make it</ChoiceCard>
        </fieldset>
        <fieldset id={`${name}-e1`} className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="type-legend mb-1 p-0">The Engagement</legend>
          <ChoiceCard name={`${name}-e1`} invalid>
            Joyfully attending
          </ChoiceCard>
          <ChoiceCard name={`${name}-e1`} invalid>
            Can&apos;t make it
          </ChoiceCard>
        </fieldset>
      </Section>

      <Section title="Badges and chips">
        <div className="flex flex-wrap gap-2">
          <Badge tone="seats">Admits 2</Badge>
          <Badge tone="attending">Attending</Badge>
          <Badge tone="declined">Declined</Badge>
          <Badge tone="waiting">No reply</Badge>
        </div>
        <nav aria-label={`Example filters, ${name}`} className="flex flex-wrap gap-2">
          <FilterChip href="/styleguide" active>
            All · 40
          </FilterChip>
          <FilterChip href="/styleguide">No reply · 28</FilterChip>
          <FilterChip href="/styleguide">Attending · 10</FilterChip>
        </nav>
      </Section>

      <Section title="Notices">
        <Notice tone="info">Replies have closed. To change yours, call Auntie Efua.</Notice>
        <Notice tone="success" title="Link sent to efua.owusu@example.com">
          Tap it on this phone within 1 hour.
        </Notice>
        <Notice tone="error" title="That link has expired.">
          Links work for 1 hour and only once.
        </Notice>
        <ErrorSummary
          title="Two things to finish"
          errors={[
            { href: `#${name}-e1`, text: "The Engagement: choose an answer" },
            { href: `#${name}-name-2`, text: "The Wedding: name guest 2, or remove the seat" },
          ]}
        />
      </Section>

      {guest && (
        <Section title="Photo with scrim and caption">
          <figure className="m-0">
            <Photo
              src={wedding.story[0].src}
              alt={wedding.story[0].alt}
              focus={wedding.story[0].focus}
              sizes="(min-width: 1024px) 50vw, 100vw"
              scrimHeight="45%"
              className="h-[360px]"
            >
              <PhotoCaption year={wedding.story[0].year} caption={wedding.story[0].caption} />
            </Photo>
          </figure>
        </Section>
      )}
    </div>
  );
}

export default function StyleguidePage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <main className="flex min-h-dvh flex-col lg:flex-row">
      <h1 className="sr-only">Nhyira styleguide</h1>
      <Surface name="guest" />
      <Surface name="organiser" />
    </main>
  );
}
