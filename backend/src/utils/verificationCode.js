// 内存存储验证码（生产环境建议使用Redis）
const verificationCodes = new Map();

// 存储验证码
const storeVerificationCode = (email, code) => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5分钟后过期
  verificationCodes.set(email, {
    code,
    expiresAt,
    attempts: 0 // 尝试次数
  });
  
  // 清理过期验证码
  cleanupExpiredCodes();
};

// 验证验证码
const verifyCode = (email, inputCode) => {
  const stored = verificationCodes.get(email);
  
  if (!stored) {
    return { success: false, error: '验证码不存在或已过期' };
  }
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return { success: false, error: '验证码已过期' };
  }
  
  if (stored.attempts >= 3) {
    verificationCodes.delete(email);
    return { success: false, error: '验证码尝试次数过多，请重新获取' };
  }
  
  if (stored.code !== inputCode) {
    stored.attempts++;
    return { success: false, error: '验证码错误' };
  }
  
  // 验证成功，删除验证码
  verificationCodes.delete(email);
  return { success: true };
};

// 清理过期验证码
const cleanupExpiredCodes = () => {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
    }
  }
};

// 检查验证码是否存在
const hasVerificationCode = (email) => {
  const stored = verificationCodes.get(email);
  if (!stored) return false;
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return false;
  }
  
  return true;
};

// 获取剩余时间（秒）
const getRemainingTime = (email) => {
  const stored = verificationCodes.get(email);
  if (!stored) return 0;
  
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return 0;
  }
  
  return Math.ceil((stored.expiresAt - Date.now()) / 1000);
};

module.exports = {
  storeVerificationCode,
  verifyCode,
  hasVerificationCode,
  getRemainingTime
};
