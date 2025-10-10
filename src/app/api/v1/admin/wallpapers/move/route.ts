import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const WALLPAPERS_META_FILE = path.join(process.cwd(), 'data', 'wallpapers.json');
const FOLDERS_META_FILE = path.join(process.cwd(), 'data', 'folders.json');
const WALLPAPERS_DIR = path.join(process.cwd(), 'public', 'wallpapers');

// 读取壁纸元数据
async function readWallpapersMeta() {
  try {
    const data = await fs.readFile(WALLPAPERS_META_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 写入壁纸元数据
async function writeWallpapersMeta(wallpapers: any[]) {
  await fs.mkdir(path.dirname(WALLPAPERS_META_FILE), { recursive: true });
  await fs.writeFile(
    WALLPAPERS_META_FILE,
    JSON.stringify(wallpapers, null, 2),
    'utf-8'
  );
}

// 读取文件夹元数据
async function readFoldersMeta() {
  try {
    const data = await fs.readFile(FOLDERS_META_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// POST - 移动壁纸到其他文件夹
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallpaperIds, targetFolderId } = body;

    if (!wallpaperIds || !Array.isArray(wallpaperIds) || wallpaperIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '壁纸ID列表不能为空',
        },
        { status: 400 }
      );
    }

    if (!targetFolderId) {
      return NextResponse.json(
        {
          success: false,
          message: '目标文件夹ID不能为空',
        },
        { status: 400 }
      );
    }

    // 验证目标文件夹存在
    const folders = await readFoldersMeta();
    const targetFolder = folders.find((f: any) => f.id === targetFolderId);

    if (!targetFolder) {
      return NextResponse.json(
        {
          success: false,
          message: '目标文件夹不存在',
        },
        { status: 404 }
      );
    }

    // 读取壁纸数据
    const wallpapers = await readWallpapersMeta();
    let movedCount = 0;

    // 移动壁纸（更新 folderId）
    wallpaperIds.forEach((id: string) => {
      const wallpaperIndex = wallpapers.findIndex((w: any) => w.id === id);
      if (wallpaperIndex !== -1) {
        wallpapers[wallpaperIndex].folderId = targetFolderId;
        wallpapers[wallpaperIndex].updatedAt = new Date().toISOString();
        movedCount++;
      }
    });

    if (movedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '未找到要移动的壁纸',
        },
        { status: 404 }
      );
    }

    // 保存更新
    await writeWallpapersMeta(wallpapers);

    return NextResponse.json({
      success: true,
      message: `成功移动 ${movedCount} 张壁纸`,
      data: {
        movedCount,
        targetFolderId,
      },
    });
  } catch (error: any) {
    console.error('移动壁纸失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '移动壁纸失败',
      },
      { status: 500 }
    );
  }
}
