import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH || "";

const nextConfig: NextConfig = {
  distDir: process.env.VANGUARD_DEV_DIST || ".next",
  devIndicators: false,
  // Partial prerendering requires a server and cannot be combined with export.
  turbopack: {
    rules: {
      // Only compile the Tailwind entry. Applying this loader to Fontsource CSS
      // shares its development compiler cache and can discard application rules.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  output: "export",

  images: {
    unoptimized: true
  },

  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined
};

export default nextConfig;
