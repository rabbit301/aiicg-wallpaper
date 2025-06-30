'use client';

import { useState, useRef } from 'react';
import { Upload, Check, Loader2, Sparkles, Palette, Edit3, X } from 'lucide-react';
import { AVATAR_PRESETS } from '@/lib/avatar-generator';

interface AvatarSelectorProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  onUpload?: (file: File) => Promise<string>;
}

export default function AvatarSelector({ currentAvatar, onAvatarChange, onUpload }: AvatarSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingPreset, setGeneratingPreset] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'anime' | 'realistic' | 'cartoon'>('anime');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetGenerate = async (presetId: string) => {
    setGenerating(true);
    setGeneratingPreset(presetId);

    try {
      const response = await fetch('/api/avatar/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          presetId, 
          style: selectedStyle 
        })
      });

      const data = await response.json();

      if (data.success) {
        setSelectedPreset(data.avatarUrl);
        onAvatarChange(data.avatarUrl);
        setIsEditing(false); // 生成成功后自动收起
      } else {
        console.error('AI头像生成失败:', data.error);
      }
    } catch (error) {
      console.error('AI头像生成失败:', error);
    } finally {
      setGenerating(false);
      setGeneratingPreset(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    setUploading(true);
    try {
      const avatarUrl = await onUpload(file);
      setSelectedPreset(avatarUrl);
      onAvatarChange(avatarUrl);
      setIsEditing(false); // 上传成功后自动收起
    } catch (error) {
      console.error('头像上传失败:', error);
    } finally {
      setUploading(false);
    }
  };

  // 紧凑模式 - 只显示更改头像按钮
  if (!isEditing) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200"
        >
          <Edit3 className="h-4 w-4" />
          <span>更改头像</span>
        </button>
      </div>
    );
  }

  // 编辑模式 - 显示所有选择选项
  return (
    <div className="space-y-6 border border-neutral-200 dark:border-neutral-600 rounded-lg p-4">
      {/* 头部 - 关闭按钮 */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          选择头像
        </h4>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 样式选择 */}
      <div>
        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
          选择生成样式
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'anime', label: '动漫风格', icon: '🎨' },
            { value: 'realistic', label: '写实风格', icon: '📸' },
            { value: 'cartoon', label: '卡通风格', icon: '🎭' }
          ].map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setSelectedStyle(style.value as any)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedStyle === style.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-600 hover:border-primary-300'
              }`}
            >
              <div className="text-2xl mb-1">{style.icon}</div>
              <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {style.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI生成头像预设 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            AI生成头像预设
          </h4>
          <div className="flex items-center space-x-1 text-xs text-primary-600 dark:text-primary-400">
            <Sparkles className="h-3 w-3" />
            <span>点击生成</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {AVATAR_PRESETS.map((preset, index) => {
            const isGenerating = generating && generatingPreset === preset.id;
            const isSelected = selectedPreset?.includes('fal.media') && generatingPreset === preset.id; // 简单检测是否为AI生成的图片
            
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetGenerate(preset.id)}
                disabled={generating}
                className={`relative group overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                    : 'border-neutral-200 dark:border-neutral-600 hover:border-primary-300'
                } disabled:opacity-50`}
              >
                {/* 预设图片占位符 */}
                <div 
                  className="w-full aspect-square flex items-center justify-center text-white text-xs font-bold relative"
                  style={{
                    background: `linear-gradient(135deg, 
                      hsl(${(index * 30) % 360}, 70%, 60%), 
                      hsl(${(index * 30 + 60) % 360}, 70%, 70%))`
                  }}
                >
                  {isGenerating ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-lg mb-1">
                        {preset.name.charAt(0)}
                      </div>
                      {/* 悬停时显示AI图标 */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary-300" />
                      </div>
                    </>
                  )}
                </div>
                
                {/* 选中标识 */}
                {isSelected && (
                  <div className="absolute top-1 right-1">
                    <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
                
                {/* 预设名称 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <div className="text-xs text-white font-medium text-center">
                    {preset.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        {generating && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">正在生成AI头像，请稍候...</span>
            </div>
          </div>
        )}
      </div>

      {/* 分割线 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
            或
          </span>
        </div>
      </div>

      {/* 自定义上传 */}
      {onUpload && (
        <div>
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            上传自定义头像
          </h4>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-4 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 transition-colors duration-200 disabled:opacity-50"
          >
            <div className="flex items-center justify-center space-x-2 text-neutral-600 dark:text-neutral-400">
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>上传中...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>点击上传图片</span>
                </>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              支持 JPG、PNG、WebP 格式，最大 5MB
            </p>
          </button>
        </div>
      )}

      {/* 提示信息 */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-start space-x-2">
          <Palette className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <p className="font-medium">AI头像生成提示：</p>
            <p className="text-xs mt-1">
              • 选择喜欢的预设特征，点击即可生成专属AI头像<br/>
              • 不同样式风格会影响最终效果<br/>
              • 生成过程需要15-30秒，请耐心等待
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 