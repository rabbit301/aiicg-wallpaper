import sharp from 'sharp';
import { ImageProcessOptions } from '@/types';
import path from 'path';
import fs from 'fs/promises';
// 移除有问题的导入

export class ImageProcessor {
  private uploadDir: string;
  private wallpaperDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    this.wallpaperDir = path.join(process.cwd(), 'public', 'wallpapers');
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.wallpaperDir, { recursive: true });
    } catch (error) {
      console.error('创建目录失败:', error);
    }
  }

  async processImage(
    inputBuffer: Buffer,
    filename: string,
    options: ImageProcessOptions
  ): Promise<{ originalPath: string; thumbnailPath: string }> {
    const timestamp = Date.now();
    const baseName = `${timestamp}_${filename.replace(/\.[^/.]+$/, "")}`;
    
    // 原图处理
    const originalFilename = `${baseName}.${options.format}`;
    const originalPath = path.join(this.wallpaperDir, originalFilename);
    
    let sharpInstance = sharp(inputBuffer);
    
    // 360水冷屏幕优化
    if (options.optimize360) {
      sharpInstance = sharpInstance
        .resize(options.width, options.height, {
          fit: 'cover',
          position: 'center'
        })
        .sharpen() // 增强锐度，适合小屏幕显示
        .modulate({
          brightness: 1.1, // 稍微增加亮度
          saturation: 1.2, // 增加饱和度
          hue: 0
        });
    } else {
      sharpInstance = sharpInstance.resize(options.width, options.height, {
        fit: 'cover',
        position: 'center'
      });
    }

    // 根据格式设置质量
    switch (options.format) {
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ 
          quality: options.quality || 85,
          progressive: true 
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality: options.quality || 80,
          effort: 6 
        });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          compressionLevel: 6,
          progressive: true 
        });
        break;
    }

    await sharpInstance.toFile(originalPath);

    // 生成缩略图
    const thumbnailFilename = `${baseName}_thumb.webp`;
    const thumbnailPath = path.join(this.wallpaperDir, thumbnailFilename);
    
    await sharp(inputBuffer)
      .resize(300, 200, { fit: 'cover', position: 'center' })
      .webp({ quality: 70 })
      .toFile(thumbnailPath);

    return {
      originalPath: `/wallpapers/${originalFilename}`,
      thumbnailPath: `/wallpapers/${thumbnailFilename}`
    };
  }

  async downloadAndProcess(
    imageUrl: string,
    filename: string,
    options: ImageProcessOptions
  ): Promise<{ originalPath: string; thumbnailPath: string }> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`下载图片失败: ${response.statusText}`);
      }
      
      const buffer = Buffer.from(await response.arrayBuffer());
      return await this.processImage(buffer, filename, options);
    } catch (error) {
      console.error('下载并处理图片失败:', error);
      throw error;
    }
  }
}

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
}

/**
 * 构建 Cloudinary fetch URL
 * @param imageUrl - 原始图片 URL
 * @param transformations - 变换参数
 * @returns Cloudinary URL
 */
function buildCloudinaryFetchUrl(
  imageUrl: string,
  transformations: string = ''
): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.warn('Cloudinary cloud name not configured');
    return imageUrl;
  }
  
  const encodedUrl = encodeURIComponent(imageUrl);
  const transformPart = transformations ? `/${transformations}` : '';
  
  return `https://res.cloudinary.com/${cloudName}/image/fetch${transformPart}/${encodedUrl}`;
}

/**
 * 将外部图片 URL 通过 Cloudinary 代理加速
 * @param imageUrl - 原始图片 URL（如 fal.ai）
 * @param options - 优化选项
 * @returns 优化后的 Cloudinary URL
 */
export function proxyImageThroughCloudinary(
  imageUrl: string, 
  options: ImageOptimizationOptions = {}
): string {
  try {
    // 检查是否已经是 Cloudinary URL
    if (imageUrl.includes('res.cloudinary.com')) {
      return imageUrl;
    }

    // 检查 Cloudinary 配置
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn('Cloudinary not configured, returning original URL');
      return imageUrl;
    }

    const { width = 800, height = 600, quality = 80, format = 'webp' } = options;

    // 使用 Cloudinary 的 fetch 功能代理外部图片
    const transformations = [
      `w_${width}`,
      `h_${height}`, 
      `c_fill`,
      `q_${quality}`,
      `f_${format}`,
      'fl_progressive'  // 渐进式加载
    ].join(',');

    return buildCloudinaryFetchUrl(imageUrl, transformations);

  } catch (error) {
    console.error('Cloudinary proxy failed:', error);
    return imageUrl; // 失败时返回原始 URL
  }
}

/**
 * 为图片生成模糊占位符
 * @param imageUrl - 图片 URL
 * @returns base64 模糊数据 URL
 */
export function generateBlurPlaceholder(imageUrl: string): string {
  // 生成简单的渐变背景作为占位符
  const canvas = document.createElement('canvas');
  canvas.width = 40;
  canvas.height = 30;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 40, 30);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 40, 30);
  }
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

/**
 * 预加载图片
 * @param urls - 图片 URL 数组
 */
export function preloadImages(urls: string[]): void {
  urls.slice(0, 3).forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

/**
 * 检测网络连接质量并调整图片质量
 */
export function getOptimalImageQuality(): number {
  // @ts-expect-error - navigator.connection 不是标准API但被广泛支持
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return 80; // 默认质量
  
  const effectiveType = connection.effectiveType;
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 50; // 低质量，快速加载
    case '3g':
      return 70; // 中等质量
    case '4g':
    default:
      return 85; // 高质量
  }
}

/**
 * 为不同设备生成响应式图片尺寸
 */
export function getResponsiveImageSizes(): { width: number; height: number }[] {
  return [
    { width: 400, height: 300 },   // 移动端
    { width: 600, height: 450 },   // 平板
    { width: 800, height: 600 },   // 桌面
    { width: 1200, height: 900 }   // 高分辨率
  ];
}
