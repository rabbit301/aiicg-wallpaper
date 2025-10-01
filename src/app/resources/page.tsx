import Layout from '@/components/Layout';

export default function ResourcesPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
              资源管理
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 图片资源 */}
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  图片资源
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                  管理您上传的图片和生成的壁纸
                </p>
                <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                  查看图片
                </button>
              </div>

              {/* 收藏夹 */}
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  收藏夹
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                  查看您收藏的壁纸和素材
                </p>
                <button className="w-full bg-secondary-600 text-white py-2 px-4 rounded-lg hover:bg-secondary-700 transition-colors">
                  查看收藏
                </button>
              </div>

              {/* 下载历史 */}
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  下载历史
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
                  查看您的下载记录
                </p>
                <button className="w-full bg-accent-600 text-white py-2 px-4 rounded-lg hover:bg-accent-700 transition-colors">
                  查看历史
                </button>
              </div>
            </div>

            {/* 存储统计 */}
            <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                存储统计
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    156
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    生成图片
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                    23
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    收藏项目
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                    2.3GB
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    总存储
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 