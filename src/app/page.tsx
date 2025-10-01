'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import WallpaperGallery from '@/components/WallpaperGallery';
import MasonryWallpaperGallery from '@/components/MasonryWallpaperGallery';
import BottomCreationPanel from '@/components/BottomCreationPanel';
import { Sparkles, Wand2, Image, TrendingUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const [showHero, setShowHero] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = 600; // Hero section approximate height
      
      if (scrollY > heroHeight && !hasScrolled) {
        setHasScrolled(true);
        setShowHero(false);
      } else if (scrollY <= 100 && hasScrolled) {
        // Only show hero again if user scrolls back to very top
        setShowHero(true);
        setHasScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled]);

  return (
    <Layout>
      <div className="pb-24"> {/* 为底部固定输入框留出空间 */}
          {/* Hero Section - 只在首次访问或回到顶部时显示 */}
          {showHero && (
            <section className="relative overflow-hidden transition-all duration-700 ease-out">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                  <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                    <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                      {t('page.aiPoweredWallpaper')}
                    </span>
                    <br />
                    {t('page.creationPlatform')}
                  </h1>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
                    {t('page.platformDesc')}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Link
                      href="/generate"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <Wand2 className="h-5 w-5 mr-2" />
                      {t('home.startCreating')}
                    </Link>
                    <Link
                      href="/compress"
                      className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <Image className="h-5 w-5 mr-2" />
                      {t('home.imageProcessing')}
                    </Link>
                  </div>



                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
              </div>
            </section>
          )}



          {/* 壁纸展示区域 - 智能显示 */}
          <section id="latest-works" className={`transition-all duration-500 ${showHero ? 'py-20' : 'pt-6 pb-20'} bg-neutral-50 dark:bg-neutral-900`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* 动态标题 - 只在滚动后显示 */}
              {!showHero && (
                <div className="text-center mb-8 animate-fade-in">
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                    精选AI壁纸
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    发现由AI智能生成的精美壁纸
                  </p>
                </div>
              )}
              
              {/* 显示最新的36张壁纸 - 即梦AI风格，铺满一屏 */}
              <div className="max-w-7xl mx-auto">
                <MasonryWallpaperGallery showPopular={false} limit={36} />
              </div>

              {/* 生成按钮 */}
              <div className="text-center mt-12">
                
              </div>
            </div>
          </section>



      </div>

      {/* 底部创作面板 */}
      <BottomCreationPanel />
    </Layout>
  );
}
