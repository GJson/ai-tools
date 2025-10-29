# 部署指南

## 🚀 快速部署

### 1. 执行部署脚本

```bash
cd /Users/wangshu/.cursor/worktrees/ai-tools/DKetU
./deploy-server.sh
```

部署脚本会自动完成：
- ✅ 检查本地环境
- ✅ 打包上传代码
- ✅ 安装依赖
- ✅ 配置环境变量
- ✅ 启动/重启服务
- ✅ 健康检查

### 2. MySQL 服务管理

#### 手动启动 MySQL（如果需要）

检查MySQL服务状态：
```bash
# 在服务器上执行
ssh user@ip

# 检测MySQL服务名称
systemctl list-units --type=service --all | grep -i mysql

# 启动MySQL（根据实际服务名调整）
sudo systemctl start mysqld
# 或
sudo systemctl start mysql
# 或
sudo systemctl start mariadb

# 检查状态
sudo systemctl status mysqld
```

### 3. 常见问题排查

#### 问题1: MySQL服务未找到

**现象：** `Failed to start mysqld.service: Unit not found.`

**解决方案：**
```bash
# 1. 检查MySQL实际的服务名
systemctl list-units --type=service --all | grep -i mysql

# 2. 或者检查是否通过其他方式运行
ps aux | grep mysql

# 3. 如果是Docker运行的MySQL
docker ps | grep mysql
```

#### 问题2: 数据库连接失败

**检查步骤：**
```bash
# 1. 登录服务器
ssh user@ip

# 2. 检查配置文件
cat /opt/ai-tools-backend/backend/.env | grep DB_

# 3. 测试数据库连接
mysql -h localhost -u ai_tools_user -p

# 4. 查看应用日志
pm2 logs ai-tools-backend
```

#### 问题3: 端口被占用

```bash
# 检查3001端口
netstat -tlnp | grep 3001

# 或者
ss -tlnp | grep 3001

# 如果需要停止占用进程
pm2 stop ai-tools-backend
# 或
kill -9 <PID>
```

## 📊 验证部署

### 1. 检查服务状态

```bash
ssh user@ip 'pm2 status'
```

预期输出：
```
┌─────┬────────────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name               │ mode        │ status  │ ↺       │ cpu      │
├─────┼────────────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ ai-tools-backend   │ cluster     │ online  │ 0       │ 0%       │
└─────┴────────────────────┴─────────────┴─────────┴─────────┴──────────┘
```

### 2. 检查应用日志

```bash
ssh user@ip 'pm2 logs ai-tools-backend --lines 50'
```

**应该看到：**
- ✅ 数据库连接成功
- ✅ 服务器启动成功
- ✅ 监听端口3001
- ❌ 没有错误信息

### 3. 测试API接口

```bash
# 健康检查
curl https://gjson.com/api/health

# 预期返回
{"status":"OK","timestamp":"2024-xx-xxTxx:xx:xx.xxxZ","uptime":xx}
```

### 4. 测试注册功能

```bash
# 发送验证码
curl -X POST https://gjson.com/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**注意：** 验证码会在服务器日志中显示（因为SMTP可能未配置）

查看日志中的验证码：
```bash
ssh user@ip 'pm2 logs ai-tools-backend | grep "验证码"'
```

## 🔧 服务器管理命令

### PM2 进程管理

```bash
# 查看状态
pm2 status

# 查看实时日志
pm2 logs ai-tools-backend

# 查看错误日志
pm2 logs ai-tools-backend --err

# 重启服务
pm2 restart ai-tools-backend

# 停止服务
pm2 stop ai-tools-backend

# 删除服务
pm2 delete ai-tools-backend

# 查看详细监控
pm2 monit
```

### 系统服务管理

```bash
# 查看PM2系统服务
sudo systemctl status pm2-gjson

# 重启PM2系统服务
sudo systemctl restart pm2-gjson
```

### MySQL 管理

```bash
# 启动MySQL（根据实际服务名调整）
sudo systemctl start mysqld

# 查看MySQL状态
sudo systemctl status mysqld

# 连接数据库
mysql -h localhost -u ai_tools_user -p ai_tools

# 查看数据库表
mysql -h localhost -u ai_tools_user -p -e "USE ai_tools; SHOW TABLES;"
```

## 🎯 部署后检查清单

- [ ] PM2 服务状态正常 (`pm2 status`)
- [ ] 应用日志无错误 (`pm2 logs`)
- [ ] MySQL 服务运行 (通过 check-mysql.sh 检查)
- [ ] 数据库连接成功 (日志中显示 "数据库连接成功")
- [ ] API 健康检查通过 (`curl https://gjson.com/api/health`)
- [ ] 端口3001正在监听 (`netstat -tlnp | grep 3001`)
- [ ] Trust proxy 错误已消失
- [ ] Nodemailer 错误已修复

## 📝 修复说明

### 已修复的问题

1. **Express Trust Proxy 错误** ✅
   - 添加了 `app.set('trust proxy', 1)`
   - 优化了 rate-limit 配置

2. **Nodemailer 错误** ✅
   - 改进了邮件传输器创建逻辑
   - 添加了SMTP配置检查
   - 未配置SMTP时自动使用模拟模式

3. **MySQL 启动问题** ✅
   - 不再强制使用sudo启动
   - 自动检测MySQL服务名称
   - 提供手动启动提示

### 部署脚本改进

- 使用 gjson 用户执行（不需要sudo）
- 自动检测 MySQL 服务名（支持 mysqld/mysql/mariadb）
- 应用启动时会自动验证数据库连接
- 提供详细的日志输出

## 🆘 获取帮助

如果部署遇到问题：

1. **查看详细日志：**
   ```bash
   ssh user@ip 'pm2 logs ai-tools-backend --lines 100'
   ```

2. **检查MySQL：**
   ```bash
   ssh user@ip 'sudo systemctl status mysqld'
   ```

3. **重新部署：**
   ```bash
   ./deploy-server.sh
   ```

4. **验证网络连接：**
   ```bash
   curl -v https://gjson.com/api/health
   ```

---

**提示：** 所有脚本都已经过优化，适配 gjson 用户权限，不会出现权限问题。

