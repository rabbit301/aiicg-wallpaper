'use client';

import { useState, useEffect } from 'react';
import { Wallpaper } from '@/types';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

import { Heart, Eye, Wand2, MoreHorizontal, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

interface WallpaperFolder {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

interface MasonryWallpaperGalleryProps {
  showPopular?: boolean;
  limit?: number;
  category?: string;
  showFolderFilter?: boolean; // 是否显示文件夹筛选
  defaultFolder?: string; // 默认选中的文件夹ID
}

export default function MasonryWallpaperGallery({
  showPopular = true,
  limit = 12,
  category,
  showFolderFilter = false,
  defaultFolder
}: MasonryWallpaperGalleryProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 文件夹相关状态 - 使用defaultFolder作为初始值
  const [folders, setFolders] = useState<WallpaperFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>(defaultFolder || 'all');
  const [showNSFW, setShowNSFW] = useState(false);

  useEffect(() => {
    if (showFolderFilter) {
      fetchFolders();
    }
  }, [showFolderFilter]);

  useEffect(() => {
    fetchWallpapers();
  }, [showPopular, limit, category, selectedFolder, showNSFW]);

  // 获取文件夹列表
  const fetchFolders = async () => {
    try {
      const res: any = await api.wallpapers.getFolders();
      const folderData = res?.data?.folders || res?.folders || [];
      setFolders([
        { id: 'all', name: '全部', count: 0, icon: '📂' },
        ...folderData
      ]);
    } catch (err) {
      console.error('加载文件夹失败:', err);
    }
  };

  const fetchWallpapers = async () => {
    try {
      setLoading(true);
      setError(null);

      // 如果启用了文件夹筛选，尝试使用新的文件夹系统 API
      if (showFolderFilter) {
        try {
          const response: any = await api.wallpapers.getPublic({
            folder: selectedFolder !== 'all' ? selectedFolder : undefined,
            limit: limit,
            nsfw: showNSFW
          });

          if (response?.data?.wallpapers || response?.wallpapers) {
            const imageData = response?.data?.wallpapers || response?.wallpapers || [];
            setWallpapers(imageData);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.log('文件夹系统API暂未实现，使用默认API');
        }
      }

      // 默认 API 调用（向后兼容）
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
      {/* 文件夹筛选栏 - 仅在启用时显示 */}
      {showFolderFilter && folders.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                文件夹:
              </span>
            </div>

            {/* 文件夹标签 */}
            <div className="flex flex-wrap gap-2">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedFolder === folder.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {folder.icon && <span className="mr-1">{folder.icon}</span>}
                  {folder.name}
                  {folder.count > 0 && (
                    <span className="ml-1 text-xs opacity-75">({folder.count})</span>
                  )}
                </button>
              ))}
            </div>

            {/* NSFW 开关 */}
            <div className="ml-auto flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNSFW}
                  onChange={(e) => setShowNSFW(e.target.checked)}
                  className="w-4 h-4 text-pink-600 bg-neutral-100 border-neutral-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
                />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  18+
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 简洁瀑布流布局 - 纯图片展示，铺满全屏 */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {wallpapers.map((wallpaper, index) => (
          <div
            key={wallpaper.id}
            className="break-inside-avoid mb-4 group cursor-pointer"
            onClick={() => handlePreview(wallpaper)}
          >
            <div className="relative rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              {/* 纯图片展示 - 无遮罩，无多余信息 */}
              {wallpaper.imageUrl && wallpaper.imageUrl.includes('555125.xyz') ? (
                <img
                  src={wallpaper.imageUrl}
                  alt={wallpaper.title || '壁纸'}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ aspectRatio: 'auto' }}
                  loading={index < 6 ? "eager" : "lazy"}
                />
              ) : wallpaper.imageUrl ? (
                <Image
                  src={wallpaper.imageUrl}
                  alt={wallpaper.title || '壁纸'}
                  width={300}
                  height={getRandomHeight(index)}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ aspectRatio: 'auto' }}
                  priority={index < 6}
                />
              ) : (
                <div className="w-full h-64 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                  <span className="text-neutral-400">暂无图片</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>


    </>
  );
}
