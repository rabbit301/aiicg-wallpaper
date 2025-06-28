/**
 * 免费版图片压缩服务
 * 基于Sharp.js实现本地压缩
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { CompressionService, CompressionOptions, CompressionResult } from './compression-service';

export class FreeCompressionService extends CompressionService {
  private outputDir: string;

  constructor() {
    super('free');
    this.outputDir = path.join(process.cwd(), 'public', 'compressed');
    this.ensureOutputDirectory();
  }

  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('创建输出目录失败:', error);
    }
  }

  async compressImage(
    input: Buffer | string,
    filename: string,
    options: CompressionOptions
  ): Promise<CompressionResult> {
    const startTime = Date.now();
    
    try {
      this.validateOptions(options);
      
      // 获取输入buffer
      let inputBuffer: Buffer;
      let originalSize: number;
      
      if (typeof input === 'string') {
        // 从URL下载
        const response = await fetch(input);
        if (!response.ok) {
          throw new Error(`下载失败: ${response.statusText}`);
        }
        inputBuffer = Buffer.from(await response.arrayBuffer());
      } else {
        inputBuffer = input;
      }
      
      originalSize = inputBuffer.length;
      
      // 获取原始图片信息
      const metadata = await sharp(inputBuffer).metadata();
      const isAnimated = metadata.pages && metadata.pages > 1;
      
      let result: CompressionResult;
      
      if (isAnimated && options.optimizeAnimation) {
        result = await this.compressAnimatedImage(inputBuffer, filename, options, originalSize, metadata);
      } else {
        result = await this.compressStaticImage(inputBuffer, filename, options, originalSize, metadata);
      }
      
      result.processingTime = Date.now() - startTime;
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
        error: error instanceof Error ? error.message : '压缩失败',
        processingTime: Date.now() - startTime,
      };
    }
  }

  private async compressStaticImage(
    inputBuffer: Buffer,
    filename: string,
    options: CompressionOptions,
    originalSize: number,
    metadata: sharp.Metadata
  ): Promise<CompressionResult> {
    const timestamp = Date.now();
    const baseName = filename.replace(/\.[^/.]+$/, '');
    const outputFormat = options.format || 'webp';
    const outputFilename = `${timestamp}_${baseName}_compressed.${outputFormat}`;
    const outputPath = path.join(this.outputDir, outputFilename);
    
    let sharpInstance = sharp(inputBuffer);
    
    // 处理尺寸调整和裁剪
    if (options.width || options.height) {
      const targetWidth = options.width || options.height!;
      const targetHeight = options.height || options.width!;

      if (options.cropToCircle) {
        // 圆形裁剪：先调整为正方形，然后应用圆形遮罩
        const size = Math.min(targetWidth, targetHeight);
        sharpInstance = sharpInstance
          .resize(size, size, {
            fit: 'cover',
            position: 'center'
          });
        sharpInstance = await this.applyCircularCrop(sharpInstance, size);
      } else {
        // 普通裁剪
        if (options.preserveAspectRatio === false) {
          // 强制拉伸到目标尺寸
          sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
            fit: 'fill'
          });
        } else {
          // 保持比例，居中裁剪
          sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
            fit: 'cover',
            position: 'center'
          });
        }
      }
    }

    // 移除元数据
    if (options.removeMetadata) {
      sharpInstance = sharpInstance.removeAlpha();
    }

    // 水冷屏幕优化
    if (options.waterCoolingOptimization) {
      sharpInstance = this.applyWaterCoolingOptimization(sharpInstance);
    }
    
    // 根据格式设置压缩参数
    // 如果是圆形裁剪，强制使用支持透明度的格式
    if (options.cropToCircle && (outputFormat === 'jpg')) {
      console.warn('圆形裁剪不支持JPEG格式，自动转换为PNG');
      sharpInstance = sharpInstance.png({
        compressionLevel: 6,
        progressive: options.progressive !== false,
      });
    } else {
      switch (outputFormat) {
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({
            quality: options.quality || 85,
            progressive: options.progressive !== false,
            mozjpeg: true,
          });
          break;

        case 'webp':
          sharpInstance = sharpInstance.webp({
            quality: options.quality || 80,
            effort: 6,
            smartSubsample: true,
          });
          break;

        case 'avif':
          sharpInstance = sharpInstance.avif({
            quality: options.quality || 75,
            effort: 9,
          });
          break;

        case 'png':
          sharpInstance = sharpInstance.png({
            compressionLevel: 6,
            progressive: options.progressive !== false,
          });
          break;

        default:
          throw new Error(`不支持的格式: ${outputFormat}`);
      }
    }
    
    // 保存文件
    const outputInfo = await sharpInstance.toFile(outputPath);
    
    return {
      success: true,
      originalSize,
      compressedSize: outputInfo.size,
      compressionRatio: ((originalSize - outputInfo.size) / originalSize) * 100,
      outputUrl: `/compressed/${outputFilename}`,
      format: outputFormat,
      width: outputInfo.width,
      height: outputInfo.height,
      processingTime: 0, // 将在调用方设置
    };
  }

  private async compressAnimatedImage(
    inputBuffer: Buffer,
    filename: string,
    options: CompressionOptions,
    originalSize: number,
    metadata: sharp.Metadata
  ): Promise<CompressionResult> {
    const timestamp = Date.now();
    const baseName = filename.replace(/\.[^/.]+$/, '');
    const outputFormat = options.format === 'gif' ? 'gif' : 'webp';
    const outputFilename = `${timestamp}_${baseName}_compressed.${outputFormat}`;
    const outputPath = path.join(this.outputDir, outputFilename);
    
    let sharpInstance = sharp(inputBuffer, { animated: true });
    
    // 调整尺寸
    if (options.width || options.height) {
      sharpInstance = sharpInstance.resize(options.width, options.height, {
        fit: options.preserveAspectRatio !== false ? 'inside' : 'fill',
      });
    }
    
    // 根据格式设置压缩参数
    if (outputFormat === 'webp') {
      sharpInstance = sharpInstance.webp({
        quality: options.quality || 75,
        effort: 6,
        smartSubsample: true,
      });
    } else {
      sharpInstance = sharpInstance.gif({
        effort: 10,
        colours: 256, // 限制颜色数量
      });
    }
    
    const outputInfo = await sharpInstance.toFile(outputPath);
    
    return {
      success: true,
      originalSize,
      compressedSize: outputInfo.size,
      compressionRatio: ((originalSize - outputInfo.size) / originalSize) * 100,
      outputUrl: `/compressed/${outputFilename}`,
      format: outputFormat,
      width: outputInfo.width,
      height: outputInfo.height,
      processingTime: 0,
    };
  }

  supportsFormat(format: string): boolean {
    const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'];
    return supportedFormats.includes(format.toLowerCase());
  }

  getRecommendedOptions(
    inputFormat: string,
    fileSize: number,
    dimensions: { width: number; height: number }
  ): CompressionOptions {
    const isLarge = fileSize > 1024 * 1024; // 1MB
    const isHighRes = dimensions.width > 1920 || dimensions.height > 1080;
    
    // 基础推荐
    const options: CompressionOptions = {
      quality: isLarge ? 75 : 85,
      format: 'webp', // 默认使用WebP获得最佳压缩比
      preserveAspectRatio: true,
      removeMetadata: true,
      progressive: true,
    };
    
    // 高分辨率图片降采样
    if (isHighRes) {
      options.width = Math.min(dimensions.width, 1920);
      options.height = Math.min(dimensions.height, 1080);
    }
    
    // 动画图片优化
    if (inputFormat.toLowerCase() === 'gif') {
      options.optimizeAnimation = true;
      options.maxFrames = 50;
      options.frameRate = 15;
    }
    
    return options;
  }

  /**
   * 应用圆形裁剪
   */
  private async applyCircularCrop(sharpInstance: sharp.Sharp, size: number): Promise<sharp.Sharp> {
    try {
      // 创建圆形遮罩，使用透明背景
      const circularMask = Buffer.from(
        `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="circle">
              <rect width="${size}" height="${size}" fill="black"/>
              <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
            </mask>
          </defs>
          <rect width="${size}" height="${size}" fill="white" mask="url(#circle)"/>
        </svg>`
      );

      // 确保输入图片已经是正确尺寸
      const processedImage = await sharpInstance
        .png() // 转换为PNG以支持透明度
        .toBuffer();

      // 应用圆形遮罩
      return sharp(processedImage)
        .composite([{
          input: circularMask,
          blend: 'dest-in'
        }])
        .png({ compressionLevel: 6 });

    } catch (error) {
      console.warn('圆形裁剪失败，使用方形裁剪:', error);
      return sharpInstance;
    }
  }

  /**
   * 水冷屏幕优化处理
   */
  private applyWaterCoolingOptimization(sharpInstance: sharp.Sharp): sharp.Sharp {
    return sharpInstance
      .sharpen(1.5, 1, 1.5) // 适度增强锐度，避免过度锐化
      .modulate({
        brightness: 1.1, // 适度增加亮度
        saturation: 1.15, // 适度增强饱和度
        hue: 0
      })
      .gamma(1.05) // 轻微调整伽马值
      .normalise(); // 标准化对比度，避免过曝
  }
}
