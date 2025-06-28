/**
 * 统一的壁纸管理器
 * 整合多个来源的壁纸数据
 */

import { UnsplashScraper, type UnsplashImage } from './unsplash-scraper';
import { PexelsScraper, type PexelsImage } from './pexels-scraper';
import { mergeAvatarData } from './local-avatar-processor';

// 统一的壁纸接口
export interface UnifiedWallpaper {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  category: 'avatar' | 'wallpaper' | 'animation' | 'live';
  tags: string[];
  source: 'unsplash' | 'pexels' | 'giphy' | 'local';
  license: string;
  author?: string;
  downloadUrl: string;
  type?: 'photo' | 'video' | 'gif';
  color?: string;
  likes?: number;
}

// 爬取统计信息
export interface ScrapingStats {
  source: string;
  category: string;
  count: number;
  success: boolean;
  error?: string;
  duration: number;
}

class WallpaperManager {
  private unsplashScraper?: UnsplashScraper;
  private pexelsScraper?: PexelsScraper;

  constructor(apiKeys: {
    unsplash?: string;
    pexels?: string;
  }) {
    if (apiKeys.unsplash) {
      this.unsplashScraper = new UnsplashScraper(apiKeys.unsplash);
    }
    if (apiKeys.pexels) {
      this.pexelsScraper = new PexelsScraper(apiKeys.pexels);
    }
  }

  /**
   * 爬取所有来源的壁纸
   */
  async scrapeAllWallpapers(): Promise<{
    wallpapers: Record<string, UnifiedWallpaper[]>;
    stats: ScrapingStats[];
  }> {
    const wallpapers: Record<string, UnifiedWallpaper[]> = {
      avatar: [],
      wallpaper: [],
      animation: [],
      live: []
    };
    const stats: ScrapingStats[] = [];

    // 1. 处理头像（本地 + Giphy）
    console.log('开始处理头像资源...');
    const avatarStartTime = Date.now();
    try {
      const avatars = await mergeAvatarData([]);
      wallpapers.avatar = avatars.map(this.normalizeToUnified);
      
      stats.push({
        source: 'local+giphy',
        category: 'avatar',
        count: wallpapers.avatar.length,
        success: true,
        duration: Date.now() - avatarStartTime
      });
    } catch (error) {
      stats.push({
        source: 'local+giphy',
        category: 'avatar',
        count: 0,
        success: false,
        error: (error as Error).message,
        duration: Date.now() - avatarStartTime
      });
    }

    // 2. 爬取Unsplash壁纸
    if (this.unsplashScraper) {
      console.log('开始爬取Unsplash壁纸...');
      const unsplashStartTime = Date.now();
      try {
        const unsplashWallpapers = await this.unsplashScraper.getCategoryWallpapers(150);
        const normalizedWallpapers = unsplashWallpapers.map(this.normalizeToUnified);
        wallpapers.wallpaper.push(...normalizedWallpapers);
        
        stats.push({
          source: 'unsplash',
          category: 'wallpaper',
          count: unsplashWallpapers.length,
          success: true,
          duration: Date.now() - unsplashStartTime
        });
      } catch (error) {
        stats.push({
          source: 'unsplash',
          category: 'wallpaper',
          count: 0,
          success: false,
          error: (error as Error).message,
          duration: Date.now() - unsplashStartTime
        });
      }
    }

    // 3. 爬取Pexels壁纸
    if (this.pexelsScraper) {
      console.log('开始爬取Pexels壁纸...');
      const pexelsStartTime = Date.now();
      try {
        const pexelsWallpapers = await this.pexelsScraper.getCategoryWallpapers(100);
        const normalizedWallpapers = pexelsWallpapers.map(this.normalizeToUnified);
        wallpapers.wallpaper.push(...normalizedWallpapers);
        
        stats.push({
          source: 'pexels',
          category: 'wallpaper',
          count: pexelsWallpapers.length,
          success: true,
          duration: Date.now() - pexelsStartTime
        });
      } catch (error) {
        stats.push({
          source: 'pexels',
          category: 'wallpaper',
          count: 0,
          success: false,
          error: (error as Error).message,
          duration: Date.now() - pexelsStartTime
        });
      }
    }

    // 4. 动画分类（暂时使用示例数据）
    wallpapers.animation = this.generateSampleAnimations();
    stats.push({
      source: 'sample',
      category: 'animation',
      count: wallpapers.animation.length,
      success: true,
      duration: 0
    });

    // 5. 直播分类（暂时使用示例数据）
    wallpapers.live = this.generateSampleLive();
    stats.push({
      source: 'sample',
      category: 'live',
      count: wallpapers.live.length,
      success: true,
      duration: 0
    });

    return { wallpapers, stats };
  }

  /**
   * 将不同来源的数据标准化为统一格式
   */
  private normalizeToUnified(item: any): UnifiedWallpaper {
    return {
      id: item.id,
      title: item.title,
      url: item.url || item.webp_url,
      thumbnail: item.thumbnail || item.webp_url,
      width: item.width,
      height: item.height,
      category: item.category,
      tags: item.tags || [],
      source: item.source,
      license: item.license || 'Unknown',
      author: item.author,
      downloadUrl: item.downloadUrl || item.url || item.webp_url,
      type: item.type || 'photo',
      color: item.color,
      likes: item.likes
    };
  }

  /**
   * 生成示例动画数据
   */
  private generateSampleAnimations(): UnifiedWallpaper[] {
    return [
      {
        id: 'sample_animation_1',
        title: 'Particle Flow Animation',
        url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
        thumbnail: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy_s.gif',
        width: 800,
        height: 600,
        category: 'animation',
        tags: ['particle', 'flow', 'animation', 'abstract'],
        source: 'giphy',
        license: 'Giphy License',
        downloadUrl: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
        type: 'gif'
      },
      {
        id: 'sample_animation_2',
        title: 'Geometric Motion Graphics',
        url: 'https://media.giphy.com/media/l0MYGb8Q5QNhNBuDu/giphy.gif',
        thumbnail: 'https://media.giphy.com/media/l0MYGb8Q5QNhNBuDu/giphy_s.gif',
        width: 800,
        height: 600,
        category: 'animation',
        tags: ['geometric', 'motion', 'graphics', 'loop'],
        source: 'giphy',
        license: 'Giphy License',
        downloadUrl: 'https://media.giphy.com/media/l0MYGb8Q5QNhNBuDu/giphy.gif',
        type: 'gif'
      }
    ];
  }

  /**
   * 生成示例直播数据
   */
  private generateSampleLive(): UnifiedWallpaper[] {
    return [
      {
        id: 'sample_live_1',
        title: 'Live Streaming Indicator',
        url: 'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif',
        thumbnail: 'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy_s.gif',
        width: 400,
        height: 200,
        category: 'live',
        tags: ['live', 'streaming', 'indicator', 'broadcast'],
        source: 'giphy',
        license: 'Giphy License',
        downloadUrl: 'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif',
        type: 'gif'
      },
      {
        id: 'sample_live_2',
        title: 'Stream Alert Animation',
        url: 'https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.gif',
        thumbnail: 'https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy_s.gif',
        width: 400,
        height: 200,
        category: 'live',
        tags: ['stream', 'alert', 'notification', 'overlay'],
        source: 'giphy',
        license: 'Giphy License',
        downloadUrl: 'https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.gif',
        type: 'gif'
      }
    ];
  }
}

/**
 * 保存统一格式的壁纸数据
 */
export async function saveUnifiedWallpaperData(
  wallpapers: Record<string, UnifiedWallpaper[]>,
  filename: string = 'unified-wallpapers.json'
) {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const filePath = path.join(process.cwd(), 'data', filename);
  
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(wallpapers, null, 2), 'utf-8');
  
  console.log(`统一壁纸数据已保存到: ${filePath}`);
  return filePath;
}

/**
 * 加载统一格式的壁纸数据
 */
export async function loadUnifiedWallpaperData(
  filename: string = 'unified-wallpapers.json'
): Promise<Record<string, UnifiedWallpaper[]> | null> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(process.cwd(), 'data', filename);
    const data = await fs.readFile(filePath, 'utf-8');
    
    return JSON.parse(data);
  } catch (error) {
    console.error('加载统一壁纸数据失败:', error);
    return null;
  }
}

export { WallpaperManager };
