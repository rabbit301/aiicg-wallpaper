import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 文件夹数据存储路径（简单的文件系统存储）
const FOLDERS_DIR = path.join(process.cwd(), 'public', 'wallpapers');
const FOLDERS_META_FILE = path.join(process.cwd(), 'data', 'folders.json');

// 确保目录存在
async function ensureDirectories() {
  try {
    await fs.mkdir(FOLDERS_DIR, { recursive: true });
    await fs.mkdir(path.dirname(FOLDERS_META_FILE), { recursive: true });
  } catch (error) {
    console.error('创建目录失败:', error);
  }
}

// 读取文件夹元数据
async function readFoldersMeta() {
  try {
    await ensureDirectories();
    const data = await fs.readFile(FOLDERS_META_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 文件不存在，返回默认文件夹
    const defaultFolders = [
      {
        id: 'default',
        name: '默认文件夹',
        count: 0,
        createdAt: new Date().toISOString(),
      },
    ];
    await writeFoldersMeta(defaultFolders);
    return defaultFolders;
  }
}

// 写入文件夹元数据
async function writeFoldersMeta(folders: any[]) {
  await ensureDirectories();
  await fs.writeFile(FOLDERS_META_FILE, JSON.stringify(folders, null, 2), 'utf-8');
}

// 统计文件夹中的壁纸数量
async function countWallpapersInFolder(folderId: string): Promise<number> {
  try {
    const folderPath = path.join(FOLDERS_DIR, folderId);
    const files = await fs.readdir(folderPath);
    // 只统计图片文件
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file)
    );
    return imageFiles.length;
  } catch (error) {
    return 0;
  }
}

// GET - 获取所有文件夹
export async function GET(request: NextRequest) {
  try {
    const folders = await readFoldersMeta();

    // 更新每个文件夹的壁纸数量
    const foldersWithCount = await Promise.all(
      folders.map(async (folder: any) => {
        const count = await countWallpapersInFolder(folder.id);
        return { ...folder, count };
      })
    );

    // 保存更新后的数量
    await writeFoldersMeta(foldersWithCount);

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

// POST - 创建新文件夹
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: '文件夹名称不能为空',
        },
        { status: 400 }
      );
    }

    const folders = await readFoldersMeta();

    // 检查名称是否已存在
    if (folders.some((f: any) => f.name === name.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: '文件夹名称已存在',
        },
        { status: 400 }
      );
    }

    // 创建新文件夹
    const newFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      count: 0,
      createdAt: new Date().toISOString(),
    };

    folders.push(newFolder);
    await writeFoldersMeta(folders);

    // 创建物理目录
    const folderPath = path.join(FOLDERS_DIR, newFolder.id);
    await fs.mkdir(folderPath, { recursive: true });

    return NextResponse.json({
      success: true,
      data: {
        folder: newFolder,
      },
    });
  } catch (error: any) {
    console.error('创建文件夹失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '创建文件夹失败',
      },
      { status: 500 }
    );
  }
}
