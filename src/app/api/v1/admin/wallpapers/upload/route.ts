import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 告诉 Next.js 这个路由需要处理文件上传
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WALLPAPERS_DIR = path.join(process.cwd(), 'public', 'wallpapers');
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

// 写入壁纸元数据
async function writeWallpapersMeta(wallpapers: any[]) {
  await fs.mkdir(path.dirname(WALLPAPERS_META_FILE), { recursive: true });
  await fs.writeFile(
    WALLPAPERS_META_FILE,
    JSON.stringify(wallpapers, null, 2),
    'utf-8'
  );
}

// POST - 上传壁纸
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folderId = formData.get('folderId') as string;
    const tags = formData.get('tags') as string;
    const isPublic = formData.get('is_public') === 'true';

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '请选择要上传的文件',
        },
        { status: 400 }
      );
    }

    if (!folderId) {
      return NextResponse.json(
        {
          success: false,
          message: '请指定文件夹',
        },
        { status: 400 }
      );
    }

    // 确保文件夹目录存在
    const folderPath = path.join(WALLPAPERS_DIR, folderId);
    await fs.mkdir(folderPath, { recursive: true });

    const wallpapers = await readWallpapersMeta();
    const uploadedWallpapers = [];
    const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    for (const file of files) {
      // 生成唯一文件名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11);
      const ext = path.extname(file.name);
      const filename = `wallpaper_${timestamp}_${randomStr}${ext}`;
      const filepath = path.join(folderPath, filename);

      // 保存文件
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filepath, buffer);

      // 创建壁纸元数据
      const wallpaper = {
        id: `wallpaper_${timestamp}_${randomStr}`,
        title: file.name.replace(ext, ''),
        imageUrl: `/wallpapers/${folderId}/${filename}`,
        thumbnailUrl: `/wallpapers/${folderId}/${filename}`,
        width: 0, // 实际应该通过图片处理库获取
        height: 0,
        folderId,
        tags: tagArray,
        is_public: isPublic,
        createdAt: new Date().toISOString(),
      };

      wallpapers.push(wallpaper);
      uploadedWallpapers.push(wallpaper);
    }

    // 保存元数据
    await writeWallpapersMeta(wallpapers);

    return NextResponse.json({
      success: true,
      message: `成功上传 ${uploadedWallpapers.length} 张壁纸`,
      data: {
        wallpapers: uploadedWallpapers,
      },
    });
  } catch (error: any) {
    console.error('上传壁纸失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '上传壁纸失败',
      },
      { status: 500 }
    );
  }
}
