import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 外部包配置（修复警告）
  serverExternalPackages: ['sharp'],
  
  // 图片优化配置
  images: {
    domains: [
      'res.cloudinary.com', 
      'fal.media',
      'v3.fal.media',  // fal.ai v3 API 域名
      'cdn.fal.media', // fal.ai CDN 域名
      'storage.fal.media', // fal.ai 存储域名
      'api.fal.media', // fal.ai API 域名
      'images.unsplash.com',
      'images.pexels.com',
      'media.giphy.com',
      'localhost'
    ],
    unoptimized: false, // 启用图片优化
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
