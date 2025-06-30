'use client';

import Layout from '@/components/Layout';
import WallpaperGenerator from '@/components/WallpaperGenerator';
import { Wand2, Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function GeneratePage() {
  const { t } = useLanguage();
  return (
    <Layout>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('generatePage.title')}
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto mb-8">
              {t('generatePage.description')}
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Sparkles className="h-5 w-5 text-primary-500" />
                <span>{t('generatePage.features.aiGeneration')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Zap className="h-5 w-5 text-secondary-500" />
                <span>{t('generatePage.features.multiSize')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Wand2 className="h-5 w-5 text-accent-500" />
                <span>{t('generatePage.features.optimization')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WallpaperGenerator />
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('generatePage.tipsTitle')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {t('generatePage.tipsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 rounded-xl border border-primary-200 dark:border-primary-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                {t('generatePage.tip1.title')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {t('generatePage.tip1.desc')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 p-6 rounded-xl border border-secondary-200 dark:border-secondary-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                {t('generatePage.tip2.title')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {t('generatePage.tip2.desc')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 p-6 rounded-xl border border-accent-200 dark:border-accent-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                {t('generatePage.tip3.title')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {t('generatePage.tip3.desc')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 p-6 rounded-xl border border-success-200 dark:border-success-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                {t('generatePage.tip4.title')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {t('generatePage.tip4.desc')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 p-6 rounded-xl border border-warning-200 dark:border-warning-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                {t('generatePage.tip5.title')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {t('generatePage.tip5.desc')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20 p-6 rounded-xl border border-error-200 dark:border-error-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                {t('generatePage.tip6.title')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {t('generatePage.tip6.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
