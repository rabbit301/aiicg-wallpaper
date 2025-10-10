import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const FOLDERS_META_FILE = path.join(process.cwd(), 'data', 'folders.json');
const WALLPAPERS_META_FILE = path.join(process.cwd(), 'data', 'wallpapers.json');

// 读取文件夹元数据
async function readFoldersMeta() {
  try {
    const data = await fs.readFile(FOLDERS_META_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 读取壁纸元数据
async function readWallpapersMeta() {
  try {
    const data = await fs.readFile(WALLPAPERS_META_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// GET - 获取所有公开的文件夹列表（只显示有公开壁纸的文件夹）
export async function GET(request: NextRequest) {
  try {
    const folders = await readFoldersMeta();
    const wallpapers = await readWallpapersMeta();

    // 只统计公开的壁纸
    const publicWallpapers = wallpapers.filter((w: any) => w.is_public === true);

    // 计算每个文件夹的公开壁纸数量
    const foldersWithCount = folders.map((folder: any) => {
      const count = publicWallpapers.filter((w: any) => w.folderId === folder.id).length;
      return {
        id: folder.id,
        name: folder.name,
        count,
        icon: '📁',
      };
    }).filter((folder: any) => folder.count > 0); // 只返回有公开壁纸的文件夹

    return NextResponse.json({
      success: true,
      data: {
        folders: foldersWithCount,
      },
    });
  } catch (error: any) {
    console.error('获取文件夹列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '获取文件夹列表失败',
      },
      { status: 500 }
    );
  }
}
