'use client';

import { useState, useEffect } from 'react';
import { Download, Heart, Eye, Calendar } from 'lucide-react';
import { Wallpaper } from '@/types';

export default function WallpaperGallery() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'popular'>('all');

  useEffect(() => {
    fetchWallpapers();
  }, [filter]);

  const fetchWallpapers = async () => {
    try {
      setLoading(true);
      const url = filter === 'popular' ? '/api/wallpapers?popular=true' : '/api/wallpapers';
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setWallpapers(result.wallpapers);
      }
    } catch (error) {
      console.error('获取壁纸失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (wallpaper: Wallpaper) => {
    try {
      const response = await fetch(`/api/download/${wallpaper.id}`, {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        // 创建下载链接
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `${wallpaper.title}.${wallpaper.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 刷新数据以更新下载次数
        fetchWallpapers();
      } else {
        alert('下载失败');
      }
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* 过滤器 */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'
            }`}
          >
            全部壁纸
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'popular'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'
            }`}
          >
            热门壁纸
          </button>
        </div>
      </div>

      {/* 壁纸网格 */}
      {wallpapers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            暂无壁纸，快去生成第一张吧！
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wallpapers.map((wallpaper) => (
            <div
              key={wallpaper.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* 图片 */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={wallpaper.thumbnailUrl}
                  alt={wallpaper.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {wallpaper.optimizedFor360 && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    360优化
                  </div>
                )}
              </div>

              {/* 信息 */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                  {wallpaper.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {wallpaper.prompt}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {wallpaper.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>{wallpaper.downloads}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(wallpaper.createdAt)}</span>
                    </span>
                  </div>
                  <span className="text-xs">
                    {wallpaper.width}×{wallpaper.height}
                  </span>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(wallpaper)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>下载</span>
                  </button>
                  <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 p-2 rounded-lg transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
