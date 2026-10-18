import type { Metadata } from "next";
import { DetailsForm } from "@/components/organiser/DetailsForm";
import { StorySlotForm } from "@/components/organiser/StorySlotForm";
import { Notice } from "@/components/ui";
import { STORY_SLOTS } from "@/lib/content/wedding";
import { getWedding } from "@/lib/data";
import { detailsToValues } from "@/lib/wedding-form";
import { removeStory, saveStory } from "./actions";

export const metadata: Metadata = { title: "Wedding details" };

export default async function DetailsPage({ searchParams }: PageProps<"/admin/details">) {
  const sp = await searchParams;
  const { details, story } = await getWedding();
  const removed = typeof sp.removed === "string" ? sp.removed : null;

  return (
    <main className="flex flex-col gap-10">
      <div className="flex max-w-[760px] flex-col gap-1">
        <h1 className="type-org-title m-0">Wedding details</h1>
        <p className="m-0 text-ink-2">What guests see on their invitations. Changes show as soon as you save.</p>
      </div>

      <DetailsForm initial={detailsToValues(details)} />

      <section aria-labelledby="story-title" className="flex flex-col gap-5 border-t-2 border-ink pt-5">
        <div className="flex max-w-[760px] flex-col gap-1">
          <h2 id="story-title" className="m-0 text-[22px] font-normal">
            Our story photos
          </h2>
          <p className="m-0 text-[15px] text-ink-2">
            Four photos with a year and caption. The &ldquo;Our story&rdquo; section appears on invitations once all four are added
            {story.length < STORY_SLOTS ? ` (${story.length} of ${STORY_SLOTS} so far)` : ""}. Photos up to 4 MB.
          </p>
        </div>
        {removed && (
          <Notice tone="success" icon="check">
            Photo {removed} removed.
          </Notice>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          {details.story.map((photo, i) => (
            <StorySlotForm
              key={`${i}-${photo?.src ?? "empty"}`}
              slot={i}
              photo={photo}
              action={saveStory.bind(null, i)}
              remove={removeStory.bind(null, i)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
