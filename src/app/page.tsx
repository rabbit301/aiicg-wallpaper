import WallpaperGenerator from '@/components/WallpaperGenerator';
import WallpaperGallery from '@/components/WallpaperGallery';
import Header from '@/components/Header';
import CompressionPanel from '@/components/CompressionPanel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4">
            AIICG壁纸站
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            AI生成高质量壁纸，专为360水冷屏幕优化
          </p>
        </div>

        {/* Generator Section */}
        <div className="mb-16">
          <WallpaperGenerator />
        </div>

        {/* Compression Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
            图片压缩工具
          </h2>
          <CompressionPanel />
        </div>

        {/* Gallery Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
            精选壁纸
          </h2>
          <WallpaperGallery />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © 2024 AIICG壁纸站 - 专业的AI壁纸生成平台
          </p>
        </div>
      </footer>
    </div>
  );
}
