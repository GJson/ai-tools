# AI工具集部署总结

## 🎯 项目概述

AI工具集是一个前后端分离的项目，包含：
- **前端**: Vue 3 + TypeScript + Vite (部署到 `/var/www/ai-tools/dist/`)
- **后端**: Node.js + Express + MySQL (运行在端口3001)
- **服务器**: 阿里云ECS (CentOS 7)
- **域名**: gjson.com (HTTPS)

## 📁 部署文件

### 前端部署
- `deploy.sh` - 前端部署脚本
- 部署到: `/var/www/ai-tools/dist/`

### 后端部署
- `deploy-server.sh` - 后端部署脚本（已集成所有修复功能）
- 部署到: `/opt/ai-tools-backend/backend/`
- 运行端口: 3001

### 配置文件
- `nginx-gjson.conf` - Nginx配置文件
- `backend/ecosystem.config.js` - PM2配置文件
- `start-backend-prod.sh` - 生产环境启动脚本

## 🚀 快速部署命令

### 前端部署
```bash
cd /Users/wangshu/Downloads/work/code/vpn/ai-tools
./deploy.sh
```

### 后端部署
```bash
cd /Users/wangshu/Downloads/work/code/vpn/ai-tools
./deploy-server.sh
```

## 🔧 部署脚本功能

### deploy-server.sh 包含功能
1. **环境检查**: Node.js版本、依赖完整性
2. **代码打包**: 排除开发依赖，压缩打包
3. **文件传输**: 上传到服务器
4. **服务器配置**:
   - 安装Node.js和PM2
   - 创建应用目录
   - 安装生产依赖
   - 配置环境变量
5. **数据库处理**:
   - 检查MySQL服务
   - 执行数据库迁移
   - 验证数据库连接
6. **进程管理**:
   - 使用PM2启动服务
   - 配置自启动
   - 设置日志管理
7. **Nginx配置**:
   - 更新API代理配置
   - 配置SSL和CORS
   - 测试配置有效性
8. **健康检查**:
   - 本地服务检查
   - Nginx代理检查
   - 端口监听验证

## 📊 服务管理

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
```

### 健康检查
```bash
# 本地健康检查
curl -f http://localhost:3001/health

# 通过Nginx的健康检查
curl -f https://gjson.com/api/health
```

## 🌐 访问地址

- **前端网站**: https://gjson.com
- **API接口**: https://gjson.com/api/
- **健康检查**: https://gjson.com/api/health

## 🔒 安全配置

- **SSL证书**: 已配置HTTPS
- **防火墙**: 开放必要端口
- **CORS**: 配置跨域请求
- **限流**: 防止API滥用
- **JWT认证**: 安全的用户认证

## 📈 监控和日志

- **PM2监控**: 进程状态和资源使用
- **日志文件**: `/var/log/ai-tools-backend/`
- **Nginx日志**: 访问和错误日志
- **系统日志**: systemd服务日志

## 🚨 故障排除

### 常见问题
1. **端口冲突**: 脚本会自动检测和解决
2. **数据库连接**: 自动配置和测试
3. **Nginx代理**: 自动更新配置
4. **服务启动**: 自动重试和健康检查

### 检查命令
```bash
# 检查服务状态
ssh gjson@47.95.118.57 'pm2 status'

# 查看错误日志
ssh gjson@47.95.118.57 'pm2 logs ai-tools-backend --err'

# 检查端口监听
ssh gjson@47.95.118.57 'netstat -tlnp | grep :3001'

# 测试API
curl -f https://gjson.com/api/health
```

## ✅ 部署验证

部署成功后应该看到：
- ✅ 前端网站正常访问
- ✅ API接口正常响应
- ✅ 健康检查通过
- ✅ 数据库连接正常
- ✅ 服务稳定运行

---

**注意**: 所有临时修复文件已删除，功能已集成到主部署脚本中。
