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
      console.log('🗜️ 开始压缩图片:', filename);
      console.log('📐 压缩选项:', options);
      
      this.validateOptions(options);
      
      // 获取输入buffer和大小
      let inputBuffer: Buffer;
      
      if (typeof input === 'string') {
        console.log('📥 从URL下载:', input);
        // 从URL下载
        const response = await fetch(input);
        if (!response.ok) {
          throw new Error(`下载失败: ${response.statusText}`);
        }
        inputBuffer = Buffer.from(await response.arrayBuffer());
      } else {
        inputBuffer = input;
      }
      
      const originalSize = inputBuffer.length;
      console.log('📊 原始文件大小:', originalSize, 'bytes');
      
      // 确保输出目录存在
      await this.ensureOutputDirectory();
      
      // 获取原始图片信息
      console.log('🔍 分析图片元数据...');
      const metadata = await sharp(inputBuffer).metadata();
      console.log('📋 图片信息:', {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha,
        pages: metadata.pages
      });
      
      const isAnimated = metadata.pages && metadata.pages > 1;
      
      let result: CompressionResult;
      
      if (isAnimated && options.optimizeAnimation) {
        console.log('🎬 处理动画图片');
        result = await this.compressAnimatedImage(inputBuffer, filename, options, originalSize, metadata);
      } else {
        console.log('🖼️ 处理静态图片');
        result = await this.compressStaticImage(inputBuffer, filename, options, originalSize, metadata);
      }
      
      result.processingTime = Date.now() - startTime;
      console.log('✅ 压缩完成:', {
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        ratio: result.compressionRatio,
        time: result.processingTime
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ 压缩失败:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'Unknown error');
      
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
    try {
      const timestamp = Date.now();
      const baseName = filename.replace(/\.[^/.]+$/, '');
      const outputFormat = options.format || 'webp';
      const outputFilename = `${timestamp}_${baseName}_compressed.${outputFormat}`;
      const outputPath = path.join(this.outputDir, outputFilename);
      
      console.log('💾 输出路径:', outputPath);
      
      let sharpInstance = sharp(inputBuffer);
      
      // 智能分析图片特征
      console.log('🔍 分析图片特征...');
      const imageAnalysis = this.analyzeImageCharacteristics(metadata, options);
      console.log('📋 图片分析结果:', imageAnalysis);
      
      // 处理尺寸调整和裁剪
      if (options.width || options.height) {
        const targetWidth = options.width || options.height!;
        const targetHeight = options.height || options.width!;
        
        console.log('📏 调整尺寸到:', targetWidth, 'x', targetHeight);

        // 计算比例差异，决定缩放策略
        const originalRatio = (metadata.width || 1) / (metadata.height || 1);
        const targetRatio = targetWidth / targetHeight;
        const ratioDifference = Math.abs(originalRatio - targetRatio) / Math.max(originalRatio, targetRatio);
        
        console.log('📊 比例分析:', {
          original: `${metadata.width}x${metadata.height} (${originalRatio.toFixed(2)})`,
          target: `${targetWidth}x${targetHeight} (${targetRatio.toFixed(2)})`,
          difference: `${(ratioDifference * 100).toFixed(1)}%`
        });

        if (options.cropToCircle) {
          console.log('⭕ 应用圆形裁剪 - 使用智能居中裁切');
          // 圆形裁剪：先调整为正方形，然后应用圆形遮罩
          const size = Math.min(targetWidth, targetHeight);
          sharpInstance = sharpInstance
            .resize(size, size, {
              fit: 'cover', // 保持比例，智能裁切
              position: 'attention' // Sharp的智能定位，自动找到主题
            });
          sharpInstance = await this.applyCircularCrop(sharpInstance, size);
        } else if (ratioDifference < 0.15) { // 比例差异小于15%，使用等比缩放
          console.log('🔄 比例相近，使用等比缩放');
          sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
            fit: 'inside', // 等比缩放，完全包含在目标尺寸内
            withoutEnlargement: false // 允许放大
          });
        } else if (ratioDifference < 0.35) { // 比例差异中等，使用智能裁切
          console.log('✂️ 比例差异中等，使用智能裁切');
          sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
            fit: 'cover', // 保持比例，智能裁切
            position: 'attention' // 使用Sharp的注意力机制找到主题
          });
        } else { // 比例差异很大，根据用户设置决定
          if (options.preserveAspectRatio === false) {
            console.log('🔧 比例差异较大，强制拉伸（按用户要求）');
            sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
              fit: 'fill' // 强制拉伸
            });
          } else {
            console.log('📐 比例差异较大，优先保持比例并裁切主要区域');
            sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
              fit: 'cover',
              position: 'attention' // 智能定位主题
            });
          }
        }
      }

      // 移除元数据
      if (options.removeMetadata) {
        console.log('🗑️ 移除元数据');
        sharpInstance = sharpInstance.removeAlpha();
      }

      // 水冷屏幕优化
      if (options.waterCoolingOptimization) {
        console.log('❄️ 应用水冷屏幕优化');
        sharpInstance = this.applyWaterCoolingOptimization(sharpInstance);
      }
      
      // 根据格式设置压缩参数
      // 如果是圆形裁剪，强制使用支持透明度的格式
      if (options.cropToCircle && (outputFormat === 'jpg' || outputFormat === 'jpeg')) {
        console.warn('⚠️ 圆形裁剪不支持JPEG格式，自动转换为PNG');
        sharpInstance = sharpInstance.png({
          compressionLevel: 6,
          progressive: options.progressive !== false,
        });
      } else {
        console.log('🎨 设置输出格式:', outputFormat);
        switch (outputFormat) {
          case 'jpg':
          case 'jpeg':
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
      console.log('💾 开始保存文件...');
      const outputInfo = await sharpInstance.toFile(outputPath);
      console.log('✅ 文件保存成功:', outputInfo);
      
      // 检查文件是否真的创建了
      try {
        await fs.access(outputPath);
        console.log('✅ 文件存在确认');
      } catch (error) {
        console.error('❌ 文件未创建:', error);
        throw new Error('文件保存失败');
      }
      
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
      
    } catch (error) {
      console.error('❌ 静态图片压缩失败:', error);
      throw error; // 重新抛出错误让上级处理
    }
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

  /**
   * 分析图片特征，为压缩策略提供参考
   */
  private analyzeImageCharacteristics(metadata: sharp.Metadata, options: CompressionOptions): {
    type: string;
    confidence: number;
    recommendations: string[];
  } {
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const ratio = width / height;
    const hasAlpha = metadata.hasAlpha || false;
    
    let type = 'unknown';
    let confidence = 0.5;
    const recommendations: string[] = [];
    
    // 分析图片类型
    if (Math.abs(ratio - 1) < 0.1) {
      type = 'square';
      confidence = 0.9;
      recommendations.push('正方形图片，适合圆形裁剪');
    } else if (ratio > 2 || ratio < 0.5) {
      type = 'extreme_ratio';
      confidence = 0.8;
      recommendations.push('极端比例图片，建议使用智能裁切');
    } else if (ratio > 1.3 && ratio < 1.9) {
      type = 'landscape';
      confidence = 0.7;
      recommendations.push('横向图片，适合横屏显示');
    } else if (ratio < 0.8 && ratio > 0.5) {
      type = 'portrait';
      confidence = 0.7;
      recommendations.push('竖向图片，适合竖屏显示');
    }
    
    // 检查透明度
    if (hasAlpha) {
      recommendations.push('包含透明通道，推荐PNG格式');
    }
    
    // 尺寸建议
    if (width > 4000 || height > 4000) {
      recommendations.push('超高分辨率图片，建议降采样');
    } else if (width < 200 || height < 200) {
      recommendations.push('低分辨率图片，避免过度放大');
    }
    
    return { type, confidence, recommendations };
  }
}
