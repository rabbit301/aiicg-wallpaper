'use client';

import Layout from '@/components/Layout';
import CompressionPanel from '@/components/CompressionPanel';
import { Image, Zap, Shield, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CompressPage() {
  const { t } = useLanguage();
  return (
    <Layout>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-secondary-50 via-white to-accent-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                <Image className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('compressPage.title')}
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto mb-8">
              {t('compressPage.description')}
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Zap className="h-5 w-5 text-secondary-500" />
                <span>{t('compressPage.features.fastCompress')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Shield className="h-5 w-5 text-accent-500" />
                <span>{t('compressPage.features.qualityGuarantee')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Image className="h-5 w-5 text-primary-500" />
                <span>{t('compressPage.features.multiFormat')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Download className="h-5 w-5 text-success-500" />
                <span>{t('compressPage.features.batchProcess')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compression Tool Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CompressionPanel />
        </div>
      </section>



      {/* Supported Formats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('compressPage.supportedFormats')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {t('compressPage.formatsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {['JPG', 'PNG', 'WebP', 'AVIF', 'GIF', 'TIFF'].map((format) => (
              <div key={format} className="text-center p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Image className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="font-semibold text-neutral-900 dark:text-white">
                  {format}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
