import * as fal from "@fal-ai/serverless-client";

// 配置fal.ai客户端
fal.config({
  credentials: process.env.FAL_KEY,
});

export interface FalImageGenerationOptions {
  prompt: string;
  image_size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
  num_inference_steps?: number;
  guidance_scale?: number;
  num_images?: number;
  enable_safety_checker?: boolean;
}

export async function generateImage(options: FalImageGenerationOptions) {
  try {
    console.log('🔥 FAL.AI 实际调用参数:');
    console.log('  📝 原始提示词:', options.prompt);
    console.log('  📐 图片尺寸:', options.image_size || "landscape_4_3");
    console.log('  ⚙️ 推理步数:', options.num_inference_steps || 4);
    
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: options.prompt,
        image_size: options.image_size || "landscape_4_3",
        num_inference_steps: options.num_inference_steps || 4,
        num_images: options.num_images || 1,
        enable_safety_checker: options.enable_safety_checker !== false,
      },
    });

    console.log('🎯 FAL.AI 返回结果:', result);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("fal.ai生图失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "生图失败",
    };
  }
}

// 壁纸尺寸预设
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
