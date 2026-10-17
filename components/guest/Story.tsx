import { Photo, PhotoCaption } from "@/components/ui";
import { wedding } from "@/lib/content/wedding";
import { fullColumn, halfColumn } from "./sizes";

/** Four story photos: one wide, two side by side, one wide. Then the rose break. */
export function Story() {
  const [first, second, third, fourth] = wedding.story;
  const card = (p: (typeof wedding.story)[number], className: string, sizes: string, small = false) => (
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
        src={wedding.images.roseBreak.src}
        alt=""
        focus={wedding.images.roseBreak.focus}
        sizes={fullColumn}
        className="mt-1.5 h-[300px]"
      />
    </>
  );
}
