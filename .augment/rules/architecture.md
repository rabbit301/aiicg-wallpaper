---
type: always
description: "前后端分离架构核心规范 - 每次开发都必须遵循"
---

# AIICG壁纸生成平台 - 架构规范

## 🏗️ 核心架构原则

### 前后端分离架构
- **前端**: Next.js 15+ (App Router) - 端口 3001
- **后端**: Go 1.21+ (Gin + GORM) - 端口 8080  
- **数据库**: PostgreSQL (远程) + Redis (缓存)
- **通信**: RESTful API + JWT认证

### API路由规范
```
前端 Next.js API: /api/*
后端 Go API: /api/v1/*

示例映射:
/api/auth/login → /api/v1/auth/login
/api/user/profile → /api/v1/user/profile
/api/generate → /api/v1/generate/wallpaper
```

### 环境配置
```bash
# 开发环境
NEXT_PUBLIC_GO_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_USE_GO_BACKEND=true

# 生产环境  
NEXT_PUBLIC_GO_BACKEND_URL=https://api.aiicg.com
NEXT_PUBLIC_USE_GO_BACKEND=true
```

## 🔄 数据流向

### 用户认证流程
1. 前端 → Go后端 `/api/v1/auth/login`
2. Go后端 → PostgreSQL (验证用户)
3. Go后端 → 返回JWT Token
4. 前端 → 存储Token到localStorage
5. 后续请求 → Header携带 `Authorization: Bearer <token>`

### 图像生成流程
1. 前端 → Go后端 `/api/v1/generate/wallpaper`
2. Go后端 → 调用AI服务 (SiliconFlow/FastGPT)
3. Go后端 → 存储生成记录到PostgreSQL
4. Go后端 → 返回图像URL和元数据
5. 前端 → 显示结果并更新用户统计

### 数据存储策略
- **用户数据**: PostgreSQL (持久化)
- **会话数据**: Redis (临时缓存)
- **静态资源**: Cloudinary/本地存储
- **配置数据**: 环境变量

## 🛡️ 安全规范

### 认证授权
- JWT Token有效期: 24小时
- Refresh Token有效期: 7天
- 敏感操作需要重新验证
- API限流: 100请求/分钟/用户

### 数据验证
- 前端: 基础验证 + UI反馈
- 后端: 严格验证 + 数据清洗
- 数据库: 约束 + 索引

## 📱 响应式设计
- 移动优先设计
- 断点: sm(640px), md(768px), lg(1024px), xl(1280px)
- 触摸友好的交互设计

## 🌍 国际化支持
- 支持语言: zh-CN, zh-TW, en, ja, ko
- 使用next-intl库
- 所有文本必须通过t()函数
- 禁止硬编码文本

## ⚡ 性能要求
- 首屏加载: < 2秒
- 页面切换: < 500ms  
- API响应: < 1秒
- 图像优化: WebP格式 + 懒加载

## 🎨 设计系统
- 主色调: #3B82F6 (蓝色)
- 字体: Inter, SF Pro Display
- 圆角: 0.375rem (sm), 0.5rem (md), 0.75rem (lg)
- 间距: 0.25rem, 0.5rem, 1rem, 1.5rem, 2rem

## 🔧 开发工具链
- **前端**: Next.js + TypeScript + Tailwind CSS
- **后端**: Go + Gin + GORM + PostgreSQL
- **部署**: Docker + VPS
- **监控**: 日志 + 错误追踪

## 📋 代码规范
- TypeScript严格模式
- ESLint + Prettier
- Go fmt + golint
- 单元测试覆盖率 > 80%

## 🚀 部署流程
1. 前端构建: `npm run build`
2. 后端编译: `go build`
3. Docker镜像构建
4. VPS部署更新
5. 健康检查验证

---
**重要**: 每次开发都必须遵循此架构规范，确保前后端分离的一致性和可维护性。
