const express = require('express');
const { query, validationResult } = require('express-validator');
const { getConnection } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// 获取用户的通知列表
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('type').optional().isIn(['system', 'order', 'course', 'rating']),
  query('isRead').optional().isBoolean().toBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { page = 1, limit = 20, type, isRead } = req.query;
    const offset = (page - 1) * limit;

    const connection = await getConnection();
    try {
      let sql = 'SELECT * FROM notifications WHERE userId = ? AND isActive = TRUE';
      const params = [req.user.id];

      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }

      if (isRead !== undefined) {
        sql += ' AND isRead = ?';
        params.push(isRead ? 1 : 0);
      }

      sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const [rows] = await connection.execute(sql, params);

      // 获取总数
      let countSql = 'SELECT COUNT(*) as total FROM notifications WHERE userId = ? AND isActive = TRUE';
      const countParams = [req.user.id];

      if (type) {
        countSql += ' AND type = ?';
        countParams.push(type);
      }

      if (isRead !== undefined) {
        countSql += ' AND isRead = ?';
        countParams.push(isRead ? 1 : 0);
      }

      const [countRows] = await connection.execute(countSql, countParams);
      const total = countRows[0].total;

      res.json({
        success: true,
        data: {
          notifications: rows.map(row => ({
            id: row.id,
            uuid: row.uuid,
            type: row.type,
            title: row.title,
            content: row.content,
            relatedId: row.relatedId,
            relatedType: row.relatedType,
            isRead: row.isRead === 1,
            readAt: row.readAt,
            createdAt: row.createdAt,
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取通知列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取通知列表失败'
    });
  }
});

// 获取未读通知数量
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      data: {
        unreadCount: count
      }
    });
  } catch (error) {
    console.error('获取未读通知数量错误:', error);
    res.status(500).json({
      success: false,
      error: '获取未读通知数量失败'
    });
  }
});

// 获取通知详情
router.get('/:uuid', authenticate, async (req, res) => {
  try {
    const { uuid } = req.params;
    
    const notification = await Notification.findByUuid(uuid);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: '通知不存在'
      });
    }

    // 检查通知是否属于当前用户
    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '无权查看此通知'
      });
    }

    res.json({
      success: true,
      data: {
        notification: notification.toJSON()
      }
    });
  } catch (error) {
    console.error('获取通知详情错误:', error);
    res.status(500).json({
      success: false,
      error: '获取通知详情失败'
    });
  }
});

// 标记通知为已读
router.patch('/:uuid/read', authenticate, async (req, res) => {
  try {
    const { uuid } = req.params;
    
    const notification = await Notification.findByUuid(uuid);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: '通知不存在'
      });
    }

    // 检查通知是否属于当前用户
    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '无权操作此通知'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: '标记为已读成功',
      data: {
        notification: notification.toJSON()
      }
    });
  } catch (error) {
    console.error('标记通知为已读错误:', error);
    res.status(500).json({
      success: false,
      error: '标记为已读失败'
    });
  }
});

// 标记所有通知为已读
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const count = await Notification.markAllAsRead(req.user.id);
    
    res.json({
      success: true,
      message: `已标记 ${count} 条通知为已读`,
      data: {
        count
      }
    });
  } catch (error) {
    console.error('标记所有通知为已读错误:', error);
    res.status(500).json({
      success: false,
      error: '标记所有为已读失败'
    });
  }
});

// 删除通知
router.delete('/:uuid', authenticate, async (req, res) => {
  try {
    const { uuid } = req.params;
    
    const notification = await Notification.findByUuid(uuid);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: '通知不存在'
      });
    }

    // 检查通知是否属于当前用户
    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '无权删除此通知'
      });
    }

    await notification.softDelete();

    res.json({
      success: true,
      message: '删除通知成功'
    });
  } catch (error) {
    console.error('删除通知错误:', error);
    res.status(500).json({
      success: false,
      error: '删除通知失败'
    });
  }
});

module.exports = router;
