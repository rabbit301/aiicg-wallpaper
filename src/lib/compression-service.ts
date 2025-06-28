/**
 * 图片压缩服务抽象层
 * 支持免费版和AI版压缩
 */

export interface CompressionOptions {
  // 基础选项
  width?: number;
  height?: number;
  quality?: number;
  format?: 'png' | 'jpg' | 'webp' | 'avif' | 'gif';
  
  // 高级选项
  preserveAspectRatio?: boolean;
  removeMetadata?: boolean;
  progressive?: boolean;
  
  // 动态图片选项
  optimizeAnimation?: boolean;
  maxFrames?: number;
  frameRate?: number;
  
  // AI版专用选项
  aiOptimization?: boolean;
  autoFormat?: boolean;
  autoQuality?: boolean;
  smartCrop?: boolean;

  // 水冷屏幕专用选项
  cropToCircle?: boolean;
  waterCoolingOptimization?: boolean;
}

export interface CompressionResult {
  success: boolean;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  outputUrl: string;
  format: string;
  width: number;
  height: number;
  error?: string;
  processingTime: number;
}

export interface CompressionStats {
  totalFiles: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  averageCompressionRatio: number;
  averageProcessingTime: number;
}

export abstract class CompressionService {
  protected version: 'free' | 'ai';
  protected stats: CompressionStats;

  constructor(version: 'free' | 'ai') {
    this.version = version;
    this.stats = {
      totalFiles: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      averageCompressionRatio: 0,
      averageProcessingTime: 0,
    };
  }

  /**
   * 压缩单个图片
   */
  abstract compressImage(
    input: Buffer | string,
    filename: string,
    options: CompressionOptions
  ): Promise<CompressionResult>;

  /**
   * 批量压缩图片
   */
  async compressBatch(
    inputs: Array<{ buffer: Buffer | string; filename: string; options: CompressionOptions }>
  ): Promise<CompressionResult[]> {
    const results: CompressionResult[] = [];
    
    for (const input of inputs) {
      try {
        const result = await this.compressImage(input.buffer, input.filename, input.options);
        results.push(result);
        this.updateStats(result);
      } catch (error) {
        results.push({
          success: false,
          originalSize: 0,
          compressedSize: 0,
          compressionRatio: 0,
          outputUrl: '',
          format: '',
          width: 0,
          height: 0,
          error: error instanceof Error ? error.message : '压缩失败',
          processingTime: 0,
        });
      }
    }
    
    return results;
  }

  /**
   * 获取压缩统计信息
   */
  getStats(): CompressionStats {
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalFiles: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      averageCompressionRatio: 0,
      averageProcessingTime: 0,
    };
  }

  /**
   * 检查是否支持指定格式
   */
  abstract supportsFormat(format: string): boolean;

  /**
   * 获取推荐的压缩选项
   */
  abstract getRecommendedOptions(
    inputFormat: string,
    fileSize: number,
    dimensions: { width: number; height: number }
  ): CompressionOptions;

  /**
   * 更新统计信息
   */
  protected updateStats(result: CompressionResult): void {
    if (!result.success) return;

    this.stats.totalFiles++;
    this.stats.totalOriginalSize += result.originalSize;
    this.stats.totalCompressedSize += result.compressedSize;
    
    // 计算平均压缩比
    this.stats.averageCompressionRatio = 
      (this.stats.totalOriginalSize - this.stats.totalCompressedSize) / 
      this.stats.totalOriginalSize * 100;
    
    // 计算平均处理时间
    this.stats.averageProcessingTime = 
      (this.stats.averageProcessingTime * (this.stats.totalFiles - 1) + result.processingTime) / 
      this.stats.totalFiles;
  }

  /**
   * 验证压缩选项
   */
  protected validateOptions(options: CompressionOptions): void {
    if (options.quality && (options.quality < 1 || options.quality > 100)) {
      throw new Error('质量参数必须在1-100之间');
    }
    
    if (options.width && options.width < 1) {
      throw new Error('宽度必须大于0');
    }
    
    if (options.height && options.height < 1) {
      throw new Error('高度必须大于0');
    }
    
    if (options.maxFrames && options.maxFrames < 1) {
      throw new Error('最大帧数必须大于0');
    }
  }
}

/**
 * 压缩服务工厂
 */
export class CompressionServiceFactory {
  private static freeService: CompressionService | null = null;
  private static aiService: CompressionService | null = null;

  static async createService(version: 'free' | 'ai'): Promise<CompressionService> {
    if (version === 'free') {
      if (!this.freeService) {
        const { FreeCompressionService } = await import('./free-compression');
        this.freeService = new FreeCompressionService();
      }
      return this.freeService;
    } else {
      if (!this.aiService) {
        const { AICompressionService } = await import('./ai-compression');
        this.aiService = new AICompressionService();
      }
      return this.aiService;
    }
  }

  static resetServices(): void {
    this.freeService = null;
    this.aiService = null;
  }
}
