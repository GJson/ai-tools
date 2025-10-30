const { getConnection } = require('../config/database');

// 管理员权限检查中间件
const requireAdmin = async (req, res, next) => {
  try {
    // 检查用户是否已认证
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '请先登录'
      });
    }

    // 检查用户是否为管理员
    // 这里使用简单的邮箱检查，实际项目中应该从用户数据中获取角色信息
    const adminEmails = [
      'admin@example.com',
      'administrator@example.com',
      'wangshu@example.com' // 临时添加一个测试邮箱
    ];

    const isAdmin = adminEmails.includes(req.user.email.toLowerCase());

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: '权限不足，需要管理员权限'
      });
    }

    // 将管理员信息添加到请求对象
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error('管理员权限检查错误:', error);
    res.status(500).json({
      success: false,
      error: '权限检查失败'
    });
  }
};

// 可选的管理员权限检查（不强制要求管理员权限）
const optionalAdmin = async (req, res, next) => {
  try {
    if (req.user) {
      const adminEmails = [
        'admin@example.com',
        'administrator@example.com',
        'wangshu@example.com'
      ];

      req.isAdmin = adminEmails.includes(req.user.email.toLowerCase());
    } else {
      req.isAdmin = false;
    }

    next();
  } catch (error) {
    console.error('可选管理员权限检查错误:', error);
    req.isAdmin = false;
    next();
  }
};

module.exports = {
  requireAdmin,
  optionalAdmin
};