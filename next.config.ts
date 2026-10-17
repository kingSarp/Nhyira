import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is personal to one guest or one signed-in organiser, so pages
  // render per request. See ARCHITECTURE.md §4 before turning this on.
  cacheComponents: false,
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
