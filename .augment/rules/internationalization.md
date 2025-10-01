---
type: auto
description: "国际化开发规范 - 自动应用于包含文本的文件"
---

# 国际化 (i18n) 开发规范

## 🌍 支持语言
- **简体中文** (zh-CN) - 主要语言
- **繁体中文** (zh-TW) 
- **英语** (en) - 国际化主要语言
- **日语** (ja)
- **韩语** (ko)

## 🛠️ 技术实现
- **库**: next-intl
- **配置文件**: `src/i18n/`
- **语言切换**: 实时切换，无需刷新页面
- **URL结构**: `/[locale]/path` (可选)

## 📝 文本处理规范

### 基本使用
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function Component() {
  const { t, locale } = useLanguage();
  
  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('page.description')}</p>
    </div>
  );
}
```

### 禁止硬编码文本
```typescript
// ❌ 错误 - 硬编码文本
<button>生成壁纸</button>
<p>欢迎使用AIICG壁纸生成器</p>

// ✅ 正确 - 使用i18n
<button>{t('button.generate')}</button>
<p>{t('welcome.message')}</p>
```

### 动态内容插值
```typescript
// 带参数的翻译
<p>{t('user.welcome', { name: user.name })}</p>
<span>{t('stats.generated', { count: wallpaperCount })}</span>

// 复数形式处理
<p>{t('wallpaper.count', { count: wallpapers.length })}</p>
```

## 🗂️ 翻译文件结构

### 文件组织
```
src/i18n/
├── zh-CN.json          # 简体中文 (主要)
├── zh-TW.json          # 繁体中文
├── en.json             # 英语
├── ja.json             # 日语
└── ko.json             # 韩语
```

### 键名规范
```json
{
  "page": {
    "home": {
      "title": "AIICG壁纸生成器",
      "subtitle": "AI驱动的个性化壁纸创作平台"
    }
  },
  "button": {
    "generate": "生成壁纸",
    "download": "下载",
    "share": "分享"
  },
  "form": {
    "prompt": {
      "label": "描述你想要的壁纸",
      "placeholder": "例如：夕阳下的山脉，油画风格"
    }
  }
}
```

### 键名命名规则
- 使用点分割层级: `page.section.item`
- 使用小写字母和下划线: `user_profile`
- 描述性命名: `button.submit` 而不是 `btn1`
- 分组相关功能: `form.validation.required`

## 🎨 UI适配规范

### 文本长度适配
```typescript
// 考虑不同语言的文本长度差异
<button className="min-w-[120px] px-4 py-2">
  {t('button.generate')}
</button>

// 长文本的处理
<p className="line-clamp-2 text-sm">
  {t('description.long_text')}
</p>
```

### 布局方向支持
```typescript
// RTL语言支持 (未来扩展)
<div className="flex items-center space-x-2 rtl:space-x-reverse">
  <Icon />
  <span>{t('label.text')}</span>
</div>
```

### 字体适配
```css
/* 不同语言的字体优化 */
.font-sans {
  font-family: 
    'Inter', 
    'SF Pro Display',
    'PingFang SC',      /* 简体中文 */
    'PingFang TC',      /* 繁体中文 */
    'Hiragino Sans',    /* 日语 */
    'Malgun Gothic',    /* 韩语 */
    system-ui;
}
```

## 📅 格式化规范

### 日期时间格式化
```typescript
import { format } from 'date-fns';
import { zhCN, enUS, ja, ko } from 'date-fns/locale';

const localeMap = {
  'zh-CN': zhCN,
  'en': enUS,
  'ja': ja,
  'ko': ko
};

function formatDate(date: Date, locale: string) {
  return format(date, 'PPP', { 
    locale: localeMap[locale] 
  });
}
```

### 数字格式化
```typescript
function formatNumber(num: number, locale: string) {
  return new Intl.NumberFormat(locale).format(num);
}

// 货币格式化
function formatCurrency(amount: number, locale: string) {
  const currencyMap = {
    'zh-CN': 'CNY',
    'en': 'USD',
    'ja': 'JPY',
    'ko': 'KRW'
  };
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyMap[locale]
  }).format(amount);
}
```

## 🔄 语言切换

### 语言选择器组件
```typescript
function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();
  
  const languages = [
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];
  
  return (
    <Select value={locale} onValueChange={setLocale}>
      {languages.map(lang => (
        <SelectItem key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </SelectItem>
      ))}
    </Select>
  );
}
```

### 语言持久化
```typescript
// 保存用户语言偏好
function saveLanguagePreference(locale: string) {
  localStorage.setItem('preferred-language', locale);
  // 如果用户已登录，同步到服务器
  if (user) {
    updateUserPreference({ language: locale });
  }
}
```

## 🌐 SEO优化

### 多语言Meta标签
```typescript
// app/[locale]/layout.tsx
export function generateMetadata({ params }: { params: { locale: string } }) {
  const t = getTranslations(params.locale);
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: t('meta.keywords'),
    openGraph: {
      title: t('meta.og.title'),
      description: t('meta.og.description'),
    }
  };
}
```

### 语言切换链接
```typescript
function LanguageLinks() {
  const pathname = usePathname();
  
  return (
    <div>
      {languages.map(lang => (
        <Link 
          key={lang.code}
          href={`/${lang.code}${pathname}`}
          hrefLang={lang.code}
        >
          {lang.name}
        </Link>
      ))}
    </div>
  );
}
```

## 🧪 测试规范

### 翻译完整性测试
```typescript
// 检查所有语言文件的键是否一致
function validateTranslations() {
  const baseKeys = Object.keys(zhCN);
  const languages = [en, ja, ko, zhTW];
  
  languages.forEach(lang => {
    const missingKeys = baseKeys.filter(key => !lang[key]);
    if (missingKeys.length > 0) {
      console.warn(`Missing keys in ${lang.code}:`, missingKeys);
    }
  });
}
```

### UI适配测试
- 测试长文本的布局表现
- 验证不同语言的字体渲染
- 检查文本截断和换行
- 确认按钮和输入框的尺寸适配

## 📋 翻译工作流

### 翻译更新流程
1. 开发者在代码中添加新的翻译键
2. 更新简体中文翻译文件 (基准)
3. 标记需要翻译的新键
4. 翻译团队更新其他语言文件
5. 测试验证翻译质量

### 翻译质量控制
- 专业翻译团队审核
- 本地化测试验证
- 用户反馈收集
- 定期翻译更新

---
**重要**: 所有用户可见的文本都必须通过i18n系统管理，禁止硬编码任何文本内容。
