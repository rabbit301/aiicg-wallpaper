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
    pages: {
      admin: {
        dashboard: {
          title: '🛠️ 管理仪表板',
          welcome: '欢迎回来',
          systemStatus: '系统运行状态',
          statusHealthy: '正常',
          statusWarning: '警告',
          statusError: '异常',
          stats: {
            totalUsers: '总用户数',
            totalWallpapers: '壁纸总数',
            todayGenerations: '今日生成',
            storageUsed: '存储使用率',
            previousMonth: '较上月',
            previousWeek: '较上周',
            previousDay: '较昨日'
          },
          charts: {
            generationTrend: '生成趋势',
            generationTrendSubtitle: '最近7天的壁纸生成数量',
            categoryDistribution: '分类分布',
            categoryDistributionSubtitle: '壁纸分类统计',
            days7: '7天',
            days30: '30天',
            days90: '90天'
          },
          access: {
            restrictedTitle: '访问受限',
            restrictedMessage: '需要超级管理员权限才能访问此页面',
            backToHome: '返回首页'
          },
          categories: {
            technology: '科技',
            others: '其他'
          }
        },
        users: {
          title: '用户管理',
          empty: '暂无用户',
          columns: {
            username: '用户名',
            email: '邮箱',
            role: '角色',
            createdAt: '创建时间',
            actions: '操作'
          },
          searchPlaceholder: '搜索用户（用户名/邮箱）...',
          roles: {
            all: '全部',
            user: '用户',
            admin: '管理员',
            superAdmin: '超级管理员'
          },
          actions: {
            apply: '应用筛选',
            batchRoleChange: '批量修改角色',
            batchDelete: '批量删除',
            setToUser: '设为普通用户',
            setToAdmin: '设为管理员',
            setToSuperAdmin: '设为超级管理员',
            selectedCount: '已选择 {count} 个用户',
            confirmBatchDelete: '确定要删除 {count} 个用户吗？此操作不可恢复。',
            confirmBatchRoleChange: '确定要将 {count} 个用户的角色修改为 {role} 吗？',
            batchDeleteFailed: '批量删除失败',
            batchRoleChangeFailed: '批量修改角色失败'
          }
        },
        wallpapers: {
          title: '壁纸管理',
          actions: {
            upload: '上传',
            importUrl: '导入链接',
            edit: '编辑',
            publish: '上架',
            unpublish: '下架'
          },
          filters: {
            visibility: '可见性',
            all: '全部',
            public: '公开',
            private: '私有'
          },
          fields: {
            title: '标题',
            category: '分类',
            tags: '标签(逗号分隔)',
            imageUrl: '图片链接'
          }
        },
        settings: {
          title: '系统配置',
          provider: '生图提供者',
          rateLimit: '速率限制',
          saved: '已保存'
        },
        audit: {
          title: '审计与日志',
          empty: '暂无日志'
        },
        notifications: {
          title: '通知管理',
          listTitle: '已发布通知',
          empty: '暂无通知',
          actions: {
            create: '发布通知',
            submitting: '发布中...'
          },
          fields: {
            type: '类型',
            priority: '优先级',
            title: '标题',
            content: '内容',
            summary: '摘要',
            icon: '图标',
            image: '图片',
            actionURL: '动作链接',
            actionText: '动作文字',
            expiresAt: '过期时间',
            metadata: '元数据(JSON)'
          },
          placeholders: {
            title: '请输入标题',
            content: '请输入内容'
          },
          priority: {
            low: '低',
            normal: '普通',
            high: '高',
            urgent: '紧急'
          },
          type: {
            system: '系统',
            announcement: '公告',
            update: '更新',
            achievement: '成就',
            message: '消息',
            warning: '警告',
            promotion: '促销'
          },
          pagination: {
            prev: '上一页',
            next: '下一页',
            page: '第'
          },
          errors: {
            invalidMetadata: '元数据必须为合法JSON',
            unauthorized: '未登录或登录已过期',
            forbidden: '无权限执行该操作',
            createFailed: '发布失败'
          }
        }
      }
    },
    // 导航栏
    'homeNav': '首页',
    'generate': 'AI生成',
    'profile': '个人中心',
    'login': '登录',
    'logout': '退出登录',
    'loginRegister': '登录',
    'optional': '可选',

    // 侧边栏导航
    'explore': '探索',
    nav: {
      admin: {
        dashboard: '控制台',
        notifications: '通知管理'
      }
    },
    'create': '创造',
    'material': '素材',
    'compress': '重布',
    'notifications': '通知',
    'user': '用户',
    'settings': '设置',

    // 设置菜单
    'menuResources': '资源',
    'menuLanguage': '语言',
    'termsOfService': '服务条款',
    'privacyPolicy': '隐私政策',
    'communityGuidelines': '社群公约',
    'userSafetyGuide': '使用者安全指南',
    'cookiePolicy': 'Cookie政策',

    // 通用状态
    'common.loading': '加载中...',
    'common.submit': '提交',
    'common.cancel': '取消',
    'common.close': '关闭',
    'common.download': '下载',
    'common.view': '查看',
    'common.share': '分享',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.save': '保存',
    'common.back': '返回',

    // 错误和状态信息
    'errors.loadFailed': '加载失败',
    'errors.notFound': '内容不存在',
    'errors.networkError': '网络错误',
    'status.uploading': '上传中...',
    'status.processing': '处理中...',
    'status.completed': '已完成',

    // 分类页面
    'categories.wallpaper.name': '壁纸',
    'categories.wallpaper.description': '精美壁纸合集，包含AI生成、动画效果和头像素材',
    'categories.avatar.name': '头像',
    'categories.avatar.description': '个性化头像和肖像素材，打造独特形象',
    'categories.animation.name': '动画',
    'categories.animation.description': '动态图片和GIF动画效果素材',

    // 子分类
    'subcategories.ai-generated': 'AI壁纸',
    'subcategories.avatar': '头像素材',
    'subcategories.animation': '动画效果',
    'subcategories.nature': '自然风光',
    'subcategories.abstract': '抽象艺术',
    'subcategories.minimal': '简约风格',
    'subcategories.cartoon': '卡通头像',
    'subcategories.realistic': '写实头像',
    'subcategories.anime': '动漫风格',

    // 筛选器
    'filters.resolution': '分辨率',
    'filters.orientation': '方向',
    'filters.style': '风格',
    'filters.color': '颜色',
    'filters.mood': '氛围',
    'filters.type': '类型',

    // 筛选选项
    'filterOptions.horizontal': '横向',
    'filterOptions.vertical': '竖向',
    'filterOptions.square': '方形',
    'filterOptions.modern': '现代',
    'filterOptions.vintage': '复古',
    'filterOptions.artistic': '艺术',
    'filterOptions.cute': '可爱',
    'filterOptions.cool': '酷炫',
    'filterOptions.elegant': '优雅',
    'filterOptions.bright': '明亮',
    'filterOptions.dark': '深色',
    'filterOptions.colorful': '多彩',
    'filterOptions.monochrome': '单色',

    // 视图和操作
    'views.grid': '网格视图',
    'views.waterfall': '瀑布流',
    'actions.filter': '筛选',
    'actions.sort': '排序',
    'actions.viewDetails': '查看详情',
    'actions.zoomIn': '放大',
    'actions.zoomOut': '缩小',

    // 排序选项
    'sort.latest': '最新上传',
    'sort.popular': '最受欢迎',
    'sort.downloads': '下载最多',
    'sort.rating': '评分最高',

    // 状态信息
    'status.downloading': '下载中...',

    // 壁纸详情页
    'wallpaper.details': '作品详情',
    'wallpaper.notFound': '壁纸不存在',
    'wallpaper.loadFailed': '加载失败',
    'wallpaper.relatedFailed': '获取相关壁纸失败',
    'wallpaper.generateSimilar': '生成同款壁纸',
    'wallpaper.similarStyle': '类似风格的精美壁纸',
    'wallpaper.shareText': '查看这张精美的AI生成壁纸',
    'wallpaper.techInfo': '技术信息',
    'wallpaper.relatedRecommend': '相关推荐',
    'wallpaper.backToHome': '返回首页',
    'wallpaper.author': '作者',
    'wallpaper.uploadTime': '上传时间',
    'wallpaper.views': '浏览量',
    'wallpaper.downloads': '下载量',
    'wallpaper.resolution': '分辨率',
    'wallpaper.size': '文件大小',
    'wallpaper.format': '格式',
    'wallpaper.tags': '标签',

    // 操作按钮
    'actions.like': '点赞',
    'actions.follow': '关注',
    'actions.following': '已关注',

    // 个人中心页面
    'profileTitle': '个人中心',
    'profileSubtitle': '管理您的账户、查看数据统计、邀请好友赚取收益',
    'loadingCenter': '加载个人中心中...',
    'loadFailed': '加载失败',
    'loadUserDataFailed': '加载用户数据失败',
    'retry': '重试',
    'functionNav': '功能导航',
    'overview': '概览',
    'overviewDesc': '账户概览',
    'stats': '数据统计',
    'statsDesc': '使用数据分析',
    'invite': '邀请推广',
    'inviteDesc': '邀请好友赚钱',
    'achievementsNav': '成就系统',
    'achievementsDesc': '解锁成就奖励',
    'accountSettings': '账户设置',
    'accountSettingsDesc': '个人信息设置',
    'billingNav': '账单管理',
    'billingDesc': '消费记录管理',
    'formatMinutes': '分钟',
    'formatHours': '小时',
    
    // 概览页面
    'overviewTitle': '账户概览',
    'overviewDescription': '查看您的使用统计和成就',
    'achievementsCount': '个成就',
    'todayGenerated': '今日生成',
    'aiImages': 'AI图片',
    'todayDownloads': '今日下载',
    'imageDownloads': '图片下载',
    'usageTime': '使用时长',
    'todayUsage': '今日使用',
    'totalSpent': '总消费',
    'cumulativeSpent': '累计消费',
    'weeklyTrend': '本周使用趋势',
    'categoryPreferences': '分类偏好',
    'landscape': '风景',
    'portrait': '人像',
    'abstract': '抽象',
    'anime': '动漫',
    'realistic': '写实',
    'images': '张',
    'timeDistribution': '使用时间分布',
    'morning': '上午 (6-12点)',
    'afternoon': '下午 (12-18点)',
    'evening': '晚上 (18-24点)',
    'night': '深夜 (0-6点)',
    'achievementSystem': '成就系统',
    'progress': '进度',
    'reward': '奖励',
    'loadOverviewFailed': '加载概览数据失败',
    'monday': '周一',
    'tuesday': '周二',
    'wednesday': '周三',
    'thursday': '周四',
    'friday': '周五',
    'saturday': '周六',
    'sunday': '周日',
    
    // 统计页面
    'statsTitle': '数据统计',
    'statsDescription': '深入了解您的使用情况和趋势',
    'loadingStats': '加载统计数据中...',
    'noStatsData': '暂无数据',
    'noStatsDescription': '开始使用AI生成壁纸来查看统计数据',
    'loadStatsFailed': '加载统计数据失败',
    'generatedCount': '生成数量',
    'downloadsCount': '下载数量',
    'viewsCount': '浏览数量',
    'totalGenerated': '总生成数',
    'totalDownloads': '总下载数',
    'totalViews': '总浏览数',
    'totalLikes': '总点赞数',
    'totalShares': '总分享数',
    'totalTime': '总时长',
    'trendAnalysis': '趋势分析',
    'last7Days': '最近7天',
    'last30Days': '最近30天',
    'last90Days': '最近90天',
    'lastYear': '最近一年',
    'categoryStats': '分类统计',
    'popularPrompts': '热门提示词',
    'usagePattern': '使用模式',
    'hourlyUsage': '每小时使用量',
    'dailyUsage': '每日使用量',
    'monthlyUsage': '每月使用量',
    'uses': '次使用',
    'minimalist': '极简',
    
    // InviteTab 邀请页面
    'inviteTitle': '邀请推广',
    'inviteDescription': '邀请好友注册，赚取丰厚奖励',
    'inviteLoading': '加载邀请数据中...',
    'inviteCode': '邀请码',
    'inviteCopyCode': '复制邀请码',
    'inviteCopied': '已复制',
    'inviteShare': '分享邀请',
    'inviteTotalInvites': '总邀请数',
    'inviteSuccessfulInvites': '成功邀请',
    'inviteTotalEarnings': '总收益',
    'inviteMonthlyEarnings': '本月收益',
    'inviteRate': '成功率',
    'inviteRecords': '邀请记录',
    'inviteStatusActive': '活跃用户',
    'inviteStatusRegistered': '已注册',
    'inviteStatusPending': '待激活',
    'inviteStatusUnknown': '未知',
    'inviteFilterAll': '全部',
    'inviteTime': '邀请时间',
    'inviteNoData': '暂无邀请记录',
    'inviteInviteLink': '邀请链接',
    'inviteShareTitle': '加入AIICG',
    'inviteShareText': '使用我的邀请码注册，获得专属福利！',
    'inviteFilterPending': '待激活',
    'inviteFilterRegistered': '已注册',
    'inviteFilterActive': '活跃',
    'inviteCommissionEarnings': '佣金收益',
    'inviteRegistrationTime': '注册时间',
    'inviteNoInviteRecords': '暂无邀请记录',
    'inviteMonthlyTrend': '月度邀请趋势',
    
    // AchievementsTab 成就页面 - 重构为层级结构
    achievements: {
      title: '成就系统',
      description: '解锁成就，获得奖励和荣誉',
      loading: '加载成就数据中...',
      noAchievements: '暂无成就',
      noAchievementsDesc: '开始使用AI生成壁纸来解锁成就',
      level: '等级',
      continueUnlock: '继续解锁成就提升等级',
      totalXP: '总经验值',
      nextLevelNeed: '距离下一级还需',
      experiencePoints: '经验值',
      category: '分类',
      rarity: '稀有度',
      filterAll: '全部',
      filterGeneration: '生成',
      filterSocial: '社交',
      filterExploration: '探索',
      filterMastery: '精通',
      filterSpecial: '特殊',
      rarityCommon: '普通',
      rarityRare: '稀有',
      rarityEpic: '史诗',
      rarityLegendary: '传说',
      completion: '完成',
      recentUnlocks: '最近解锁',
      progress: '进度',
      unlockedAt: '解锁时间',
      
      // 成就数据
      data: {
        firstGeneration: {
          title: '初次创作',
          description: '生成第一张AI壁纸'
        },
        generationMaster: {
          title: '生成大师',
          description: '生成100张AI壁纸'
        },
        speedDemon: {
          title: '速度恶魔',
          description: '在1小时内生成10张壁纸'
        },
        creativeGenius: {
          title: '创意天才',
          description: '生成1000张AI壁纸'
        },
        firstLike: {
          title: '初次点赞',
          description: '获得第一个点赞'
        },
        popularCreator: {
          title: '人气创作者',
          description: '获得100个点赞'
        },
        viralSensation: {
          title: '病毒传播',
          description: '单张壁纸获得1000次分享'
        },
        communityLeader: {
          title: '社区领袖',
          description: '邀请50个好友注册'
        },
        styleExplorer: {
          title: '风格探索者',
          description: '尝试所有预设风格'
        }
      }
    },
    
    // SettingsTab 设置页面 - 重构为层级结构
    profileSettings: {
      title: '账户设置',
      description: '管理您的个人信息和偏好设置',
      saving: '保存中...',
      saveSettings: '保存设置',
      profileInfo: '个人信息',
      username: '用户名',
      email: '邮箱地址',
      timezone: '时区',
      timezoneChina: '中国标准时间 (UTC+8)',
      timezoneNewYork: '美国东部时间 (UTC-5)',
      timezoneLondon: '格林威治时间 (UTC+0)',
      timezoneTokyo: '日本标准时间 (UTC+9)',
      notifications: '通知设置',
      emailNotifications: '邮件通知',
      emailNotificationsDesc: '接收重要更新和活动通知',
      pushNotifications: '推送通知',
      pushNotificationsDesc: '接收实时推送通知',
      marketingEmails: '营销邮件',
      marketingEmailsDesc: '接收产品更新和优惠信息',
      privacySettings: '隐私设置',
      profileVisibility: '个人资料可见性',
      public: '公开',
      private: '私密',
      showEmail: '显示邮箱地址',
      showEmailDesc: '允许其他用户查看您的邮箱',
      showStats: '显示使用统计',
      showStatsDesc: '允许其他用户查看您的使用数据',
      appearanceSettings: '外观设置',
      themeMode: '主题模式',
      themeModeDesc: '选择您喜欢的主题外观',
      languageSettings: '语言设置',
      languageSettingsDesc: '选择您的首选语言',
      dangerZone: '危险操作',
      exportData: '导出数据',
      exportDataDesc: '下载您的所有数据备份',
      export: '导出',
      deleteAccount: '删除账户',
      deleteAccountDesc: '永久删除您的账户和所有数据',
      deleteAccountButton: '删除账户'
    },
    
    // NotificationPanel 通知中心 - 国际化
    notificationPanel: {
      title: '通知中心',
      totalCount: '条通知',
      unreadCount: '条未读',
      markAllRead: '全部已读',
      filters: {
        all: '全部',
        unread: '未读',
        starred: '收藏'
      },
      empty: {
        noNotifications: '暂无通知',
        noNotificationsDesc: '新的通知会在这里显示',
        noSearchResults: '没有找到相关通知',
        noSearchResultsDesc: '尝试调整搜索条件'
      },
      actions: {
        markRead: '标记已读',
        star: '收藏',
        unstar: '取消收藏',
        delete: '删除通知',
        viewDetails: '查看详情'
      },
      priority: {
        high: '高优先级',
        urgent: '紧急'
      },
      types: {
        system: '系统通知',
        announcement: '公告',
        update: '更新通知',
        achievement: '成就通知',
        message: '消息',
        warning: '警告',
        promotion: '推广'
      }
    },

    // BillingTab 账单页面 - 重构为层级结构
    billing: {
      title: '账单管理',
      description: '管理您的订阅和支付信息',
      balance: '余额',
      loading: '加载账单信息中...',
      noBillingInfo: '暂无账单信息',
      noBillingInfoDesc: '开始使用付费功能来查看账单',
      currentPlan: '当前计划',
      currentPlanDesc: '您当前使用的订阅计划',
      currentPlanLabel: '当前计划',
      nextBilling: '下次账单',
      upgradeToPro: '升级到专业版',
      usage: '使用情况',
      used: '已使用',
      remaining: '剩余',
      monthlyLimit: '月度限额',
      usageProgress: '使用进度',
      availablePlans: '可用计划',
      mostPopular: '最受欢迎',
      month: '月',
      year: '年',
      selectPlan: '选择计划',
      transactionHistory: '交易记录',
      completed: '已完成',
      pending: '处理中',
      failed: '失败',
      refunded: '已退款',
      upgradeTo: '升级到',
      upgradeDesc: '您即将升级到新的订阅计划。升级后您将立即获得所有新功能。',
      cancel: '取消',
      confirmUpgrade: '确认升级'
    },

    // 登录注册页面
    'backToHome': '返回首页',
    'appName': 'AIICG壁纸站',
    'loginToAccount': '登录您的账户',
    'createAccount': '创建您的账户',
    'usernameOrEmail': '用户名或邮箱',
    'enterUsernameOrEmail': '请输入用户名或邮箱',
    'username': '用户名',
    'enterUsername': '请输入用户名',
    'email': '邮箱地址',
    'enterEmail': '请输入邮箱地址',
    'password': '密码',
    'enterPassword': '请输入密码',
    'confirmPassword': '确认密码',
    'enterConfirmPassword': '请再次输入密码',
    'captcha': '验证码',
    'remainingAttempts': '剩余尝试次数',
    'enterAnswer': '请输入答案',
    'loggingIn': '登录中...',
    'registering': '注册中...',
    'or': '或',
    'createNewAccount': '创建新账户',
    'loginExistingAccount': '登录现有账户',
    'emailVerificationCode': '邮箱验证码',
    'enterVerificationCode': '请输入6位验证码',
    'sendCode': '发送',
    'register': '注册账户',

    // 404页面
    'notFound': {
      'title': '在壁纸的海洋中迷路了？',
      'description': '看起来您要寻找的页面在我们的壁纸画廊中走丢了。不过别担心，让我们帮您找到正确的方向！',
      'exploreHome': '探索首页',
      'exploreHomeDesc': '发现最新的AI壁纸作品',
      'browseWallpapers': '浏览壁纸',
      'browseWallpapersDesc': '查看精美的壁纸收藏',
      'generateWallpaper': 'AI生成',
      'generateWallpaperDesc': '创造您的专属壁纸',
      'searchTip': '提示：您也可以使用导航栏的搜索功能快速找到想要的内容',
      'brandSlogan': '让每一面墙都有故事'
    },

    // 主题
    theme: {
      title: '主题',
      current: '当前',
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
    },

    // 分类页面
    categories: {
      wallpaper: {
        name: '壁纸',
        description: '精选高质量壁纸，为您的设备增添美感'
      },
      avatar: {
        name: '头像',
        description: '个性化头像，展现独特魅力'
      },
      animation: {
        name: '动画',
        description: '动态壁纸，让您的设备更加生动'
      }
    },
    subcategories: {
      'ai-generated': 'AI生成',
      'avatar': '头像',
      'animation': '动画',
      'nature': '自然',
      'abstract': '抽象',
      'minimal': '极简',
      'cartoon': '卡通',
      'realistic': '写实',
      'anime': '动漫'
    },
    filters: {
      resolution: '分辨率',
      orientation: '方向',
      style: '风格',
      color: '颜色',
      mood: '情绪',
      type: '类型'
    },
    filterOptions: {
      horizontal: '横向',
      vertical: '纵向',
      square: '方形',
      modern: '现代',
      vintage: '复古',
      artistic: '艺术',
      cute: '可爱',
      cool: '酷炫',
      elegant: '优雅',
      bright: '明亮',
      dark: '暗色',
      colorful: '彩色',
      monochrome: '单色'
    },
    sort: {
      latest: '最新',
      popular: '热门',
      downloads: '下载量',
      rating: '评分'
    },
    categoryPage: {
      subcategories: '子分类',
      all: '全部',
      filters: '筛选',
      sortBy: '排序方式',
      viewMode: '视图模式',
      results: '项结果',
      totalResults: '共 {count} 项结果',
      noContent: '暂无内容',
      noContentDesc: '尝试调整筛选条件',
      retry: '重试',
      previousPage: '上一页',
      nextPage: '下一页',
      pageInfo: '第 {page} 页',
      download: '下载',
      close: '关闭',
      imageInfo: '精美壁纸',
      resolution: '{width} × {height}',
      beautifulContent: '精美内容',
      pages: '页面',
      freeDownload: '免费下载',
      categoryNotFound: '分类未找到',
      searchPlaceholder: '搜索壁纸...',
      clearAll: '清除全部'
    }
  },
  'en': {
    pages: {
      admin: {
        dashboard: {
          title: '🛠️ Admin Dashboard',
          welcome: 'Welcome back',
          systemStatus: 'System Status',
          statusHealthy: 'Healthy',
          statusWarning: 'Warning',
          statusError: 'Error',
          stats: {
            totalUsers: 'Total Users',
            totalWallpapers: 'Total Wallpapers',
            todayGenerations: 'Today Generated',
            storageUsed: 'Storage Used',
            previousMonth: 'vs last month',
            previousWeek: 'vs last week',
            previousDay: 'vs yesterday'
          },
          charts: {
            generationTrend: 'Generation Trend',
            generationTrendSubtitle: 'Wallpaper generation in the last 7 days',
            categoryDistribution: 'Category Distribution',
            categoryDistributionSubtitle: 'Wallpaper category statistics',
            days7: '7 Days',
            days30: '30 Days',
            days90: '90 Days'
          },
          access: {
            restrictedTitle: 'Access Restricted',
            restrictedMessage: 'Super admin privileges required to access this page',
            backToHome: 'Back to Home'
          },
          categories: {
            technology: 'Technology',
            others: 'Others'
          }
        },
        users: {
          title: 'Users',
          empty: 'No users',
          columns: {
            username: 'Username',
            email: 'Email',
            role: 'Role',
            createdAt: 'Created At',
            actions: 'Actions'
          },
          searchPlaceholder: 'Search users (username/email)...',
          roles: {
            all: 'All',
            user: 'User',
            admin: 'Admin',
            superAdmin: 'Super Admin'
          },
          actions: {
            apply: 'Apply Filters',
            batchRoleChange: 'Batch Role Change',
            batchDelete: 'Batch Delete',
            setToUser: 'Set as User',
            setToAdmin: 'Set as Admin',
            setToSuperAdmin: 'Set as Super Admin',
            selectedCount: '{count} users selected',
            confirmBatchDelete: 'Are you sure you want to delete {count} users? This action cannot be undone.',
            confirmBatchRoleChange: 'Are you sure you want to change the role of {count} users to {role}?',
            batchDeleteFailed: 'Batch deletion failed',
            batchRoleChangeFailed: 'Batch role change failed'
          }
        },
        wallpapers: {
          title: 'Wallpapers',
          actions: {
            upload: 'Upload',
            importUrl: 'Import URL',
            edit: 'Edit',
            publish: 'Publish',
            unpublish: 'Unpublish'
          },
          filters: {
            visibility: 'Visibility',
            all: 'All',
            public: 'Public',
            private: 'Private'
          },
          fields: {
            title: 'Title',
            category: 'Category',
            tags: 'Tags (comma separated)',
            imageUrl: 'Image URL'
          }
        },
        settings: {
          title: 'Settings',
          provider: 'Image Provider',
          rateLimit: 'Rate Limit',
          saved: 'Saved'
        },
        audit: {
          title: 'Audit & Logs',
          empty: 'No logs'
        },
        notifications: {
          title: 'Notification Management',
          listTitle: 'Published Notifications',
          empty: 'No notifications',
          actions: {
            create: 'Publish',
            submitting: 'Publishing...'
          },
          fields: {
            type: 'Type',
            priority: 'Priority',
            title: 'Title',
            content: 'Content',
            summary: 'Summary',
            icon: 'Icon',
            image: 'Image',
            actionURL: 'Action URL',
            actionText: 'Action Text',
            expiresAt: 'Expires At',
            metadata: 'Metadata (JSON)'
          },
          placeholders: {
            title: 'Enter title',
            content: 'Enter content'
          },
          priority: {
            low: 'Low',
            normal: 'Normal',
            high: 'High',
            urgent: 'Urgent'
          },
          type: {
            system: 'System',
            announcement: 'Announcement',
            update: 'Update',
            achievement: 'Achievement',
            message: 'Message',
            warning: 'Warning',
            promotion: 'Promotion'
          },
          pagination: {
            prev: 'Prev',
            next: 'Next',
            page: 'Page'
          },
          errors: {
            invalidMetadata: 'Metadata must be valid JSON',
            unauthorized: 'Unauthorized',
            forbidden: 'Forbidden',
            createFailed: 'Failed to publish'
          }
        }
      }
    },
    // 导航栏
    'homeNav': 'Home',
    'generate': 'AI Generate',
    'profile': 'Profile',
    'login': 'Sign In',
    'logout': 'Logout',
    'loginRegister': 'Sign In',
    'optional': 'optional',

    // 侧边栏导航
    'explore': 'Explore',
    nav: {
      admin: {
        dashboard: 'Console',
        notifications: 'Notifications'
      }
    },
    'create': 'Create',
    'material': 'Material',
    'compress': 'Compress',
    'notifications': 'Notifications',
    'user': 'User',
    'settings': 'Settings',

    // 设置菜单
    'menuResources': 'Resources',
    'menuLanguage': 'Language',
    'termsOfService': 'Terms of Service',
    'privacyPolicy': 'Privacy Policy',
    'communityGuidelines': 'Community Guidelines',
    'userSafetyGuide': 'User Safety Guide',
    'cookiePolicy': 'Cookie Policy',

    // 通用状态
    'common.loading': 'Loading...',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.download': 'Download',
    'common.view': 'View',
    'common.share': 'Share',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.save': 'Save',
    'common.back': 'Back',

    // 错误和状态信息
    'errors.loadFailed': 'Load Failed',
    'errors.notFound': 'Content Not Found',
    'errors.networkError': 'Network Error',
    'status.uploading': 'Uploading...',
    'status.processing': 'Processing...',
    'status.completed': 'Completed',

    // 分类页面
    'categories.wallpaper.name': 'Wallpaper',
    'categories.wallpaper.description': 'Beautiful wallpaper collection, including AI-generated, animation effects, and avatar materials',
    'categories.avatar.name': 'Avatar',
    'categories.avatar.description': 'Personalized avatars and character images, creating unique identities',
    'categories.animation.name': 'Animation',
    'categories.animation.description': 'Dynamic images and GIF animation effect materials',

    // 子分类
    'subcategories.ai-generated': 'AI Wallpapers',
    'subcategories.avatar': 'Avatar Materials',
    'subcategories.animation': 'Animation Effects',
    'subcategories.nature': 'Nature',
    'subcategories.abstract': 'Abstract Art',
    'subcategories.minimal': 'Minimalist Style',
    'subcategories.cartoon': 'Cartoon Avatars',
    'subcategories.realistic': 'Realistic Avatars',
    'subcategories.anime': 'Anime Style',

    // 筛选器
    'filters.resolution': 'Resolution',
    'filters.orientation': 'Orientation',
    'filters.style': 'Style',
    'filters.color': 'Color',
    'filters.mood': 'Mood',
    'filters.type': 'Type',

    // 筛选选项
    'filterOptions.horizontal': 'Horizontal',
    'filterOptions.vertical': 'Vertical',
    'filterOptions.square': 'Square',
    'filterOptions.modern': 'Modern',
    'filterOptions.vintage': 'Vintage',
    'filterOptions.artistic': 'Artistic',
    'filterOptions.cute': 'Cute',
    'filterOptions.cool': 'Cool',
    'filterOptions.elegant': 'Elegant',
    'filterOptions.bright': 'Bright',
    'filterOptions.dark': 'Dark',
    'filterOptions.colorful': 'Colorful',
    'filterOptions.monochrome': 'Monochrome',

    // 视图和操作
    'views.grid': 'Grid View',
    'views.waterfall': 'Waterfall View',
    'actions.filter': 'Filter',
    'actions.sort': 'Sort',
    'actions.viewDetails': 'View Details',
    'actions.zoomIn': 'Zoom In',
    'actions.zoomOut': 'Zoom Out',

    // 排序选项
    'sort.latest': 'Latest Uploads',
    'sort.popular': 'Most Popular',
    'sort.downloads': 'Most Downloads',
    'sort.rating': 'Highest Rating',

    // 状态信息
    'status.downloading': 'Downloading...',

    // 壁纸详情页
    'wallpaper.details': 'Wallpaper Details',
    'wallpaper.notFound': 'Wallpaper Not Found',
    'wallpaper.loadFailed': 'Load Failed',
    'wallpaper.relatedFailed': 'Failed to get related wallpapers',
    'wallpaper.generateSimilar': 'Generate Similar Wallpaper',
    'wallpaper.similarStyle': 'Beautiful wallpapers with similar styles',
    'wallpaper.shareText': 'View this beautiful AI-generated wallpaper',
    'wallpaper.techInfo': 'Technical Information',
    'wallpaper.relatedRecommend': 'Related Recommendations',
    'wallpaper.backToHome': 'Back to Home',
    'wallpaper.author': 'Author',
    'wallpaper.uploadTime': 'Upload Time',
    'wallpaper.views': 'Views',
    'wallpaper.downloads': 'Downloads',
    'wallpaper.resolution': 'Resolution',
    'wallpaper.size': 'File Size',
    'wallpaper.format': 'Format',
    'wallpaper.tags': 'Tags',

    // 操作按钮
    'actions.like': 'Like',
    'actions.follow': 'Follow',
    'actions.following': 'Following',

    // 个人中心页面
    'profileTitle': 'Profile',
    'profileSubtitle': 'Manage your account, view data statistics, invite friends to earn rewards',
    'loadingCenter': 'Loading profile...',
    'loadFailed': 'Load Failed',
    'loadUserDataFailed': 'Failed to load user data',
    'retry': 'Retry',
    'functionNav': 'Function Navigation',
    'overview': 'Overview',
    'overviewDesc': 'Account Overview',
    'stats': 'Data Statistics',
    'statsDesc': 'Usage Data Analysis',
    'invite': 'Invite Promotion',
    'inviteDesc': 'Invite friends to earn money',
    'achievementsNav': 'Achievement System',
    'achievementsDesc': 'Unlock achievement rewards',
    'accountSettings': 'Account Settings',
    'accountSettingsDesc': 'Personal Information Settings',
    'billingNav': 'Billing Management',
    'billingDesc': 'Consumption Record Management',
    'formatMinutes': 'Minutes',
    'formatHours': 'Hours',
    
    // 概览页面
    'overviewTitle': 'Account Overview',
    'overviewDescription': 'View your usage statistics and achievements',
    'achievementsCount': 'achievements',
    'todayGenerated': 'Today Generated',
    'aiImages': 'AI Images',
    'todayDownloads': 'Today Downloads',
    'imageDownloads': 'Image Downloads',
    'usageTime': 'Usage Time',
    'todayUsage': 'Today Usage',
    'totalSpent': 'Total Spent',
    'cumulativeSpent': 'Cumulative Spent',
    'weeklyTrend': 'Weekly Usage Trend',
    'categoryPreferences': 'Category Preferences',
    'landscape': 'Landscape',
    'portrait': 'Portrait',
    'abstract': 'Abstract',
    'anime': 'Anime',
    'realistic': 'Realistic',
    'images': 'images',
    'timeDistribution': 'Time Distribution',
    'morning': 'Morning (6-12)',
    'afternoon': 'Afternoon (12-18)',
    'evening': 'Evening (18-24)',
    'night': 'Night (0-6)',
    'achievementSystem': 'Achievement System',
    'progress': 'Progress',
    'reward': 'Reward',
    'loadOverviewFailed': 'Failed to load overview data',
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun',
    
    // 统计页面
    'statsTitle': 'Statistics',
    'statsDescription': 'Deep insights into your usage patterns and trends',
    'loadingStats': 'Loading statistics...',
    'noStatsData': 'No Data',
    'noStatsDescription': 'Start using AI wallpaper generation to view statistics',
    'loadStatsFailed': 'Failed to load statistics',
    'generatedCount': 'Generated',
    'downloadsCount': 'Downloads',
    'viewsCount': 'Views',
    'totalGenerated': 'Total Generated',
    'totalDownloads': 'Total Downloads',
    'totalViews': 'Total Views',
    'totalLikes': 'Total Likes',
    'totalShares': 'Total Shares',
    'totalTime': 'Total Time',
    'trendAnalysis': 'Trend Analysis',
    'last7Days': 'Last 7 Days',
    'last30Days': 'Last 30 Days',
    'last90Days': 'Last 90 Days',
    'lastYear': 'Last Year',
    'categoryStats': 'Category Statistics',
    'popularPrompts': 'Popular Prompts',
    'usagePattern': 'Usage Pattern',
    'hourlyUsage': 'Hourly Usage',
    'dailyUsage': 'Daily Usage',
    'monthlyUsage': 'Monthly Usage',
    'uses': 'uses',
    'minimalist': 'Minimalist',
    
    // InviteTab 邀请页面
    'invite.title': 'Invite & Earn',
    'invite.description': 'Invite friends to register and earn generous rewards',
    'invite.loading': 'Loading invite data...',
    'invite.code': 'Invite Code',
    'invite.copyCode': 'Copy Invite Code',
    'invite.copied': 'Copied',
    'invite.share': 'Share Invite',
    'invite.totalInvites': 'Total Invites',
    'invite.successfulInvites': 'Successful Invites',
    'invite.totalEarnings': 'Total Earnings',
    'invite.monthlyEarnings': 'Monthly Earnings',
    'invite.rate': 'Success Rate',
    'invite.records': 'Invite Records',
    'invite.statusActive': 'Active User',
    'invite.statusRegistered': 'Registered',
    'invite.statusPending': 'Pending',
    'invite.statusUnknown': 'Unknown',
    'invite.filterAll': 'All',
    'invite.time': 'Invite Time',
    'invite.noData': 'No invite records',

    // AchievementsTab 成就页面 - 重构为层级结构
    achievements: {
      title: 'Achievement System',
      description: 'Unlock achievements and earn rewards',
      loading: 'Loading achievement data...',
      noAchievements: 'No achievements',
      noAchievementsDesc: 'Start using AI wallpaper generation to unlock achievements',
      level: 'Level',
      continueUnlock: 'Continue unlocking achievements to level up',
      totalXP: 'Total XP',
      nextLevelNeed: 'XP needed for next level',
      experiencePoints: 'Experience Points',
      category: 'Category',
      rarity: 'Rarity',
      filterAll: 'All',
      filterGeneration: 'Generation',
      filterSocial: 'Social',
      filterExploration: 'Exploration',
      filterMastery: 'Mastery',
      filterSpecial: 'Special',
      rarityCommon: 'Common',
      rarityRare: 'Rare',
      rarityEpic: 'Epic',
      rarityLegendary: 'Legendary',
      completion: 'Completion',
      recentUnlocks: 'Recent Unlocks',
      progress: 'Progress',
      unlockedAt: 'Unlocked At',
      
      // 成就数据
      data: {
        firstGeneration: {
          title: 'First Creation',
          description: 'Generate your first AI wallpaper'
        },
        generationMaster: {
          title: 'Generation Master',
          description: 'Generate 100 AI wallpapers'
        },
        speedDemon: {
          title: 'Speed Demon',
          description: 'Generate 10 wallpapers within 1 hour'
        },
        creativeGenius: {
          title: 'Creative Genius',
          description: 'Generate 1000 AI wallpapers'
        },
        firstLike: {
          title: 'First Like',
          description: 'Receive your first like'
        },
        popularCreator: {
          title: 'Popular Creator',
          description: 'Receive 100 likes'
        },
        viralSensation: {
          title: 'Viral Sensation',
          description: 'Single wallpaper gets 1000 shares'
        },
        communityLeader: {
          title: 'Community Leader',
          description: 'Invite 50 friends to register'
        },
        styleExplorer: {
          title: 'Style Explorer',
          description: 'Try all preset styles'
        }
      }
    },

    // SettingsTab 设置页面 - 重构为层级结构
    profileSettings: {
      title: 'Account Settings',
      description: 'Manage your personal information and preferences',
      saving: 'Saving...',
      saveSettings: 'Save Settings',
      profileInfo: 'Profile Information',
      username: 'Username',
      email: 'Email Address',
      timezone: 'Timezone',
      timezoneChina: 'China Standard Time (UTC+8)',
      timezoneNewYork: 'Eastern Time (UTC-5)',
      timezoneLondon: 'Greenwich Time (UTC+0)',
      timezoneTokyo: 'Japan Standard Time (UTC+9)',
      notifications: 'Notification Settings',
      emailNotifications: 'Email Notifications',
      emailNotificationsDesc: 'Receive important updates and activity notifications',
      pushNotifications: 'Push Notifications',
      pushNotificationsDesc: 'Receive real-time push notifications',
      marketingEmails: 'Marketing Emails',
      marketingEmailsDesc: 'Receive product updates and promotional information',
      privacySettings: 'Privacy Settings',
      profileVisibility: 'Profile Visibility',
      public: 'Public',
      private: 'Private',
      showEmail: 'Show Email Address',
      showEmailDesc: 'Allow other users to view your email',
      showStats: 'Show Usage Statistics',
      showStatsDesc: 'Allow other users to view your usage data',
      appearanceSettings: 'Appearance Settings',
      themeMode: 'Theme Mode',
      themeModeDesc: 'Choose your preferred theme appearance',
      languageSettings: 'Language Settings',
      languageSettingsDesc: 'Choose your preferred language',
      dangerZone: 'Danger Zone',
      exportData: 'Export Data',
      exportDataDesc: 'Download all your data backup',
      export: 'Export',
      deleteAccount: 'Delete Account',
      deleteAccountDesc: 'Permanently delete your account and all data',
      deleteAccountButton: 'Delete Account'
    },

    // NotificationPanel 通知中心 - 国际化
    notificationPanel: {
      title: 'Notification Center',
      totalCount: 'notifications',
      unreadCount: 'unread',
      markAllRead: 'Mark All Read',
      filters: {
        all: 'All',
        unread: 'Unread',
        starred: 'Starred'
      },
      empty: {
        noNotifications: 'No notifications',
        noNotificationsDesc: 'New notifications will appear here',
        noSearchResults: 'No matching notifications found',
        noSearchResultsDesc: 'Try adjusting your search criteria'
      },
      actions: {
        markRead: 'Mark as read',
        star: 'Star',
        unstar: 'Unstar',
        delete: 'Delete notification',
        viewDetails: 'View details'
      },
      priority: {
        high: 'High Priority',
        urgent: 'Urgent'
      },
      types: {
        system: 'System Notification',
        announcement: 'Announcement',
        update: 'Update Notification',
        achievement: 'Achievement Notification',
        message: 'Message',
        warning: 'Warning',
        promotion: 'Promotion'
      }
    },

    // BillingTab 账单页面 - 重构为层级结构
    billing: {
      title: 'Billing Management',
      description: 'Manage your subscriptions and payment information',
      balance: 'Balance',
      loading: 'Loading billing information...',
      noBillingInfo: 'No billing information',
      noBillingInfoDesc: 'Start using paid features to view billing',
      currentPlan: 'Current Plan',
      currentPlanDesc: 'Your current subscription plan',
      currentPlanLabel: 'Current Plan',
      nextBilling: 'Next Billing',
      upgradeToPro: 'Upgrade to Pro',
      usage: 'Usage',
      used: 'Used',
      remaining: 'Remaining',
      monthlyLimit: 'Monthly Limit',
      usageProgress: 'Usage Progress',
      availablePlans: 'Available Plans',
      mostPopular: 'Most Popular',
      month: 'month',
      year: 'year',
      selectPlan: 'Select Plan',
      transactionHistory: 'Transaction History',
      completed: 'Completed',
      pending: 'Pending',
      failed: 'Failed',
      refunded: 'Refunded',
      upgradeTo: 'Upgrade to',
      upgradeDesc: 'You are about to upgrade to a new subscription plan. After upgrade, you will immediately get all new features.',
      cancel: 'Cancel',
      confirmUpgrade: 'Confirm Upgrade'
    },

    // 登录注册页面
    'backToHome': 'Back to Home',
    'appName': 'AIICG Wallpaper',
    'loginToAccount': 'Sign in to your account',
    'createAccount': 'Create your account',
    'usernameOrEmail': 'Username or Email',
    'enterUsernameOrEmail': 'Enter username or email',
    'username': 'Username',
    'enterUsername': 'Enter username',
    'email': 'Email Address',
    'enterEmail': 'Enter email address',
    'password': 'Password',
    'enterPassword': 'Enter password',
    'confirmPassword': 'Confirm Password',
    'enterConfirmPassword': 'Enter password again',
    'captcha': 'Captcha',
    'remainingAttempts': 'Remaining attempts',
    'enterAnswer': 'Enter answer',
    'loggingIn': 'Signing in...',
    'registering': 'Registering...',
    'or': 'or',
    'createNewAccount': 'Create new account',
    'loginExistingAccount': 'Sign in to existing account',
    'emailVerificationCode': 'Email Verification Code',
    'enterVerificationCode': 'Enter 6-digit code',
    'sendCode': 'Send',
    'register': 'Register',

    // 404页面
    'notFound': {
      'title': 'Lost in the Ocean of Wallpapers?',
      'description': 'It seems the page you\'re looking for got lost in our wallpaper gallery. Don\'t worry, let us help you find the right direction!',
      'exploreHome': 'Explore Home',
      'exploreHomeDesc': 'Discover the latest AI wallpaper works',
      'browseWallpapers': 'Browse Wallpapers',
      'browseWallpapersDesc': 'View beautiful wallpaper collections',
      'generateWallpaper': 'AI Generate',
      'generateWallpaperDesc': 'Create your exclusive wallpaper',
      'searchTip': 'Tip: You can also use the search function in the navigation bar to quickly find the content you want',
      'brandSlogan': 'Every wall has a story'
    },

    // 主题
    theme: {
      title: 'Theme',
      current: 'Current',
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
        languages: 'Chinese, English',
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
    },

    // 分类页面
    categories: {
      wallpaper: {
        name: 'Wallpapers',
        description: 'Curated high-quality wallpapers to enhance your device aesthetics'
      },
      avatar: {
        name: 'Avatars',
        description: 'Personalized avatars to showcase unique charm'
      },
      animation: {
        name: 'Animations',
        description: 'Dynamic wallpapers to make your device more vibrant'
      }
    },
    subcategories: {
      'ai-generated': 'AI Generated',
      'avatar': 'Avatar',
      'animation': 'Animation',
      'nature': 'Nature',
      'abstract': 'Abstract',
      'minimal': 'Minimal',
      'cartoon': 'Cartoon',
      'realistic': 'Realistic',
      'anime': 'Anime'
    },
    filters: {
      resolution: 'Resolution',
      orientation: 'Orientation',
      style: 'Style',
      color: 'Color',
      mood: 'Mood',
      type: 'Type'
    },
    filterOptions: {
      horizontal: 'Horizontal',
      vertical: 'Vertical',
      square: 'Square',
      modern: 'Modern',
      vintage: 'Vintage',
      artistic: 'Artistic',
      cute: 'Cute',
      cool: 'Cool',
      elegant: 'Elegant',
      bright: 'Bright',
      dark: 'Dark',
      colorful: 'Colorful',
      monochrome: 'Monochrome'
    },
    sort: {
      latest: 'Latest',
      popular: 'Popular',
      downloads: 'Downloads',
      rating: 'Rating'
    },
    categoryPage: {
      subcategories: 'Subcategories',
      all: 'All',
      filters: 'Filters',
      sortBy: 'Sort By',
      viewMode: 'View Mode',
      results: 'results',
      totalResults: '{count} total results',
      noContent: 'No content',
      noContentDesc: 'Try adjusting your filters',
      retry: 'Retry',
      previousPage: 'Previous',
      nextPage: 'Next',
      pageInfo: 'Page {page}',
      download: 'Download',
      close: 'Close',
      imageInfo: 'Beautiful Wallpaper',
      resolution: '{width} × {height}',
      beautifulContent: 'Beautiful Content',
      pages: 'Pages',
      freeDownload: 'Free Download',
      categoryNotFound: 'Category not found',
      searchPlaceholder: 'Search wallpapers...',
      clearAll: 'Clear All'
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