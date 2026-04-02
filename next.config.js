/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output as static export — works on GitHub Pages or any CDN
  // Remove this line if deploying to Vercel (server rendering available)
  output: 'export',

  images: {
    // Required for static export
    unoptimized: true,
  },

  // Silence cross-origin warnings in dev
  experimental: {
    optimizePackageImports: [],
  },
};

module.exports = nextConfig;
