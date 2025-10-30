const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const toolRoutes = require('./routes/tools');
const commentRoutes = require('./routes/comments');
const searchRoutes = require('./routes/search');
const ratingRoutes = require('./routes/ratings');
const favoriteRoutes = require('./routes/favorites');
const favoriteFolderRoutes = require('./routes/favorite-folders');
const historyRoutes = require('./routes/history');
const adminDashboardRoutes = require('./routes/admin-dashboard');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// 信任代理 - 在Nginx反向代理后面需要开启
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://47.95.118.57',
    'http://gjson.com',
    'https://localhost:3000',
    'https://47.95.118.57',
    'https://gjson.com'
  ],
  credentials: true
}));

// 限流中间件
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 限制每个IP 100次请求
  message: {
    error: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true, // 返回标准的 RateLimit-* headers
  legacyHeaders: false // 禁用 X-RateLimit-* headers
});
app.use('/api/', limiter);

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/favorite-folders', favoriteFolderRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: '接口不存在',
    path: req.originalUrl 
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectDB();
    
    app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
      console.log(`🚀 服务器启动成功！`);
      console.log(`📍 地址: http://${process.env.HOST || 'localhost'}:${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 健康检查: http://${process.env.HOST || 'localhost'}:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
