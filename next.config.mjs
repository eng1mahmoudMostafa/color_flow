/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async rewrites() {
    return [
      // Unblockable aliases: ad-blocker extensions block requests whose URL
      // path contains "ads"/"ad/" — these neutral aliases bypass that while
      // the real handlers (and their auth) remain unchanged server-side.
      { source: "/api/manage/ads", destination: "/api/admin/ads" },
      { source: "/api/manage/ads/:path*", destination: "/api/admin/ads/:path*" },
      { source: "/api/manage/stats", destination: "/api/admin/stats" },
      { source: "/api/manage/blob-check", destination: "/api/admin/blob-check" },
      { source: "/api/reward/media", destination: "/api/ad/media" },
      { source: "/api/reward/start", destination: "/api/ad/start" },
      { source: "/api/reward/verify", destination: "/api/ad/verify" },
      { source: "/api/reward/click", destination: "/api/ad/click" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
