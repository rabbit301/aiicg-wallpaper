import Layout from '@/components/Layout';
import CompressionPanel from '@/components/CompressionPanel';
import { Image, Zap, Shield, Download } from 'lucide-react';

export default function CompressPage() {
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
              图片压缩与格式转换
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto mb-8">
              专业的图片处理工具，支持智能压缩和多种格式转换。
              保持高质量的同时大幅减少文件大小，提升加载速度。
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Zap className="h-5 w-5 text-secondary-500" />
                <span>快速压缩</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Shield className="h-5 w-5 text-accent-500" />
                <span>质量保证</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Image className="h-5 w-5 text-primary-500" />
                <span>多种格式</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
                <Download className="h-5 w-5 text-success-500" />
                <span>批量处理</span>
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

      {/* Features Comparison */}
      <section className="py-16 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              版本对比
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              选择适合您需求的压缩方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Version */}
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-600">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-neutral-500 to-neutral-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Image className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  免费版
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  基础压缩功能
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">支持常见格式 (JPG, PNG, WebP)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">基础压缩算法</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">多种质量预设</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">无文件大小限制</span>
                </li>
              </ul>

              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                  免费
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  永久免费使用
                </p>
              </div>
            </div>

            {/* AI Version */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-800/20 p-8 rounded-2xl border-2 border-primary-300 dark:border-primary-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  推荐
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                  AI智能版
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  AI驱动的智能压缩
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">AI智能压缩算法</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">更高压缩率</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">更好的质量保持</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">支持更多格式</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">批量处理</span>
                </li>
              </ul>

              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                  ¥9.9<span className="text-lg font-normal">/月</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  专业用户首选
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              支持的格式
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              支持主流图片格式的压缩和转换
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
