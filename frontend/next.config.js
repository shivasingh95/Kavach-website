/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    turbo: {},
  },
};

module.exports = nextConfig;
