const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// 获取工具的评论列表
router.get('/tool/:toolId', async (req, res) => {
  try {
    const { toolId } = req.params;
    const { 
      limit = 20, 
      offset = 0, 
      includeReplies = 'true' 
    } = req.query;
    
    const comments = await Comment.getByToolId(
      toolId, 
      parseInt(limit), 
      parseInt(offset), 
      includeReplies === 'true'
    );
    
    // 获取工具的平均评分
    const ratingStats = await Comment.getAverageRating(toolId);
    
    res.json({
      success: true,
      data: {
        comments: comments.map(comment => comment.toPublicObject()),
        ratingStats,
        total: comments.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取评论列表失败'
    });
  }
});

// 创建评论
router.post('/', authenticate, [
  body('toolId')
    .notEmpty()
    .withMessage('工具ID不能为空'),
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('评论内容长度必须在1-1000个字符之间'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('评分必须在1-5之间'),
  body('parentId')
    .optional()
    .isInt()
    .withMessage('父评论ID必须是数字'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('匿名设置必须是布尔值')
], async (req, res) => {
  try {
    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg,
        details: errors.array()
      });
    }

    const { toolId, content, rating, parentId, isAnonymous = false } = req.body;

    // 检查用户是否已经评论过该工具（只对主评论检查）
    if (!parentId) {
      const hasCommented = await Comment.hasUserCommented(toolId, req.user.id);
      if (hasCommented) {
        return res.status(409).json({
          success: false,
          error: '您已经评论过该工具'
        });
      }
    }

    // 创建评论
    const comment = await Comment.create({
      toolId,
      userId: req.user.id,
      parentId,
      content,
      rating,
      isAnonymous
    });

    // 获取完整评论信息
    const fullComment = await Comment.findById(comment.id);

    res.status(201).json({
      success: true,
      message: '评论提交成功',
      data: {
        comment: fullComment.toSafeObject()
      }
    });

  } catch (error) {
    console.error('创建评论错误:', error);
    res.status(500).json({
      success: false,
      error: '创建评论失败，请稍后重试'
    });
  }
});

// 更新评论
router.put('/:id', authenticate, [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('评论内容长度必须在1-1000个字符之间'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('评分必须在1-5之间'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('匿名设置必须是布尔值')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { content, rating, isAnonymous } = req.body;

    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg,
        details: errors.array()
      });
    }

    // 查找评论
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: '评论不存在'
      });
    }

    // 检查权限（只能修改自己的评论）
    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '只能修改自己的评论'
      });
    }

    // 更新评论
    await comment.update({ content, rating, isAnonymous });

    res.json({
      success: true,
      message: '评论更新成功',
      data: {
        comment: comment.toSafeObject()
      }
    });

  } catch (error) {
    console.error('更新评论错误:', error);
    res.status(500).json({
      success: false,
      error: '更新评论失败'
    });
  }
});

// 删除评论
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // 查找评论
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: '评论不存在'
      });
    }

    // 检查权限（只能删除自己的评论）
    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '只能删除自己的评论'
      });
    }

    // 软删除评论
    await comment.softDelete();

    res.json({
      success: true,
      message: '评论删除成功'
    });

  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({
      success: false,
      error: '删除评论失败'
    });
  }
});

// 点赞/踩评论
router.post('/:id/like', authenticate, [
  body('action')
    .isIn(['like', 'dislike'])
    .withMessage('操作必须是like或dislike')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg
      });
    }

    // 查找评论
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: '评论不存在'
      });
    }

    // 切换点赞/踩状态
    await comment.toggleLike(req.user.id, action);

    res.json({
      success: true,
      message: '操作成功',
      data: {
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount
      }
    });

  } catch (error) {
    console.error('点赞/踩评论错误:', error);
    res.status(500).json({
      success: false,
      error: '操作失败'
    });
  }
});

// 举报评论
router.post('/:id/report', authenticate, [
  body('reason')
    .isLength({ min: 1, max: 200 })
    .withMessage('举报原因长度必须在1-200个字符之间')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg
      });
    }

    // 查找评论
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: '评论不存在'
      });
    }

    // 举报评论
    await comment.report(req.user.id, reason);

    res.json({
      success: true,
      message: '举报提交成功'
    });

  } catch (error) {
    console.error('举报评论错误:', error);
    res.status(500).json({
      success: false,
      error: '举报失败'
    });
  }
});

// 获取用户的评论列表
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const comments = await Comment.getByUserId(
      userId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      success: true,
      data: {
        comments: comments.map(comment => comment.toSafeObject()),
        total: comments.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取用户评论错误:', error);
    res.status(500).json({
      success: false,
      error: '获取用户评论失败'
    });
  }
});

// 搜索评论
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: '搜索关键词不能为空'
      });
    }
    
    const comments = await Comment.searchComments(
      q, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      success: true,
      data: {
        comments: comments.map(comment => comment.toPublicObject()),
        total: comments.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('搜索评论错误:', error);
    res.status(500).json({
      success: false,
      error: '搜索评论失败'
    });
  }
});

// 获取待审核评论列表（管理员）
router.get('/admin/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const comments = await Comment.getPendingComments(
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      success: true,
      data: {
        comments: comments.map(comment => comment.toSafeObject()),
        total: comments.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取待审核评论错误:', error);
    res.status(500).json({
      success: false,
      error: '获取待审核评论失败'
    });
  }
});

// 审核评论（管理员）
router.put('/:id/moderate', authenticate, requireAdmin, [
  body('approved')
    .isBoolean()
    .withMessage('审核状态必须是布尔值'),
  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('审核原因不能超过200个字符')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, reason } = req.body;

    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg
      });
    }

    // 查找评论
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: '评论不存在'
      });
    }

    // 审核评论
    await comment.moderate(approved, reason);

    res.json({
      success: true,
      message: `评论${approved ? '审核通过' : '审核拒绝'}`,
      data: {
        comment: comment.toSafeObject()
      }
    });

  } catch (error) {
    console.error('审核评论错误:', error);
    res.status(500).json({
      success: false,
      error: '审核评论失败'
    });
  }
});

// 获取评论统计信息（管理员）
router.get('/admin/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await Comment.getStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取评论统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取评论统计失败'
    });
  }
});

module.exports = router;