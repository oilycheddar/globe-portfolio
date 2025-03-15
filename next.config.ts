import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    // Ensure development mode is properly set
    if (dev && !isServer) {
      config.mode = 'development';
    }
    return config;
  }
};

export default nextConfig;
