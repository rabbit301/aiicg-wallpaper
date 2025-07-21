'use client';

import { useState, useEffect } from 'react';
import { Wand2, Loader2, Sparkles, History, Shuffle, Image as ImageIcon, Zap, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WallpaperModal from './WallpaperModal';
import { SCREEN_PRESETS, ScreenPreset } from '@/lib/fal-client';
import { generateWallpaperEvaluation } from '@/lib/emotion-evaluator';
import type { EmotionEvaluation } from '@/lib/emotion-evaluator';

// 简化的预设分类
const PRESET_CATEGORIES = {
  popular: {
    name: '热门风格',
    nameEn: 'Popular Styles',
    icon: '🔥',
    prompts: [
      { text: '夕阳下的樱花飞舞，唯美日式风景', preview: '/previews/sakura.jpg' },
      { text: '赛博朋克城市夜景，霓虹灯光', preview: '/previews/cyberpunk.jpg' },
      { text: '宁静的山水画，中国风水墨', preview: '/previews/landscape.jpg' },
      { text: '星空下的银河，梦幻宇宙', preview: '/previews/galaxy.jpg' },
      { text: '温馨咖啡店，暖色调室内', preview: '/previews/cafe.jpg' },
      { text: '极简几何图形，现代抽象', preview: '/previews/minimal.jpg' }
    ]
  },
  anime: {
    name: '二次元',
    nameEn: 'Anime Style',
    icon: '🎌',
    prompts: [
      { text: '可爱动漫少女，大眼睛粉色头发', preview: '/previews/anime-girl.jpg' },
      { text: '魔法少女变身场景，星空背景', preview: '/previews/magical-girl.jpg' },
      { text: '古风仙女，飘逸长发云端飞舞', preview: '/previews/fairy.jpg' },
      { text: '机甲战士，未来科幻风格', preview: '/previews/mecha.jpg' }
    ]
  },
  nature: {
    name: '自然风光',
    nameEn: 'Nature',
    icon: '🌿',
    prompts: [
      { text: '壮丽山景，金色黄昏薄雾', preview: '/previews/mountain.jpg' },
      { text: '海边日出，波浪拍打礁石', preview: '/previews/ocean.jpg' },
      { text: '森林小径，阳光透过树叶', preview: '/previews/forest.jpg' },
      { text: '薰衣草田，紫色花海夕阳', preview: '/previews/lavender.jpg' }
    ]
  },
  abstract: {
    name: '抽象艺术',
    nameEn: 'Abstract Art',
    icon: '🎨',
    prompts: [
      { text: '流动液体金属，彩虹反射', preview: '/previews/liquid.jpg' },
      { text: '几何形状组合，渐变色彩', preview: '/previews/geometric.jpg' },
      { text: '粒子爆炸效果，能量波纹', preview: '/previews/particles.jpg' },
      { text: '水彩扩散，有机流动形态', preview: '/previews/watercolor.jpg' }
    ]
  }
};

// 快速生成选项 - 使用翻译键
const getQuickGenerateOptions = (t: any) => [
  { key: 'randomStyle', text: t('generatePage.randomStyle'), icon: Shuffle, color: 'from-purple-500 to-pink-500' },
  { key: 'popularRecommend', text: t('generatePage.popularRecommend'), icon: Heart, color: 'from-red-500 to-orange-500' },
  { key: 'todayPick', text: t('generatePage.todayPick'), icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
  { key: 'aiRecommend', text: t('generatePage.aiRecommend'), icon: Zap, color: 'from-green-500 to-teal-500' }
];

// 生成历史接口
interface GenerationHistory {
  id: string;
  prompt: string;
  title: string;
  imageUrl: string;
  preset: ScreenPreset;
  timestamp: number;
  evaluation?: EmotionEvaluation;
}

export default function WallpaperGeneratorNew() {
  const { t, locale } = useLanguage();

  // 获取本地化的快速生成选项
  const quickGenerateOptions = getQuickGenerateOptions(t);
  
  // 基础状态
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [preset, setPreset] = useState<ScreenPreset>('desktop_fhd');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 生成结果
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [wallpaperEvaluation, setWallpaperEvaluation] = useState<EmotionEvaluation | null>(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // 新功能状态
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  // 加载生成历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('wallpaper-generation-history');
    if (savedHistory) {
      try {
        setGenerationHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load generation history:', error);
      }
    }
  }, []);

  // 保存生成历史
  const saveToHistory = (result: any) => {
    const historyItem: GenerationHistory = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      title: title.trim() || '未命名壁纸',
      imageUrl: result.wallpaper.imageUrl,
      preset,
      timestamp: Date.now(),
      evaluation: wallpaperEvaluation || undefined
    };

    const newHistory = [historyItem, ...generationHistory.slice(0, 19)]; // 保留最近20条
    setGenerationHistory(newHistory);
    localStorage.setItem('wallpaper-generation-history', JSON.stringify(newHistory));
  };

  // 处理预设选择
  const handlePresetSelect = (presetText: string) => {
    if (prompt.trim()) {
      setPrompt(prompt.trim() + ', ' + presetText);
    } else {
      setPrompt(presetText);
    }
  };

  // 快速生成
  const handleQuickGenerate = async (key: string, displayText: string) => {
    let quickPrompt = '';

    switch (key) {
      case 'randomStyle':
        const categories = Object.values(PRESET_CATEGORIES);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomPrompt = randomCategory.prompts[Math.floor(Math.random() * randomCategory.prompts.length)];
        quickPrompt = randomPrompt.text;
        break;
      case 'popularRecommend':
        quickPrompt = PRESET_CATEGORIES.popular.prompts[0].text;
        break;
      case 'todayPick':
        const today = new Date().getDate();
        const todayIndex = today % PRESET_CATEGORIES.popular.prompts.length;
        quickPrompt = PRESET_CATEGORIES.popular.prompts[todayIndex].text;
        break;
      case 'aiRecommend':
        quickPrompt = '创意抽象艺术，现代设计风格，高质量渲染';
        break;
    }

    setPrompt(quickPrompt);
    setTitle(`${displayText} - ${new Date().toLocaleDateString()}`);

    // 自动开始生成
    setTimeout(() => {
      handleGenerate(new Event('submit') as any);
    }, 500);
  };

  // 生成壁纸
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    setWallpaperEvaluation(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          title: title.trim(),
          preset,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedImage(result.wallpaper.imageUrl);
        
        // 生成评价
        const evaluation = generateWallpaperEvaluation(
          prompt,
          result.timing?.aiGenerationTime || 5000,
          { width: result.wallpaper.width, height: result.wallpaper.height }
        );
        setWallpaperEvaluation(evaluation);
        
        // 保存到历史
        saveToHistory(result);
      } else {
        console.error('Generation failed:', result.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 预览生成的图片
  const handlePreviewGenerated = () => {
    if (generatedImage) {
      setSelectedWallpaper({
        id: 'generated',
        title: title || '生成的壁纸',
        imageUrl: generatedImage,
        width: 1920,
        height: 1080,
        format: 'jpg'
      });
      setModalOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
          {t('generatePage.title')}
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          {t('generatePage.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：预设和快速生成 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 快速生成 */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary-500" />
              {t('generatePage.quickGenerate')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickGenerateOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleQuickGenerate(option.key, option.text)}
                  disabled={isGenerating}
                  className={`p-3 rounded-lg bg-gradient-to-r ${option.color} text-white font-medium text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option.icon className="h-4 w-4 mx-auto mb-1" />
                  {option.text}
                </button>
              ))}
            </div>
          </div>

          {/* 风格预设 */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-secondary-500" />
              {t('generatePage.stylePresets')}
            </h3>
            
            {/* 分类选择 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(PRESET_CATEGORIES).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  {category.icon} {locale === 'zh-CN' ? category.name : category.nameEn}
                </button>
              ))}
            </div>

            {/* 预设选项 */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {PRESET_CATEGORIES[selectedCategory as keyof typeof PRESET_CATEGORIES]?.prompts.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetSelect(preset.text)}
                  disabled={isGenerating}
                  className="w-full text-left p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors text-sm text-neutral-700 dark:text-neutral-300 disabled:opacity-50"
                >
                  {preset.text}
                </button>
              ))}
            </div>
          </div>

          {/* 生成历史 */}
          {generationHistory.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
                  <History className="h-5 w-5 mr-2 text-accent-500" />
                  {t('generatePage.generationHistory')}
                </h3>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-primary-500 hover:text-primary-600"
                >
                  {showHistory ? t('generatePage.collapse') : t('generatePage.expand')}
                </button>
              </div>
              
              {showHistory && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {generationHistory.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPrompt(item.prompt);
                        setTitle(item.title);
                        setPreset(item.preset);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                    >
                      <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {item.prompt}
                      </div>
                      <div className="text-xs text-neutral-400 dark:text-neutral-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右侧：生成器和结果 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 生成器表单 */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* 标题输入 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t('generatePage.wallpaperTitle')} ({t('optional')})
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('generatePage.titlePlaceholder')}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              {/* 提示词输入 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t('generatePage.promptLabel')} * <span className="text-primary-600">{t('generatePage.promptSupport')}</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('generatePage.promptPlaceholder')}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white resize-none"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {prompt.trim().length} {t('generatePage.characters')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPrompt('')}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    {t('generatePage.clear')}
                  </button>
                </div>
              </div>

              {/* 尺寸选择 - 简化版 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  {t('generatePage.wallpaperSize')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ['desktop_fhd', t('generatePage.sizes.desktopFhd')],
                    ['mobile_portrait', t('generatePage.sizes.mobilePortrait')],
                    ['square_1024', t('generatePage.sizes.square1024')],
                    ['desktop_4k', t('generatePage.sizes.desktop4k')]
                  ].map(([key, name]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPreset(key as ScreenPreset)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        preset === key
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 生成按钮 */}
              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t('generatePage.generating')}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 mr-2" />
                    {t('generatePage.generateButton')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 生成结果 */}
          {generatedImage && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                {t('generatePage.generationResult')}
              </h3>
              
              <div className="text-center">
                {wallpaperEvaluation && (
                  <div className="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-2xl">{wallpaperEvaluation.emoji}</span>
                      <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                        {wallpaperEvaluation.emotion}
                      </span>
                      <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                        {wallpaperEvaluation.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                      "{wallpaperEvaluation.comment}"
                    </p>
                  </div>
                )}

                <div className="relative inline-block">
                  <img
                    src={generatedImage}
                    alt="生成的壁纸"
                    className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                    style={{ maxHeight: '400px' }}
                    onClick={handlePreviewGenerated}
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{t('generatePage.clickToPreview')}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4">
                  {t('generatePage.savedToGallery')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 图片预览模态框 */}
      <WallpaperModal
        wallpaper={selectedWallpaper}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedWallpaper(null);
        }}
      />
    </div>
  );
}
