# AI工具集后端部署说明

## 🚀 快速部署

### 1. 使用部署脚本（推荐）

```bash
# 在项目根目录执行
./deploy-server.sh
```

**注意**: 部署脚本已集成所有修复功能，包括：
- 数据库连接配置
- 端口冲突解决
- Nginx代理配置
- 健康检查验证

### 2. 手动部署

#### 本地准备
```bash
# 1. 检查环境
node --version  # 需要 >= 16.0.0

# 2. 安装依赖
cd backend
npm install

# 3. 配置环境变量
cp env.example .env
# 编辑 .env 文件，配置生产环境参数
```

#### 服务器部署
```bash
# 1. 上传代码
scp -r backend/ user@ip:/opt/ai-tools-backend/

# 2. 登录服务器
ssh user@ip

# 3. 安装依赖
cd /opt/ai-tools-backend/backend
npm install --production

# 4. 配置环境
cp env.example .env
# 编辑 .env 文件

# 5. 启动服务
./start-backend-prod.sh
```

## 🔧 服务管理

### PM2 命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs ai-tools-backend

# 重启服务
pm2 restart ai-tools-backend

# 停止服务
pm2 stop ai-tools-backend

# 删除服务
pm2 delete ai-tools-backend

# 保存配置
pm2 save

# 恢复配置
pm2 resurrect
```

### 系统服务

```bash
# 查看PM2系统服务状态
sudo systemctl status pm2-gjson

# 启动PM2系统服务
sudo systemctl start pm2-gjson

# 停止PM2系统服务
sudo systemctl stop pm2-gjson

# 重启PM2系统服务
sudo systemctl restart pm2-gjson
```

## 📊 监控和日志

### 健康检查

```bash
# API健康检查
curl -f http://localhost:3001/health

# 检查端口监听
netstat -tlnp | grep :3001

# 检查进程
ps aux | grep node
```

### 日志查看

```bash
# PM2日志
pm2 logs ai-tools-backend --lines 100

# 系统日志
sudo journalctl -u pm2-gjson -f

# 应用日志文件
tail -f /var/log/ai-tools-backend/combined.log
```

## 🔒 安全配置

### 防火墙设置

```bash
# 检查防火墙状态
sudo systemctl status firewalld

# 开放端口
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

# 查看开放端口
sudo firewall-cmd --list-ports
```

### SELinux配置

```bash
# 检查SELinux状态
sestatus

# 如果SELinux启用，可能需要设置上下文
sudo setsebool -P httpd_can_network_connect 1
sudo chcon -R -t httpd_exec_t /opt/ai-tools-backend
```

## 🗄️ 数据库配置

### MySQL设置

```bash
# 启动MySQL服务
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 检查MySQL状态
sudo systemctl status mysqld

# 执行数据库迁移
cd /opt/ai-tools-backend/backend
npm run migrate
```

### 数据库连接测试

```bash
# 测试数据库连接
mysql -h localhost -u ai_tools_user -p ai_tools

# 检查数据库表
mysql -h localhost -u ai_tools_user -p -e "USE ai_tools; SHOW TABLES;"
```

## 🌐 Nginx配置

### 检查Nginx配置

```bash
# 测试Nginx配置
sudo nginx -t

# 重新加载Nginx
sudo systemctl reload nginx

# 检查Nginx状态
sudo systemctl status nginx
```

### API代理配置

确保Nginx配置中包含以下API代理设置：

```nginx
location /api/ {
    proxy_pass http://localhost:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## 🚨 故障排除

### 常见问题

1. **服务启动失败**
   ```bash
   # 查看详细错误日志
   pm2 logs ai-tools-backend --err
   
   # 检查端口占用
   sudo netstat -tlnp | grep :3001
   ```

2. **数据库连接失败**
   ```bash
   # 检查MySQL服务
   sudo systemctl status mysqld
   
   # 检查数据库配置
   cat .env | grep DB_
   ```

3. **权限问题**
   ```bash
   # 修复文件权限
   sudo chown -R gjson:gjson /opt/ai-tools-backend
   sudo chmod -R 755 /opt/ai-tools-backend
   ```

4. **内存不足**
   ```bash
   # 检查内存使用
   free -h
   
   # 调整PM2内存限制
   pm2 restart ai-tools-backend --max-memory-restart 512M
   ```

### 日志分析

```bash
# 查看错误日志
grep -i error /var/log/ai-tools-backend/error.log

# 查看访问日志
tail -f /var/log/ai-tools-backend/access.log

# 查看系统日志
sudo journalctl -u pm2-gjson --since "1 hour ago"
```

## 📈 性能优化

### PM2配置优化

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ai-tools-backend',
    script: 'src/app.js',
    instances: 'max', // 使用所有CPU核心
    exec_mode: 'cluster', // 集群模式
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 系统优化

```bash
# 增加文件描述符限制
echo "* soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65535" | sudo tee -a /etc/security/limits.conf

# 优化内核参数
echo "net.core.somaxconn = 65535" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 🔄 更新部署

### 代码更新

```bash
# 1. 本地更新代码
git pull origin main

# 2. 重新部署
./deploy-server.sh

# 3. 或者手动更新
# 上传新代码到服务器
# 重启服务
pm2 restart ai-tools-backend
```

### 配置更新

```bash
# 1. 更新环境配置
# 编辑 .env 文件

# 2. 重启服务
pm2 restart ai-tools-backend

# 3. 验证配置
curl -f http://localhost:3001/health
```

## 📞 支持

如果遇到问题，请检查：

1. 服务状态：`pm2 status`
2. 错误日志：`pm2 logs ai-tools-backend --err`
3. 系统日志：`sudo journalctl -u pm2-gjson`
4. 网络连接：`curl -f http://localhost:3001/health`
5. 数据库连接：检查MySQL服务状态

---

**注意**: 生产环境部署前，请确保：
- 数据库已正确配置
- 环境变量已正确设置
- 防火墙规则已配置
- SSL证书已安装
- 监控和日志系统已配置
