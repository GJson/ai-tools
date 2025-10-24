#!/bin/bash

# 快速部署脚本
echo "🚀 AI工具集网站快速部署到阿里云ECS"

# 构建项目
echo "📦 构建生产版本..."
npm run build

# 创建部署包
echo "📁 创建部署包..."
tar -czf ai-tools.tar.gz dist/

# 上传到服务器
echo "📤 上传到服务器 47.95.118.57..."
scp ai-tools.tar.gz gjson@47.95.118.57:/home/gjson/

# 在服务器上部署
echo "🔧 在服务器上部署..."
ssh gjson@47.95.118.57 << 'EOF'
    echo "在服务器上执行部署..."
    
    # 创建网站目录
    sudo mkdir -p /var/www/ai-tools
    
    # 解压文件
    cd /home/gjson
    sudo tar -xzf ai-tools.tar.gz -C /var/www/ai-tools/
    
    # 设置权限
    sudo chown -R www-data:www-data /var/www/ai-tools
    sudo chmod -R 755 /var/www/ai-tools
    
    # 检查是否有Nginx
    if command -v nginx &> /dev/null; then
        echo "配置Nginx..."
        sudo tee /etc/nginx/sites-available/ai-tools << 'NGINX'
server {
    listen 80;
    server_name 47.95.118.57;
    root /var/www/ai-tools/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX
        
        sudo ln -sf /etc/nginx/sites-available/ai-tools /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        echo "✅ Nginx配置完成"
    else
        echo "⚠️  Nginx未安装，使用Python简单服务器..."
        cd /var/www/ai-tools/dist
        echo "启动Python服务器在端口80..."
        sudo python3 -m http.server 80 &
    fi
    
    echo "🎉 部署完成！"
    echo "🌐 网站地址: http://47.95.118.57"
EOF

# 清理本地文件
rm ai-tools.tar.gz

echo "✅ 部署完成！"
echo "🌐 访问地址: http://47.95.118.57"
