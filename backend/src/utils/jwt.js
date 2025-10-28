const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// 生成访问令牌
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'ai-tools-api',
    audience: 'ai-tools-client'
  });
};

// 生成刷新令牌
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'ai-tools-api',
    audience: 'ai-tools-client'
  });
};

// 生成令牌对
const generateTokenPair = (user) => {
  const payload = {
    id: user.id,
    uuid: user.uuid,
    username: user.username,
    email: user.email
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: JWT_EXPIRES_IN
  };
};

// 验证令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'ai-tools-api',
      audience: 'ai-tools-client'
    });
  } catch (error) {
    throw new Error('无效的令牌');
  }
};

// 从请求头中提取令牌
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    throw new Error('缺少认证头');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('认证头格式错误');
  }

  return parts[1];
};

// 解码令牌（不验证）
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('令牌格式错误');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  extractTokenFromHeader,
  decodeToken
};
