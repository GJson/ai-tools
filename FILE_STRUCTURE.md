# 项目文件结构说明

## 📁 根目录文件

### 📚 文档文件
- **README.md** - 项目主文档（项目介绍、快速开始、功能说明）
- **DEPLOYMENT_GUIDE.md** - 完整部署指南（包含所有部署相关内容）

### 🚀 部署脚本
- **deploy.sh** - 统一部署工具（菜单式，推荐使用）
- **deploy-server.sh.backup** - 旧后端部署脚本（已备份）
- **deploy/** - 新部署系统目录
  - `setup-deploy.sh` - 配置向导
  - `one-click-deploy.sh` - 一键部署脚本

### 🔧 启动脚本
- **start-backend.sh** - 本地开发环境后端启动脚本
- **start-backend-prod.sh** - 生产环境后端启动脚本（在服务器上使用）

### ⚙️ 配置文件
- **package.json** - 前端项目依赖配置
- **package-lock.json** - 前端依赖锁定文件
- **tsconfig.json** - TypeScript配置
- **tsconfig.node.json** - Node环境TypeScript配置
- **vite.config.ts** - Vite构建工具配置
- **env.local** - 前端环境变量配置

### 🌐 前端入口
- **index.html** - HTML入口文件

## 📁 主要目录

### src/ - 前端源代码
```
src/
├── views/              # 页面组件
│   ├── Home.vue       # 首页
│   ├── Category.vue   # 分类页
│   ├── ToolDetail.vue # 工具详情
│   ├── Search.vue     # 搜索页
│   ├── Login.vue      # 登录页
│   ├── Register.vue   # 注册页
│   ├── Profile.vue    # 个人中心
│   └── Debug.vue      # 调试页
├── components/         # 可复用组件
│   ├── AnimatedCounter.vue
│   ├── EnhancedToolCard.vue
│   ├── LoadingSpinner.vue
│   ├── MobileNav.vue
│   ├── Modal.vue
│   ├── ScrollReveal.vue
│   ├── SkeletonCard.vue
│   ├── Toast.vue
│   └── ToastContainer.vue
├── composables/        # 组合式函数
│   ├── useAuth.ts     # 认证逻辑
│   ├── useFavorites.ts # 收藏功能
│   ├── useHistory.ts   # 历史记录
│   ├── useRating.ts    # 评分功能
│   └── useToast.ts     # 提示消息
├── data/               # 数据文件
│   ├── categories.ts   # 分类数据
│   └── tools.ts        # 工具数据
├── router/             # 路由配置
│   └── index.ts
├── types/              # TypeScript类型定义
│   └── index.ts
├── App.vue             # 根组件
├── main.ts             # 入口文件
└── style.css           # 全局样式
```

### backend/ - 后端源代码
```
backend/
├── src/
│   ├── routes/         # API路由
│   │   ├── auth.js    # 认证路由
│   │   └── user.js    # 用户路由
│   ├── models/         # 数据模型
│   │   └── User.js
│   ├── middleware/     # 中间件
│   │   ├── auth.js    # JWT认证中间件
│   │   └── errorHandler.js
│   ├── config/         # 配置文件
│   │   └── database.js
│   ├── utils/          # 工具函数
│   │   ├── email.js   # 邮件发送
│   │   ├── jwt.js     # JWT工具
│   │   └── verificationCode.js
│   └── app.js          # 应用入口
├── package.json        # 后端依赖配置
├── package-lock.json   # 依赖锁定文件
├── ecosystem.config.js # PM2配置文件
└── README.md          # 后端说明文档
```

### public/ - 静态资源
```
public/
└── vite.svg           # 图标文件
```

## 🗑️ 已删除的冗余文件

以下文件已被删除，内容已合并到主文档中：

- ❌ **DEPLOYMENT.md** - 内容已合并到 DEPLOYMENT_GUIDE.md
- ❌ **DEPLOYMENT_SUMMARY.md** - 内容已合并到 DEPLOYMENT_GUIDE.md
- ❌ **BACKEND_DEPLOYMENT.md** - 内容已合并到 DEPLOYMENT_GUIDE.md
- ❌ **DEPLOY_GUIDE.md** - 内容已合并到 DEPLOYMENT_GUIDE.md
- ❌ **PROJECT_SUMMARY.md** - 内容已合并到 README.md
- ❌ **check-mysql.sh** - MySQL检查功能已集成到部署脚本中

## 📋 文件使用指南

### 开发阶段

**前端开发：**
```bash
# 查看项目说明
cat README.md

# 启动开发服务器
npm run dev
```

**后端开发：**
```bash
# 启动后端开发服务器
./start-backend.sh
```

### 部署阶段

**查看部署指南：**
```bash
cat DEPLOYMENT_GUIDE.md
```

**执行部署：**
```bash
# 使用新部署系统（推荐）
cd deploy && ./setup-deploy.sh  # 首次配置
cd .. && ./deploy.sh            # 运行部署工具

# 或使用旧脚本（备份）
./deploy-server.sh.backup
```

**服务器上启动/重启：**
```bash
# 登录服务器
ssh user@ip

# 进入后端目录
cd /opt/ai-tools-backend/backend

# 使用生产启动脚本
./start-backend-prod.sh

# 或使用PM2命令
pm2 restart ai-tools-backend
```

## 🎯 文档层级

```
项目根目录
│
├── README.md              # 📖 主文档 - 项目介绍和快速开始
│   └── 包含: 项目特性、技术栈、快速开始、项目结构、主要功能
│
├── DEPLOYMENT_GUIDE.md     # 🚀 部署文档 - 完整部署指南
│   └── 包含: 部署步骤、MySQL管理、故障排除、验证清单
├── deploy/                 # 🚀 部署系统目录
│   └── README.md          # 部署系统使用文档
│
└── FILE_STRUCTURE.md      # 📁 本文档 - 文件结构说明
    └── 包含: 目录结构、文件说明、使用指南
```

## 🔍 快速查找

**想要...**
- 了解项目？ → 查看 `README.md`
- 部署项目？ → 查看 `DEPLOYMENT_GUIDE.md` 或使用 `./deploy.sh`
- 了解文件结构？ → 查看 `FILE_STRUCTURE.md`（本文档）
- 本地开发前端？ → 运行 `npm run dev`
- 本地开发后端？ → 运行 `./start-backend.sh`
- 部署到服务器？ → 运行 `./deploy.sh`（推荐）或 `./deploy-server.sh.backup`

## 📊 项目统计

### 代码文件
- **前端**: ~20个Vue组件 + 6个Composables + 2个数据文件
- **后端**: ~10个JS模块
- **配置文件**: 8个

### 文档文件
- **主文档**: 3个（README、DEPLOYMENT_GUIDE、FILE_STRUCTURE）
- **部署系统文档**: 1个（deploy/README.md）
- **脚本文件**: 8个（部署脚本 + 启动脚本 + 测试脚本）

### 依赖包
- **前端依赖**: ~10个核心依赖
- **后端依赖**: ~15个核心依赖

## ✨ 文件组织原则

1. **单一职责**: 每个文档专注于特定主题
2. **避免重复**: 删除冗余文档，信息集中管理
3. **清晰命名**: 文件名清楚表达用途
4. **层级分明**: 文档之间有清晰的层级关系
5. **易于维护**: 减少文档数量，降低维护成本

---

**更新日期**: 2025年12月23日
**文件状态**: ✅ 已整理完毕，重复文件已清理

