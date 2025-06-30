import { NextRequest, NextResponse } from 'next/server';
import { CompressionServiceFactory } from '@/lib/compression-service';

import { FreeCompressionService } from '@/lib/free-compression';
import { userStore } from '@/lib/user-store';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    // 转换文件为Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 直接使用普通压缩算法（暂时屏蔽AI压缩）
    const freeService = new FreeCompressionService();
    const compressionOptions = {
      quality: parseInt(formData.get('quality') as string) || undefined,
      width: parseInt(formData.get('width') as string) || undefined,
      height: parseInt(formData.get('height') as string) || undefined,
      format: formData.get('format') as 'webp' | 'jpeg' | 'png' || undefined,
      cropToCircle: formData.get('cropToCircle') === 'true',
      preserveAspectRatio: false, // 水冷屏幕需要精确尺寸
    };
    
    console.log('使用普通压缩算法，参数:', compressionOptions);
    
    const result = await freeService.compressImage(buffer, file.name, compressionOptions);
    
    if (result.success) {
      // 记录用户活动
      await userStore.addUserActivity({
        type: 'compress',
        title: `压缩图片: ${file.name}`,
        details: {
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          format: result.format,
          processingTime: result.processingTime
        }
      });
      
      return NextResponse.json(result);
    } else {
      throw new Error(result.error || '压缩失败');
    }
  } catch (error) {
    console.error('压缩失败:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '压缩失败' 
    }, { status: 500 });
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
        } catch {
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


