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

    // Mock user profile data - in real app, this would query the database
    const userProfile = {
      id: userId,
      username: 'rabbitc',
      email: 'admin@aiicg.com',
      avatar: '/avatars/presets/avatar-3.svg',
      bio: '热爱AI艺术创作的设计师，专注于壁纸生成和图像处理技术',
      role: 'super_admin',
      isVip: true,
      level: 15,
      experience: 2850,
      nextLevelExp: 3000,
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      location: '中国',
      website: 'https://aiicg.com',
      joinedAt: '2024-01-15T08:00:00Z',
      lastLoginAt: new Date().toISOString(),
      vipExpiresAt: '2025-12-31T23:59:59Z',
      
      // Social stats
      followersCount: 128,
      followingCount: 45,
      
      // Activity stats
      totalWallpapersGenerated: 156,
      totalDownloads: 2341,
      totalCompressions: 89,
      totalViews: 15678,
      totalFavorites: 234,
      totalShares: 67,
      
      // Recent achievements
      achievements: [
        {
          id: 'creator_100',
          name: '创作达人',
          description: '生成100张壁纸',
          icon: '🎨',
          unlockedAt: '2024-11-20T10:30:00Z'
        },
        {
          id: 'popular_creator',
          name: '人气创作者',
          description: '作品获得1000次下载',
          icon: '⭐',
          unlockedAt: '2024-12-01T15:45:00Z'
        }
      ],
      
      // Usage statistics by month
      monthlyStats: [
        { month: '2024-12', generated: 23, downloads: 145, compressions: 12 },
        { month: '2024-11', generated: 31, downloads: 198, compressions: 15 },
        { month: '2024-10', generated: 28, downloads: 167, compressions: 18 },
        { month: '2024-09', generated: 25, downloads: 134, compressions: 11 },
        { month: '2024-08', generated: 19, downloads: 98, compressions: 8 },
        { month: '2024-07', generated: 30, downloads: 201, compressions: 25 }
      ]
    };

    return NextResponse.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
