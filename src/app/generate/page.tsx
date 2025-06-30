import Layout from '@/components/Layout';
import WallpaperGenerator from '@/components/WallpaperGenerator';
import { Wand2, Sparkles, Zap } from 'lucide-react';

export default function GeneratePage() {
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
              AI壁纸生成器
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto mb-8">
              使用先进的AI技术，将您的创意转化为独特的高质量壁纸。
              支持多种尺寸和风格，专为不同设备优化。
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Sparkles className="h-5 w-5 text-primary-500" />
                <span>AI智能生成</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Zap className="h-5 w-5 text-secondary-500" />
                <span>多种尺寸支持</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Wand2 className="h-5 w-5 text-accent-500" />
                <span>专业优化</span>
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
              创作小贴士
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              掌握这些技巧，让您的AI壁纸更加出色
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 rounded-xl border border-primary-200 dark:border-primary-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                描述要具体
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                使用具体的形容词和细节描述，如&ldquo;夕阳下的紫色薰衣草田&rdquo;比&ldquo;美丽的风景&rdquo;更有效。
              </p>
            </div>

            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 p-6 rounded-xl border border-secondary-200 dark:border-secondary-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                选择合适尺寸
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                根据使用场景选择尺寸：手机壁纸选择9:16，桌面选择16:9，水冷屏幕选择1:1。
              </p>
            </div>

            <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 p-6 rounded-xl border border-accent-200 dark:border-accent-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                风格关键词
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                添加风格关键词如&ldquo;赛博朋克&rdquo;、&ldquo;水彩画&rdquo;、&ldquo;极简主义&rdquo;来获得特定的艺术效果。
              </p>
            </div>

            <div className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 p-6 rounded-xl border border-success-200 dark:border-success-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                色彩搭配
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                指定主色调如&ldquo;蓝色调&rdquo;、&ldquo;暖色系&rdquo;，或具体颜色如&ldquo;深蓝色和金色&rdquo;。
              </p>
            </div>

            <div className="bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 p-6 rounded-xl border border-warning-200 dark:border-warning-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                避免过于复杂
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                描述不要过于复杂，专注于1-2个主要元素，让AI能更好地理解和生成。
              </p>
            </div>

            <div className="bg-gradient-to-br from-error-50 to-error-100 dark:from-error-900/20 dark:to-error-800/20 p-6 rounded-xl border border-error-200 dark:border-error-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                多次尝试
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                同一个描述可能产生不同效果，多尝试几次找到最满意的结果。
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
