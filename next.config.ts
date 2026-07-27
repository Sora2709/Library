import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remove the turbo property - it's not needed
  // Turbopack is enabled by default in Next.js 16
};

export default nextConfig;