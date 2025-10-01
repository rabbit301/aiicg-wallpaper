/**
 * Augment 项目开发规范读取器
 * 用于在AI生成过程中自动读取和应用项目规范
 */

export interface ProjectRules {
  internationalization: {
    supportedLanguages: string[];
    requirements: string[];
  };
  design: {
    principles: string[];
    colorSystem: Record<string, string>;
    fontSystem: Record<string, string>;
    spacingSystem: Record<string, string>;
    radiusSystem: Record<string, string>;
  };
  technical: {
    frontend: string[];
    backend: string[];
    codeQuality: string[];
  };
  userExperience: {
    principles: string[];
    performance: Record<string, string>;
  };
  security: {
    frontend: string[];
    backend: string[];
  };
}

/**
 * 项目开发规范配置
 */
export const PROJECT_RULES: ProjectRules = {
  internationalization: {
    supportedLanguages: ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'],
    requirements: [
      '所有用户界面文本必须通过i18n系统管理',
      '用户可以实时切换语言，无需刷新页面',
      '日期、时间、数字格式根据语言环境自动调整',
      '支持多语言URL和meta标签',
      '禁止硬编码文本，必须使用 t() 函数'
    ]
  },
  design: {
    principles: [
      '参考Apple、Google、Microsoft、Figma、Linear等顶级网站',
      '统一的设计系统：颜色、字体、间距、圆角、阴影',
      '完美适配桌面、平板、手机所有设备',
      '流畅的过渡动画和微交互',
      '支持键盘导航、屏幕阅读器、高对比度'
    ],
    colorSystem: {
      primary: '#3B82F6',
      secondary: '#64748B',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    },
    fontSystem: {
      sans: "'Inter', 'SF Pro Display', system-ui",
      mono: "'JetBrains Mono', 'SF Mono', monospace"
    },
    spacingSystem: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    radiusSystem: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem'
    }
  },
  technical: {
    frontend: [
      'Next.js 14+ (App Router)',
      'Tailwind CSS + CSS Variables',
      'React Context + Custom Hooks',
      'TypeScript 严格模式',
      'Lucide React (统一图标库)',
      'Framer Motion (复杂动画)'
    ],
    backend: [
      'Go 1.21+',
      'Gin + GORM',
      'PostgreSQL + Redis',
      'JWT + Refresh Token',
      'RESTful + 统一响应格式'
    ],
    codeQuality: [
      '必须定义清晰的Props接口',
      '组件结构：Hooks -> 状态 -> 副作用 -> 事件处理 -> 渲染',
      'ESLint + Prettier + Go fmt',
      '单元测试覆盖率 > 80%'
    ]
  },
  userExperience: {
    principles: [
      '直观性：用户无需学习即可使用',
      '一致性：相同功能在不同页面表现一致',
      '反馈性：每个操作都有明确的视觉反馈',
      '容错性：优雅处理错误，提供恢复方案',
      '效率性：减少用户操作步骤，提高效率'
    ],
    performance: {
      firstLoad: '< 2秒',
      pageTransition: '< 500ms',
      apiResponse: '< 1秒',
      imageOptimization: 'WebP格式 + 懒加载',
      codeSplitting: '按路由和组件分割'
    }
  },
  security: {
    frontend: [
      'XSS防护：所有用户输入必须转义',
      'CSRF防护：API请求包含CSRF Token',
      '敏感信息：不在前端存储敏感数据',
      '权限控制：基于角色的UI显示控制'
    ],
    backend: [
      '输入验证：所有API输入严格验证',
      'SQL注入：使用参数化查询',
      '权限验证：每个API端点验证用户权限',
      '数据加密：敏感数据加密存储'
    ]
  }
};

/**
 * 获取项目规范摘要
 */
export function getProjectRulesSummary(): string {
  return `
# Augment 项目开发规范摘要

## 🌍 国际化要求
- 支持语言: ${PROJECT_RULES.internationalization.supportedLanguages.join(', ')}
- 核心要求: ${PROJECT_RULES.internationalization.requirements.join('; ')}

## 🎨 设计标准
- 设计理念: ${PROJECT_RULES.design.principles.join('; ')}
- 主色调: ${PROJECT_RULES.design.colorSystem.primary}
- 字体系统: ${PROJECT_RULES.design.fontSystem.sans}

## 🏗️ 技术栈
- 前端: ${PROJECT_RULES.technical.frontend.join(', ')}
- 后端: ${PROJECT_RULES.technical.backend.join(', ')}

## 📱 用户体验
- 核心原则: ${PROJECT_RULES.userExperience.principles.join('; ')}
- 性能要求: 首屏${PROJECT_RULES.userExperience.performance.firstLoad}, 切换${PROJECT_RULES.userExperience.performance.pageTransition}

## 🔒 安全要求
- 前端安全: ${PROJECT_RULES.security.frontend.join('; ')}
- 后端安全: ${PROJECT_RULES.security.backend.join('; ')}

## 🎯 核心目标
打造世界级的AI壁纸生成平台，在技术实现、用户体验、视觉设计等各方面都达到国际顶尖水准。
`;
}

/**
 * 验证组件是否符合项目规范
 */
export function validateComponent(componentCode: string): {
  isValid: boolean;
  violations: string[];
  suggestions: string[];
} {
  const violations: string[] = [];
  const suggestions: string[] = [];

  // 检查国际化
  if (componentCode.includes('"') && !componentCode.includes('t(')) {
    violations.push('发现硬编码文本，应使用 t() 函数进行国际化');
    suggestions.push('将硬编码文本替换为 t("key") 形式');
  }

  // 检查TypeScript接口
  if (componentCode.includes('function') && !componentCode.includes('interface')) {
    violations.push('组件缺少Props接口定义');
    suggestions.push('为组件定义清晰的Props接口');
  }

  // 检查样式规范
  if (componentCode.includes('className') && !componentCode.includes('transition')) {
    suggestions.push('考虑添加过渡动画效果');
  }

  return {
    isValid: violations.length === 0,
    violations,
    suggestions
  };
}

/**
 * 生成符合规范的组件模板
 */
export function generateComponentTemplate(componentName: string): string {
  return `'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface ${componentName}Props {
  // 定义清晰的Props接口
}

export default function ${componentName}({ ...props }: ${componentName}Props) {
  const { t } = useLanguage();

  return (
    <div className="组件根容器样式 transition-all duration-200">
      <h1>{t('${componentName.toLowerCase()}.title')}</h1>
      {/* 组件内容 */}
    </div>
  );
}`;
}

/**
 * 获取设计系统CSS变量
 */
export function getDesignSystemCSS(): string {
  const { colorSystem, fontSystem, spacingSystem, radiusSystem } = PROJECT_RULES.design;
  
  return `
:root {
  /* 颜色系统 */
  ${Object.entries(colorSystem).map(([key, value]) => `--color-${key}: ${value};`).join('\n  ')}
  
  /* 字体系统 */
  ${Object.entries(fontSystem).map(([key, value]) => `--font-${key}: ${value};`).join('\n  ')}
  
  /* 间距系统 */
  ${Object.entries(spacingSystem).map(([key, value]) => `--spacing-${key}: ${value};`).join('\n  ')}
  
  /* 圆角系统 */
  ${Object.entries(radiusSystem).map(([key, value]) => `--radius-${key}: ${value};`).join('\n  ')}
}`;
}`;
}

export default PROJECT_RULES;
