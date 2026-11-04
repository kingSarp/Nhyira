/** The product, as search results and browser tabs name it. See docs/domain-and-seo.md. */
export const SITE_NAME = "Akwaaba Invites";

/** The public address guests open. Set NEXT_PUBLIC_SITE_URL in each environment. */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
