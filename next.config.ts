import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 外部包配置（修复警告）
  serverExternalPackages: ['sharp'],
  
  // 图片优化配置
  images: {
    domains: ['res.cloudinary.com', 'fal.media'],
    unoptimized: true,
  },
};

export default nextConfig;
