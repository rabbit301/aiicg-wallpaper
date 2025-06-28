import { NextRequest, NextResponse } from 'next/server';
import { generateImage, SCREEN_PRESETS, ScreenPreset } from '@/lib/fal-client';
import { ImageProcessor } from '@/lib/image-processor';
import { DataStore } from '@/lib/data-store';
import { Wallpaper } from '@/types';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, preset = '360_square_640p', title } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: '请输入生图提示词' },
        { status: 400 }
      );
    }

    // 获取预设配置
    const screenConfig = SCREEN_PRESETS[preset as ScreenPreset];
    if (!screenConfig) {
      return NextResponse.json(
        { success: false, error: '无效的屏幕预设' },
        { status: 400 }
      );
    }

    // 调用fal.ai生成图片
    const result = await generateImage({
      prompt,
      image_size: screenConfig.image_size,
      num_inference_steps: 4,
      guidance_scale: 7.5,
      num_images: 1,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || '生图失败' },
        { status: 500 }
      );
    }

    // 获取生成的图片URL
    const imageUrl = (result.data as any)?.images?.[0]?.url;
    
    // 处理图片
    const imageProcessor = new ImageProcessor();
    const processedImages = await imageProcessor.downloadAndProcess(
      imageUrl,
      `generated_${Date.now()}`,
      {
        width: screenConfig.width,
        height: screenConfig.height,
        format: 'webp',
        quality: 85,
        optimize360: true,
      }
    );

    // 保存到数据库
    const wallpaper: Wallpaper = {
      id: nanoid(),
      title: title || `AI生成壁纸 - ${prompt.slice(0, 20)}...`,
      prompt,
      imageUrl: processedImages.originalPath,
      thumbnailUrl: processedImages.thumbnailPath,
      width: screenConfig.width,
      height: screenConfig.height,
      format: 'webp',
      createdAt: new Date().toISOString(),
      downloads: 0,
      tags: ['AI生成', preset.replace('_', ' ')],
      optimizedFor360: true,
    };

    const dataStore = new DataStore();
    await dataStore.saveWallpaper(wallpaper);

    return NextResponse.json({
      success: true,
      wallpaper,
    });

  } catch (error) {
    console.error('生成壁纸失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
