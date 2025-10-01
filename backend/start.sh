#!/bin/bash

# 确保在backend目录下运行
cd "$(dirname "$0")"

echo "🚀 启动 aiicg-backend 服务器"
echo "📁 当前目录: $(pwd)"
echo "🔍 检查 .env 文件..."

if [ -f ".env" ]; then
    echo "✅ .env 文件存在"
    echo "📄 .env 文件内容:"
    cat .env
    echo ""
else
    echo "❌ .env 文件不存在!"
    echo "请确保 .env 文件在 backend 目录下"
    exit 1
fi

echo "🔨 编译应用程序..."
go build -o main ./cmd/server
if [ $? -ne 0 ]; then
    echo "❌ 编译失败!"
    exit 1
fi

echo "✅ 编译成功"
echo "🌐 启动服务器..."
echo "📖 如果连接失败，请检查："
echo "   1. 确保在 backend 目录下运行此脚本"
echo "   2. 确保 .env 文件配置正确"
echo "   3. 确保远程数据库服务器可访问"
echo ""

./main 