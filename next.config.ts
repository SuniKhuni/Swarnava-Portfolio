import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A self-contained server (.next/standalone) for the Docker image — see Dockerfile.
  output: "standalone",
  poweredByHeader: false,
  // One address: www.swarnava.xyz → swarnava.xyz.
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "www.swarnava.xyz" }], destination: "https://swarnava.xyz/:path*", permanent: true }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75],
  },
  experimental: {
    // /admin uploads images through a server action (up to 15 MB each).
    serverActions: { bodySizeLimit: "16mb" },
  },
};

export default nextConfig;
