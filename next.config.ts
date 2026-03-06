import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false, // Disables the static/dynamic indicator badge
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
};

export default nextConfig;
