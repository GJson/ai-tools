#!/bin/bash

# AI工具集后端生产环境启动脚本
# 用于在服务器上直接启动后端服务

echo "🚀 启动AI工具集后端生产服务..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在backend目录运行此脚本"
    exit 1
fi

# 检查.env文件是否存在
if [ ! -f .env ]; then
    echo "📝 创建.env配置文件..."
    cp env.example .env
    echo "✅ .env文件已创建，请检查配置"
fi

# 检查node_modules是否存在
if [ ! -d node_modules ]; then
    echo "📦 安装依赖..."
    npm install --production
fi

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装PM2..."
    npm install -g pm2
fi

# 停止现有服务
echo "🛑 停止现有服务..."
pm2 stop ai-tools-backend 2>/dev/null || true
pm2 delete ai-tools-backend 2>/dev/null || true

# 启动服务
echo "🚀 启动后端服务..."
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js --env production
else
    pm2 start src/app.js --name "ai-tools-backend" --env production
fi

# 保存PM2配置
pm2 save

# 显示服务状态
echo "📊 服务状态:"
pm2 status

echo "🎉 后端服务启动完成！"
echo "📋 查看日志: pm2 logs ai-tools-backend"
echo "🛑 停止服务: pm2 stop ai-tools-backend"
