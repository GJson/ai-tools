const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取用户信息
router.get('/profile', authenticate, async (req, res) => {
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

// 更新用户信息
router.put('/profile', authenticate, [
  body('username')
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage('用户名长度必须在2-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('bio')
    .optional()
    .isLength({ max: 200 })
    .withMessage('个人简介不能超过200个字符'),
  body('website')
    .optional()
    .custom((value) => {
      // 允许空字符串或有效的URL
      if (!value || value.trim() === '') return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .withMessage('个人网站必须是有效的URL'),
  body('location')
    .optional()
    .isLength({ max: 50 })
    .withMessage('所在地不能超过50个字符'),
  body('avatar')
    .optional()
    .custom((value) => {
      // 支持URL格式或base64格式的头像
      if (typeof value !== 'string') return false;
      
      // 检查是否是有效的URL
      try {
        new URL(value);
        return true;
      } catch {
        // 如果不是URL，检查是否是base64格式
        const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
        return base64Regex.test(value);
      }
    })
    .withMessage('头像必须是有效的URL或base64格式的图片'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('公开设置必须是布尔值'),
  body('showEmail')
    .optional()
    .isBoolean()
    .withMessage('显示邮箱设置必须是布尔值'),
  body('showStats')
    .optional()
    .isBoolean()
    .withMessage('显示统计设置必须是布尔值')
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

    const { 
      username, 
      bio, 
      website, 
      location, 
      avatar, 
      isPublic, 
      showEmail, 
      showStats 
    } = req.body;
    const updateData = {};

    // 检查用户名是否已存在（如果要更新用户名）
    if (username && username !== req.user.username) {
      if (await User.isUsernameExists(username)) {
        return res.status(409).json({
          success: false,
          error: '用户名已存在'
        });
      }
      updateData.username = username;
    }

    // 检查邮箱是否已存在（如果要更新邮箱）
    if (email && email !== req.user.email) {
      if (await User.isEmailExists(email)) {
        return res.status(409).json({
          success: false,
          error: '邮箱已被注册'
        });
      }
      updateData.email = email;
    }

    // 更新其他字段
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (location !== undefined) updateData.location = location;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (showEmail !== undefined) updateData.showEmail = showEmail;
    if (showStats !== undefined) updateData.showStats = showStats;

    // 如果没有要更新的数据
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: '没有要更新的数据'
      });
    }

    // 更新用户信息
    await req.user.update(updateData);

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: {
        user: req.user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      error: '更新用户信息失败'
    });
  }
});

// 修改密码
router.put('/password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('请输入当前密码'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码长度至少6个字符')
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

    const { currentPassword, newPassword } = req.body;

    // 验证当前密码
    const isValidPassword = await req.user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: '当前密码错误'
      });
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await req.user.validatePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: '新密码不能与当前密码相同'
      });
    }

    // 更新密码
    await req.user.updatePassword(newPassword);

    res.json({
      success: true,
      message: '密码修改成功'
    });

  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      error: '修改密码失败'
    });
  }
});

// 删除账户
router.delete('/account', authenticate, [
  body('password')
    .notEmpty()
    .withMessage('请输入密码确认删除')
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

    const { password } = req.body;

    // 验证密码
    const isValidPassword = await req.user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: '密码错误'
      });
    }

    // 软删除用户
    await req.user.softDelete();

    res.json({
      success: true,
      message: '账户删除成功'
    });

  } catch (error) {
    console.error('删除账户错误:', error);
    res.status(500).json({
      success: false,
      error: '删除账户失败'
    });
  }
});

module.exports = router;
