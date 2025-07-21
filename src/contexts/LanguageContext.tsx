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
    'optional': '可选',
    
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

    // 通用
    common: {
      loading: '加载中...',
      error: '出错了',
      retry: '重试',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      close: '关闭',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      submit: '提交',
      reset: '重置',
      search: '搜索',
      filter: '筛选',
      sort: '排序',
      view: '查看',
      download: '下载',
      upload: '上传',
      share: '分享',
      copy: '复制',
      more: '更多',
      preview: '预览'
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
      smallScreen: '小屏幕动图',
      startCreating: '开始创作',
      viewMore: '查看更多',
      totalContent: '总内容数量',
      contentTypes: '内容分类',
      continuousUpdate: '持续更新',
      loadFailed: '加载失败',
      retry: '重试'
    },

    // 侧边栏
    sidebar: {
      browseCategories: '浏览分类',
      searchPlaceholder: '搜索内容...',
      popularCategories: '热门分类',
      items: '项目',
      quickFilter: '快速筛选',
      createNow: '立即创作'
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
      // 新增翻译键
      quickGenerate: '快速生成',
      stylePresets: '风格预sets',
      generationHistory: '生成历史',
      wallpaperTitle: '壁纸标题',
      titlePlaceholder: '为您的壁纸起个名字...',
      promptLabel: '生图提示词',
      promptSupport: '支持中文，自动翻译',
      promptPlaceholder: '描述您想要的壁纸，支持中文输入...',
      wallpaperSize: '壁纸尺寸',
      generateButton: '生成壁纸',
      generating: '生成中...',
      generationResult: '生成结果',
      clickToPreview: '点击预览',
      savedToGallery: '壁纸已保存到图库，点击图片可放大预览',
      characters: '字符',
      clear: '清空',
      expand: '展开',
      collapse: '收起',
      randomStyle: '随机风格',
      popularRecommend: '热门推荐',
      todayPick: '今日精选',
      aiRecommend: 'AI推荐',
      // 预设分类
      presets: {
        popular: '热门风格',
        anime: '二次元',
        nature: '自然风光',
        abstract: '抽象艺术'
      },
      // 尺寸选项
      sizes: {
        desktopFhd: '桌面 FHD',
        mobilePortrait: '手机竖屏',
        square1024: '方形 1K',
        desktop4k: '桌面 4K'
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
      formatsDesc: '我们支持主流的图片格式转换和压缩',
      // 压缩工具界面
      compressionTool: '智能图片压缩',
      compressionDesc: '基于先进算法的高效压缩，优化文件大小同时保持图片质量',
      compressionPreset: '压缩预设',
      highQuality: '高质量 (95% 质量)',
      balanced: '平衡 (85% 质量，推荐)',
      highCompression: '高压缩 (70% 质量)',
      waterCooling360: '360水冷优化',
      animationOptimized: '动画优化',
      coolingScreenSize: '水冷冷头屏幕尺寸',
      customSize: '自定义尺寸',
      squareStandard: '方形 480×480 (标准)',
      squareHD: '方形 640×640 (高清)',
      squareUHD: '方形 800×800 (超清)',
      landscape43: '横屏 640×480 (4:3)',
      landscape43HD: '横屏 800×600 (4:3)',
      landscape169: '横屏 854×480 (16:9)',
      portrait34: '竖屏 480×640 (3:4)',
      portrait34HD: '竖屏 600×800 (3:4)',
      roundStandard: '圆形 480×480 (圆屏适配)',
      roundHD: '圆形 640×640 (圆屏适配)',
      outputSize: '输出尺寸',
      pixels: '像素',
      roundScreenOptimized: '(圆形屏幕优化)',
      advancedOptions: '高级选项',
      quality: '质量 (1-100)',
      outputFormat: '输出格式',
      width: '宽度 (像素)',
      height: '高度 (像素)',
      auto: '自动',
      presetApplied: '已选择水冷屏幕预设，尺寸将自动设置为',
      selectImage: '点击选择图片文件',
      supportedFormats2: '支持 PNG、JPEG、WebP、GIF 等格式',
      startCompression: '开始压缩',
      compressing: '压缩中...',
      processingHint: '图片压缩处理中...',
      processingDesc: '正在使用高效算法进行压缩，预计需要5-15秒',
      compressionComplete: '压缩完成！',
      hint: '提示',
      compressionEffect: '压缩效果对比',
      originalImage: '原始图片',
      compressedImage: '压缩后图片',
      originalSize: '原始大小',
      sizeChange: '尺寸变化',
      original: '原图',
      compressed: '压缩后',
      saved: '节省',
      compressionRatio: '压缩率',
      savedSpace: '节省空间',
      processingTime: '处理时间',
      downloadCompressed: '下载压缩后的图片',
      compressNew: '压缩新图片',
      viewDetailedComparison: '放大查看详细对比',
      preview: '预览',
      compressedImagePreview: '压缩后图片'
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
    },

    // 隐私政策页面
    privacy: {
      title: '隐私政策',
      subtitle: '了解我们如何收集、使用和保护您的个人信息',
      lastUpdated: '最后更新：2024年12月28日',
      dataCollection: {
        title: '信息收集',
        intro: '我们收集以下信息以提供更好的服务：',
        item1: '账户信息：用户名、邮箱地址、头像等基本信息',
        item2: '使用数据：生成壁纸记录、下载历史、偏好设置',
        item3: '技术信息：设备类型、浏览器信息、IP地址',
        item4: '用户生成内容：上传的图片、AI生成的壁纸、个人简介'
      },
      dataUsage: {
        title: '信息使用',
        intro: '我们使用收集的信息用于：',
        service: {
          title: '服务提供',
          desc: '提供AI壁纸生成、图片压缩等核心功能服务'
        },
        improvement: {
          title: '服务改进',
          desc: '分析使用模式，改进产品功能和用户体验'
        },
        communication: {
          title: '用户沟通',
          desc: '发送服务通知、更新信息和客户支持'
        },
        legal: {
          title: '法律合规',
          desc: '遵守法律法规，保护用户和平台安全'
        }
      },
      dataSecurity: {
        title: '数据安全',
        intro: '我们采用多层安全措施保护您的信息：',
        encryption: {
          title: '数据加密',
          desc: '所有敏感数据采用行业标准加密技术保护'
        },
        access: {
          title: '访问控制',
          desc: '严格限制员工访问权限，定期审核访问日志'
        },
        backup: {
          title: '备份保护',
          desc: '定期备份重要数据，确保数据安全性和可恢复性'
        }
      },
      userRights: {
        title: '用户权利',
        intro: '根据相关法律法规，您享有以下权利：',
        access: '访问权',
        accessDesc: '查看我们收集的关于您的个人信息',
        correct: '更正权',
        correctDesc: '更正不准确或不完整的个人信息',
        delete: '删除权',
        deleteDesc: '要求删除您的个人信息（在某些条件下）',
        portable: '数据可携权',
        portableDesc: '以结构化格式导出您的个人数据'
      },
      cookies: {
        title: 'Cookie使用',
        intro: '我们使用Cookie和类似技术来改善用户体验、分析网站使用情况和提供个性化内容。',
        management: '您可以通过浏览器设置管理Cookie偏好，但这可能影响某些功能的正常使用。'
      },
      contact: {
        title: '联系我们',
        intro: '如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：',
        contactPage: '查看联系方式'
      }
    },

    // 联系我们页面
    contact: {
      title: '联系我们',
      subtitle: '有问题或建议？我们随时为您提供帮助',
      email: {
        title: '邮件联系',
        subtitle: '发送详细信息给我们',
        direct: '直接发送邮件'
      },
      telegram: {
        title: 'Telegram客服',
        subtitle: '即时在线客服支持',
        description: '24小时智能客服，快速响应您的问题',
        fastResponse: '快速响应',
        responseTime: '通常在5分钟内回复',
        available: '全天在线',
        timezone: '北京时间 00:00-24:00',
        language: '多语言支持',
        languages: '中文、English',
        startChat: '开始对话',
        botHandle: '机器人账号'
      },
      form: {
        name: '姓名',
        namePlaceholder: '请输入您的姓名',
        email: '邮箱',
        emailPlaceholder: '请输入您的邮箱地址',
        subject: '主题',
        subjectPlaceholder: '请简要描述问题',
        message: '详细描述',
        messagePlaceholder: '请详细描述您的问题或建议...',
        send: '发送邮件'
      },
      faq: {
        title: '常见问题',
        subtitle: '查看常见问题的快速解答',
        q1: '如何生成AI壁纸？',
        a1: '在AI生成页面输入您想要的描述，选择尺寸和样式，点击生成即可。我们的AI会根据您的描述创建独特的壁纸。',
        q2: '图片压缩是否安全？',
        a2: '是的，我们使用客户端压缩技术，您的图片不会上传到服务器。免费版提供基础压缩，AI版本提供更高质量的智能优化。',
        q3: '如何联系技术支持？',
        a3: '您可以通过邮件 support@aiicg.com 或 Telegram @aiicgbot 联系我们。我们通常在工作时间内快速响应。'
      },
      support: {
        title: '客服时间',
        email: '邮件支持',
        emailHours: '24小时内回复',
        telegram: 'Telegram支持',
        telegramHours: '即时响应'
      }
    },

    // Footer翻译
    footer: {
      brand: 'AIICG壁纸站',
      description: '专业的AI壁纸生成和图片处理平台，提供高质量的壁纸生成、格式转换和压缩服务。',
      features: '功能',
      support: '支持',
      legal: '法律',
      aiGeneration: 'AI壁纸生成',
      imageCompression: '图片压缩',
      formatConversion: '格式转换',
      help: '使用帮助',
      contactUs: '联系我们',
      privacyPolicy: '隐私政策',
      termsOfService: '服务条款',
      copyright: '保留所有权利.'
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
    'optional': 'optional',
    
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

    // 通用
    common: {
      loading: 'Loading...',
      error: 'Error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      share: 'Share',
      copy: 'Copy',
      more: 'More',
      preview: 'Preview'
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
      smallScreen: 'Small Screen GIFs',
      startCreating: 'Start Creating',
      viewMore: 'View More',
      totalContent: 'Total Content',
      contentTypes: 'Content Categories',
      continuousUpdate: 'Continuous Updates',
      loadFailed: 'Load Failed',
      retry: 'Retry'
    },

    // 侧边栏
    sidebar: {
      browseCategories: 'Browse Categories',
      searchPlaceholder: 'Search content...',
      popularCategories: 'Popular Categories',
      items: 'items',
      quickFilter: 'Quick Filter',
      createNow: 'Create Now'
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
      // 新增翻译键
      quickGenerate: 'Quick Generate',
      stylePresets: 'Style Presets',
      generationHistory: 'Generation History',
      wallpaperTitle: 'Wallpaper Title',
      titlePlaceholder: 'Give your wallpaper a name...',
      promptLabel: 'Generation Prompt',
      promptSupport: 'Chinese supported, auto-translate',
      promptPlaceholder: 'Describe the wallpaper you want...',
      wallpaperSize: 'Wallpaper Size',
      generateButton: 'Generate Wallpaper',
      generating: 'Generating...',
      generationResult: 'Generation Result',
      clickToPreview: 'Click to Preview',
      savedToGallery: 'Wallpaper saved to gallery, click image to preview',
      characters: 'characters',
      clear: 'Clear',
      expand: 'Expand',
      collapse: 'Collapse',
      randomStyle: 'Random Style',
      popularRecommend: 'Popular',
      todayPick: 'Today\'s Pick',
      aiRecommend: 'AI Recommend',
      // 预设分类
      presets: {
        popular: 'Popular Styles',
        anime: 'Anime Style',
        nature: 'Nature',
        abstract: 'Abstract Art'
      },
      // 尺寸选项
      sizes: {
        desktopFhd: 'Desktop FHD',
        mobilePortrait: 'Mobile Portrait',
        square1024: 'Square 1K',
        desktop4k: 'Desktop 4K'
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
      formatsDesc: 'We support mainstream image format conversion and compression',
      // 压缩工具界面
      compressionTool: 'Smart Image Compression',
      compressionDesc: 'Efficient compression based on advanced algorithms, optimizing file size while maintaining image quality',
      compressionPreset: 'Compression Preset',
      highQuality: 'High Quality (95% quality)',
      balanced: 'Balanced (85% quality, recommended)',
      highCompression: 'High Compression (70% quality)',
      waterCooling360: '360 Water Cooling Optimized',
      animationOptimized: 'Animation Optimized',
      coolingScreenSize: 'Water Cooling Screen Size',
      customSize: 'Custom Size',
      squareStandard: 'Square 480×480 (Standard)',
      squareHD: 'Square 640×640 (HD)',
      squareUHD: 'Square 800×800 (UHD)',
      landscape43: 'Landscape 640×480 (4:3)',
      landscape43HD: 'Landscape 800×600 (4:3)',
      landscape169: 'Landscape 854×480 (16:9)',
      portrait34: 'Portrait 480×640 (3:4)',
      portrait34HD: 'Portrait 600×800 (3:4)',
      roundStandard: 'Round 480×480 (Round Screen)',
      roundHD: 'Round 640×640 (Round Screen)',
      outputSize: 'Output Size',
      pixels: 'pixels',
      roundScreenOptimized: '(Round screen optimized)',
      advancedOptions: 'Advanced Options',
      quality: 'Quality (1-100)',
      outputFormat: 'Output Format',
      width: 'Width (pixels)',
      height: 'Height (pixels)',
      auto: 'Auto',
      presetApplied: 'Water cooling screen preset selected, size will be automatically set to',
      selectImage: 'Click to select image file',
      supportedFormats2: 'Supports PNG, JPEG, WebP, GIF and other formats',
      startCompression: 'Start Compression',
      compressing: 'Compressing...',
      processingHint: 'Image compression in progress...',
      processingDesc: 'Using efficient algorithms for compression, estimated 5-15 seconds',
      compressionComplete: 'Compression Complete!',
      hint: 'Hint',
      compressionEffect: 'Compression Effect Comparison',
      originalImage: 'Original Image',
      compressedImage: 'Compressed Image',
      originalSize: 'Original Size',
      sizeChange: 'Size Change',
      original: 'Original',
      compressed: 'Compressed',
      saved: 'Saved',
      compressionRatio: 'Compression Ratio',
      savedSpace: 'Space Saved',
      processingTime: 'Processing Time',
      downloadCompressed: 'Download Compressed Image',
      compressNew: 'Compress New Image',
      viewDetailedComparison: 'View Detailed Comparison',
      preview: 'Preview',
      compressedImagePreview: 'Compressed Image'
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
    },

    // 隐私政策页面
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Learn how we collect, use and protect your personal information',
      lastUpdated: 'Last updated: December 28, 2024',
      dataCollection: {
        title: 'Information Collection',
        intro: 'We collect the following information to provide better services:',
        item1: 'Account information: username, email address, avatar and other basic information',
        item2: 'Usage data: wallpaper generation records, download history, preference settings',
        item3: 'Technical information: device type, browser information, IP address',
        item4: 'User-generated content: uploaded images, AI-generated wallpapers, personal bio'
      },
      dataUsage: {
        title: 'Information Usage',
        intro: 'We use the collected information for:',
        service: {
          title: 'Service Provision',
          desc: 'Provide core services like AI wallpaper generation and image compression'
        },
        improvement: {
          title: 'Service Improvement',
          desc: 'Analyze usage patterns to improve product features and user experience'
        },
        communication: {
          title: 'User Communication',
          desc: 'Send service notifications, updates and customer support'
        },
        legal: {
          title: 'Legal Compliance',
          desc: 'Comply with laws and regulations, protect user and platform security'
        }
      },
      dataSecurity: {
        title: 'Data Security',
        intro: 'We employ multi-layer security measures to protect your information:',
        encryption: {
          title: 'Data Encryption',
          desc: 'All sensitive data is protected with industry-standard encryption technology'
        },
        access: {
          title: 'Access Control',
          desc: 'Strictly limit employee access permissions and regularly audit access logs'
        },
        backup: {
          title: 'Backup Protection',
          desc: 'Regularly backup important data to ensure data security and recoverability'
        }
      },
      userRights: {
        title: 'User Rights',
        intro: 'According to relevant laws and regulations, you have the following rights:',
        access: 'Right to Access',
        accessDesc: 'View personal information we have collected about you',
        correct: 'Right to Rectification',
        correctDesc: 'Correct inaccurate or incomplete personal information',
        delete: 'Right to Erasure',
        deleteDesc: 'Request deletion of your personal information (under certain conditions)',
        portable: 'Right to Data Portability',
        portableDesc: 'Export your personal data in a structured format'
      },
      cookies: {
        title: 'Cookie Usage',
        intro: 'We use cookies and similar technologies to improve user experience, analyze website usage and provide personalized content.',
        management: 'You can manage cookie preferences through your browser settings, but this may affect the normal use of certain features.'
      },
      contact: {
        title: 'Contact Us',
        intro: 'If you have any questions about this privacy policy or need to exercise your rights, please contact us through:',
        contactPage: 'View Contact Information'
      }
    },

    // 联系我们页面
    contact: {
      title: 'Contact Us',
      subtitle: 'Have questions or suggestions? We are here to help',
      email: {
        title: 'Email Contact',
        subtitle: 'Send detailed information to us',
        direct: 'Send email directly'
      },
      telegram: {
        title: 'Telegram Support',
        subtitle: 'Instant online customer support',
        description: '24-hour intelligent customer service, quick response to your questions',
        fastResponse: 'Fast Response',
        responseTime: 'Usually reply within 5 minutes',
        available: 'Available 24/7',
        timezone: 'Beijing Time 00:00-24:00',
        language: 'Multi-language Support',
        languages: '中文, English',
        startChat: 'Start Chat',
        botHandle: 'Bot Account'
      },
      form: {
        name: 'Name',
        namePlaceholder: 'Please enter your name',
        email: 'Email',
        emailPlaceholder: 'Please enter your email address',
        subject: 'Subject',
        subjectPlaceholder: 'Please briefly describe the issue',
        message: 'Detailed Description',
        messagePlaceholder: 'Please describe your issue or suggestion in detail...',
        send: 'Send Email'
      },
      faq: {
        title: 'Frequently Asked Questions',
        subtitle: 'Find quick answers to common questions',
        q1: 'How to generate AI wallpapers?',
        a1: 'Enter your desired description on the AI generation page, select size and style, then click generate. Our AI will create unique wallpapers based on your description.',
        q2: 'Is image compression safe?',
        a2: 'Yes, we use client-side compression technology, your images are not uploaded to the server. The free version provides basic compression, while the AI version offers higher quality intelligent optimization.',
        q3: 'How to contact technical support?',
        a3: 'You can contact us via email support@aiicg.com or Telegram @aiicgbot. We usually respond quickly during business hours.'
      },
      support: {
        title: 'Support Hours',
        email: 'Email Support',
        emailHours: 'Reply within 24 hours',
        telegram: 'Telegram Support',
        telegramHours: 'Instant response'
      }
    },

    // Footer翻译
    footer: {
      brand: 'AIICG Wallpaper',
      description: 'Professional AI wallpaper generation and image processing platform, providing high-quality wallpaper generation, format conversion and compression services.',
      features: 'Features',
      support: 'Support',
      legal: 'Legal',
      aiGeneration: 'AI Wallpaper Generation',
      imageCompression: 'Image Compression',
      formatConversion: 'Format Conversion',
      help: 'Help',
      contactUs: 'Contact Us',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      copyright: 'All rights reserved.'
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