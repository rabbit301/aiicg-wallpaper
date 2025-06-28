/**
 * 压缩工具函数
 */

import { CompressionOptions } from './compression-service';

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 计算压缩比
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return ((originalSize - compressedSize) / originalSize) * 100;
}

/**
 * 格式化压缩比
 */
export function formatCompressionRatio(ratio: number): string {
  return `${ratio.toFixed(1)}%`;
}

/**
 * 格式化处理时间
 */
export function formatProcessingTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  }
}

/**
 * 检测图片格式
 */
export function detectImageFormat(buffer: Buffer): string {
  // PNG
  if (buffer.length >= 8 && 
      buffer[0] === 0x89 && buffer[1] === 0x50 && 
      buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'png';
  }
  
  // JPEG
  if (buffer.length >= 3 && 
      buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'jpg';
  }
  
  // WebP
  if (buffer.length >= 12 && 
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp';
  }
  
  // GIF
  if (buffer.length >= 6 && 
      (buffer.toString('ascii', 0, 6) === 'GIF87a' || 
       buffer.toString('ascii', 0, 6) === 'GIF89a')) {
    return 'gif';
  }
  
  // AVIF
  if (buffer.length >= 12 && 
      buffer.toString('ascii', 4, 8) === 'ftyp' &&
      buffer.toString('ascii', 8, 12) === 'avif') {
    return 'avif';
  }
  
  return 'unknown';
}

/**
 * 验证图片文件
 */
export function validateImageFile(buffer: Buffer): {
  isValid: boolean;
  format: string;
  error?: string;
} {
  if (!buffer || buffer.length === 0) {
    return {
      isValid: false,
      format: 'unknown',
      error: '文件为空',
    };
  }
  
  const format = detectImageFormat(buffer);
  
  if (format === 'unknown') {
    return {
      isValid: false,
      format: 'unknown',
      error: '不支持的图片格式',
    };
  }
  
  // 检查文件大小限制（50MB）
  const maxSize = 50 * 1024 * 1024;
  if (buffer.length > maxSize) {
    return {
      isValid: false,
      format,
      error: `文件过大，最大支持${formatFileSize(maxSize)}`,
    };
  }
  
  return {
    isValid: true,
    format,
  };
}

/**
 * 获取默认压缩选项
 */
export function getDefaultCompressionOptions(): CompressionOptions {
  return {
    quality: 85,
    format: 'webp',
    preserveAspectRatio: true,
    removeMetadata: true,
    progressive: true,
    optimizeAnimation: true,
    maxFrames: 50,
    frameRate: 15,
  };
}

/**
 * 合并压缩选项
 */
export function mergeCompressionOptions(
  base: CompressionOptions,
  override: Partial<CompressionOptions>
): CompressionOptions {
  return {
    ...base,
    ...override,
  };
}

/**
 * 预设压缩配置
 */
export const COMPRESSION_PRESETS = {
  // 高质量（适合专业用途）
  high_quality: {
    quality: 95,
    format: 'png' as const,
    preserveAspectRatio: true,
    removeMetadata: false,
    progressive: true,
  },
  
  // 平衡（默认推荐）
  balanced: {
    quality: 85,
    format: 'webp' as const,
    preserveAspectRatio: true,
    removeMetadata: true,
    progressive: true,
  },
  
  // 高压缩（适合网络传输）
  high_compression: {
    quality: 70,
    format: 'webp' as const,
    preserveAspectRatio: true,
    removeMetadata: true,
    progressive: true,
  },
  
  // 360水冷优化
  water_cooling_360: {
    quality: 85,
    format: 'webp' as const,
    width: 640,
    height: 640,
    preserveAspectRatio: false,
    removeMetadata: true,
    progressive: true,
    waterCoolingOptimization: true,
  },

  // 圆形水冷屏幕
  water_cooling_round: {
    quality: 85,
    format: 'png' as const, // 圆形裁剪需要透明度支持
    width: 640,
    height: 640,
    preserveAspectRatio: false,
    removeMetadata: true,
    progressive: true,
    cropToCircle: true,
    waterCoolingOptimization: true,
  },
  
  // 动画优化
  animation_optimized: {
    quality: 75,
    format: 'webp' as const,
    preserveAspectRatio: true,
    removeMetadata: true,
    optimizeAnimation: true,
    maxFrames: 50,
    frameRate: 15,
  },
} as const;

export type CompressionPreset = keyof typeof COMPRESSION_PRESETS;

/**
 * 获取预设配置
 */
export function getPresetOptions(preset: CompressionPreset): CompressionOptions {
  return { ...COMPRESSION_PRESETS[preset] };
}

/**
 * 估算压缩后文件大小
 */
export function estimateCompressedSize(
  originalSize: number,
  options: CompressionOptions
): number {
  let estimatedRatio = 0.7; // 默认30%压缩
  
  // 根据质量调整
  if (options.quality) {
    if (options.quality >= 90) estimatedRatio = 0.9;
    else if (options.quality >= 80) estimatedRatio = 0.8;
    else if (options.quality >= 70) estimatedRatio = 0.7;
    else if (options.quality >= 60) estimatedRatio = 0.6;
    else estimatedRatio = 0.5;
  }
  
  // 根据格式调整
  switch (options.format) {
    case 'webp':
      estimatedRatio *= 0.8; // WebP通常比JPEG小20%
      break;
    case 'avif':
      estimatedRatio *= 0.6; // AVIF通常比JPEG小40%
      break;
    case 'png':
      estimatedRatio *= 1.2; // PNG通常比JPEG大20%
      break;
  }
  
  // 根据尺寸调整
  if (options.width || options.height) {
    // 假设尺寸减少50%，文件大小减少75%
    estimatedRatio *= 0.25;
  }
  
  return Math.round(originalSize * estimatedRatio);
}

/**
 * 生成压缩报告
 */
export interface CompressionReport {
  originalSize: string;
  compressedSize: string;
  compressionRatio: string;
  processingTime: string;
  savings: string;
}

export function generateCompressionReport(
  originalSize: number,
  compressedSize: number,
  processingTime: number
): CompressionReport {
  const ratio = calculateCompressionRatio(originalSize, compressedSize);
  const savings = originalSize - compressedSize;
  
  return {
    originalSize: formatFileSize(originalSize),
    compressedSize: formatFileSize(compressedSize),
    compressionRatio: formatCompressionRatio(ratio),
    processingTime: formatProcessingTime(processingTime),
    savings: formatFileSize(savings),
  };
}
