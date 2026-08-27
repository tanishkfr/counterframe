import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // All demo media is committed locally so seeded flows work offline.
  images: { unoptimized: true },
};

export default nextConfig;
