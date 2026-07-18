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
    // Next.js 15.5+ — absent des types officiels, requis pour les gros uploads
    ...({ proxyClientMaxBodySize: "5gb" } as Record<string, string>),
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
