/**
 * 通用图像生成服务管理器
 * 支持多个API提供商，自动降级和负载均衡
 */

import { 
  ImageGenerationProvider, 
  ImageGenerationOptions, 
  ImageGenerationResult 
} from './types';
import { FastGPTProvider } from './providers/fastgpt';
import { SiliconFlowProvider } from './providers/siliconflow';

export class ImageGenerationService {
  private providers: ImageGenerationProvider[] = [];
  private primaryProvider: string;
  private fallbackProviders: string[];

  constructor() {
    // 从环境变量读取配置
    this.primaryProvider = process.env.IMAGE_GENERATION_PRIMARY || 'SiliconFlow';
    this.fallbackProviders = (process.env.IMAGE_GENERATION_FALLBACK || 'FastGPT').split(',');
    
    // 初始化所有提供商
    this.initializeProviders();
  }

  private initializeProviders() {
    // 注册所有可用的提供商
    this.providers = [
      new SiliconFlowProvider(),
      new FastGPTProvider(),
      // 未来可以轻松添加更多提供商：
      // new OpenAIProvider(),
      // new StabilityAIProvider(),
      // new MidjourneyProvider(),
    ];

    console.log('🔧 图像生成服务初始化完成');
    console.log(`📌 主要提供商: ${this.primaryProvider}`);
    console.log(`🔄 备用提供商: ${this.fallbackProviders.join(', ')}`);
  }

  /**
   * 获取可用的提供商（按优先级排序）
   */
  private async getAvailableProviders(): Promise<ImageGenerationProvider[]> {
    const available: ImageGenerationProvider[] = [];
    
    // 首先添加主要提供商
    const primary = this.providers.find(p => p.name === this.primaryProvider);
    if (primary && await primary.isAvailable()) {
      available.push(primary);
    }
    
    // 然后添加备用提供商
    for (const fallbackName of this.fallbackProviders) {
      const fallback = this.providers.find(p => p.name === fallbackName);
      if (fallback && await fallback.isAvailable() && !available.includes(fallback)) {
        available.push(fallback);
      }
    }
    
    return available;
  }

  /**
   * 生成图像（带自动降级）
   */
  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const availableProviders = await this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      return {
        success: false,
        error: '没有可用的图像生成服务'
      };
    }

    console.log(`🎯 开始图像生成，可用提供商: ${availableProviders.map(p => p.name).join(', ')}`);

    // 依次尝试每个提供商
    for (let i = 0; i < availableProviders.length; i++) {
      const provider = availableProviders[i];
      
      try {
        console.log(`🔄 尝试使用 ${provider.name} (${i + 1}/${availableProviders.length})`);
        
        const result = await provider.generateImage(options);
        
        if (result.success) {
          console.log(`✅ ${provider.name} 生成成功`);
          
          // 在结果中标记使用的提供商
          if (result.data?.metadata) {
            result.data.metadata.provider = provider.name;
            result.data.metadata.is_fallback = i > 0;
          }
          
          return result;
        } else {
          console.warn(`⚠️ ${provider.name} 生成失败: ${result.error}`);
          
          // 如果不是最后一个提供商，继续尝试下一个
          if (i < availableProviders.length - 1) {
            console.log(`🔄 切换到下一个提供商...`);
            continue;
          }
        }
      } catch (error) {
        console.error(`❌ ${provider.name} 发生异常:`, error);
        
        // 如果不是最后一个提供商，继续尝试下一个
        if (i < availableProviders.length - 1) {
          console.log(`🔄 切换到下一个提供商...`);
          continue;
        }
      }
    }

    // 所有提供商都失败了
    return {
      success: false,
      error: '所有图像生成服务都不可用'
    };
  }

  /**
   * 获取服务状态
   */
  async getServiceStatus() {
    const status = {
      primary: this.primaryProvider,
      fallback: this.fallbackProviders,
      providers: [] as Array<{
        name: string;
        available: boolean;
        healthy: boolean;
        supported_sizes: string[];
      }>
    };

    for (const provider of this.providers) {
      const available = await provider.isAvailable();
      const healthy = available ? await provider.healthCheck() : false;
      
      status.providers.push({
        name: provider.name,
        available,
        healthy,
        supported_sizes: provider.getSupportedSizes()
      });
    }

    return status;
  }

  /**
   * 切换主要提供商
   */
  switchPrimaryProvider(providerName: string) {
    const provider = this.providers.find(p => p.name === providerName);
    if (provider) {
      this.primaryProvider = providerName;
      console.log(`🔄 主要提供商已切换到: ${providerName}`);
      return true;
    }
    return false;
  }

  /**
   * 获取所有注册的提供商
   */
  getRegisteredProviders(): string[] {
    return this.providers.map(p => p.name);
  }
}

// 导出单例实例
export const imageGenerationService = new ImageGenerationService();

// 导出便捷函数（保持向后兼容）
export async function generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  return imageGenerationService.generateImage(options);
}

// 导出类型（保持向后兼容）
export * from './types';
