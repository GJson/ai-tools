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
const appCoursesRoutes = require('./routes/app-courses');
const appOrdersRoutes = require('./routes/app-orders');
const appCourseFavoritesRoutes = require('./routes/app-course-favorites');
const appCourseRatingsRoutes = require('./routes/app-course-ratings');
const appCourseHistoryRoutes = require('./routes/app-course-history');
const appUploadRoutes = require('./routes/app-upload');
const appNotificationsRoutes = require('./routes/app-notifications');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// 信任代理 - 在Nginx反向代理后面需要开启
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet());

// CORS配置
const corsOptions = {
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（移动应用、Postman、curl等）
    if (!origin) {
      return callback(null, true);
    }

    // 允许的 origin 列表
    const allowedOrigins = [
      'http://localhost:5173', // Vite 默认开发服务器端口
      'http://localhost:8080', // 其他开发服务器端口
      'http://localhost:3000', // Vite 开发服务器
      'http://47.95.118.57',
      'https://47.95.118.57',
      'http://gjson.com',
      'https://gjson.com',
      'http://www.gjson.com',
      'https://www.gjson.com',
      // 从环境变量读取额外的允许 origin
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [])
    ];

    // 检查 origin 是否在允许列表中（精确匹配）
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // 对于移动应用 API，允许所有 origin
    const isMobileAppAPI = origin && (
      origin.includes('file://') || // Flutter 本地文件
      origin.includes('http://10.') || // 本地网络
      origin.includes('http://192.168.') || // 本地网络
      origin.includes('http://172.') || // 本地网络
      origin.includes('capacitor://') || // Capacitor应用
      origin.includes('ionic://') // Ionic应用
    );
    
    if (isMobileAppAPI) {
      callback(null, true);
      return;
    }

    // 检查是否匹配 gjson.com 的变体（支持子域名）
    const isGjsonDomain = origin && (
      origin.includes('gjson.com') ||
      origin.includes('47.95.118.57')
    );

    if (isGjsonDomain) {
      // 记录警告但不阻止（允许gjson.com的所有子域名）
      if (process.env.NODE_ENV === 'production') {
        console.warn(`⚠️ CORS警告: 允许未明确列出的gjson.com域名: ${origin}`);
      }
      callback(null, true);
      return;
    }

    // 生产环境：严格检查
    // 开发环境：允许所有（方便开发调试）
    if (process.env.NODE_ENV === 'production') {
      console.error(`❌ CORS拒绝: 不允许的跨域请求 - Origin: ${origin}`);
      callback(new Error('不允许的跨域请求'));
    } else {
      console.warn(`⚠️ 开发环境: 允许未列出的Origin: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

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

// 设置响应头字符集
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));
app.use('/uploads/avatars', express.static('uploads/avatars'));

// 健康检查
app.get('/health', async (req, res) => {
  // 设置响应超时（5秒）
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        status: 'TIMEOUT',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        error: 'Health check timeout',
        message: 'Service is not responding'
      });
    }
  }, 5000);

  try {
    const { getConnection } = require('./config/database');
    
    // 测试数据库连接（带超时）
    const dbTestPromise = (async () => {
      const connection = await getConnection();
      try {
        await connection.execute('SELECT 1');
        connection.release();
        return 'connected';
      } catch (error) {
        connection.release();
        throw error;
      }
    })();
    
    // 使用 Promise.race 实现超时
    const dbTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 3000);
    });
    
    const dbStatus = await Promise.race([dbTestPromise, dbTimeoutPromise]);
    
    clearTimeout(timeout);
    if (!res.headersSent) {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB'
        },
        database: dbStatus
      });
    }
  } catch (error) {
    clearTimeout(timeout);
    if (!res.headersSent) {
      res.status(503).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        error: 'Database connection failed',
        message: error.message
      });
    }
  }
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

// 夜校App API路由（app/api 前缀）
app.use('/app/api/courses', appCoursesRoutes);
app.use('/app/api/orders', appOrdersRoutes);
app.use('/app/api/course-favorites', appCourseFavoritesRoutes);
app.use('/app/api/course-ratings', appCourseRatingsRoutes);
app.use('/app/api/course-history', appCourseHistoryRoutes);
app.use('/app/api/upload', appUploadRoutes);
app.use('/app/api/notifications', appNotificationsRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: '接口不存在',
    path: req.originalUrl 
  });
});

// 错误处理中间件
app.use(errorHandler);

// 全局异常处理 - 捕获未处理的异常
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  // 记录错误但不立即退出，让PM2处理重启
  // 如果错误严重，PM2会自动重启
});

// 全局Promise拒绝处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    timestamp: new Date().toISOString()
  });
  // 记录错误但不立即退出，让PM2处理重启
});

// 优雅关闭处理
const gracefulShutdown = (signal) => {
  console.log(`\n收到 ${signal} 信号，开始优雅关闭...`);
  
  // 关闭HTTP服务器
  if (server) {
    server.close(() => {
      console.log('HTTP服务器已关闭');
      process.exit(0);
    });
    
    // 强制关闭超时（10秒）
    setTimeout(() => {
      console.error('强制关闭服务器');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 启动服务器
let server;
const startServer = async () => {
  try {
    // 连接数据库
    await connectDB();
    
    server = app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
      console.log(`🚀 服务器启动成功！`);
      console.log(`📍 地址: http://${process.env.HOST || 'localhost'}:${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 健康检查: http://${process.env.HOST || 'localhost'}:${PORT}/health`);
    });

    // 处理服务器错误
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用`);
      } else {
        console.error('❌ 服务器错误:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
