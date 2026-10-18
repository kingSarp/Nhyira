import { Photo } from "@/components/ui";
import { getWedding } from "@/lib/data";
import { ContactLine } from "./ContactLine";
import { fullColumn } from "./sizes";

export async function ClosingPhoto() {
  const w = await getWedding();
  const img = w.images.roseBreak;
  const [a, b] = w.monogram;
  return (
    <footer>
      <Photo src={img.src} alt={img.alt} focus={img.focus} sizes={fullColumn} scrimHeight="55%" className="h-[560px]">
        <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2.5 px-6 text-center text-white">
          <p className="m-0 font-display text-[36px] italic leading-tight">See you there</p>
          <p className="m-0 font-display text-[22px] tracking-[0.2em]">
            {a} <span className="font-script tracking-normal">&amp;</span> {b}
          </p>
          <ContactLine className="[&_a]:text-white" />
        </div>
      </Photo>
    </footer>
  );
}
