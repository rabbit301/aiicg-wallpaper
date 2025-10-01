'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Grid3X3, List, Filter, Download, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';

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

// 防抖 hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function WallpaperPage() {
  const { t } = useLanguage();
  const [images, setImages] = useState<UnifiedWallpaperImage[]>([]);
  const [allImages, setAllImages] = useState<UnifiedWallpaperImage[]>([]); // 存储所有图片用于本地筛选
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedImage, setSelectedImage] = useState<UnifiedWallpaperImage | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 防抖处理
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedFilters = useDebounce(selectedFilters, 300);

  // 分类配置
  const categories = [
    { id: 'all', name: t('categoryPage.all'), icon: '📂' },
    { id: 'ai-generated', name: t('subcategories.ai-generated'), icon: '🤖' },
    { id: 'nature', name: t('subcategories.nature'), icon: '🌲' },
    { id: 'abstract', name: t('subcategories.abstract'), icon: '🎨' },
    { id: 'minimal', name: t('subcategories.minimal'), icon: '⚪' },
    { id: 'anime', name: t('subcategories.anime'), icon: '🌸' },
    { id: 'realistic', name: t('subcategories.realistic'), icon: '📷' },
    { id: 'cartoon', name: t('subcategories.cartoon'), icon: '🎭' }
  ];

  // 排序选项
  const sortOptions = [
    { id: 'latest', name: t('sort.latest') },
    { id: 'popular', name: t('sort.popular') },
    { id: 'downloads', name: t('sort.downloads') },
    { id: 'rating', name: t('sort.rating') }
  ];

  // 筛选选项
  const filterOptions = {
    resolution: ['1080p', '2K', '4K', '8K'],
    orientation: [t('filterOptions.horizontal'), t('filterOptions.vertical'), t('filterOptions.square')],
    style: [t('filterOptions.modern'), t('filterOptions.vintage'), t('filterOptions.artistic')]
  };

  // 初始数据加载
  useEffect(() => {
    fetchInitialImages();
  }, []);

  // 筛选和搜索变化时的处理
  useEffect(() => {
    if (allImages.length > 0) {
      handleFilterAndSearch();
    }
  }, [debouncedSearchQuery, debouncedFilters, selectedCategory, sortBy]);

  // 点击外部关闭筛选面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showFilters && !target.closest('.filter-panel') && !target.closest('.filter-button')) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  const fetchInitialImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/giphy-content?category=wallpaper&limit=100');
      if (!response.ok) {
        throw new Error('获取图片失败');
      }

      const data = await response.json();
      if (data.success) {
        const imageData = data.data || [];
        setAllImages(imageData);
        setImages(imageData.slice(0, itemsPerPage));
      } else {
        throw new Error(data.error || '获取数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterAndSearch = useCallback(() => {
    setFilterLoading(true);
    
    // 使用 setTimeout 来模拟异步处理，避免阻塞 UI
    setTimeout(() => {
      let filteredImages = [...allImages];

      // 搜索筛选
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        filteredImages = filteredImages.filter(image => 
          image.title.toLowerCase().includes(query) ||
          image.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // 分类筛选
      if (selectedCategory !== 'all') {
        filteredImages = filteredImages.filter(image => 
          image.tags.includes(selectedCategory) ||
          image.category === selectedCategory
        );
      }

      // 其他筛选条件
      Object.entries(debouncedFilters).forEach(([filterId, value]) => {
        if (value) {
          switch (filterId) {
            case 'resolution':
              // 根据分辨率筛选（这里简化处理）
              break;
            case 'orientation':
              filteredImages = filteredImages.filter(image => {
                const ratio = image.width / image.height;
                if (value === t('filterOptions.horizontal')) return ratio > 1.2;
                if (value === t('filterOptions.vertical')) return ratio < 0.8;
                if (value === t('filterOptions.square')) return ratio >= 0.8 && ratio <= 1.2;
                return true;
              });
              break;
            case 'style':
              // 根据风格筛选（这里简化处理）
              break;
          }
        }
      });

      // 排序
      switch (sortBy) {
        case 'latest':
          filteredImages.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
          break;
        case 'popular':
          // 这里可以根据实际数据排序
          break;
        case 'downloads':
          // 这里可以根据实际数据排序
          break;
        case 'rating':
          // 这里可以根据实际数据排序
          break;
      }

      setImages(filteredImages.slice(0, itemsPerPage));
      setCurrentPage(1);
      setFilterLoading(false);
    }, 100);
  }, [allImages, debouncedSearchQuery, debouncedFilters, selectedCategory, sortBy, itemsPerPage, t]);

  const handleFilterChange = (filterId: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: prev[filterId] === value ? '' : value
    }));
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

  const clearFilters = () => {
    setSelectedFilters({});
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('latest');
  };

  const activeFiltersCount = Object.values(selectedFilters).filter(v => v).length + (searchQuery ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0);

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        {/* 顶部导航栏 */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 主要导航区域 */}
            <div className="flex items-center justify-between h-20">
              {/* 左侧标题区域 */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Grid3X3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {t('categories.wallpaper.name')}
                    </h1>
                  </div>
                </div>
              </div>

              {/* 中央搜索区域 */}
              <div className="flex-1 max-w-2xl mx-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors duration-200" />
                    <input
                      type="text"
                      placeholder={t('categoryPage.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm shadow-sm hover:shadow-md transition-all duration-200 group-hover:border-primary-300 dark:group-hover:border-primary-600"
                    />
                  </div>
                </div>
              </div>

              {/* 右侧工具栏 */}
              <div className="flex items-center space-x-3">
                {/* 视图切换 */}
                <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-700/50'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-700/50'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* 筛选按钮 */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`filter-button flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                      activeFiltersCount > 0
                        ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300'
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-primary-300 dark:hover:border-primary-600'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('categoryPage.filters')}</span>
                    {activeFiltersCount > 0 && (
                      <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium shadow-sm">
                        {activeFiltersCount}
                      </span>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                  </button>

                  {/* 筛选面板 */}
                  {showFilters && (
                    <div className="filter-panel absolute right-0 top-full mt-3 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl z-50 backdrop-blur-sm">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">{t('categoryPage.filters')}</h3>
                          {activeFiltersCount > 0 && (
                            <button
                              onClick={clearFilters}
                              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                            >
                              {t('categoryPage.clearAll')}
                            </button>
                          )}
                        </div>

                        {/* 排序 */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                            {t('categoryPage.sortBy')}
                          </h4>
                          <div className="space-y-2">
                            {sortOptions.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => setSortBy(option.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                                  sortBy === option.id
                                    ? 'bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                                }`}
                              >
                                {option.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 筛选器 */}
                        {Object.entries(filterOptions).map(([filterId, options]) => (
                          <div key={filterId} className="mb-6">
                            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                              {t(`filters.${filterId}`)}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {options.map((option) => (
                                <button
                                  key={option}
                                  onClick={() => handleFilterChange(filterId, option)}
                                  className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-medium ${
                                    selectedFilters[filterId] === option
                                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:shadow-sm'
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
                  )}
                </div>
              </div>
            </div>

            {/* 分类标签栏 */}
            <div className="py-6">
              <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-5 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shadow-sm hover:shadow-md ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg transform scale-105'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 筛选加载状态 */}
          {filterLoading && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-700 dark:text-blue-300">正在筛选...</span>
              </div>
            </div>
          )}

          {/* 加载状态 */}
          {loading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="break-inside-avoid mb-6">
                  <div className="bg-neutral-200 dark:bg-neutral-700 rounded-2xl overflow-hidden animate-pulse">
                    <div className={`aspect-[${index % 2 === 0 ? '3/4' : '4/3'}]`}></div>
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
                onClick={fetchInitialImages}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('categoryPage.retry')}
              </button>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neutral-400 dark:text-neutral-600 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">{t('categoryPage.noContent')}</p>
                <p className="text-sm">{t('categoryPage.noContentDesc')}</p>
              </div>
            </div>
          ) : (
            <>
              {/* 瀑布流布局 */}
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {images.map((image) => (
                  <div key={image.id} className="break-inside-avoid mb-6 cursor-pointer group"
                  onClick={() => setSelectedImage(image)}
                  >
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="relative overflow-hidden">
                        <img
                          src={
                            image.type === 'gif' || image.url.includes('.gif') 
                              ? image.url 
                              : image.thumbnail || image.url
                          }
                          alt={image.title}
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src === image.url && image.thumbnail && image.thumbnail !== image.url) {
                              target.src = image.thumbnail;
                            } else {
                              handleImageError(e);
                            }
                          }}
                          loading="lazy"
                        />
                        
                        {/* 悬停遮罩 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* 底部信息 */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="text-sm font-medium truncate">{image.title}</h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-80">{image.width} × {image.height}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(image);
                              }}
                              className="p-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
            </>
          )}
        </div>

        {/* 图片预览模态框 */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" 
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain"
                onError={handleImageError}
              />
              
              {/* 顶部工具栏 */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="p-3 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                  title={t('categoryPage.download')}
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-3 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* 底部信息条 */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{selectedImage.title || t('categoryPage.imageInfo')}</span>
                    <span className="mx-2 text-white/60">•</span>
                    <span className="text-white/80">{selectedImage.width} × {selectedImage.height}</span>
                  </div>
                  <button
                    onClick={() => handleDownload(selectedImage)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">{t('categoryPage.download')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </Layout>
  );
} 