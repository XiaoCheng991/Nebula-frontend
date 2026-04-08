/** @type {import('next').NextConfig} */
const path = require('path')
const fs = require('fs')
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /\.wasm$/,
        type: 'asset/resource',
      })
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // MinIO - 请根据你的实际部署情况修改
      {
        protocol: 'http',
        hostname: '49.235.149.73',
        port: '9000',
        pathname: '/user-uploads/**',
      },
      // 如果你配置了HTTPS和域名，添加类似下面的配置：
      // {
      //   protocol: 'https',
      //   hostname: 'minio.yourdomain.com',
      //   pathname: '/user-uploads/**',
      // },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
