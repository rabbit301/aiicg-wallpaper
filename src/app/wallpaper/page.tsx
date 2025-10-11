'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Download, X, Filter } from 'lucide-react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api-client';

interface WallpaperFolder {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

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
  folderId?: string;
  is_public?: boolean;
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
  const [images, setImages] = useState<UnifiedWallpaperImage[]>([]);
  const [allImages, setAllImages] = useState<UnifiedWallpaperImage[]>([]);
  const [folders, setFolders] = useState<WallpaperFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24);
  const [selectedImage, setSelectedImage] = useState<UnifiedWallpaperImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNSFW, setShowNSFW] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // 防抖处理
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 分类配置 - 简化设计
  const categories = [
    { id: 'all', name: '全部', icon: '🎨' },
    { id: 'ai-generated', name: 'AI创作', icon: '🤖' },
    { id: 'nature', name: '自然风光', icon: '🌲' },
    { id: 'abstract', name: '抽象艺术', icon: '✨' },
    { id: 'minimal', name: '极简设计', icon: '⚪' },
    { id: 'anime', name: '动漫二次元', icon: '🌸' },
    { id: 'realistic', name: '写实摄影', icon: '📷' },
    { id: 'cyberpunk', name: '赛博朋克', icon: '🌃' }
  ];

  // 加载文件夹列表
  const fetchFolders = async () => {
    try {
      const res: any = await api.wallpapers.getFolders();
      const folderData = res?.data?.folders || res?.folders || [];
      setFolders(folderData);
    } catch (err) {
      console.error('加载文件夹失败:', err);
    }
  };

  // 初始数据加载
  useEffect(() => {
    fetchFolders();
    fetchInitialImages();
  }, []);

  // 筛选和搜索变化时的处理
  useEffect(() => {
    if (allImages.length > 0) {
      handleFilterAndSearch();
    }
  }, [debouncedSearchQuery, selectedCategory, selectedFolder, showNSFW]);

  const fetchInitialImages = async () => {
    try {
      setLoading(true);
      setError(null);

      // 尝试从新的文件夹系统 API 获取
      try {
        const response: any = await api.wallpapers.getPublic({
          limit: 100,
          nsfw: showNSFW
        });
        if (response?.data?.wallpapers || response?.wallpapers) {
          const imageData = response?.data?.wallpapers || response?.wallpapers || [];
          setAllImages(imageData);
          setImages(imageData.slice(0, itemsPerPage));
          return;
        }
      } catch (apiErr) {
        console.log('新API暂未实现，使用备用数据源');
      }

      // 备用：使用原有的 giphy 数据源
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
    let filteredImages = [...allImages];

    // NSFW 过滤
    if (!showNSFW) {
      filteredImages = filteredImages.filter(image =>
        !image.tags.includes('nsfw')
      );
    }

    // 搜索筛选
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filteredImages = filteredImages.filter(image =>
        image.title.toLowerCase().includes(query) ||
        image.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 文件夹筛选
    if (selectedFolder !== 'all') {
      filteredImages = filteredImages.filter(image =>
        image.folderId === selectedFolder
      );
    }

    // 分类筛选
    if (selectedCategory !== 'all') {
      filteredImages = filteredImages.filter(image =>
        image.tags.includes(selectedCategory) ||
        image.category === selectedCategory
      );
    }

    setImages(filteredImages.slice(0, itemsPerPage * currentPage));
  }, [allImages, debouncedSearchQuery, selectedCategory, selectedFolder, itemsPerPage, currentPage, showNSFW]);

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

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* 简洁顶部导航 */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-[1400px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-6">
              {/* 左侧标题 */}
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                精选壁纸
              </h1>

              {/* 中央搜索框 */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="搜索壁纸..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-neutral-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* 右侧控制 */}
              <div className="flex items-center gap-3">
                {/* NSFW 开关 */}
                <label className="relative cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNSFW}
                    onChange={(e) => setShowNSFW(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 peer-checked:bg-neutral-900 dark:peer-checked:bg-white peer-checked:text-white dark:peer-checked:text-neutral-900 transition-all text-sm font-medium whitespace-nowrap">
                    18+
                  </div>
                </label>

                {/* 筛选按钮 */}
                <button
                  onClick={() => setShowFilterDrawer(true)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all text-sm font-medium whitespace-nowrap"
                >
                  <Filter className="h-4 w-4" />
                  <span>筛选</span>
                  {(selectedFolder !== 'all' || selectedCategory !== 'all') && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-neutral-900 dark:bg-white rounded-full"></span>
                  )}
                </button>
              </div>
            </div>

            {/* 分类标签 */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 筛选侧边栏 */}
        {showFilterDrawer && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowFilterDrawer(false)}
            ></div>

            <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-neutral-900 shadow-2xl z-50 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">筛选</h3>
                  <button
                    onClick={() => setShowFilterDrawer(false)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 全部文件夹 */}
                  <button
                    onClick={() => {
                      setSelectedFolder('all');
                      setShowFilterDrawer(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      selectedFolder === 'all'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                        : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <span className="text-2xl">📂</span>
                    <div className="flex-1">
                      <div className="font-medium">全部文件夹</div>
                      <div className="text-xs opacity-60">显示所有壁纸</div>
                    </div>
                  </button>

                  {/* 文件夹列表 */}
                  {folders.length > 0 && (
                    <>
                      <div className="py-2">
                        <div className="h-px bg-neutral-200 dark:bg-neutral-800"></div>
                      </div>
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => {
                            setSelectedFolder(folder.id);
                            setShowFilterDrawer(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            selectedFolder === folder.id
                              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                              : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }`}
                        >
                          <span className="text-2xl">{folder.icon || '📁'}</span>
                          <div className="flex-1">
                            <div className="font-medium">{folder.name}</div>
                            {folder.count > 0 && (
                              <div className="text-xs opacity-60">{folder.count} 张壁纸</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 主内容区域 */}
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchInitialImages}
                className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full hover:opacity-90 transition-opacity font-medium"
              >
                重试
              </button>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-24">
              <Search className="h-16 w-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-700" />
              <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">没有找到壁纸</p>
              <p className="text-sm text-neutral-500 mt-2">尝试调整筛选条件或搜索关键词</p>
            </div>
          ) : (
            <>
              {/* 瀑布流网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="group cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 hover:ring-2 hover:ring-neutral-900 dark:hover:ring-white transition-all">
                      <img
                        src={image.type === 'gif' || image.url.includes('.gif') ? image.url : image.thumbnail || image.url}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* 悬停信息 */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">{image.title}</h3>
                        <div className="flex items-center justify-between text-xs">
                          <span>{image.width} × {image.height}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image);
                            }}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 加载更多 */}
              {images.length < allImages.length && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full hover:opacity-90 transition-opacity font-medium"
                  >
                    加载更多
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 图片预览模态框 */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain rounded-2xl"
                onError={handleImageError}
              />

              {/* 顶部工具栏 */}
              <div className="absolute top-6 right-6 flex items-center gap-3">
                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 底部信息条 */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl text-white px-6 py-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{selectedImage.title}</h3>
                    <div className="flex items-center gap-3 text-sm opacity-80">
                      <span>{selectedImage.width} × {selectedImage.height}</span>
                      {selectedImage.tags && selectedImage.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{selectedImage.tags.slice(0, 3).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(selectedImage)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all font-medium"
                  >
                    <Download className="h-4 w-4" />
                    <span>下载</span>
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
