import "server-only";
import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import { cache } from "react";
import { defaultDetails, type StoryPhoto, type WeddingDetails } from "@/lib/content/wedding";
import { db } from "@/lib/db";
import { createSupabase } from "@/lib/supabase/server";
import { normaliseDetails, toWedding, type Wedding } from "@/lib/wedding";

// The wedding details organisers edit on /admin/details: one row in
// `wedding_details`. Story photos live in the public `wedding-photos` Storage
// bucket; the row keeps their URLs and object paths.

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

/** Saves everything but the story photos. */
export async function saveWeddingText(text: Omit<WeddingDetails, "story">) {
  await updateDetails((d) => ({ ...text, story: d.story }));
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
 * Uploads a story photo (already a JPEG) and puts it in the slot. Uses the
 * organiser's own Supabase session: Storage only lets signed-in users write to
 * the bucket (policies in db/schema.sql). The old photo is deleted afterwards.
 */
export async function setStoryPhoto(slot: number, jpeg: Buffer, text: { year: string; caption: string }) {
  const supabase = await createSupabase();
  const bucket = supabase.storage.from(PHOTO_BUCKET);
  // A new name per upload, so browsers and the image CDN never show a stale photo.
  const path = `story/${slot + 1}-${randomUUID()}.jpg`;
  const { error } = await bucket.upload(path, jpeg, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);
  const src = bucket.getPublicUrl(path).data.publicUrl;

  let old: StoryPhoto | null = null;
  try {
    await updateDetails((d) => {
      const story = [...d.story];
      old = story[slot] ?? null;
      story[slot] = { src, path, ...text };
      return { ...d, story };
    });
  } catch (err) {
    await bucket.remove([path]);
    throw err;
  }
  if (old) await removeObject((old as StoryPhoto).path);
}

/** Empties a slot and deletes its photo. */
export async function clearStoryPhoto(slot: number) {
  let old: StoryPhoto | null = null;
  await updateDetails((d) => {
    const story = [...d.story];
    old = story[slot] ?? null;
    story[slot] = null;
    return { ...d, story };
  });
  if (old) await removeObject((old as StoryPhoto).path);
}

async function removeObject(path: string) {
  const supabase = await createSupabase();
  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([path]);
  // Not fatal: the photo is already off the site; it just lingers in the bucket.
  if (error) console.error("Couldn't delete old photo", path, error.message);
}
