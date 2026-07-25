import type { NextConfig } from "next";

const nextConfig: any = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  staticPageGenerationTimeout: 300, // Menunggu maksimal 5 menit untuk Render bangun
  async redirects() {
    return [
      {
        source: '/sitemap.xml',
        destination: 'https://qbdian-api.onrender.com/api/sitemap',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
