import type { NextConfig } from "next";

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
