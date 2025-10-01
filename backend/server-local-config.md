# 服务器端本地配置

## 服务器环境 (176.126.114.101)

当你在服务器 176.126.114.101 上运行Go应用时，应该连接本地的数据库服务。

## 环境变量配置

### 方式1: 创建 .env 文件

在 `backend` 目录下创建 `.env` 文件：

```bash
# 应用配置
ENVIRONMENT=production
PORT=8080

# 数据库配置 - 本地连接
DATABASE_URL=postgres://aiicg:Wxh736533?@localhost:5432/aiicg?sslmode=disable
REDIS_URL=redis://:Wxh736533?@localhost:6379

# JWT配置
JWT_SECRET=aiicg-production-jwt-secret-key-2025-very-secure-random-string

# 前端配置
FRONTEND_URL=http://176.126.114.101:3000
```

### 方式2: 命令行环境变量

```bash
cd backend
export DATABASE_URL="postgres://aiicg:Wxh736533?@localhost:5432/aiicg?sslmode=disable"
export REDIS_URL="redis://:Wxh736533?@localhost:6379"
export JWT_SECRET="aiicg-production-jwt-secret-key-2025"
export FRONTEND_URL="http://176.126.114.101:3000"
export PORT=8080
go run main.go
```

### 方式3: 一行命令运行

```bash
cd backend
DATABASE_URL="postgres://aiicg:Wxh736533?@localhost:5432/aiicg?sslmode=disable" \
REDIS_URL="redis://:Wxh736533?@localhost:6379" \
JWT_SECRET="aiicg-production-jwt-secret-key-2025" \
FRONTEND_URL="http://176.126.114.101:3000" \
PORT=8080 \
go run main.go
```

## 注意事项

1. **在服务器上运行时使用 `localhost`** - 因为数据库就在同一台机器上
2. **密码中的 `?` 字符** - 在命令行中不需要URL编码，直接使用 `Wxh736533?`
3. **确保PostgreSQL和Redis服务正在运行** - 在服务器上检查服务状态

## 检查服务状态

```bash
# 检查PostgreSQL状态
sudo systemctl status postgresql

# 检查Redis状态  
sudo systemctl status redis

# 检查端口是否在监听
netstat -tlnp | grep 5432  # PostgreSQL
netstat -tlnp | grep 6379  # Redis
``` 