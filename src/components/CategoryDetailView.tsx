'use client';

import { useState, useEffect } from 'react';
import { User, Image, Play, Radio, Download, Grid3X3, List, Filter, Eye, Clock, Star, TrendingUp, X } from 'lucide-react';

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

const categoryConfig = {
  avatar: {
    name: '头像',
    icon: User,
    description: '个性头像和角色形象，展现独特的个人风格',
    color: 'from-primary-500 to-primary-600',
    bgColor: 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
    subcategories: [
      { id: 'anime', name: '动漫头像', icon: '🎭', count: 156 },
      { id: 'cute', name: '可爱头像', icon: '🥰', count: 89 },
      { id: 'kawaii', name: 'Kawaii风格', icon: '💖', count: 67 },
      { id: 'chibi', name: 'Q版头像', icon: '😊', count: 45 },
      { id: 'cartoon', name: '卡通头像', icon: '🎨', count: 78 }
    ],
    filters: [
      { id: 'style', name: '风格', options: ['可爱', '酷炫', '简约', '复古'] },
      { id: 'color', name: '色彩', options: ['彩色', '黑白', '渐变', '单色'] },
      { id: 'emotion', name: '情感', options: ['开心', '酷炫', '温暖', '神秘'] }
    ]
  },
  wallpaper: {
    name: '壁纸',
    icon: Image,
    description: '高质量壁纸，适配各种设备屏幕',
    color: 'from-secondary-500 to-secondary-600',
    bgColor: 'from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20',
    subcategories: [
      { id: 'landscape', name: '风景壁纸', icon: '🏔️', count: 234 },
      { id: 'abstract', name: '抽象艺术', icon: '🎨', count: 178 },
      { id: 'space', name: '太空宇宙', icon: '🌌', count: 145 },
      { id: 'urban', name: '城市风光', icon: '🏙️', count: 167 },
      { id: 'nature', name: '自然风光', icon: '🌿', count: 203 },
      { id: 'minimal', name: '简约风格', icon: '⚪', count: 124 }
    ],
    filters: [
      { id: 'resolution', name: '分辨率', options: ['4K', '2K', '1080p', '720p'] },
      { id: 'orientation', name: '方向', options: ['横向', '竖向', '正方形'] },
      { id: 'color_scheme', name: '色调', options: ['暖色调', '冷色调', '中性色', '高对比'] }
    ]
  },
  animation: {
    name: '动画',
    icon: Play,
    description: '动态效果和动画资源，为内容增添活力',
    color: 'from-accent-500 to-accent-600',
    bgColor: 'from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20',
    subcategories: [
      { id: 'particle', name: '粒子动画', icon: '✨', count: 67 },
      { id: 'geometric', name: '几何动画', icon: '🔷', count: 54 },
      { id: 'fluid', name: '流体动画', icon: '🌊', count: 43 },
      { id: 'abstract', name: '抽象动画', icon: '🎭', count: 38 },
      { id: 'motion', name: '运动图形', icon: '🔄', count: 52 }
    ],
    filters: [
      { id: 'duration', name: '时长', options: ['短循环', '中等', '长循环'] },
      { id: 'speed', name: '速度', options: ['慢速', '正常', '快速'] },
      { id: 'complexity', name: '复杂度', options: ['简单', '中等', '复杂'] }
    ]
  },
  live: {
    name: '直播',
    icon: Radio,
    description: '直播相关的素材和动画效果',
    color: 'from-error-500 to-error-600',
    bgColor: 'from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20',
    subcategories: [
      { id: 'streaming', name: '直播指示器', icon: '🔴', count: 23 },
      { id: 'alert', name: '提醒动画', icon: '🚨', count: 19 },
      { id: 'overlay', name: '叠加层', icon: '📺', count: 31 },
      { id: 'graphics', name: '直播图形', icon: '🎬', count: 27 },
      { id: 'transition', name: '转场效果', icon: '🔄', count: 15 }
    ],
    filters: [
      { id: 'platform', name: '平台', options: ['Twitch', 'YouTube', '抖音', '通用'] },
      { id: 'style', name: '风格', options: ['专业', '趣味', '简约', '华丽'] },
      { id: 'color', name: '颜色', options: ['红色', '蓝色', '绿色', '彩虹'] }
    ]
  }
};

const sortOptions = [
  { id: 'latest', name: '最新上传', icon: Clock },
  { id: 'popular', name: '最受欢迎', icon: TrendingUp },
  { id: 'downloads', name: '下载最多', icon: Download },
  { id: 'rating', name: '评分最高', icon: Star }
];

export default function CategoryDetailView({ category }: CategoryDetailViewProps) {
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

  const config = categoryConfig[category as keyof typeof categoryConfig];

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
          分类未找到
        </h1>
      </div>
    );
  }

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* 页面头部 */}
      <div className={`bg-gradient-to-r ${config.bgColor} border-b dark:border-neutral-800`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${config.color} text-white`}>
              <IconComponent className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                {config.name}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                {config.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* 侧边栏 */}
          <div className="w-48 flex-shrink-0">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 space-y-6">
              {/* 子分类 */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  子分类
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
                      全部
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
                  筛选
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
                  排序方式
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
                  共 {images.length} 项结果
                </span>
              </div>
            </div>

            {/* 内容区域 */}
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-neutral-200 dark:bg-neutral-700"></div>
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
                  重试
                </button>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 dark:text-neutral-600 mb-4">
                  <Eye className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">暂无内容</p>
                  <p className="text-sm">尝试调整筛选条件</p>
                </div>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-1 lg:grid-cols-2 gap-8"
                  : "space-y-6"
              }>
                {images.map((image) => (
                  <div key={image.id} className={
                    viewMode === 'grid'
                      ? "group bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm cursor-pointer"
                      : "flex bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm cursor-pointer"
                  }
                  onClick={() => setSelectedImage(image)}
                  >
                    <div className={viewMode === 'grid' ? "relative aspect-[4/3] overflow-hidden" : "relative w-64 h-40 overflow-hidden flex-shrink-0"}>
                      <img
                        src={
                          // 优先显示gif动图，确保动画效果
                          image.type === 'gif' || image.url.includes('.gif') 
                            ? image.url 
                            : image.thumbnail || image.url
                        }
                        alt={image.title}
                        className="w-full h-full object-cover"
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
                      {/* 移除复杂的悬停按钮，直接点击预览 */}
                      
                      {/* 简化 - 移除悬停信息，保持极简 */}
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
                    上一页
                  </button>
                  <span className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">
                    第 {currentPage} 页
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={images.length < itemsPerPage}
                    className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
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
                title="下载"
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
              <span className="font-medium">{selectedImage.title || '精美壁纸'}</span>
              <span className="mx-2 text-white/60">•</span>
              <span className="text-white/80">{selectedImage.width} × {selectedImage.height}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
