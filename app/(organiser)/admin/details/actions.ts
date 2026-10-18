"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { STORY_SLOTS } from "@/lib/content/wedding";
import { clearStoryPhoto, getOrganiser, saveStoryText, saveWeddingText, setStoryPhoto } from "@/lib/data";
import { MAX_PHOTO_BYTES, parseDetailsForm, parseStoryText, type DetailsFormState, type StoryFormState } from "@/lib/wedding-form";

async function requireOrganiser() {
  if (!(await getOrganiser())) redirect("/login");
}

function checkSlot(slot: number) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= STORY_SLOTS) throw new Error(`Bad story slot ${slot}`);
}

/** Names, dates, venues, times, dress colours, contact and deadline. */
export async function saveDetails(_prev: DetailsFormState, form: FormData): Promise<DetailsFormState> {
  await requireOrganiser();
  const { values, errors, details } = parseDetailsForm(form);
  if (errors || !details) return { status: "invalid", values, errors: errors! };
  await saveWeddingText(details);
  revalidatePath("/", "layout");
  return { status: "saved" };
}

/** Story photos are shown up to ~1000px wide; 2000px covers sharp phone screens. */
async function toJpeg(file: File) {
  return sharp(Buffer.from(await file.arrayBuffer()))
    .rotate() // apply the camera's orientation before EXIF is dropped
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

/** Adds or replaces a story photo, or just updates its year and caption. */
export async function saveStory(slot: number, _prev: StoryFormState, form: FormData): Promise<StoryFormState> {
  await requireOrganiser();
  checkSlot(slot);
  const { values, errors } = parseStoryText(form, slot);
  if (errors) return { status: "invalid", values, errors };

  const file = form.get("photo");
  const hasFile = file instanceof File && file.size > 0;

  if (!hasFile) {
    if (!(await saveStoryText(slot, values))) {
      const id = `story${slot}_photo`;
      return { status: "invalid", values, errors: { fields: { [id]: "Choose a photo." }, summary: [{ href: `#${id}`, text: "Choose a photo." }] } };
    }
  } else {
    if (file.size > MAX_PHOTO_BYTES) return { status: "failed", values, message: "That photo is over 4 MB. Choose a smaller one." };
    let jpeg: Buffer;
    try {
      jpeg = await toJpeg(file);
    } catch {
      return { status: "failed", values, message: "We couldn't read that photo. Save it as a JPEG and try again." };
    }
    try {
      await setStoryPhoto(slot, jpeg, values);
    } catch (err) {
      console.error("Story photo upload failed", err);
      return { status: "failed", values, message: "The photo didn't upload. Check your connection and try again." };
    }
  }

  revalidatePath("/", "layout");
  return { status: "saved" };
}

export async function removeStory(slot: number) {
  await requireOrganiser();
  checkSlot(slot);
  await clearStoryPhoto(slot);
  revalidatePath("/", "layout");
  redirect(`/admin/details?removed=${slot + 1}#story-title`);
}
