import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-store';
import { getUserFromRequest, isSuperAdmin } from '@/lib/auth/middleware';

const dataStore = new DataStore();

/**
 * 验证超级管理员权限
 */
async function validateSuperAdmin(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!isSuperAdmin(user)) {
    return NextResponse.json({
      success: false,
      error: '需要超级管理员权限才能访问此功能'
    }, { status: 403 });
  }

  return null; // 验证通过
}

/**
 * 获取所有壁纸（超级管理员）
 */
export async function GET(request: NextRequest) {
  // 验证超级管理员权限
  const authError = await validateSuperAdmin(request);
  if (authError) return authError;

  try {
    const wallpapers = await dataStore.getAllWallpapers();

    return NextResponse.json({
      success: true,
      wallpapers,
      total: wallpapers.length
    });
  } catch (error) {
    console.error('获取壁纸列表失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取壁纸列表失败'
    }, { status: 500 });
  }
}

/**
 * 删除壁纸（超级管理员）
 */
export async function DELETE(request: NextRequest) {
  // 验证超级管理员权限
  const authError = await validateSuperAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '请提供壁纸ID'
      }, { status: 400 });
    }

    // 获取要删除的壁纸信息
    const wallpaper = await dataStore.getWallpaperById(id);
    if (!wallpaper) {
      return NextResponse.json({
        success: false,
        error: '壁纸不存在'
      }, { status: 404 });
    }

    // 删除壁纸
    const success = await dataStore.deleteWallpaper(id);
    
    if (success) {
      console.log(`✅ 管理员删除壁纸成功: ${id} - ${wallpaper.title}`);
      return NextResponse.json({
        success: true,
        message: `壁纸 "${wallpaper.title}" 删除成功`,
        deletedWallpaper: {
          id: wallpaper.id,
          title: wallpaper.title,
          imageUrl: wallpaper.imageUrl
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '删除壁纸失败'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('删除壁纸失败:', error);
    return NextResponse.json({
      success: false,
      error: '删除壁纸失败'
    }, { status: 500 });
  }
}
