# AI Tools Collection

一个现代化的AI工具集合网站，展示各种AI工具和资源。

## 🌟 特性

- 🎨 现代化UI设计，响应式布局
- 🔍 智能搜索功能
- 📱 移动端适配
- ⚡ 快速加载，性能优化
- 🎯 16个AI工具分类
- 📊 详细的工具信息展示

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **图标库**: Lucide Vue Next
- **搜索**: Fuse.js
- **路由**: Vue Router
- **样式**: CSS3 + 渐变设计

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/     # 组件
├── views/         # 页面
├── data/          # 数据
├── types/         # 类型定义
├── router/        # 路由配置
└── style.css      # 全局样式
```

## 🌐 在线演示

- 主站: http://47.95.118.57
- 调试页: http://47.95.118.57/debug

## 📋 功能列表

### 主页功能
- 分类导航
- 热门工具推荐
- 最新资讯
- 搜索入口

### 分类页面
- AI写作工具
- AI图像工具
- AI视频工具
- AI办公工具
- AI智能体
- AI聊天助手
- AI编程工具
- AI设计工具
- AI音频工具
- AI搜索引擎
- AI开发平台
- AI学习网站
- AI训练模型
- AI模型评测
- AI内容检测

### 工具详情
- 工具介绍
- 功能特性
- 价格信息
- 用户评价
- 相关链接

## 🔧 部署

### 服务器部署

1. 构建项目
```bash
npm run build
```

2. 上传到服务器
```bash
scp -r dist/* user@server:/var/www/ai-tools/dist/
```

3. 配置Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ai-tools/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 📝 开发说明

### 添加新工具

1. 在 `src/data/tools.ts` 中添加工具数据
2. 确保工具有正确的分类ID
3. 添加必要的图标和描述

### 添加新分类

1. 在 `src/data/categories.ts` 中添加分类
2. 更新路由配置
3. 添加对应的图标

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License