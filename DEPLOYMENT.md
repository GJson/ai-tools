# AI工具集网站部署指南

## 🎯 部署目标
- **服务器**: 阿里云ECS (47.95.118.57)
- **用户**: gjson
- **网站**: AI工具集 (http://47.95.118.57)

## 📋 部署前准备

### 1. 服务器环境检查
```bash
# 登录服务器
ssh gjson@47.95.118.57

# 检查系统信息
uname -a
cat /etc/os-release

# 检查Nginx是否已安装
nginx -v
```

### 2. 安装必要软件（如果未安装）
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Nginx
sudo apt install nginx -y

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查防火墙状态
sudo ufw status
```

## 🚀 自动部署

### 方法1: 使用部署脚本（推荐）
```bash
# 在项目根目录运行
./deploy.sh
```

### 方法2: 手动部署
```bash
# 1. 构建项目
npm run build

# 2. 创建部署包
tar -czf ai-tools-collection.tar.gz dist/

# 3. 上传到服务器
scp ai-tools-collection.tar.gz gjson@47.95.118.57:/home/gjson/

# 4. 在服务器上部署
ssh gjson@47.95.118.57
```

## 🔧 服务器配置

### 1. 创建网站目录
```bash
sudo mkdir -p /var/www/ai-tools
sudo chown -R www-data:www-data /var/www/ai-tools
sudo chmod -R 755 /var/www/ai-tools
```

### 2. 解压文件
```bash
cd /home/gjson
sudo tar -xzf ai-tools-collection.tar.gz -C /var/www/ai-tools/
```

### 3. 配置Nginx
```bash
sudo nano /etc/nginx/sites-available/ai-tools
```

添加以下配置：
```nginx
server {
    listen 80;
    server_name 47.95.118.57;
    root /var/www/ai-tools/dist;
    index index.html;

    # 处理Vue Router的history模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

### 4. 启用站点
```bash
# 创建软链接
sudo ln -sf /etc/nginx/sites-available/ai-tools /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl reload nginx
```

## 🔍 部署验证

### 1. 检查服务状态
```bash
# 检查Nginx状态
sudo systemctl status nginx

# 检查端口监听
sudo netstat -tlnp | grep :80
```

### 2. 测试网站访问
```bash
# 本地测试
curl -I http://47.95.118.57

# 检查网站内容
curl http://47.95.118.57 | head -20
```

### 3. 浏览器访问
打开浏览器访问: http://47.95.118.57

## 🛠️ 常见问题解决

### 1. 权限问题
```bash
# 修复文件权限
sudo chown -R www-data:www-data /var/www/ai-tools
sudo chmod -R 755 /var/www/ai-tools
```

### 2. Nginx配置错误
```bash
# 检查配置语法
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 3. 端口被占用
```bash
# 检查端口占用
sudo lsof -i :80

# 停止占用进程
sudo kill -9 <PID>
```

### 4. 防火墙问题
```bash
# 开放80端口
sudo ufw allow 80
sudo ufw allow 'Nginx Full'
```

## 📊 性能优化

### 1. 启用Gzip压缩
在Nginx配置中添加：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. 设置缓存策略
```nginx
# 静态资源长期缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔄 更新部署

### 1. 更新网站内容
```bash
# 重新构建
npm run build

# 重新部署
./deploy.sh
```

### 2. 回滚到之前版本
```bash
# 如果有备份，可以恢复
sudo cp -r /var/www/ai-tools-backup /var/www/ai-tools
sudo systemctl reload nginx
```

## 📈 监控和维护

### 1. 查看访问日志
```bash
sudo tail -f /var/log/nginx/access.log
```

### 2. 查看错误日志
```bash
sudo tail -f /var/log/nginx/error.log
```

### 3. 监控服务器资源
```bash
# CPU和内存使用情况
htop

# 磁盘使用情况
df -h
```

## 🎉 部署完成

部署成功后，你可以通过以下方式访问网站：
- **网站地址**: http://47.95.118.57
- **管理地址**: http://47.95.118.57/debug (调试页面)

## 📞 技术支持

如果遇到问题，可以：
1. 检查服务器日志
2. 验证Nginx配置
3. 确认文件权限
4. 检查网络连接
