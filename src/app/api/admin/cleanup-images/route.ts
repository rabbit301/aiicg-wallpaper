import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-store';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 开始清理无效图片链接...');
    
    const dataStore = new DataStore();
    await dataStore.cleanupInvalidImages();
    
    // 获取清理后的统计信息
    const stats = await dataStore.getStats();
    
    return NextResponse.json({
      success: true,
      message: '图片链接清理完成',
      stats
    });

  } catch (error) {
    console.error('清理图片链接失败:', error);
    return NextResponse.json(
      { success: false, error: '清理图片链接失败' },
      { status: 500 }
    );
  }
}
