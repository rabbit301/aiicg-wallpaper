import { NextRequest, NextResponse } from 'next/server';
import { WallpaperManager, saveUnifiedWallpaperData } from '@/lib/wallpaper-manager';

export async function POST(request: NextRequest) {
  try {
    // 从环境变量获取API密钥
    const apiKeys = {
      giphy: process.env.GIPHY_API_KEY,
      unsplash: process.env.UNSPLASH_API_KEY,
      pexels: process.env.PEXELS_API_KEY,
    };

    console.log('开始爬取壁纸内容...');
    console.log('可用的API密钥:', Object.entries(apiKeys).filter(([_, key]) => !!key).map(([name]) => name));

    // 创建壁纸管理器
    const manager = new WallpaperManager({
      unsplash: apiKeys.unsplash,
      pexels: apiKeys.pexels,
    });

    // 爬取所有来源的壁纸
    const { wallpapers, stats } = await manager.scrapeAllWallpapers();

    console.log('爬取完成，统计信息:', stats);

    // 保存到本地文件
    const filePath = await saveUnifiedWallpaperData(wallpapers);

    // 计算总数
    const totalImages = Object.values(wallpapers).reduce((sum, images) => sum + images.length, 0);

    // 生成分类统计
    const categoryStats = Object.entries(wallpapers).map(([category, images]) => ({
      category,
      count: images.length
    }));

    return NextResponse.json({
      success: true,
      message: '爬取完成',
      stats: categoryStats,
      detailedStats: stats,
      filePath,
      totalImages,
      sources: Object.entries(apiKeys).filter(([_, key]) => !!key).map(([name]) => name)
    });

  } catch (error) {
    console.error('爬取失败:', error);
    return NextResponse.json(
      { error: '爬取失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: '使用POST方法开始爬取Giphy内容',
    example: {
      method: 'POST',
      url: '/api/scrape-giphy',
      description: '开始爬取Giphy图片内容，包含头像、壁纸、动画、直播等分类'
    }
  });
}
