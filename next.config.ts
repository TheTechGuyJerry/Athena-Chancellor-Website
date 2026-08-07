import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/cms", destination: "/admin", permanent: false },
      { source: "/cms/login", destination: "/admin", permanent: false },
      { source: "/cms/admin", destination: "/admin", permanent: false },
      { source: "/admin/dashboard", destination: "/admin", permanent: false },
    ];
  },
};

export default nextConfig;
