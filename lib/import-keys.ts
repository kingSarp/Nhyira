import { toWhatsAppNumber } from "@/lib/format";

/** Same normalisation the data layer uses, for spotting repeats inside one file. */
export function phoneKeyForImport(phone: string | null) {
  return toWhatsAppNumber(phone) ?? "";
}
