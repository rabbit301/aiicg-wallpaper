/**
 * Giphy图片爬虫
 * 用于获取Giphy网站的图片数据
 */

interface GiphyImage {
  id: string;
  title: string;
  url: string;
  webp_url: string;
  mp4_url?: string;
  width: number;
  height: number;
  category: 'avatar' | 'wallpaper' | 'animation' | 'live';
  tags: string[];
  rating: string;
  trending_datetime?: string;
}

interface GiphyApiResponse {
  data: Array<{
    id: string;
    title: string;
    images: {
      original: {
        url: string;
        webp: string;
        mp4?: string;
        width: string;
        height: string;
      };
      fixed_height: {
        url: string;
        webp: string;
        mp4?: string;
        width: string;
        height: string;
      };
    };
    rating: string;
    trending_datetime?: string;
  }>;
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
}

class GiphyScraper {
  private apiKey: string;
  private baseUrl = 'https://api.giphy.com/v1/gifs';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 获取趋势GIF
   */
  async getTrending(limit: number = 50, offset: number = 0): Promise<GiphyImage[]> {
    try {
      const url = `${this.baseUrl}/trending?api_key=${this.apiKey}&limit=${limit}&offset=${offset}&rating=g`;
      const response = await fetch(url);
      const data: GiphyApiResponse = await response.json();
      
      return this.transformData(data.data, 'animation');
    } catch (error) {
      console.error('获取趋势GIF失败:', error);
      return [];
    }
  }

  /**
   * 根据关键词搜索GIF
   */
  async searchGifs(query: string, limit: number = 50, offset: number = 0): Promise<GiphyImage[]> {
    try {
      const url = `${this.baseUrl}/search?api_key=${this.apiKey}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&rating=g`;
      const response = await fetch(url);
      const data: GiphyApiResponse = await response.json();
      
      // 根据查询词确定分类
      const category = this.determineCategory(query);
      return this.transformData(data.data, category);
    } catch (error) {
      console.error('搜索GIF失败:', error);
      return [];
    }
  }

  /**
   * 获取分类内容
   */
  async getCategoryContent(category: 'avatar' | 'wallpaper' | 'animation' | 'live', count: number = 50): Promise<GiphyImage[]> {
    const queries = this.getCategoryQueries(category);
    const results: GiphyImage[] = [];
    
    for (const query of queries) {
      const limit = Math.ceil(count / queries.length);
      const gifs = await this.searchGifs(query, limit);
      results.push(...gifs);
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results.slice(0, count);
  }

  /**
   * 获取所有分类的内容（初始展示版本）
   */
  async getAllContent(): Promise<Record<string, GiphyImage[]>> {
    const categories = ['avatar'] as const; // 暂时只爬取头像
    const results: Record<string, GiphyImage[]> = {};

    for (const category of categories) {
      console.log(`正在获取${category}分类内容...`);
      results[category] = await this.getCategoryContent(category, 200); // 200张头像

      // 添加延迟
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }

  /**
   * 转换API数据格式
   */
  private transformData(data: GiphyApiResponse['data'], category: GiphyImage['category']): GiphyImage[] {
    return data.map(item => ({
      id: item.id,
      title: item.title || 'Untitled',
      url: item.images.original.url,
      webp_url: item.images.original.webp,
      mp4_url: item.images.original.mp4,
      width: parseInt(item.images.original.width),
      height: parseInt(item.images.original.height),
      category,
      tags: this.extractTags(item.title),
      rating: item.rating,
      trending_datetime: item.trending_datetime,
    }));
  }

  /**
   * 根据查询词确定分类
   */
  private determineCategory(query: string): GiphyImage['category'] {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('avatar') || lowerQuery.includes('profile') || lowerQuery.includes('face')) {
      return 'avatar';
    }
    if (lowerQuery.includes('wallpaper') || lowerQuery.includes('background') || lowerQuery.includes('landscape')) {
      return 'wallpaper';
    }
    if (lowerQuery.includes('live') || lowerQuery.includes('stream') || lowerQuery.includes('broadcast')) {
      return 'live';
    }
    
    return 'animation';
  }

  /**
   * 获取分类对应的搜索关键词
   */
  private getCategoryQueries(category: GiphyImage['category']): string[] {
    const queries = {
      avatar: [
        'cute avatar', 'anime avatar', 'cartoon character', 'profile picture',
        'kawaii', 'chibi', 'mascot', 'emoji face', 'character design'
      ],
      wallpaper: [
        'aesthetic wallpaper', 'nature landscape', 'space galaxy', 'abstract art',
        'minimalist design', 'geometric pattern', 'sunset sky', 'ocean waves',
        'mountain view', 'city skyline', 'neon lights', 'gradient background'
      ],
      animation: [
        'cool animation', 'motion graphics', 'particle effect', 'loop animation',
        'abstract motion', 'geometric animation', 'fluid animation', 'kinetic art',
        'visual effect', 'digital art', 'creative loop', 'smooth transition'
      ],
      live: [
        'live streaming', 'broadcast graphics', 'overlay animation', 'stream alert',
        'notification', 'gaming overlay', 'twitch emote', 'stream decoration',
        'live indicator', 'streaming element'
      ]
    };
    
    return queries[category];
  }

  /**
   * 从标题中提取标签
   */
  private extractTags(title: string): string[] {
    // 简单的标签提取逻辑
    const words = title.toLowerCase().split(/\s+/);
    return words.filter(word => word.length > 2 && !['gif', 'the', 'and', 'for', 'with'].includes(word));
  }
}

/**
 * 保存图片数据到本地文件
 */
export async function saveGiphyData(data: Record<string, GiphyImage[]>, filename: string = 'giphy-content.json') {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const filePath = path.join(process.cwd(), 'data', filename);
  
  // 确保目录存在
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  
  // 保存数据
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log(`数据已保存到: ${filePath}`);
  return filePath;
}

/**
 * 从本地文件加载图片数据
 */
export async function loadGiphyData(filename: string = 'giphy-content.json'): Promise<Record<string, GiphyImage[]> | null> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(process.cwd(), 'data', filename);
    const data = await fs.readFile(filePath, 'utf-8');
    
    return JSON.parse(data);
  } catch (error) {
    console.error('加载数据失败:', error);
    return null;
  }
}

export { GiphyScraper, type GiphyImage };
