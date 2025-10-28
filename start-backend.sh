#!/bin/bash

echo "🚀 启动AI工具集后端服务..."

cd backend

# 检查.env文件是否存在
if [ ! -f .env ]; then
    echo "📝 创建.env配置文件..."
    cp env.example .env
    echo "✅ .env文件已创建，请检查配置"
fi

# 检查node_modules是否存在
if [ ! -d node_modules ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动服务
echo "🚀 启动后端服务..."
npm run dev
