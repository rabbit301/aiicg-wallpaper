import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-store';
import { userStore } from '@/lib/user-store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const dataStore = new DataStore();
    const wallpaper = await dataStore.getWallpaperById(id);
    
    if (!wallpaper) {
      return NextResponse.json(
        { success: false, error: '壁纸不存在' },
        { status: 404 }
      );
    }

    // 更新下载次数
    await dataStore.updateWallpaperDownloads(id);

    // 记录用户活动
    await userStore.addUserActivity({
      type: 'download',
      title: wallpaper.title,
      details: {
        wallpaperId: id,
        imageSize: `${wallpaper.width}x${wallpaper.height}`,
        format: wallpaper.format
      }
    });

    return NextResponse.json({
      success: true,
      downloadUrl: wallpaper.imageUrl,
    });

  } catch (error) {
    console.error('处理下载失败:', error);
    return NextResponse.json(
      { success: false, error: '下载失败' },
      { status: 500 }
    );
  }
}
