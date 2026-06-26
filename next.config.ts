import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["xlsx", "@vercel/blob"],
}

export default nextConfig
