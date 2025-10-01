'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Wand2,
  Loader2,
  Download,
  Heart,
  Share2,
  History,
  Settings,
  RefreshCw,
  Trash2,
  X,
  Sparkles,
  ChevronDown,
  ArrowUp,
  Upload,
  Image as ImageIcon
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
  { id: 'image-3.0', name: 'Image 3.0', icon: '🎯' },
  { id: 'flux-pro', name: 'Flux Pro', icon: '⚡' },
  { id: 'midjourney', name: 'Midjourney', icon: '🎨' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', icon: '🔮' }
];

// 尺寸预设（与首页完全一致）
const SIZE_PRESETS = [
  { id: '21:9', name: '21:9', desc: '超宽屏 (1K)', width: 1344, height: 576 },
  { id: '16:9', name: '16:9', desc: '横屏 (1K)', width: 1024, height: 576 },
  { id: '3:2', name: '3:2', desc: '经典 (1K)', width: 1024, height: 683 },
  { id: '4:3', name: '4:3', desc: '横版 (1K)', width: 1024, height: 768 },
  { id: '1:1', name: '1:1', desc: '正方形 (1K)', width: 1024, height: 1024 },
  { id: '3:4', name: '3:4', desc: '竖版 (1K)', width: 768, height: 1024 },
  { id: '2:3', name: '2:3', desc: '竖屏 (1K)', width: 683, height: 1024 },
  { id: '9:16', name: '9:16', desc: '手机 (1K)', width: 576, height: 1024 }
];

// 风格预设 - 增加更多选项
const STYLE_PRESETS = [
  { id: 'realistic', name: '写实摄影', prompt: 'photorealistic, high quality, detailed, professional photography', icon: '📷' },
  { id: 'anime', name: '动漫插画', prompt: 'anime style, beautiful illustration, vibrant colors', icon: '🎨' },
  { id: 'oil_painting', name: '油画艺术', prompt: 'oil painting style, artistic, classical art', icon: '🖼️' },
  { id: 'cyberpunk', name: '赛博朋克', prompt: 'cyberpunk style, neon lights, futuristic, sci-fi', icon: '🌃' },
  { id: 'minimalist', name: '极简风格', prompt: 'minimalist style, clean, simple, modern', icon: '⚪' },
  { id: 'watercolor', name: '水彩画', prompt: 'watercolor painting style, soft colors, artistic', icon: '🌈' },
  { id: 'sketch', name: '素描风格', prompt: 'pencil sketch, hand drawn, artistic sketch', icon: '✏️' },
  { id: 'vintage', name: '复古风格', prompt: 'vintage style, retro, nostalgic, film grain', icon: '📼' },
  { id: 'fantasy', name: '奇幻风格', prompt: 'fantasy art, magical, mystical, ethereal', icon: '🧙' },
  { id: 'pixel', name: '像素艺术', prompt: 'pixel art style, 8-bit, retro gaming', icon: '🎮' },
  { id: 'comic', name: '漫画风格', prompt: 'comic book style, bold lines, pop art', icon: '💥' },
  { id: 'abstract', name: '抽象艺术', prompt: 'abstract art, geometric, modern art', icon: '🔶' }
];

// 参数预设
const PARAMETER_PRESETS = [
  {
    id: 'quality',
    name: '高质量',
    params: { inferenceSteps: 30, guidanceScale: 8.0 }
  },
  {
    id: 'fast',
    name: '快速生成',
    params: { inferenceSteps: 15, guidanceScale: 6.0 }
  },
  {
    id: 'creative',
    name: '创意模式',
    params: { inferenceSteps: 25, guidanceScale: 12.0 }
  }
];

export default function WallpaperGenerator() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);

  // 基础状态
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZE_PRESETS[1]); // 默认16:9
  const [selectedStylePreset, setSelectedStylePreset] = useState<string | null>(null);
  const [selectedParameterPreset, setSelectedParameterPreset] = useState<string | null>(null);
  const [numImages, setNumImages] = useState(1);
  const [seed, setSeed] = useState('');
  const [inferenceSteps, setInferenceSteps] = useState(25);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [negativePrompt, setNegativePrompt] = useState('');

  // UI状态
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [activePresetTab, setActivePresetTab] = useState<'style' | 'params'>('style');
  
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState('');

  // 结果状态
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const [history, setHistory] = useState<GenerationHistory[]>([]);

  // 点击外部关闭展开状态和下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // 关闭展开状态
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isExpanded && !prompt.trim()) {
          setIsExpanded(false);
        }
      }

      // 独立关闭模型下拉菜单
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }

      // 独立关闭尺寸下拉菜单
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target as Node)) {
        setShowSizeDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, prompt]);

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    } else if (e.key === 'Escape') {
      if (isExpanded && !prompt.trim()) {
        setIsExpanded(false);
      }
    }
  };

  // 预设处理函数
  const applyStylePreset = (presetId: string) => {
    const preset = STYLE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedStylePreset(presetId);
      // 将预设提示词添加到当前提示词中
      const currentPrompt = prompt.trim();
      if (currentPrompt) {
        setPrompt(`${currentPrompt}, ${preset.prompt}`);
      } else {
        setPrompt(preset.prompt);
      }
    }
  };

  const applyParameterPreset = (presetId: string) => {
    const preset = PARAMETER_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedParameterPreset(presetId);
      setInferenceSteps(preset.params.inferenceSteps);
      setGuidanceScale(preset.params.guidanceScale);
    }
  };

  const clearStylePreset = () => {
    setSelectedStylePreset(null);
    // 移除预设相关的提示词
    if (selectedStylePreset) {
      const preset = STYLE_PRESETS.find(p => p.id === selectedStylePreset);
      if (preset) {
        const newPrompt = prompt.replace(`, ${preset.prompt}`, '').replace(preset.prompt, '').trim();
        setPrompt(newPrompt);
      }
    }
  };

  const clearParameterPreset = () => {
    setSelectedParameterPreset(null);
    // 重置为默认参数
    setInferenceSteps(25);
    setGuidanceScale(7.5);
  };

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
      const sizeOption = SIZE_PRESETS.find(s => s.id === sizeParam);
      if (sizeOption) setSelectedSize(sizeOption);
    }
  }, [searchParams]);

  // 初始化系统
  useEffect(() => {
    const initializeSystem = async () => {
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

    const newHistory = [historyItem, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('wallpaper_generation_history', JSON.stringify(newHistory));
  };

  // 生成壁纸
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImages([]);
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

      const presetMapping: Record<string, string> = {
        '1:1': 'square_1024',
        '3:2': 'tablet_landscape',
        '3:4': 'portrait_768_1024',
        '16:9': 'desktop_fhd',
        '9:16': 'mobile_portrait',
        '4:3': 'landscape_1024_768'
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          title: `AI生成 - ${new Date().toLocaleDateString()}`,
          preset: presetMapping[selectedSize.id] || 'square_1024',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGenerationStage('生成完成！');
        setGenerationProgress(100);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setGeneratedImages([result.wallpaper.imageUrl]);
        setSelectedImageIndex(0);
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
      {/* 顶部标题栏 - 去掉边框线 */}
      <div className="h-16 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl flex items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            AI 壁纸生成器
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            专业级AI生图工具
          </p>
        </div>
        {/* 筛选器容器 - 参考即梦设计 */}
        <div className="flex items-center space-x-0 bg-white/80 dark:bg-neutral-700/60 backdrop-blur-sm rounded-lg border border-neutral-200/50 dark:border-neutral-600/40 overflow-hidden">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center space-x-1.5 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50/80 dark:hover:bg-neutral-600/50 transition-all"
          >
            <History className="h-4 w-4" />
            <span>历史记录</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          <div className="w-px h-4 bg-neutral-300/60 dark:bg-neutral-600/60"></div>

          <button className="flex items-center space-x-1.5 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50/80 dark:hover:bg-neutral-600/50 transition-all">
            <span>依日期</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          <div className="w-px h-4 bg-neutral-300/60 dark:bg-neutral-600/60"></div>

          <button className="flex items-center space-x-1.5 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50/80 dark:hover:bg-neutral-600/50 transition-all">
            <span>依模型</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex pb-32">
        {/* 左侧参数面板 */}
        <div className="w-80 p-6 overflow-y-auto">
          {/* 预设选择区域 - 紧凑设计 */}
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center">
                <Sparkles className="h-4 w-4 mr-1.5 text-primary-500" />
                预设
              </h3>
              <div className="flex space-x-1 bg-neutral-100/80 dark:bg-neutral-700/50 rounded-lg p-0.5">
                <button
                  onClick={() => setActivePresetTab('style')}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                    activePresetTab === 'style'
                      ? 'bg-white dark:bg-neutral-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  风格
                </button>
                <button
                  onClick={() => setActivePresetTab('params')}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                    activePresetTab === 'params'
                      ? 'bg-white dark:bg-neutral-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  参数
                </button>
              </div>
            </div>

            {/* 风格预设 - 紧凑网格 */}
            {activePresetTab === 'style' && (
              <div className="grid grid-cols-3 gap-2">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyStylePreset(preset.id)}
                    className={`p-2.5 rounded-lg transition-all text-center hover:scale-105 ${
                      selectedStylePreset === preset.id
                        ? 'bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 border border-primary-300 dark:border-primary-600'
                        : 'bg-neutral-50/80 dark:bg-neutral-700/50 hover:bg-neutral-100/80 dark:hover:bg-neutral-700/80 border border-neutral-200/50 dark:border-neutral-600/50'
                    }`}
                  >
                    <div className="text-lg mb-1">{preset.icon}</div>
                    <div className="text-xs font-medium text-neutral-900 dark:text-white leading-tight">
                      {preset.name}
                    </div>
                  </button>
                ))}
                {selectedStylePreset && (
                  <button
                    onClick={clearStylePreset}
                    className="p-2.5 rounded-lg bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100/80 dark:hover:bg-red-900/30 border border-red-200/50 dark:border-red-700/50 text-center transition-all hover:scale-105"
                  >
                    <div className="text-lg mb-1">🗑️</div>
                    <div className="text-xs font-medium text-red-600 dark:text-red-400 leading-tight">
                      清除
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* 参数预设 - 紧凑布局 */}
            {activePresetTab === 'params' && (
              <div className="space-y-2">
                {PARAMETER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyParameterPreset(preset.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all hover:scale-[1.01] ${
                      selectedParameterPreset === preset.id
                        ? 'bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 border border-primary-300 dark:border-primary-600'
                        : 'bg-neutral-50/80 dark:bg-neutral-700/50 hover:bg-neutral-100/80 dark:hover:bg-neutral-700/80 border border-neutral-200/50 dark:border-neutral-600/50'
                    }`}
                  >
                    <div className="text-sm font-medium text-neutral-900 dark:text-white mb-0.5">
                      {preset.name}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      步数: {preset.params.inferenceSteps} • 强度: {preset.params.guidanceScale}
                    </div>
                  </button>
                ))}
                {selectedParameterPreset && (
                  <button
                    onClick={clearParameterPreset}
                    className="w-full p-3 rounded-lg bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100/80 dark:hover:bg-red-900/30 border border-red-200/50 dark:border-red-700/50 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-0.5">
                      清除参数预设
                    </div>
                    <div className="text-xs text-red-500 dark:text-red-400">
                      恢复默认参数设置
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>



          {/* 高级参数 - 可折叠 */}
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden">
            <button
              onClick={() => setShowAdvancedParams(!showAdvancedParams)}
              className="w-full px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50/80 dark:hover:bg-neutral-700/50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2 text-primary-500" />
                <span>高级参数</span>
              </div>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${showAdvancedParams ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdvancedParams && (
              <div className="px-6 pb-6 space-y-4 bg-gradient-to-b from-neutral-50/30 to-neutral-100/30 dark:from-neutral-800/30 dark:to-neutral-900/30">
                {/* 生成数量 */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    生成数量
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setNumImages(Math.max(1, numImages - 1))}
                      className="w-7 h-7 rounded-md bg-neutral-100/80 dark:bg-neutral-700/50 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 flex items-center justify-center transition-all text-sm"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium text-neutral-900 dark:text-white text-sm">
                      {numImages}
                    </span>
                    <button
                      onClick={() => setNumImages(Math.min(4, numImages + 1))}
                      className="w-7 h-7 rounded-md bg-neutral-100/80 dark:bg-neutral-700/50 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 flex items-center justify-center transition-all text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 随机种子 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    随机种子
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="留空随机生成"
                      className="flex-1 px-3 py-2 bg-white/80 dark:bg-neutral-700/50 border border-neutral-200/50 dark:border-neutral-600/50 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={() => setSeed(Math.floor(Math.random() * 1000000).toString())}
                      className="px-3 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all text-sm font-medium"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                {/* 推理步数 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      推理步数
                    </label>
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                      {inferenceSteps}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={inferenceSteps}
                    onChange={(e) => setInferenceSteps(parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    <span>快速 (10)</span>
                    <span>精细 (50)</span>
                  </div>
                </div>

                {/* 引导强度 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      引导强度
                    </label>
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                      {guidanceScale}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={guidanceScale}
                    onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    <span>自由 (1)</span>
                    <span>严格 (20)</span>
                  </div>
                </div>

                {/* 负面提示词 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    负面提示词
                  </label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="描述不想要的内容，如：模糊、低质量、变形..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white/80 dark:bg-neutral-700/50 border border-neutral-200/50 dark:border-neutral-600/50 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="flex-1 p-6">
          {/* 主预览区 - 条件显示 */}
          {(isGenerating || generatedImages.length > 0) && (
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-6">
              {isGenerating ? (
                <div className="text-center py-12">
                  <div className="w-32 h-32 mx-auto mb-6 relative">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-neutral-200 dark:text-neutral-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - generationProgress / 100)}`}
                        className="text-primary-500 transition-all duration-500 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-500">
                        {generationProgress}%
                      </span>
                    </div>
                  </div>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">
                    {generationStage || 'AI正在创作中...'}
                  </p>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto">
                  {/* 主图显示 */}
                  <div className="relative bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl overflow-hidden mb-6 shadow-xl">
                    <img
                      src={generatedImages[selectedImageIndex]}
                      alt="Generated image"
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />

                    {/* 悬浮操作按钮 */}
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button className="p-3 bg-white/95 dark:bg-neutral-800/95 hover:bg-white dark:hover:bg-neutral-800 rounded-xl shadow-lg transition-all hover:scale-110 backdrop-blur-sm">
                        <Download className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                      </button>
                      <button className="p-3 bg-white/95 dark:bg-neutral-800/95 hover:bg-white dark:hover:bg-neutral-800 rounded-xl shadow-lg transition-all hover:scale-110 backdrop-blur-sm">
                        <Heart className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                      </button>
                      <button className="p-3 bg-white/95 dark:bg-neutral-800/95 hover:bg-white dark:hover:bg-neutral-800 rounded-xl shadow-lg transition-all hover:scale-110 backdrop-blur-sm">
                        <Share2 className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                      </button>
                    </div>
                  </div>

                  {/* 多图选择 */}
                  {generatedImages.length > 1 && (
                    <div className="flex space-x-3 justify-center mb-6">
                      {generatedImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-20 h-20 rounded-xl overflow-hidden transition-all hover:scale-105 ${
                            selectedImageIndex === index
                              ? 'ring-4 ring-primary-500 shadow-lg'
                              : 'ring-2 ring-neutral-200 dark:ring-neutral-700 hover:ring-primary-300 dark:hover:ring-primary-400'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Generated ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 生成信息 */}
                  {generationTime && (
                    <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-900/50 rounded-xl p-4">
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="text-neutral-500 dark:text-neutral-400 mb-1">生成耗时</div>
                          <div className="font-bold text-primary-600 dark:text-primary-400">
                            {(generationTime / 1000).toFixed(1)}s
                          </div>
                        </div>
                        <div>
                          <div className="text-neutral-500 dark:text-neutral-400 mb-1">AI模型</div>
                          <div className="font-bold text-neutral-900 dark:text-white">
                            {selectedModel.name}
                          </div>
                        </div>
                        <div>
                          <div className="text-neutral-500 dark:text-neutral-400 mb-1">图片尺寸</div>
                          <div className="font-bold text-neutral-900 dark:text-white">
                            {selectedSize.width}×{selectedSize.height}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 底部输入区 - 主页样式 */}
      <div ref={containerRef} className="fixed bottom-6 left-20 right-6 z-40">
        {/* 收缩状态 - 简洁输入框 */}
        {!isExpanded && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 dark:bg-neutral-900/80 backdrop-blur-2xl border border-neutral-200/60 dark:border-neutral-700/40 rounded-2xl shadow-2xl shadow-black/5 dark:shadow-black/30">
              <div
                onClick={() => setIsExpanded(true)}
                className="flex items-center space-x-4 cursor-pointer group px-6 py-4"
              >
                {/* 图片上传区域 */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl border border-neutral-300 dark:border-neutral-600/40 flex items-center justify-center group-hover:border-primary-400/60 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-all">
                    <Upload className="h-4 w-4 text-neutral-600 dark:text-neutral-400 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors" />
                  </div>
                </div>

                {/* 输入框 */}
                <div className="flex-1">
                  <div className="bg-transparent px-2 py-1">
                    <span className="text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-300 transition-colors">
                      请描述您脑海中想像的影像
                    </span>
                  </div>
                </div>

                {/* 工具栏预览 */}
                <div className="flex items-center space-x-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center space-x-1">
                    <span>{selectedModel.icon}</span>
                    <span className="hidden sm:inline text-neutral-700 dark:text-neutral-300">{selectedModel.name}</span>
                  </div>
                  <div className="w-px h-4 bg-neutral-400 dark:bg-neutral-600"></div>
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">{selectedSize.name}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 展开状态 - 完整编辑器 */}
        {isExpanded && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white/95 dark:bg-neutral-900/85 backdrop-blur-2xl border border-neutral-200/80 dark:border-neutral-700/50 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 transform transition-all duration-300">
              {/* 一体化输入容器 */}
              <div className="p-4">
                {/* 顶部区域：图片上传 + 输入框 */}
                <div className="flex gap-4 mb-4">
                  {/* 图片上传框 - 内嵌在输入区域 */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/bmp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-300 dark:border-neutral-600/30 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-400/70 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group flex-shrink-0"
                  >
                    {uploadedImage ? (
                      <ImageIcon className="h-5 w-5 text-primary-400" />
                    ) : (
                      <Upload className="h-5 w-5 text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                    )}
                  </div>

                  {/* 输入框 */}
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="请描述您脑海中想像的影像"
                    rows={3}
                    className="flex-1 bg-transparent text-neutral-800 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 resize-none focus:outline-none"
                    autoFocus={isExpanded}
                  />
                </div>

                {/* 底部工具栏 - 无分割线 */}
                <div className="flex items-center justify-between">
                  {/* 左侧工具组 */}
                  <div className="flex items-center space-x-4">
                    {/* AI影像标签 */}
                    <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-sm">AI 影像</span>
                    </div>

                    {/* 模型选择 */}
                    <div className="relative" ref={modelDropdownRef}>
                      <button
                        onClick={() => {
                          setShowModelDropdown(!showModelDropdown);
                          setShowSizeDropdown(false); // 关闭其他下拉菜单
                        }}
                        className="flex items-center space-x-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
                      >
                        <span className="text-sm">{selectedModel.icon}</span>
                        <span className="text-sm">{selectedModel.name}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      {showModelDropdown && (
                        <div className="absolute bottom-full mb-2 left-0 w-48 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-neutral-200/70 dark:border-neutral-700/60 py-2 z-50">
                          {AI_MODELS.map((model) => (
                            <button
                              key={model.id}
                              onClick={() => {
                                setSelectedModel(model);
                                setShowModelDropdown(false);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition-colors text-left text-neutral-700 dark:text-neutral-200"
                            >
                              <span>{model.icon}</span>
                              <span className="text-sm">{model.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 尺寸选择 - 即梦风格 */}
                    <div className="relative" ref={sizeDropdownRef}>
                      <button
                        onClick={() => {
                          setShowSizeDropdown(!showSizeDropdown);
                          setShowModelDropdown(false); // 关闭其他下拉菜单
                        }}
                        className="flex items-center space-x-1 px-2 py-1 bg-white/80 dark:bg-neutral-800/40 rounded-lg text-neutral-700 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-white/90 dark:hover:bg-neutral-700/50 transition-all border border-neutral-300/60 dark:border-neutral-600/30"
                      >
                        <span className="text-sm">{selectedSize.name}</span>
                        <div className="w-px h-3 bg-neutral-400/60 dark:bg-neutral-600"></div>
                        <span className="text-xs text-neutral-400">{selectedSize.desc}</span>
                      </button>

                      {showSizeDropdown && (
                        <div className="absolute bottom-full mb-2 left-0 w-96 bg-white/98 dark:bg-black/90 backdrop-blur-3xl rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-700/40 p-6 z-50 animate-in slide-in-from-bottom-2 duration-200">
                          {/* 长宽比例标题 */}
                          <div className="text-sm text-neutral-700 dark:text-neutral-400 mb-4 font-medium">长宽比例</div>

                          {/* 比例选择网格 - 8列布局 */}
                          <div className="grid grid-cols-8 gap-3 mb-6">
                            {SIZE_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() => {
                                  setSelectedSize(preset);
                                }}
                                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                                  selectedSize.id === preset.id
                                    ? 'bg-primary-100 dark:bg-white/10 border border-primary-400 dark:border-white/20 text-primary-800 dark:text-white shadow-lg'
                                    : 'bg-neutral-100 dark:bg-neutral-800/30 border border-neutral-300 dark:border-neutral-700/30 text-neutral-700 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700/40 hover:text-neutral-800 dark:hover:text-neutral-300'
                                }`}
                              >
                                {/* 精确比例图标 */}
                                <div
                                  className={`rounded-sm border-2 mb-2 transition-colors ${
                                    selectedSize.id === preset.id
                                      ? 'border-primary-500 dark:border-white/60 bg-primary-50 dark:bg-white/5'
                                      : 'border-neutral-400 dark:border-neutral-500/60'
                                  }`}
                                  style={{
                                    width: '24px',
                                    height: `${24 * preset.height / preset.width}px`,
                                    maxHeight: '20px',
                                    minHeight: '8px'
                                  }}
                                ></div>
                                <span className="text-xs font-medium">{preset.name}</span>
                              </button>
                            ))}
                          </div>

                          {/* 解析度标题 */}
                          <div className="text-sm text-neutral-700 dark:text-neutral-400 mb-4 font-medium">解析度</div>

                          {/* 解析度选择 */}
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <button className="px-4 py-3 bg-primary-100 dark:bg-neutral-700/50 hover:bg-primary-200 dark:hover:bg-neutral-600/60 rounded-xl text-primary-800 dark:text-neutral-200 text-sm border border-primary-300 dark:border-neutral-600/40 transition-all duration-200 font-medium">
                              标准 (1K)
                            </button>
                            <button className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800/40 hover:bg-neutral-200 dark:hover:bg-neutral-700/50 rounded-xl text-neutral-700 dark:text-neutral-400 text-sm border border-neutral-300 dark:border-neutral-700/30 transition-all duration-200">
                              高 (2K)
                            </button>
                          </div>

                          {/* 大小标题 */}
                          <div className="text-sm text-neutral-700 dark:text-neutral-400 mb-3 font-medium">大小</div>

                          {/* 自定义尺寸输入 */}
                          <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl px-4 py-3 border border-neutral-300 dark:border-neutral-700/40 mb-6">
                            <div className="flex items-center space-x-2">
                              <span className="text-neutral-700 dark:text-neutral-400 text-sm font-medium">W</span>
                              <input
                                type="number"
                                value={selectedSize.width}
                                onChange={(e) => {
                                  const newWidth = parseInt(e.target.value) || selectedSize.width;
                                  setSelectedSize({
                                    ...selectedSize,
                                    width: newWidth
                                  });
                                }}
                                className="w-16 bg-transparent text-neutral-800 dark:text-white text-sm font-mono focus:outline-none focus:text-neutral-900 dark:focus:text-white"
                              />
                            </div>

                            <div className="text-neutral-500 dark:text-neutral-500">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M2 8h12M8 2v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-neutral-700 dark:text-neutral-400 text-sm font-medium">H</span>
                              <input
                                type="number"
                                value={selectedSize.height}
                                onChange={(e) => {
                                  const newHeight = parseInt(e.target.value) || selectedSize.height;
                                  setSelectedSize({
                                    ...selectedSize,
                                    height: newHeight
                                  });
                                }}
                                className="w-16 bg-transparent text-neutral-800 dark:text-white text-sm font-mono focus:outline-none focus:text-neutral-900 dark:focus:text-white"
                              />
                            </div>

                            <span className="text-neutral-700 dark:text-neutral-500 text-sm font-medium ml-auto">PX</span>
                          </div>

                          {/* 关闭按钮 */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => setShowSizeDropdown(false)}
                              className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                            >
                              完成
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 右侧工具组 */}
                  <div className="flex items-center space-x-3">
                    {/* 积分显示 */}
                    <div className="flex items-center space-x-1 text-neutral-400">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span className="text-sm">0</span>
                    </div>

                    {/* 收缩按钮 */}
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                      title="收缩 (Esc)"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {/* 发送按钮 */}
                    <button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-neutral-600 disabled:to-neutral-700 text-white rounded-full transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                      title={prompt.trim() ? "发送 (Cmd+Enter)" : "请输入描述"}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ArrowUp className="h-3 w-3" />
                      )}
                    </button>
                  </div>
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
            </div>
          </div>
        )}
      </div>

      {/* 历史记录模态框 */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowHistory(false)}
          ></div>
          <div className="relative w-full max-w-4xl max-h-[80vh] bg-white dark:bg-neutral-800 rounded-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                生成历史 ({history.length})
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-96 p-4">
              {history.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>暂无生成历史</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                              setShowHistory(false);
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

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
