import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const tag = searchParams.get('tag');
    const popular = searchParams.get('popular');

    const dataStore = new DataStore();
    let wallpapers;

    if (query) {
      wallpapers = await dataStore.searchWallpapers(query);
    } else if (tag) {
      wallpapers = await dataStore.getWallpapersByTag(tag);
    } else if (popular) {
      wallpapers = await dataStore.getPopularWallpapers(20);
    } else {
      wallpapers = await dataStore.getAllWallpapers();
    }

    return NextResponse.json({
      success: true,
      wallpapers,
      total: wallpapers.length,
    });

  } catch (error) {
    console.error('获取壁纸列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取壁纸列表失败' },
      { status: 500 }
    );
  }
}
