'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Wand2, 
  Loader2, 
  Sparkles, 
  Image as ImageIcon, 
  History,
  Download,
  Heart,
  Share2,
  Settings,
  ChevronDown,
  Clock,
  Trash2,
  RefreshCw,
  Grid3X3,
  Palette,
  Zap,
  Camera
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { promptCacheManager, PromptTemplate } from '@/lib/prompt-cache';

// 生成历史记录接口
interface GenerationHistory {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
  model: string;
  size: string;
  generationTime: number;
}

// AI模型选项
const AI_MODELS = [
  { id: 'flux-pro', name: 'Flux Pro', description: '最新模型，质量极高', icon: '⚡', color: 'from-purple-500 to-pink-500' },
  { id: 'image-3.0', name: 'Image 3.0', description: '平衡速度与质量', icon: '🎯', color: 'from-blue-500 to-cyan-500' },
  { id: 'midjourney', name: 'Midjourney', description: '艺术风格突出', icon: '🎨', color: 'from-green-500 to-teal-500' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', description: '开源稳定', icon: '🔮', color: 'from-orange-500 to-red-500' }
];

// 尺寸预设
const SIZE_PRESETS = [
  { id: 'square_1024', name: '正方形', size: '1024×1024', ratio: '1:1', icon: '⬜', popular: true },
  { id: 'portrait_768_1024', name: '手机壁纸', size: '768×1024', ratio: '3:4', icon: '📱', popular: true },
  { id: 'landscape_1024_768', name: '电脑壁纸', size: '1024×768', ratio: '4:3', icon: '💻', popular: false },
  { id: 'desktop_fhd', name: '高清桌面', size: '1920×1080', ratio: '16:9', icon: '🖥️', popular: true }
];

// 风格预设
const STYLE_PRESETS = [
  { id: 'realistic', name: '写实', prompt: 'photorealistic, high quality, detailed', icon: '📷', color: 'bg-blue-100 text-blue-700' },
  { id: 'anime', name: '动漫', prompt: 'anime style, beautiful illustration', icon: '✨', color: 'bg-pink-100 text-pink-700' },
  { id: 'oil_painting', name: '油画', prompt: 'oil painting style, artistic', icon: '🎨', color: 'bg-green-100 text-green-700' },
  { id: 'cyberpunk', name: '赛博朋克', prompt: 'cyberpunk style, neon lights, futuristic', icon: '🌃', color: 'bg-purple-100 text-purple-700' },
  { id: 'minimalist', name: '极简', prompt: 'minimalist style, clean, simple', icon: '⚪', color: 'bg-gray-100 text-gray-700' },
  { id: 'watercolor', name: '水彩', prompt: 'watercolor painting style, soft colors', icon: '🌈', color: 'bg-indigo-100 text-indigo-700' }
];

export default function MainstreamWallpaperGenerator() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();

  // 基础状态
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZE_PRESETS[1]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  
  // 结果状态
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  
  // 模板和历史
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // 处理URL参数
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    const modelParam = searchParams.get('model');
    const sizeParam = searchParams.get('size');

    if (promptParam) {
      setPrompt(decodeURIComponent(promptParam));
    }

    if (modelParam) {
      const model = AI_MODELS.find(m => m.id === modelParam);
      if (model) setSelectedModel(model);
    }

    if (sizeParam) {
      const sizeMapping: Record<string, string> = {
        '1:1': 'square_1024',
        '9:16': 'portrait_768_1024', 
        '16:9': 'desktop_fhd',
        '3:4': 'portrait_768_1024',
        '4:3': 'landscape_1024_768'
      };
      const mappedSize = sizeMapping[sizeParam] || sizeParam;
      const sizeOption = SIZE_PRESETS.find(s => s.id === mappedSize);
      if (sizeOption) setSelectedSize(sizeOption);
    }
  }, [searchParams]);

  // 初始化系统
  useEffect(() => {
    const initializeSystem = async () => {
      const allTemplates = promptCacheManager.getPopularTemplates(8);
      setTemplates(allTemplates);
      
      const savedHistory = localStorage.getItem('wallpaper_generation_history');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (error) {
          console.error('加载历史记录失败:', error);
        }
      }
      
      promptCacheManager.warmupCache().catch(console.error);
    };
    
    initializeSystem();
  }, []);

  // 风格选择
  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  // 构建最终提示词
  const buildFinalPrompt = () => {
    let finalPrompt = prompt.trim();
    
    // 添加选中的风格
    const stylePrompts = selectedStyles
      .map(styleId => STYLE_PRESETS.find(s => s.id === styleId)?.prompt)
      .filter(Boolean);
    
    if (stylePrompts.length > 0) {
      finalPrompt += ', ' + stylePrompts.join(', ');
    }
    
    return finalPrompt;
  };

  // 保存历史记录
  const saveToHistory = (result: any) => {
    const historyItem: GenerationHistory = {
      id: Date.now().toString(),
      prompt: buildFinalPrompt(),
      imageUrl: result.wallpaper.imageUrl,
      timestamp: Date.now(),
      model: selectedModel.id,
      size: selectedSize.id,
      generationTime: result.timing?.totalTime || 0
    };

    const newHistory = [historyItem, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('wallpaper_generation_history', JSON.stringify(newHistory));
  };

  // 生成壁纸
  const handleGenerate = async () => {
    const finalPrompt = buildFinalPrompt();
    if (!finalPrompt) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationTime(null);
    setGenerationProgress(0);

    const startTime = Date.now();

    try {
      setGenerationStage('准备中...');
      setGenerationProgress(10);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setGenerationStage('优化提示词...');
      setGenerationProgress(25);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setGenerationStage('AI创作中...');
      setGenerationProgress(50);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          title: `AI生成 - ${new Date().toLocaleDateString()}`,
          preset: selectedSize.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGenerationStage('生成完成！');
        setGenerationProgress(100);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setGeneratedImage(result.wallpaper.imageUrl);
        setGenerationTime(Date.now() - startTime);
        saveToHistory(result);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* 顶部导航 */}
      <div className="border-b border-neutral-200/50 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                AI 壁纸生成器
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                专业级AI生图工具，创造独一无二的精美壁纸
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors"
              >
                <History className="h-4 w-4" />
                <span className="text-sm">历史 ({history.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：控制面板 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 提示词输入 */}
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 p-6">
              <div className="flex items-center mb-4">
                <Sparkles className="h-5 w-5 text-primary-500 mr-2" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">描述您的创意</h3>
              </div>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：美丽的樱花飞舞，粉色花瓣，春天的温暖阳光，高清摄影..."
                rows={4}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
              />
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {prompt.length} 字符
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={!buildFinalPrompt() || isGenerating}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{generationStage || '生成中...'}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span>开始生成</span>
                    </>
                  )}
                </button>
              </div>

              {/* 进度条 */}
              {isGenerating && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    <span>{generationStage}</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* AI模型选择 */}
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 p-6">
              <div className="flex items-center mb-4">
                <Zap className="h-5 w-5 text-primary-500 mr-2" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">AI模型</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {AI_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedModel.id === model.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white/50 dark:bg-neutral-700/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${model.color} flex items-center justify-center text-white text-lg font-bold`}>
                        {model.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-neutral-900 dark:text-white">
                          {model.name}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {model.description}
                        </div>
                      </div>
                    </div>
                    {selectedModel.id === model.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 尺寸选择 */}
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 p-6">
              <div className="flex items-center mb-4">
                <Grid3X3 className="h-5 w-5 text-primary-500 mr-2" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">图片尺寸</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SIZE_PRESETS.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedSize.id === size.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white/50 dark:bg-neutral-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{size.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-neutral-900 dark:text-white flex items-center">
                          {size.name}
                          {size.popular && (
                            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                              热门
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {size.size} ({size.ratio})
                        </div>
                      </div>
                    </div>
                    {selectedSize.id === size.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 风格预设 */}
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 p-6">
              <div className="flex items-center mb-4">
                <Palette className="h-5 w-5 text-primary-500 mr-2" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">风格预设</h3>
                <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">可多选</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => toggleStyle(style.id)}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      selectedStyles.includes(style.id)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : `border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 ${style.color}`
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">{style.icon}</div>
                      <div className="text-xs font-medium">{style.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 快速模板 */}
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 p-6">
              <div className="flex items-center mb-4">
                <Camera className="h-5 w-5 text-primary-500 mr-2" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">快速模板</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setPrompt(template.prompt)}
                    disabled={isGenerating}
                    className="p-3 bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <div className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                      {template.name}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {template.prompt}
                    </div>
                    <div className="text-xs text-primary-500 font-medium mt-1">
                      热度 {template.popularity}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：结果展示 */}
          <div className="space-y-6">
            {/* 生成结果 */}
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
                  <ImageIcon className="h-5 w-5 text-primary-500 mr-2" />
                  生成结果
                </h3>
                {generationTime && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {(generationTime / 1000).toFixed(1)}s
                  </span>
                )}
              </div>

              <div className="aspect-square bg-neutral-100 dark:bg-neutral-700 rounded-xl overflow-hidden mb-4">
                {isGenerating ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 relative">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-neutral-300 dark:text-neutral-600"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 35}`}
                            strokeDashoffset={`${2 * Math.PI * 35 * (1 - generationProgress / 100)}`}
                            className="text-primary-500 transition-all duration-500 ease-out"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-500">
                            {generationProgress}%
                          </span>
                        </div>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-400 font-medium text-sm">
                        {generationStage || 'AI正在创作中...'}
                      </p>
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
                        <button className="p-3 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-lg">
                          <Download className="h-5 w-5 text-neutral-700" />
                        </button>
                        <button className="p-3 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-lg">
                          <Heart className="h-5 w-5 text-neutral-700" />
                        </button>
                        <button className="p-3 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-lg">
                          <Share2 className="h-5 w-5 text-neutral-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        生成的壁纸将在这里显示
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 生成信息 */}
              {generatedImage && (
                <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <div className="flex justify-between">
                    <span>模型:</span>
                    <span>{selectedModel.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>尺寸:</span>
                    <span>{selectedSize.size}</span>
                  </div>
                  {selectedStyles.length > 0 && (
                    <div className="flex justify-between">
                      <span>风格:</span>
                      <span>{selectedStyles.length}个</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 历史面板（侧边栏） */}
        {showHistoryPanel && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="flex-1 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowHistoryPanel(false)}
            ></div>
            <div className="w-80 bg-white dark:bg-neutral-800 shadow-2xl overflow-y-auto">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    生成历史
                  </h3>
                  <button
                    onClick={() => setShowHistoryPanel(false)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  共 {history.length} 条记录
                </p>
              </div>

              <div className="p-4">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">暂无生成历史</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="group bg-neutral-50 dark:bg-neutral-700 rounded-lg p-3 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                      >
                        <div className="flex space-x-3">
                          <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-600 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.imageUrl}
                              alt="历史生成"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-neutral-900 dark:text-white font-medium line-clamp-2 mb-1">
                              {item.prompt}
                            </p>
                            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                              <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                              <span>{(item.generationTime / 1000).toFixed(1)}s</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setPrompt(item.prompt);
                              setShowHistoryPanel(false);
                            }}
                            className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-500 rounded transition-colors"
                            title="重新生成"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              const newHistory = history.filter(h => h.id !== item.id);
                              setHistory(newHistory);
                              localStorage.setItem('wallpaper_generation_history', JSON.stringify(newHistory));
                            }}
                            className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-500 rounded transition-colors"
                            title="删除"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
