import { Photo, PhotoCaption } from "@/components/ui";
import { STORY_SLOTS } from "@/lib/content/wedding";
import { getWedding } from "@/lib/data";
import { fullColumn, halfColumn } from "./sizes";

/** Four story photos: one wide, two side by side, one wide. Then the rose break. Hidden until all four exist. */
export async function Story() {
  const { story, images } = await getWedding();
  if (story.length < STORY_SLOTS) return null;
  const [first, second, third, fourth] = story;
  const card = (p: (typeof story)[number], className: string, sizes: string, small = false) => (
    <figure className="m-0">
      <Photo src={p.src} alt={p.alt} focus={p.focus} sizes={sizes} scrimHeight="40%" className={className}>
        <PhotoCaption year={p.year} caption={p.caption} small={small} />
      </Photo>
    </figure>
  );

  return (
    <>
      <section aria-label="Our story" className="flex flex-col gap-1.5">
        {card(first, "h-[500px]", fullColumn)}
        <div className="grid grid-cols-2 gap-1.5">
          {card(second, "h-[300px]", halfColumn, true)}
          {card(third, "h-[300px]", halfColumn, true)}
        </div>
        {card(fourth, "h-[520px]", fullColumn)}
      </section>
      <Photo
        src={images.roseBreak.src}
        alt=""
        focus={images.roseBreak.focus}
        sizes={fullColumn}
        className="mt-1.5 h-[300px]"
      />
    </>
  );
}
