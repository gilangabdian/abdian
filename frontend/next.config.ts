import type { NextConfig } from "next";

const nextConfig: any = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
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
