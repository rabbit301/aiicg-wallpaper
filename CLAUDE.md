# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

AIICG壁纸站是一个 AI 驱动的壁纸生成与分享平台，专为 360 水冷屏幕用户及 PC DIY 爱好者设计。项目基于 Next.js 15 + React 19 + TypeScript 构建，整合了 fal.ai AI 生成、多源壁纸聚合、图片处理等核心功能。

## 常用开发命令

### 前端开发
```bash
# 开发服务器 (端口 3000)
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 生产构建并启动
npm run prod
```

### 后端开发 (Go)
```bash
cd backend

# 启动开发服务器 (端口 8080)
go run cmd/server/main.go

# 构建二进制
go build -o bin/server cmd/server/main.go

# 运行测试
go test ./...

# 测试覆盖率
go test -cover ./...
```

### 部署管理
```bash
# PM2 进程管理
pm2 status                  # 查看状态
pm2 logs aiicg-wallpaper    # 查看日志
pm2 restart aiicg-wallpaper # 重启应用

# Docker Compose
docker-compose up -d        # 启动所有服务
docker-compose logs -f      # 查看日志
docker-compose restart      # 重启服务

# Nginx 管理
sudo nginx -t               # 测试配置
sudo systemctl restart nginx # 重启 Nginx
```

## 核心架构设计

### 1. Next.js App Router 架构
项目使用 Next.js 15 的 App Router，采用文件系统路由：
- `src/app/page.tsx` - 首页，包含 Hero 区域和壁纸瀑布流展示
- `src/app/layout.tsx` - 根布局，配置多层 Context Providers (Language → Auth → Theme → Notification)
- `src/app/api/*` - API Routes，所有后端逻辑都通过 Next.js API Routes 实现
- `src/app/generate/` - AI 壁纸生成页面
- `src/app/compress/` - 图片压缩处理页面
- `src/app/admin/` - 管理后台模块

### 2. 统一壁纸管理系统
核心文件：`src/lib/wallpaper-manager.ts`

**统一数据接口 UnifiedWallpaper**：
- 整合多个数据源 (Unsplash, Pexels, Giphy, 本地生成)
- 标准化字段：id, title, url, thumbnail, category, source, tags
- 分类管理：avatar | wallpaper | animation | live
- 数据持久化：`data/unified-wallpapers.json`

**爬虫架构**：
- `unsplash-scraper.ts` - Unsplash API 爬虫 (最多 150 张/类别)
- `pexels-scraper.ts` - Pexels API 爬虫 (最多 100 张/类别)
- `giphy-scraper.ts` - Giphy GIF 动图爬虫
- `local-avatar-processor.ts` - 本地头像资源处理

### 3. AI 生成管线
核心文件：`src/lib/fal-client.ts`, `src/app/api/generate/`

**AI 服务集成**：
- **fal.ai Flux Schnell** - 主要 AI 生成模型
- **FastGPT** - 提示词优化和翻译 (`prompt-optimizer.ts`)
- **情感评估器** - 提示词情感分析 (`emotion-evaluator.ts`)

**生成流程**：
1. 用户输入提示词 → 提示词优化/翻译
2. 调用 fal.ai API 生成原始图片
3. Sharp.js 处理：锐度增强、亮度/饱和度调整（360 水冷屏幕优化）
4. 生成 WebP 缩略图 (300×200)
5. 保存到 `public/wallpapers/`，元数据存入 `data/wallpapers.json`

**屏幕预设** (SCREEN_PRESETS)：
- 360 水冷：480×480, 640×640, 640×480
- 手机：1080×1920 (16:9), 1080×1440 (4:3)
- 桌面：1920×1080 (FHD), 3840×2160 (4K), 2560×1080 (超宽屏)
- 平板：1366×1024, 1024×1366

### 4. 图片处理与压缩系统
核心文件：`src/lib/compression-*.ts`, `src/lib/image-processor.ts`

**压缩引擎架构**：
- `compression-service.ts` - 统一调度服务
- `ai-compression.ts` - AI 智能压缩 (VIP 用户)
- `free-compression.ts` - 基础压缩 (普通用户)

**处理能力**：
- 格式转换：PNG/JPG/WebP
- 尺寸调整：智能缩放算法
- 质量优化：无损/平衡/激进三种模式
- EXIF 元数据清理

### 5. 用户状态与权限系统
核心文件：`src/lib/user-store.ts`, `src/app/api/auth/*`

**用户角色**：
- `guest` - 访客（仅查看）
- `user` - 普通用户（生成/下载）
- `admin` - 管理员（管理壁纸）
- `super_admin` - 超级管理员（全权限）

**认证流程**：
- 邮箱注册/登录 (`/api/auth/register`, `/api/auth/login`)
- JWT Token 签发 (jsonwebtoken 9.0.2)
- 访客会话支持 (`/api/auth/guest-session`)
- Refresh Token 机制

**数据存储**：
- `data/user-data.json` - 用户配置文件
- `data/user-activities.json` - 用户活动记录（最多 100 条）
- `data/users.json` - 用户账号数据
- `data/folders.json` - 文件夹结构
- `data/guest-sessions.json` - 访客会话

### 6. Context 系统架构
所有 Context Providers 在 `src/contexts/` 目录：
- **LanguageContext** - 中英文切换 (next-intl)
- **AuthContext** - 用户认证状态
- **ThemeContext** - 深色/浅色模式切换
- **NotificationContext** - 消息通知系统

嵌套顺序（从外到内）：Language → Auth → Theme → Notification

## 关键技术约束

### Cloudflare Pages 部署优化
由于 CF Pages 单文件 25MB 限制，`next.config.ts` 实施了严格的代码分割：
- React 核心库：最大 5MB
- UI 组件库 (lucide-react, TailwindCSS)：最大 5MB
- Vendor 库：最大 10MB
- 整体 chunk：最大 15MB

**Webpack 配置位置**：`next.config.ts:43-125`

### LightningCSS 兼容性处理
CF Pages 构建环境不支持原生模块，需要外部化处理：
```typescript
// next.config.ts:65-70
config.externals.push({
  'lightningcss/node': 'commonjs lightningcss/node',
  '@parcel/watcher': 'commonjs @parcel/watcher',
})
```

### 图片优化策略
- 使用 Next.js Image 组件进行自动优化
- 远程图片域名白名单配置：`next.config.ts:21-38`
- 支持的域名：兰空图床 (555125.xyz)、Cloudinary、fal.ai、Unsplash、Pexels、Giphy
- 预设尺寸：640, 750, 828, 1080, 1200, 1920, 2048, 3840

### 路径别名配置
TypeScript 路径别名：`@/*` → `./src/*`
配置位置：`tsconfig.json:21-23`

## 数据流设计

### 壁纸生成流程
```
用户输入 → PromptOptimizer (FastGPT) → fal.ai API →
Sharp 处理 (360优化) → 保存文件 → 更新 wallpapers.json →
返回结果 → 更新用户活动记录
```

### 壁纸加载流程
```
首页渲染 → MasonryWallpaperGallery →
读取 unified-wallpapers.json / wallpapers.json →
WallpaperModal (详情展示) → 下载/收藏操作
```

### 图片代理流程
为避免跨域问题，所有外部图片通过代理访问：
- `/api/image-proxy?url=<外部URL>` - 图片显示代理
- `/api/download-proxy?url=<外部URL>` - 下载代理

## 环境变量要求

### 必需的 AI 服务密钥
```bash
FAL_KEY=fal_xxxxx              # fal.ai API密钥
FASTGPT_KEY=fastgpt-xxxxx      # FastGPT密钥（提示词优化）
```

### 图片服务配置
```bash
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### 壁纸源 API 密钥
```bash
UNSPLASH_ACCESS_KEY=xxx        # Unsplash API
PEXELS_API_KEY=xxx             # Pexels API
GIPHY_API_KEY=xxx              # Giphy API
```

### 邮件服务配置
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=xxx
SMTP_PASSWORD=xxx
```

### 后端代理配置（可选）
```bash
NEXT_PUBLIC_GO_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_USE_GO_BACKEND=false  # 当前默认使用 Next.js API Routes
```

## 重要文件路径参考

### 核心业务逻辑
- 壁纸管理器：`src/lib/wallpaper-manager.ts:39-309`
- AI 客户端：`src/lib/fal-client.ts:17-47`
- 提示词优化：`src/lib/prompt-optimizer.ts`
- 图片处理：`src/lib/image-processor.ts`

### 关键 API 路由
- 生成壁纸：`src/app/api/generate/route.ts`
- 壁纸详情：`src/app/api/wallpapers/[id]/route.ts:5-42`
- 图片压缩：`src/app/api/compress/route.ts`
- 提示词优化：`src/app/api/optimize-prompt/route.ts`
- 用户认证：`src/app/api/auth/login/route.ts`

### UI 组件
- 首页：`src/app/page.tsx:12-127`
- 瀑布流画廊：`src/components/MasonryWallpaperGallery.tsx`
- 底部创作面板：`src/components/BottomCreationPanel.tsx`
- 提示词优化器：`src/components/PromptOptimizer.tsx`
- 认证弹窗：`src/components/AuthModal.tsx`

### 配置文件
- Next.js 配置：`next.config.ts:3-155`
- TypeScript 配置：`tsconfig.json:1-27`
- ESLint 配置：`eslint.config.mjs:12-26`

## 开发注意事项

### Git 分支策略
- 主分支：`master`
- 开发分支：`test`（当前活跃分支）
- 功能分支：`feature/*`

### Commit 规范
遵循 Conventional Commits：
- `feat:` 新功能
- `fix:` Bug 修复
- `refactor:` 代码重构
- `perf:` 性能优化
- `docs:` 文档更新
- `style:` 代码格式调整

### 代码检查配置
ESLint 规则已放宽以允许构建（`eslint.config.mjs:15-24`）：
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: warn
- `react-hooks/exhaustive-deps`: warn

### 性能优化建议
1. 使用 Next.js Image 组件而非 `<img>` 标签
2. API 路由返回数据时注意分页和限制数量
3. 避免在 Server Components 中调用客户端专用 API
4. Sharp.js 处理大图片时注意内存占用

### 安全建议
1. 所有用户输入必须验证和过滤（防 XSS）
2. API 路由需要权限检查（JWT 验证）
3. 文件上传限制类型和大小（最大 10MB）
4. 敏感配置使用环境变量，不提交到代码仓库

## 测试文件位置
- API 测试：`public/test-api.html`
- 图片处理测试：`public/test-image.html`
- 提示词优化测试：`src/app/test-optimizer/page.tsx`
- API 集成测试：`src/app/api-test/page.tsx`

## 相关文档
- 产品需求文档：`PRD.md`
- 项目详细信息：`projectInfo.md`
- VPS 部署指南：`VPS_DEPLOYMENT.md`, `README_VPS_DEPLOY.md`
- Cloudinary 配置：`CLOUDINARY_SETUP.md`
- 提示词优化演示：`PROMPT_OPTIMIZER_DEMO.md`
- 项目规则增强：`AUGMENT_PROJECT_RULES.md`

## 常见问题排查

### 图片无法加载
1. 检查域名是否在 `next.config.ts:21-38` 的 remotePatterns 中
2. 确认 Cloudinary/兰空图床配置正确
3. 查看浏览器控制台 CORS 错误

### API 调用失败
1. 确认环境变量正确配置（`FAL_KEY`, `FASTGPT_KEY` 等）
2. 检查 API 路由是否正确处理错误
3. 查看服务器日志：`pm2 logs aiicg-wallpaper`

### 构建失败（CF Pages）
1. 检查单个文件是否超过 25MB
2. 确认 LightningCSS 外部化配置生效
3. 清除 `.next` 缓存后重新构建

### 数据丢失
1. 检查 `data/` 目录权限
2. 确认 JSON 文件格式正确
3. 查看应用日志中的文件读写错误
