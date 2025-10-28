const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateTokenPair } = require('../utils/jwt');
const { authenticate } = require('../middleware/auth');
const { generateVerificationCode, sendVerificationCode, sendWelcomeEmail } = require('../utils/email');
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

    const { username, email, password, verificationCode } = req.body;

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

    // 创建用户
    const user = await User.create({ username, email, password });
    
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
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
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

module.exports = router;
