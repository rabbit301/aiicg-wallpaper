'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Zap, Settings, Download, FileImage, Loader2, Monitor, Eye, X, Maximize2, Minimize2 } from 'lucide-react';
import { formatFileSize, formatCompressionRatio, formatProcessingTime } from '@/lib/compression-utils';
import type { CompressionPreset } from '@/lib/compression-utils';
import { generateCompressionEvaluation, generateStarRating, getScoreColorClass } from '@/lib/emotion-evaluator';
import type { EmotionEvaluation } from '@/lib/emotion-evaluator';

// 水冷冷头屏幕尺寸预设
const COOLING_SCREEN_PRESETS = {
  custom: { name: '自定义尺寸', width: 0, height: 0 },
  square_480: { name: '方形 480×480 (标准)', width: 480, height: 480 },
  square_640: { name: '方形 640×640 (高清)', width: 640, height: 640 },
  square_800: { name: '方形 800×800 (超清)', width: 800, height: 800 },
  landscape_640_480: { name: '横屏 640×480 (4:3)', width: 640, height: 480 },
  landscape_800_600: { name: '横屏 800×600 (4:3)', width: 800, height: 600 },
  landscape_854_480: { name: '横屏 854×480 (16:9)', width: 854, height: 480 },
  portrait_480_640: { name: '竖屏 480×640 (3:4)', width: 480, height: 640 },
  portrait_600_800: { name: '竖屏 600×800 (3:4)', width: 600, height: 800 },
  round_480: { name: '圆形 480×480 (圆屏适配)', width: 480, height: 480 },
  round_640: { name: '圆形 640×640 (圆屏适配)', width: 640, height: 640 },
} as const;

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  outputUrl: string;
  format: string;
  width: number;
  height: number;
  processingTime: number;
  version: 'free' | 'ai';
  preset: string;
}

export default function CompressionPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [version, setVersion] = useState<'free' | 'ai'>('free');
  const [preset, setPreset] = useState<CompressionPreset>('balanced');
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customOptions, setCustomOptions] = useState({
    quality: 85,
    width: '',
    height: '',
    format: 'webp',
  });
  const [coolingPreset, setCoolingPreset] = useState<string>('custom');
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<'original' | 'compressed'>('compressed');
  const [evaluation, setEvaluation] = useState<EmotionEvaluation | null>(null);
  const [largePreview, setLargePreview] = useState(true);
  const [imageLoadError, setImageLoadError] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 检查AI压缩服务可用性
  useEffect(() => {
    const checkAIAvailability = async () => {
      try {
        const response = await fetch('/api/compress?version=ai');
        const data = await response.json();
        setAiAvailable(data.isAIAvailable || false);
      } catch (error) {
        setAiAvailable(false);
      }
    };

    checkAIAvailability();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleCoolingPresetChange = (presetKey: string) => {
    setCoolingPreset(presetKey);
    if (presetKey !== 'custom') {
      const preset = COOLING_SCREEN_PRESETS[presetKey as keyof typeof COOLING_SCREEN_PRESETS];
      setCustomOptions(prev => ({
        ...prev,
        width: preset.width.toString(),
        height: preset.height.toString(),
        // 圆形屏幕自动设置PNG格式以支持透明度
        format: presetKey.includes('round') ? 'png' : prev.format,
      }));
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      setError('请选择要压缩的图片文件');
      return;
    }

    setIsCompressing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('version', version);
      formData.append('preset', preset);

      // 构建压缩选项
      const options: any = {
        quality: customOptions.quality,
        format: customOptions.format,
      };

      // 添加尺寸设置
      if (coolingPreset !== 'custom') {
        const presetConfig = COOLING_SCREEN_PRESETS[coolingPreset as keyof typeof COOLING_SCREEN_PRESETS];
        options.width = presetConfig.width;
        options.height = presetConfig.height;
        options.preserveAspectRatio = false; // 水冷屏幕需要精确尺寸
      } else if (customOptions.width || customOptions.height) {
        if (customOptions.width) options.width = parseInt(customOptions.width);
        if (customOptions.height) options.height = parseInt(customOptions.height);
      }

      // 圆形屏幕特殊处理
      if (coolingPreset.includes('round')) {
        options.smartCrop = true; // AI版启用智能裁剪
        options.cropToCircle = true; // 标记为圆形裁剪
      }

      formData.append('options', JSON.stringify(options));

      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        console.log('压缩成功，结果:', data.result);
        console.log('输出URL:', data.result.outputUrl);
        setResult(data.result);
        // 只有外部URL才需要加载状态
        setPreviewLoading(data.result.outputUrl.startsWith('http'));
        setImageLoadError(false); // 重置错误状态

        // 生成情绪评价
        const emotionEval = generateCompressionEvaluation(
          data.result.compressionRatio,
          data.result.originalSize,
          data.result.compressedSize,
          data.result.processingTime,
          data.result.version
        );
        setEvaluation(emotionEval);
      } else {
        // 如果AI版失败且是配置问题，自动切换到免费版重试
        if (version === 'ai' && data.error?.includes('AI压缩服务暂时不可用')) {
          setError(`${data.error}，正在自动切换到免费版重试...`);
          setVersion('free');

          // 延迟重试免费版
          setTimeout(() => {
            setError(null);
            handleCompress();
          }, 1000);
        } else {
          setError(data.error || '压缩失败');
        }
      }
    } catch (error) {
      console.error('压缩失败:', error);
      setError('压缩失败，请稍后重试');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = async () => {
    if (result?.outputUrl) {
      try {
        const filename = `compressed_${selectedFile?.name || 'image'}.${result.format}`;

        // 对于外部URL（如Cloudinary），使用下载代理
        if (result.outputUrl.startsWith('http')) {
          const response = await fetch('/api/download-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: result.outputUrl,
              filename: filename,
            }),
          });

          if (!response.ok) {
            throw new Error('下载失败');
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // 清理临时URL
          window.URL.revokeObjectURL(url);
        } else {
          // 本地文件直接下载
          const link = document.createElement('a');
          link.href = result.outputUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error('下载失败:', error);
        setError('下载失败，请稍后重试');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          智能图片压缩
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          选择免费版或AI版，获得最佳压缩效果
        </p>
      </div>

      {/* 版本选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          选择压缩版本
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setVersion('free')}
            className={`p-4 rounded-lg border-2 transition-all ${
              version === 'free'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <FileImage className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="font-medium text-gray-800 dark:text-white">免费版</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">基础压缩功能</div>
          </button>
          
          <button
            onClick={() => setVersion('ai')}
            disabled={aiAvailable === false}
            className={`p-4 rounded-lg border-2 transition-all ${
              version === 'ai'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : aiAvailable === false
                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <Zap className={`h-6 w-6 mx-auto mb-2 ${aiAvailable === false ? 'text-gray-400' : 'text-purple-600'}`} />
            <div className={`font-medium ${aiAvailable === false ? 'text-gray-400' : 'text-gray-800 dark:text-white'}`}>
              AI版 {aiAvailable === null ? '(检查中...)' : aiAvailable === false ? '(不可用)' : ''}
            </div>
            <div className={`text-sm ${aiAvailable === false ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {aiAvailable === false ? 'API未配置' : '智能优化 (付费)'}
            </div>
          </button>
        </div>
      </div>

      {/* 预设选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          压缩预设
        </label>
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value as CompressionPreset)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="high_quality">高质量 (95% 质量)</option>
          <option value="balanced">平衡 (85% 质量，推荐)</option>
          <option value="high_compression">高压缩 (70% 质量)</option>
          <option value="water_cooling_360">360水冷优化</option>
          <option value="animation_optimized">动画优化</option>
        </select>
      </div>

      {/* 水冷屏幕尺寸选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Monitor className="inline h-4 w-4 mr-1" />
          水冷冷头屏幕尺寸
        </label>
        <select
          value={coolingPreset}
          onChange={(e) => handleCoolingPresetChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {Object.entries(COOLING_SCREEN_PRESETS).map(([key, preset]) => (
            <option key={key} value={key}>
              {preset.name}
            </option>
          ))}
        </select>
        {coolingPreset !== 'custom' && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            输出尺寸：{COOLING_SCREEN_PRESETS[coolingPreset as keyof typeof COOLING_SCREEN_PRESETS].width} × {COOLING_SCREEN_PRESETS[coolingPreset as keyof typeof COOLING_SCREEN_PRESETS].height} 像素
            {coolingPreset.includes('round') && ' (圆形屏幕优化)'}
          </p>
        )}
      </div>

      {/* 高级选项 */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-purple-600 hover:text-purple-700"
        >
          <Settings className="h-4 w-4 mr-1" />
          高级选项
        </button>
        
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  质量 (1-100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customOptions.quality}
                  onChange={(e) => setCustomOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  输出格式
                </label>
                <select
                  value={customOptions.format}
                  onChange={(e) => setCustomOptions(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="webp">WebP</option>
                  <option value="jpg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="avif">AVIF</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  宽度 (像素)
                </label>
                <input
                  type="number"
                  placeholder="自动"
                  value={customOptions.width}
                  onChange={(e) => {
                    setCustomOptions(prev => ({ ...prev, width: e.target.value }));
                    if (e.target.value) setCoolingPreset('custom');
                  }}
                  disabled={coolingPreset !== 'custom'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  高度 (像素)
                </label>
                <input
                  type="number"
                  placeholder="自动"
                  value={customOptions.height}
                  onChange={(e) => {
                    setCustomOptions(prev => ({ ...prev, height: e.target.value }));
                    if (e.target.value) setCoolingPreset('custom');
                  }}
                  disabled={coolingPreset !== 'custom'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {coolingPreset !== 'custom' && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  已选择水冷屏幕预设，尺寸将自动设置为 {COOLING_SCREEN_PRESETS[coolingPreset as keyof typeof COOLING_SCREEN_PRESETS].width} × {COOLING_SCREEN_PRESETS[coolingPreset as keyof typeof COOLING_SCREEN_PRESETS].height} 像素
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 文件上传 */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          {selectedFile ? (
            <div>
              <p className="text-lg font-medium text-gray-800 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                点击选择图片文件
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                支持 PNG、JPEG、WebP、GIF 等格式
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 压缩按钮 */}
      <button
        onClick={handleCompress}
        disabled={!selectedFile || isCompressing}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {isCompressing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>压缩中...</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            <span>开始压缩</span>
          </>
        )}
      </button>

      {/* 错误信息 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 压缩结果 */}
      {result && (
        <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              压缩完成！
            </h3>
            {evaluation && (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-green-300 dark:border-green-600">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-2xl">{evaluation.emoji}</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {evaluation.emotion}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className={`text-lg font-semibold ${getScoreColorClass(evaluation.score)}`}>
                    {evaluation.score}/10
                  </span>
                  <span className="text-lg">
                    {generateStarRating(evaluation.score)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  "{evaluation.comment}"
                </p>
              </div>
            )}
          </div>

          {/* 预览对比 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-white">压缩效果预览</h4>
              <button
                onClick={() => setLargePreview(!largePreview)}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {largePreview ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span>{largePreview ? '小预览' : '大预览'}</span>
              </button>
            </div>
            <div className={`grid gap-6 ${largePreview ? 'grid-cols-1 2xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
              {/* 原图预览 */}
              <div className="text-center">
                <div
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-blue-400 transition-colors relative group"
                  onClick={() => {
                    setPreviewImage('original');
                    setShowFullPreview(true);
                  }}
                >
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : ''}
                    alt="原始图片"
                    className={`max-w-full h-auto mx-auto rounded ${largePreview ? 'max-h-96' : 'max-h-48'}`}
                    style={{ objectFit: 'contain' }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="font-medium text-gray-800 dark:text-white">原始图片</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatFileSize(result.originalSize)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    点击放大查看
                  </div>
                </div>
              </div>

              {/* 压缩后预览 */}
              <div className="text-center">
                <div
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 relative cursor-pointer hover:border-green-400 transition-colors group"
                  onClick={() => {
                    setPreviewImage('compressed');
                    setShowFullPreview(true);
                  }}
                  style={{ minHeight: largePreview ? '400px' : '200px' }}
                >
                  {previewLoading && result.outputUrl.startsWith('http') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-600 rounded z-10">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">加载中...</span>
                    </div>
                  )}
                  <img
                    src={result.outputUrl}
                    alt="压缩后图片"
                    className={`w-full h-auto mx-auto rounded ${largePreview ? 'max-h-96' : 'max-h-48'}`}
                    style={{
                      objectFit: 'contain',
                      display: 'block',
                      backgroundColor: 'transparent'
                    }}
                    onLoad={() => {
                      console.log('压缩图片加载成功:', result.outputUrl);
                      setPreviewLoading(false);
                    }}
                    onError={(e) => {
                      console.error('压缩图片加载失败:', result.outputUrl);
                      setPreviewLoading(false);
                      // 显示错误占位图
                      const img = e.target as HTMLImageElement;
                      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="font-medium text-gray-800 dark:text-white">压缩后图片</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatFileSize(result.compressedSize)} • {result.width}×{result.height}
                  </div>
                  {result.version === 'ai' && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      AI智能压缩
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    点击放大查看
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 压缩统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCompressionRatio(result.compressionRatio)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">压缩率</div>
            </div>

            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {formatFileSize(result.originalSize - result.compressedSize)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">节省空间</div>
            </div>

            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {result.format.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">输出格式</div>
            </div>

            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-semibold text-gray-800 dark:text-white">
                {formatProcessingTime(result.processingTime)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">处理时间</div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>下载压缩后的图片</span>
            </button>

            <button
              onClick={() => {
                setResult(null);
                setSelectedFile(null);
                setError(null);
                setEvaluation(null);
                setPreviewLoading(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>压缩新图片</span>
            </button>
          </div>
        </div>
      )}

      {/* 放大预览模态框 */}
      {showFullPreview && result && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={() => setPreviewImage('original')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    previewImage === 'original'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  原始图片
                </button>
                <button
                  onClick={() => setPreviewImage('compressed')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    previewImage === 'compressed'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  压缩后图片
                </button>
              </div>
              <button
                onClick={() => setShowFullPreview(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <img
                src={previewImage === 'original'
                  ? (selectedFile ? URL.createObjectURL(selectedFile) : '')
                  : (result.outputUrl.startsWith('http')
                      ? `/api/image-proxy?url=${encodeURIComponent(result.outputUrl)}`
                      : result.outputUrl)
                }
                alt={previewImage === 'original' ? '原始图片' : '压缩后图片'}
                className="max-w-full h-auto mx-auto rounded-lg"
                style={{ maxHeight: '70vh' }}
              />
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {previewImage === 'original'
                  ? `原始图片 - ${formatFileSize(result.originalSize)}`
                  : `压缩后图片 - ${formatFileSize(result.compressedSize)} • ${result.width}×${result.height}`
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
