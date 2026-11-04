import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Guest and staff pages stay crawlable so search engines read their noindex
// tags; only the pages with nothing to read are disallowed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/checkin", "/auth/", "/styleguide"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
