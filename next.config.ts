import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Support loopback and whichever LAN/hotspot address this machine currently uses.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;
