'use client';

import { useState, useEffect } from 'react';
// 移除所有无用的lucide-react imports
import { Wallpaper } from '@/types';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
// 移除复杂的图片优化导入，专注于 Next.js 原生优化

interface WallpaperGalleryProps {
  searchQuery?: string;
  tag?: string;
  showPopular?: boolean;
  limit?: number; // 限制显示数量
}

export default function WallpaperGallery({ 
  searchQuery, 
  tag, 
  showPopular = false,
  limit 
}: WallpaperGalleryProps) {
  const { t } = useLanguage();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWallpapers();
  }, [searchQuery, tag, showPopular]);

  const fetchWallpapers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (tag) params.append('tag', tag);
      if (showPopular) params.append('popular', 'true');
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/wallpapers?${params}`);
      const data = await response.json();

      if (data.success) {
        // 如果设置了 limit，在客户端也进行限制
        const wallpapers = limit ? data.wallpapers.slice(0, limit) : data.wallpapers;
        setWallpapers(wallpapers);
        
        // Next.js Image 组件将自动处理图片优化和预加载
      } else {
        setError(data.error || '获取壁纸失败');
      }
    } catch (err) {
      setError('网络错误');
      console.error('获取壁纸失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 移除未使用的handleDownload函数

  const handlePreview = (wallpaper: Wallpaper) => {
    window.open(wallpaper.imageUrl, '_blank');
  };

  // 移除复杂的图片处理逻辑，直接使用原始URL

  if (loading) {
    return (
      <div className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
            {t('gallery.loadFailed')}
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchWallpapers}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('gallery.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (wallpapers.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('gallery.noWallpapers')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? t('gallery.noMatches') : t('gallery.noGenerated')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wallpapers.map((wallpaper) => (
          <div
            key={wallpaper.id}
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-neutral-100 dark:border-neutral-700 transition-shadow duration-300 cursor-pointer"
            onClick={() => handlePreview(wallpaper)}
          >
            {/* 优化图片容器 */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:from-gray-50 dark:group-hover:from-gray-600 transition-all duration-300"
              style={{ minHeight: '240px' }}
            >
              <Image
                src={wallpaper.thumbnailUrl || wallpaper.imageUrl}
                alt={wallpaper.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={wallpapers.indexOf(wallpaper) < 3} // 前3张优先加载
                loading={wallpapers.indexOf(wallpaper) < 6 ? "eager" : "lazy"} // 前6张即时加载，其余懒加载
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // 如果缩略图加载失败，尝试加载原图
                  if (target.src === wallpaper.thumbnailUrl && wallpaper.thumbnailUrl !== wallpaper.imageUrl) {
                    target.src = wallpaper.imageUrl;
                  } else {
                    // 如果都失败，显示占位符
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBWMTMwTTcwIDEwMEgxMzAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                  }
                }}
              />

              {/* 微妙的悬停效果提升点击欲望 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">点击预览</span>
                </div>
              </div>

              {/* 精选badges - 仅保留真正有用的 */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                {/* 仅保留GIF动图标识 */}
                {(wallpaper.imageUrl.includes('.gif') || wallpaper.format === 'gif') && (
                  <div className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    GIF
                  </div>
                )}
                {/* HD高质量标识 */}
                {wallpaper.width >= 1920 && (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                    HD
                  </div>
                )}
              </div>
            </div>

            {/* 优化信息条 - 保持简洁但有质感 */}
            <div className="p-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                {wallpaper.title}
              </h3>
              
              {/* 基本元信息 */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{wallpaper.width} × {wallpaper.height}</span>
                <span className="uppercase font-medium">{wallpaper.format}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
