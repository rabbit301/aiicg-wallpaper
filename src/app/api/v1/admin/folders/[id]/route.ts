import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const FOLDERS_DIR = path.join(process.cwd(), 'public', 'wallpapers');
const FOLDERS_META_FILE = path.join(process.cwd(), 'data', 'folders.json');

// 读取文件夹元数据
async function readFoldersMeta() {
  try {
    const data = await fs.readFile(FOLDERS_META_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 写入文件夹元数据
async function writeFoldersMeta(folders: any[]) {
  await fs.mkdir(path.dirname(FOLDERS_META_FILE), { recursive: true });
  await fs.writeFile(FOLDERS_META_FILE, JSON.stringify(folders, null, 2), 'utf-8');
}

// PUT - 更新文件夹（重命名）
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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
    const folderIndex = folders.findIndex((f: any) => f.id === id);

    if (folderIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: '文件夹不存在',
        },
        { status: 404 }
      );
    }

    // 检查新名称是否与其他文件夹冲突
    if (
      folders.some(
        (f: any, index: number) =>
          index !== folderIndex && f.name === name.trim()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: '文件夹名称已存在',
        },
        { status: 400 }
      );
    }

    // 更新文件夹名称
    folders[folderIndex].name = name.trim();
    folders[folderIndex].updatedAt = new Date().toISOString();

    await writeFoldersMeta(folders);

    return NextResponse.json({
      success: true,
      data: {
        folder: folders[folderIndex],
      },
    });
  } catch (error: any) {
    console.error('更新文件夹失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '更新文件夹失败',
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除文件夹
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const folders = await readFoldersMeta();
    const folderIndex = folders.findIndex((f: any) => f.id === id);

    if (folderIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: '文件夹不存在',
        },
        { status: 404 }
      );
    }

    // 不允许删除最后一个文件夹
    if (folders.length === 1) {
      return NextResponse.json(
        {
          success: false,
          message: '不能删除最后一个文件夹',
        },
        { status: 400 }
      );
    }

    // 删除物理目录及其内容
    const folderPath = path.join(FOLDERS_DIR, id);
    try {
      await fs.rm(folderPath, { recursive: true, force: true });
    } catch (error) {
      console.warn('删除物理目录失败（可能不存在）:', error);
    }

    // 从元数据中移除
    folders.splice(folderIndex, 1);
    await writeFoldersMeta(folders);

    return NextResponse.json({
      success: true,
      message: '文件夹已删除',
    });
  } catch (error: any) {
    console.error('删除文件夹失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '删除文件夹失败',
      },
      { status: 500 }
    );
  }
}
