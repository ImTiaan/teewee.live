import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/u/:path*',
        destination: 'https://ukechdujbaajnjvh.public.blob.vercel-storage.com/:path*',
      },
    ];
  },
};

export default nextConfig;
