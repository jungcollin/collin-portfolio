import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/collin-portfolio",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
