import { Photo, PhotoCaption } from "@/components/ui";
import { cn } from "@/lib/cn";
import { STORY_SLOTS } from "@/lib/content/wedding";
import { getWedding } from "@/lib/data";
import { fullColumn, halfColumn } from "./sizes";

/** Four story photos: one wide, two side by side, one wide. Then the rose break. Hidden until all four exist. */
export async function Story() {
  const { story, images } = await getWedding();
  if (story.length < STORY_SLOTS) return null;
  const [first, second, third, fourth] = story;
  // Each photo slides in from a side as it scrolls into view.
  const card = (p: (typeof story)[number], className: string, sizes: string, from: "left" | "right", small = false) => (
    <figure className={cn("m-0", from === "left" ? "motion-reveal-left" : "motion-reveal-right")}>
      <Photo src={p.src} alt={p.alt} focus={p.focus} sizes={sizes} scrimHeight="40%" className={className}>
        <PhotoCaption year={p.year} caption={p.caption} small={small} />
      </Photo>
    </figure>
  );

  return (
    <>
      <section aria-label="Our story" className="flex flex-col gap-1.5">
        {card(first, "h-[500px]", fullColumn, "left")}
        <div className="grid grid-cols-2 gap-1.5">
          {card(second, "h-[300px]", halfColumn, "left", true)}
          {card(third, "h-[300px]", halfColumn, "right", true)}
        </div>
        {card(fourth, "h-[520px]", fullColumn, "right")}
      </section>
      <Photo
        src={images.roseBreak.src}
        alt=""
        focus={images.roseBreak.focus}
        sizes={fullColumn}
        className="motion-reveal-left mt-1.5 h-[300px]"
      />
    </>
  );
}
