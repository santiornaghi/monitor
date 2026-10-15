import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/qr", destination: "/presentacion", permanent: false }];
  },
};

export default nextConfig;
