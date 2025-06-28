import { NextRequest, NextResponse } from 'next/server';
import { CompressionServiceFactory } from '@/lib/compression-service';
import { validateImageFile, getPresetOptions, mergeCompressionOptions } from '@/lib/compression-utils';
import type { CompressionPreset } from '@/lib/compression-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const version = formData.get('version') as 'free' | 'ai' || 'free';
    const preset = formData.get('preset') as CompressionPreset || 'balanced';
    const customOptions = formData.get('options');
    
    // 验证文件
    if (!file) {
      return NextResponse.json(
        { success: false, error: '请选择要压缩的图片文件' },
        { status: 400 }
      );
    }
    
    // 检查AI版本权限
    if (version === 'ai') {
      const hasAIAccess = await checkAIAccess(request);
      if (!hasAIAccess) {
        return NextResponse.json(
          { success: false, error: 'AI压缩功能需要付费订阅' },
          { status: 403 }
        );
      }
    }
    
    // 转换文件为Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 验证图片文件
    const validation = validateImageFile(buffer);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // 获取压缩选项
    let options = getPresetOptions(preset);
    
    // 合并自定义选项
    if (customOptions) {
      try {
        const parsed = JSON.parse(customOptions as string);
        options = mergeCompressionOptions(options, parsed);

        // 圆形屏幕特殊处理
        if (parsed.cropToCircle) {
          options.smartCrop = true; // AI版启用智能裁剪
          options.cropToCircle = true; // 标记为圆形裁剪
          options.waterCoolingOptimization = true; // 启用水冷优化
        }
      } catch (error) {
        console.warn('解析自定义选项失败:', error);
      }
    }

    // 水冷屏幕优化
    if (preset === 'water_cooling_360' || preset === 'water_cooling_round') {
      options.waterCoolingOptimization = true;
    }

    // 创建压缩服务
    const compressionService = await CompressionServiceFactory.createService(version);

    // 检查AI版本是否可用
    if (version === 'ai') {
      const aiService = compressionService as any;
      if (aiService.isAvailable && !aiService.isAvailable()) {
        return NextResponse.json(
          {
            success: false,
            error: 'AI压缩服务暂时不可用，请检查Cloudinary API配置或使用免费版压缩'
          },
          { status: 503 }
        );
      }
    }

    // 执行压缩
    const result = await compressionService.compressImage(
      buffer,
      file.name,
      options
    );
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    
    // 记录使用统计（AI版本）
    if (version === 'ai') {
      await recordAIUsage(request, result);
    }
    
    return NextResponse.json({
      success: true,
      result: {
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
        outputUrl: result.outputUrl,
        format: result.format,
        width: result.width,
        height: result.height,
        processingTime: result.processingTime,
        version,
        preset,
      },
    });
    
  } catch (error) {
    console.error('压缩失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version') as 'free' | 'ai' || 'free';
    
    // 获取压缩服务统计
    const compressionService = await CompressionServiceFactory.createService(version);
    const stats = compressionService.getStats();
    
    let additionalInfo = {};
    
    // AI版本额外信息
    if (version === 'ai') {
      const aiService = compressionService as any;
      if (aiService.isAvailable && aiService.isAvailable()) {
        try {
          const usageStats = await aiService.getUsageStats();
          additionalInfo = {
            cloudinaryUsage: usageStats,
            isAIAvailable: true,
          };
        } catch (error) {
          additionalInfo = {
            isAIAvailable: false,
            error: 'AI服务暂时不可用',
          };
        }
      } else {
        additionalInfo = {
          isAIAvailable: false,
          error: 'AI服务未配置',
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      stats,
      version,
      ...additionalInfo,
    });
    
  } catch (error) {
    console.error('获取统计信息失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计信息失败' },
      { status: 500 }
    );
  }
}

/**
 * 检查AI访问权限（简化版本，实际应该连接用户系统）
 */
async function checkAIAccess(request: NextRequest): Promise<boolean> {
  // 这里应该检查用户的订阅状态
  // 目前简化为检查特定header或cookie
  
  const authHeader = request.headers.get('authorization');
  const aiAccessToken = request.cookies.get('ai_access_token');
  
  // 简化的权限检查
  if (authHeader?.includes('Bearer ai_premium_') || aiAccessToken?.value) {
    return true;
  }
  
  // 开发环境允许测试
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return false;
}

/**
 * 记录AI使用统计
 */
async function recordAIUsage(request: NextRequest, result: any): Promise<void> {
  try {
    // 这里应该记录到数据库或分析服务
    const usage = {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionRatio: result.compressionRatio,
      processingTime: result.processingTime,
      format: result.format,
    };
    
    console.log('AI压缩使用记录:', usage);
    
    // TODO: 保存到数据库
    
  } catch (error) {
    console.error('记录AI使用统计失败:', error);
  }
}
