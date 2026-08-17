import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const lanDevOrigins = Object.values(networkInterfaces())
  .flatMap((addresses) => addresses ?? [])
  .filter(({ family, internal }) => family === "IPv4" && !internal)
  .map(({ address }) => address);

const nextConfig: NextConfig = {
  // Support loopback and whichever LAN/hotspot address this machine currently uses.
  // This only affects `next dev`; production origin handling is unchanged.
  allowedDevOrigins: [...new Set(["localhost", "127.0.0.1", ...lanDevOrigins])],
};

export default nextConfig;
