import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const FOLDERS_DIR = path.join(process.cwd(), 'public', 'wallpapers');
const WALLPAPERS_META_FILE = path.join(process.cwd(), 'data', 'wallpapers.json');

// 读取壁纸元数据
async function readWallpapersMeta() {
  try {
    const data = await fs.readFile(WALLPAPERS_META_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// GET - 获取文件夹下的所有壁纸
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const wallpapers = await readWallpapersMeta();

    // 筛选属于该文件夹的壁纸
    const folderWallpapers = wallpapers.filter(
      (w: any) => w.folderId === id
    );

    // 按创建时间倒序排序
    folderWallpapers.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      data: {
        wallpapers: folderWallpapers,
        total: folderWallpapers.length,
      },
    });
  } catch (error: any) {
    console.error('获取壁纸列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '获取壁纸列表失败',
      },
      { status: 500 }
    );
  }
}
