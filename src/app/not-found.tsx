'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Home, Image as ImageIcon, Wand2, ArrowLeft, Search, Zap, Cpu, Palette } from 'lucide-react';

interface WallpaperItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
}

export default function NotFound() {
  const { t } = useLanguage();
  const [backgroundWallpapers, setBackgroundWallpapers] = useState<WallpaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMainContent, setShowMainContent] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperItem | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 客户端检测
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 滚动监听
  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);

  // 鼠标位置跟踪
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // 简化的壁纸过滤函数 - 基本过滤，避免过度严格
  const filterValidWallpapers = async (wallpapers: WallpaperItem[]): Promise<WallpaperItem[]> => {
    // 基本过滤：去掉明显无效的URL
    const basicFiltered = wallpapers.filter(wallpaper => {
      return wallpaper.thumbnail &&
             wallpaper.thumbnail.startsWith('http') &&
             !wallpaper.thumbnail.includes('l0paj4anoq.jpeg'); // 过滤掉已知的坏图片
    });

    return basicFiltered.slice(0, 12);
  };

  // 获取背景壁纸
  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        // 获取更多壁纸以便过滤
        const response = await fetch('/api/giphy-content?category=wallpaper&limit=20');
        if (response.ok) {
          const data = await response.json();
          if (data.wallpapers && data.wallpapers.length > 0) {
            // 过滤掉可能损坏的壁纸，只保留最火的12个
            const validWallpapers = await filterValidWallpapers(data.wallpapers);
            setBackgroundWallpapers(validWallpapers.slice(0, 12));
            setLoading(false);
            return;
          }
        }

        // 备用：从本地壁纸数据获取
        const fallbackResponse = await fetch('/api/wallpapers?limit=20');
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success && fallbackData.wallpapers) {
            const wallpapers = fallbackData.wallpapers.map((w: any) => ({
              id: w.id,
              title: w.title,
              url: w.imageUrl || w.url,
              thumbnail: w.thumbnailUrl || w.thumbnail || w.imageUrl || w.url,
              width: w.width,
              height: w.height
            }));
            const validWallpapers = await filterValidWallpapers(wallpapers);
            setBackgroundWallpapers(validWallpapers.slice(0, 12));
          }
        }
      } catch (error) {
        console.error('获取背景壁纸失败:', error);
        // 使用默认背景
        setBackgroundWallpapers([]);
      } finally {
        setLoading(false);
        // 画廊加载完成后，延迟1.5秒显示主要内容
        setTimeout(() => {
          setShowMainContent(true);
        }, 1500);
      }
    };

    fetchWallpapers();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-white dark:bg-gray-900"
      style={{ height: '150vh' }}
    >
      {/* 数字艺术画廊区域 - 第一屏 */}
      <div
        className="absolute inset-0 z-10"
        style={{
          transform: `translateY(${-scrollY * 1}px)`,
        }}
      >
        {/* 加载状态 */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
            </div>
          </div>
        )}

        {/* 画廊内容 */}
        {!loading && (
          <div className="relative w-full h-full pt-16 pb-16 px-8 animate-fade-in">
            {/* 画廊标题 */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t('gallery.latestWorks')}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {t('home.cta.description')}
              </p>
            </div>

            {/* 画廊网格 - 优化为3×4布局显示12个最火壁纸 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {backgroundWallpapers.map((wallpaper, index) => (
                <div
                  key={wallpaper.id}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                  onClick={() => setSelectedWallpaper(wallpaper)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="aspect-[4/3] relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={wallpaper.thumbnail}
                      alt={wallpaper.title || t('gallery.preview')}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      onError={(e) => {
                        // 图片加载失败时显示占位符
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'placeholder absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700';
                          placeholder.innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-center"><svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg><p class="text-xs">Load Failed</p></div>';
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="mt-3">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {wallpaper.title || t('categoryPage.noContent')}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {wallpaper.width} × {wallpaper.height}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 404错误信息区域 - 第二屏 */}
      <div className="absolute top-[70vh] w-full min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* 优雅的404设计 - 无边框，更开放 */}
          <div className="text-center">
            {/* 大气的404数字 */}
            <div className="mb-12">
              <div className="relative">
                <span className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-black text-gray-200 dark:text-gray-800 leading-none select-none">
                  404
                </span>
                {/* 装饰性元素 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
            
            {/* 优雅的标题和描述 */}
            <div className="mb-16 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {t('notFound.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                {t('notFound.description')}
              </p>
            </div>

            {/* 优雅的导航选项 */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {/* 返回首页 */}
              <Link
                href="/"
                className="group inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <Home className="h-5 w-5 mr-2" />
                {t('backToHome')}
              </Link>

              {/* 浏览作品 */}
              <Link
                href="/#latest-works"
                className="group inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                {t('gallery.latestWorks')}
              </Link>

              {/* AI生成 */}
              <Link
                href="/generate"
                className="group inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <Wand2 className="h-5 w-5 mr-2" />
                {t('generate')}
              </Link>
            </div>

            {/* 优雅的底部信息 */}
            <div className="text-center space-y-4">
              <p className="text-gray-500 dark:text-gray-400">
                {t('notFound.searchTip')}
              </p>
              <div className="inline-flex items-center space-x-2 text-gray-400 dark:text-gray-500">
                <Palette className="h-4 w-4" />
                <span className="text-sm">{t('appName')} - {t('notFound.brandSlogan')}</span>
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
