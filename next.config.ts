import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Force Next.js à utiliser CAPO comme racine (évite de prendre C:\Users\terac\)
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    return [
      {
        source: "/uploads/:filename",
        destination: "/api/media/:filename",
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5gb",
    },
    middlewareClientMaxBodySize: "5gb",
    outputFileTracingExcludes: {
      "*": [
        "./mobile/**",
        "./logos/**",
        "./_design-import/**",
        "./node_modules.bak/**",
        "./scripts/coolify-*.mjs",
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
