/**
 * 提示词缓存和模板管理系统
 * 实现高效的prompt处理，减少重复翻译和优化
 */

export interface CachedPrompt {
  original: string;
  translated: string;
  enhanced: string;
  timestamp: number;
  hitCount: number;
  locale: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
  enhancedPrompt: string;
  tags: string[];
  popularity: number;
  locale: string;
}

// 内存缓存存储
class PromptCacheStore {
  private cache = new Map<string, CachedPrompt>();
  private maxSize = 1000; // 最大缓存条目数
  private maxAge = 24 * 60 * 60 * 1000; // 24小时过期

  // 生成缓存键
  private getCacheKey(prompt: string, locale: string): string {
    return `${locale}:${prompt.trim().toLowerCase()}`;
  }

  // 获取缓存
  get(prompt: string, locale: string): CachedPrompt | null {
    const key = this.getCacheKey(prompt, locale);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // 检查是否过期
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    // 增加命中次数
    cached.hitCount++;
    return cached;
  }

  // 设置缓存
  set(prompt: string, locale: string, translated: string, enhanced: string): void {
    const key = this.getCacheKey(prompt, locale);
    
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      original: prompt.trim(),
      translated,
      enhanced,
      timestamp: Date.now(),
      hitCount: 1,
      locale
    });
  }

  // 删除最旧的缓存条目
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // 获取缓存统计
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    if (this.cache.size === 0) return 0;
    
    let totalHits = 0;
    for (const cached of this.cache.values()) {
      totalHits += cached.hitCount;
    }
    
    return totalHits / this.cache.size;
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

// 预设模板库
const PROMPT_TEMPLATES: PromptTemplate[] = [
  // 自然风光类
  {
    id: 'nature_mountain',
    name: '壮丽山景',
    category: 'nature',
    prompt: '壮丽的山脉风景，雪山峰顶，蓝天白云',
    enhancedPrompt: 'majestic mountain landscape, snow-capped peaks, blue sky with white clouds, high quality, detailed, masterpiece, 8k resolution, dramatic lighting, beautiful composition',
    tags: ['自然', '山脉', '风景'],
    popularity: 85,
    locale: 'zh-CN'
  },
  {
    id: 'nature_ocean',
    name: '海洋日落',
    category: 'nature',
    prompt: '美丽的海洋日落，金色阳光洒在海面上',
    enhancedPrompt: 'beautiful ocean sunset, golden sunlight reflecting on water surface, high quality, detailed, masterpiece, 8k resolution, warm lighting, stunning visual',
    tags: ['自然', '海洋', '日落'],
    popularity: 92,
    locale: 'zh-CN'
  },
  
  // 抽象艺术类
  {
    id: 'abstract_geometric',
    name: '几何抽象',
    category: 'abstract',
    prompt: '现代几何抽象艺术，色彩丰富，创意设计',
    enhancedPrompt: 'modern geometric abstract art, vibrant colors, creative design, high quality, detailed, masterpiece, 8k resolution, beautiful composition, stunning visual',
    tags: ['抽象', '几何', '现代'],
    popularity: 78,
    locale: 'zh-CN'
  },
  
  // 动漫风格类
  {
    id: 'anime_character',
    name: '动漫角色',
    category: 'anime',
    prompt: '精美动漫角色插画，细节丰富，高质量渲染',
    enhancedPrompt: 'beautiful anime character illustration, rich details, high quality rendering, masterpiece, 8k resolution, anime style, detailed eyes, perfect composition',
    tags: ['动漫', '角色', '插画'],
    popularity: 95,
    locale: 'zh-CN'
  },
  
  // 科幻未来类
  {
    id: 'scifi_cyberpunk',
    name: '赛博朋克',
    category: 'scifi',
    prompt: '赛博朋克风格城市，霓虹灯光，未来科技感',
    enhancedPrompt: 'cyberpunk style city, neon lights, futuristic technology, high quality, detailed, masterpiece, 8k resolution, dramatic lighting, sci-fi atmosphere',
    tags: ['科幻', '赛博朋克', '未来'],
    popularity: 88,
    locale: 'zh-CN'
  }
];

// 全局缓存实例
const promptCache = new PromptCacheStore();

// 提示词缓存管理器
export class PromptCacheManager {
  
  /**
   * 获取或处理提示词（带缓存）
   */
  async getOrProcessPrompt(
    originalPrompt: string, 
    locale: string = 'zh-CN'
  ): Promise<{
    original: string;
    translated: string;
    enhanced: string;
    fromCache: boolean;
  }> {
    // 先检查缓存
    const cached = promptCache.get(originalPrompt, locale);
    if (cached) {
      console.log('🎯 命中提示词缓存:', originalPrompt.substring(0, 50) + '...');
      return {
        original: cached.original,
        translated: cached.translated,
        enhanced: cached.enhanced,
        fromCache: true
      };
    }

    console.log('🔄 处理新提示词:', originalPrompt.substring(0, 50) + '...');
    
    // 如果没有缓存，进行处理
    const { translatePrompt } = await import('./prompt-translator');
    const { enhanceEnglishPrompt } = await import('./prompt-translator');
    
    // 翻译
    const translationResult = await translatePrompt(originalPrompt);
    
    // 增强
    const enhanced = enhanceEnglishPrompt(translationResult.translated);
    
    // 存入缓存
    promptCache.set(originalPrompt, locale, translationResult.translated, enhanced);
    
    return {
      original: originalPrompt,
      translated: translationResult.translated,
      enhanced,
      fromCache: false
    };
  }

  /**
   * 获取模板库
   */
  getTemplates(category?: string, locale: string = 'zh-CN'): PromptTemplate[] {
    let templates = PROMPT_TEMPLATES.filter(t => t.locale === locale);
    
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    
    // 按热度排序
    return templates.sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * 根据ID获取模板
   */
  getTemplate(id: string): PromptTemplate | null {
    return PROMPT_TEMPLATES.find(t => t.id === id) || null;
  }

  /**
   * 搜索模板
   */
  searchTemplates(query: string, locale: string = 'zh-CN'): PromptTemplate[] {
    const lowerQuery = query.toLowerCase();
    
    return PROMPT_TEMPLATES
      .filter(t => t.locale === locale)
      .filter(t => 
        t.name.toLowerCase().includes(lowerQuery) ||
        t.prompt.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * 获取热门模板
   */
  getPopularTemplates(limit: number = 10, locale: string = 'zh-CN'): PromptTemplate[] {
    return PROMPT_TEMPLATES
      .filter(t => t.locale === locale)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return promptCache.getStats();
  }

  /**
   * 清理过期缓存
   */
  cleanupCache(): void {
    promptCache.cleanup();
  }

  /**
   * 预热缓存（预处理热门模板）
   */
  async warmupCache(): Promise<void> {
    console.log('🔥 开始预热提示词缓存...');
    
    const popularTemplates = this.getPopularTemplates(20);
    
    for (const template of popularTemplates) {
      // 预处理热门模板，存入缓存
      promptCache.set(
        template.prompt,
        template.locale,
        template.enhancedPrompt,
        template.enhancedPrompt
      );
    }
    
    console.log(`✅ 缓存预热完成，预处理了 ${popularTemplates.length} 个模板`);
  }
}

// 导出单例实例
export const promptCacheManager = new PromptCacheManager();

// 定期清理过期缓存（每小时执行一次）
if (typeof window !== 'undefined') {
  setInterval(() => {
    promptCacheManager.cleanupCache();
  }, 60 * 60 * 1000);
}
