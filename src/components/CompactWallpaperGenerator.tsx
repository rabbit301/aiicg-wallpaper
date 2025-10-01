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
  ChevronDown,
  Trash2,
  RefreshCw,
  X
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

// AI模型选项（紧凑版）
const AI_MODELS = [
  { id: 'flux-pro', name: 'Flux Pro', description: '最新模型，质量极高' },
  { id: 'image-3.0', name: 'Image 3.0', description: '平衡速度与质量' },
  { id: 'midjourney', name: 'Midjourney', description: '艺术风格突出' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', description: '开源稳定' }
];

// 尺寸预设（与首页完全一致）
const SIZE_PRESETS = [
  { id: '21:9', name: '21:9', desc: '超宽屏', width: 1344, height: 576 },
  { id: '16:9', name: '16:9', desc: '横屏', width: 1024, height: 576 },
  { id: '3:2', name: '3:2', desc: '经典', width: 1024, height: 683 },
  { id: '4:3', name: '4:3', desc: '横版', width: 1024, height: 768 },
  { id: '1:1', name: '1:1', desc: '正方形', width: 1024, height: 1024 },
  { id: '3:4', name: '3:4', desc: '竖版', width: 768, height: 1024 },
  { id: '2:3', name: '2:3', desc: '竖屏', width: 683, height: 1024 },
  { id: '9:16', name: '9:16', desc: '手机', width: 576, height: 1024 }
];

// 风格预设（紧凑版）
const STYLE_PRESETS = [
  { id: 'realistic', name: '写实', prompt: 'photorealistic, high quality, detailed' },
  { id: 'anime', name: '动漫', prompt: 'anime style, beautiful illustration' },
  { id: 'oil_painting', name: '油画', prompt: 'oil painting style, artistic' },
  { id: 'cyberpunk', name: '赛博朋克', prompt: 'cyberpunk style, neon lights, futuristic' },
  { id: 'minimalist', name: '极简', prompt: 'minimalist style, clean, simple' },
  { id: 'watercolor', name: '水彩', prompt: 'watercolor painting style, soft colors' }
];

export default function CompactWallpaperGenerator() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();

  // 基础状态
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZE_PRESETS[4]); // 默认1:1
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');
  
  // 结果状态
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  
  // UI状态
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  
  // 模板和历史
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [history, setHistory] = useState<GenerationHistory[]>([]);

  // 处理URL参数（精确映射）
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
      // 直接使用首页传递的尺寸ID
      const sizeOption = SIZE_PRESETS.find(s => s.id === sizeParam);
      if (sizeOption) {
        setSelectedSize(sizeOption);
        console.log('🎯 匹配到尺寸:', sizeOption.name, sizeOption.desc);
      } else {
        console.warn('⚠️ 未找到匹配的尺寸:', sizeParam);
      }
    }
  }, [searchParams]);

  // 初始化系统
  useEffect(() => {
    const initializeSystem = async () => {
      const allTemplates = promptCacheManager.getPopularTemplates(6);
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

      // 将首页的尺寸格式转换为API需要的preset格式
      const presetMapping: Record<string, string> = {
        '21:9': 'desktop_ultrawide',
        '16:9': 'desktop_fhd',
        '3:2': 'tablet_landscape',
        '4:3': 'landscape_1024_768',
        '1:1': 'square_1024',
        '3:4': 'portrait_768_1024',
        '2:3': 'tablet_portrait',
        '9:16': 'mobile_portrait'
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          title: `AI生成 - ${new Date().toLocaleDateString()}`,
          preset: presetMapping[selectedSize.id] || 'square_1024',
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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 紧凑标题 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
            AI 壁纸生成器
          </h1>
          <div className="flex items-center justify-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
            <span>专业级AI生图工具</span>
            <button
              onClick={() => setShowHistoryPanel(true)}
              className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
            >
              <History className="h-4 w-4" />
              <span>历史 ({history.length})</span>
            </button>
          </div>
        </div>

        {/* 主要生成区域 */}
        <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-6">
          {/* 提示词输入 */}
          <div className="mb-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述您想要的壁纸，例如：美丽的樱花飞舞，粉色花瓣，春天的温暖阳光..."
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
            />
          </div>

          {/* 紧凑参数行 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* AI模型选择（下拉） */}
            <div className="relative">
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                AI模型
              </label>
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
              >
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {selectedModel.name}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </button>
              
              {showModelDropdown && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {model.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {model.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 尺寸选择（紧凑标签） */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                图片尺寸
              </label>
              <div className="grid grid-cols-4 gap-1">
                {SIZE_PRESETS.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      selectedSize.id === size.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {selectedSize.width}×{selectedSize.height} ({selectedSize.desc})
              </div>
            </div>

            {/* 生成按钮 */}
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={!buildFinalPrompt() || isGenerating}
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="text-sm">{generationStage || '生成中...'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    <span className="text-sm">开始生成</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 风格预设（紧凑标签） */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              风格预设 <span className="text-neutral-500">（可多选）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    selectedStyles.includes(style.id)
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* 进度条 */}
          {isGenerating && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                <span>{generationStage}</span>
                <span>{generationProgress}%</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 快速模板 */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              快速模板
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setPrompt(template.prompt)}
                  disabled={isGenerating}
                  className="p-2 bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <div className="text-xs font-medium text-neutral-900 dark:text-white mb-1">
                    {template.name}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {template.prompt.substring(0, 40)}...
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 生成结果（条件显示） */}
        {(generatedImage || isGenerating) && (
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-6">
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
              ) : null}
            </div>

            {/* 生成信息 */}
            {generatedImage && (
              <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                <div className="text-center">
                  <div className="font-medium text-neutral-700 dark:text-neutral-300">模型</div>
                  <div>{selectedModel.name}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-neutral-700 dark:text-neutral-300">尺寸</div>
                  <div>{selectedSize.name}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-neutral-700 dark:text-neutral-300">风格</div>
                  <div>{selectedStyles.length || '无'}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 简洁历史面板（模态框） */}
        {showHistoryPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowHistoryPanel(false)}
            ></div>
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* 标题栏 */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  生成历史 ({history.length})
                </h3>
                <button
                  onClick={() => setShowHistoryPanel(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 历史列表 */}
              <div className="overflow-y-auto max-h-96 p-4">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">暂无生成历史</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="group relative bg-neutral-50 dark:bg-neutral-700 rounded-lg overflow-hidden"
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
                              onClick={() => {
                                setPrompt(item.prompt);
                                setShowHistoryPanel(false);
                              }}
                              className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                              title="重新生成"
                            >
                              <RefreshCw className="h-4 w-4 text-neutral-700" />
                            </button>
                            <button
                              onClick={() => {
                                const newHistory = history.filter(h => h.id !== item.id);
                                setHistory(newHistory);
                                localStorage.setItem('wallpaper_generation_history', JSON.stringify(newHistory));
                              }}
                              className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4 text-neutral-700" />
                            </button>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-white text-xs truncate">
                            {item.prompt.substring(0, 30)}...
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
        )}
      </div>
    </div>
  );
}
