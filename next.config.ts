import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  /* config options here */
};

export default nextConfig;
