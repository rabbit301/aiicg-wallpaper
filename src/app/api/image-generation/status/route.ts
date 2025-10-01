import { NextResponse } from 'next/server';
import { imageGenerationService } from '@/lib/image-generation/service';

/**
 * 获取图像生成服务状态
 */
export async function GET() {
  try {
    const status = await imageGenerationService.getServiceStatus();
    
    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('获取图像生成服务状态失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取服务状态失败',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * 切换主要提供商
 */
export async function POST(request: Request) {
  try {
    const { provider } = await request.json();
    
    if (!provider) {
      return NextResponse.json({
        success: false,
        error: '请指定提供商名称'
      }, { status: 400 });
    }
    
    const success = imageGenerationService.switchPrimaryProvider(provider);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `主要提供商已切换到: ${provider}`,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `未找到提供商: ${provider}`
      }, { status: 400 });
    }
  } catch (error) {
    console.error('切换提供商失败:', error);
    return NextResponse.json({
      success: false,
      error: '切换提供商失败',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
