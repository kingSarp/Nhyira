"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addHousehold, addHouseholds, findByPhone, getInvitation, getOrganiser, removeHousehold, updateHousehold } from "@/lib/data";
import { phoneKeyForImport } from "@/lib/import-keys";
import { parseGuestList, parseHouseholdForm, type HouseholdFormState, type ImportRow } from "@/lib/household-forms";

async function requireOrganiser() {
  if (!(await getOrganiser())) redirect("/login");
}

export async function saveHousehold(token: string | null, _prev: HouseholdFormState, form: FormData): Promise<HouseholdFormState> {
  await requireOrganiser();
  const { values, value, errors } = parseHouseholdForm(form);
  if (errors || !value) return { status: "invalid", values, errors: errors! };

  const clash = await findByPhone(value.phone, token ?? undefined);
  if (clash) return { status: "failed", values, message: `${clash.householdName} already uses this phone number.` };

  const inv = token ? await updateHousehold(token, value) : await addHousehold(value);
  if (!inv) return { status: "failed", values, message: "This household no longer exists." };
  revalidatePath("/admin", "layout");
  redirect(`/admin?saved=${inv.token}`);
}

export async function deleteHousehold(token: string) {
  await requireOrganiser();
  const inv = await getInvitation(token);
  await removeHousehold(token);
  revalidatePath("/admin", "layout");
  redirect(`/admin?removed=${encodeURIComponent(inv?.householdName ?? "Household")}`);
}

/* ---------- Import ---------- */

export type ImportState =
  | { status: "idle" }
  | { status: "editing"; text: string }
  | { status: "error"; text: string; message: string }
  | { status: "preview"; text: string; rows: (ImportRow & { duplicate: string | null })[]; ready: number };

async function readText(form: FormData) {
  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > 1_000_000) return { text: "", error: "That file is over 1 MB. Save it as CSV and try again." };
    return { text: await file.text(), error: null };
  }
  return { text: String(form.get("text") ?? ""), error: null };
}

async function preview(text: string): Promise<ImportState> {
  const parsed = parseGuestList(text);
  if (parsed.error) return { status: "error", text, message: parsed.error };
  const seen = new Map<string, number>();
  const rows = [];
  for (const r of parsed.rows) {
    let duplicate: string | null = null;
    const key = phoneKeyForImport(r.value?.phone ?? null);
    if (key) {
      const existing = await findByPhone(r.value!.phone);
      if (existing) duplicate = `Already on the list as ${existing.householdName}`;
      else if (seen.has(key)) duplicate = `Same phone as row ${seen.get(key)}`;
      else seen.set(key, r.line);
    }
    rows.push({ ...r, duplicate });
  }
  return { status: "preview", text, rows, ready: rows.filter((r) => r.value && !r.duplicate).length };
}

export async function previewImport(_prev: ImportState, form: FormData): Promise<ImportState> {
  await requireOrganiser();
  const { text, error } = await readText(form);
  if (error) return { status: "error", text: "", message: error };
  if (!text.trim()) return { status: "error", text, message: "Paste your list or choose a file first." };
  return preview(text);
}

export async function confirmImport(_prev: ImportState, form: FormData): Promise<ImportState> {
  await requireOrganiser();
  const text = String(form.get("text") ?? "");
  const state = await preview(text);
  if (state.status !== "preview") return state;
  const good = state.rows.filter((r) => r.value && !r.duplicate).map((r) => r.value!);
  if (!good.length) return { ...state };
  await addHouseholds(good);
  revalidatePath("/admin", "layout");
  redirect(`/admin?imported=${good.length}`);
}

/** One action for the import screen: preview first, then confirm. */
export async function importStep(prev: ImportState, form: FormData): Promise<ImportState> {
  const step = form.get("step");
  if (step === "edit") return { status: "editing", text: String(form.get("text") ?? "") };
  return step === "confirm" ? confirmImport(prev, form) : previewImport(prev, form);
}
