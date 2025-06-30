'use client';

import { useState } from 'react';
import { Wand2, Loader2, Monitor, Smartphone, Monitor as Desktop, Tablet, Plus, Sparkles, Palette } from 'lucide-react';
import { SCREEN_PRESETS, ScreenPreset } from '@/lib/fal-client';
import { generateWallpaperEvaluation, generateStarRating, getScoreColorClass } from '@/lib/emotion-evaluator';
import type { EmotionEvaluation } from '@/lib/emotion-evaluator';

// 预设提示词数据库
const PROMPT_PRESETS = {
  nature: {
    name: '自然风光',
    icon: '🌿',
    prompts: [
      '金色黄昏时分的壮丽山景，薄雾缭绕的山谷，戏剧性光影，超现实8K分辨率',
      '樱花花瓣飘落的宁静日式庭院，柔和粉色光线，空灵氛围，超细节8K画质',
      '雄伟瀑布从茂密雨林中倾泻而下，翡翠绿植被，戏剧性自然光线',
      '北极光在雪峰上空舞动，绚烂极光色彩，8K超高清摄影质量',
      '薰衣草田在夕阳下的紫色海洋，温暖金色光线，浪漫唯美画面',
      '古老红木森林中的神秘小径，阳光透过树冠，奇幻森林氛围'
    ]
  },
  abstract: {
    name: '抽象艺术',
    icon: '🎨',
    prompts: [
      '流动的液体金属纹理，彩虹色反射，抽象3D艺术，8K超清质量',
      '几何形状的梦幻组合，渐变色彩，现代抽象设计，完美对称',
      '粒子爆炸的能量波纹，霓虹色彩，动态抽象艺术，科幻风格',
      '水彩颜料在水中扩散，有机流动形态，艺术家级水彩画',
      '镜面反射的无限空间，光线折射，超现实主义艺术风格',
      '电子音乐可视化效果，频谱波形，数字艺术，赛博朋克美学'
    ]
  },
  anime: {
    name: '二次元',
    icon: '🎌',
    prompts: [
      '银发飘逸的美丽动漫少女，详细眼睛和长睫毛，传统和服，樱花背景',
      '神秘而美丽的女剑士，手持传世宝剑，英雄姿态，日式浮世绘风格',
      '赛博朋克风格的未来少女，霓虹灯街道，全息显示屏，科幻动漫',
      '魔法少女变身场景，魔法光效环绕，星空背景，梦幻动漫风格',
      '温柔可爱的猫耳少女，粉色双马尾，清新可爱，萌系动漫风格',
      '古风仙女在云端飞舞，飘逸长发，仙气缭绕，中国古典美学'
    ]
  },
  gaming: {
    name: '游戏风格',
    icon: '🎮',
    prompts: [
      '闪闪发光的史诗级幻想骑士，传奇宝剑，英雄战斗姿态，魔兽风格',
      '霓虹小巷中的赛博朋克黑客，未来科技界面，全息显示，雨夜街道',
      '强化盔甲的太空陆战队，外星战场，等离子武器，光环游戏风格',
      '蒸汽朋克飞艇船长，黄铜机械装置，维多利亚时代美学，云层背景',
      '末日废土幸存者，破旧装备，荒凉废土，戏剧性日落，辐射风格',
      '中世纪城堡攻城战，史诗战斗场面，投石机和战士，戏剧性天空'
    ]
  },
  minimal: {
    name: '极简风格',
    icon: '⚪',
    prompts: [
      '极简几何构图，干净线条和形状，柔和渐变背景，完美对称',
      '单一浮动球体在渐变背景上，完美照明，微妙阴影，陶瓷材质',
      '抽象山峰轮廓，单色调色板，渐变天空，极简风景设计',
      '禅意花园中的单块石头，完美沙纹，极简元素，冥想氛围',
      '悬浮几何水晶，干净工作室照明，单色配色，当代雕塑',
      '地平线上的孤独大树，极简风景，柔和色彩渐变，艺术摄影'
    ]
  },
  urban: {
    name: '都市生活',
    icon: '🏙️',
    prompts: [
      '银翼杀手风格的城市景观，霓虹灯在湿润街道上反射，赛博朋克',
      '现代城市黄昏时分的屋顶视角，玻璃摩天大楼，温暖夕阳光线',
      '温馨咖啡店内景，温暖环境光线，杯中蒸汽，窗外散焦灯光',
      '夜晚空旷的地铁站台，戏剧性人工照明，都市孤独感，电影风格',
      '色彩斑斓壁画的街头艺术小巷，都市文化，戏剧性照明效果',
      '从上往下俯视的繁忙十字路口，车流光轨，都市活力，航拍视角'
    ]
  }
};

// 独立提示词选项
const INDIVIDUAL_PROMPTS = {
  lighting: {
    name: '光影效果',
    icon: '💡',
    prompts: [
      '电影级戏剧性照明',
      '柔和自然光线',
      '霓虹灯光效果',
      '黄金时刻光线',
      '体积光雾效果',
      '背光轮廓光'
    ]
  },
  mood: {
    name: '氛围情绪',
    icon: '🎭',
    prompts: [
      '神秘梦幻氛围',
      '温馨舒适感觉',
      '史诗磅礴气势',
      '宁静禅意境界',
      '活力动感节奏',
      '忧郁诗意情调'
    ]
  },
  style: {
    name: '艺术风格',
    icon: '🖼️',
    prompts: [
      '超现实主义',
      '印象派画风',
      '赛博朋克风格',
      '蒸汽朋克美学',
      '日式浮世绘',
      '现代简约风'
    ]
  },
  quality: {
    name: '画质增强',
    icon: '⭐',
    prompts: [
      '8K超高清画质',
      '电影级渲染质量',
      '超细节纹理',
      '专业摄影水准',
      '艺术大师级作品',
      '博物馆展览品质'
    ]
  }
};

export default function WallpaperGenerator() {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [preset, setPreset] = useState<ScreenPreset>('desktop_fhd');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [wallpaperEvaluation, setWallpaperEvaluation] = useState<EmotionEvaluation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('nature');
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [lastUsedPrompt, setLastUsedPrompt] = useState<string>('');
  const [translationInfo, setTranslationInfo] = useState<{
    originalPrompt: string;
    translatedPrompt: string;
    enhancedPrompt: string;
    hasTranslation: boolean;
  } | null>(null);
  const [timingInfo, setTimingInfo] = useState<{
    translationTime: number;
    aiGenerationTime: number;
    totalTime: number;
  } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      console.warn('❌ 提示词为空');
      return;
    }

    console.log('🎨 开始生成壁纸...');
    console.log('📝 提示词:', prompt.trim());
    console.log('📐 预设:', preset);
    console.log('🏷️ 标题:', title.trim());

    setIsGenerating(true);
    setGeneratedImage(null);
    setWallpaperEvaluation(null);
    setLastUsedPrompt('');
    setTranslationInfo(null);
    setTimingInfo(null);

    const startTime = Date.now();

    try {
      const requestBody = {
        prompt: prompt.trim(),
        title: title.trim(),
        preset,
      };
      
      console.log('📤 发送请求体:', requestBody);

      // 创建一个AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 120000); // 120秒超时

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal, // 添加超时信号
      });

      // 清除超时定时器
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const processingTime = Date.now() - startTime;
        console.log('✅ 生成成功!');
        console.log('  🖼️ 图片URL:', result.wallpaper.imageUrl);
        console.log('  ⏱️ 处理时间:', processingTime + 'ms');
        
        setGeneratedImage(result.wallpaper.imageUrl);
        setLastUsedPrompt(prompt.trim());

        // 生成情绪评价
        const evaluation = generateWallpaperEvaluation(
          prompt,
          result.timing?.aiGenerationTime || processingTime, // 使用AI生成时间而非总时间
          { width: result.wallpaper.width, height: result.wallpaper.height }
        );
        setWallpaperEvaluation(evaluation);

        // 保存翻译信息
        if (result.translationInfo) {
          setTranslationInfo(result.translationInfo);
          console.log('🌏 翻译信息:', result.translationInfo);
        }
        
        // 保存时间统计信息
        if (result.timing) {
          setTimingInfo(result.timing);
          console.log('⏱️ 详细时间统计:');
          console.log(`  🌏 翻译耗时: ${result.timing.translationTime}ms`);
          console.log(`  🤖 AI生成耗时: ${result.timing.aiGenerationTime}ms`);
          console.log(`  📊 总耗时: ${result.timing.totalTime}ms`);
        }

        // 清空表单
        setPrompt('');
        setTitle('');
      } else {
        console.log('❌ 生成失败:', result.error);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏰ 请求超时:', error);
      } else {
        console.error('❌ 生成壁纸失败:', error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const addPromptToInput = (promptText: string) => {
    setPrompt(prev => {
      const newPrompt = prev.trim() ? prev + ', ' + promptText : promptText;
      console.log('✨ 添加预设提示词:', promptText);
      console.log('📝 当前完整提示词:', newPrompt);
      return newPrompt;
    });
    
    // 显示成功提示
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2000);
    
    // 添加视觉反馈
    const button = document.activeElement as HTMLButtonElement;
    if (button) {
      button.style.transform = 'scale(0.95)';
      button.style.backgroundColor = '#10b981';
      button.style.color = 'white';
      setTimeout(() => {
        button.style.transform = '';
        button.style.backgroundColor = '';
        button.style.color = '';
      }, 200);
    }
  };

  const getPresetsByCategory = (category: string) => {
    return Object.entries(SCREEN_PRESETS).filter(([_, config]) => config.category === category);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      '360_screen': Monitor,
      'mobile': Smartphone,
      'desktop': Desktop,
      'tablet': Tablet
    };
    return icons[category] || Monitor;
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      '360_screen': '360水冷屏',
      'mobile': '手机壁纸',
      'desktop': '桌面壁纸',
      'tablet': '平板壁纸'
    };
    return names[category] || category;
  };

  return (
    <div className="relative">
      {/* 成功添加提示词的Toast */}
      {showAddedToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <span className="text-sm">✅ 提示词已添加！</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 预设提示词面板 */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
              预设提示词
            </h3>
            
            {/* 分类标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(PROMPT_PRESETS).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === key
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>

            {/* 提示词列表 */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {PROMPT_PRESETS[selectedCategory as keyof typeof PROMPT_PRESETS]?.prompts.map((promptText, index) => (
                <button
                  key={index}
                  onClick={() => addPromptToInput(promptText)}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
                      {promptText}
                    </p>
                    <Plus className="h-4 w-4 text-gray-400 group-hover:text-purple-500 ml-2 mt-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 独立提示词选项 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Palette className="h-5 w-5 mr-2 text-orange-500" />
              独立提示词
            </h3>
            
            <div className="space-y-4">
              {Object.entries(INDIVIDUAL_PROMPTS).map(([key, category]) => (
                <div key={key} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">{category.icon}</span>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                      {category.name}
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {category.prompts.map((promptText, index) => (
                      <button
                        key={index}
                        onClick={() => addPromptToInput(promptText)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 group"
                      >
                        <span className="flex items-center">
                          {promptText}
                          <Plus className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 主生成器面板 */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                AI壁纸生成器
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                选择预设或自定义描述，AI为您生成专属壁纸
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
              {/* 标题输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  壁纸标题 (可选)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="为您的壁纸起个名字..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* 提示词输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  生图提示词 * <span className="text-blue-600">支持中文，自动翻译为英文</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述您想要的壁纸，支持中文输入..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center space-x-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      点击左侧预设可快速添加提示词
                    </p>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {prompt.trim().length} 字符
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt('');
                      console.log('🗑️ 清空提示词');
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    清空
                  </button>
                </div>
                {prompt.trim() && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">当前提示词预览：</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 break-words">
                      {prompt.trim()}
                    </p>
                  </div>
                )}
              </div>

              {/* 尺寸预设选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  壁纸尺寸预设
                </label>
                
                {/* 按分类展示预设 */}
                <div className="space-y-4">
                  {['360_screen', 'desktop', 'mobile', 'tablet'].map(category => {
                    const presets = getPresetsByCategory(category);
                    const IconComponent = getCategoryIcon(category);
                    
                    return (
                      <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <IconComponent className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">
                            {getCategoryName(category)}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {presets.map(([key, config]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setPreset(key as ScreenPreset)}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                preset === key
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              <div className="font-medium text-sm text-gray-800 dark:text-white">
                                {config.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {config.width} × {config.height}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 生成按钮 */}
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    <span>生成壁纸</span>
                  </>
                )}
              </button>
            </form>

            {/* 翻译信息显示 */}
            {translationInfo && translationInfo.hasTranslation && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">🌏 提示词翻译信息</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">原文：</span>
                    <span className="text-gray-600 dark:text-gray-400">{translationInfo.originalPrompt}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">翻译：</span>
                    <span className="text-gray-600 dark:text-gray-400">{translationInfo.translatedPrompt}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">最终提示词：</span>
                    <span className="text-gray-600 dark:text-gray-400">{translationInfo.enhancedPrompt}</span>
                  </div>
                  
                  {/* 时间统计 */}
                  {timingInfo && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                      <h4 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">⏱️ 性能统计</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-blue-100 dark:bg-blue-800/50 rounded">
                          <div className="font-medium text-blue-700 dark:text-blue-300">翻译时间</div>
                          <div className="text-blue-600 dark:text-blue-400">{timingInfo.translationTime}ms</div>
                        </div>
                        <div className="text-center p-2 bg-purple-100 dark:bg-purple-800/50 rounded">
                          <div className="font-medium text-purple-700 dark:text-purple-300">AI生成</div>
                          <div className="text-purple-600 dark:text-purple-400">{timingInfo.aiGenerationTime}ms</div>
                        </div>
                        <div className="text-center p-2 bg-green-100 dark:bg-green-800/50 rounded">
                          <div className="font-medium text-green-700 dark:text-green-300">总耗时</div>
                          <div className="text-green-600 dark:text-green-400">{timingInfo.totalTime}ms</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 生成结果 */}
            {generatedImage && (
              <div className="mt-8 text-center">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    生成成功！
                  </h3>
                  
                  {/* 显示使用的提示词 */}
                  {lastUsedPrompt && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        🎯 实际使用的提示词：
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 break-words">
                        "{lastUsedPrompt}"
                      </p>
                    </div>
                  )}

                  {/* 情绪评价 */}
                  {wallpaperEvaluation && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 mb-4 max-w-md mx-auto">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-2xl">{wallpaperEvaluation.emoji}</span>
                        <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {wallpaperEvaluation.emotion}
                        </span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className={`text-lg font-semibold ${getScoreColorClass(wallpaperEvaluation.score)}`}>
                          {wallpaperEvaluation.score}/10
                        </span>
                        <span className="text-lg">
                          {generateStarRating(wallpaperEvaluation.score)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                        "{wallpaperEvaluation.comment}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="inline-block bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <img
                    src={generatedImage}
                    alt="生成的壁纸"
                    className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ maxHeight: '500px', maxWidth: '100%' }}
                    onClick={() => window.open(generatedImage, '_blank')}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  壁纸已保存到图库，您可以在下方查看和下载
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  点击图片可放大查看
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}