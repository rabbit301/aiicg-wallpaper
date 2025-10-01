'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Wand2, ChevronDown, ArrowUp, Sparkles, Image as ImageIcon, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface BottomCreationPanelProps {
  className?: string;
}

// AI模型选项
const AI_MODELS = [
  { id: 'image-3.0', name: 'Image 3.0', icon: '🎯' },
  { id: 'flux-pro', name: 'Flux Pro', icon: '⚡' },
  { id: 'midjourney', name: 'Midjourney', icon: '🎨' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', icon: '🔮' }
];

// 尺寸预设
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

export default function BottomCreationPanel({ className = '' }: BottomCreationPanelProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 状态管理
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZE_PRESETS[1]); // 默认9:16
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);

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

  // 处理生成
  const handleGenerate = () => {
    if (prompt.trim()) {
      const params = new URLSearchParams({
        prompt: prompt.trim(),
        model: selectedModel.id,
        size: selectedSize.id
      });
      if (uploadedImage) {
        // 如果有上传图片，可以在这里处理图片参数
        console.log('上传的图片:', uploadedImage.name);
      }
      router.push(`/generate?${params.toString()}`);
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

  return (
    <div ref={containerRef} className={`fixed bottom-6 left-20 right-6 z-40 ${className}`}>
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
                        <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl px-4 py-3 border border-neutral-300 dark:border-neutral-700/40">
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
                      </div>
                    )}
                  </div>
                </div>

                {/* 右侧操作组 */}
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
                    disabled={!prompt.trim()}
                    className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-neutral-600 disabled:to-neutral-700 text-white rounded-full transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    title={prompt.trim() ? "发送 (Cmd+Enter)" : "请输入描述"}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
