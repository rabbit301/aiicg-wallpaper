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
  RefreshCw
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

// AI模型选项（简化）
const AI_MODELS = [
  { id: 'flux-pro', name: 'Flux Pro', icon: '⚡' },
  { id: 'image-3.0', name: 'Image 3.0', icon: '🎯' },
  { id: 'midjourney', name: 'Midjourney', icon: '🎨' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', icon: '🔮' }
];

// 尺寸选项（简化）
const SIZE_OPTIONS = [
  { id: 'square_1024', name: '正方形', ratio: '1:1', icon: '⬜' },
  { id: 'portrait_768_1024', name: '竖屏', ratio: '3:4', icon: '📱' },
  { id: 'landscape_1024_768', name: '横屏', ratio: '4:3', icon: '🖥️' },
  { id: 'desktop_fhd', name: '桌面', ratio: '16:9', icon: '💻' }
];

export default function IntuitiveWallpaperGenerator() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();

  // 基础状态
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[1]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  
  // 结果状态
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  
  // 模板和历史
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      const sizeOption = SIZE_OPTIONS.find(s => s.id === mappedSize);
      if (sizeOption) setSelectedSize(sizeOption);
    }
  }, [searchParams]);

  // 初始化系统
  useEffect(() => {
    const initializeSystem = async () => {
      // 加载模板
      const allTemplates = promptCacheManager.getPopularTemplates(12);
      setTemplates(allTemplates);
      
      // 加载历史记录
      const savedHistory = localStorage.getItem('wallpaper_generation_history');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (error) {
          console.error('加载历史记录失败:', error);
        }
      }
      
      // 预热缓存
      promptCacheManager.warmupCache().catch(console.error);
    };
    
    initializeSystem();
  }, []);

  // 保存历史记录
  const saveToHistory = (result: any) => {
    const historyItem: GenerationHistory = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      imageUrl: result.wallpaper.imageUrl,
      timestamp: Date.now(),
      model: selectedModel.id,
      size: selectedSize.id,
      generationTime: result.timing?.totalTime || 0
    };

    const newHistory = [historyItem, ...history].slice(0, 20); // 保留最近20条
    setHistory(newHistory);
    localStorage.setItem('wallpaper_generation_history', JSON.stringify(newHistory));
  };

  // 从历史记录重新生成
  const regenerateFromHistory = (historyItem: GenerationHistory) => {
    setPrompt(historyItem.prompt);
    const model = AI_MODELS.find(m => m.id === historyItem.model);
    const size = SIZE_OPTIONS.find(s => s.id === historyItem.size);
    if (model) setSelectedModel(model);
    if (size) setSelectedSize(size);
    setShowHistory(false);
  };

  // 删除历史记录
  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('wallpaper_generation_history', JSON.stringify(newHistory));
  };

  // 清空历史记录
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('wallpaper_generation_history');
  };

  // 模板选择
  const handleTemplateSelect = (template: PromptTemplate) => {
    setPrompt(template.prompt);
  };

  // 生成壁纸
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationTime(null);
    setGenerationProgress(0);

    const startTime = Date.now();

    try {
      // 阶段1：准备
      setGenerationStage('准备中...');
      setGenerationProgress(10);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 阶段2：处理提示词
      setGenerationStage('优化提示词...');
      setGenerationProgress(25);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 阶段3：AI生成
      setGenerationStage('AI创作中...');
      setGenerationProgress(50);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          title: `AI生成 - ${new Date().toLocaleDateString()}`,
          preset: selectedSize.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 阶段4：完成
        setGenerationStage('生成完成！');
        setGenerationProgress(100);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setGeneratedImage(result.wallpaper.imageUrl);
        setGenerationTime(Date.now() - startTime);
        
        // 保存到历史
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

  // 键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
            AI 壁纸生成器
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            用AI创造独一无二的精美壁纸
          </p>
        </div>

        {/* 主要生成区域 */}
        <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-6">
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
                placeholder="例如：美丽的樱花飞舞，粉色花瓣，春天的温暖阳光..."
                rows={3}
                className="w-full px-4 py-3 bg-white/50 dark:bg-neutral-700/50 border border-neutral-300/50 dark:border-neutral-600/50 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {prompt.length} 字符
                </span>
                <button
                  type="button"
                  className="p-1.5 text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                  title="AI优化提示词"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 快速设置 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* 模型选择 */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                AI模型
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AI_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                      selectedModel.id === model.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-neutral-300/50 dark:border-neutral-600/50 hover:border-neutral-400 dark:hover:border-neutral-500 bg-white/50 dark:bg-neutral-700/50'
                    }`}
                  >
                    <span className="text-lg">{model.icon}</span>
                    <span className="text-sm font-medium">{model.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 尺寸选择 */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                图片尺寸
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                      selectedSize.id === size.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-neutral-300/50 dark:border-neutral-600/50 hover:border-neutral-400 dark:hover:border-neutral-500 bg-white/50 dark:bg-neutral-700/50'
                    }`}
                  >
                    <span className="text-lg">{size.icon}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium">{size.name}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{size.ratio}</div>
                    </div>
                  </button>
                ))}
              </div>
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
                {generationStage || '生成中...'}
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                开始生成
              </>
            )}
          </button>

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

        {/* 快速模板 */}
        <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary-500" />
            快速模板
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {templates.slice(0, 8).map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                disabled={isGenerating}
                className="p-3 bg-white/50 dark:bg-neutral-700/50 hover:bg-white/70 dark:hover:bg-neutral-700/70 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
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

        {/* 生成结果 */}
        {(generatedImage || isGenerating) && (
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-primary-500" />
              生成结果
            </h3>

            <div className="aspect-square max-w-md mx-auto bg-neutral-100 dark:bg-neutral-700 rounded-xl overflow-hidden">
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
                    <p className="text-neutral-600 dark:text-neutral-400 font-medium">
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
                      <button className="p-3 bg-white/90 hover:bg-white rounded-lg transition-colors">
                        <Download className="h-5 w-5 text-neutral-700" />
                      </button>
                      <button className="p-3 bg-white/90 hover:bg-white rounded-lg transition-colors">
                        <Heart className="h-5 w-5 text-neutral-700" />
                      </button>
                      <button className="p-3 bg-white/90 hover:bg-white rounded-lg transition-colors">
                        <Share2 className="h-5 w-5 text-neutral-700" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {generationTime && (
              <div className="mt-4 text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  生成耗时: {(generationTime / 1000).toFixed(1)}秒
                </p>
              </div>
            )}
          </div>
        )}

        {/* 历史记录 */}
        <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/50 dark:border-neutral-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
              <History className="h-5 w-5 mr-2 text-primary-500" />
              生成历史
            </h3>
            <div className="flex items-center space-x-2">
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                >
                  清空历史
                </button>
              )}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
              >
                {showHistory ? '收起' : `查看全部 (${history.length})`}
              </button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无生成历史</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(showHistory ? history : history.slice(0, 4)).map((item) => (
                <div
                  key={item.id}
                  className="relative group bg-white/50 dark:bg-neutral-700/50 rounded-lg overflow-hidden"
                >
                  <div className="aspect-square">
                    <img
                      src={item.imageUrl}
                      alt="历史生成"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => regenerateFromHistory(item)}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                        title="重新生成"
                      >
                        <RefreshCw className="h-4 w-4 text-neutral-700" />
                      </button>
                      <button
                        onClick={() => deleteHistoryItem(item.id)}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4 text-neutral-700" />
                      </button>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs truncate">
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between text-white/80 text-xs mt-1">
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      <span>{(item.generationTime / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
