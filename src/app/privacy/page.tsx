'use client';

import Layout from '@/components/Layout';
import { Shield, Eye, Lock, Database, Globe, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <Layout>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('privacy.title')}
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              {t('privacy.subtitle')}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
              {t('privacy.lastUpdated')}
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            
            {/* 信息收集 */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Database className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t('privacy.dataCollection.title')}
                </h2>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {t('privacy.dataCollection.intro')}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {t('privacy.dataCollection.item1')}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {t('privacy.dataCollection.item2')}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {t('privacy.dataCollection.item3')}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {t('privacy.dataCollection.item4')}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 信息使用 */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Eye className="h-6 w-6 text-secondary-600 mr-3" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t('privacy.dataUsage.title')}
                </h2>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {t('privacy.dataUsage.intro')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      {t('privacy.dataUsage.service.title')}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t('privacy.dataUsage.service.desc')}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      {t('privacy.dataUsage.improvement.title')}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t('privacy.dataUsage.improvement.desc')}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      {t('privacy.dataUsage.communication.title')}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t('privacy.dataUsage.communication.desc')}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      {t('privacy.dataUsage.legal.title')}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t('privacy.dataUsage.legal.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 数据保护 */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Lock className="h-6 w-6 text-accent-600 mr-3" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t('privacy.dataSecurity.title')}
                </h2>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  {t('privacy.dataSecurity.intro')}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Lock className="h-4 w-4 text-success-600 dark:text-success-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                        {t('privacy.dataSecurity.encryption.title')}
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        {t('privacy.dataSecurity.encryption.desc')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Shield className="h-4 w-4 text-success-600 dark:text-success-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                        {t('privacy.dataSecurity.access.title')}
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        {t('privacy.dataSecurity.access.desc')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-success-100 dark:bg-success-900/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Database className="h-4 w-4 text-success-600 dark:text-success-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                        {t('privacy.dataSecurity.backup.title')}
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        {t('privacy.dataSecurity.backup.desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 用户权利 */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Globe className="h-6 w-6 text-warning-600 mr-3" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t('privacy.userRights.title')}
                </h2>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  {t('privacy.userRights.intro')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      {t('privacy.userRights.access')}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t('privacy.userRights.accessDesc')}
                    </p>
                  </div>
                  <div className="p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      {t('privacy.userRights.correct')}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t('privacy.userRights.correctDesc')}
                    </p>
                  </div>
                  <div className="p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      {t('privacy.userRights.delete')}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t('privacy.userRights.deleteDesc')}
                    </p>
                  </div>
                  <div className="p-4 border border-neutral-200 dark:border-neutral-600 rounded-lg">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      {t('privacy.userRights.portable')}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {t('privacy.userRights.portableDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookie使用 */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Database className="h-6 w-6 text-error-600 mr-3" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t('privacy.cookies.title')}
                </h2>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {t('privacy.cookies.intro')}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {t('privacy.cookies.management')}
                </p>
              </div>
            </div>

            {/* 联系我们 */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Mail className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t('privacy.contact.title')}
                </h2>
              </div>
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  {t('privacy.contact.intro')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="mailto:support@aiicg.com"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    support@aiicg.com
                  </a>
                  <a 
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 font-medium rounded-lg border border-primary-300 dark:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200"
                  >
                    {t('privacy.contact.contactPage')}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
} 