// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('❌ 错误详情:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // 默认错误响应
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';

  // 处理特定类型的错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '数据验证失败';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = '无效的数据格式';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = '数据已存在';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = '关联数据不存在';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = '数据库连接失败';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = '文件大小超出限制';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = '不支持的文件类型';
  }

  // 在开发环境下返回详细错误信息
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    success: false,
    error: message,
    ...(isDevelopment && {
      stack: err.stack,
      details: err
    })
  };

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
