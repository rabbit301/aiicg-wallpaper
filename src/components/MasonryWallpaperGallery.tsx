'use client';

import { useState, useEffect } from 'react';
import { Wallpaper } from '@/types';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

import { Heart, Eye, Wand2, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MasonryWallpaperGalleryProps {
  showPopular?: boolean;
  limit?: number;
  category?: string;
}

export default function MasonryWallpaperGallery({ 
  showPopular = true, 
  limit = 12,
  category 
}: MasonryWallpaperGalleryProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetchWallpapers();
  }, [showPopular, limit, category]);

  const fetchWallpapers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (category) params.append('category', category);
      if (showPopular) params.append('popular', 'true');

      const response = await fetch(`/api/wallpapers?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch wallpapers');
      }

      const data = await response.json();
      setWallpapers(data.wallpapers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (wallpaper: Wallpaper) => {
    router.push(`/wallpaper/${wallpaper.id}`);
  };



  // 生成同款功能
  const handleGenerateSimilar = (wallpaper: Wallpaper, e: React.MouseEvent) => {
    e.stopPropagation();
    
    let prompt = wallpaper.title || '';
    if (wallpaper.tags && wallpaper.tags.length > 0) {
      prompt += ', ' + wallpaper.tags.join(', ');
    }
    if (wallpaper.style) {
      prompt += ', ' + wallpaper.style;
    }
    if (!prompt.trim()) {
      prompt = '类似风格的精美壁纸';
    }
    
    const encodedPrompt = encodeURIComponent(prompt);
    router.push(`/generate?prompt=${encodedPrompt}&reference=${wallpaper.id}`);
  };

  // 点赞功能
  const handleLike = (wallpaper: Wallpaper, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: 实现点赞功能
    console.log('点赞壁纸:', wallpaper.id);
  };

  // 获取随机高度（模拟不同比例的图片）
  const getRandomHeight = (index: number) => {
    const heights = [200, 250, 300, 350, 280, 320];
    return heights[index % heights.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">
          加载中...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (wallpapers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">
          暂无壁纸
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 即梦AI风格的瀑布流布局 */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {wallpapers.map((wallpaper, index) => (
          <div
            key={wallpaper.id}
            className="break-inside-avoid mb-4 group cursor-pointer"
            onMouseEnter={() => setHoveredId(wallpaper.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handlePreview(wallpaper)}
          >
            <div className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* 图片容器 - 无边框，纯图片展示 */}
              <div className="relative overflow-hidden">
                <Image
                  src={wallpaper.imageUrl}
                  alt={wallpaper.title}
                  width={300}
                  height={getRandomHeight(index)}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ aspectRatio: 'auto' }}
                />

                {/* 悬停遮罩 - 仅在悬停时显示信息 */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                  hoveredId === wallpaper.id ? 'opacity-100' : 'opacity-0'
                }`}>

                  {/* 右上角点赞按钮 */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => handleLike(wallpaper, e)}
                      className="w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                    >
                      <Heart className="h-4 w-4 text-white" />
                    </button>
                  </div>

                  {/* 底部信息区域 - 仅悬停时显示 */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {/* 标题 */}
                    <h3 className="text-white font-medium mb-2 line-clamp-2">
                      {wallpaper.title}
                    </h3>

                    {/* 作者信息 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">AI</span>
                        </div>
                        <span className="text-white/90 text-sm">AI创作者</span>
                      </div>

                      {/* 统计信息 */}
                      <div className="flex items-center gap-3 text-white/80 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{wallpaper.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{wallpaper.likes || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(wallpaper);
                        }}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看详情
                      </button>
                      <button
                        onClick={(e) => handleGenerateSimilar(wallpaper, e)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600/80 hover:bg-purple-600 backdrop-blur-sm text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Wand2 className="h-4 w-4 mr-1" />
                        生成同款
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


    </>
  );
}
