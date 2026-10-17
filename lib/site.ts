/** The public address guests open. Set NEXT_PUBLIC_SITE_URL in each environment. */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
