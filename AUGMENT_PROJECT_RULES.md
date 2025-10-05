# Augment 项目开发规范

## 🤖 AI助手工作流规范 (AI Assistant Workflow)

### 项目上下文加载规则 (强制执行)

> **核心原则**: 在执行任何项目相关任务前，必须先读取项目信息文档建立完整上下文，避免重复分析和低效沟通。

#### 📋 强制执行规则

1. **任务启动检查点** (每次对话开始时)
   ```
   ✅ 第一步: 读取 projectInfo.md
   ✅ 第二步: 理解项目架构和技术栈
   ✅ 第三步: 执行具体任务
   ```

2. **适用场景** (必须读取projectInfo的情况)
   - 新对话会话开始时
   - 用户询问项目架构相关问题时
   - 需要修改/新增功能时
   - 进行代码审查时
   - 排查技术问题时
   - 编写文档时

3. **读取内容要点**
   ```typescript
   // AI助手必须关注的关键信息
   interface ProjectContext {
     技术栈: {
       前端: "Next.js 15 + React 19 + TypeScript + TailwindCSS",
       后端: "Go + Gin + PostgreSQL + Redis",
       AI服务: "fal.ai + FastGPT",
       部署: "Cloudflare Pages + VPS + Docker"
     },
     目录结构: "src/, backend/, public/, data/",
     核心模块: "AI生成, 壁纸聚合, 压缩, 用户系统, VIP, 管理后台",
     API路由: "146+ TypeScript文件, 30+ API端点",
     数据库: "PostgreSQL核心表, Redis缓存策略",
     部署方式: "VPS一键脚本, Docker Compose, CF Pages"
   }
   ```

4. **禁止行为**
   - ❌ 未读取projectInfo就开始分析项目结构
   - ❌ 重复询问已在projectInfo中记录的信息
   - ❌ 忽略projectInfo中的技术栈限制
   - ❌ 提出与现有架构冲突的建议

5. **高效沟通模式**
   ```
   用户: "帮我优化壁纸加载性能"

   ❌ 低效方式:
   AI: "请问你们用的什么框架? 数据库是什么? 图片存储在哪?"

   ✅ 高效方式:
   AI: (读取projectInfo.md)
       "浮浮酱看到项目使用Next.js + Cloudinary + 兰空图床喵~
        建议从以下3个方向优化:
        1. Next.js Image组件优化 (已配置但可增强)
        2. Redis缓存壁纸列表 (当前TTL 5分钟可调整)
        3. CDN预热策略 (Cloudinary自动格式转换)
        主人想从哪个方向开始呢? (*^▽^*)"
   ```

#### 🎯 执行标准

**标准操作流程 (SOP)**:
```bash
# 伪代码示例
function handleUserRequest(request: string) {
  // Step 1: 检查是否需要项目上下文
  if (isProjectRelatedTask(request)) {
    // Step 2: 读取项目信息
    const projectInfo = await readFile('projectInfo.md');

    // Step 3: 解析关键信息
    const context = parseProjectContext(projectInfo);

    // Step 4: 基于上下文执行任务
    return executeTaskWithContext(request, context);
  }

  // Step 5: 非项目任务直接执行
  return executeTask(request);
}
```

**质量检查清单**:
- [ ] 是否读取了最新的projectInfo.md?
- [ ] 是否理解了当前技术栈限制?
- [ ] 提出的方案是否与现有架构兼容?
- [ ] 是否避免了重复询问已记录的信息?
- [ ] 是否提供了具体可执行的方案?

#### 📌 特殊说明

**projectInfo.md维护规则**:
- 📅 **更新频率**: 重大功能变更后手动更新
- 📝 **内容范围**: 架构、技术栈、API、数据库、部署
- 🔄 **版本控制**: 文档顶部标注最后更新时间
- 🚫 **不包含内容**: 临时数据、敏感配置、业务逻辑细节

**文档优先级**:
```
1. projectInfo.md      ← 项目全局信息 (必读)
2. PRD.md              ← 产品需求文档
3. backend/README.md   ← 后端技术文档
4. VPS_DEPLOYMENT.md   ← 部署操作手册
5. 具体代码文件        ← 实现细节
```

---

## 🌍 国际化要求 (Internationalization)

### 必须实现完整的多语言支持
- ✅ **支持语言**: 中文(简体)、中文(繁体)、英语、日语、韩语
- ✅ **文本内容**: 所有用户界面文本必须通过i18n系统管理
- ✅ **动态切换**: 用户可以实时切换语言，无需刷新页面
- ✅ **本地化**: 日期、时间、数字格式根据语言环境自动调整
- ✅ **SEO友好**: 支持多语言URL和meta标签

### 实现标准
```typescript
// 正确示例
const { t } = useLanguage();
<h1>{t('welcome.title')}</h1>

// 错误示例 - 禁止硬编码文本
<h1>欢迎使用</h1>
```

## 🎨 前端设计要求 (Frontend Design Standards)

### 设计理念：高端、美观、现代
- ✅ **参考标准**: Apple、Google、Microsoft、Figma、Linear等顶级网站
- ✅ **设计系统**: 统一的颜色、字体、间距、圆角、阴影规范
- ✅ **响应式设计**: 完美适配桌面、平板、手机所有设备
- ✅ **动画效果**: 流畅的过渡动画和微交互
- ✅ **无障碍访问**: 支持键盘导航、屏幕阅读器、高对比度

### 视觉规范
```css
/* 颜色系统 */
--primary: #3B82F6;     /* 主色调 */
--secondary: #64748B;   /* 辅助色 */
--success: #10B981;     /* 成功色 */
--warning: #F59E0B;     /* 警告色 */
--error: #EF4444;       /* 错误色 */

/* 字体系统 */
--font-sans: 'Inter', 'SF Pro Display', system-ui;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;

/* 间距系统 */
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */

/* 圆角系统 */
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
```

### UI组件标准
- ✅ **毛玻璃效果**: `backdrop-blur-xl` + 半透明背景
- ✅ **微妙阴影**: 多层阴影营造深度感
- ✅ **流畅动画**: `transition-all duration-200 ease-in-out`
- ✅ **悬停效果**: 所有可交互元素必须有悬停状态
- ✅ **加载状态**: 骨架屏、进度条、加载动画

## 🏗️ 技术架构要求 (Technical Architecture)

### 前端技术栈
- ✅ **框架**: Next.js 14+ (App Router)
- ✅ **样式**: Tailwind CSS + CSS Variables
- ✅ **状态管理**: React Context + Custom Hooks
- ✅ **类型安全**: TypeScript 严格模式
- ✅ **图标**: Lucide React (统一图标库)
- ✅ **动画**: Framer Motion (复杂动画)

### 后端技术栈
- ✅ **语言**: Go 1.21+
- ✅ **框架**: Gin + GORM
- ✅ **数据库**: PostgreSQL + Redis
- ✅ **认证**: JWT + Refresh Token
- ✅ **API**: RESTful + 统一响应格式

### 代码质量标准
```typescript
// 组件结构标准
interface ComponentProps {
  // 必须定义清晰的Props接口
}

export default function Component({ ...props }: ComponentProps) {
  // 1. Hooks调用
  // 2. 状态定义
  // 3. 副作用处理
  // 4. 事件处理函数
  // 5. 渲染逻辑
  
  return (
    <div className="组件根容器样式">
      {/* 清晰的JSX结构 */}
    </div>
  );
}
```

## 📱 用户体验要求 (User Experience)

### 交互设计原则
- ✅ **直观性**: 用户无需学习即可使用
- ✅ **一致性**: 相同功能在不同页面表现一致
- ✅ **反馈性**: 每个操作都有明确的视觉反馈
- ✅ **容错性**: 优雅处理错误，提供恢复方案
- ✅ **效率性**: 减少用户操作步骤，提高效率

### 性能要求
- ✅ **首屏加载**: < 2秒
- ✅ **页面切换**: < 500ms
- ✅ **API响应**: < 1秒
- ✅ **图片优化**: WebP格式 + 懒加载
- ✅ **代码分割**: 按路由和组件分割

## 🔒 安全要求 (Security Standards)

### 前端安全
- ✅ **XSS防护**: 所有用户输入必须转义
- ✅ **CSRF防护**: API请求包含CSRF Token
- ✅ **敏感信息**: 不在前端存储敏感数据
- ✅ **权限控制**: 基于角色的UI显示控制

### 后端安全
- ✅ **输入验证**: 所有API输入严格验证
- ✅ **SQL注入**: 使用参数化查询
- ✅ **权限验证**: 每个API端点验证用户权限
- ✅ **数据加密**: 敏感数据加密存储

## 📊 数据管理要求 (Data Management)

### 数据库设计
- ✅ **规范化**: 遵循第三范式
- ✅ **索引优化**: 查询字段建立索引
- ✅ **软删除**: 重要数据使用软删除
- ✅ **审计日志**: 记录数据变更历史
- ✅ **备份策略**: 定期自动备份

### API设计
```json
// 统一响应格式
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 实际数据
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## 🧪 测试要求 (Testing Standards)

### 测试覆盖率
- ✅ **单元测试**: 核心业务逻辑 > 80%
- ✅ **集成测试**: API端点 > 90%
- ✅ **E2E测试**: 关键用户流程 > 95%
- ✅ **性能测试**: 负载和压力测试

### 测试工具
- ✅ **前端**: Jest + React Testing Library
- ✅ **后端**: Go testing + Testify
- ✅ **E2E**: Playwright
- ✅ **API**: Postman + Newman

## 📚 文档要求 (Documentation)

### 必须文档
- ✅ **README**: 项目介绍、安装、运行说明
- ✅ **API文档**: Swagger/OpenAPI规范
- ✅ **组件文档**: Storybook展示
- ✅ **部署文档**: 环境配置、部署流程
- ✅ **变更日志**: 版本更新记录

## 🚀 部署要求 (Deployment)

### 环境管理
- ✅ **开发环境**: 本地开发配置
- ✅ **测试环境**: 自动化测试部署
- ✅ **预生产环境**: 生产环境镜像
- ✅ **生产环境**: 高可用、负载均衡

### CI/CD流程
- ✅ **代码检查**: ESLint + Prettier + Go fmt
- ✅ **自动测试**: 提交时运行测试套件
- ✅ **自动部署**: 合并到主分支自动部署
- ✅ **回滚机制**: 快速回滚到上一版本

---

## 🎯 项目目标

打造一个**世界级的AI壁纸生成平台**，在技术实现、用户体验、视觉设计等各方面都达到国际顶尖水准，成为行业标杆产品。

### 核心价值观
- **用户至上**: 一切设计以用户体验为中心
- **技术卓越**: 采用最佳实践和前沿技术
- **持续改进**: 不断优化和完善产品
- **开放协作**: 拥抱开源，贡献社区

---

*本规范是Augment项目的核心指导原则，所有开发工作必须严格遵循。*
