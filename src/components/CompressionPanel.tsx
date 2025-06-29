/**
 * 图片压缩面板组件
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Zap, Settings, Download, FileImage, Loader2, Monitor, Eye, X } from 'lucide-react';
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
  fallbackUsed?: boolean;
  fallbackReason?: string;
}

export default function CompressionPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<'original' | 'compressed'>('compressed');
  const [evaluation, setEvaluation] = useState<EmotionEvaluation | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      formData.append('preset', preset);
      formData.append('quality', customOptions.quality.toString());
      formData.append('format', customOptions.format);

      // 添加尺寸设置
      if (coolingPreset !== 'custom') {
        const presetConfig = COOLING_SCREEN_PRESETS[coolingPreset as keyof typeof COOLING_SCREEN_PRESETS];
        formData.append('width', presetConfig.width.toString());
        formData.append('height', presetConfig.height.toString());
        console.log('应用水冷预设:', presetConfig.name, presetConfig.width, 'x', presetConfig.height);
      } else if (customOptions.width || customOptions.height) {
        if (customOptions.width) formData.append('width', customOptions.width);
        if (customOptions.height) formData.append('height', customOptions.height);
      }

      // 特殊选项
      if (coolingPreset.includes('round')) {
        formData.append('cropToCircle', 'true');
        console.log('启用圆形裁剪');
      }

      console.log('发送压缩请求，参数:', {
        preset,
        quality: customOptions.quality,
        format: customOptions.format,
        width: coolingPreset !== 'custom' ? COOLING_SCREEN_PRESETS[coolingPreset as keyof typeof COOLING_SCREEN_PRESETS].width : customOptions.width,
        height: coolingPreset !== 'custom' ? COOLING_SCREEN_PRESETS[coolingPreset as keyof typeof COOLING_SCREEN_PRESETS].height : customOptions.height,
        cropToCircle: coolingPreset.includes('round')
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时

      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.error || `请求失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('API响应数据:', data);

      if (data.success !== false && data.outputUrl) {
        console.log('压缩成功，结果:', data);
        console.log('输出URL:', data.outputUrl);
        setResult(data);
        // 生成情绪评价
        const emotionEval = generateCompressionEvaluation(
          data.compressionRatio,
          data.originalSize,
          data.compressedSize,
          data.processingTime,
          'free' // 使用普通压缩评价标准
        );
        setEvaluation(emotionEval);
      } else {
        setError(data.error || '压缩失败');
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
          基于先进算法的高效压缩，优化文件大小同时保持图片质量
        </p>
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

      {/* 处理中状态提示 */}
      {isCompressing && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="text-blue-800 dark:text-blue-200 font-medium">图片压缩处理中...</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                正在使用高效算法进行压缩，预计需要5-15秒
              </p>
            </div>
          </div>
        </div>
      )}

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
            
            {/* 回退提示信息 */}
            {result.fallbackUsed && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <span className="font-medium">提示：</span> {result.fallbackReason}
                </p>
              </div>
            )}
            
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

          {/* 压缩效果对比 */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-800 dark:text-white mb-4 text-center">
              压缩效果对比
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 原始图片 */}
              <div className="text-center">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    原始图片
                  </h5>
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 overflow-hidden">
                    {selectedFile ? (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="原始图片"
                        className="w-full h-auto max-h-80 object-contain rounded-lg mx-auto"
                        style={{ minHeight: '120px' }}
                      />
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500 py-16">
                        <FileImage className="h-12 w-12 mx-auto mb-2" />
                        <span className="text-sm">原始图片</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                      {formatFileSize(result.originalSize)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      原始大小
                    </div>
                  </div>
                </div>
              </div>

              {/* 压缩后图片 */}
              <div className="text-center">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    压缩后图片
                  </h5>
                  <div className="relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 overflow-hidden">
                    <img
                      src={result.outputUrl}
                      alt="压缩后图片"
                      className="w-full h-auto max-h-80 object-fill rounded-lg mx-auto"
                      style={{ minHeight: '120px' }}
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                      {formatFileSize(result.compressedSize)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {result.width} × {result.height} • {result.format.toUpperCase()}
                    </div>
                    {selectedFile && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        尺寸变化: {selectedFile.name ? '原图' : '原始'} → 压缩后
                      </div>
                    )}
                    <div className="text-xs font-medium text-green-600 dark:text-green-400">
                      节省 {formatCompressionRatio(result.compressionRatio)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 一键放大查看按钮 */}
            <div className="text-center mt-4">
              <button
                onClick={() => setShowFullPreview(true)}
                className="inline-flex items-center px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                放大查看详细对比
              </button>
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
                  : result.outputUrl
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
