/**
 * Unsplash API 集成
 * 用于获取高质量的摄影壁纸
 */

interface UnsplashImage {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  category: 'wallpaper';
  tags: string[];
  source: 'unsplash';
  license: string;
  author: string;
  downloadUrl: string;
  description?: string;
  color: string;
  likes: number;
}

interface UnsplashApiResponse {
  results: Array<{
    id: string;
    description: string | null;
    alt_description: string | null;
    urls: {
      raw: string;
      full: string;
      regular: string;
      small: string;
      thumb: string;
    };
    width: number;
    height: number;
    color: string;
    likes: number;
    user: {
      name: string;
      username: string;
    };
    tags: Array<{
      title: string;
    }>;
  }>;
  total: number;
  total_pages: number;
}

class UnsplashScraper {
  private apiKey: string;
  private baseUrl = 'https://api.unsplash.com';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 搜索壁纸
   */
  async searchWallpapers(query: string, page: number = 1, perPage: number = 30): Promise<UnsplashImage[]> {
    try {
      const url = `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
      }

      const data: UnsplashApiResponse = await response.json();
      return this.transformData(data.results);
    } catch (error) {
      console.error('搜索Unsplash壁纸失败:', error);
      return [];
    }
  }

  /**
   * 获取分类壁纸
   */
  async getCategoryWallpapers(count: number = 200): Promise<UnsplashImage[]> {
    const categories = [
      'landscape nature',
      'abstract art',
      'space galaxy',
      'city architecture',
      'minimalist design',
      'sunset sunrise',
      'ocean waves',
      'mountain view',
      'forest trees',
      'geometric pattern',
      'neon cyberpunk',
      'vintage retro'
    ];

    const results: UnsplashImage[] = [];
    const perCategory = Math.ceil(count / categories.length);

    for (const category of categories) {
      console.log(`正在获取 ${category} 分类壁纸...`);
      const images = await this.searchWallpapers(category, 1, perCategory);
      results.push(...images);
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (results.length >= count) break;
    }

    return results.slice(0, count);
  }

  /**
   * 获取热门壁纸
   */
  async getPopularWallpapers(page: number = 1, perPage: number = 30): Promise<UnsplashImage[]> {
    try {
      const url = `${this.baseUrl}/photos?page=${page}&per_page=${perPage}&order_by=popular&orientation=landscape`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformData(data);
    } catch (error) {
      console.error('获取热门Unsplash壁纸失败:', error);
      return [];
    }
  }

  /**
   * 转换API数据格式
   */
  private transformData(data: UnsplashApiResponse['results']): UnsplashImage[] {
    return data
      .filter(item => item.width >= 1920 && item.height >= 1080) // 过滤低分辨率图片
      .map(item => ({
        id: `unsplash_${item.id}`,
        title: item.description || item.alt_description || `Photo by ${item.user.name}`,
        url: item.urls.full,
        thumbnail: item.urls.small,
        width: item.width,
        height: item.height,
        category: 'wallpaper' as const,
        tags: item.tags.map(tag => tag.title).concat(['unsplash', 'photography']),
        source: 'unsplash' as const,
        license: 'Unsplash License (Free to use)',
        author: item.user.name,
        downloadUrl: item.urls.raw,
        description: item.description,
        color: item.color,
        likes: item.likes,
      }));
  }

  /**
   * 获取特定尺寸的壁纸
   */
  async getWallpapersByResolution(width: number, height: number, count: number = 50): Promise<UnsplashImage[]> {
    const aspectRatio = width / height;
    let query = '';
    
    // 根据宽高比选择合适的搜索词
    if (aspectRatio > 2) {
      query = 'ultrawide landscape panoramic';
    } else if (aspectRatio > 1.5) {
      query = 'widescreen landscape desktop';
    } else if (aspectRatio < 0.8) {
      query = 'portrait vertical mobile';
    } else {
      query = 'square minimal geometric';
    }

    const images = await this.searchWallpapers(query, 1, count);
    
    // 进一步过滤符合尺寸要求的图片
    return images.filter(img => {
      const imgRatio = img.width / img.height;
      return Math.abs(imgRatio - aspectRatio) < 0.3; // 允许30%的误差
    });
  }
}

/**
 * 保存Unsplash壁纸数据
 */
export async function saveUnsplashData(data: UnsplashImage[], filename: string = 'unsplash-wallpapers.json') {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const filePath = path.join(process.cwd(), 'data', filename);
  
  // 确保目录存在
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  
  // 保存数据
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log(`Unsplash数据已保存到: ${filePath}`);
  return filePath;
}

/**
 * 从本地文件加载Unsplash数据
 */
export async function loadUnsplashData(filename: string = 'unsplash-wallpapers.json'): Promise<UnsplashImage[] | null> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(process.cwd(), 'data', filename);
    const data = await fs.readFile(filePath, 'utf-8');
    
    return JSON.parse(data);
  } catch (error) {
    console.error('加载Unsplash数据失败:', error);
    return null;
  }
}

export { UnsplashScraper, type UnsplashImage };
