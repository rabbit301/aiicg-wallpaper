'use client';

import { useState } from 'react';
import { Wand2, Loader2, Monitor } from 'lucide-react';
import { SCREEN_PRESETS, ScreenPreset } from '@/lib/fal-client';
import { generateWallpaperEvaluation, generateStarRating, getScoreColorClass } from '@/lib/emotion-evaluator';
import type { EmotionEvaluation } from '@/lib/emotion-evaluator';

export default function WallpaperGenerator() {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [preset, setPreset] = useState<ScreenPreset>('360_square_640p');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [wallpaperEvaluation, setWallpaperEvaluation] = useState<EmotionEvaluation | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      alert('请输入生图提示词');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setWallpaperEvaluation(null);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          title: title.trim(),
          preset,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const processingTime = Date.now() - startTime;
        setGeneratedImage(result.wallpaper.imageUrl);

        // 生成情绪评价
        const evaluation = generateWallpaperEvaluation(
          prompt,
          processingTime,
          { width: result.wallpaper.width, height: result.wallpaper.height }
        );
        setWallpaperEvaluation(evaluation);

        // 清空表单
        setPrompt('');
        setTitle('');
      } else {
        alert(`生成失败: ${result.error}`);
      }
    } catch (error) {
      console.error('生成壁纸失败:', error);
      alert('生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          AI壁纸生成器
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          输入描述，AI为您生成专属壁纸
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* 标题输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            壁纸标题 (可选)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="为您的壁纸起个名字..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* 提示词输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            生图提示词 *
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述您想要的壁纸，例如：美丽的山水风景，夕阳西下，湖水倒影..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            required
          />
        </div>

        {/* 屏幕预设选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Monitor className="inline h-4 w-4 mr-1" />
            360水冷屏幕预设
          </label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as ScreenPreset)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="360_square_480p">方形 480×480 (标准)</option>
            <option value="360_square_640p">方形 640×640 (高清)</option>
            <option value="360_landscape">横屏 640×480 (宽屏)</option>
          </select>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {SCREEN_PRESETS[preset].width} × {SCREEN_PRESETS[preset].height} 像素
          </p>
        </div>

        {/* 生成按钮 */}
        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              <span>生成壁纸</span>
            </>
          )}
        </button>
      </form>

      {/* 生成结果 */}
      {generatedImage && (
        <div className="mt-8 text-center">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              生成成功！
            </h3>
            {wallpaperEvaluation && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 mb-4 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-2xl">{wallpaperEvaluation.emoji}</span>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {wallpaperEvaluation.emotion}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className={`text-lg font-semibold ${getScoreColorClass(wallpaperEvaluation.score)}`}>
                    {wallpaperEvaluation.score}/10
                  </span>
                  <span className="text-lg">
                    {generateStarRating(wallpaperEvaluation.score)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  "{wallpaperEvaluation.comment}"
                </p>
              </div>
            )}
          </div>

          <div className="inline-block bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <img
              src={generatedImage}
              alt="生成的壁纸"
              className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              style={{ maxHeight: '500px', maxWidth: '100%' }}
              onClick={() => window.open(generatedImage, '_blank')}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            壁纸已保存到图库，您可以在下方查看和下载
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            点击图片可放大查看
          </p>
        </div>
      )}
    </div>
  );
}
