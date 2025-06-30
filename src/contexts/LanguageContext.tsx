'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 支持的语言
export type Locale = 'zh-CN' | 'en';

// 语言配置
interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

// 创建Context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译数据
const translations = {
  'zh-CN': {
    // 导航栏 - 使用下划线避免与对象键冲突
    'home_nav': '首页',
    'generate': 'AI生成',
    'compress': '格式转换',
    'profile': '个人中心',
    'settings': '设置',
    'login': '登录',
    'logout': '退出登录',
    'loginRegister': '登录',
    
    // 主题
    theme: {
      light: '浅色模式',
      dark: '深色模式',
      system: '跟随系统',
    },
    
    // 语言
    'language.chinese': '简体中文',
    'language.english': 'English',
    
    // 页面内容
    page: {
      aiPoweredWallpaper: 'AI驱动的壁纸',
      creationPlatform: '创作与处理平台',
      platformDesc: '使用最先进的AI技术生成独特壁纸，提供专业的图片压缩和格式转换服务，为您的设备打造完美的视觉体验。',
      powerfulFeatures: '强大的功能特性',
      featuresDesc: '集成最新AI技术，为您提供全方位的图片处理解决方案'
    },
    
    // 首页
    home: {
      title: 'AI壁纸生成器',
      subtitle: '使用人工智能创造独特的高质量壁纸',
      description: '专业的AI壁纸生成平台，支持多种屏幕尺寸和艺术风格，让您的设备焕然一新。',
      startCreating: '开始创作',
      imageProcessing: '图片处理',
      stats: {
        wallpapers: '生成壁纸',
        users: '活跃用户',
        satisfaction: '满意度'
      },
      features: {
        aiGeneration: 'AI壁纸生成',
        aiGenerationDesc: '使用先进的AI模型，根据您的描述生成独特的高质量壁纸，支持多种尺寸和风格。',
        smartCompression: '智能压缩',
        smartCompressionDesc: '提供免费版和AI版压缩，支持多种格式转换，保持高质量的同时大幅减少文件大小。',
        professionalOptimization: '专业优化',
        professionalOptimizationDesc: '针对不同设备和用途进行专业优化，包括水冷屏幕、手机、桌面等多种场景。'
      },
      cta: {
        title: '开始您的创作之旅',
        description: '无论是生成独特的AI壁纸，还是处理现有图片，我们都为您提供专业的工具',
        generateWallpaper: 'AI生成壁纸',
        processImage: '图片处理'
      }
    },
    
    // 分类页面
    category: {
      featuredContent: '精彩内容分类',
      contentDesc: '探索丰富多样的视觉内容，从AI生成壁纸到精美背景，应有尽有',
      aiGenerated: 'AI生成',
      aiGeneratedDesc: 'AI创作的独特壁纸',
      avatar: '头像',
      avatarDesc: '个性头像和角色形象',
      wallpaper: '壁纸',
      wallpaperDesc: '精美背景和壁纸',
      animation: '动画',
      animationDesc: '创意动画和特效',
      live: '直播',
      liveDesc: '直播元素和装饰',
      startCreating: '开始创作',
      viewMore: '查看更多',
      totalContent: '总内容数量',
      contentTypes: '内容分类',
      continuousUpdate: '持续更新',
      loadFailed: '加载失败',
      retry: '重试'
    },
    
    // 图库页面
    gallery: {
      loadFailed: '加载失败',
      retry: '重试',
      noWallpapers: '暂无壁纸',
      noMatches: '没有找到匹配的壁纸',
      noGenerated: '还没有生成任何壁纸',
      preview: '预览',
      download: '下载',
      optimized360: '360优化',
      latestWorks: '最新AI生成作品',
      discoverWorks: '发现其他用户创作的精彩壁纸，获取灵感或直接下载使用',
      createNow: '立即创作您的专属壁纸'
    }
  },
  'en': {
    // 导航栏 - 使用下划线避免与对象键冲突
    'home_nav': 'Home',
    'generate': 'AI Generate',
    'compress': 'Format Convert',
    'profile': 'Profile',
    'settings': 'Settings',
    'login': 'Sign In',
    'logout': 'Logout',
    'loginRegister': 'Sign In',
    
    // 主题
    theme: {
      light: 'Light Mode',
      dark: 'Dark Mode',
      system: 'Follow System',
    },
    
    // 语言
    'language.chinese': '简体中文',
    'language.english': 'English',
    
    // 页面内容
    page: {
      aiPoweredWallpaper: 'AI-Powered Wallpaper',
      creationPlatform: 'Creation & Processing Platform',
      platformDesc: 'Use cutting-edge AI technology to generate unique wallpapers, provide professional image compression and format conversion services to create perfect visual experiences for your devices.',
      powerfulFeatures: 'Powerful Features',
      featuresDesc: 'Integrating the latest AI technology to provide comprehensive image processing solutions'
    },
    
    // 首页
    home: {
      title: 'AI Wallpaper Generator',
      subtitle: 'Create unique high-quality wallpapers with artificial intelligence',
      description: 'Professional AI wallpaper generation platform supporting multiple screen sizes and art styles to refresh your devices.',
      startCreating: 'Start Creating',
      imageProcessing: 'Image Processing',
      stats: {
        wallpapers: 'Generated Wallpapers',
        users: 'Active Users',
        satisfaction: 'Satisfaction'
      },
      features: {
        aiGeneration: 'AI Wallpaper Generation',
        aiGenerationDesc: 'Use advanced AI models to generate unique high-quality wallpapers based on your descriptions, supporting multiple sizes and styles.',
        smartCompression: 'Smart Compression',
        smartCompressionDesc: 'Provide free and AI version compression, support multiple format conversion, maintain high quality while significantly reducing file size.',
        professionalOptimization: 'Professional Optimization',
        professionalOptimizationDesc: 'Professional optimization for different devices and purposes, including liquid cooling screens, mobile phones, desktops and other scenarios.'
      },
      cta: {
        title: 'Start Your Creative Journey',
        description: 'Whether generating unique AI wallpapers or processing existing images, we provide professional tools for you',
        generateWallpaper: 'Generate AI Wallpaper',
        processImage: 'Process Image'
      }
    },
    
    // 分类页面
    category: {
      featuredContent: 'Featured Content Categories',
      contentDesc: 'Explore rich and diverse visual content, from AI-generated wallpapers to beautiful backgrounds',
      aiGenerated: 'AI Generated',
      aiGeneratedDesc: 'Unique wallpapers created by AI',
      avatar: 'Avatar',
      avatarDesc: 'Personalized avatars and character images',
      wallpaper: 'Wallpaper',
      wallpaperDesc: 'Beautiful backgrounds and wallpapers',
      animation: 'Animation',
      animationDesc: 'Creative animations and effects',
      live: 'Live',
      liveDesc: 'Live streaming elements and decorations',
      startCreating: 'Start Creating',
      viewMore: 'View More',
      totalContent: 'Total Content',
      contentTypes: 'Content Categories',
      continuousUpdate: 'Continuous Updates',
      loadFailed: 'Load Failed',
      retry: 'Retry'
    },
    
    // 图库页面
    gallery: {
      loadFailed: 'Load Failed',
      retry: 'Retry',
      noWallpapers: 'No Wallpapers',
      noMatches: 'No matching wallpapers found',
      noGenerated: 'No wallpapers generated yet',
      preview: 'Preview',
      download: 'Download',
      optimized360: '360 Optimized',
      latestWorks: 'Latest AI Generated Works',
      discoverWorks: 'Discover amazing wallpapers created by other users, get inspiration or download directly',
      createNow: 'Create Your Exclusive Wallpaper Now'
    }
  }
} as const;

// Provider组件
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh-CN');

  // 从localStorage加载语言偏好
  useEffect(() => {
    const saved = localStorage.getItem('preferred-locale');
    if (saved && (saved === 'zh-CN' || saved === 'en')) {
      setLocale(saved);
    }
  }, []);

  // 保存语言偏好到localStorage
  const handleSetLocale = (newLocale: Locale) => {
    console.log('🌍 语言切换:', locale, '->', newLocale);
    setLocale(newLocale);
    localStorage.setItem('preferred-locale', newLocale);
    console.log('✅ 语言已保存到localStorage:', newLocale);
  };

  // 翻译函数
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}