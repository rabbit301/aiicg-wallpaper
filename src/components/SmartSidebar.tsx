'use client';

import { useState, useEffect } from 'react';
import { Filter, TrendingUp, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

interface SmartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

interface CategoryItem {
  name: string;
  slug: string;
  count: number;
  icon: string;
}

export default function SmartSidebar({ 
  isOpen, 
  onClose, 
  className = '', 
  selectedCategory = 'latest-works',
  onCategoryChange 
}: SmartSidebarProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // 模拟分类数据 (后续可以从API获取)
  useEffect(() => {
    const mockCategories: CategoryItem[] = [
      { name: t('category.smallScreen'), slug: 'small-screen', count: 245, icon: '📱' },
      { name: t('category.aiGenerated'), slug: 'ai-generated', count: 189, icon: '🤖' },
      { name: t('category.animation'), slug: 'animation', count: 156, icon: '🎬' },
      { name: t('category.wallpaper'), slug: 'wallpaper', count: 312, icon: '🖼️' },
      { name: t('category.avatar'), slug: 'avatar', count: 98, icon: '👤' },
    ];
    setCategories(mockCategories);
  }, [t]);



  return (
    <>
      {/* 移动端遮罩层 - 恢复毛玻璃效果 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* 侧边栏主体 - 优雅无边框设计 */}
      <div 
        className={`fixed top-0 left-0 h-full w-60 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl z-40 ${className}`}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: isOpen ? 'transform' : 'auto',
          borderRight: 'none', // 完全移除右边框
          boxShadow: isOpen ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)' : 'none'
        }}
      >
        {/* 侧边栏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200/30 dark:border-neutral-700/30">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {t('sidebar.browseCategories')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 搜索栏 - 简化版 */}
        <div className="p-4 border-b border-neutral-200/20 dark:border-neutral-700/20">
          <input
            type="text"
            placeholder={t('sidebar.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border-0 rounded text-neutral-900 dark:text-white placeholder-neutral-500"
          />
        </div>

        {/* 分类导航 */}
        <div className="flex-1 overflow-y-auto">
          {/* 热门分类 */}
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary-600" />
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                {t('sidebar.popularCategories')}
              </h3>
            </div>
            
            <div className="space-y-1">
              {[
                { name: t('gallery.latestWorks'), slug: 'latest-works', count: 150, icon: '🆕' },
                ...categories
              ].map((category) => (
                <button
                  key={category.slug}
                  onClick={() => {
                    onCategoryChange?.(category.slug);
                    // 如果是AI生成，仍然跳转到生成页面
                    if (category.slug === 'ai-generated') {
                      window.location.href = '/generate';
                      return;
                    }
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    selectedCategory === category.slug 
                      ? 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 shadow-sm' 
                      : 'hover:bg-gray-50 dark:hover:bg-neutral-800 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {category.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {category.count}+ {t('sidebar.items')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </button>
              ))}
            </div>
          </div>

          {/* 快速筛选 */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="h-4 w-4 text-secondary-600" />
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                {t('sidebar.quickFilter')}
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['热门', '最新', '高清', '免费'].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 侧边栏底部 */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <Link
            href="/generate"
            onClick={onClose}
            className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {t('sidebar.createNow')}
          </Link>
        </div>
      </div>
    </>
  );
} 