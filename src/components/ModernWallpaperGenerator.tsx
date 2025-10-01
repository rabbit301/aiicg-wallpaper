'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Wand2, 
  Loader2, 
  Sparkles, 
  Image as ImageIcon, 
  Zap, 
  Settings,
  ChevronDown,
  Upload,
  ArrowUp,
  Heart,
  Download,
  Share2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SCREEN_PRESETS, ScreenPreset } from '@/lib/image-generation/service';
import { promptCacheManager, PromptTemplate } from '@/lib/prompt-cache';

// AI模型选项
const AI_MODELS = [
  { id: 'flux-pro', name: 'Flux Pro', icon: '⚡', description: '最新AI模型，生成质量极高' },
  { id: 'image-3.0', name: 'Image 3.0', icon: '🎯', description: '平衡速度与质量的经典选择' },
  { id: 'midjourney', name: 'Midjourney', icon: '🎨', description: '艺术风格突出，创意表现力强' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', icon: '🔮', description: '开源模型，稳定可靠' }
];

// 尺寸预设选项
const SIZE_OPTIONS = [
  { id: 'square_1024', name: '1:1 正方形', size: '1024×1024', icon: '⬜' },
  { id: 'portrait_768_1024', name: '3:4 竖屏', size: '768×1024', icon: '📱' },
  { id: 'landscape_1024_768', name: '4:3 横屏', size: '1024×768', icon: '🖥️' },
  { id: 'desktop_fhd', name: '16:9 桌面', size: '1920×1080', icon: '💻' }
];

// 模板类别图标映射
const CATEGORY_ICONS: Record<string, string> = {
  nature: '🌿',
  abstract: '🎨',
  anime: '✨',
  scifi: '🌃'
};

export default function ModernWallpaperGenerator() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();

  // 基础状态
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[1]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  
  // UI状态
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  
  // 生成结果
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  // 模板相关状态
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 处理URL参数
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    const modelParam = searchParams.get('model');
    const sizeParam = searchParams.get('size');

    console.log('🔗 接收到URL参数:', { promptParam, modelParam, sizeParam });

    if (promptParam) {
      const decodedPrompt = decodeURIComponent(promptParam);
      setPrompt(decodedPrompt);
      console.log('📝 设置提示词:', decodedPrompt);
    }

    if (modelParam) {
      // 首页传递的模型ID映射
      const modelMapping: Record<string, string> = {
        'image-3.0': 'image-3.0',
        'flux-pro': 'flux-pro',
        'midjourney': 'midjourney',
        'stable-diffusion': 'stable-diffusion'
      };

      const mappedModelId = modelMapping[modelParam] || modelParam;
      const model = AI_MODELS.find(m => m.id === mappedModelId);
      if (model) {
        setSelectedModel(model);
        console.log('🤖 设置AI模型:', model.name);
      }
    }

    if (sizeParam) {
      // 首页传递的尺寸参数映射
      const sizeMapping: Record<string, string> = {
        // 首页传递的格式 -> 内部尺寸ID
        '1:1': 'square_1024',
        '9:16': 'portrait_768_1024',
        '16:9': 'landscape_1024_768',
        '3:4': 'portrait_768_1024',
        '4:3': 'landscape_1024_768',
        // 直接传递内部ID的情况
        'square_1024': 'square_1024',
        'portrait_768_1024': 'portrait_768_1024',
        'landscape_1024_768': 'landscape_1024_768',
        'desktop_fhd': 'desktop_fhd'
      };

      const mappedSize = sizeMapping[sizeParam] || sizeParam;
      const sizeOption = SIZE_OPTIONS.find(s => s.id === mappedSize);
      if (sizeOption) {
        setSelectedSize(sizeOption);
        console.log('📐 设置图片尺寸:', sizeOption.name);
      }
    }
  }, [searchParams]);

  // 加载模板和预热缓存
  useEffect(() => {
    const initializeSystem = async () => {
      // 加载模板
      const allTemplates = promptCacheManager.getTemplates();
      setTemplates(allTemplates);

      // 预热缓存（异步执行，不阻塞UI）
      promptCacheManager.warmupCache().catch(console.error);

      console.log('🚀 AI生图系统初始化完成');
      console.log('📊 缓存统计:', promptCacheManager.getCacheStats());
    };

    initializeSystem();
  }, []);

  // 快速模板选择
  const handleTemplateSelect = (template: PromptTemplate) => {
    setPrompt(template.prompt);
    console.log('📋 选择模板:', template.name);
  };

  // 获取过滤后的模板
  const getFilteredTemplates = () => {
    if (selectedCategory === 'all') {
      return templates.slice(0, 8); // 显示前8个热门模板
    }
    return templates.filter(t => t.category === selectedCategory).slice(0, 8);
  };

  // 图片上传处理
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  // 生成壁纸（带进度提示）
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationTime(null);
    setGenerationProgress(0);

    const startTime = Date.now();

    try {
      // 阶段1：提示词处理
      setGenerationStage('正在优化提示词...');
      setGenerationProgress(20);

      // 模拟处理延迟以显示进度
      await new Promise(resolve => setTimeout(resolve, 500));

      // 阶段2：AI生成
      setGenerationStage('AI正在创作中...');
      setGenerationProgress(40);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          title: `AI生成 - ${new Date().toLocaleDateString()}`,
          preset: selectedSize.id,
        }),
      });

      // 阶段3：处理结果
      setGenerationStage('正在处理结果...');
      setGenerationProgress(80);

      const result = await response.json();

      if (result.success) {
        setGenerationStage('生成完成！');
        setGenerationProgress(100);

        // 延迟显示结果，让用户看到完成状态
        await new Promise(resolve => setTimeout(resolve, 500));

        setGeneratedImage(result.wallpaper.imageUrl);
        setGenerationTime(Date.now() - startTime);
      } else {
        console.error('Generation failed:', result.error);
        setGenerationStage('生成失败');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationStage('生成出错');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStage('');
    }
  };

  // 键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
            AI 壁纸生成器
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            用AI创造独一无二的精美壁纸
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* 左侧：生成控制面板 */}
          <div className="space-y-6">
            {/* 主要生成卡片 */}
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 p-6">
              {/* 提示词输入 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  描述您想要的壁纸
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="请描述您脑海中想像的影像..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-neutral-700/50 border border-neutral-300/50 dark:border-neutral-600/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 backdrop-blur-sm"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {prompt.length} 字符
                    </span>
                    <button
                      type="button"
                      className="p-1.5 text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 模型和尺寸选择 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* AI模型选择 */}
                <div className="relative">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    AI模型
                  </label>
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/50 dark:bg-neutral-700/50 border border-neutral-300/50 dark:border-neutral-600/50 rounded-xl hover:bg-white/70 dark:hover:bg-neutral-700/70 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{selectedModel.icon}</span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {selectedModel.name}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-neutral-500" />
                  </button>
                  
                  {showModelDropdown && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-neutral-200/70 dark:border-neutral-700/60 py-2 z-50">
                      {AI_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model);
                            setShowModelDropdown(false);
                          }}
                          className="w-full flex items-start space-x-3 px-4 py-3 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/60 transition-colors text-left"
                        >
                          <span className="text-lg mt-0.5">{model.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                              {model.name}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {model.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 尺寸选择 */}
                <div className="relative">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    图片尺寸
                  </label>
                  <button
                    onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/50 dark:bg-neutral-700/50 border border-neutral-300/50 dark:border-neutral-600/50 rounded-xl hover:bg-white/70 dark:hover:bg-neutral-700/70 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{selectedSize.icon}</span>
                      <div className="text-left">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {selectedSize.name}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {selectedSize.size}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-neutral-500" />
                  </button>
                  
                  {showSizeDropdown && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-neutral-200/70 dark:border-neutral-700/60 py-2 z-50">
                      {SIZE_OPTIONS.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => {
                            setSelectedSize(size);
                            setShowSizeDropdown(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/60 transition-colors text-left"
                        >
                          <span className="text-lg">{size.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                              {size.name}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              {size.size}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 生成按钮 */}
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    正在生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 mr-2" />
                    开始生成
                  </>
                )}
              </button>
            </div>

            {/* 智能模板库 */}
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-primary-500" />
                智能模板库
              </h3>

              {/* 类别筛选 */}
              <div className="flex space-x-2 mb-4 overflow-x-auto">
                {[
                  { key: 'all', name: '全部', icon: '🎯' },
                  { key: 'nature', name: '自然', icon: '🌿' },
                  { key: 'abstract', name: '抽象', icon: '🎨' },
                  { key: 'anime', name: '动漫', icon: '✨' },
                  { key: 'scifi', name: '科幻', icon: '🌃' }
                ].map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === category.key
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/50 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400 hover:bg-white/70 dark:hover:bg-neutral-700/70'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>

              {/* 模板网格 */}
              <div className="grid grid-cols-2 gap-3">
                {getFilteredTemplates().map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    disabled={isGenerating}
                    className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-neutral-700/50 hover:bg-white/70 dark:hover:bg-neutral-700/70 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <span className="text-lg mt-0.5">{CATEGORY_ICONS[template.category] || '🎨'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {template.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                        {template.prompt}
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="text-xs text-primary-500 font-medium">
                          热度 {template.popularity}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {getFilteredTemplates().length === 0 && (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">该类别暂无模板</p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：生成结果 */}
          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-primary-500" />
                生成结果
              </h3>
              
              <div className="aspect-square bg-neutral-100 dark:bg-neutral-700 rounded-xl overflow-hidden">
                {isGenerating ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center max-w-xs">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                            {/* 背景圆环 */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-neutral-300 dark:text-neutral-600"
                            />
                            {/* 进度圆环 */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - generationProgress / 100)}`}
                              className="text-primary-500 transition-all duration-500 ease-out"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary-500">
                              {generationProgress}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-neutral-900 dark:text-white font-medium">
                          {generationStage || 'AI正在创作中...'}
                        </p>
                        <div className="flex items-center justify-center space-x-1">
                          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : generatedImage ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={generatedImage}
                      alt="Generated wallpaper"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors">
                          <Download className="h-5 w-5 text-neutral-700" />
                        </button>
                        <button className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors">
                          <Heart className="h-5 w-5 text-neutral-700" />
                        </button>
                        <button className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors">
                          <Share2 className="h-5 w-5 text-neutral-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-500 dark:text-neutral-400">生成的壁纸将在这里显示</p>
                    </div>
                  </div>
                )}
              </div>

              {generationTime && (
                <div className="mt-4 text-center space-y-2">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    生成耗时: {(generationTime / 1000).toFixed(1)}秒
                  </p>
                  <div className="text-xs text-neutral-400 dark:text-neutral-500">
                    <button
                      onClick={() => {
                        const stats = promptCacheManager.getCacheStats();
                        console.log('📊 缓存统计:', stats);
                        alert(`缓存统计:\n大小: ${stats.size}/${stats.maxSize}\n命中率: ${(stats.hitRate * 100).toFixed(1)}%`);
                      }}
                      className="hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
                    >
                      查看性能统计
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
