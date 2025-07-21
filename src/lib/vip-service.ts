/**
 * 统一VIP会员服务
 * 整合提示词优化、图片压缩、AI生成等功能的会员体系
 */

export interface VipFeatures {
  // 提示词优化
  promptOptimization: {
    dailyLimit: number; // -1表示无限制
    advancedAnalysis: boolean;
    batchOptimization: boolean;
    customTemplates: boolean;
  };
  
  // 图片压缩
  imageCompression: {
    aiCompression: boolean;
    batchProcessing: boolean;
    advancedFormats: boolean; // AVIF, WebP等
    customPresets: boolean;
    priorityProcessing: boolean;
  };
  
  // AI生成
  aiGeneration: {
    dailyLimit: number;
    highResolution: boolean;
    advancedModels: boolean;
    batchGeneration: boolean;
    commercialUse: boolean;
  };
  
  // 通用功能
  general: {
    adFree: boolean;
    prioritySupport: boolean;
    dataExport: boolean;
    apiAccess: boolean;
    cloudStorage: number; // GB
  };
}

export interface VipPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly' | 'lifetime';
  features: VipFeatures;
  popular?: boolean;
  description: string;
  badge?: string;
}

// VIP套餐配置
export const VIP_PLANS: VipPlan[] = [
  {
    id: 'free',
    name: '免费版',
    price: 0,
    period: 'monthly',
    description: '基础功能，适合轻度使用',
    features: {
      promptOptimization: {
        dailyLimit: 3,
        advancedAnalysis: false,
        batchOptimization: false,
        customTemplates: false,
      },
      imageCompression: {
        aiCompression: false,
        batchProcessing: false,
        advancedFormats: false,
        customPresets: false,
        priorityProcessing: false,
      },
      aiGeneration: {
        dailyLimit: 5,
        highResolution: false,
        advancedModels: false,
        batchGeneration: false,
        commercialUse: false,
      },
      general: {
        adFree: false,
        prioritySupport: false,
        dataExport: false,
        apiAccess: false,
        cloudStorage: 0,
      },
    },
  },
  {
    id: 'basic',
    name: '基础会员',
    price: 19.9,
    period: 'monthly',
    description: '适合个人创作者和设计师',
    features: {
      promptOptimization: {
        dailyLimit: 50,
        advancedAnalysis: true,
        batchOptimization: false,
        customTemplates: true,
      },
      imageCompression: {
        aiCompression: true,
        batchProcessing: false,
        advancedFormats: true,
        customPresets: true,
        priorityProcessing: false,
      },
      aiGeneration: {
        dailyLimit: 100,
        highResolution: true,
        advancedModels: false,
        batchGeneration: false,
        commercialUse: false,
      },
      general: {
        adFree: true,
        prioritySupport: false,
        dataExport: true,
        apiAccess: false,
        cloudStorage: 5,
      },
    },
  },
  {
    id: 'pro',
    name: '专业会员',
    price: 49.9,
    period: 'monthly',
    description: '适合专业设计师和小团队',
    popular: true,
    badge: '最受欢迎',
    features: {
      promptOptimization: {
        dailyLimit: -1,
        advancedAnalysis: true,
        batchOptimization: true,
        customTemplates: true,
      },
      imageCompression: {
        aiCompression: true,
        batchProcessing: true,
        advancedFormats: true,
        customPresets: true,
        priorityProcessing: true,
      },
      aiGeneration: {
        dailyLimit: 500,
        highResolution: true,
        advancedModels: true,
        batchGeneration: true,
        commercialUse: true,
      },
      general: {
        adFree: true,
        prioritySupport: true,
        dataExport: true,
        apiAccess: true,
        cloudStorage: 50,
      },
    },
  },
  {
    id: 'enterprise',
    name: '企业会员',
    price: 199.9,
    period: 'monthly',
    description: '适合大型团队和企业用户',
    badge: '企业首选',
    features: {
      promptOptimization: {
        dailyLimit: -1,
        advancedAnalysis: true,
        batchOptimization: true,
        customTemplates: true,
      },
      imageCompression: {
        aiCompression: true,
        batchProcessing: true,
        advancedFormats: true,
        customPresets: true,
        priorityProcessing: true,
      },
      aiGeneration: {
        dailyLimit: -1,
        highResolution: true,
        advancedModels: true,
        batchGeneration: true,
        commercialUse: true,
      },
      general: {
        adFree: true,
        prioritySupport: true,
        dataExport: true,
        apiAccess: true,
        cloudStorage: 500,
      },
    },
  },
];

// VIP服务类
export class VipService {
  /**
   * 获取用户的VIP计划
   */
  static getUserPlan(user: any): VipPlan {
    if (!user) {
      return VIP_PLANS[0]; // 免费版
    }
    
    if (user.vipPlan) {
      return VIP_PLANS.find(plan => plan.id === user.vipPlan) || VIP_PLANS[0];
    }
    
    // 兼容旧的isVip字段
    if (user.isVip) {
      return VIP_PLANS[2]; // 专业会员
    }
    
    return VIP_PLANS[0]; // 免费版
  }
  
  /**
   * 检查用户是否有某项功能权限
   */
  static hasFeature(user: any, feature: string, subFeature?: string): boolean {
    const plan = this.getUserPlan(user);
    
    if (subFeature) {
      return plan.features[feature as keyof VipFeatures]?.[subFeature as any] || false;
    }
    
    return !!plan.features[feature as keyof VipFeatures];
  }
  
  /**
   * 获取功能限制
   */
  static getFeatureLimit(user: any, feature: string, subFeature: string): number {
    const plan = this.getUserPlan(user);
    return plan.features[feature as keyof VipFeatures]?.[subFeature as any] || 0;
  }
  
  /**
   * 检查提示词优化权限
   */
  static canOptimizePrompt(user: any, dailyUsed: number): { 
    canUse: boolean; 
    limit: number; 
    isVip: boolean;
    needsUpgrade: boolean;
  } {
    const plan = this.getUserPlan(user);
    const limit = plan.features.promptOptimization.dailyLimit;
    const isVip = plan.id !== 'free';
    
    if (limit === -1) {
      return { canUse: true, limit: -1, isVip, needsUpgrade: false };
    }
    
    const canUse = dailyUsed < limit;
    const needsUpgrade = !canUse && !isVip;
    
    return { canUse, limit, isVip, needsUpgrade };
  }
  
  /**
   * 检查AI压缩权限
   */
  static canUseAiCompression(user: any): boolean {
    return this.hasFeature(user, 'imageCompression', 'aiCompression');
  }
  
  /**
   * 检查批量处理权限
   */
  static canUseBatchProcessing(user: any): boolean {
    return this.hasFeature(user, 'imageCompression', 'batchProcessing');
  }
  
  /**
   * 获取AI生成限制
   */
  static getGenerationLimit(user: any): number {
    return this.getFeatureLimit(user, 'aiGeneration', 'dailyLimit');
  }
  
  /**
   * 获取云存储限制
   */
  static getStorageLimit(user: any): number {
    return this.getFeatureLimit(user, 'general', 'cloudStorage');
  }
}

// 功能使用统计
export interface FeatureUsage {
  promptOptimization: {
    dailyCount: number;
    totalCount: number;
    lastUsed: string;
  };
  imageCompression: {
    dailyCount: number;
    totalCount: number;
    lastUsed: string;
  };
  aiGeneration: {
    dailyCount: number;
    totalCount: number;
    lastUsed: string;
  };
}

// 使用统计管理
export class UsageTracker {
  /**
   * 更新功能使用统计
   */
  static async updateUsage(
    userId: string, 
    feature: keyof FeatureUsage, 
    increment: number = 1
  ): Promise<void> {
    // 这里应该更新数据库中的使用统计
    // 简化实现，实际应该持久化到数据库
    console.log(`更新用户 ${userId} 的 ${feature} 使用统计: +${increment}`);
  }
  
  /**
   * 获取今日使用统计
   */
  static async getTodayUsage(userId: string, feature: keyof FeatureUsage): Promise<number> {
    // 这里应该从数据库获取今日使用统计
    // 简化实现，返回模拟数据
    return 0;
  }
  
  /**
   * 重置每日统计
   */
  static async resetDailyUsage(): Promise<void> {
    // 这里应该重置所有用户的每日使用统计
    console.log('重置每日使用统计');
  }
}
