/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Ensure development mode is properly set
    if (dev && !isServer) {
      config.mode = 'development';
    }
    return config;
  }
};

export default nextConfig; 