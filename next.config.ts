import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 外部包配置（修复警告）
  serverExternalPackages: ['sharp', 'ali-oss'],

  // API代理配置 - 解决跨域问题
  // 注意：本地 API 路由优先，只有当本地没有匹配的路由时才代理到 Go backend
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080';

    // 如果不使用 Go backend，则不配置代理
    if (process.env.NEXT_PUBLIC_USE_GO_BACKEND === 'false') {
      return [];
    }

    return [];  // 暂时禁用代理，让 Next.js API 路由优先工作
  },

  // 图片优化配置
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '555125.xyz' }, // 兰空图床域名（优先）
      { protocol: 'https', hostname: 'sc-maas.oss-cn-shanghai.aliyuncs.com' }, // FastGPT/阿里云OSS域名
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'fal.media' },
      { protocol: 'https', hostname: 'v3.fal.media' }, // fal.ai v3 API 域名
      { protocol: 'https', hostname: 'cdn.fal.media' }, // fal.ai CDN 域名
      { protocol: 'https', hostname: 'storage.fal.media' }, // fal.ai 存储域名
      { protocol: 'https', hostname: 'api.fal.media' }, // fal.ai API 域名
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'media.giphy.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    unoptimized: false, // 启用图片优化
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  // 解决 LightningCSS 在 CF Pages 上的问题
  webpack: (config, { isServer, dev }) => {
    // 在服务器端构建时，将 ali-oss 标记为外部依赖（可选模块）
    if (isServer) {
      if (!config.externals) {
        config.externals = [];
      }
      if (Array.isArray(config.externals)) {
        config.externals.push('ali-oss');
      }
    }

    // 在 CF Pages 构建环境中，跳过原生模块的严格检查
    if (process.env.CF_PAGES && !dev) {
      config.externals = config.externals || []
      config.externals.push({
        'lightningcss/node': 'commonjs lightningcss/node',
        '@parcel/watcher': 'commonjs @parcel/watcher',
      })

      // 完全禁用文件系统缓存以避免大文件
      if (config.cache && config.cache.type === 'filesystem') {
        config.cache = false;
      }
    }
    
    // 解决CF Pages构建环境中的模块解析问题
    if (!isServer && !dev) {
      // 限制chunk大小以避免超过CF Pages 25MB限制
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          maxSize: 15 * 1024 * 1024, // 15MB限制，更保守
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              maxSize: 10 * 1024 * 1024, // 10MB限制
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
              maxSize: 10 * 1024 * 1024, // 10MB限制
            },
            // 添加更细粒度的分块
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              priority: 10,
              chunks: 'all',
              maxSize: 5 * 1024 * 1024, // 5MB限制
            },
            ui: {
              test: /[\\/]node_modules[\\/](lucide-react|@tailwindcss)[\\/]/,
              name: 'ui',
              priority: 5,
              chunks: 'all',
              maxSize: 5 * 1024 * 1024, // 5MB限制
            },
          },
        },
      };
      
      // 在非开发环境且在CF Pages上完全禁用缓存
      if (process.env.CF_PAGES) {
        config.cache = false;
      }
    }

    // 处理LightningCSS模块解析
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    return config
  },
  
  // 禁用某些可能导致大文件的功能
  ...(process.env.CF_PAGES && {
    // CF Pages特定配置
    output: 'standalone',
    // 减少构建缓存大小
    cacheHandler: undefined,
    distDir: '.next',
  }),
};

export default nextConfig;
