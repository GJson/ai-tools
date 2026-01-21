const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateTokenPair } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');
const { generateVerificationCode, sendVerificationCode, sendWelcomeEmail, sendResetPasswordCode } = require('../utils/email');
const { storeVerificationCode, verifyCode, hasVerificationCode, getRemainingTime } = require('../utils/verificationCode');

const router = express.Router();

// 发送验证码
router.post('/send-verification-code', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg
      });
    }

    const { email } = req.body;

    // 检查邮箱是否已注册
    if (await User.isEmailExists(email)) {
      return res.status(409).json({
        success: false,
        error: '该邮箱已被注册'
      });
    }

    // 检查是否已有未过期的验证码
    if (hasVerificationCode(email)) {
      const remainingTime = getRemainingTime(email);
      return res.status(429).json({
        success: false,
        error: `请等待 ${remainingTime} 秒后再重新发送验证码`
      });
    }

    // 生成验证码
    const code = generateVerificationCode();
    
    // 存储验证码
    storeVerificationCode(email, code);

    // 发送邮件
    const emailResult = await sendVerificationCode(email, code);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: '验证码发送失败，请稍后重试'
      });
    }

    res.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      remainingTime: 300 // 5分钟
    });

  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
});

// 验证验证码
router.post('/verify-code', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('验证码必须是6位数字')
    .isNumeric()
    .withMessage('验证码必须是数字')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg
      });
    }

    const { email, code } = req.body;

    // 验证验证码
    const verifyResult = verifyCode(email, code);
    
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        error: verifyResult.error
      });
    }

    res.json({
      success: true,
      message: '验证码验证成功'
    });

  } catch (error) {
    console.error('验证验证码错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
});

// 注册
router.post('/register', [
  body('username')
    .isLength({ min: 2, max: 20 })
    .withMessage('用户名长度必须在2-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符'),
  body('verificationCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('验证码必须是6位数字')
    .isNumeric()
    .withMessage('验证码必须是数字')
], async (req, res) => {
  try {
    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 获取第一个错误信息作为主要错误提示
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg,
        details: errors.array()
      });
    }

    const { username, email, password, verificationCode, channel } = req.body;

    // 获取渠道来源，优先级：请求参数 > 请求头 > 默认值
    // 支持的渠道：yxh5（夜校H5）、aitools（AI工具）、app（夜校App）、gjson.com（官网，默认）
    let userChannel = channel || req.headers['x-channel'] || 'gjson.com';
    
    // 验证渠道来源的有效性
    const validChannels = ['gjson.com', 'yxh5', 'aitools', 'app'];
    if (!validChannels.includes(userChannel)) {
      // 如果渠道不在有效列表中，使用默认值
      userChannel = 'gjson.com';
    }

    // 检查用户名是否已存在
    if (await User.isUsernameExists(username)) {
      return res.status(409).json({
        success: false,
        error: '用户名已存在'
      });
    }

    // 检查邮箱是否已存在
    if (await User.isEmailExists(email)) {
      return res.status(409).json({
        success: false,
        error: '邮箱已被注册'
      });
    }

    // 验证验证码
    const verifyResult = verifyCode(email, verificationCode);
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        error: verifyResult.error
      });
    }

    // 创建用户（包含渠道来源）
    const user = await User.create({ username, email, password, channel: userChannel });
    
    // 生成令牌
    const tokens = generateTokenPair(user);

    // 发送欢迎邮件（异步，不阻塞响应）
    sendWelcomeEmail(email, username).catch(err => {
      console.error('发送欢迎邮件失败:', err);
    });

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: user.toSafeObject(),
        ...tokens
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      error: '注册失败，请稍后重试'
    });
  }
});

// 登录
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('请输入密码')
], async (req, res) => {
  try {
    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 获取第一个错误信息作为主要错误提示
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg,
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // 查找用户
    let user;
    try {
      user = await User.findByEmail(email);
    } catch (error) {
      console.error('查找用户错误:', error);
      return res.status(500).json({
        success: false,
        error: '登录失败，请稍后重试'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误',
        message: '您输入的邮箱或密码不正确，请检查后重试'
      });
    }

    // 验证密码
    let isValidPassword;
    try {
      isValidPassword = await user.validatePassword(password);
    } catch (error) {
      console.error('验证密码错误:', error);
      return res.status(500).json({
        success: false,
        error: '登录失败，请稍后重试'
      });
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误',
        message: '您输入的邮箱或密码不正确，请检查后重试'
      });
    }

    // 更新最后登录时间
    await user.updateLastLogin();

    // 生成令牌
    const tokens = generateTokenPair(user);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: user.toSafeObject(),
        ...tokens
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      error: '登录失败，请稍后重试'
    });
  }
});

// 刷新令牌
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('刷新令牌不能为空')
], async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // 验证刷新令牌
    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(refreshToken);

    // 查找用户
    const user = await User.findByUuid(decoded.uuid);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在'
      });
    }

    // 生成新的令牌对
    const tokens = generateTokenPair(user);

    res.json({
      success: true,
      message: '令牌刷新成功',
      data: tokens
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      error: '刷新令牌无效'
    });
  }
});

// 登出
router.post('/logout', authenticate, async (req, res) => {
  try {
    // 这里可以实现令牌黑名单机制
    // 目前只是返回成功响应
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '登出失败'
    });
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toSafeObject()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

// 验证令牌
router.get('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    message: '令牌有效',
    data: {
      user: req.user.toSafeObject()
    }
  });
});

// 发送重置密码验证码
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg,
        message: firstError.msg
      });
    }

    const { email } = req.body;

    // 检查邮箱是否已注册
    const user = await User.findByEmail(email);
    if (!user) {
      // 为了安全，不透露邮箱是否已注册
      return res.json({
        success: true,
        message: '如果该邮箱已注册，验证码已发送到您的邮箱'
      });
    }

    // 检查是否已有未过期的验证码
    if (hasVerificationCode(email)) {
      const remainingTime = getRemainingTime(email);
      return res.status(429).json({
        success: false,
        error: `请等待 ${remainingTime} 秒后再重新发送验证码`,
        message: `请等待 ${remainingTime} 秒后再重新发送验证码`
      });
    }

    // 生成验证码
    const code = generateVerificationCode();
    
    // 存储验证码
    storeVerificationCode(email, code);

    // 发送重置密码邮件
    const emailResult = await sendResetPasswordCode(email, code);
    
    if (!emailResult.success) {
      // 记录详细错误信息到服务器日志
      console.error('发送重置密码验证码失败详情:', {
        email,
        error: emailResult.error,
        code: emailResult.code,
        details: emailResult.details
      });
      
      return res.status(500).json({
        success: false,
        error: '验证码发送失败，请稍后重试',
        message: '验证码发送失败，请稍后重试'
      });
    }

    res.json({
      success: true,
      message: '如果该邮箱已注册，验证码已发送到您的邮箱',
      remainingTime: 300 // 5分钟
    });

  } catch (error) {
    console.error('发送重置密码验证码错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: '服务器内部错误，请稍后重试'
    });
  }
});

// 验证重置密码验证码
router.post('/verify-reset-code', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('验证码必须是6位数字')
    .isNumeric()
    .withMessage('验证码必须是数字')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg,
        message: firstError.msg
      });
    }

    const { email, code } = req.body;

    // 检查用户是否存在
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '邮箱未注册',
        message: '该邮箱未注册'
      });
    }

    // 验证验证码
    const verifyResult = verifyCode(email, code);
    
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        error: verifyResult.error,
        message: verifyResult.error
      });
    }

    res.json({
      success: true,
      message: '验证码验证成功'
    });

  } catch (error) {
    console.error('验证重置密码验证码错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: '服务器内部错误，请稍后重试'
    });
  }
});

// 重置密码
router.post('/reset-password', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('验证码必须是6位数字')
    .isNumeric()
    .withMessage('验证码必须是数字'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg,
        message: firstError.msg
      });
    }

    const { email, code, password } = req.body;

    // 查找用户
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '邮箱未注册',
        message: '该邮箱未注册'
      });
    }

    // 验证验证码
    const verifyResult = verifyCode(email, code);
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        error: verifyResult.error,
        message: verifyResult.error
      });
    }

    // 更新密码
    await user.updatePassword(password);

    res.json({
      success: true,
      message: '密码重置成功，请使用新密码登录'
    });

  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({
      success: false,
      error: '重置密码失败，请稍后重试',
      message: '重置密码失败，请稍后重试'
    });
  }
});

module.exports = router;
