import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 读取壁纸数据
    const dataPath = path.join(process.cwd(), 'data', 'wallpapers.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const wallpapers = JSON.parse(fileContent);
    
    // 查找指定ID的壁纸
    const wallpaper = wallpapers.find((w: any) => w.id === id);
    
    if (!wallpaper) {
      return NextResponse.json(
        { success: false, error: '壁纸不存在' },
        { status: 404 }
      );
    }
    
    // 增加浏览量（模拟）
    wallpaper.views = (wallpaper.views || 0) + 1;
    
    return NextResponse.json({
      success: true,
      wallpaper
    });
    
  } catch (error) {
    console.error('获取壁纸详情失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}
