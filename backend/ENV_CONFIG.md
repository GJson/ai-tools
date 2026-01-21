# 环境变量配置说明

## 📋 概述

`.env` 文件是后端服务的核心配置文件，包含数据库、服务器、JWT、邮件等所有配置信息。

## 🔧 配置文件位置

- **配置模板**: `backend/env.example`
- **实际配置**: `backend/.env`（需要从模板创建，不提交到Git）

## 📝 创建配置文件

```bash
cd backend
cp env.example .env
# 编辑 .env 文件，填入实际配置值
vim .env  # 或使用其他编辑器
```

## 🔐 完整配置项说明

### 1. 服务器配置

```env
NODE_ENV=production          # 运行环境
                            # - development: 开发环境（详细日志）
                            # - production: 生产环境（优化性能）

PORT=3001                    # 服务监听端口
                            # 默认: 3001
                            # 注意: 确保防火墙开放此端口

HOST=0.0.0.0                 # 监听地址
                            # - 0.0.0.0: 监听所有网络接口（推荐）
                            # - localhost: 仅本地访问
                            # - 127.0.0.1: 仅本地访问
```

### 2. 数据库配置

```env
DB_HOST=localhost            # MySQL主机地址
                            # - localhost: 本地数据库
                            # - IP地址: 远程数据库地址

DB_PORT=3306                 # MySQL端口
                            # 默认: 3306

DB_NAME=ai_tools             # 数据库名称
                            # 必须与MySQL中创建的数据库名一致

DB_USER=ai_tools_user        # 数据库用户名
                            # 必须与MySQL中创建的用户名一致

DB_PASSWORD=your_password    # 数据库密码
                            # ⚠️ 重要: 使用强密码
                            # 必须与MySQL用户密码一致
```

**数据库配置验证：**
```bash
# 测试数据库连接
mysql -h localhost -u ai_tools_user -p ai_tools
# 输入密码，如果成功连接则配置正确
```

### 3. JWT配置（认证令牌）

```env
JWT_SECRET=your-secret-key   # JWT密钥
                            # ⚠️ 重要: 生产环境必须修改！
                            # 建议使用: openssl rand -base64 32
                            # 长度建议: 至少32字符

JWT_EXPIRES_IN=7d            # Access Token 过期时间
                            # 格式: 数字+单位（s/m/h/d）
                            # 示例: 7d (7天), 1h (1小时), 30m (30分钟)

JWT_REFRESH_EXPIRES_IN=30d   # Refresh Token 过期时间
                            # 通常比 Access Token 更长
                            # 用于刷新 Access Token
```

**生成JWT密钥：**
```bash
# 方法1: 使用 openssl
openssl rand -base64 32

# 方法2: 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. 邮件配置（可选）

用于发送验证码、密码重置邮件等。

```env
SMTP_HOST=mail.gjson.com     # SMTP服务器地址
                            # 常见服务商:
                            # - Gmail: smtp.gmail.com
                            # - 阿里云: smtp.qiye.aliyun.com
                            # - QQ邮箱: smtp.qq.com

SMTP_PORT=587                # SMTP端口
                            # - 587: TLS（推荐）
                            # - 465: SSL
                            # - 25: 非加密（不推荐）

SMTP_USER=noreply@gjson.com  # SMTP用户名（发件邮箱）
                            # 通常是完整的邮箱地址

SMTP_PASS=your_password      # SMTP密码
                            # ⚠️ 注意: 可能是邮箱密码或授权码
                            # Gmail/QQ邮箱需要使用授权码，不是登录密码
```

**邮件配置说明：**
- 如果未配置SMTP，验证码会在服务器控制台输出（仅开发环境）
- 生产环境建议配置SMTP以正常发送邮件
- 某些邮箱服务商需要开启"SMTP服务"并生成授权码

### 5. 文件上传配置

```env
UPLOAD_PATH=./uploads        # 文件上传目录
                            # 相对路径: 相对于 backend/ 目录
                            # 绝对路径: /var/www/uploads

MAX_FILE_SIZE=5242880        # 最大文件大小（字节）
                            # 默认: 5242880 (5MB)
                            # 1MB = 1048576 字节
```

### 6. 安全配置

```env
BCRYPT_ROUNDS=12             # 密码加密轮数
                            # 范围: 1-31
                            # 推荐: 10-12（平衡安全性和性能）
                            # 越高越安全但加密越慢

RATE_LIMIT_WINDOW_MS=900000  # 限流时间窗口（毫秒）
                            # 默认: 900000 (15分钟)
                            # 表示在多少毫秒内统计请求数

RATE_LIMIT_MAX_REQUESTS=100  # 限流最大请求数
                            # 默认: 100
                            # 表示在时间窗口内每个IP最多允许的请求数
```

### 7. 前端URL配置

```env
FRONTEND_URL=https://gjson.com  # 前端访问地址
                                # 用途:
                                # 1. CORS跨域配置
                                # 2. 邮件中的链接地址
                                # 3. 重定向地址
```

## ⚠️ 安全注意事项

### 1. 敏感信息保护

- ✅ `.env` 文件已加入 `.gitignore`，不会提交到Git
- ✅ 使用 `env.example` 作为配置模板（不包含真实密码）
- ❌ 不要在代码中硬编码密码
- ❌ 不要通过聊天工具分享 `.env` 文件内容

### 2. 生产环境配置

**必须修改的配置：**
- `JWT_SECRET` - 使用强随机字符串
- `DB_PASSWORD` - 使用强密码
- `SMTP_PASS` - 使用邮箱授权码

**建议修改的配置：**
- `NODE_ENV=production` - 确保是生产环境
- `BCRYPT_ROUNDS=12` - 使用较高的加密轮数
- `RATE_LIMIT_MAX_REQUESTS` - 根据实际需求调整

### 3. 配置验证

部署前检查：
```bash
# 1. 检查配置文件是否存在
ls -la backend/.env

# 2. 检查是否包含敏感信息（不应该提交到Git）
git status | grep .env
# 预期输出: 无（.env 应该被忽略）

# 3. 验证配置格式
cd backend
node -e "require('dotenv').config(); console.log('配置加载成功')"
```

## 🔄 配置更新流程

1. **修改配置**
   ```bash
   cd backend
   vim .env
   ```

2. **验证配置**
   ```bash
   # 检查语法
   node -e "require('dotenv').config(); console.log('OK')"
   ```

3. **重启服务**
   ```bash
   # 开发环境
   npm run dev

   # 生产环境
   pm2 restart ai-tools-backend
   ```

## 📚 相关文档

- [完整部署指南](../DEPLOYMENT_GUIDE.md)
- [后端README](./README.md)
- [部署系统文档](../deploy/README.md)

---

**最后更新**: 2025年12月

**维护者**: AI工具集团队

