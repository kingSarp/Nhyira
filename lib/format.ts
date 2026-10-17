const TZ = "Africa/Accra";

function at(isoDate: string) {
  return new Date(isoDate.length === 10 ? `${isoDate}T12:00:00Z` : isoDate);
}

/** "Fri 12 Feb" */
export function shortDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: TZ }).format(at(isoDate));
}

/** "31 January" */
export function dayMonth(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: TZ }).format(at(isoDate));
}

/** "31 January 2027" */
export function longDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(at(isoDate));
}

/** "13 · 02 · 2027" */
export function dotDate(isoDate: string) {
  const [y, m, d] = isoDate.slice(0, 10).split("-");
  return `${d} · ${m} · ${y}`;
}

/** Ghanaian number for wa.me: "024 123 4567" → "233241234567". */
export function toWhatsAppNumber(phone: string | null | undefined) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return `233${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("233")) return digits;
  return digits.length >= 8 ? digits : null;
}
