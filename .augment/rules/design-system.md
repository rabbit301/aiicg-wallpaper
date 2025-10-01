---
type: manual
description: "设计系统规范 - 手动应用于UI/UX相关开发"
---

# AIICG 设计系统规范

## 🎨 设计理念
参考世界顶级产品的设计语言：
- **Apple**: 简洁、优雅、直观
- **Google Material**: 层次感、动效、一致性
- **Microsoft Fluent**: 现代、流畅、包容性
- **Linear**: 极简、高效、专业
- **Figma**: 协作、创新、用户友好

## 🌈 颜色系统

### 主色调
```css
:root {
  /* 主色 - 蓝色系 */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;  /* 主色 */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
}
```

### 语义化颜色
```css
:root {
  /* 功能色 */
  --color-success: #10b981;    /* 成功 - 绿色 */
  --color-warning: #f59e0b;    /* 警告 - 橙色 */
  --color-error: #ef4444;      /* 错误 - 红色 */
  --color-info: #3b82f6;       /* 信息 - 蓝色 */
  
  /* 中性色 */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}
```

### 暗色主题
```css
[data-theme="dark"] {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #cbd5e1;
  --color-border: #334155;
}
```

## 🔤 字体系统

### 字体族
```css
:root {
  /* 主字体 - 无衬线 */
  --font-sans: 'Inter', 'SF Pro Display', 'PingFang SC', system-ui, sans-serif;
  
  /* 等宽字体 - 代码 */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
  
  /* 装饰字体 - 标题 */
  --font-display: 'Inter Display', 'SF Pro Display', sans-serif;
}
```

### 字体大小
```css
:root {
  /* 字体大小 */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  
  /* 行高 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

## 📏 间距系统

### 基础间距
```css
:root {
  /* 间距单位 (基于 4px) */
  --spacing-0: 0;
  --spacing-1: 0.25rem;    /* 4px */
  --spacing-2: 0.5rem;     /* 8px */
  --spacing-3: 0.75rem;    /* 12px */
  --spacing-4: 1rem;       /* 16px */
  --spacing-5: 1.25rem;    /* 20px */
  --spacing-6: 1.5rem;     /* 24px */
  --spacing-8: 2rem;       /* 32px */
  --spacing-10: 2.5rem;    /* 40px */
  --spacing-12: 3rem;      /* 48px */
  --spacing-16: 4rem;      /* 64px */
  --spacing-20: 5rem;      /* 80px */
}
```

### 语义化间距
```css
:root {
  /* 组件内间距 */
  --spacing-component-xs: var(--spacing-2);
  --spacing-component-sm: var(--spacing-3);
  --spacing-component-md: var(--spacing-4);
  --spacing-component-lg: var(--spacing-6);
  
  /* 布局间距 */
  --spacing-layout-xs: var(--spacing-4);
  --spacing-layout-sm: var(--spacing-6);
  --spacing-layout-md: var(--spacing-8);
  --spacing-layout-lg: var(--spacing-12);
  --spacing-layout-xl: var(--spacing-16);
}
```

## 🔘 圆角系统

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.375rem;    /* 6px */
  --radius-md: 0.5rem;      /* 8px */
  --radius-lg: 0.75rem;     /* 12px */
  --radius-xl: 1rem;        /* 16px */
  --radius-2xl: 1.5rem;     /* 24px */
  --radius-full: 9999px;    /* 完全圆形 */
}
```

## 🌊 阴影系统

```css
:root {
  /* 阴影层级 */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* 特殊阴影 */
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --shadow-glow: 0 0 20px rgb(59 130 246 / 0.15);
}
```

## 🎭 动画系统

### 过渡时间
```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
}
```

### 缓动函数
```css
:root {
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### 常用动画
```css
/* 淡入淡出 */
.fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 滑入效果 */
.slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🧩 组件规范

### 按钮系统
```css
/* 主要按钮 */
.btn-primary {
  @apply bg-primary-500 hover:bg-primary-600 text-white;
  @apply px-4 py-2 rounded-md font-medium;
  @apply transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

/* 次要按钮 */
.btn-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-900;
  @apply px-4 py-2 rounded-md font-medium;
  @apply transition-colors duration-200;
}

/* 按钮尺寸 */
.btn-sm { @apply px-3 py-1.5 text-sm; }
.btn-md { @apply px-4 py-2 text-base; }
.btn-lg { @apply px-6 py-3 text-lg; }
```

### 输入框系统
```css
.input-base {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  @apply transition-all duration-200;
  @apply placeholder-gray-400;
}

.input-error {
  @apply border-red-300 focus:ring-red-500;
}
```

### 卡片系统
```css
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
  @apply p-6;
  @apply transition-shadow duration-200;
}

.card-hover {
  @apply hover:shadow-md;
}

.card-interactive {
  @apply cursor-pointer hover:shadow-lg transform hover:-translate-y-1;
  @apply transition-all duration-200;
}
```

## 📱 响应式设计

### 断点系统
```css
/* 移动优先设计 */
/* xs: 0px - 默认 */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */
```

### 响应式组件
```typescript
// 响应式网格
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 内容 */}
</div>

// 响应式文字
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  {t('page.title')}
</h1>

// 响应式间距
<div className="p-4 md:p-6 lg:p-8">
  {/* 内容 */}
</div>
```

## ♿ 无障碍设计

### 颜色对比度
- 正常文本: 至少 4.5:1
- 大文本: 至少 3:1
- 非文本元素: 至少 3:1

### 焦点管理
```css
/* 自定义焦点样式 */
.focus-visible {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2;
}

/* 跳过链接 */
.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4;
  @apply bg-primary-500 text-white px-4 py-2 rounded-md;
}
```

### 语义化HTML
```typescript
// 使用正确的HTML标签
<main>
  <section aria-labelledby="section-title">
    <h2 id="section-title">{t('section.title')}</h2>
    <article>
      <h3>{t('article.title')}</h3>
      <p>{t('article.content')}</p>
    </article>
  </section>
</main>
```

## 🎯 设计原则

### 一致性
- 相同功能使用相同的视觉表现
- 统一的交互模式和反馈
- 保持设计语言的连贯性

### 简洁性
- 去除不必要的装饰元素
- 突出核心功能和内容
- 减少用户的认知负担

### 可用性
- 直观的导航和操作流程
- 清晰的信息层级
- 及时的反馈和状态提示

### 美观性
- 和谐的色彩搭配
- 合理的留白和比例
- 精致的细节处理

---
**重要**: 所有UI组件都必须遵循此设计系统，确保产品的视觉一致性和用户体验质量。
