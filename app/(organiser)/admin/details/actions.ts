"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { STORY_SLOTS } from "@/lib/content/wedding";
import { clearCouplePhoto, clearStoryPhoto, getOrganiser, saveStoryText, saveWeddingText, setCouplePhoto, setStoryPhoto } from "@/lib/data";
import { MAX_PHOTO_BYTES, parseDetailsForm, parsePhotoFocus, parseStoryText, type DetailsFormState, type PhotoFormState } from "@/lib/wedding-form";

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

/** The uploaded file as a JPEG, null when none was chosen, or a message for the organiser. */
async function readUpload(form: FormData): Promise<{ jpeg: Buffer | null } | { message: string }> {
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) return { jpeg: null };
  if (file.size > MAX_PHOTO_BYTES) return { message: "That photo is over 4 MB. Choose a smaller one." };
  try {
    return { jpeg: await toJpeg(file) };
  } catch {
    return { message: "We couldn't read that photo. Save it as a JPEG and try again." };
  }
}

const UPLOAD_FAILED = "The photo didn't upload. Check your connection and try again.";

/** Replaces the main photo and/or changes which part stays in view. */
export async function saveCouplePhoto(_prev: PhotoFormState, form: FormData): Promise<PhotoFormState> {
  await requireOrganiser();
  const focus = parsePhotoFocus(form);
  const values = { focus };
  const upload = await readUpload(form);
  if ("message" in upload) return { status: "failed", values, message: upload.message };
  try {
    await setCouplePhoto(upload.jpeg, focus);
  } catch (err) {
    console.error("Main photo upload failed", err);
    return { status: "failed", values, message: UPLOAD_FAILED };
  }
  revalidatePath("/", "layout");
  return { status: "saved", at: Date.now() };
}

/** Back to the built-in main photo. */
export async function resetCouplePhoto() {
  await requireOrganiser();
  await clearCouplePhoto();
  revalidatePath("/", "layout");
  redirect("/admin/details?photo=reset#photo-title");
}

/** Adds or replaces a story photo, or just updates its year and caption. */
export async function saveStory(slot: number, _prev: PhotoFormState, form: FormData): Promise<PhotoFormState> {
  await requireOrganiser();
  checkSlot(slot);
  const { values, errors } = parseStoryText(form, slot);
  if (errors) return { status: "invalid", values, errors };

  const upload = await readUpload(form);
  if ("message" in upload) return { status: "failed", values, message: upload.message };

  if (!upload.jpeg) {
    if (!(await saveStoryText(slot, values))) {
      const id = `story${slot}_photo`;
      return { status: "invalid", values, errors: { fields: { [id]: "Choose a photo." }, summary: [{ href: `#${id}`, text: "Choose a photo." }] } };
    }
  } else {
    try {
      await setStoryPhoto(slot, upload.jpeg, values);
    } catch (err) {
      console.error("Story photo upload failed", err);
      return { status: "failed", values, message: UPLOAD_FAILED };
    }
  }

  revalidatePath("/", "layout");
  return { status: "saved", at: Date.now() };
}

export async function removeStory(slot: number) {
  await requireOrganiser();
  checkSlot(slot);
  await clearStoryPhoto(slot);
  revalidatePath("/", "layout");
  redirect(`/admin/details?removed=${slot + 1}#story-title`);
}
