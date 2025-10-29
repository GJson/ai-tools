const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

// 认证中间件
const authenticate = async (req, res, next) => {
  try {
    // 从请求头中提取令牌
    const token = extractTokenFromHeader(req.headers.authorization);
    
    // 验证令牌
    const decoded = verifyToken(token);
    
    // 查找用户
    const user = await User.findByUuid(decoded.uuid);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在或已被禁用'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message || '认证失败'
    });
  }
};

// 可选的认证中间件（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);
    const user = await User.findByUuid(decoded.uuid);
    
    req.user = user || null;
    next();
  } catch (error) {
    // 如果认证失败，继续执行但不设置用户
    req.user = null;
    next();
  }
};

// 检查用户是否为管理员（如果需要的话）
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '需要登录'
    });
  }

  // 这里可以添加管理员检查逻辑
  // 例如检查用户角色或权限
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin
};
