import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/dwsw-game',
  assetPrefix: '/dwsw-game',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
