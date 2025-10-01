---
type: auto
description: "Next.js前端开发规范 - 自动应用于.tsx,.ts,.jsx,.js文件"
---

# Next.js 前端开发规范

## 🎯 技术栈
- **框架**: Next.js 15+ (App Router)
- **语言**: TypeScript (严格模式)
- **样式**: Tailwind CSS + CSS Variables
- **状态管理**: React Context + Custom Hooks
- **图标**: Lucide React (统一图标库)
- **动画**: CSS Transitions + Framer Motion (复杂动画)

## 📁 目录结构
```
src/
├── app/                 # App Router页面
├── components/          # 可复用组件
├── contexts/           # React Context
├── lib/                # 工具函数和服务
├── types/              # TypeScript类型定义
└── styles/             # 全局样式
```

## 🧩 组件开发规范

### 组件结构模板
```typescript
'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface ComponentNameProps {
  // 定义清晰的Props接口
  title: string;
  onAction?: () => void;
}

export default function ComponentName({ title, onAction }: ComponentNameProps) {
  const { t } = useLanguage();
  
  // 1. Hooks
  // 2. 状态定义
  // 3. 副作用 (useEffect)
  // 4. 事件处理函数
  
  return (
    <div className="组件根容器样式 transition-all duration-200">
      <h1>{t('component.title')}</h1>
      {/* 组件内容 */}
    </div>
  );
}
```

### Props接口规范
- 必须定义清晰的Props接口
- 使用描述性的属性名
- 可选属性使用 `?` 标记
- 回调函数以 `on` 开头

### 状态管理
- 优先使用React Context
- 复杂状态使用useReducer
- 本地状态使用useState
- 副作用使用useEffect

## 🎨 样式规范

### Tailwind CSS使用
```typescript
// ✅ 推荐 - 使用语义化类名
<div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">

// ❌ 避免 - 过长的类名字符串
<div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
```

### CSS Variables集成
```css
:root {
  --color-primary: #3B82F6;
  --color-secondary: #64748B;
  --spacing-md: 1rem;
  --radius-md: 0.5rem;
}
```

### 响应式设计
- 移动优先: 默认样式为移动端
- 断点使用: `sm:`, `md:`, `lg:`, `xl:`
- 触摸友好: 按钮最小44px

## 🌍 国际化规范

### 文本处理
```typescript
// ✅ 正确 - 使用t()函数
const { t } = useLanguage();
<h1>{t('page.title')}</h1>

// ❌ 错误 - 硬编码文本
<h1>欢迎使用AIICG</h1>
```

### 多语言支持
- 支持语言: zh-CN, zh-TW, en, ja, ko
- 键名使用点分割: `page.section.item`
- 动态内容使用插值: `t('welcome', { name })`

## 🔄 API调用规范

### API客户端使用
```typescript
import { apiClient } from '@/lib/api-client';

// ✅ 推荐 - 使用统一API客户端
const response = await apiClient.get('/api/user/profile');

// ✅ 错误处理
try {
  const data = await apiClient.post('/api/generate', { prompt });
} catch (error) {
  console.error('生成失败:', error);
  // 用户友好的错误提示
}
```

### 数据获取模式
- 服务端组件: 直接数据获取
- 客户端组件: useEffect + 状态管理
- 缓存策略: SWR或React Query

## 🎭 用户体验规范

### 加载状态
```typescript
const [loading, setLoading] = useState(false);

return (
  <button disabled={loading} className="btn-primary">
    {loading ? <Spinner /> : t('button.submit')}
  </button>
);
```

### 错误处理
- 网络错误: 友好提示 + 重试按钮
- 表单验证: 实时反馈
- 404页面: 引导用户返回

### 无障碍支持
- 语义化HTML标签
- ARIA属性支持
- 键盘导航支持
- 屏幕阅读器友好

## ⚡ 性能优化

### 代码分割
```typescript
// 动态导入大组件
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />
});
```

### 图像优化
```typescript
import Image from 'next/image';

// ✅ 使用Next.js Image组件
<Image
  src="/wallpaper.jpg"
  alt={t('wallpaper.alt')}
  width={800}
  height={600}
  priority={isAboveFold}
/>
```

### 内存管理
- useEffect清理函数
- 事件监听器移除
- 定时器清理

## 🧪 测试规范
- 组件单元测试
- 用户交互测试
- 无障碍测试
- 性能测试

## 📱 移动端适配
- 触摸手势支持
- 虚拟键盘适配
- 安全区域适配
- PWA支持

---
**重要**: 所有前端代码都必须遵循此规范，确保代码质量和用户体验的一致性。
