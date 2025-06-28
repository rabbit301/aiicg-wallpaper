import Layout from '@/components/Layout';
import { User, Image, Download, Calendar, Settings, Crown } from 'lucide-react';

export default function ProfilePage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Profile Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent-500 to-warning-500 rounded-lg flex items-center justify-center">
                <Crown className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                用户名
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                user@example.com
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                  <Crown className="h-4 w-4 mr-1" />
                  VIP会员
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                  <Calendar className="h-4 w-4 mr-1" />
                  加入于 2024年1月
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200">
                <Settings className="h-4 w-4 mr-2" />
                编辑资料
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Image className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              156
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-sm">
              生成壁纸
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              89
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-sm">
              下载次数
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Image className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              234
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-sm">
              压缩图片
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              45
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 text-sm">
              使用天数
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          {/* Tab Headers */}
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <nav className="flex space-x-8 px-8 pt-6">
              <button className="pb-4 border-b-2 border-primary-500 text-primary-600 dark:text-primary-400 font-medium">
                我的作品
              </button>
              <button className="pb-4 border-b-2 border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium">
                收藏夹
              </button>
              <button className="pb-4 border-b-2 border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium">
                使用记录
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* My Works Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="group relative bg-neutral-100 dark:bg-neutral-700 rounded-xl overflow-hidden aspect-square hover:shadow-lg transition-all duration-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button className="p-2 bg-white rounded-lg text-neutral-900 hover:bg-neutral-100 transition-colors duration-200">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-white rounded-lg text-neutral-900 hover:bg-neutral-100 transition-colors duration-200">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="text-white text-sm font-medium">
                      壁纸 #{index + 1}
                    </div>
                    <div className="text-white/80 text-xs">
                      2024-01-{String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="inline-flex items-center px-6 py-3 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors duration-200">
                加载更多
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
