/**
 * 图片链接验证和处理工具
 */

// 默认占位符图片 - 使用本地静态图片而不是外部服务
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NjQgNDY0Qzg2NCA0MzkuOTEgODgzLjkxIDQyMCA5MDggNDIwSDEwMTJDMTAzNi4wOSA0MjAgMTA1NiA0MzkuOTEgMTA1NiA0NjRWNTY4QzEwNTYgNTkyLjA5IDEwMzYuMDkgNjEyIDEwMTIgNjEySDkwOEM4ODMuOTEgNjEyIDg2NCA1OTIuMDkgODY0IDU2OFY0NjRaIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik05MjAgNDkySDEwMDBWNTg0SDkyMFY0OTJaIiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9Ijk2MCIgY3k9IjUxNiIgcj0iMTIiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iOTYwIiB5PSI2NjQiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Qjc0ODQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJSUNH5aOB57qHL+WbvueJh+WKoOi9veS4rTwvdGV4dD4KPC9zdmc+Cg==';

// 支持的图片域名白名单
const ALLOWED_DOMAINS = [
  '555125.xyz',
  'images.unsplash.com',
  'cdn.pixabay.com',
  'images.pexels.com',
  'source.unsplash.com',
  'picsum.photos'
  // 移除 via.placeholder.com，改用本地SVG占位符
];

/**
 * 检查图片URL是否有效
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // 如果是相对路径，认为是有效的（本地文件）
  if (url.startsWith('/')) {
    return true;
  }

  // 如果是data URL，认为是有效的（如SVG占位符）
  if (url.startsWith('data:')) {
    return true;
  }

  try {
    const urlObj = new URL(url);
    
    // 检查协议
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }

    // 对于兰空图床，我们信任其稳定性，直接返回true
    if (urlObj.hostname === '555125.xyz') {
      return true;
    }

    // 检查是否是阿里云OSS过期链接
    if (urlObj.hostname.includes('oss-cn-shanghai.aliyuncs.com')) {
      const expires = urlObj.searchParams.get('Expires');
      if (expires) {
        const expiresTime = parseInt(expires) * 1000; // 转换为毫秒
        const now = Date.now();
        if (now > expiresTime) {
          console.warn(`OSS链接已过期: ${url}`);
          return false;
        }
      }
    }

    // 检查域名白名单
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );

    if (!isAllowedDomain) {
      console.warn(`图片域名不在白名单中: ${urlObj.hostname}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('URL解析失败:', error);
    return false;
  }
}

/**
 * 获取安全的图片URL
 */
export function getSafeImageUrl(url: string, fallback?: string): string {
  if (isValidImageUrl(url)) {
    return url;
  }

  if (fallback && isValidImageUrl(fallback)) {
    return fallback;
  }

  return DEFAULT_PLACEHOLDER;
}

/**
 * 生成占位符图片URL
 */
export function generatePlaceholderUrl(width: number = 1920, height: number = 1080, text?: string): string {
  // 使用本地SVG占位符而不是外部服务，避免网络依赖
  const displayText = text || `AIICG壁纸站/图片加载中`;
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="${width}" height="${height}" fill="#F3F4F6"/>
<rect x="${width/2 - 80}" y="${height/2 - 60}" width="160" height="120" rx="8" fill="#E5E7EB"/>
<rect x="${width/2 - 50}" y="${height/2 - 30}" width="60" height="40" fill="#9CA3AF"/>
<circle cx="${width/2}" cy="${height/2 - 10}" r="8" fill="#9CA3AF"/>
<text x="${width/2}" y="${height/2 + 60}" font-family="system-ui" font-size="24" fill="#6B7484" text-anchor="middle">${displayText}</text>
</svg>`;
  
  // 使用btoa进行base64编码，兼容浏览器环境
  if (typeof window !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } else {
    // Node.js环境
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}

/**
 * 清理壁纸数据中的无效图片链接
 */
export function sanitizeWallpaperImages(wallpaper: any): any {
  const sanitized = { ...wallpaper };

  // 处理主图片URL
  if (sanitized.imageUrl) {
    sanitized.imageUrl = getSafeImageUrl(
      sanitized.imageUrl,
      generatePlaceholderUrl(sanitized.width || 1920, sanitized.height || 1080, sanitized.title)
    );
  }

  // 处理缩略图URL
  if (sanitized.thumbnailUrl) {
    sanitized.thumbnailUrl = getSafeImageUrl(
      sanitized.thumbnailUrl,
      sanitized.imageUrl // 如果缩略图无效，使用主图片作为备用
    );
  }

  return sanitized;
}

/**
 * 批量清理壁纸数据
 */
export function sanitizeWallpapers(wallpapers: any[]): any[] {
  return wallpapers.map(sanitizeWallpaperImages);
}

/**
 * 检查并修复数据文件中的图片链接
 */
export async function validateAndFixImageUrls(wallpapers: any[]): Promise<any[]> {
  const fixedWallpapers = [];

  for (const wallpaper of wallpapers) {
    const fixed = sanitizeWallpaperImages(wallpaper);
    
    // 如果图片链接被替换为占位符，记录日志
    if (fixed.imageUrl !== wallpaper.imageUrl) {
      console.log(`🔧 修复壁纸图片链接: ${wallpaper.id} - ${wallpaper.title}`);
    }

    fixedWallpapers.push(fixed);
  }

  return fixedWallpapers;
}

/**
 * 创建默认壁纸数据
 */
export function createDefaultWallpapers(): any[] {
  return [
    {
      id: 'default-1',
      title: '抽象几何',
      prompt: '现代抽象几何图案，蓝色渐变背景',
      imageUrl: generatePlaceholderUrl(1920, 1080, '抽象几何'),
      thumbnailUrl: generatePlaceholderUrl(640, 360, '抽象几何'),
      width: 1920,
      height: 1080,
      format: 'jpg',
      createdAt: new Date().toISOString(),
      downloads: 0,
      tags: ['抽象', '几何', '蓝色', '现代'],
      optimizedFor360: false
    },
    {
      id: 'default-2',
      title: '自然风光',
      prompt: '美丽的山水风景，绿色自然背景',
      imageUrl: generatePlaceholderUrl(1920, 1080, '自然风光'),
      thumbnailUrl: generatePlaceholderUrl(640, 360, '自然风光'),
      width: 1920,
      height: 1080,
      format: 'jpg',
      createdAt: new Date().toISOString(),
      downloads: 0,
      tags: ['自然', '风景', '绿色', '山水'],
      optimizedFor360: false
    },
    {
      id: 'default-3',
      title: '城市夜景',
      prompt: '现代城市夜景，霓虹灯光效果',
      imageUrl: generatePlaceholderUrl(1920, 1080, '城市夜景'),
      thumbnailUrl: generatePlaceholderUrl(640, 360, '城市夜景'),
      width: 1920,
      height: 1080,
      format: 'jpg',
      createdAt: new Date().toISOString(),
      downloads: 0,
      tags: ['城市', '夜景', '霓虹', '现代'],
      optimizedFor360: false
    },
    {
      id: 'default-4',
      title: '极简设计',
      prompt: '简约极简设计，白色背景',
      imageUrl: generatePlaceholderUrl(1920, 1080, '极简设计'),
      thumbnailUrl: generatePlaceholderUrl(640, 360, '极简设计'),
      width: 1920,
      height: 1080,
      format: 'jpg',
      createdAt: new Date().toISOString(),
      downloads: 0,
      tags: ['极简', '简约', '白色', '设计'],
      optimizedFor360: false
    }
  ];
}
