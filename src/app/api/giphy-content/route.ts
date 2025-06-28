import { NextRequest, NextResponse } from 'next/server';
import { loadUnifiedWallpaperData } from '@/lib/wallpaper-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // 加载数据
    const data = await loadUnifiedWallpaperData();

    if (!data) {
      return NextResponse.json(
        { error: '未找到壁纸内容数据，请先运行爬虫' },
        { status: 404 }
      );
    }
    
    if (category && category !== 'all') {
      // 返回特定分类
      const categoryData = data[category] || [];
      const paginatedData = categoryData.slice(offset, offset + limit);
      
      return NextResponse.json({
        success: true,
        category,
        data: paginatedData,
        total: categoryData.length,
        offset,
        limit,
        hasMore: offset + limit < categoryData.length
      });
    } else {
      // 返回所有分类的概览
      const overview = Object.entries(data).map(([cat, images]) => ({
        category: cat,
        count: images.length,
        preview: images.slice(0, 6) // 每个分类预览6张图片
      }));
      
      return NextResponse.json({
        success: true,
        overview,
        totalCategories: Object.keys(data).length,
        totalImages: Object.values(data).reduce((sum, images) => sum + images.length, 0)
      });
    }
    
  } catch (error) {
    console.error('获取Giphy内容失败:', error);
    return NextResponse.json(
      { error: '获取内容失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
