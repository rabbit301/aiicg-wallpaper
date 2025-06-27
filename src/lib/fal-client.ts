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
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: options.prompt,
        image_size: options.image_size || "landscape_4_3",
        num_inference_steps: options.num_inference_steps || 4,
        num_images: options.num_images || 1,
        enable_safety_checker: options.enable_safety_checker !== false,
      },
    });

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

// 360水冷屏幕优化的预设尺寸
export const SCREEN_PRESETS = {
  "360_square_480p": { width: 480, height: 480, image_size: "square" as const },
  "360_square_640p": { width: 640, height: 640, image_size: "square_hd" as const },
  "360_landscape": { width: 640, height: 480, image_size: "landscape_4_3" as const },
} as const;

export type ScreenPreset = keyof typeof SCREEN_PRESETS;
