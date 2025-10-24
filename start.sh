#!/bin/bash

# AI工具集项目启动脚本

echo "🚀 启动AI工具集项目..."

# 检查Node.js版本
node_version=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ 错误: 未安装Node.js，请先安装Node.js 16+"
    exit 1
fi

echo "✅ Node.js版本: $node_version"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "📍 项目地址: http://localhost:3000"
echo "🛑 按 Ctrl+C 停止服务器"
echo ""

npm run dev
