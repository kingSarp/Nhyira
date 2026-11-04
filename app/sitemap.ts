import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Only the home page is public; every invite and sign-up link is noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl()}/`, changeFrequency: "weekly", priority: 1 }];
}
