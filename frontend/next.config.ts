import type { NextConfig } from "next";

const nextConfig: any = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  staticPageGenerationTimeout: 300, // Menunggu maksimal 5 menit untuk Render bangun

};

export default nextConfig;
