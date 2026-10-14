import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const target = process.env.API_URL;
    if (!target) return [];
    return [
      { source: "/api/v1/:path*", destination: `${target.replace(/\/$/, "")}/api/v1/:path*` },
    ];
  },
};

export default nextConfig;
