'use client';

import { useState, useEffect } from 'react';
import { Download, Eye, Clock, Tag } from 'lucide-react';
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

  const handleDownload = async (wallpaper: Wallpaper) => {
    try {
      // 更新下载次数
      await fetch(`/api/download/${wallpaper.id}`, { method: 'POST' });
      
      // 触发下载
      const link = document.createElement('a');
      link.href = wallpaper.imageUrl;
      link.download = `${wallpaper.title}.${wallpaper.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 更新本地状态
      setWallpapers(prev => 
        prev.map(w => 
          w.id === wallpaper.id 
            ? { ...w, downloads: w.downloads + 1 }
            : w
        )
      );
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wallpapers.map((wallpaper) => (
          <div
            key={wallpaper.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            {/* 图片容器 */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              <Image
                src={wallpaper.thumbnailUrl || wallpaper.imageUrl}
                alt={wallpaper.title}
                fill
                className="object-cover cursor-pointer"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority={wallpapers.indexOf(wallpaper) < 3} // 前3张优先加载
                loading={wallpapers.indexOf(wallpaper) < 6 ? "eager" : "lazy"} // 前6张即时加载，其余懒加载
                onClick={() => handlePreview(wallpaper)}
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

              {/* 悬停时显示的操作按钮 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePreview(wallpaper)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
                    title={t('gallery.preview')}
                  >
                    <Eye className="h-4 w-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDownload(wallpaper)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
                    title={t('gallery.download')}
                  >
                    <Download className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* 360优化标识 */}
              {wallpaper.optimizedFor360 && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  {t('gallery.optimized360')}
                </div>
              )}
            </div>

            {/* 信息区域 */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                {wallpaper.title}
              </h3>
              
              {/* 提示词 */}
              {wallpaper.prompt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {wallpaper.prompt}
                </p>
              )}

              {/* 元信息 */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span>{wallpaper.width} × {wallpaper.height}</span>
                <span className="uppercase">{wallpaper.format}</span>
              </div>

              {/* 标签 */}
              {wallpaper.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {wallpaper.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 底部信息 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Download className="h-3 w-3 mr-1" />
                  {wallpaper.downloads}
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(wallpaper.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
