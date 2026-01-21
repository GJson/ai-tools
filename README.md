# AI Tools Collection

![AI Tools Collection](AI-tools.png)

一个现代化的AI工具集合网站，展示各种AI工具和资源。

## 🌟 特性

- 🎨 现代化UI设计，响应式布局
- 🔍 智能搜索功能
- 📱 移动端适配
- ⚡ 快速加载，性能优化
- 🎯 15个AI工具分类
- 📊 详细的工具信息展示
- 👤 完整的用户系统（注册/登录/收藏/历史）
- ⭐ 工具评分和评价功能

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **图标库**: Lucide Vue Next
- **搜索**: Fuse.js

### 后端
- **框架**: Node.js + Express
- **数据库**: MySQL
- **认证**: JWT + bcrypt
- **安全**: Helmet、CORS、Rate Limiting
- **进程管理**: PM2

## 🚀 快速开始

### 前端开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 后端开发

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 开发模式
npm run dev

# 生产模式
npm start
```

## 📁 项目结构

```
ai-tools/
├── src/                    # 前端源代码
│   ├── views/             # 页面组件
│   ├── components/        # 可复用组件
│   ├── composables/       # 组合式函数
│   ├── data/              # 数据文件
│   ├── router/            # 路由配置
│   └── types/             # TypeScript类型
├── backend/               # 后端源代码
│   └── src/
│       ├── routes/       # API路由
│       ├── models/       # 数据模型
│       ├── middleware/   # 中间件
│       ├── config/       # 配置文件
│       └── utils/        # 工具函数
└── public/               # 静态资源
```

## 🌐 部署

详细部署说明请查看：
- **[完整部署指南](./DEPLOYMENT_GUIDE.md)** - 完整的部署步骤和说明
- **[部署系统文档](./deploy/README.md)** - 新部署系统使用指南
- **统一部署工具**: `./deploy.sh`（推荐）
- **旧部署脚本**: `./deploy-server.sh.backup`（备份）

### 快速部署

```bash
# 使用新部署系统（推荐）
cd deploy && ./setup-deploy.sh  # 首次配置
cd .. && ./deploy.sh            # 运行部署工具

# 或使用旧脚本
./deploy-server.sh.backup       # 后端部署
npm run build                    # 前端构建
```

## 📋 主要功能

### 用户功能
- ✅ 用户注册和登录
- ✅ 邮箱验证码验证
- ✅ 个人信息管理
- ✅ 工具收藏功能
- ✅ 浏览历史记录
- ✅ 工具评分和评论

### 工具展示
- ✅ 15个主要分类
- ✅ 工具详情展示
- ✅ 智能搜索和筛选
- ✅ 热门工具推荐
- ✅ 相关工具推荐

### 技术特性
- ✅ 响应式设计
- ✅ JWT身份认证
- ✅ API限流保护
- ✅ 安全防护（Helmet）
- ✅ 数据库连接池
- ✅ PM2进程管理

## 🔧 配置说明

### 前端环境变量 (env.local)

```env
VITE_API_URL=https://gjson.com/api
VITE_NODE_ENV=production
```

### 后端环境变量 (backend/.env)

`.env` 文件是后端服务的核心配置文件，包含数据库、服务器、JWT、邮件等所有配置。

**创建配置文件：**
```bash
cd backend
cp env.example .env
# 编辑 .env 文件，填入实际配置
```

**完整配置项说明：**

```env
# ============================================
# 服务器配置
# ============================================
NODE_ENV=production          # 运行环境: development | production
PORT=3001                    # 服务端口
HOST=0.0.0.0                 # 监听地址（0.0.0.0 表示监听所有网络接口）

# ============================================
# 数据库配置
# ============================================
DB_HOST=localhost            # MySQL主机地址
DB_PORT=3306                 # MySQL端口
DB_NAME=ai_tools             # 数据库名称
DB_USER=ai_tools_user        # 数据库用户名
DB_PASSWORD=your_password   # 数据库密码（⚠️ 重要：使用强密码）

# ============================================
# JWT配置（认证令牌）
# ============================================
JWT_SECRET=your-secret-key   # JWT密钥（⚠️ 重要：生产环境必须修改，建议使用 openssl rand -base64 32 生成）
JWT_EXPIRES_IN=7d            # Access Token 过期时间
JWT_REFRESH_EXPIRES_IN=30d   # Refresh Token 过期时间

# ============================================
# 邮件配置（用于发送验证码等）
# ============================================
SMTP_HOST=mail.gjson.com     # SMTP服务器地址
SMTP_PORT=587                # SMTP端口（587-TLS, 465-SSL）
SMTP_USER=noreply@gjson.com  # SMTP用户名（发件邮箱）
SMTP_PASS=your_password      # SMTP密码（⚠️ 重要：邮箱密码或授权码）

# ============================================
# 文件上传配置
# ============================================
UPLOAD_PATH=./uploads        # 文件上传目录
MAX_FILE_SIZE=5242880        # 最大文件大小（字节，默认5MB）

# ============================================
# 安全配置
# ============================================
BCRYPT_ROUNDS=12             # 密码加密轮数（越高越安全但越慢，建议10-12）
RATE_LIMIT_WINDOW_MS=900000  # 限流时间窗口（毫秒，默认15分钟）
RATE_LIMIT_MAX_REQUESTS=100  # 限流最大请求数（每个IP在时间窗口内的最大请求数）

# ============================================
# 前端URL（用于CORS和邮件链接）
# ============================================
FRONTEND_URL=https://gjson.com  # 前端访问地址（用于CORS配置和邮件中的链接）
```

**⚠️ 重要提示：**
- `.env` 文件包含敏感信息，**不要提交到Git**（已在 `.gitignore` 中配置）
- 生产环境必须修改 `JWT_SECRET` 和数据库密码
- 使用 `env.example` 作为配置模板
- 配置修改后需要重启服务才能生效

**详细配置说明：**
- 查看 [环境变量配置文档](./backend/ENV_CONFIG.md) 了解每个配置项的详细说明和使用方法

## 📊 API接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/send-code` - 发送验证码

### 用户接口
- `GET /api/user/profile` - 获取个人信息
- `PUT /api/user/profile` - 更新个人信息

### 健康检查
- `GET /health` - 服务健康检查

## 🎯 在线演示

- **主站**: https://gjson.com
- **API**: https://gjson.com/api/health

## 📝 开发说明

### 添加新工具

1. 在 `src/data/tools.ts` 中添加工具数据
2. 确保工具有正确的分类ID
3. 添加必要的图标和描述

### 添加新分类

1. 在 `src/data/categories.ts` 中添加分类
2. 更新路由配置
3. 添加对应的图标

## 🔒 安全特性

- ✅ HTTPS加密传输
- ✅ JWT身份认证
- ✅ 密码bcrypt加密
- ✅ API请求限流
- ✅ CORS跨域配置
- ✅ SQL注入防护
- ✅ XSS防护

## 🚨 故障排除

遇到问题？查看：
1. [完整部署指南](./DEPLOYMENT_GUIDE.md) - 完整的故障排除指南
2. [部署系统文档](./deploy/README.md) - 部署系统故障排查
3. 检查服务日志: `ssh user@ip 'pm2 logs ai-tools-backend'`
4. API健康检查: `curl https://gjson.com/api/health`

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

- **网站**: https://gjson.com
- **服务器**: user@ip

---

**注意**: 
- 首次部署前请先阅读 [完整部署指南](./DEPLOYMENT_GUIDE.md)
- 推荐使用新部署系统：`./deploy.sh`
- 确保已配置好MySQL数据库
- 生产环境请修改默认的JWT_SECRET
