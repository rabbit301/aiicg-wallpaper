'use client';

import { useState, useEffect } from 'react';
import { User, Image, Play, Radio, Download, Grid3X3, List, Filter, Eye, Clock, Star, TrendingUp, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UnifiedWallpaperImage {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  category: 'avatar' | 'wallpaper' | 'animation' | 'live';
  tags: string[];
  source: string;
  license: string;
  author?: string;
  downloadUrl: string;
  type: 'gif' | 'photo' | 'video';
}

interface CategoryDetailViewProps {
  category: string;
}

// 移除旧的硬编码分类配置，已替换为动态配置

// 排序选项移到组件内部，使用翻译

export default function CategoryDetailView({ category }: CategoryDetailViewProps) {
  const { t } = useLanguage();
  const [images, setImages] = useState<UnifiedWallpaperImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedImage, setSelectedImage] = useState<UnifiedWallpaperImage | null>(null);

  // 动态分类配置，使用翻译
  const dynamicCategoryConfig = {
    wallpaper: {
      name: t('categories.wallpaper.name'),
      icon: Grid3X3,
      description: t('categories.wallpaper.description'),
      color: 'from-primary-500 to-primary-600',
      bgColor: 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
      subcategories: [
        { id: 'ai-generated', name: t('subcategories.ai-generated'), icon: '🤖', count: 156 },
        { id: 'avatar', name: t('subcategories.avatar'), icon: '👤', count: 89 },
        { id: 'animation', name: t('subcategories.animation'), icon: '🎬', count: 134 },
        { id: 'nature', name: t('subcategories.nature'), icon: '🌲', count: 203 },
        { id: 'abstract', name: t('subcategories.abstract'), icon: '🎨', count: 167 },
        { id: 'minimal', name: t('subcategories.minimal'), icon: '⚪', count: 145 }
      ],
      filters: [
        { id: 'resolution', name: t('filters.resolution'), options: ['1080p', '2K', '4K', '8K'] },
        { id: 'orientation', name: t('filters.orientation'), options: [t('filterOptions.horizontal'), t('filterOptions.vertical'), t('filterOptions.square')] },
        { id: 'style', name: t('filters.style'), options: [t('filterOptions.modern'), t('filterOptions.vintage'), t('filterOptions.artistic')] }
      ]
    },
    avatar: {
      name: t('categories.avatar.name'),
      icon: User,
      description: t('categories.avatar.description'),
      color: 'from-secondary-500 to-secondary-600',
      bgColor: 'from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20',
      subcategories: [
        { id: 'cartoon', name: t('subcategories.cartoon'), icon: '🎭', count: 89 },
        { id: 'realistic', name: t('subcategories.realistic'), icon: '👤', count: 67 },
        { id: 'anime', name: t('subcategories.anime'), icon: '🌸', count: 94 },
        { id: 'abstract', name: t('subcategories.abstract'), icon: '🎨', count: 45 },
        { id: 'minimal', name: t('subcategories.minimal'), icon: '⚪', count: 56 }
      ],
      filters: [
        { id: 'style', name: t('filters.style'), options: [t('filterOptions.cute'), t('filterOptions.cool'), t('filterOptions.elegant')] },
        { id: 'color', name: t('filters.color'), options: [t('filterOptions.bright'), t('filterOptions.dark'), t('filterOptions.colorful'), t('filterOptions.monochrome')] },
        { id: 'mood', name: t('filters.mood'), options: [t('filterOptions.cute'), t('filterOptions.cool'), t('filterOptions.artistic')] }
      ]
    },
    animation: {
      name: t('categories.animation.name'),
      icon: Play,
      description: t('categories.animation.description'),
      color: 'from-accent-500 to-accent-600',
      bgColor: 'from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20',
      subcategories: [
        { id: 'particle', name: t('subcategories.animation'), icon: '✨', count: 67 },
        { id: 'geometric', name: t('subcategories.abstract'), icon: '🔷', count: 54 },
        { id: 'fluid', name: t('subcategories.animation'), icon: '🌊', count: 43 },
        { id: 'abstract', name: t('subcategories.abstract'), icon: '🎭', count: 38 },
        { id: 'motion', name: t('subcategories.animation'), icon: '🔄', count: 52 }
      ],
      filters: [
        { id: 'type', name: t('filters.type'), options: ['GIF', 'Video', 'SVG'] },
        { id: 'style', name: t('filters.style'), options: [t('filterOptions.modern'), t('filterOptions.artistic')] }
      ]
    }
  };

  const config = dynamicCategoryConfig[category as keyof typeof dynamicCategoryConfig];

  // 排序选项，使用翻译
  const sortOptions = [
    { id: 'latest', name: t('sort.latest'), icon: Clock },
    { id: 'popular', name: t('sort.popular'), icon: TrendingUp },
    { id: 'downloads', name: t('sort.downloads'), icon: Download },
    { id: 'rating', name: t('sort.rating'), icon: Star }
  ];

  useEffect(() => {
    fetchImages();
  }, [category, selectedSubcategory, selectedFilters, sortBy, currentPage]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        category,
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString()
      });

      if (selectedSubcategory !== 'all') {
        params.append('subcategory', selectedSubcategory);
      }

      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      if (sortBy !== 'latest') {
        params.append('sort', sortBy);
      }

      const response = await fetch(`/api/giphy-content?${params}`);
      if (!response.ok) {
        throw new Error('获取图片失败');
      }

      const data = await response.json();
      if (data.success) {
        setImages(data.data || []);
      } else {
        throw new Error(data.error || '获取数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterId: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: prev[filterId] === value ? '' : value
    }));
    setCurrentPage(1); // 重置到第一页
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  const handleDownload = async (image: UnifiedWallpaperImage) => {
    try {
      const response = await fetch(`/api/download-proxy?url=${encodeURIComponent(image.url)}`);
      if (!response.ok) throw new Error('下载失败');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.title || 'image'}.${image.type === 'gif' ? 'gif' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  if (!config) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {t('categoryPage.categoryNotFound')}
        </h1>
      </div>
    );
  }

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* 优化的页面头部 */}
      <div className={`bg-gradient-to-r ${config.bgColor} border-b border-neutral-200/50 dark:border-neutral-800/50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${config.color} text-white shadow-lg`}>
                <IconComponent className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                  {config.name}
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-sm lg:text-base">
                  {config.description}
                </p>
              </div>
            </div>
            
            {/* 统计信息 */}
            <div className="flex items-center space-x-6">
                          <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {images.length}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {t('categoryPage.beautifulContent')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {Math.ceil(images.length / 20)}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {t('categoryPage.pages')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ∞
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {t('categoryPage.freeDownload')}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* 侧边栏 - 适配极简主导航 */}
          <div className="w-32 flex-shrink-0">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 space-y-6">
              {/* 子分类 */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  {t('categoryPage.subcategories')}
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedSubcategory === 'all'
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="mr-3">📂</span>
                      {t('categoryPage.all')}
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {images.length}
                    </span>
                  </button>

                  {config.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategory(sub.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedSubcategory === sub.id
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span className="flex items-center">
                        <span className="mr-3">{sub.icon}</span>
                        {sub.name}
                      </span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {sub.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 筛选器 */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  {t('categoryPage.filters')}
                </h3>
                <div className="space-y-4">
                  {config.filters.map((filter) => (
                    <div key={filter.id}>
                      <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        {filter.name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {filter.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleFilterChange(filter.id, option)}
                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                              selectedFilters[filter.id] === option
                                ? 'bg-primary-600 text-white'
                                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 排序 */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  {t('categoryPage.sortBy')}
                </h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                          sortBy === option.id
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 mr-3" />
                        {option.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="flex-1">
            {/* 工具栏 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white dark:bg-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {t('categoryPage.totalResults').replace('{count}', images.length.toString())}
                </span>
              </div>
            </div>

            {/* 内容区域 - 改为瀑布流布局 */}
            {loading ? (
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="break-inside-avoid mb-6">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden animate-pulse">
                      <div className={`aspect-[${Math.random() > 0.5 ? '3/4' : '4/3'}] bg-neutral-200 dark:bg-neutral-700`}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-error-600 dark:text-error-400 mb-4">
                  <Filter className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">{error}</p>
                </div>
                <button
                  onClick={fetchImages}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t('categoryPage.retry')}
                </button>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 dark:text-neutral-600 mb-4">
                  <Eye className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">{t('categoryPage.noContent')}</p>
                  <p className="text-sm">{t('categoryPage.noContentDesc')}</p>
                </div>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="break-inside-avoid mb-6 cursor-pointer group"
                  onClick={() => setSelectedImage(image)}
                  >
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="relative overflow-hidden">
                        <img
                          src={
                            // 优先显示gif动图，确保动画效果
                            image.type === 'gif' || image.url.includes('.gif') 
                              ? image.url 
                              : image.thumbnail || image.url
                          }
                          alt={image.title}
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // gif加载失败时的智能fallback
                            if (target.src === image.url && image.thumbnail && image.thumbnail !== image.url) {
                              target.src = image.thumbnail;
                            } else {
                              handleImageError(e);
                            }
                          }}
                          loading="lazy"
                        />
                        
                        {/* 悬停时的渐变遮罩 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* 标题显示在底部 */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="text-sm font-medium truncate">{image.title}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 分页 */}
            {images.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('categoryPage.previousPage')}
                  </button>
                  <span className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {t('categoryPage.pageInfo').replace('{page}', currentPage.toString())}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={images.length < itemsPerPage}
                    className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('categoryPage.nextPage')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 预览模态框 - 极简版 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center" 
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
              onError={handleImageError}
            />
            
            {/* 顶部简洁工具栏 */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
                              <button
                  onClick={() => handleDownload(selectedImage)}
                  className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                  title={t('categoryPage.download')}
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
            </div>
            
            {/* 底部迷你信息条 */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-2 rounded text-sm backdrop-blur-sm">
              <span className="font-medium">{selectedImage.title || t('categoryPage.imageInfo')}</span>
              <span className="mx-2 text-white/60">•</span>
              <span className="text-white/80">{t('categoryPage.resolution').replace('{width}', selectedImage.width.toString()).replace('{height}', selectedImage.height.toString())}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
