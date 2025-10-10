import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

// GET - 获取所有公开的壁纸
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : [];
    const nsfw = searchParams.get('nsfw') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 读取所有壁纸
    let wallpapers = await readWallpapersMeta();

    // 只返回公开的壁纸
    wallpapers = wallpapers.filter((w: any) => w.is_public === true);

    // NSFW 过滤
    if (!nsfw) {
      wallpapers = wallpapers.filter((w: any) =>
        !w.tags || !w.tags.some((tag: string) => tag.toLowerCase() === 'nsfw')
      );
    }

    // 文件夹过滤
    if (folder && folder !== 'all') {
      wallpapers = wallpapers.filter((w: any) => w.folderId === folder);
    }

    // 标签过滤
    if (tags.length > 0) {
      wallpapers = wallpapers.filter((w: any) =>
        w.tags && tags.some((tag: string) =>
          w.tags.some((wTag: string) => wTag.toLowerCase() === tag.toLowerCase())
        )
      );
    }

    // 按创建时间倒序排序
    wallpapers.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWallpapers = wallpapers.slice(startIndex, endIndex);

    // 转换为前端需要的格式
    const formattedWallpapers = paginatedWallpapers.map((w: any) => ({
      id: w.id,
      title: w.title,
      url: w.imageUrl,
      thumbnail: w.thumbnailUrl || w.imageUrl,
      width: w.width,
      height: w.height,
      category: 'wallpaper',
      tags: w.tags || [],
      source: 'local',
      license: 'custom',
      downloadUrl: w.imageUrl,
      type: 'photo',
      folderId: w.folderId,
      is_public: w.is_public,
    }));

    return NextResponse.json({
      success: true,
      data: {
        wallpapers: formattedWallpapers,
        total: wallpapers.length,
        page,
        limit,
        hasMore: endIndex < wallpapers.length,
      },
    });
  } catch (error: any) {
    console.error('获取公开壁纸失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '获取公开壁纸失败',
      },
      { status: 500 }
    );
  }
}
