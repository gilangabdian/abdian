import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          { key: "X-Robots-Tag", value: "index, follow" },
          { key: "Content-Type", value: "application/xml" },
        ],
      },
    ];
  },

  staticPageGenerationTimeout: 300, // Menunggu maksimal 5 menit untuk Render bangun
};

export default nextConfig;
