/**
 * 通用图像生成服务类型定义
 * 支持多种AI图像生成API的统一接口
 */

// 图像尺寸预设
export type ImageSize = 
  | "square" 
  | "square_hd" 
  | "portrait_4_3" 
  | "portrait_16_9" 
  | "landscape_4_3" 
  | "landscape_16_9";

// 图像生成选项
export interface ImageGenerationOptions {
  prompt: string;
  image_size?: ImageSize;
  num_inference_steps?: number;
  guidance_scale?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
  // 扩展参数，不同API可能有不同的参数
  extra_params?: Record<string, any>;
}

// 生成的图像结果
export interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  // 可选的元数据
  metadata?: {
    seed?: number;
    model?: string;
    steps?: number;
    guidance_scale?: number;
  };
}

// 图像生成响应
export interface ImageGenerationResponse {
  images: GeneratedImage[];
  // API特定的元数据
  metadata?: {
    provider: string;
    model: string;
    cost?: number;
    processing_time?: number;
    is_fallback?: boolean;
  };
}

// 图像生成结果
export interface ImageGenerationResult {
  success: boolean;
  data?: ImageGenerationResponse;
  error?: string;
  // 性能指标
  metrics?: {
    request_time: number;
    processing_time?: number;
    queue_time?: number;
  };
}

// 图像生成服务提供商接口
export interface ImageGenerationProvider {
  // 提供商名称
  name: string;
  
  // 是否可用
  isAvailable(): Promise<boolean>;
  
  // 生成图像
  generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult>;
  
  // 获取支持的图像尺寸
  getSupportedSizes(): ImageSize[];
  
  // 获取默认参数
  getDefaultParams(): Partial<ImageGenerationOptions>;
  
  // 健康检查
  healthCheck(): Promise<boolean>;
}

// 图像尺寸映射
export const IMAGE_SIZE_DIMENSIONS = {
  "square": { width: 512, height: 512 },
  "square_hd": { width: 1024, height: 1024 },
  "portrait_4_3": { width: 768, height: 1024 },
  "portrait_16_9": { width: 576, height: 1024 },
  "landscape_4_3": { width: 1024, height: 768 },
  "landscape_16_9": { width: 1024, height: 576 }
} as const;

// 壁纸尺寸预设（保持向后兼容）
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
