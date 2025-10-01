# 远程服务器配置

## 服务器信息
- 服务器IP: 176.126.114.101
- PostgreSQL 端口: 5432
- Redis 端口: 6379

## 数据库配置

### PostgreSQL
- 数据库名: aiicg
- 用户名: aiicg  
- 密码: Wxh736533?

### Redis
- 密码: Wxh736533?

## 环境变量配置

由于密码包含特殊字符 `?`，在URL中需要进行URL编码，`?` 需要编码为 `%3F`

### 完整的环境变量设置:

```bash
export ENVIRONMENT=production
export PORT=8080
export DATABASE_URL="postgres://aiicg:Wxh736533%3F@176.126.114.101:5432/aiicg?sslmode=disable"
export REDIS_URL="redis://:Wxh736533%3F@176.126.114.101:6379"
export JWT_SECRET="aiicg-production-jwt-secret-key-2025-very-secure-random-string"
export FRONTEND_URL="http://176.126.114.101:3000"
```

### 创建 .env 文件

你也可以手动创建 `.env` 文件，内容如下：

```
ENVIRONMENT=production
PORT=8080
DATABASE_URL=postgres://aiicg:Wxh736533%3F@176.126.114.101:5432/aiicg?sslmode=disable
REDIS_URL=redis://:Wxh736533%3F@176.126.114.101:6379
JWT_SECRET=aiicg-production-jwt-secret-key-2025-very-secure-random-string
FRONTEND_URL=http://176.126.114.101:3000
```

## 测试连接

使用以下命令测试远程连接：

```bash
cd backend
DATABASE_URL="postgres://aiicg:Wxh736533%3F@176.126.114.101:5432/aiicg?sslmode=disable" \
REDIS_URL="redis://:Wxh736533%3F@176.126.114.101:6379" \
JWT_SECRET="aiicg-production-jwt-secret-key-2025" \
FRONTEND_URL="http://176.126.114.101:3000" \
PORT=8080 \
./main
``` 