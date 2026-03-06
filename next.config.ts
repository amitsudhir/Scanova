import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensures static assets and images are served from the right path
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

