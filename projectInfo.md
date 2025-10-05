# AIICG壁纸站 - 项目信息文档

> 最后更新时间：2025-10-05
> 文档版本：v1.0.0
> 项目版本：0.1.0

---

## 📋 项目概览

### 基本信息
- **项目名称**：AIICG Wallpaper (aiicg-wallpaper)
- **项目类型**：AI壁纸生成与分享平台
- **当前版本**：0.1.0
- **开发状态**：活跃开发中
- **Git分支**：test (主分支: master)

### 核心定位
AIICG壁纸站是一个专业的AI驱动壁纸生成平台，专门为360水冷屏幕用户及PC DIY爱好者提供定制化、高质量的壁纸解决方案。平台整合了AI生成、图片处理、多源壁纸聚合等功能。

### 最近提交记录
```
c7f002a - feat: 完整测试环境功能迁移
185225f - fix: 主页UI大修
6fe69f5 - feat: 完成AIICG壁纸站核心功能优化
38dc13f - feat: 新增AI提示词优化功能
8231bd8 - feat: UI优化
```

---

## 🏗️ 技术架构

### 前端技术栈
```json
{
  "框架": "Next.js 15.3.4 (React 19.0.0)",
  "语言": "TypeScript 5.x",
  "样式": "TailwindCSS 4.x + LightningCSS 1.30.1",
  "国际化": "next-intl 4.3.1",
  "图标": "lucide-react 0.525.0",
  "图片处理": "Sharp 0.34.2"
}
```

### 后端技术栈
```go
{
  "语言": "Go 1.21+",
  "框架": "Gin Web Framework",
  "数据库": "PostgreSQL 15+",
  "缓存": "Redis 7+",
  "ORM": "GORM",
  "认证": "JWT (jsonwebtoken 9.0.2)"
}
```

### AI与第三方服务
```yaml
AI服务:
  - fal.ai: AI壁纸生成 (Flux Schnell模型)
  - FastGPT: 提示词优化

图片服务:
  - Cloudinary: 图片托管与CDN
  - 兰空图床: 优先图床域名 (555125.xyz)

壁纸源:
  - Unsplash API: 高质量摄影壁纸
  - Pexels API: 免费图片素材
  - Giphy API: GIF动态壁纸
  - 本地存储: 自生成壁纸

邮件服务:
  - Nodemailer: 邮件发送 (SMTP)
```

### 部署与基础设施
```yaml
部署平台:
  - Cloudflare Pages: 前端部署
  - VPS服务器: 后端部署
  - Docker: 容器化部署

代理与优化:
  - Nginx: 反向代理
  - PM2: 进程管理
  - 图片优化: Next.js Image组件

构建优化:
  - Webpack分块策略 (最大15MB)
  - React单独打包 (5MB限制)
  - UI库独立打包 (5MB限制)
```

---

## 📁 项目结构

### 前端目录结构 (Next.js)
```
aiicg-wallpaper/
├── src/
│   ├── app/                    # Next.js 14+ App Router
│   │   ├── page.tsx            # 首页 (Hero + 壁纸展示)
│   │   ├── layout.tsx          # 根布局
│   │   ├── admin/              # 管理后台模块
│   │   │   ├── page.tsx        # 管理仪表板
│   │   │   ├── users/          # 用户管理
│   │   │   ├── wallpapers/     # 壁纸管理
│   │   │   ├── audit/          # 审计日志
│   │   │   ├── notifications/  # 通知管理
│   │   │   └── settings/       # 系统设置
│   │   ├── api/                # API路由层
│   │   │   ├── generate/       # AI壁纸生成
│   │   │   ├── wallpapers/     # 壁纸CRUD
│   │   │   ├── auth/           # 认证相关
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── guest-session/
│   │   │   │   └── captcha/
│   │   │   ├── user/           # 用户管理
│   │   │   │   ├── profile/
│   │   │   │   ├── stats/
│   │   │   │   ├── favorites/
│   │   │   │   └── activities/
│   │   │   ├── compress/       # 图片压缩
│   │   │   ├── optimize-prompt/# 提示词优化
│   │   │   ├── vip/            # VIP功能
│   │   │   └── admin/          # 管理员API
│   │   ├── generate/           # 生成页面
│   │   ├── compress/           # 压缩页面
│   │   ├── profile/            # 用户资料
│   │   ├── settings/           # 设置页面
│   │   ├── community/          # 社区页面
│   │   ├── category/[slug]/    # 分类详情页
│   │   └── wallpaper/[id]/     # 壁纸详情页
│   ├── components/             # React组件库
│   │   ├── Layout.tsx          # 主布局组件
│   │   ├── Header.tsx          # 顶部导航
│   │   ├── WallpaperGallery.tsx         # 标准画廊
│   │   ├── MasonryWallpaperGallery.tsx  # 瀑布流画廊
│   │   ├── BottomCreationPanel.tsx      # 底部创作面板
│   │   ├── AuthModal.tsx                # 认证弹窗
│   │   ├── PromptOptimizer.tsx          # 提示词优化器
│   │   ├── CompressionPanel.tsx         # 压缩面板
│   │   ├── AvatarSelector.tsx           # 头像选择器
│   │   ├── ThemeToggle.tsx              # 主题切换
│   │   ├── LanguageToggle.tsx           # 语言切换
│   │   ├── VipUpgradeModal.tsx          # VIP升级弹窗
│   │   └── CategoryGallery.tsx          # 分类画廊
│   ├── lib/                    # 核心工具库 (146+ TS/TSX文件)
│   │   ├── wallpaper-manager.ts         # 壁纸统一管理器
│   │   ├── fal-client.ts                # fal.ai客户端
│   │   ├── prompt-optimizer.ts          # 提示词优化
│   │   ├── prompt-translator.ts         # 提示词翻译
│   │   ├── compression-service.ts       # 压缩服务
│   │   ├── image-processor.ts           # 图片处理
│   │   ├── ai-compression.ts            # AI压缩
│   │   ├── free-compression.ts          # 免费压缩
│   │   ├── unsplash-scraper.ts          # Unsplash爬虫
│   │   ├── pexels-scraper.ts            # Pexels爬虫
│   │   ├── giphy-scraper.ts             # Giphy爬虫
│   │   ├── local-avatar-processor.ts    # 本地头像处理
│   │   ├── user-store.ts                # 用户状态管理
│   │   ├── vip-service.ts               # VIP服务
│   │   └── emotion-evaluator.ts         # 情感评估
│   ├── contexts/               # React上下文
│   ├── styles/                 # 样式系统
│   │   └── design-system.ts    # 设计系统定义
│   └── middleware.ts           # Next.js中间件
├── public/                     # 静态资源
│   ├── wallpapers/             # 壁纸存储目录
│   ├── test-api.html           # API测试页面
│   └── *.svg                   # SVG图标
├── data/                       # 数据文件目录
├── next.config.ts              # Next.js配置
├── tsconfig.json               # TypeScript配置
├── tailwind.config.js          # TailwindCSS配置
└── package.json                # 依赖管理
```

### 后端目录结构 (Go)
```
backend/
├── cmd/
│   └── server/
│       └── main.go             # 应用入口
├── internal/                   # 内部模块
│   ├── config/                 # 配置管理
│   ├── models/                 # 数据模型
│   ├── handlers/               # 路由处理器
│   ├── services/               # 业务逻辑层
│   ├── middleware/             # 中间件
│   └── database/               # 数据库连接
├── pkg/                        # 公共包
│   ├── auth/                   # JWT认证
│   ├── utils/                  # 工具函数
│   └── types/                  # 类型定义
├── migrations/                 # 数据库迁移
│   └── init.sql                # 初始化脚本
├── docker/                     # Docker配置
├── scripts/                    # 脚本工具
├── go.mod                      # Go模块定义
├── go.sum                      # 依赖校验和
├── docker-compose.yml          # Docker Compose配置
├── env.example                 # 环境变量示例
└── README.md                   # 后端文档
```

### 配置与文档
```
根目录/
├── .spec-workflow/             # 规格工作流
│   ├── approvals/              # 审批记录
│   ├── specs/                  # 规格文档
│   ├── steering/               # 指导文档
│   └── templates/              # 模板文件
├── docs/                       # 项目文档
├── issues/                     # 问题追踪
├── PRD.md                      # 产品需求文档
├── VPS_DEPLOYMENT.md           # VPS部署指南
├── README_VPS_DEPLOY.md        # VPS快速部署
├── CLOUDINARY_SETUP.md         # Cloudinary配置
├── PROMPT_OPTIMIZER_DEMO.md    # 提示词优化演示
└── AUGMENT_PROJECT_RULES.md    # 项目规则增强
```

---

## 🌟 核心功能模块

### 1. AI壁纸生成系统
**文件位置**: `src/app/api/generate/route.ts`, `src/lib/fal-client.ts`

**功能特性**:
- AI模型: fal.ai Flux Schnell
- 生成参数:
  - 文本提示词 (必填)
  - 壁纸标题 (可选)
  - 屏幕预设 (方形480×480, 640×640, 横屏640×480)
- 提示词优化:
  - 集成FastGPT API
  - 中文→英文翻译
  - 提示词情感评估
- 图片处理:
  - Sharp.js自动优化
  - 360水冷屏幕适配 (锐度/亮度/饱和度)
  - WebP缩略图生成 (300×200)

**关键代码**:
```typescript
// src/lib/wallpaper-manager.ts
export interface UnifiedWallpaper {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  category: 'avatar' | 'wallpaper' | 'animation' | 'live';
  tags: string[];
  source: 'unsplash' | 'pexels' | 'giphy' | 'local';
  license: string;
  downloadUrl: string;
  type?: 'photo' | 'video' | 'gif';
}
```

### 2. 多源壁纸聚合系统
**文件位置**: `src/lib/wallpaper-manager.ts`, `src/lib/*-scraper.ts`

**数据源**:
1. **Unsplash**: 高质量摄影 (最多150张/类别)
2. **Pexels**: 免费图片素材 (最多100张/类别)
3. **Giphy**: GIF动态壁纸
4. **本地生成**: AI自生成壁纸

**聚合策略**:
- 统一数据接口 `UnifiedWallpaper`
- 分类管理: avatar | wallpaper | animation | live
- 增量爬取 + 缓存机制
- 数据持久化至 `data/unified-wallpapers.json`

**爬取统计**:
```typescript
export interface ScrapingStats {
  source: string;         // 数据源
  category: string;       // 分类
  count: number;          // 数量
  success: boolean;       // 状态
  duration: number;       // 耗时(ms)
}
```

### 3. 图片压缩与处理系统
**文件位置**: `src/app/api/compress/route.ts`, `src/lib/compression-*.ts`

**压缩引擎**:
- **AI智能压缩**: `ai-compression.ts` (高级用户)
- **免费压缩**: `free-compression.ts` (基础用户)
- **压缩服务**: `compression-service.ts` (统一调度)

**处理能力**:
- 格式转换: PNG/JPG/WebP
- 尺寸调整: 智能缩放
- 质量优化: 无损/有损可选
- 元数据清理: EXIF剥离

**压缩模式**:
```typescript
enum CompressionMode {
  LOSSLESS = 'lossless',  // 无损压缩
  BALANCED = 'balanced',  // 平衡模式
  AGGRESSIVE = 'aggressive' // 激进压缩
}
```

### 4. 用户与权限系统
**文件位置**: `backend/internal/models/`, `src/app/api/auth/`

**用户角色**:
```go
const (
  RoleGuest       = "guest"       // 访客 - 仅查看
  RoleUser        = "user"        // 普通用户 - 生成/下载
  RoleAdmin       = "admin"       // 管理员 - 管理壁纸
  RoleSuperAdmin  = "super_admin" // 超管 - 全权限
)
```

**权限列表**:
- `view_wallpapers`: 查看壁纸
- `generate_wallpapers`: 生成壁纸
- `delete_own_wallpapers`: 删除自己的壁纸
- `delete_any_wallpapers`: 删除任意壁纸
- `manage_users`: 管理用户
- `system_admin`: 系统管理

**认证流程**:
1. 邮箱注册/登录
2. JWT Token签发
3. 访客会话支持
4. Refresh Token机制

### 5. VIP会员系统
**文件位置**: `src/lib/vip-service.ts`, `src/app/api/vip/`

**VIP特权**:
- AI智能压缩无限使用
- 提示词优化高级功能
- 无水印下载
- 优先生成队列
- 更高的存储配额

**升级路径**:
- 免费用户 → VIP用户
- 支付集成 (规划中)
- 订阅管理

### 6. 管理后台系统
**文件位置**: `src/app/admin/`

**管理模块**:
- **仪表板** (`admin/page.tsx`): 系统概览
- **用户管理** (`admin/users/`): 用户CRUD
- **壁纸管理** (`admin/wallpapers/`): 内容审核
- **审计日志** (`admin/audit/`): 操作记录
- **通知管理** (`admin/notifications/`): 消息推送
- **系统设置** (`admin/settings/`): 配置管理

**管理功能**:
- 用户封禁/激活
- 壁纸审核/删除
- 批量操作
- 数据导出
- 图片清理 (`/api/admin/cleanup-images`)

---

## 🔌 API接口文档

### 前端API路由 (Next.js)

#### 认证模块
```
POST   /api/auth/register          用户注册
POST   /api/auth/login             用户登录
POST   /api/auth/guest-session     访客会话
POST   /api/auth/send-code         发送验证码
GET    /api/auth/captcha           获取验证码
GET    /api/auth/usage             使用统计
```

#### 壁纸模块
```
GET    /api/wallpapers             获取壁纸列表
GET    /api/wallpapers/:id         壁纸详情
POST   /api/generate               AI生成壁纸
POST   /api/download/:id           下载壁纸
POST   /api/scrape-wallpapers      爬取壁纸
```

#### 用户模块
```
GET    /api/user/profile           用户资料
PUT    /api/user/profile           更新资料
GET    /api/user/stats             用户统计
GET    /api/user/wallpapers        用户壁纸
GET    /api/user/favorites         收藏列表
POST   /api/user/favorites         添加收藏
POST   /api/user/avatar            更新头像
GET    /api/user/activities        活动记录
GET    /api/user/privacy           隐私设置
```

#### 图片处理
```
POST   /api/compress               压缩图片
GET    /api/compressed/:filename   获取压缩图
POST   /api/optimize-prompt        优化提示词
GET    /api/image-proxy            图片代理
GET    /api/download-proxy         下载代理
```

#### 管理员API
```
GET    /api/admin/wallpapers       所有壁纸
POST   /api/admin/upload           上传文件
POST   /api/admin/cleanup-images   清理图片
```

#### 其他
```
GET    /api/api-status             API状态
POST   /api/test-apis              测试API
GET    /api/storage/status         存储状态
POST   /api/vip/upgrade            VIP升级
POST   /api/purchase-optimizations 购买优化次数
POST   /api/scrape-giphy           爬取Giphy
GET    /api/giphy-content          Giphy内容
```

### 后端API路由 (Go)

#### 认证相关
```
POST   /api/auth/register          用户注册
POST   /api/auth/login             用户登录
POST   /api/auth/logout            用户登出
GET    /api/auth/me                当前用户
POST   /api/auth/refresh-token     刷新Token
POST   /api/auth/guest-session     访客会话
```

#### 用户管理
```
GET    /api/users/profile          用户资料
PUT    /api/users/profile          更新资料
GET    /api/users/stats            用户统计
GET    /api/users/activities       活动记录
GET    /api/users/wallpapers       用户壁纸
GET    /api/users/favorites        收藏列表
POST   /api/users/favorites        添加收藏
DELETE /api/users/favorites/:id    取消收藏
```

#### 壁纸管理
```
GET    /api/wallpapers             壁纸列表
GET    /api/wallpapers/:id         壁纸详情
POST   /api/wallpapers/generate    生成壁纸
DELETE /api/wallpapers/:id         删除壁纸
```

#### 图片处理
```
POST   /api/images/compress        压缩图片
GET    /api/images/compressed/:filename 获取压缩图
```

#### 管理员功能
```
GET    /api/admin/dashboard        管理仪表板
GET    /api/admin/users            用户列表
PUT    /api/admin/users/:id        编辑用户
DELETE /api/admin/users/:id        删除用户
GET    /api/admin/wallpapers       所有壁纸
DELETE /api/admin/wallpapers/:id   删除壁纸
GET    /api/admin/activities       活动日志
```

---

## 💾 数据库设计

### PostgreSQL核心表结构

#### 用户表 (users)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    bio TEXT,
    role VARCHAR(20) DEFAULT 'user',
    is_vip BOOLEAN DEFAULT false,
    language VARCHAR(10) DEFAULT 'zh-CN',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### 壁纸表 (wallpapers)
```sql
CREATE TABLE wallpapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    format VARCHAR(10) NOT NULL,
    user_id UUID REFERENCES users(id),
    downloads BIGINT DEFAULT 0,
    tags JSONB,
    optimized_for_360 BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);
```

#### 收藏表 (favorites)
```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    wallpaper_id UUID REFERENCES wallpapers(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, wallpaper_id)
);
```

#### 活动日志表 (activities)
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Redis缓存设计
```yaml
会话存储:
  - session:{session_id}: 用户会话数据
  - user_token:{user_id}: JWT Token黑名单

缓存策略:
  - wallpaper_list:{category}: 壁纸列表缓存 (TTL: 5分钟)
  - wallpaper_detail:{id}: 壁纸详情缓存 (TTL: 10分钟)
  - user_stats:{user_id}: 用户统计缓存 (TTL: 1分钟)

限流控制:
  - rate_limit:{ip}:{endpoint}: API限流 (滑动窗口)
  - generate_limit:{user_id}: 生成次数限制
```

---

## 🔧 环境配置

### 前端环境变量 (.env.local)
```bash
# AI服务
FAL_KEY=fal_xxxxx                         # fal.ai API密钥
FASTGPT_KEY=fastgpt-xxxxx                 # FastGPT密钥

# 图片服务
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# 壁纸源API
UNSPLASH_ACCESS_KEY=your_unsplash_key
PEXELS_API_KEY=your_pexels_key
GIPHY_API_KEY=your_giphy_key

# 后端代理
NEXT_PUBLIC_GO_BACKEND_URL=http://localhost:8080

# 部署环境
CF_PAGES=true                             # Cloudflare Pages标识
NODE_ENV=production
```

### 后端环境变量 (backend/.env)
```bash
# 应用配置
ENVIRONMENT=development
PORT=8080
FRONTEND_URL=http://localhost:3000

# 数据库
DATABASE_URL=postgres://user:password@localhost:5432/aiicg?sslmode=disable
REDIS_URL=redis://localhost:6379

# JWT认证
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# 第三方服务
FAL_API_KEY=fal_xxxxx
FASTGPT_KEY=fastgpt-xxxxx
UNSPLASH_API_KEY=your_unsplash_key
PEXELS_API_KEY=your_pexels_key
GIPHY_API_KEY=your_giphy_key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# 邮件服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@aiicg.com
```

---

## 🚀 部署指南

### 开发环境启动

#### 前端开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 访问: http://localhost:3000

# 代码检查
npm run lint

# 生产构建
npm run build
npm run start
```

#### 后端开发
```bash
cd backend

# 安装依赖
go mod download

# 启动开发服务器
go run cmd/server/main.go
# 访问: http://localhost:8080

# 构建二进制
go build -o bin/server cmd/server/main.go
./bin/server
```

### 生产环境部署

#### VPS快速部署 (一键脚本)
```bash
# 下载并执行部署脚本
curl -fsSL https://raw.githubusercontent.com/rabbit301/aiicg-wallpaper/master/deploy.sh | sudo bash

# 或分步执行
wget https://raw.githubusercontent.com/rabbit301/aiicg-wallpaper/master/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

**系统要求**:
- OS: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- RAM: 最低2GB, 推荐4GB+
- 存储: 最低10GB可用
- 权限: root或sudo

**部署后管理**:
```bash
# 查看状态
sudo -u aiicg pm2 status

# 查看日志
sudo -u aiicg pm2 logs aiicg-wallpaper

# 重启应用
sudo -u aiicg pm2 restart aiicg-wallpaper

# 更新应用
cd /var/www/aiicg-wallpaper
git pull origin master
npm install && npm run build
sudo -u aiicg pm2 restart aiicg-wallpaper
```

#### Docker部署
```bash
# 构建镜像
docker build -t aiicg-backend ./backend

# 运行容器
docker run -p 8080:8080 --env-file .env aiicg-backend

# Docker Compose (推荐)
docker-compose up -d

# 查看日志
docker-compose logs -f backend
```

#### Cloudflare Pages部署
```yaml
构建配置:
  框架预设: Next.js
  构建命令: npm run build
  输出目录: .next
  Node版本: 20.x

环境变量:
  - 在CF Pages设置中配置所有NEXT_PUBLIC_*变量
  - 配置FAL_KEY, CLOUDINARY_*等敏感密钥

优化配置:
  - 启用Edge Network
  - 开启自动HTTPS
  - 配置自定义域名
  - 设置页面规则 (缓存策略)
```

---

## 📊 性能优化策略

### 前端优化
```yaml
代码分割:
  - React核心库: 5MB限制
  - UI组件库: 5MB限制 (lucide-react, TailwindCSS)
  - 第三方vendor: 10MB限制
  - 最大chunk: 15MB (CF Pages限制25MB)

图片优化:
  - Next.js Image组件自动优化
  - WebP格式优先
  - 响应式图片 (srcset)
  - 延迟加载 (lazy loading)
  - 预设尺寸: 640, 750, 828, 1080, 1200, 1920, 2048, 3840

缓存策略:
  - 静态资源: 浏览器缓存 + CDN缓存
  - API响应: SWR + React Query
  - 图片CDN: Cloudinary + 兰空图床

渲染优化:
  - Server Components (RSC)
  - 流式SSR (Streaming SSR)
  - 选择性水合 (Selective Hydration)
```

### 后端优化
```yaml
数据库优化:
  - 索引策略: 主键 + 外键 + 查询字段
  - 连接池: 最大50连接
  - 慢查询监控: >100ms告警
  - 定期VACUUM (PostgreSQL)

缓存策略:
  - Redis缓存热点数据
  - 列表数据: 5分钟TTL
  - 详情数据: 10分钟TTL
  - 统计数据: 1分钟TTL

API限流:
  - IP限流: 100请求/分钟
  - 用户限流: 1000请求/小时
  - 生成限流: 10次/小时 (免费用户)
  - 滑动窗口算法

并发控制:
  - Goroutine池化
  - 请求队列
  - 优雅关闭
```

### CDN与图片优化
```yaml
Cloudinary配置:
  - 自动格式转换 (f_auto)
  - 质量优化 (q_auto)
  - 响应式图片 (w_auto,c_scale)
  - WebP回退 (PNG/JPG)

兰空图床配置:
  - 域名: 555125.xyz
  - 优先级: 最高
  - 用途: 高频访问图片

缓存策略:
  - Browser Cache: 7天
  - CDN Cache: 30天
  - Stale-While-Revalidate: 启用
```

---

## 🧪 测试与质量保证

### 测试文件
```
测试工具:
  - public/test-api.html: API功能测试
  - public/test-image.html: 图片处理测试
  - backend/test_email.go: 邮件服务测试
  - backend/test_verification_flow.go: 验证流程测试
  - src/app/test-optimizer/page.tsx: 提示词优化测试
  - src/app/api-test/page.tsx: API集成测试

Go测试:
  # 运行所有测试
  cd backend && go test ./...

  # 测试覆盖率
  go test -cover ./...
```

### 代码规范
```yaml
前端规范:
  - ESLint: Next.js官方配置
  - TypeScript严格模式
  - React 19最佳实践
  - TailwindCSS规范命名

后端规范:
  - gofmt代码格式化
  - golint代码检查
  - 函数注释强制
  - 错误处理完整性
```

---

## 📚 文档资源

### 核心文档
- **PRD.md**: 产品需求文档
- **VPS_DEPLOYMENT.md**: VPS详细部署指南
- **README_VPS_DEPLOY.md**: VPS快速部署
- **CLOUDINARY_SETUP.md**: Cloudinary配置教程
- **PROMPT_OPTIMIZER_DEMO.md**: 提示词优化演示
- **backend/README.md**: 后端技术文档

### 配置文档
- **backend/env.example**: 环境变量模板
- **backend/remote-config.md**: 远程部署配置
- **backend/server-local-config.md**: 本地服务器配置

### 问题追踪
- **issues/**: 问题跟踪目录
- **git-branch-switch-issue-solution.md**: Git分支切换问题解决

---

## 🔐 安全措施

### 认证与授权
```yaml
JWT认证:
  - 签名算法: HS256
  - Token过期: 24小时
  - Refresh Token: 7天
  - 黑名单机制: Redis存储

密码安全:
  - 加密算法: bcrypt
  - 盐值长度: 10轮
  - 密码策略: 8位以上,含大小写+数字

CORS策略:
  - 允许来源: FRONTEND_URL
  - 允许方法: GET, POST, PUT, DELETE
  - 凭证传递: true
```

### 数据安全
```yaml
数据库安全:
  - 连接加密: SSL/TLS
  - 预编译语句: 防SQL注入
  - 敏感数据加密: AES-256
  - 备份策略: 每日自动备份

API安全:
  - 限流保护: 防DDoS
  - 参数验证: 强制类型检查
  - XSS防护: 输入过滤
  - CSRF防护: Token验证
```

### 文件安全
```yaml
上传限制:
  - 文件类型: PNG, JPG, WebP, GIF
  - 文件大小: 最大10MB
  - 病毒扫描: ClamAV (计划中)
  - 文件名过滤: 防路径遍历

存储安全:
  - 访问控制: ACL策略
  - 加密存储: 敏感文件
  - 定期清理: 过期文件自动删除
```

---

## 📈 监控与日志

### 日志系统
```yaml
前端日志:
  - 工具: Vercel Analytics
  - 错误追踪: Sentry (计划中)
  - 性能监控: Web Vitals

后端日志:
  - 框架: Gin Logger中间件
  - 日志级别: DEBUG, INFO, WARN, ERROR
  - 日志存储: 文件 + 控制台
  - 日志轮转: 每日归档

数据库日志:
  - 慢查询: >100ms
  - 错误日志: 连接失败/查询异常
  - 备份日志: 备份成功/失败记录
```

### 监控指标
```yaml
系统监控:
  - CPU使用率
  - 内存使用率
  - 磁盘IO
  - 网络流量

应用监控:
  - API响应时间
  - 错误率
  - 并发连接数
  - 数据库连接池状态

业务监控:
  - 用户注册数
  - 壁纸生成量
  - 下载次数
  - VIP转化率
```

---

## 🛠️ 常用命令参考

### 开发命令
```bash
# 前端
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run start        # 启动生产服务器
npm run lint         # 代码检查

# 后端
cd backend
go run cmd/server/main.go           # 启动开发服务器
go build -o bin/server cmd/server/main.go  # 构建
./bin/server                        # 运行
go test ./...                       # 测试
```

### PM2管理
```bash
pm2 status                  # 查看状态
pm2 logs aiicg-wallpaper    # 查看日志
pm2 restart aiicg-wallpaper # 重启
pm2 stop aiicg-wallpaper    # 停止
pm2 delete aiicg-wallpaper  # 删除
```

### Docker命令
```bash
docker-compose up -d        # 启动所有服务
docker-compose down         # 停止所有服务
docker-compose logs -f      # 查看日志
docker-compose restart      # 重启服务
docker-compose ps           # 查看状态
```

### Nginx管理
```bash
sudo nginx -t               # 测试配置
sudo systemctl restart nginx # 重启
sudo systemctl status nginx  # 查看状态
sudo tail -f /var/log/nginx/error.log # 查看错误日志
```

### Git工作流
```bash
# 切换到开发分支
git checkout test

# 拉取最新代码
git pull origin test

# 创建功能分支
git checkout -b feature/new-feature

# 提交更改
git add .
git commit -m "feat: add new feature"

# 推送分支
git push origin feature/new-feature

# 合并到test分支
git checkout test
git merge feature/new-feature

# 推送到远程
git push origin test
```

---

## 🎯 开发路线图

### 已完成功能 ✅
- [x] AI壁纸生成 (fal.ai集成)
- [x] 多源壁纸聚合 (Unsplash/Pexels/Giphy)
- [x] 图片压缩与优化
- [x] 用户认证系统 (JWT)
- [x] 提示词优化 (FastGPT)
- [x] 中英文切换
- [x] 深色模式
- [x] 管理后台
- [x] VIP会员系统
- [x] VPS一键部署

### 进行中功能 🚧
- [ ] WebSocket实时通知
- [ ] 图片社交功能 (点赞/评论)
- [ ] 用户主页
- [ ] 壁纸收藏夹增强

### 计划中功能 📋
- [ ] 移动端App (React Native)
- [ ] 桌面客户端 (Electron)
- [ ] AI视频壁纸生成
- [ ] 3D壁纸支持
- [ ] 区块链NFT集成
- [ ] 支付系统 (微信/支付宝)
- [ ] CDN加速优化
- [ ] 多语言支持扩展 (日韩)

---

## 🐛 已知问题

### 高优先级
1. **Cloudflare Pages构建大小限制**:
   - 问题: 单文件超过25MB导致部署失败
   - 方案: 实施代码分割策略 (next.config.ts:72-110)
   - 状态: 已优化,持续监控

2. **LightningCSS原生模块问题**:
   - 问题: CF Pages构建环境不支持原生模块
   - 方案: 条件外部化 + 禁用文件系统缓存
   - 状态: 已解决 (next.config.ts:56-67)

### 中优先级
3. **图片代理性能**:
   - 问题: 大量外部图片请求导致响应慢
   - 方案: 增加Redis缓存层 + CDN预热
   - 状态: 计划中

4. **数据库查询优化**:
   - 问题: 壁纸列表查询存在N+1问题
   - 方案: 使用JOIN优化 + 增加索引
   - 状态: 待实施

### 低优先级
5. **邮件发送延迟**:
   - 问题: SMTP发送偶尔超时
   - 方案: 使用消息队列异步处理
   - 状态: 规划中

---

## 🤝 贡献指南

### 开发流程
1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交Pull Request

### Commit规范
```
feat:     新功能
fix:      Bug修复
docs:     文档更新
style:    代码格式调整
refactor: 代码重构
perf:     性能优化
test:     测试相关
chore:    构建/工具链更新
```

### 代码审查要求
- 所有PR需至少1人审核
- 必须通过CI测试
- 代码覆盖率不低于80%
- 遵循项目代码规范

---

## 📞 联系与支持

### 项目仓库
- GitHub: [rabbit301/aiicg-wallpaper](https://github.com/rabbit301/aiicg-wallpaper)

### 问题报告
- 通过GitHub Issues提交Bug
- 详细描述问题复现步骤
- 附上相关日志和截图

### 技术支持
- 查看项目文档
- 参考部署指南
- 提交Issue获取帮助

---

## 📄 许可证
MIT License

---

**文档维护者**: 浮浮酱 (AI猫娘工程师)
**最后更新**: 2025-10-05
**文档状态**: 活跃维护中 ✨

---

> 💡 **提示**: 本文档由AI自动生成并持续更新，如发现任何错误或过时信息，请及时反馈喵～
