"use client";

import Image from "next/image";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Button, Notice } from "@/components/ui";
import { PHOTO_FOCUS, type PhotoFocus } from "@/lib/content/wedding";
import { shrinkPhoto } from "@/lib/shrink-photo";
import type { PhotoFormState } from "@/lib/wedding-form";

/**
 * The main photo: invite headers, home page and WhatsApp card. The preview is
 * cropped like the invite header, so the framing choice can be checked before
 * saving. Works without JavaScript (no live preview, original file uploaded).
 */
export function CouplePhotoForm({
  src,
  alt,
  focus: savedFocus,
  uploaded,
  action,
  reset,
}: {
  src: string;
  alt: string;
  focus: PhotoFocus;
  /** True when an uploaded photo replaces the built-in one. */
  uploaded: boolean;
  action: (prev: PhotoFormState, form: FormData) => Promise<PhotoFormState>;
  reset: () => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const [preparing, setPreparing] = useState(false);
  const [focus, setFocus] = useState<PhotoFocus>(savedFocus);
  const [picked, setPicked] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => () => void (picked && URL.revokeObjectURL(picked)), [picked]);
  // After a save the page re-renders with the new photo; clear the chosen file.
  useEffect(() => {
    if (state.status !== "saved") return;
    formRef.current?.reset();
    setPicked(null);
  }, [state]);
  const busy = pending || preparing;

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,280px)_1fr]">
      <div className="relative aspect-[4/5] overflow-hidden bg-line">
        {picked ? (
          // A local preview of the chosen file; next/image can't load blob: URLs.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={picked} alt="Chosen photo, not saved yet" className="absolute inset-0 size-full object-cover" style={{ objectPosition: PHOTO_FOCUS[focus].position }} />
        ) : (
          <Image src={src} alt={alt} fill sizes="280px" className="object-cover" style={{ objectPosition: PHOTO_FOCUS[focus].position }} />
        )}
      </div>

      <div className="flex flex-col gap-5">
        {state.status === "saved" && (
          <Notice tone="success" icon="check" title="Saved">
            New WhatsApp shares use the updated card. Links already sent keep their old preview.
          </Notice>
        )}
        {state.status === "failed" && <Notice tone="error">{state.message}</Notice>}

        <form
          ref={formRef}
          action={formAction}
          onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const file = data.get("photo");
            if (file instanceof File && file.size > 0) {
              setPreparing(true);
              data.set("photo", await shrinkPhoto(file));
              setPreparing(false);
            }
            startTransition(() => formAction(data));
          }}
          noValidate
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="couple_photo" className="type-label text-ink-2">
              New photo (optional)
            </label>
            <input
              id="couple_photo"
              name="photo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                setPicked(f ? URL.createObjectURL(f) : null);
              }}
              className="min-h-11 text-[15px] file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border file:border-ink file:bg-transparent file:px-4 file:text-ink"
            />
            <p className="m-0 text-[14px] text-ink-2">A portrait photo works best. Up to 4 MB.</p>
          </div>

          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="type-label mb-1 p-0 text-ink-2">Keep in view when cropped</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PHOTO_FOCUS) as PhotoFocus[]).map((f) => (
                <label
                  key={f}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-4 text-[15px] has-[:checked]:border-2 has-[:checked]:border-accent has-[:checked]:px-[15px]"
                >
                  <input type="radio" name="focus" value={f} checked={focus === f} onChange={() => setFocus(f)} className="accent-accent" />
                  {PHOTO_FOCUS[f].label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={busy}>
              {preparing ? "Preparing…" : pending ? "Saving…" : "Save main photo"}
            </Button>
          </div>
        </form>

        {uploaded && (
          <form action={reset}>
            <button type="submit" className="flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 text-[15px] text-error underline underline-offset-[3px]">
              Use the original photo instead
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
