'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, Download, Share2, Eye, Wand2, UserPlus } from 'lucide-react';
import { Wallpaper } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WallpaperDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [relatedWallpapers, setRelatedWallpapers] = useState<Wallpaper[]>([]);

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      fetchWallpaper(id);
      fetchRelatedWallpapers();
    }
  }, [params.id]);

  const fetchWallpaper = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wallpapers/${id}`);
      if (!response.ok) {
        throw new Error('壁纸不存在');
      }
      const data = await response.json();
      setWallpaper(data.wallpaper);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('wallpaper.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedWallpapers = async () => {
    try {
      const response = await fetch('/api/wallpapers?limit=8');
      const data = await response.json();
      if (data.success) {
        setRelatedWallpapers(data.wallpapers);
      }
    } catch (err) {
      console.error('Failed to get related wallpapers:', err);
    }
  };

  // 生成同款功能
  const handleGenerateSimilar = () => {
    if (!wallpaper) return;
    
    let prompt = wallpaper.title || '';
    if (wallpaper.tags && wallpaper.tags.length > 0) {
      prompt += ', ' + wallpaper.tags.join(', ');
    }
    if (wallpaper.style) {
      prompt += ', ' + wallpaper.style;
    }
    if (!prompt.trim()) {
      prompt = t('wallpaper.similarStyle');
    }
    
    const encodedPrompt = encodeURIComponent(prompt);
    router.push(`/generate?prompt=${encodedPrompt}&reference=${wallpaper.id}`);
  };

  // 点赞功能
  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // 关注功能
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  // 下载功能
  const handleDownload = () => {
    if (!wallpaper) return;
    console.log('Download wallpaper:', wallpaper.id);
  };

  // 分享功能
  const handleShare = () => {
    if (!wallpaper) return;
    
    if (navigator.share) {
      navigator.share({
        title: wallpaper.title,
        text: `${t('wallpaper.shareText')}：${wallpaper.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">{t('common.loading')}</span>
      </div>
    );
  }

  if (error || !wallpaper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || t('wallpaper.notFound')}</p>
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-700 underline"
          >
{t('wallpaper.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* 固定顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {t('wallpaper.details')}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  isLiked
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{wallpaper.likes || 0}</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t('common.download')}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm"
              >
                <Share2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t('common.share')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧图片区域 */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-8 flex items-center justify-center">
              <div className="relative max-w-full max-h-[70vh]">
                {/* 判断是否使用兰空图床，如果是则直接使用原图 */}
                {wallpaper.imageUrl.includes('555125.xyz') ? (
                  // 兰空图床：直接使用原图，绕过Next.js优化
                  <img
                    src={wallpaper.imageUrl}
                    alt={wallpaper.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                ) : (
                  // 其他图床：使用Next.js优化
                  <Image
                    src={wallpaper.imageUrl}
                    alt={wallpaper.title}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                )}
              </div>
            </div>
            
            {/* 图片信息 */}
            <div className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
              {wallpaper.width} × {wallpaper.height} • {wallpaper.format?.toUpperCase() || 'JPG'}
            </div>
          </div>

          {/* 右侧信息面板 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              {/* 作品标题和作者 */}
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight">
                  {wallpaper.title}
                </h1>
                
                {/* 作者信息 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">AI</span>
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-white text-sm">AI创作者</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {wallpaper.createdAt ? new Date(wallpaper.createdAt).toLocaleDateString() : '今天'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleFollow}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isFollowing
                        ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isFollowing ? '已关注' : '关注'}
                  </button>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{wallpaper.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{wallpaper.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>0</span>
                  </div>
                </div>
              </div>

              {/* 主要操作按钮 */}
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={handleGenerateSimilar}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium text-sm"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  生成同款壁纸
                </button>
              </div>

              {/* 详细信息 */}
              <div className="p-6">
                <h3 className="font-medium text-neutral-900 dark:text-white mb-3 text-sm">技术信息</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">尺寸</span>
                    <span className="text-sm text-neutral-900 dark:text-white">
                      {wallpaper.width} × {wallpaper.height}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">格式</span>
                    <span className="text-sm text-neutral-900 dark:text-white">
                      {wallpaper.format?.toUpperCase() || 'JPG'}
                    </span>
                  </div>

                  {wallpaper.style && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">风格</span>
                      <span className="text-sm text-neutral-900 dark:text-white">
                        {wallpaper.style}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">创建时间</span>
                    <span className="text-sm text-neutral-900 dark:text-white">
                      {wallpaper.createdAt ? new Date(wallpaper.createdAt).toLocaleDateString() : '未知'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 相关推荐 */}
        {relatedWallpapers.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">相关推荐</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedWallpapers.slice(0, 6).map((related) => (
                <Link
                  key={related.id}
                  href={`/wallpaper/${related.id}`}
                  className="group block"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {/* 判断是否使用兰空图床，如果是则直接使用原图 */}
                    {related.imageUrl.includes('555125.xyz') ? (
                      // 兰空图床：直接使用原图，绕过Next.js优化
                      <img
                        src={related.imageUrl}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      // 其他图床：使用Next.js优化
                      <Image
                        src={related.imageUrl}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-white line-clamp-2">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
