'use client';

import { useState, useEffect } from 'react';
import { User, Image as ImageIcon, Play, Radio, ChevronRight, Grid3X3, Wand2 } from 'lucide-react';
import Link from 'next/link';

interface GiphyImage {
  id: string;
  title: string;
  url: string;
  webp_url?: string;
  thumbnail?: string;
  mp4_url?: string;
  width: number;
  height: number;
  category: 'avatar' | 'wallpaper' | 'animation' | 'live' | 'ai-generated';
  tags: string[];
  rating?: string;
  source?: string;
}

interface CategoryData {
  category: string;
  count: number;
  preview: GiphyImage[];
}

interface LocalWallpaper {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  tags: string[];
  prompt?: string;
}

const categoryConfig = {
  'ai-generated': {
    name: 'AI生成',
    icon: Wand2,
    description: 'AI创作的独特壁纸',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  avatar: {
    name: '头像',
    icon: User,
    description: '个性头像和角色形象',
    color: 'from-primary-500 to-primary-600',
    bgColor: 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
    borderColor: 'border-primary-200 dark:border-primary-800'
  },
  wallpaper: {
    name: '壁纸',
    icon: ImageIcon,
    description: '精美背景和壁纸',
    color: 'from-secondary-500 to-secondary-600',
    bgColor: 'from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20',
    borderColor: 'border-secondary-200 dark:border-secondary-800'
  },
  animation: {
    name: '动画',
    icon: Play,
    description: '创意动画和特效',
    color: 'from-accent-500 to-accent-600',
    bgColor: 'from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20',
    borderColor: 'border-accent-200 dark:border-accent-800'
  },
  live: {
    name: '直播',
    icon: Radio,
    description: '直播元素和装饰',
    color: 'from-success-500 to-success-600',
    bgColor: 'from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20',
    borderColor: 'border-success-200 dark:border-success-800'
  }
};

export default function CategoryGallery() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取本地 AI 生成的壁纸
      const [wallpapersResponse, giphyResponse] = await Promise.allSettled([
        fetch('/api/wallpapers'),
        fetch('/api/giphy-content')
      ]);

      const categoriesData: CategoryData[] = [];

      // 处理本地 AI 生成壁纸
      if (wallpapersResponse.status === 'fulfilled') {
        const wallpapersResult = await wallpapersResponse.value.json();
        if (wallpapersResult.success && wallpapersResult.wallpapers.length > 0) {
          const aiWallpapers: GiphyImage[] = wallpapersResult.wallpapers.slice(0, 6).map((w: LocalWallpaper) => ({
            id: w.id,
            title: w.title,
            url: w.imageUrl,
            webp_url: w.thumbnailUrl,
            thumbnail: w.thumbnailUrl,
            width: w.width,
            height: w.height,
            category: 'ai-generated' as const,
            tags: w.tags,
            source: 'local'
          }));

          categoriesData.push({
            category: 'ai-generated',
            count: wallpapersResult.wallpapers.length,
            preview: aiWallpapers
          });
        }
      }

      // 处理外部资源
      if (giphyResponse.status === 'fulfilled') {
        const giphyResult = await giphyResponse.value.json();
        if (giphyResult.success && giphyResult.overview) {
          categoriesData.push(...giphyResult.overview);
        }
      }

      // 如果没有任何数据，添加示例数据
      if (categoriesData.length === 0) {
        categoriesData.push(
          {
            category: 'ai-generated',
            count: 0,
            preview: []
          },
          {
            category: 'wallpaper',
            count: 4,
            preview: [
              {
                id: 'sample-1',
                title: '示例壁纸 1',
                url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                webp_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                width: 400,
                height: 300,
                category: 'wallpaper',
                tags: ['landscape', 'nature'],
                source: 'unsplash'
              },
              {
                id: 'sample-2',
                title: '示例壁纸 2',
                url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
                webp_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
                width: 400,
                height: 300,
                category: 'wallpaper',
                tags: ['abstract', 'geometric'],
                source: 'unsplash'
              }
            ]
          }
        );
      }

      setCategories(categoriesData);
    } catch (err) {
      setError('加载内容失败');
      console.error('获取分类数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Grid3X3 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              加载中...
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              正在获取精彩内容
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-neutral-200 dark:bg-neutral-700 rounded-2xl h-64 mb-4"></div>
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-error-700 dark:text-error-300 mb-2">
              加载失败
            </h3>
            <p className="text-error-600 dark:text-error-400 mb-4">
              {error}
            </p>
            <button
              onClick={fetchCategories}
              className="px-6 py-3 bg-error-600 text-white font-medium rounded-lg hover:bg-error-700 transition-colors duration-200"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
              <Grid3X3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            精彩内容分类
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            探索丰富多样的视觉内容，从AI生成壁纸到精美背景，应有尽有
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {categories.map((categoryData) => {
            const config = categoryConfig[categoryData.category as keyof typeof categoryConfig];
            if (!config) return null;
            
            const Icon = config.icon;
            
            return (
              <Link
                key={categoryData.category}
                href={categoryData.category === 'ai-generated' ? '/generate' : `/category/${categoryData.category}`}
                className="group"
              >
                <div className={`bg-gradient-to-br ${config.bgColor} border ${config.borderColor} rounded-2xl p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}>
                  {/* Icon and Title */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                      {config.name}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">
                      {config.description}
                    </p>
                    <div className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">
                      {categoryData.count}+
                    </div>
                  </div>

                  {/* Preview Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {categoryData.preview.slice(0, 6).map((image, index) => (
                      <div
                        key={image.id}
                        className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-200"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <img
                          src={image.webp_url || image.thumbnail || image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            // 图片加载失败时显示占位符
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA4MEgxMjBWMTIwSDgwVjgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4=';
                          }}
                        />
                      </div>
                    ))}
                    {/* 如果预览图片不足6张，填充占位符 */}
                    {Array.from({ length: Math.max(0, 6 - categoryData.preview.length) }).map((_, index) => (
                      <div
                        key={`placeholder-${index}`}
                        className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center"
                      >
                        <ImageIcon className="h-6 w-6 text-neutral-400" />
                      </div>
                    ))}
                  </div>

                  {/* View More */}
                  <div className="flex items-center justify-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors duration-200">
                    <span className="text-sm font-medium mr-1">
                      {categoryData.category === 'ai-generated' ? '开始创作' : '查看更多'}
                    </span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}+
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">
                总内容数量
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {categories.length}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">
                内容分类
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-600 mb-2">
                24/7
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">
                持续更新
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
