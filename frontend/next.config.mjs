/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suppress webpack cache warning
  webpack: (config, { isServer }) => {
    // Fix for "outdated" webpack warning
    config.infrastructureLogging = {
      level: 'error',
    };
    return config;
  },
}

export default nextConfig
