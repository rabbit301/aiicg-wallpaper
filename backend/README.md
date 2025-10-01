# AIICG Wallpaper Backend

AIICG壁纸站后端API服务，使用Go + Gin + PostgreSQL构建。

## 技术栈

- **Go 1.21+**: 后端语言
- **Gin**: Web框架
- **PostgreSQL**: 主数据库
- **Redis**: 缓存和会话存储
- **GORM**: ORM框架
- **JWT**: 身份认证
- **Docker**: 容器化部署

## 项目结构

```
backend/
├── cmd/
│   └── server/
│       └── main.go          # 应用入口
├── internal/
│   ├── config/             # 配置管理
│   ├── models/             # 数据模型
│   ├── handlers/           # 路由处理器
│   ├── services/           # 业务逻辑
│   ├── middleware/         # 中间件
│   └── database/           # 数据库连接
├── pkg/
│   ├── auth/              # JWT认证
│   ├── utils/             # 工具函数
│   └── types/             # 类型定义
├── migrations/            # 数据库迁移
├── docker/               # Docker配置
├── go.mod               # Go模块
└── README.md           # 项目文档
```

## 快速开始

### 1. 环境要求

- Go 1.21+
- PostgreSQL 15+
- Redis 7+

### 2. 安装依赖

```bash
cd backend
go mod download
```

### 3. 环境配置

创建`.env`文件：

```bash
# 应用环境配置
ENVIRONMENT=development
PORT=8080
FRONTEND_URL=http://localhost:3000

# 数据库配置
DATABASE_URL=postgres://user:password@localhost:5432/aiicg?sslmode=disable
REDIS_URL=redis://localhost:6379

# JWT认证配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 第三方API密钥
FAL_API_KEY=your-fal-api-key
FASTGPT_KEY=your-fastgpt-key
UNSPLASH_API_KEY=your-unsplash-key
PEXELS_API_KEY=your-pexels-key
GIPHY_API_KEY=your-giphy-key

# Cloudinary配置
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@aiicg.com
```

### 4. 启动服务

```bash
# 开发模式
go run cmd/server/main.go

# 或构建后运行
go build -o bin/server cmd/server/main.go
./bin/server
```

### 5. 数据库迁移

服务启动时会自动运行数据库迁移，创建必要的表结构。

## API 接口

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/refresh-token` - 刷新访问令牌
- `POST /api/auth/guest-session` - 创建访客会话

### 用户管理

- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息
- `GET /api/users/stats` - 获取用户统计
- `GET /api/users/activities` - 获取用户活动记录
- `GET /api/users/wallpapers` - 获取用户壁纸
- `GET /api/users/favorites` - 获取收藏列表
- `POST /api/users/favorites` - 添加收藏
- `DELETE /api/users/favorites/:id` - 取消收藏

### 壁纸管理

- `GET /api/wallpapers` - 获取壁纸列表
- `GET /api/wallpapers/:id` - 获取壁纸详情
- `POST /api/wallpapers/generate` - 生成壁纸
- `DELETE /api/wallpapers/:id` - 删除壁纸

### 图片处理

- `POST /api/images/compress` - 压缩图片
- `GET /api/images/compressed/:filename` - 获取压缩后图片

### 管理员功能

- `GET /api/admin/dashboard` - 管理员仪表板
- `GET /api/admin/users` - 用户管理
- `PUT /api/admin/users/:id` - 编辑用户
- `DELETE /api/admin/users/:id` - 删除用户
- `GET /api/admin/wallpapers` - 所有壁纸管理
- `DELETE /api/admin/wallpapers/:id` - 删除壁纸
- `GET /api/admin/activities` - 系统活动日志

## 数据库模型

### 用户表 (users)

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

### 壁纸表 (wallpapers)

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

## 权限系统

### 角色定义

- `guest`: 访客 - 仅可查看壁纸
- `user`: 用户 - 可生成、下载、管理自己的壁纸
- `admin`: 管理员 - 可管理所有壁纸
- `super_admin`: 超级管理员 - 可管理用户和系统

### 权限列表

- `view_wallpapers`: 查看壁纸
- `generate_wallpapers`: 生成壁纸
- `delete_own_wallpapers`: 删除自己的壁纸
- `delete_any_wallpapers`: 删除任意壁纸
- `manage_users`: 管理用户
- `system_admin`: 系统管理

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t aiicg-backend .

# 运行容器
docker run -p 8080:8080 --env-file .env aiicg-backend
```

### Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f backend
```

## 开发

### 代码规范

- 使用gofmt格式化代码
- 函数和方法添加注释
- 错误处理要完整
- 使用有意义的变量名

### 测试

```bash
# 运行测试
go test ./...

# 运行测试并显示覆盖率
go test -cover ./...
```

### 数据库迁移

GORM会自动处理数据库迁移，如需手动迁移：

```bash
# 创建新的迁移文件
# 在 migrations/ 目录下创建SQL文件
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查PostgreSQL是否运行
   - 验证DATABASE_URL配置
   - 确认数据库权限

2. **Redis连接失败**
   - 检查Redis是否运行
   - 验证REDIS_URL配置

3. **JWT验证失败**
   - 检查JWT_SECRET配置
   - 确认token格式正确

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License 