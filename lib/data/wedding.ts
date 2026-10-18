import "server-only";
import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import { cache } from "react";
import { defaultDetails, type PhotoFocus, type UploadedPhoto, type WeddingDetails } from "@/lib/content/wedding";
import { db } from "@/lib/db";
import { createSupabase } from "@/lib/supabase/server";
import { normaliseDetails, toWedding, type Wedding } from "@/lib/wedding";
import type { DetailsText } from "@/lib/wedding-form";

// The wedding details organisers edit on /admin/details: one row in
// `wedding_details`. The main photo and story photos live in the public
// `wedding-photos` Storage bucket; the row keeps their URLs and object paths.

export const PHOTO_BUCKET = "wedding-photos";

async function readDetails(): Promise<WeddingDetails> {
  try {
    const [row] = await db()<{ details: unknown }[]>`select details from wedding_details where id = 1`;
    return row ? normaliseDetails(row.details) : defaultDetails;
  } catch (err) {
    // Keep the site up (with the defaults) if the table is missing or the database is unreachable.
    console.error("Couldn't read wedding details; showing the defaults.", err);
    return defaultDetails;
  }
}

/** The wedding as screens show it. Read at request time, once per request. */
export const getWedding = cache(async (): Promise<Wedding> => {
  await connection();
  return toWedding(await readDetails());
});

/** Read-modify-write under a row lock, so two organisers saving at once don't lose each other's changes. */
async function updateDetails(change: (d: WeddingDetails) => WeddingDetails): Promise<WeddingDetails> {
  return db().begin(async (tx) => {
    const [row] = await tx<{ details: unknown }[]>`select details from wedding_details where id = 1 for update`;
    const next = change(row ? normaliseDetails(row.details) : defaultDetails);
    await tx`
      insert into wedding_details (id, details, updated_at) values (1, ${tx.json(next)}, now())
      on conflict (id) do update set details = excluded.details, updated_at = now()`;
    return next;
  });
}

/** Saves everything but the photos. */
export async function saveWeddingText(text: DetailsText) {
  await updateDetails((d) => ({ ...d, ...text }));
}

/** Updates a slot's year and caption, keeping its photo. Returns false if the slot is empty. */
export async function saveStoryText(slot: number, text: { year: string; caption: string }) {
  let found = false;
  await updateDetails((d) => {
    const story = [...d.story];
    const current = story[slot];
    if (current) {
      found = true;
      story[slot] = { ...current, ...text };
    }
    return { ...d, story };
  });
  return found;
}

/**
 * Uploads a JPEG to the photo bucket. Uses the organiser's own Supabase
 * session: Storage only lets signed-in users write to the bucket (policies in
 * db/schema.sql). A new name per upload, so browsers and the image CDN never
 * show a stale photo.
 */
async function uploadPhoto(prefix: string, jpeg: Buffer): Promise<UploadedPhoto> {
  const supabase = await createSupabase();
  const bucket = supabase.storage.from(PHOTO_BUCKET);
  const path = `${prefix}-${randomUUID()}.jpg`;
  const { error } = await bucket.upload(path, jpeg, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);
  return { src: bucket.getPublicUrl(path).data.publicUrl, path };
}

async function removeObject(path: string) {
  const supabase = await createSupabase();
  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([path]);
  // Not fatal: the photo is already off the site; it just lingers in the bucket.
  if (error) console.error("Couldn't delete old photo", path, error.message);
}

/**
 * Uploads `jpeg` (if given), applies `change` with the new photo, and deletes
 * whatever photo `change` reports it replaced. A failed save removes the upload.
 */
async function withPhoto(
  upload: { prefix: string; jpeg: Buffer } | null,
  change: (d: WeddingDetails, photo: UploadedPhoto | null) => { next: WeddingDetails; replaced: UploadedPhoto | null },
) {
  const added = upload ? await uploadPhoto(upload.prefix, upload.jpeg) : null;
  let replaced: UploadedPhoto | null = null;
  try {
    await updateDetails((d) => {
      const r = change(d, added);
      replaced = r.replaced;
      return r.next;
    });
  } catch (err) {
    if (added) await removeObject(added.path);
    throw err;
  }
  const old = replaced as UploadedPhoto | null;
  if (old && old.path !== added?.path) await removeObject(old.path);
}

/** Puts a new photo in a story slot. */
export async function setStoryPhoto(slot: number, jpeg: Buffer, text: { year: string; caption: string }) {
  await withPhoto({ prefix: `story/${slot + 1}`, jpeg }, (d, photo) => {
    const story = [...d.story];
    const replaced = story[slot] ?? null;
    story[slot] = { ...photo!, ...text };
    return { next: { ...d, story }, replaced };
  });
}

/** Empties a story slot and deletes its photo. */
export async function clearStoryPhoto(slot: number) {
  await withPhoto(null, (d) => {
    const story = [...d.story];
    const replaced = story[slot] ?? null;
    story[slot] = null;
    return { next: { ...d, story }, replaced };
  });
}

/** Sets the main photo's framing, and replaces the photo itself when `jpeg` is given. */
export async function setCouplePhoto(jpeg: Buffer | null, focus: PhotoFocus) {
  await withPhoto(jpeg ? { prefix: "couple", jpeg } : null, (d, photo) => ({
    next: { ...d, couplePhoto: photo ?? d.couplePhoto, couplePhotoFocus: focus },
    replaced: photo ? d.couplePhoto : null,
  }));
}

/** Goes back to the built-in main photo and deletes the uploaded one. */
export async function clearCouplePhoto() {
  await withPhoto(null, (d) => ({ next: { ...d, couplePhoto: null, couplePhotoFocus: defaultDetails.couplePhotoFocus }, replaced: d.couplePhoto }));
}
