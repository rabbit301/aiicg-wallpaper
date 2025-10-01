import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Mock user statistics - in real app, this would query the database
    const userStats = {
      // Core statistics
      wallpapersGenerated: 156,
      totalDownloads: 2341,
      totalViews: 15678,
      compressionUsed: 89,
      favoriteReceived: 234,
      sharesReceived: 67,
      
      // Time-based statistics
      todayGenerated: 3,
      weekGenerated: 12,
      monthGenerated: 23,
      
      // Quality metrics
      averageRating: 4.7,
      topRatedWallpaper: {
        id: 'wp_001',
        title: '梦幻星空',
        rating: 4.9,
        downloads: 456
      },
      
      // Usage patterns
      mostActiveHour: 14, // 2 PM
      mostActiveDay: 'Tuesday',
      averageGenerationTime: 2.3, // seconds
      
      // Categories breakdown
      categoryStats: [
        { category: 'nature', count: 45, percentage: 28.8 },
        { category: 'abstract', count: 38, percentage: 24.4 },
        { category: 'cityscape', count: 32, percentage: 20.5 },
        { category: 'fantasy', count: 25, percentage: 16.0 },
        { category: 'minimalist', count: 16, percentage: 10.3 }
      ],
      
      // Recent activity summary
      last7Days: {
        generated: 12,
        downloads: 89,
        compressions: 5,
        favorites: 23
      },
      
      last30Days: {
        generated: 23,
        downloads: 145,
        compressions: 12,
        favorites: 67
      },
      
      // Ranking information
      globalRank: 15,
      countryRank: 3,
      levelProgress: {
        currentLevel: 15,
        currentExp: 2850,
        nextLevelExp: 3000,
        expToNext: 150,
        progressPercentage: 95.0
      },
      
      // Achievements progress
      achievementProgress: [
        {
          id: 'master_creator',
          name: '创作大师',
          description: '生成500张壁纸',
          progress: 156,
          target: 500,
          percentage: 31.2,
          icon: '🏆'
        },
        {
          id: 'download_king',
          name: '下载之王',
          description: '作品获得10000次下载',
          progress: 2341,
          target: 10000,
          percentage: 23.4,
          icon: '👑'
        },
        {
          id: 'compression_expert',
          name: '压缩专家',
          description: '使用压缩功能200次',
          progress: 89,
          target: 200,
          percentage: 44.5,
          icon: '🔧'
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: userStats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
