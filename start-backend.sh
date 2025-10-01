#!/bin/bash

echo "🚀 启动 AIICG 后端服务器"
echo "📁 项目目录: $(pwd)"

# 确保在项目根目录
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ 错误: 请在项目根目录下运行此脚本"
    echo "   项目根目录应该包含 package.json 和 backend/ 目录"
    exit 1
fi

# 检查.env文件
if [ -f ".env" ]; then
    echo "✅ 找到根目录 .env 文件"
elif [ -f "backend/.env" ]; then
    echo "✅ 找到 backend/.env 文件"
    cp backend/.env .
    echo "📋 已复制 .env 文件到根目录"
else
    echo "❌ 未找到 .env 配置文件"
    echo "   请确保在 backend/ 目录下有 .env 文件"
    exit 1
fi

echo "🔨 编译后端应用程序..."
cd backend
go build -o main ./cmd/server
if [ $? -ne 0 ]; then
    echo "❌ 编译失败!"
    exit 1
fi

echo "✅ 编译成功"
echo "🌐 启动服务器..."
echo "📖 配置信息:"
echo "   - 数据库: 176.126.114.101:5432"
echo "   - Redis: 176.126.114.101:6379"
echo "   - 服务端口: 8080"
echo "   - 健康检查: http://localhost:8080/health"
echo ""

# 运行应用程序
go run ./cmd/server/main.go 