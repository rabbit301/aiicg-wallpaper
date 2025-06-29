/**
 * AI版图片压缩服务
 * 基于Cloudinary实现云端智能压缩
 */

import { v2 as cloudinary } from 'cloudinary';
import { CompressionService, CompressionOptions, CompressionResult } from './compression-service';
import path from 'path';
import fs from 'fs/promises';

export class AICompressionService extends CompressionService {
  private isConfigured: boolean = false;

  constructor() {
    super('ai');
    this.configureCloudinary();
  }

  private configureCloudinary(): void {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dig04lnn7',
        api_key: process.env.CLOUDINARY_API_KEY || '393378456155828',
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      
      if (!process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET === 'your_api_secret_here') {
        console.warn('Cloudinary API Secret未配置，AI压缩功能将不可用');
        this.isConfigured = false;
      } else {
        this.isConfigured = true;
      }
    } catch (error) {
      console.error('Cloudinary配置失败:', error);
      this.isConfigured = false;
    }
  }

  async compressImage(
    input: Buffer | string,
    filename: string,
    options: CompressionOptions
  ): Promise<CompressionResult> {
    const startTime = Date.now();
    
    try {
      if (!this.isConfigured) {
        throw new Error('AI压缩服务未正确配置，请检查Cloudinary API密钥');
      }
      
      this.validateOptions(options);
      
      // 生成唯一的public_id
      const timestamp = Date.now();
      const baseName = filename.replace(/\.[^/.]+$/, '');
      const publicId = `compressed/${timestamp}_${baseName}`;
      
      let originalSize: number;
      let uploadResult: any;
      
      // 上传到Cloudinary
      if (typeof input === 'string') {
        // 从URL上传
        uploadResult = await cloudinary.uploader.upload(input, {
          public_id: publicId,
          resource_type: 'auto',
          overwrite: true,
        });
        originalSize = uploadResult.bytes;
      } else {
        // 从Buffer上传
        originalSize = input.length;
        uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              resource_type: 'auto',
              overwrite: true,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(input);
        });
      }
      
      // 构建转换参数
      const transformations = this.buildTransformations(options);
      
      // 生成优化后的URL，使用简化的参数
      const optimizedUrl = this.generateOptimizedUrl(publicId, options);
      
      // 下载优化后的图片并保存到本地
      const localInfo = await this.downloadAndSaveImage(optimizedUrl, filename);

      const result: CompressionResult = {
        success: true,
        originalSize,
        compressedSize: localInfo.size,
        compressionRatio: ((originalSize - localInfo.size) / originalSize) * 100,
        outputUrl: localInfo.localUrl,
        format: localInfo.format,
        width: localInfo.width,
        height: localInfo.height,
        processingTime: Date.now() - startTime,
      };
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        outputUrl: '',
        format: '',
        width: 0,
        height: 0,
        error: error instanceof Error ? error.message : 'AI压缩失败',
        processingTime: Date.now() - startTime,
      };
    }
  }

  private buildTransformations(options: CompressionOptions): any {
    const transformations: any = {};
    
    // 自动格式和质量优化（AI版核心功能）
    if (options.autoFormat !== false) {
      transformations.fetch_format = 'auto';
    } else if (options.format) {
      transformations.format = options.format;
    }
    
    if (options.autoQuality !== false) {
      transformations.quality = 'auto:best';
    } else if (options.quality) {
      transformations.quality = options.quality;
    }
    
    // 尺寸调整
    if (options.width || options.height) {
      if (options.smartCrop) {
        transformations.crop = 'auto';
        transformations.gravity = 'auto';
      } else {
        transformations.crop = options.preserveAspectRatio !== false ? 'fit' : 'fill';
      }
      
      if (options.width) transformations.width = options.width;
      if (options.height) transformations.height = options.height;
    }
    
    // 动画优化
    if (options.optimizeAnimation) {
      transformations.flags = 'animated';
      
      if (options.maxFrames) {
        transformations.page = `1-${options.maxFrames}`;
      }
      
      if (options.frameRate) {
        transformations.fps = options.frameRate;
      }
    }
    
    // 高级AI优化
    if (options.aiOptimization !== false) {
      // 启用AI增强
      transformations.effect = 'auto_color';
      // 修复flags格式问题
      const existingFlags = transformations.flags || '';
      transformations.flags = existingFlags ? `${existingFlags},progressive` : 'progressive';
    }

    // 圆形裁剪
    if (options.cropToCircle) {
      transformations.radius = 'max'; // Cloudinary圆形裁剪
    }

    // 水冷屏幕优化
    if (options.waterCoolingOptimization) {
      transformations.effect = 'sharpen:200'; // 增强锐度
      transformations.auto_brightness = true;
      transformations.auto_contrast = true;
    }
    
    return transformations;
  }

  /**
   * 生成简化的优化URL，避免复杂参数导致的问题
   */
  private generateOptimizedUrl(publicId: string, options: CompressionOptions): string {
    // 使用最简单的URL格式，避免复杂参数
    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

    const transformations: string[] = [];

    // 基础尺寸设置
    if (options.width || options.height) {
      const w = options.width || options.height;
      const h = options.height || options.width;
      const crop = options.preserveAspectRatio !== false ? 'fit' : 'fill';
      transformations.push(`c_${crop},w_${w},h_${h}`);
    }

    // 质量设置 - 使用固定质量避免auto参数问题
    const quality = options.quality || 80;
    transformations.push(`q_${quality}`);

    // 格式设置 - 使用固定格式
    const format = options.format || 'jpg';
    transformations.push(`f_${format}`);

    // 圆形裁剪
    if (options.cropToCircle) {
      transformations.push('r_max');
    }

    // 构建最终URL
    const transformationString = transformations.join(',');
    return `${baseUrl}/${transformationString}/${publicId}.${format}`;
  }

  /**
   * 下载Cloudinary图片并保存到本地
   */
  private async downloadAndSaveImage(cloudinaryUrl: string, originalFilename: string): Promise<{
    size: number;
    format: string;
    width: number;
    height: number;
    localUrl: string;
  }> {
    try {
      console.log('开始下载Cloudinary图片:', cloudinaryUrl);

      // 设置超时控制器
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45秒超时

      // 下载图片
      const response = await fetch(cloudinaryUrl, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      console.log('图片下载成功，大小:', buffer.length);

      // 确保输出目录存在
      const outputDir = path.join(process.cwd(), 'public', 'compressed');
      await fs.mkdir(outputDir, { recursive: true });

      // 生成文件名
      const timestamp = Date.now();
      const baseName = originalFilename.replace(/\.[^/.]+$/, '');
      const extension = this.extractFormatFromUrl(cloudinaryUrl) || 'jpg';
      const filename = `${timestamp}_${baseName}_ai.${extension}`;
      const filePath = path.join(outputDir, filename);

      // 保存文件
      await fs.writeFile(filePath, buffer);
      console.log('图片保存成功:', filePath);

      // 获取图片信息
      const sharp = (await import('sharp')).default;
      const metadata = await sharp(buffer).metadata();

      const result = {
        size: buffer.length,
        format: extension,
        width: metadata.width || 0,
        height: metadata.height || 0,
        localUrl: `/compressed/${filename}`,
      };

      console.log('AI压缩完成，返回本地URL:', result.localUrl);
      return result;

    } catch (error) {
      console.error('下载和保存图片失败:', error);
      console.error('Cloudinary URL:', cloudinaryUrl);

      // 如果下载失败，尝试使用代理URL
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(cloudinaryUrl)}`;
      console.log('使用代理URL:', proxyUrl);

      return {
        size: 0,
        format: 'unknown',
        width: 0,
        height: 0,
        localUrl: proxyUrl,
      };
    }
  }

  /**
   * 从URL中提取格式
   */
  private extractFormatFromUrl(url: string): string {
    const match = url.match(/\.([^./?]+)(?:\?|$)/);
    return match ? match[1] : 'jpg';
  }

  private async getImageInfo(url: string): Promise<{
    size: number;
    format: string;
    width: number;
    height: number;
  }> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');
      
      // 获取详细信息需要实际下载图片
      const imageResponse = await fetch(url);
      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      
      // 使用sharp获取尺寸信息
      const sharp = (await import('sharp')).default;
      const metadata = await sharp(buffer).metadata();
      
      return {
        size: buffer.length,
        format: this.extractFormatFromContentType(contentType || ''),
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      console.error('获取图片信息失败:', error);
      return {
        size: 0,
        format: 'unknown',
        width: 0,
        height: 0,
      };
    }
  }

  private extractFormatFromContentType(contentType: string): string {
    const match = contentType.match(/image\/(\w+)/);
    return match ? match[1] : 'unknown';
  }

  supportsFormat(format: string): boolean {
    // Cloudinary支持几乎所有图片格式
    const supportedFormats = [
      'jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'bmp', 'tiff', 'svg',
      'ico', 'pdf', 'eps', 'psd', 'ai', 'heic', 'heif'
    ];
    return supportedFormats.includes(format.toLowerCase());
  }

  getRecommendedOptions(
    inputFormat: string,
    fileSize: number,
    dimensions: { width: number; height: number }
  ): CompressionOptions {
    const isLarge = fileSize > 2 * 1024 * 1024; // 2MB
    const isHighRes = dimensions.width > 2560 || dimensions.height > 1440;
    
    // AI版推荐配置（更激进的优化）
    const options: CompressionOptions = {
      autoFormat: true, // 让AI选择最佳格式
      autoQuality: true, // 让AI选择最佳质量
      aiOptimization: true, // 启用AI增强
      smartCrop: true, // 智能裁剪
      preserveAspectRatio: true,
      removeMetadata: true,
      progressive: true,
    };
    
    // 超高分辨率图片智能缩放
    if (isHighRes) {
      options.width = Math.min(dimensions.width, 2560);
      options.height = Math.min(dimensions.height, 1440);
    }
    
    // 大文件额外优化
    if (isLarge) {
      options.quality = 75; // 覆盖auto质量
    }
    
    // 动画图片AI优化
    if (inputFormat.toLowerCase() === 'gif') {
      options.optimizeAnimation = true;
      options.maxFrames = 100; // AI版支持更多帧
      options.frameRate = 24;
      options.format = 'webp'; // 转换为WebP动画
    }
    
    return options;
  }

  /**
   * 检查AI服务是否可用
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * 获取Cloudinary使用统计
   */
  async getUsageStats(): Promise<any> {
    if (!this.isConfigured) {
      throw new Error('AI压缩服务未配置');
    }
    
    try {
      return await cloudinary.api.usage();
    } catch (error) {
      console.error('获取使用统计失败:', error);
      return null;
    }
  }

  /**
   * 清理临时文件
   */
  async cleanup(publicIds: string[]): Promise<void> {
    if (!this.isConfigured) return;
    
    try {
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error('清理文件失败:', error);
    }
  }
}
