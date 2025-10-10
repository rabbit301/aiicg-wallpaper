import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const WALLPAPERS_META_FILE = path.join(process.cwd(), 'data', 'wallpapers.json');
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

// PUT - 更新壁纸信息
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const wallpapers = await readWallpapersMeta();
    const wallpaperIndex = wallpapers.findIndex((w: any) => w.id === id);

    if (wallpaperIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: '壁纸不存在',
        },
        { status: 404 }
      );
    }

    // 更新壁纸信息
    wallpapers[wallpaperIndex] = {
      ...wallpapers[wallpaperIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await writeWallpapersMeta(wallpapers);

    return NextResponse.json({
      success: true,
      data: {
        wallpaper: wallpapers[wallpaperIndex],
      },
    });
  } catch (error: any) {
    console.error('更新壁纸失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '更新壁纸失败',
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除壁纸
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const wallpapers = await readWallpapersMeta();
    const wallpaperIndex = wallpapers.findIndex((w: any) => w.id === id);

    if (wallpaperIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: '壁纸不存在',
        },
        { status: 404 }
      );
    }

    const wallpaper = wallpapers[wallpaperIndex];

    // 删除物理文件
    if (wallpaper.imageUrl) {
      // 如果是本地文件，删除它
      const urlPath = wallpaper.imageUrl.replace('/wallpapers/', '');
      const filePath = path.join(WALLPAPERS_DIR, urlPath);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('删除物理文件失败（可能不存在）:', error);
      }
    }

    // 删除缩略图
    if (wallpaper.thumbnailUrl && wallpaper.thumbnailUrl !== wallpaper.imageUrl) {
      const thumbPath = wallpaper.thumbnailUrl.replace('/wallpapers/', '');
      const thumbFilePath = path.join(WALLPAPERS_DIR, thumbPath);

      try {
        await fs.unlink(thumbFilePath);
      } catch (error) {
        console.warn('删除缩略图失败（可能不存在）:', error);
      }
    }

    // 从元数据中移除
    wallpapers.splice(wallpaperIndex, 1);
    await writeWallpapersMeta(wallpapers);

    return NextResponse.json({
      success: true,
      message: '壁纸已删除',
    });
  } catch (error: any) {
    console.error('删除壁纸失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '删除壁纸失败',
      },
      { status: 500 }
    );
  }
}
