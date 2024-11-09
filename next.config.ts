import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/vector-hp-archive-viewer",
  distDir: ".ssg-output/vector-hp-archive-viewer",
};

export default nextConfig;
