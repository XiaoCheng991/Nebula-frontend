import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: process.env.NODE_ENV !== 'production',

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

  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'http',
        hostname: '49.235.149.73',
      },
    ],
  },

  // 压缩配置
  compress: true,

  // 实验性功能（可选启用）
  experimental: {
    optimizePackageImports: ['lucide-react', 'radix-ui', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
};

export default nextConfig;