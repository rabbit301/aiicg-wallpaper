'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Wallpaper } from '@/types';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface WallpaperModalProps {
  wallpaper: Wallpaper | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
}

export default function WallpaperModal({
  wallpaper,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  showNavigation = false
}: WallpaperModalProps) {
  const { t } = useLanguage();
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // 键盘导航
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (showNavigation && onPrevious) onPrevious();
        break;
      case 'ArrowRight':
        if (showNavigation && onNext) onNext();
        break;
      case 'z':
      case 'Z':
        setIsZoomed(!isZoomed);
        break;
    }
  }, [isOpen, isZoomed, showNavigation, onClose, onNext, onPrevious]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // 重置状态当壁纸改变时
  useEffect(() => {
    if (wallpaper) {
      setImageLoaded(false);
      setIsZoomed(false);
    }
  }, [wallpaper]);

  const handleDownload = async () => {
    if (!wallpaper || downloading) return;
    
    setDownloading(true);
    try {
      const response = await fetch(`/api/download/${wallpaper.id}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${wallpaper.title || 'wallpaper'}.${wallpaper.format || 'jpg'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen || !wallpaper) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className="relative w-full h-full max-w-7xl max-h-full p-4 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between mb-4 z-10">
          <div className="flex items-center space-x-4">
            {/* 导航按钮 */}
            {showNavigation && (
              <>
                <button
                  onClick={onPrevious}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
                  disabled={!onPrevious}
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={onNext}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
                  disabled={!onNext}
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* 缩放按钮 */}
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
              title={isZoomed ? t('actions.zoomOut') : t('actions.zoomIn')}
            >
              {isZoomed ? (
                <ZoomOut className="h-5 w-5 text-white" />
              ) : (
                <ZoomIn className="h-5 w-5 text-white" />
              )}
            </button>

            {/* 下载按钮 */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 text-white" />
              <span className="text-white text-sm">
                {downloading ? t('status.downloading') : t('common.download')}
              </span>
            </button>

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* 图片容器 */}
        <div className="flex-1 flex items-center justify-center relative">
          <div 
            className={`relative transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
            
            {/* 判断是否使用兰空图床，如果是则直接使用原图 */}
            {wallpaper.imageUrl.includes('555125.xyz') ? (
              // 兰空图床：直接使用原图，绕过Next.js优化
              <img
                src={wallpaper.imageUrl}
                alt={wallpaper.title}
                className={`max-w-full max-h-full object-contain rounded-lg transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              // 其他图床：使用Next.js优化
              <Image
                src={wallpaper.imageUrl}
                alt={wallpaper.title}
                width={wallpaper.width}
                height={wallpaper.height}
                className={`max-w-full max-h-full object-contain rounded-lg transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                priority
              />
            )}
          </div>
        </div>

        {/* 底部信息条 */}
        <div className="mt-4 flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
          <div className="flex items-center space-x-4">
            <h3 className="text-white font-medium">{wallpaper.title}</h3>
            <span className="text-white/70 text-sm">
              {wallpaper.width} × {wallpaper.height}
            </span>
            {wallpaper.format && (
              <span className="text-white/70 text-sm uppercase">
                {wallpaper.format}
              </span>
            )}
          </div>
          
          <div className="text-white/50 text-xs">
            按 ESC 关闭 • 按 Z 缩放 {showNavigation && '• 方向键切换'}
          </div>
        </div>
      </div>
    </div>
  );
}
