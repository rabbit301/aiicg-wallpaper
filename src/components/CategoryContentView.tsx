'use client';

import { useState, useEffect } from 'react';
import WallpaperGallery from './WallpaperGallery';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryContentViewProps {
  selectedCategory: string;
  className?: string;
}

export default function CategoryContentView({ selectedCategory, className = '' }: CategoryContentViewProps) {
  const { t } = useLanguage();
  const [searchTag, setSearchTag] = useState<string>('');

  // 根据分类设置搜索标签
  useEffect(() => {
    switch (selectedCategory) {
      case 'latest-works':
        setSearchTag('');
        break;
      case 'small-screen':
        setSearchTag('小屏幕');
        break;
      case 'ai-generated':
        setSearchTag('AI');
        break;
      case 'animation':
        setSearchTag('动画');
        break;
      case 'wallpaper':
        setSearchTag('壁纸');
        break;
      case 'avatar':
        setSearchTag('头像');
        break;
      default:
        setSearchTag('');
    }
  }, [selectedCategory]);

  // 获取分类标题
  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'latest-works':
        return t('gallery.latestWorks');
      case 'small-screen':
        return t('category.smallScreen');
      case 'ai-generated':
        return t('category.aiGenerated');
      case 'animation':
        return t('category.animation');
      case 'wallpaper':
        return t('category.wallpaper');
      case 'avatar':
        return t('category.avatar');
      default:
        return t('gallery.latestWorks');
    }
  };

  return (
    <div className={`min-h-screen bg-neutral-50 dark:bg-neutral-900 ${className}`}>
      {/* 内容头部 */}
      <div className="pt-20 pb-8 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              {getCategoryTitle(selectedCategory)}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              {selectedCategory === 'latest-works' 
                ? t('gallery.discoverWorks')
                : `探索 ${getCategoryTitle(selectedCategory)} 相关的精彩内容`
              }
            </p>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WallpaperGallery 
            tag={searchTag}
            showPopular={selectedCategory === 'latest-works'}
            key={selectedCategory} // 强制重新渲染以获取新数据
          />
        </div>
      </div>
    </div>
  );
} 