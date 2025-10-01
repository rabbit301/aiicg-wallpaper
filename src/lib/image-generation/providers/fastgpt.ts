/**
 * FastGPT Flux.1 dev 图像生成适配器
 */

import { 
  ImageGenerationProvider, 
  ImageGenerationOptions, 
  ImageGenerationResult,
  ImageSize,
  IMAGE_SIZE_DIMENSIONS 
} from '../types';

export class FastGPTProvider implements ImageGenerationProvider {
  name = 'FastGPT';
  
  private config = {
    apiUrl: process.env.FASTGPT_API_URL || 'https://api.fastgpt.in/api/v1/chat/completions',
    apiKey: process.env.FASTGPT_API_KEY || '',
    model: process.env.FASTGPT_MODEL || 'Flux.1 dev'
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
          messages: [{ role: "user", content: "test" }],
          max_tokens: 1
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
      num_inference_steps: 20,
      guidance_scale: 7.5,
      num_images: 1,
      enable_safety_checker: true
    };
  }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 ${this.name} 开始生成图像...`);
      console.log('  📝 提示词:', options.prompt);
      console.log('  📐 图片尺寸:', options.image_size || "landscape_4_3");
      
      const imageSize = options.image_size || "landscape_4_3";
      const dimensions = IMAGE_SIZE_DIMENSIONS[imageSize];
      
      // 合并默认参数
      const params = { ...this.getDefaultParams(), ...options };
      
      // 构建FastGPT API请求 - 简化格式
      const requestBody = {
        model: this.config.model,
        messages: [
          {
            role: "user",
            content: `Generate a high-quality wallpaper image: ${params.prompt}.
            Style: Professional, detailed, high-resolution wallpaper
            Resolution: ${dimensions.width}x${dimensions.height}
            Quality: Best quality, masterpiece, 8k resolution`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      };

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
        throw new Error(`${this.name} API错误: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🔍 FastGPT完整响应:', JSON.stringify(result, null, 2));

      // 解析响应，提取图片URL
      const imageUrl = this.extractImageUrl(result);

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

  private extractImageUrl(result: any): string | null {
    console.log('🔍 开始解析图片URL...');

    // 方法1: 检查choices格式
    if (result.choices && result.choices[0]) {
      const choice = result.choices[0];
      console.log('📋 检查choices格式:', choice);

      if (choice.message && choice.message.content) {
        // 数组格式
        if (Array.isArray(choice.message.content)) {
          for (const item of choice.message.content) {
            if (item.type === 'image_url' && item.image_url) {
              const url = item.image_url.url || item.image_url;
              console.log('✅ 从choices数组中找到URL:', url);
              return url;
            }
          }
        }
        // 字符串格式，提取URL
        else if (typeof choice.message.content === 'string') {
          const urlMatch = choice.message.content.match(/https?:\/\/[^\s\)]+/);
          if (urlMatch) {
            let url = urlMatch[0];
            // 修复URL编码问题
            url = decodeURIComponent(url);
            console.log('✅ 从choices字符串中提取URL:', url);
            return url;
          }
        }
      }
    }

    // 方法2: 检查data数组格式
    if (result.data && Array.isArray(result.data)) {
      console.log('📋 检查data数组格式:', result.data);
      for (const item of result.data) {
        if (item.url) {
          console.log('✅ 从data数组中找到URL:', item.url);
          return item.url;
        }
      }
    }

    // 方法3: 检查直接的images字段
    if (result.images && Array.isArray(result.images) && result.images[0]?.url) {
      console.log('✅ 从images数组中找到URL:', result.images[0].url);
      return result.images[0].url;
    }

    // 方法4: 检查根级别的url字段
    if (result.url) {
      console.log('✅ 从根级别找到URL:', result.url);
      return result.url;
    }

    // 方法5: 递归搜索所有可能的URL
    const findUrlRecursive = (obj: any): string | null => {
      if (typeof obj === 'string' && obj.match(/^https?:\/\//)) {
        // 修复URL编码问题
        return decodeURIComponent(obj);
      }
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          const found = findUrlRecursive(obj[key]);
          if (found) return found;
        }
      }
      return null;
    };

    const recursiveUrl = findUrlRecursive(result);
    if (recursiveUrl) {
      console.log('✅ 递归搜索找到URL:', recursiveUrl);
      return recursiveUrl;
    }

    console.log('❌ 未找到任何图片URL');
    return null;
  }
}
