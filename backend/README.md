# AI工具集后端API

这是一个基于Node.js + Express + MySQL的RESTful API服务，为AI工具集前端提供用户认证和数据管理功能。

## 🚀 功能特性

- ✅ 用户注册/登录/登出
- ✅ JWT令牌认证
- ✅ 密码加密存储
- ✅ 用户信息管理
- ✅ 令牌刷新机制
- ✅ 数据验证
- ✅ 错误处理
- ✅ 限流保护
- ✅ CORS支持

## 📋 技术栈

- **Node.js** - 运行时环境
- **Express** - Web框架
- **MySQL** - 数据库
- **bcryptjs** - 密码加密
- **jsonwebtoken** - JWT令牌
- **express-validator** - 数据验证
- **express-rate-limit** - 限流保护

## 🛠️ 安装和运行

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `env.example` 文件为 `.env` 并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# 服务器配置
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# 数据库配置
DB_HOST=your_mysql_host
DB_PORT=3306
DB_NAME=ai_tools
DB_USER=your_username
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# 前端URL
FRONTEND_URL=http://your-domain.com
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 📚 API文档

### 认证接口

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "用户名",
  "email": "邮箱",
  "password": "密码"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "邮箱",
  "password": "密码"
}
```

#### 刷新令牌
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "刷新令牌"
}
```

#### 登出
```
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### 用户接口

#### 获取用户信息
```
GET /api/user/profile
Authorization: Bearer <access_token>
```

#### 更新用户信息
```
PUT /api/user/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "新用户名",
  "email": "新邮箱",
  "avatar": "头像URL"
}
```

## 🔒 安全特性

- **密码加密**: 使用bcryptjs进行密码哈希
- **JWT认证**: 安全的令牌认证机制
- **数据验证**: 严格的输入数据验证
- **限流保护**: 防止API滥用
- **CORS配置**: 安全的跨域请求
- **错误处理**: 统一的错误处理机制

## 🚀 部署到阿里云

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装MySQL
sudo apt install mysql-server -y

# 安装PM2（进程管理）
sudo npm install -g pm2
```

### 2. 数据库配置

```bash
# 登录MySQL
sudo mysql -u root -p

# 创建数据库和用户
CREATE DATABASE ai_tools CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ai_tools_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON ai_tools.* TO 'ai_tools_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 部署应用

```bash
# 克隆代码
git clone <your-repo-url>
cd ai-tools/backend

# 安装依赖
npm install --production

# 配置环境变量
cp env.example .env
# 编辑 .env 文件

# 启动服务
pm2 start src/app.js --name "ai-tools-api"
pm2 save
pm2 startup
```

### 4. Nginx配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 监控和日志

```bash
# 查看PM2状态
pm2 status

# 查看日志
pm2 logs ai-tools-api

# 重启服务
pm2 restart ai-tools-api

# 停止服务
pm2 stop ai-tools-api
```

## 🔧 开发

```bash
# 安装开发依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test
```

## 📝 注意事项

1. **JWT密钥**: 生产环境请使用强随机密钥
2. **数据库密码**: 使用强密码并定期更换
3. **HTTPS**: 生产环境建议使用HTTPS
4. **备份**: 定期备份数据库
5. **监控**: 建议配置监控和告警
