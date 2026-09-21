import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep visited pages in the client router cache so back-navigation
    // and revisits render instantly instead of refetching every tap.
    staleTimes: {
      dynamic: 60,
      static: 180,
    },
  },
};

export default nextConfig;
