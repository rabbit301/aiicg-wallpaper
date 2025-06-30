'use client';

import Layout from '@/components/Layout';
import CategoryGallery from '@/components/CategoryGallery';
import WallpaperGallery from '@/components/WallpaperGallery';
import { Sparkles, Wand2, Image, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                {t('page.aiPoweredWallpaper')}
              </span>
              <br />
              {t('page.creationPlatform')}
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-3xl mx-auto">
              {t('page.platformDesc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/generate"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Wand2 className="h-5 w-5 mr-2" />
                {t('home.startCreating')}
              </Link>
              <Link
                href="/compress"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Image className="h-5 w-5 mr-2" />
                {t('home.imageProcessing')}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
                <div className="text-neutral-600 dark:text-neutral-400">{t('home.stats.wallpapers')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600 mb-2">5K+</div>
                <div className="text-neutral-600 dark:text-neutral-400">{t('home.stats.users')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600 mb-2">99%</div>
                <div className="text-neutral-600 dark:text-neutral-400">{t('home.stats.satisfaction')}</div>
              </div>
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

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('page.powerfulFeatures')}
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              {t('page.featuresDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                {t('home.features.aiGeneration')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('home.features.aiGenerationDesc')}
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 border border-secondary-200 dark:border-secondary-800">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Image className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                {t('home.features.smartCompression')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('home.features.smartCompressionDesc')}
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 border border-accent-200 dark:border-accent-800">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                {t('home.features.professionalOptimization')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('home.features.professionalOptimizationDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Generated Wallpapers Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('gallery.latestWorks')}
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              {t('gallery.discoverWorks')}
            </p>
          </div>
          
          {/* 显示最新的6张壁纸 */}
          <div className="max-w-6xl mx-auto">
            <WallpaperGallery showPopular={false} limit={6} />
          </div>

          <div className="text-center mt-8">
            <Link
              href="/generate"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              <Wand2 className="h-5 w-5 mr-2" />
              {t('gallery.createNow')}
            </Link>
          </div>
        </div>
      </section>

      {/* Category Gallery Section */}
      <CategoryGallery />

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
            {t('home.cta.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/generate"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {t('home.cta.generateWallpaper')}
            </Link>
            <Link
              href="/compress"
              className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Image className="h-5 w-5 mr-2" />
              {t('home.cta.processImage')}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
