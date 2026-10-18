"use client";

import Image from "next/image";
import { startTransition, useActionState, useState } from "react";
import { Button, Notice, TextField } from "@/components/ui";
import type { StoryPhoto } from "@/lib/content/wedding";
import type { StoryFormState } from "@/lib/wedding-form";

const MAX_EDGE = 2000;

/**
 * Shrinks a phone photo to at most 2000px before upload, so it fits the
 * server's request limit and uploads quickly on mobile data. Falls back to the
 * original if the browser can't decode it; the server re-encodes either way.
 */
async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    return blob ? new File([blob], "photo.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export function StorySlotForm({
  slot,
  photo,
  action,
  remove,
}: {
  slot: number;
  photo: StoryPhoto | null;
  action: (prev: StoryFormState, form: FormData) => Promise<StoryFormState>;
  remove: () => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const [preparing, setPreparing] = useState(false);
  const busy = pending || preparing;
  const v = state.status === "invalid" || state.status === "failed" ? state.values : { year: photo?.year ?? "", caption: photo?.caption ?? "" };
  const errors = state.status === "invalid" ? state.errors.fields : {};
  const id = (f: string) => `story${slot}_${f}`;

  return (
    <div className="flex flex-col gap-4 border border-line p-4">
      <h3 className="m-0 text-[18px] font-normal">Photo {slot + 1}</h3>

      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        {photo ? (
          <Image src={photo.src} alt={photo.caption || `Story photo ${slot + 1}`} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
        ) : (
          <p className="m-0 flex h-full items-center justify-center text-[15px] text-ink-2">No photo yet</p>
        )}
      </div>

      {state.status === "saved" && (
        <Notice tone="success" icon="check">
          Saved.
        </Notice>
      )}
      {state.status === "failed" && <Notice tone="error">{state.message}</Notice>}

      <form
        action={formAction}
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const file = data.get("photo");
          if (file instanceof File && file.size > 0) {
            setPreparing(true);
            data.set("photo", await shrink(file));
            setPreparing(false);
          }
          startTransition(() => formAction(data));
        }}
        noValidate
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id("photo")} className="type-label text-ink-2">
            {photo ? "Replace photo (optional)" : "Photo"}
          </label>
          <input
            id={id("photo")}
            name="photo"
            type="file"
            accept="image/*"
            aria-invalid={errors[id("photo")] ? true : undefined}
            aria-describedby={errors[id("photo")] ? `${id("photo")}-error` : undefined}
            className="min-h-11 text-[15px] file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border file:border-ink file:bg-transparent file:px-4 file:text-ink"
          />
          {errors[id("photo")] && (
            <p id={`${id("photo")}-error`} className="m-0 text-[15px] text-error">
              {errors[id("photo")]}
            </p>
          )}
        </div>
        <div className="grid grid-cols-[96px_1fr] gap-3">
          <TextField id={id("year")} name="year" label="Year" inputMode="numeric" maxLength={10} placeholder="2019" defaultValue={v.year} />
          <TextField id={id("caption")} name="caption" label="Caption" maxLength={40} placeholder="Where it began" defaultValue={v.caption} error={errors[id("caption")]} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={busy}>
            {preparing ? "Preparing…" : pending ? "Uploading…" : "Save photo"}
          </Button>
        </div>
      </form>

      {photo && (
        <form action={remove}>
          <button type="submit" className="flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 text-[15px] text-error underline underline-offset-[3px]">
            Remove photo {slot + 1}
          </button>
        </form>
      )}
    </div>
  );
}
