/**
 * 硅基流动 (SiliconFlow) 图像生成适配器
 */

import { 
  ImageGenerationProvider, 
  ImageGenerationOptions, 
  ImageGenerationResult,
  ImageSize,
  IMAGE_SIZE_DIMENSIONS 
} from '../types';

export class SiliconFlowProvider implements ImageGenerationProvider {
  name = 'SiliconFlow';
  
  private config = {
    apiUrl: process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1/images/generations',
    apiKey: process.env.SILICONFLOW_API_KEY || '',
    model: process.env.SILICONFLOW_MODEL || 'black-forest-labs/FLUX.1-schnell'
  };

  async isAvailable(): Promise<boolean> {
    return !!(this.config.apiKey && this.config.apiUrl);
  }

  async healthCheck(): Promise<boolean> {
    try {
      // 简单的健康检查 - 发送一个最小请求
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: "test",
          n: 1,
          size: "1024x1024"
        }),
      });
      
      return response.status !== 401 && response.status !== 403;
    } catch {
      return false;
    }
  }

  getSupportedSizes(): ImageSize[] {
    return ["square", "square_hd", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"];
  }

  getDefaultParams(): Partial<ImageGenerationOptions> {
    return {
      num_inference_steps: 4,
      guidance_scale: 7.5,
      num_images: 1,
      enable_safety_checker: true
    };
  }

  /**
   * 将内部尺寸格式转换为硅基流动API格式
   */
  private convertImageSize(imageSize: ImageSize): string {
    const dimensions = IMAGE_SIZE_DIMENSIONS[imageSize];
    return `${dimensions.width}x${dimensions.height}`;
  }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 ${this.name} 开始生成图像...`);
      console.log('  📝 提示词:', options.prompt);
      console.log('  📐 图片尺寸:', options.image_size || "landscape_4_3");
      
      const imageSize = options.image_size || "landscape_4_3";
      const dimensions = IMAGE_SIZE_DIMENSIONS[imageSize];
      const sizeString = this.convertImageSize(imageSize);
      
      // 合并默认参数
      const params = { ...this.getDefaultParams(), ...options };
      
      // 构建硅基流动 API请求
      const requestBody = {
        model: this.config.model,
        prompt: params.prompt,
        n: params.num_images || 1,
        size: sizeString,
        quality: "standard",
        response_format: "url"
      };

      console.log('🔍 硅基流动请求参数:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ${this.name} API错误:`, response.status, errorText);
        throw new Error(`${this.name} API错误: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🔍 硅基流动完整响应:', JSON.stringify(result, null, 2));

      // 解析响应，提取图片URL
      const imageUrl = result.data?.[0]?.url;

      if (!imageUrl) {
        console.error('❌ 无法从响应中提取图片URL:', result);
        throw new Error('未找到生成的图片URL');
      }

      const processingTime = Date.now() - startTime;
      
      console.log(`✅ ${this.name} 生成成功:`, imageUrl);

      return {
        success: true,
        data: {
          images: [{
            url: imageUrl,
            width: dimensions.width,
            height: dimensions.height,
            metadata: {
              model: this.config.model,
              steps: params.num_inference_steps,
              guidance_scale: params.guidance_scale
            }
          }],
          metadata: {
            provider: this.name,
            model: this.config.model,
            processing_time: processingTime
          }
        },
        metrics: {
          request_time: processingTime
        }
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ ${this.name} 生成失败:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "图片生成失败",
        metrics: {
          request_time: processingTime
        }
      };
    }
  }
}
