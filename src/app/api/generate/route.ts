import { NextRequest, NextResponse } from 'next/server';
import { generateImage, SCREEN_PRESETS, ScreenPreset } from '@/lib/image-generation/service';
import { DataStore } from '@/lib/data-store';
import { userStore } from '@/lib/user-store';
import { Wallpaper } from '@/types';
import { nanoid } from 'nanoid';
import { storeWallpaper } from '@/lib/image-storage';
import { promptCacheManager } from '@/lib/prompt-cache';

// 使用通用的图像生成类型
import { ImageGenerationResponse } from '@/lib/image-generation/types';

export async function POST(request: NextRequest) {
  try {
    const { prompt, title, preset } = await request.json();
    
    console.log('🎯 生成API接收到的参数:');
    console.log('📝 原始提示词:', prompt);
    console.log('📐 预设:', preset);
    console.log('🏷️ 标题:', title);
    
    if (!prompt) {
      return NextResponse.json(
        { error: '提示词不能为空' },
        { status: 400 }
      );
    }

    // ⏱️ 提示词处理阶段计时（使用缓存优化）
    const processingStartTime = Date.now();
    console.log('🚀 开始提示词处理阶段（支持缓存）...');

    // 使用缓存管理器处理提示词
    const promptResult = await promptCacheManager.getOrProcessPrompt(prompt, 'zh-CN');
    console.log('📝 提示词处理结果:', {
      original: promptResult.original.substring(0, 50) + '...',
      translated: promptResult.translated.substring(0, 50) + '...',
      enhanced: promptResult.enhanced.substring(0, 50) + '...',
      fromCache: promptResult.fromCache
    });

    const processingTime = Date.now() - processingStartTime;
    console.log(`⏱️ 提示词处理耗时: ${processingTime}ms ${promptResult.fromCache ? '(缓存命中)' : '(新处理)'}`);

    const enhancedPrompt = promptResult.enhanced;

    // 获取屏幕配置
    const screenConfig = SCREEN_PRESETS[preset as ScreenPreset] || SCREEN_PRESETS.desktop_fhd;
    console.log('📱 选择的屏幕配置:', screenConfig);

    // ⏱️ AI生成阶段计时
    const aiGenerationStartTime = Date.now();
    console.log('🚀 开始AI生成阶段...');
    console.log('📝 最终提示词:', enhancedPrompt);
    console.log('📐 图片尺寸:', screenConfig.image_size);
    console.log('📏 具体分辨率:', `${screenConfig.width}x${screenConfig.height}`);

    // 调用通用图像生成服务（自动选择最佳提供商）
    const result = await generateImage({
      prompt: enhancedPrompt,
      image_size: screenConfig.image_size,
      num_inference_steps: 20,
      guidance_scale: 7.5,
      enable_safety_checker: true,
    });

    const aiGenerationTime = Date.now() - aiGenerationStartTime;
    console.log(`⏱️ AI生成耗时: ${aiGenerationTime}ms`);

    if (!result.success || !result.data) {
      console.error('❌ AI生成失败:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'AI生成失败'
        },
        { status: 500 }
      );
    }

    console.log('✅ AI生成成功:', result.data);
    console.log(`🔧 使用的提供商: ${result.data.metadata?.provider}`);
    if (result.data.metadata?.is_fallback) {
      console.log('⚠️ 使用了备用提供商');
    }

    // 处理生成结果
    const imageData = result.data as ImageGenerationResponse;
    const originalImageUrl = imageData.images?.[0]?.url;

    if (!originalImageUrl) {
      console.error('❌ 未获取到图片URL');
      return NextResponse.json(
        {
          success: false,
          error: '未获取到生成的图片'
        },
        { status: 500 }
      );
    }

    console.log('📁 开始转存图片到稳定存储...');
    const storageStartTime = Date.now();

    // 转存图片到稳定存储（OSS/Cloudinary/本地）
    const wallpaperId = nanoid();
    const storageResult = await storeWallpaper(originalImageUrl, `wallpaper_${wallpaperId}`);

    const storageTime = Date.now() - storageStartTime;
    console.log(`📁 图片转存耗时: ${storageTime}ms`);

    // 必须转存成功才能继续，否则返回错误
    if (!storageResult.success) {
      console.error('❌ 图片转存失败，无法继续:', storageResult.error);
      return NextResponse.json({
        success: false,
        error: '图片存储失败，请稍后重试',
        details: storageResult.error
      }, { status: 500 });
    }

    const imageUrl = storageResult.originalUrl!;
    const thumbnailUrl = storageResult.thumbnailUrl!;
    console.log('✅ 图片转存成功:', imageUrl);

    // 保存壁纸信息
    const dataStore = new DataStore();
    const wallpaper: Wallpaper = {
      id: wallpaperId,
      title: title || '未命名壁纸',
      prompt: prompt,
      imageUrl: imageUrl,
      thumbnailUrl: thumbnailUrl,
      width: storageResult.metadata?.width || imageData.images?.[0]?.width || screenConfig.width,
      height: storageResult.metadata?.height || imageData.images?.[0]?.height || screenConfig.height,
      format: (storageResult.metadata?.format || 'webp') as 'png' | 'jpg' | 'webp' | 'gif',
      createdAt: new Date().toISOString(),
      downloads: 0,
      tags: ['AI生成', preset],
      optimizedFor360: preset.startsWith('360_')
    };

    await dataStore.saveWallpaper(wallpaper);

    // 记录用户活动
    await userStore.addUserActivity({
      type: 'generate',
      title: wallpaper.title,
      details: {
        preset,
        originalPrompt: prompt,
        enhancedPrompt,
        imageSize: `${wallpaper.width}x${wallpaper.height}`
      }
    });

    // 计算总耗时
    const totalTime = processingTime + aiGenerationTime + storageTime;

    // 在返回结果中包含详细时间信息和翻译信息
    const response = {
      success: true,
      wallpaper,
      timing: {
        processingTime,
        aiGenerationTime,
        storageTime,
        totalTime
      },
      promptInfo: {
        originalPrompt: promptResult.original,
        translatedPrompt: promptResult.translated,
        enhancedPrompt: promptResult.enhanced,
        fromCache: promptResult.fromCache
      }
    };

    console.log('✅ 响应数据准备完成');
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 生成失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '生成失败，请稍后重试',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
