import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Cursor's preview browser talks to Next over 127.0.2.2; without this,
  // HMR (and sometimes interaction) is blocked as a cross-origin request.
  allowedDevOrigins: ["127.0.2.2"],
};

export default nextConfig;
