import { NextResponse } from 'next/server';
import { userStore } from '@/lib/user-store';
import { DataStore } from '@/lib/data-store';

const dataStore = new DataStore();

export async function GET() {
  try {
    const favorites = await userStore.getUserFavorites();
    const wallpapers = [];
    
    // 获取收藏的壁纸详细信息
    for (const favoriteId of favorites) {
      const wallpaper = await dataStore.getWallpaperById(favoriteId);
      if (wallpaper) {
        wallpapers.push(wallpaper);
      }
    }
    
    return NextResponse.json(wallpapers);
  } catch (error) {
    console.error('获取用户收藏失败:', error);
    return NextResponse.json({ error: '获取用户收藏失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { wallpaperId } = await request.json();
    const isAdded = await userStore.toggleFavorite(wallpaperId);
    return NextResponse.json({ 
      success: true, 
      isAdded, 
      message: isAdded ? '已添加到收藏' : '已从收藏中移除' 
    });
  } catch (error) {
    console.error('切换收藏状态失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
} 