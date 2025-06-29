import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API路由配置
  api: {
    // 请求体大小限制
    bodyParser: {
      sizeLimit: '100mb', // 支持较大图片文件
    },
    // 响应超时时间
    responseLimit: false,
  },
  // 实验性配置
  experimental: {
    // API路由超时时间
    serverComponentsExternalPackages: ['sharp'],
  },
  // 图片优化配置
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: true,
  },
};

export default nextConfig;
