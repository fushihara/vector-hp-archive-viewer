import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  trailingSlash: true,
  basePath: "/vector-private-hp-archive",
  distDir: ".ssg-output/vector-private-hp-archive",
};

export default nextConfig;
