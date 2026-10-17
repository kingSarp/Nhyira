import "server-only";
import { randomBytes } from "node:crypto";
import { toWhatsAppNumber } from "@/lib/format";

/** Unguessable personal-link token, readable at the front: "kwame-ama-boateng-3f9a…". */
export function newToken(name: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `${slug || "guest"}-${randomBytes(6).toString("hex")}`;
}

/** Normalised number used to stop the same phone being added twice. */
export function phoneKey(phone: string | null | undefined) {
  return toWhatsAppNumber(phone) ?? "";
}
