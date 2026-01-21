# AI工具集 - 部署系统

## 📋 概述

本部署系统提供了简单、安全、自动化的部署方案，支持：
- ✅ 配置向导（首次部署）
- ✅ 统一部署工具（菜单式）
- ✅ 一键部署脚本
- ✅ 快速更新
- ✅ 服务管理

## 🎉 部署系统升级完成

已为 `ai-tools` 项目创建了类似 `stock-ai` 的现代化部署系统！

## ✨ 新特性

### 1. 配置向导
- 交互式配置创建
- 自动生成JWT密钥
- 安全配置管理

### 2. 统一部署工具
- 菜单式操作界面
- 支持多种部署场景
- 服务管理和监控

### 3. 一键部署
- 自动化完整部署流程
- 从构建到启动全自动
- 健康检查和验证

### 4. 安全增强
- 配置文件独立管理
- 敏感信息不提交Git
- 权限控制

## 🚀 快速开始

### 首次部署

```bash
# 1. 进入部署目录
cd deploy

# 2. 运行配置向导
./setup-deploy.sh

# 3. 按提示输入配置信息
# - 服务器SSH信息
# - 数据库配置
# - JWT密钥
# - 邮件配置（可选）

# 4. 返回项目根目录，运行部署工具
cd ..
./deploy.sh
# 选择 "1) 完整部署"
```

### 日常更新

```bash
# 使用统一部署工具
./deploy.sh
# 选择 "2) 快速更新" 或 "3) 仅更新前端" 或 "4) 仅更新后端"
```

## 📁 文件说明

### 配置文件

- `config.example.sh` - 配置模板（可提交到Git）
- `config.prod.sh` - 生产环境配置（**不提交到Git**，包含敏感信息）

### 部署脚本

- `setup-deploy.sh` - 配置向导（交互式创建配置文件）
- `one-click-deploy.sh` - 一键部署脚本（完整部署流程）
- `../deploy.sh` - 统一部署工具（菜单式，支持多种操作）

## 🔧 配置说明

### 必需配置

- `SERVER_USER` - 服务器SSH用户名
- `SERVER_HOST` - 服务器IP地址
- `SERVER_PATH` - 后端部署路径
- `DOMAIN` - 域名
- `DB_NAME` - 数据库名
- `DB_USER` - 数据库用户名
- `DB_PASSWORD` - 数据库密码
- `JWT_SECRET` - JWT密钥

### 可选配置

- `SMTP_HOST` - SMTP服务器地址
- `SMTP_PORT` - SMTP端口
- `SMTP_USER` - SMTP用户名
- `SMTP_PASS` - SMTP密码

## 📖 使用指南

### 方式1: 使用统一部署工具（推荐）

```bash
./deploy.sh
```

菜单选项：
1. **完整部署** - 首次部署或完全重新部署
2. **快速更新** - 只更新代码，不重建环境
3. **仅更新前端** - 只更新前端代码
4. **仅更新后端** - 只更新后端代码
5. **重启服务** - 重启PM2和Nginx服务
6. **查看服务状态** - 查看PM2和Nginx状态
7. **查看日志** - 查看PM2或Nginx日志
8. **更新Nginx配置** - 更新Nginx配置文件

### 方式2: 使用一键部署脚本

```bash
cd deploy
./one-click-deploy.sh
```

### 方式3: 使用配置向导

```bash
cd deploy
./setup-deploy.sh
```

## 🔐 安全说明

### ⚠️ 重要提醒

1. **永远不要提交 `config.prod.sh`**
   - 此文件已被 `.gitignore` 忽略
   - 包含所有真实的敏感信息

2. **每个开发者独立配置**
   - 每人运行 `setup-deploy.sh` 创建自己的配置
   - 不要通过聊天工具分享密码

3. **定期更换密码**
   - 建议每3-6个月更换一次
   - 使用强密码（至少12位）

### 验证配置安全

```bash
# 查看Git状态
git status

# 确认配置文件被忽略
git check-ignore deploy/config.prod.sh
# 预期输出: deploy/config.prod.sh

# 检查是否有敏感文件
git status | grep -E "config\.prod"
# 预期输出: 无
```

## 🔍 故障排查

### SSH连接失败

```bash
# 测试SSH连接
ssh ${SERVER_USER}@${SERVER_HOST}

# 如果需要密码，建议配置SSH密钥
ssh-keygen -t rsa
ssh-copy-id ${SERVER_USER}@${SERVER_HOST}
```

### 数据库连接失败

```bash
# 登录服务器检查数据库
ssh ${SERVER_USER}@${SERVER_HOST}
mysql -u ${DB_USER} -p

# 检查用户权限
SHOW GRANTS FOR '${DB_USER}'@'localhost';
```

### 服务启动失败

```bash
# 查看PM2日志
ssh ${SERVER_USER}@${SERVER_HOST} "pm2 logs ${PM2_APP_NAME}"

# 检查端口占用
ssh ${SERVER_USER}@${SERVER_HOST} "netstat -tlnp | grep :${BACKEND_PORT}"
```

### Nginx配置失败

```bash
# 测试Nginx配置
ssh ${SERVER_USER}@${SERVER_HOST} "sudo nginx -t"

# 查看错误日志
ssh ${SERVER_USER}@${SERVER_HOST} "sudo tail -f /var/log/nginx/error.log"
```

## 🔄 与旧系统的对比

| 特性 | 旧系统 | 新系统 |
|------|--------|--------|
| 配置管理 | 硬编码在脚本中 | 独立配置文件 |
| 部署方式 | 单一脚本 | 菜单式工具 |
| 配置向导 | ❌ 无 | ✅ 有 |
| 安全 | ⚠️ 敏感信息在代码中 | ✅ 配置文件独立 |
| 灵活性 | ⚠️ 单一流程 | ✅ 多种场景 |
| 易用性 | ⚠️ 需要修改脚本 | ✅ 交互式配置 |

## 📚 相关文档

- [完整部署指南](../DEPLOYMENT_GUIDE.md)
- [项目README](../README.md)
- [文件结构说明](../FILE_STRUCTURE.md)

## 💡 最佳实践

1. **使用Git管理代码**
   - 每次部署前先提交代码
   - 使用Git标签标记版本

2. **定期备份**
   - 数据库每日自动备份
   - 代码定期备份

3. **监控日志**
   - 定期查看错误日志
   - 使用日志分析工具

4. **测试后部署**
   - 本地测试通过后再部署
   - 使用快速更新减少停机时间

---

**最后更新**: 2025年12月

**维护者**: AI工具集团队
