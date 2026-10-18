import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;

const nextConfig: NextConfig = {
  // Every page is personal to one guest or one signed-in organiser, so pages
  // render per request. See ARCHITECTURE.md §4 before turning this on.
  cacheComponents: false,
  // The preview-card renderer reads these from disk; make sure they ship.
  outputFileTracingIncludes: {
    "/*": ["./assets/og/**/*", "./public/images/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Story photos organisers upload to Supabase Storage.
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/wedding-photos/**" }] : [],
  },
  experimental: {
    // Story photo uploads. Phones shrink photos before sending; this covers the
    // rest (and forms posted without JavaScript). Vercel caps requests at 4.5 MB.
    serverActions: { bodySizeLimit: "4.4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
