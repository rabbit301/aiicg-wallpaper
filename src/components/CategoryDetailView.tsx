'use client';

import { useState, useEffect } from 'react';
import { User, Image, Play, Radio, Download, Heart, Share2, Grid3X3, List, Filter } from 'lucide-react';
import Link from 'next/link';

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
}

interface CategoryDetailViewProps {
  category: string;
}

const categoryConfig = {
  avatar: {
    name: '头像',
    icon: User,
    description: '个性头像和角色形象，展现独特的个人风格',
    color: 'from-primary-500 to-primary-600',
    bgColor: 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
  },
  wallpaper: {
    name: '壁纸',
    icon: Image,
    description: '精美背景和壁纸，为您的设备增添美感',
    color: 'from-secondary-500 to-secondary-600',
    bgColor: 'from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20',
  },
  animation: {
    name: '动画',
    icon: Play,
    description: '创意动画和特效，带来生动的视觉体验',
    color: 'from-accent-500 to-accent-600',
    bgColor: 'from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20',
  },
  live: {
    name: '直播',
    icon: Radio,
    description: '直播元素和装饰，提升直播间的视觉效果',
    color: 'from-success-500 to-success-600',
    bgColor: 'from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20',
  }
};

export default function CategoryDetailView({ category }: CategoryDetailViewProps) {
  const [images, setImages] = useState<GiphyImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const config = categoryConfig[category as keyof typeof categoryConfig];

  useEffect(() => {
    fetchImages();
  }, [category]);

  const fetchImages = async (pageNum: number = 1) => {
    try {
      setLoading(pageNum === 1);
      const limit = 20;
      const offset = (pageNum - 1) * limit;
      
      const response = await fetch(`/api/giphy-content?category=${category}&limit=${limit}&offset=${offset}`);
      const data = await response.json();
      
      if (data.success) {
        if (pageNum === 1) {
          setImages(data.data);
        } else {
          setImages(prev => [...prev, ...data.data]);
        }
        setHasMore(data.hasMore);
      } else {
        setError(data.error || '获取数据失败');
      }
    } catch (err) {
      setError('网络错误');
      console.error('获取图片数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchImages(nextPage);
  };

  const downloadImage = async (image: GiphyImage) => {
    try {
      const response = await fetch(image.webp_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.title || 'image'}-${image.id}.webp`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  if (!config) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            分类不存在
          </h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <div className="p-6">
          {/* Category Icon and Title */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              {config.name}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {config.description}
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-4 mb-8">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {images.length}+
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                内容数量
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-success-600">
                高清
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                画质保证
              </div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-primary-600">
                免费
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                下载使用
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              显示模式
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Grid3X3 className="h-5 w-5 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'list'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <List className="h-5 w-5 mx-auto" />
              </button>
            </div>
          </div>

          {/* Filter Options */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              筛选选项
            </label>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200">
              <Filter className="h-4 w-4" />
              <span>高级筛选</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {config.name}内容
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                共 {images.length} 个内容
              </p>
            </div>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              返回首页
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && images.length === 0 ? (
            <div className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-neutral-200 dark:bg-neutral-700 rounded-xl aspect-square mb-4"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-2xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-error-700 dark:text-error-300 mb-2">
                  加载失败
                </h3>
                <p className="text-error-600 dark:text-error-400 mb-4">
                  {error}
                </p>
                <button
                  onClick={() => fetchImages()}
                  className="px-6 py-3 bg-error-600 text-white font-medium rounded-lg hover:bg-error-700 transition-colors duration-200"
                >
                  重试
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Images Grid */}
              <div className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`group bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-xl transition-all duration-200 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-32 flex-shrink-0' : 'aspect-square'}`}>
                      <img
                        src={image.webp_url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadImage(image)}
                            className="p-2 bg-white rounded-lg text-neutral-900 hover:bg-neutral-100 transition-colors duration-200"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button className="p-2 bg-white rounded-lg text-neutral-900 hover:bg-neutral-100 transition-colors duration-200">
                            <Heart className="h-4 w-4" />
                          </button>
                          <button className="p-2 bg-white rounded-lg text-neutral-900 hover:bg-neutral-100 transition-colors duration-200">
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 flex-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2 text-sm">
                        {image.title}
                      </h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {image.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {image.width} × {image.height}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    加载更多
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
