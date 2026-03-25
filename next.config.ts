import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 生产环境移除 console
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
          new (require('babel-plugin-transform-remove-console'))({
            exclude: ['error', 'warn'],
          })
      )
    }
    return config
  },
};

export default nextConfig;
