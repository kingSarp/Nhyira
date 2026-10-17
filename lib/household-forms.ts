import { wedding, type EventId } from "@/lib/content/wedding";
import { toWhatsAppNumber } from "@/lib/format";
import type { FormErrors } from "@/lib/signup-forms";

// Validation for the add/edit household form and the spreadsheet import.

export const MAX_SEATS = 10;

export const SIDES = ["Bride's family", "Groom's family", "Bride's friends", "Groom's friends"];

export type HouseholdFields = {
  householdName: string;
  greeting: string;
  phone: string;
  side: string;
  seats: Partial<Record<EventId, string>>;
};

export type ParsedHousehold = {
  householdName: string;
  greeting: string | null;
  phone: string | null;
  side: string | null;
  seats: Partial<Record<EventId, number>>;
};

export type HouseholdFormState =
  | { status: "idle" }
  | { status: "invalid"; values: HouseholdFields; errors: FormErrors }
  | { status: "failed"; values: HouseholdFields; message: string };

function add(errors: FormErrors, id: string, field: string, summary: string) {
  errors.fields[id] = field;
  errors.summary.push({ href: `#${id}`, text: summary });
}

/** Shared checks for one household, from the form or a spreadsheet row. */
export function checkHousehold(f: HouseholdFields): { value: ParsedHousehold | null; problems: { field: string; message: string }[] } {
  const problems: { field: string; message: string }[] = [];
  const name = f.householdName.trim();
  if (name.length < 2) problems.push({ field: "householdName", message: "Enter the household's name." });

  const phone = f.phone.trim();
  if (phone && !toWhatsAppNumber(phone)) problems.push({ field: "phone", message: "Enter a phone number like 024 123 4567." });

  const seats: Partial<Record<EventId, number>> = {};
  for (const e of wedding.events) {
    const raw = (f.seats[e.id] ?? "").trim();
    if (raw === "") continue;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > MAX_SEATS) {
      problems.push({ field: `seats-${e.id}`, message: `${e.shortName}: enter a number from 0 to ${MAX_SEATS}.` });
    } else if (n > 0) seats[e.id] = n;
  }
  if (!problems.some((p) => p.field.startsWith("seats")) && Object.keys(seats).length === 0) {
    problems.push({ field: `seats-${wedding.events[0].id}`, message: "Give at least one seat at one event." });
  }

  if (problems.length) return { value: null, problems };
  return {
    value: {
      householdName: name.slice(0, 80),
      greeting: f.greeting.trim().slice(0, 60) || null,
      phone: phone || null,
      side: f.side.trim().slice(0, 60) || null,
      seats,
    },
    problems,
  };
}

export function parseHouseholdForm(form: FormData) {
  const values: HouseholdFields = {
    householdName: String(form.get("householdName") ?? ""),
    greeting: String(form.get("greeting") ?? ""),
    phone: String(form.get("phone") ?? ""),
    side: String(form.get("side") ?? ""),
    seats: Object.fromEntries(wedding.events.map((e) => [e.id, String(form.get(`seats_${e.id}`) ?? "")])),
  };
  const { value, problems } = checkHousehold(values);
  const errors: FormErrors = { fields: {}, summary: [] };
  for (const p of problems) add(errors, p.field, p.message, p.message);
  return { values, value, errors: problems.length ? errors : null };
}

/* ---------- Spreadsheet import ---------- */

/** Header words we recognise, so columns can be in any order. */
const HEADERS: Record<string, keyof HouseholdFields | EventId> = {
  name: "householdName",
  household: "householdName",
  "household name": "householdName",
  greeting: "greeting",
  "greet as": "greeting",
  phone: "phone",
  whatsapp: "phone",
  "phone number": "phone",
  side: "side",
  "family side": "side",
  engagement: "engagement",
  church: "wedding",
  wedding: "wedding",
  reception: "reception",
};

/** Splits one CSV or tab-separated line, respecting "quoted, values". */
function splitLine(line: string, sep: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === sep && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

export type ImportRow = {
  line: number;
  fields: HouseholdFields;
  value: ParsedHousehold | null;
  problems: string[];
};

export type ImportPreview = {
  rows: ImportRow[];
  /** Header problems that stop the whole import. */
  error: string | null;
};

export function parseGuestList(text: string): ImportPreview {
  const lines = text.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) return { rows: [], error: "Add a header row and at least one household." };

  // Pasted from Excel or Google Sheets = tabs; a .csv file = commas.
  const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") && !lines[0].includes(",") ? ";" : ",";
  const header = splitLine(lines[0], sep).map((h) => HEADERS[h.toLowerCase().replace(/\s+/g, " ")] ?? null);
  if (!header.includes("householdName")) return { rows: [], error: 'The first row needs a "Name" column.' };
  if (!wedding.events.some((e) => header.includes(e.id))) {
    return { rows: [], error: 'The first row needs at least one event column: "Engagement", "Church" or "Reception".' };
  }

  const rows = lines.slice(1).map((line, i) => {
    const cells = splitLine(line, sep);
    const fields: HouseholdFields = { householdName: "", greeting: "", phone: "", side: "", seats: {} };
    header.forEach((key, c) => {
      const v = cells[c] ?? "";
      if (!key) return;
      if (wedding.events.some((e) => e.id === key)) fields.seats[key as EventId] = v;
      else (fields as Record<string, unknown>)[key] = v;
    });
    const { value, problems } = checkHousehold(fields);
    return { line: i + 2, fields, value, problems: problems.map((p) => p.message) };
  });
  return { rows, error: null };
}
