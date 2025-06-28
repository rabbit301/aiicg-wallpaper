/**
 * Pexels API 集成
 * 用于获取高质量的图片和视频壁纸
 */

interface PexelsImage {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  category: 'wallpaper';
  tags: string[];
  source: 'pexels';
  license: string;
  author: string;
  downloadUrl: string;
  color: string;
  type: 'photo' | 'video';
}

interface PexelsApiResponse {
  photos: Array<{
    id: number;
    width: number;
    height: number;
    url: string;
    photographer: string;
    photographer_url: string;
    photographer_id: number;
    avg_color: string;
    src: {
      original: string;
      large2x: string;
      large: string;
      medium: string;
      small: string;
      portrait: string;
      landscape: string;
      tiny: string;
    };
    alt: string;
  }>;
  total_results: number;
  page: number;
  per_page: number;
  next_page?: string;
}

interface PexelsVideoResponse {
  videos: Array<{
    id: number;
    width: number;
    height: number;
    url: string;
    image: string;
    duration: number;
    user: {
      id: number;
      name: string;
      url: string;
    };
    video_files: Array<{
      id: number;
      quality: string;
      file_type: string;
      width: number;
      height: number;
      link: string;
    }>;
  }>;
  total_results: number;
  page: number;
  per_page: number;
  next_page?: string;
}

class PexelsScraper {
  private apiKey: string;
  private baseUrl = 'https://api.pexels.com/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 搜索图片壁纸
   */
  async searchPhotos(query: string, page: number = 1, perPage: number = 30): Promise<PexelsImage[]> {
    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
      }

      const data: PexelsApiResponse = await response.json();
      return this.transformPhotoData(data.photos);
    } catch (error) {
      console.error('搜索Pexels图片失败:', error);
      return [];
    }
  }

  /**
   * 搜索视频壁纸
   */
  async searchVideos(query: string, page: number = 1, perPage: number = 15): Promise<PexelsImage[]> {
    try {
      const url = `${this.baseUrl}/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Pexels Video API error: ${response.status} ${response.statusText}`);
      }

      const data: PexelsVideoResponse = await response.json();
      return this.transformVideoData(data.videos);
    } catch (error) {
      console.error('搜索Pexels视频失败:', error);
      return [];
    }
  }

  /**
   * 获取分类壁纸（图片+视频）
   */
  async getCategoryWallpapers(count: number = 200): Promise<PexelsImage[]> {
    const photoCategories = [
      'nature landscape',
      'abstract background',
      'space stars',
      'city skyline',
      'minimalist',
      'sunset ocean',
      'mountain forest',
      'geometric pattern',
      'technology digital',
      'art design'
    ];

    const videoCategories = [
      'nature timelapse',
      'abstract motion',
      'space galaxy',
      'city lights',
      'ocean waves',
      'clouds sky'
    ];

    const results: PexelsImage[] = [];
    const photoCount = Math.floor(count * 0.7); // 70% 图片
    const videoCount = Math.floor(count * 0.3); // 30% 视频
    
    const perPhotoCategory = Math.ceil(photoCount / photoCategories.length);
    const perVideoCategory = Math.ceil(videoCount / videoCategories.length);

    // 获取图片
    for (const category of photoCategories) {
      console.log(`正在获取 ${category} 分类图片...`);
      const images = await this.searchPhotos(category, 1, perPhotoCategory);
      results.push(...images);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (results.length >= photoCount) break;
    }

    // 获取视频
    for (const category of videoCategories) {
      console.log(`正在获取 ${category} 分类视频...`);
      const videos = await this.searchVideos(category, 1, perVideoCategory);
      results.push(...videos);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (results.length >= count) break;
    }

    return results.slice(0, count);
  }

  /**
   * 获取热门图片
   */
  async getPopularPhotos(page: number = 1, perPage: number = 30): Promise<PexelsImage[]> {
    try {
      const url = `${this.baseUrl}/curated?page=${page}&per_page=${perPage}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
      }

      const data: PexelsApiResponse = await response.json();
      return this.transformPhotoData(data.photos);
    } catch (error) {
      console.error('获取热门Pexels图片失败:', error);
      return [];
    }
  }

  /**
   * 转换图片数据格式
   */
  private transformPhotoData(data: PexelsApiResponse['photos']): PexelsImage[] {
    return data
      .filter(item => item.width >= 1920 && item.height >= 1080) // 过滤低分辨率图片
      .map(item => ({
        id: `pexels_photo_${item.id}`,
        title: item.alt || `Photo by ${item.photographer}`,
        url: item.src.large2x,
        thumbnail: item.src.medium,
        width: item.width,
        height: item.height,
        category: 'wallpaper' as const,
        tags: this.extractTags(item.alt).concat(['pexels', 'photography']),
        source: 'pexels' as const,
        license: 'Pexels License (Free to use)',
        author: item.photographer,
        downloadUrl: item.src.original,
        color: item.avg_color,
        type: 'photo' as const,
      }));
  }

  /**
   * 转换视频数据格式
   */
  private transformVideoData(data: PexelsVideoResponse['videos']): PexelsImage[] {
    return data
      .filter(item => item.width >= 1920 && item.height >= 1080) // 过滤低分辨率视频
      .map(item => {
        // 选择最高质量的视频文件
        const bestVideo = item.video_files
          .filter(file => file.file_type === 'video/mp4')
          .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];

        return {
          id: `pexels_video_${item.id}`,
          title: `Video by ${item.user.name}`,
          url: bestVideo?.link || item.video_files[0]?.link,
          thumbnail: item.image,
          width: item.width,
          height: item.height,
          category: 'wallpaper' as const,
          tags: ['pexels', 'video', 'motion', 'dynamic'],
          source: 'pexels' as const,
          license: 'Pexels License (Free to use)',
          author: item.user.name,
          downloadUrl: bestVideo?.link || item.video_files[0]?.link,
          color: '#000000',
          type: 'video' as const,
        };
      });
  }

  /**
   * 从描述中提取标签
   */
  private extractTags(description: string): string[] {
    if (!description) return [];
    
    const words = description.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !['the', 'and', 'for', 'with', 'from'].includes(word));
    
    return words.slice(0, 5); // 最多5个标签
  }
}

/**
 * 保存Pexels数据
 */
export async function savePexelsData(data: PexelsImage[], filename: string = 'pexels-wallpapers.json') {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const filePath = path.join(process.cwd(), 'data', filename);
  
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log(`Pexels数据已保存到: ${filePath}`);
  return filePath;
}

/**
 * 加载Pexels数据
 */
export async function loadPexelsData(filename: string = 'pexels-wallpapers.json'): Promise<PexelsImage[] | null> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(process.cwd(), 'data', filename);
    const data = await fs.readFile(filePath, 'utf-8');
    
    return JSON.parse(data);
  } catch (error) {
    console.error('加载Pexels数据失败:', error);
    return null;
  }
}

export { PexelsScraper, type PexelsImage };
