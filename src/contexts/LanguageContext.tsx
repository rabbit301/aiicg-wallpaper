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
    },

    // 生成页面
    generatePage: {
      title: 'AI壁纸生成器',
      description: '使用先进的人工智能技术，根据您的创意描述生成独特的高质量壁纸，支持多种尺寸和艺术风格',
      features: {
        aiGeneration: 'AI智能生成',
        multiSize: '多尺寸支持',
        optimization: '专业优化'
      },
      tipsTitle: '创作小贴士',
      tipsDesc: '掌握这些技巧，让您的AI壁纸更加出色',
      tip1: {
        title: '详细描述场景',
        desc: '提供具体的场景描述，如"夕阳西下的海滩，椰树摇曳，海浪轻拍沙滩"，越详细越能生成符合期望的图像。'
      },
      tip2: {
        title: '指定艺术风格',
        desc: '添加艺术风格描述，如"油画风格"、"水彩画"、"赛博朋克"等，让作品更具艺术感。'
      },
      tip3: {
        title: '注意色彩搭配',
        desc: '描述主要色调，如"暖色调"、"冷色调"、"蓝紫色系"等，有助于生成和谐的色彩组合。'
      },
      tip4: {
        title: '选择合适尺寸',
        desc: '根据使用场景选择尺寸：手机壁纸选择9:16，电脑桌面选择16:9，平板选择4:3。'
      },
      tip5: {
        title: '避免过于复杂',
        desc: '保持描述清晰简洁，避免过多复杂元素，这样能获得更清晰的生成结果。'
      },
      tip6: {
        title: '多次尝试优化',
        desc: '不满意可以调整描述重新生成，每次小的调整都可能带来惊喜的效果。'
      }
    },

    // 压缩页面
    compressPage: {
      title: '智能图片压缩',
      description: '专业的图片压缩和格式转换服务，支持多种格式，提供免费版和AI增强版选择',
      features: {
        fastCompress: '快速压缩',
        qualityGuarantee: '质量保证',
        multiFormat: '多格式支持',
        batchProcess: '批量处理'
      },
      versionCompare: '版本对比',
      versionDesc: '选择最适合您需求的压缩服务',
      freeVersion: '免费版',
      freeVersionDesc: '基础图片压缩功能',
      aiVersion: 'AI增强版',
      aiVersionDesc: '智能优化的专业压缩',
      recommended: '推荐',
      feature1: '基础格式支持 (JPG, PNG)',
      feature2: '标准压缩算法',
      feature3: '单文件处理',
      feature4: '无水印输出',
      feature5: '高级格式支持 (WebP, AVIF)',
      feature6: 'AI智能优化算法',
      feature7: '批量文件处理',
      feature8: '自定义压缩参数',
      feature9: '优先处理队列',
      free: '免费',
      freeForever: '永久免费使用',
      monthlyPrice: '/月',
      professional: '专业用户首选',
      supportedFormats: '支持格式',
      formatsDesc: '我们支持主流的图片格式转换和压缩'
    },

    // 设置页面
    settingsPage: {
      title: '设置',
      subtitle: '管理您的账户设置和偏好',
      profile: '个人信息',
      privacy: '隐私安全',
      notifications: '通知设置',
      appearance: '外观设置',
      downloads: '下载设置',
      profileInfo: '个人信息',
      avatar: '头像',
      changeAvatar: '更改头像',
      avatarTip: '点击"更改头像"可选择AI生成头像或上传自定义图片',
      username: '用户名',
      usernamePlaceholder: '请输入用户名',
      email: '邮箱地址',
      emailPlaceholder: '请输入邮箱地址',
      emailTip: '用于接收重要通知和密码重置',
      bio: '个人简介',
      bioPlaceholder: '介绍一下自己...',
      language: '语言偏好',
      timezone: '时区',
      saveChanges: '保存更改',
      saving: '保存中...',
      saveSuccess: '保存成功！',
      saveFailed: '保存失败，请稍后重试',
      avatarSelected: '头像已选择，请点击"保存更改"按钮完成保存',
      privacySettings: '隐私设置',
      saveGenerated: '保存生成的壁纸',
      saveGeneratedDesc: '是否自动保存AI生成的壁纸到您的作品集',
      saveCompressed: '保存压缩的图片',
      saveCompressedDesc: '是否保存经过压缩处理的图片记录',
      showInHomepage: '在首页展示作品',
      showInHomepageDesc: '是否允许您的作品在网站首页展示',
      maxHomepageImages: '首页展示数量',
      maxHomepageImagesDesc: '在首页最多展示几张您的作品 (1-12张)',
      privacySaveSuccess: '隐私设置保存成功！'
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
    },

    // 生成页面
    generatePage: {
      title: 'AI Wallpaper Generator',
      description: 'Use advanced artificial intelligence technology to generate unique high-quality wallpapers based on your creative descriptions, supporting multiple sizes and artistic styles',
      features: {
        aiGeneration: 'AI Smart Generation',
        multiSize: 'Multi-Size Support',
        optimization: 'Professional Optimization'
      },
      tipsTitle: 'Creation Tips',
      tipsDesc: 'Master these tips to make your AI wallpapers even better',
      tip1: {
        title: 'Describe Scenes in Detail',
        desc: 'Provide specific scene descriptions like "sunset beach with swaying palm trees and gentle waves lapping the shore". The more detailed, the better the generated image matches expectations.'
      },
      tip2: {
        title: 'Specify Art Styles',
        desc: 'Add artistic style descriptions like "oil painting style", "watercolor", "cyberpunk", etc., to make your work more artistic.'
      },
      tip3: {
        title: 'Pay Attention to Color Schemes',
        desc: 'Describe main color tones like "warm tones", "cool tones", "blue-purple palette", etc., to help generate harmonious color combinations.'
      },
      tip4: {
        title: 'Choose Appropriate Sizes',
        desc: 'Select sizes based on usage: choose 9:16 for mobile wallpapers, 16:9 for desktop backgrounds, 4:3 for tablets.'
      },
      tip5: {
        title: 'Avoid Over-Complexity',
        desc: 'Keep descriptions clear and concise, avoid too many complex elements for clearer generation results.'
      },
      tip6: {
        title: 'Try Multiple Optimizations',
        desc: 'If not satisfied, adjust descriptions and regenerate. Each small adjustment may bring surprising effects.'
      }
    },

    // 压缩页面
    compressPage: {
      title: 'Smart Image Compression',
      description: 'Professional image compression and format conversion service, supporting multiple formats, offering free and AI-enhanced versions',
      features: {
        fastCompress: 'Fast Compression',
        qualityGuarantee: 'Quality Guarantee',
        multiFormat: 'Multi-Format Support',
        batchProcess: 'Batch Processing'
      },
      versionCompare: 'Version Comparison',
      versionDesc: 'Choose the compression service that best fits your needs',
      freeVersion: 'Free Version',
      freeVersionDesc: 'Basic image compression features',
      aiVersion: 'AI Enhanced Version',
      aiVersionDesc: 'Intelligently optimized professional compression',
      recommended: 'Recommended',
      feature1: 'Basic format support (JPG, PNG)',
      feature2: 'Standard compression algorithms',
      feature3: 'Single file processing',
      feature4: 'Watermark-free output',
      feature5: 'Advanced format support (WebP, AVIF)',
      feature6: 'AI intelligent optimization algorithms',
      feature7: 'Batch file processing',
      feature8: 'Custom compression parameters',
      feature9: 'Priority processing queue',
      free: 'Free',
      freeForever: 'Free forever',
      monthlyPrice: '/month',
      professional: 'Preferred by professionals',
      supportedFormats: 'Supported Formats',
      formatsDesc: 'We support mainstream image format conversion and compression'
    },

    // 设置页面
    settingsPage: {
      title: 'Settings',
      subtitle: 'Manage your account settings and preferences',
      profile: 'Profile',
      privacy: 'Privacy & Security',
      notifications: 'Notifications',
      appearance: 'Appearance',
      downloads: 'Downloads',
      profileInfo: 'Profile Information',
      avatar: 'Avatar',
      changeAvatar: 'Change Avatar',
      avatarTip: 'Click "Change Avatar" to select AI-generated avatars or upload custom images',
      username: 'Username',
      usernamePlaceholder: 'Enter username',
      email: 'Email Address',
      emailPlaceholder: 'Enter email address',
      emailTip: 'Used for important notifications and password reset',
      bio: 'Bio',
      bioPlaceholder: 'Tell us about yourself...',
      language: 'Language Preference',
      timezone: 'Timezone',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      saveSuccess: 'Saved successfully!',
      saveFailed: 'Save failed, please try again later',
      avatarSelected: 'Avatar selected, please click "Save Changes" to complete',
      privacySettings: 'Privacy Settings',
      saveGenerated: 'Save Generated Wallpapers',
      saveGeneratedDesc: 'Whether to automatically save AI-generated wallpapers to your collection',
      saveCompressed: 'Save Compressed Images',
      saveCompressedDesc: 'Whether to save records of compressed images',
      showInHomepage: 'Show Works on Homepage',
      showInHomepageDesc: 'Whether to allow your works to be displayed on the website homepage',
      maxHomepageImages: 'Homepage Display Count',
      maxHomepageImagesDesc: 'Maximum number of your works to display on homepage (1-12)',
      privacySaveSuccess: 'Privacy settings saved successfully!'
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