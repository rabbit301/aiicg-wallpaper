import { NextResponse } from 'next/server';
import { imageStorage } from '@/lib/image-storage';

/**
 * 获取图片存储服务状态
 */
export async function GET() {
  try {
    const config = imageStorage.getConfig();
    const isHealthy = await imageStorage.checkHealth();
    
    // 隐藏敏感信息
    const safeConfig = {
      provider: config.provider,
      configured: true,
      // 只显示配置是否存在，不显示具体值
      hasCredentials: config.provider === 'cloudinary' 
        ? !!(config.config.cloud_name && config.config.api_key)
        : config.provider === 'oss'
        ? !!(config.config.accessKeyId && config.config.bucket)
        : true
    };

    return NextResponse.json({
      success: true,
      storage: {
        ...safeConfig,
        healthy: isHealthy,
        status: isHealthy ? 'active' : 'error'
      }
    });
  } catch (error) {
    console.error('获取存储状态失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取存储状态失败',
      storage: {
        provider: 'unknown',
        healthy: false,
        status: 'error'
      }
    }, { status: 500 });
  }
}

/**
 * 测试存储服务
 */
export async function POST() {
  try {
    // 使用一个测试图片URL进行存储测试
    const testImageUrl = 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Storage+Test';
    
    const result = await imageStorage.storeImage({
      url: testImageUrl,
      filename: `test_${Date.now()}`,
      folder: 'tests'
    });

    return NextResponse.json({
      success: result.success,
      message: result.success ? '存储测试成功' : '存储测试失败',
      result: result.success ? {
        originalUrl: result.originalUrl,
        thumbnailUrl: result.thumbnailUrl,
        provider: imageStorage.getConfig().provider
      } : {
        error: result.error
      }
    });
  } catch (error) {
    console.error('存储测试失败:', error);
    return NextResponse.json({
      success: false,
      message: '存储测试失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
