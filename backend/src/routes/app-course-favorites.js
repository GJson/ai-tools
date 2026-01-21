const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getConnection } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取用户的课程收藏列表
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const connection = await getConnection();
    try {
      let sql = `
        SELECT cf.*, c.uuid as courseUuid, c.title, c.description, c.instructor, 
               c.price, c.imageUrl, c.duration, c.startDate, c.endDate, c.category
        FROM course_favorites cf
        LEFT JOIN courses c ON cf.courseId = c.id
        WHERE cf.userId = ? AND cf.isActive = TRUE AND c.isActive = TRUE
        ORDER BY cf.createdAt DESC
        LIMIT ? OFFSET ?
      `;
      
      const [rows] = await connection.execute(sql, [req.user.id, parseInt(limit), offset]);
      
      // 获取总数
      const countSql = `
        SELECT COUNT(*) as total
        FROM course_favorites cf
        LEFT JOIN courses c ON cf.courseId = c.id
        WHERE cf.userId = ? AND cf.isActive = TRUE AND c.isActive = TRUE
      `;
      const [countRows] = await connection.execute(countSql, [req.user.id]);
      const total = countRows[0].total;
      
      res.json({
        success: true,
        data: {
          favorites: rows.map(row => ({
            id: row.id,
            courseId: row.courseId,
            courseUuid: row.courseUuid,
            title: row.title,
            description: row.description,
            instructor: row.instructor,
            price: parseFloat(row.price),
            imageUrl: row.imageUrl,
            duration: row.duration,
            startDate: row.startDate,
            endDate: row.endDate,
            category: row.category,
            notes: row.notes,
            createdAt: row.createdAt
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
    console.error('获取课程收藏列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取收藏列表失败'
    });
  }
});

// 添加课程收藏
router.post('/', authenticate, [
  body('courseId').notEmpty().withMessage('课程ID不能为空').isInt().withMessage('课程ID必须是数字'),
  body('notes').optional().isLength({ max: 500 }).withMessage('备注不能超过500个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { courseId, notes } = req.body;
    const connection = await getConnection();
    
    try {
      // 检查课程是否存在
      const courseSql = 'SELECT id, title FROM courses WHERE id = ? AND isActive = TRUE';
      const [courseRows] = await connection.execute(courseSql, [courseId]);
      
      if (courseRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '课程不存在'
        });
      }
      
      // 检查是否已经收藏（包括软删除的记录）
      const checkSql = 'SELECT id, isActive FROM course_favorites WHERE courseId = ? AND userId = ?';
      const [existing] = await connection.execute(checkSql, [courseId, req.user.id]);
      
      if (existing.length > 0) {
        const existingRecord = existing[0];
        if (existingRecord.isActive) {
          // 已经收藏且是激活状态
          return res.status(409).json({
            success: false,
            error: '您已经收藏过该课程'
          });
        } else {
          // 之前收藏过但已取消，重新激活
          const updateSql = 'UPDATE course_favorites SET isActive = TRUE, notes = ?, updatedAt = NOW() WHERE id = ?';
          await connection.execute(updateSql, [notes || null, existingRecord.id]);
          
          return res.status(200).json({
            success: true,
            message: '收藏成功',
            data: {
              id: existingRecord.id,
              courseId,
              notes: notes || null
            }
          });
        }
      }
      
      // 添加新收藏
      const insertSql = `
        INSERT INTO course_favorites (courseId, userId, notes)
        VALUES (?, ?, ?)
      `;
      
      const [result] = await connection.execute(insertSql, [courseId, req.user.id, notes || null]);
      
      res.status(201).json({
        success: true,
        message: '收藏成功',
        data: {
          id: result.insertId,
          courseId,
          notes: notes || null
        }
      });
    } catch (dbError) {
      // 数据库操作错误
      console.error('添加课程收藏数据库错误:', dbError);
      throw dbError; // 重新抛出，让外层catch处理
    } finally {
      if (connection) {
        connection.release();
      }
    }
  } catch (error) {
    console.error('添加课程收藏错误:', error);
    // 输出详细错误信息用于调试
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || '添加收藏失败'
    });
  }
});

// 取消收藏
router.delete('/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const connection = await getConnection();
    
    try {
      const sql = 'UPDATE course_favorites SET isActive = FALSE, updatedAt = NOW() WHERE courseId = ? AND userId = ? AND isActive = TRUE';
      const [result] = await connection.execute(sql, [courseId, req.user.id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: '收藏不存在'
        });
      }
      
      res.json({
        success: true,
        message: '取消收藏成功'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('取消课程收藏错误:', error);
    res.status(500).json({
      success: false,
      error: '取消收藏失败'
    });
  }
});

// 检查是否已收藏
router.get('/check/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const connection = await getConnection();
    
    try {
      const sql = 'SELECT id FROM course_favorites WHERE courseId = ? AND userId = ? AND isActive = TRUE';
      const [rows] = await connection.execute(sql, [courseId, req.user.id]);
      
      res.json({
        success: true,
        data: {
          isFavorited: rows.length > 0
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('检查收藏状态错误:', error);
    res.status(500).json({
      success: false,
      error: '检查收藏状态失败'
    });
  }
});

module.exports = router;

