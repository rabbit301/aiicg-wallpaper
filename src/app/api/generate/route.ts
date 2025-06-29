import { NextRequest, NextResponse } from 'next/server';
import { generateImage, SCREEN_PRESETS, ScreenPreset } from '@/lib/fal-client';
import { DataStore } from '@/lib/data-store';
import { Wallpaper } from '@/types';
import { nanoid } from 'nanoid';
import { translatePrompt, enhanceEnglishPrompt } from '@/lib/prompt-translator';

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

    // ⏱️ 翻译阶段计时
    const translationStartTime = Date.now();
    console.log('🌏 开始翻译阶段...');
    
    // 翻译提示词
    const translationResult = await translatePrompt(prompt);
    console.log('🌏 翻译结果:', translationResult);
    
    // 增强英文提示词质量
    const enhancedPrompt = enhanceEnglishPrompt(translationResult.translated);
    console.log('✨ 增强后的提示词:', enhancedPrompt);

    const translationTime = Date.now() - translationStartTime;
    console.log(`⏱️ 翻译耗时: ${translationTime}ms`);

    // 获取屏幕配置
    const screenConfig = SCREEN_PRESETS[preset as ScreenPreset] || SCREEN_PRESETS.desktop_fhd;
    console.log('📱 选择的屏幕配置:', screenConfig);

    // ⏱️ AI生成阶段计时
    const aiGenerationStartTime = Date.now();
    console.log('🚀 开始AI生成阶段...');
    console.log('📝 发送到FAL.AI的最终提示词:', enhancedPrompt);
    console.log('📐 图片尺寸:', screenConfig.image_size);
    console.log('📏 具体分辨率:', `${screenConfig.width}x${screenConfig.height}`);

    // 调用fal.ai生成图片
    const result = await generateImage({
      prompt: enhancedPrompt,
      image_size: screenConfig.image_size,
      num_inference_steps: 4,
      enable_safety_checker: true,
    });

    const aiGenerationTime = Date.now() - aiGenerationStartTime;
    console.log(`⏱️ AI生成耗时: ${aiGenerationTime}ms`);

    const totalTime = translationTime + aiGenerationTime;
    console.log(`⏱️ 总耗时: ${totalTime}ms (翻译: ${translationTime}ms + AI生成: ${aiGenerationTime}ms)`);

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

    // 处理生成结果
    const imageData = result.data as any;
    const imageUrl = imageData.images?.[0]?.url;
    
    if (!imageUrl) {
      console.error('❌ 未获取到图片URL');
      return NextResponse.json(
        { 
          success: false,
          error: '未获取到生成的图片'
        },
        { status: 500 }
      );
    }

    // 保存壁纸信息
    const dataStore = new DataStore();
    const wallpaper: Wallpaper = {
      id: nanoid(),
      title: title || '未命名壁纸',
      prompt: prompt,
      imageUrl: imageUrl,
      thumbnailUrl: imageUrl, // 使用相同URL作为缩略图
      width: imageData.images?.[0]?.width || screenConfig.width,
      height: imageData.images?.[0]?.height || screenConfig.height,
      format: 'webp',
      createdAt: new Date().toISOString(),
      downloads: 0,
      tags: ['AI生成', preset],
      optimizedFor360: preset.startsWith('360_')
    };

    await dataStore.saveWallpaper(wallpaper);

    // 在返回结果中包含详细时间信息和翻译信息
    const response = {
      success: true,
      wallpaper,
      timing: {
        translationTime,
        aiGenerationTime,
        totalTime
      },
      translationInfo: {
        originalPrompt: translationResult.original,
        translatedPrompt: translationResult.translated,
        enhancedPrompt: enhancedPrompt,
        hasTranslation: translationResult.hasTranslation
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
