import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env["NEXT_PUBLIC_BASE_DIR"],
  distDir: ".ssg-output/vector-hp-archive-viewer",
};

export default nextConfig;
