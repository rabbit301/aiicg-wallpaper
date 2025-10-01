/**
 * FastGPT Flux.1 dev 图像生成客户端
 * 替换原有的fal.ai客户端
 */

export interface FastGPTImageGenerationOptions {
  prompt: string;
  image_size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  num_inference_steps?: number;
  guidance_scale?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
}

export interface FastGPTImageResult {
  url: string;
  width: number;
  height: number;
}

export interface FastGPTResponse {
  images: FastGPTImageResult[];
}

// FastGPT API配置
const FASTGPT_CONFIG = {
  apiUrl: 'https://api.fastgpt.in/api/v1/chat/completions',
  apiKey: 'fastgpt-xwRC0Ea1FFFFGR0xJZjhz0zTyGXuwJdbzhDt31igWvyYsLkWf1qZzhjXICt5',
  model: 'Flux.1 dev'
};

// 图片尺寸映射到具体像素
const IMAGE_SIZE_MAP = {
  "square": { width: 512, height: 512 },
  "square_hd": { width: 1024, height: 1024 },
  "portrait_4_3": { width: 768, height: 1024 },
  "portrait_16_9": { width: 576, height: 1024 },
  "landscape_4_3": { width: 1024, height: 768 },
  "landscape_16_9": { width: 1024, height: 576 }
};

export async function generateImage(options: FastGPTImageGenerationOptions) {
  try {
    console.log('🚀 FastGPT Flux.1 dev 实际调用参数:');
    console.log('  📝 提示词:', options.prompt);
    console.log('  📐 图片尺寸:', options.image_size || "landscape_4_3");
    console.log('  ⚙️ 推理步数:', options.num_inference_steps || 20);
    
    const imageSize = options.image_size || "landscape_4_3";
    const dimensions = IMAGE_SIZE_MAP[imageSize];
    
    // 构建FastGPT API请求
    const requestBody = {
      model: FASTGPT_CONFIG.model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate a high-quality image with the following description: ${options.prompt}. 
              Image specifications:
              - Resolution: ${dimensions.width}x${dimensions.height}
              - Style: Professional, detailed, high-resolution
              - Quality: Best quality, masterpiece
              - Steps: ${options.num_inference_steps || 20}`
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      // FastGPT特定参数
      image_generation: {
        width: dimensions.width,
        height: dimensions.height,
        steps: options.num_inference_steps || 20,
        guidance_scale: options.guidance_scale || 7.5,
        num_images: options.num_images || 1,
        safety_checker: options.enable_safety_checker !== false
      }
    };

    console.log('📤 发送到FastGPT的请求体:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(FASTGPT_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FASTGPT_CONFIG.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FastGPT API错误:', response.status, errorText);
      throw new Error(`FastGPT API错误: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('🎯 FastGPT 返回结果:', result);

    // 解析FastGPT响应格式
    let imageUrl: string | null = null;
    
    // 尝试从不同可能的响应格式中提取图片URL
    if (result.choices && result.choices[0]) {
      const choice = result.choices[0];
      
      // 检查message content中的图片
      if (choice.message && choice.message.content) {
        // 如果content是数组格式
        if (Array.isArray(choice.message.content)) {
          for (const item of choice.message.content) {
            if (item.type === 'image_url' && item.image_url) {
              imageUrl = item.image_url.url || item.image_url;
              break;
            }
          }
        }
        // 如果content是字符串，尝试提取URL
        else if (typeof choice.message.content === 'string') {
          const urlMatch = choice.message.content.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            imageUrl = urlMatch[0];
          }
        }
      }
    }

    // 如果没有找到图片URL，检查其他可能的字段
    if (!imageUrl && result.data && Array.isArray(result.data)) {
      for (const item of result.data) {
        if (item.url) {
          imageUrl = item.url;
          break;
        }
      }
    }

    if (!imageUrl) {
      console.error('❌ 未找到生成的图片URL');
      throw new Error('未找到生成的图片URL');
    }

    // 构建兼容的响应格式
    const compatibleResponse: FastGPTResponse = {
      images: [{
        url: imageUrl,
        width: dimensions.width,
        height: dimensions.height
      }]
    };

    console.log('✅ FastGPT图片生成成功:', compatibleResponse);

    return {
      success: true,
      data: compatibleResponse,
    };
  } catch (error) {
    console.error("FastGPT图片生成失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "图片生成失败",
    };
  }
}

// 壁纸尺寸预设（保持与原有兼容）
export const SCREEN_PRESETS = {
  // 360水冷屏幕优化
  "360_square_480p": { width: 480, height: 480, image_size: "square" as const, category: "360_screen", name: "标准方形" },
  "360_square_640p": { width: 640, height: 640, image_size: "square_hd" as const, category: "360_screen", name: "高清方形" },
  "360_landscape": { width: 640, height: 480, image_size: "landscape_4_3" as const, category: "360_screen", name: "横屏显示" },
  
  // 手机壁纸
  "mobile_portrait": { width: 1080, height: 1920, image_size: "portrait_16_9" as const, category: "mobile", name: "手机竖屏" },
  "mobile_4_3": { width: 1080, height: 1440, image_size: "portrait_4_3" as const, category: "mobile", name: "手机4:3" },
  
  // 桌面壁纸
  "desktop_fhd": { width: 1920, height: 1080, image_size: "landscape_16_9" as const, category: "desktop", name: "桌面FHD" },
  "desktop_4k": { width: 3840, height: 2160, image_size: "landscape_16_9" as const, category: "desktop", name: "桌面4K" },
  "desktop_ultrawide": { width: 2560, height: 1080, image_size: "landscape_16_9" as const, category: "desktop", name: "超宽屏" },
  
  // 平板壁纸
  "tablet_landscape": { width: 1366, height: 1024, image_size: "landscape_4_3" as const, category: "tablet", name: "平板横屏" },
  "tablet_portrait": { width: 1024, height: 1366, image_size: "portrait_4_3" as const, category: "tablet", name: "平板竖屏" },
} as const;

export type ScreenPreset = keyof typeof SCREEN_PRESETS;
