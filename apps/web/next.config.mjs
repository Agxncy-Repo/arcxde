/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile workspace packages so Next picks up their TS source directly.
  transpilePackages: ['@app/contracts', '@app/utils'],
  // Don't lie about source maps in prod — they help debugging more than they "leak".
  productionBrowserSourceMaps: false,
  // Type-checking is enforced in CI; don't run it inside `next build` for speed.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  poweredByHeader: false,
  experimental: {
    // Server Actions are on by default; keep this object for future flags.
  },
};

export default nextConfig;
