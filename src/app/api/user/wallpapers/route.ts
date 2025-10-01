import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'created_at';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Mock user wallpapers - in real app, this would query the database
    const mockWallpapers = [
      {
        id: 'wp_001',
        title: '梦幻星空',
        prompt: '一个充满星星的夜空，银河横跨天际，梦幻般的紫色和蓝色渐变',
        imageUrl: 'https://picsum.photos/800/600?random=1',
        thumbnailUrl: 'https://picsum.photos/400/300?random=1',
        width: 1920,
        height: 1080,
        format: 'jpg',
        category: 'nature',
        tags: ['星空', '夜景', '梦幻'],
        views: 1234,
        downloads: 456,
        favorites: 89,
        shares: 23,
        rating: 4.9,
        isPublic: true,
        createdAt: '2024-12-20T10:30:00Z',
        updatedAt: '2024-12-20T10:30:00Z'
      },
      {
        id: 'wp_002',
        title: '城市霓虹',
        prompt: '现代城市夜景，霓虹灯闪烁，赛博朋克风格',
        imageUrl: 'https://picsum.photos/800/600?random=2',
        thumbnailUrl: 'https://picsum.photos/400/300?random=2',
        width: 1920,
        height: 1080,
        format: 'jpg',
        category: 'cityscape',
        tags: ['城市', '霓虹', '赛博朋克'],
        views: 987,
        downloads: 234,
        favorites: 67,
        shares: 15,
        rating: 4.6,
        isPublic: true,
        createdAt: '2024-12-19T15:45:00Z',
        updatedAt: '2024-12-19T15:45:00Z'
      },
      {
        id: 'wp_003',
        title: '抽象几何',
        prompt: '彩色几何图形，抽象艺术风格，现代简约',
        imageUrl: 'https://picsum.photos/800/600?random=3',
        thumbnailUrl: 'https://picsum.photos/400/300?random=3',
        width: 1920,
        height: 1080,
        format: 'jpg',
        category: 'abstract',
        tags: ['几何', '抽象', '现代'],
        views: 756,
        downloads: 189,
        favorites: 45,
        shares: 12,
        rating: 4.4,
        isPublic: true,
        createdAt: '2024-12-18T09:20:00Z',
        updatedAt: '2024-12-18T09:20:00Z'
      },
      {
        id: 'wp_004',
        title: '森林晨光',
        prompt: '清晨的森林，阳光透过树叶洒下，自然清新',
        imageUrl: 'https://picsum.photos/800/600?random=4',
        thumbnailUrl: 'https://picsum.photos/400/300?random=4',
        width: 1920,
        height: 1080,
        format: 'jpg',
        category: 'nature',
        tags: ['森林', '晨光', '自然'],
        views: 1456,
        downloads: 567,
        favorites: 123,
        shares: 34,
        rating: 4.8,
        isPublic: true,
        createdAt: '2024-12-17T07:15:00Z',
        updatedAt: '2024-12-17T07:15:00Z'
      },
      {
        id: 'wp_005',
        title: '极简线条',
        prompt: '简洁的线条设计，黑白配色，极简主义风格',
        imageUrl: 'https://picsum.photos/800/600?random=5',
        thumbnailUrl: 'https://picsum.photos/400/300?random=5',
        width: 1920,
        height: 1080,
        format: 'jpg',
        category: 'minimalist',
        tags: ['极简', '线条', '黑白'],
        views: 634,
        downloads: 145,
        favorites: 38,
        shares: 8,
        rating: 4.3,
        isPublic: true,
        createdAt: '2024-12-16T14:30:00Z',
        updatedAt: '2024-12-16T14:30:00Z'
      },
      {
        id: 'wp_006',
        title: '魔法世界',
        prompt: '奇幻魔法世界，城堡和龙，童话般的场景',
        imageUrl: 'https://picsum.photos/800/600?random=6',
        thumbnailUrl: 'https://picsum.photos/400/300?random=6',
        width: 1920,
        height: 1080,
        format: 'jpg',
        category: 'fantasy',
        tags: ['魔法', '奇幻', '城堡'],
        views: 1123,
        downloads: 378,
        favorites: 89,
        shares: 25,
        rating: 4.7,
        isPublic: true,
        createdAt: '2024-12-15T11:45:00Z',
        updatedAt: '2024-12-15T11:45:00Z'
      }
    ];

    // Filter by category if specified
    let filteredWallpapers = mockWallpapers;
    if (category && category !== 'all') {
      filteredWallpapers = mockWallpapers.filter(w => w.category === category);
    }

    // Sort wallpapers
    filteredWallpapers.sort((a, b) => {
      switch (sort) {
        case 'views':
          return b.views - a.views;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'favorites':
          return b.favorites - a.favorites;
        case 'rating':
          return b.rating - a.rating;
        case 'created_at':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWallpapers = filteredWallpapers.slice(startIndex, endIndex);

    const response = {
      wallpapers: paginatedWallpapers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredWallpapers.length / limit),
        totalItems: filteredWallpapers.length,
        itemsPerPage: limit,
        hasNextPage: endIndex < filteredWallpapers.length,
        hasPrevPage: page > 1
      },
      summary: {
        totalWallpapers: mockWallpapers.length,
        totalViews: mockWallpapers.reduce((sum, w) => sum + w.views, 0),
        totalDownloads: mockWallpapers.reduce((sum, w) => sum + w.downloads, 0),
        totalFavorites: mockWallpapers.reduce((sum, w) => sum + w.favorites, 0),
        averageRating: mockWallpapers.reduce((sum, w) => sum + w.rating, 0) / mockWallpapers.length
      }
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching user wallpapers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
