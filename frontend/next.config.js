/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile Three.js packages (browser-only, needs bundler transform)
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

  // Security: remove X-Powered-By header
  poweredByHeader: false,

  // Enable gzip/brotli compression
  compress: true,

  // Allow images from common sources (add your backend domain here if needed)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Vercel-compatible headers for performance & security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

