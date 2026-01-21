const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getConnection } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取用户的课程评价列表
router.get('/my', authenticate, [
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
        SELECT cr.*, c.uuid as courseUuid, c.title, c.instructor, c.imageUrl, c.category
        FROM course_ratings cr
        LEFT JOIN courses c ON cr.courseId = c.id
        WHERE cr.userId = ? AND cr.isActive = TRUE AND c.isActive = TRUE
        ORDER BY cr.createdAt DESC
        LIMIT ? OFFSET ?
      `;
      
      const [rows] = await connection.execute(sql, [req.user.id, parseInt(limit), offset]);
      
      // 获取总数
      const countSql = `
        SELECT COUNT(*) as total
        FROM course_ratings cr
        LEFT JOIN courses c ON cr.courseId = c.id
        WHERE cr.userId = ? AND cr.isActive = TRUE AND c.isActive = TRUE
      `;
      const [countRows] = await connection.execute(countSql, [req.user.id]);
      const total = countRows[0].total;
      
      res.json({
        success: true,
        data: {
          ratings: rows.map(row => ({
            id: row.id,
            courseId: row.courseId,
            courseUuid: row.courseUuid,
            courseTitle: row.title,
            instructor: row.instructor,
            imageUrl: row.imageUrl,
            category: row.category,
            rating: row.rating,
            comment: row.comment,
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
    console.error('获取我的评价列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取评价列表失败'
    });
  }
});

// 获取课程的评价列表
router.get('/course/:courseId', [
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

    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const connection = await getConnection();
    try {
      // 获取评价统计
      const statsSql = `
        SELECT 
          AVG(rating) as averageRating,
          COUNT(*) as totalRatings,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as rating5,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as rating4,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as rating3,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as rating2,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as rating1
        FROM course_ratings 
        WHERE courseId = ? AND isActive = TRUE
      `;
      const [statsRows] = await connection.execute(statsSql, [courseId]);
      const stats = statsRows[0];
      
      // 获取评价列表
      const sql = `
        SELECT cr.*, u.username, u.avatar as userAvatar
        FROM course_ratings cr
        LEFT JOIN users u ON cr.userId = u.id
        WHERE cr.courseId = ? AND cr.isActive = TRUE
        ORDER BY cr.createdAt DESC
        LIMIT ? OFFSET ?
      `;
      
      const [rows] = await connection.execute(sql, [courseId, parseInt(limit), offset]);
      
      // 获取总数
      const countSql = 'SELECT COUNT(*) as total FROM course_ratings WHERE courseId = ? AND isActive = TRUE';
      const [countRows] = await connection.execute(countSql, [courseId]);
      const total = countRows[0].total;
      
      res.json({
        success: true,
        data: {
          stats: {
            averageRating: stats.averageRating ? parseFloat(stats.averageRating).toFixed(1) : '0.0',
            totalRatings: stats.totalRatings,
            rating5: stats.rating5,
            rating4: stats.rating4,
            rating3: stats.rating3,
            rating2: stats.rating2,
            rating1: stats.rating1
          },
          ratings: rows.map(row => ({
            id: row.id,
            userId: row.userId,
            username: row.username,
            userAvatar: row.userAvatar,
            rating: row.rating,
            comment: row.comment,
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
    console.error('获取课程评价列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取评价列表失败'
    });
  }
});

// 提交课程评价
router.post('/', authenticate, [
  body('courseId').notEmpty().withMessage('课程ID不能为空').isInt().withMessage('课程ID必须是数字'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间'),
  body('comment').optional().isLength({ max: 500 }).withMessage('评价内容不能超过500个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { courseId, rating, comment } = req.body;
    const connection = await getConnection();
    
    try {
      // 检查用户是否已经评价过
      const checkSql = 'SELECT id FROM course_ratings WHERE courseId = ? AND userId = ? AND isActive = TRUE';
      const [existing] = await connection.execute(checkSql, [courseId, req.user.id]);
      
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: '您已经对该课程评价过了'
        });
      }
      
      // 检查课程是否存在
      const courseSql = 'SELECT id FROM courses WHERE id = ? AND isActive = TRUE';
      const [courseRows] = await connection.execute(courseSql, [courseId]);
      
      if (courseRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '课程不存在'
        });
      }
      
      // 插入评价
      const insertSql = `
        INSERT INTO course_ratings (courseId, userId, rating, comment)
        VALUES (?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute(insertSql, [
        courseId,
        req.user.id,
        rating,
        comment || null
      ]);
      
      res.status(201).json({
        success: true,
        message: '评价提交成功',
        data: {
          id: result.insertId,
          courseId,
          rating,
          comment: comment || null
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('提交课程评价错误:', error);
    res.status(500).json({
      success: false,
      error: '提交评价失败'
    });
  }
});

// 更新评价
router.put('/:id', authenticate, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间'),
  body('comment').optional().isLength({ max: 500 }).withMessage('评价内容不能超过500个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;
    const connection = await getConnection();
    
    try {
      // 检查评价是否存在且属于当前用户
      const checkSql = 'SELECT id FROM course_ratings WHERE id = ? AND userId = ? AND isActive = TRUE';
      const [existing] = await connection.execute(checkSql, [id, req.user.id]);
      
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          error: '评价不存在'
        });
      }
      
      // 更新评价
      const updateData = [];
      const updateFields = [];
      
      if (rating !== undefined) {
        updateFields.push('rating = ?');
        updateData.push(rating);
      }
      
      if (comment !== undefined) {
        updateFields.push('comment = ?');
        updateData.push(comment || null);
      }
      
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: '没有要更新的数据'
        });
      }
      
      updateFields.push('updatedAt = NOW()');
      updateData.push(id, req.user.id);
      
      const updateSql = `UPDATE course_ratings SET ${updateFields.join(', ')} WHERE id = ? AND userId = ?`;
      await connection.execute(updateSql, updateData);
      
      res.json({
        success: true,
        message: '评价更新成功'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('更新课程评价错误:', error);
    res.status(500).json({
      success: false,
      error: '更新评价失败'
    });
  }
});

// 删除评价
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();
    
    try {
      const sql = 'UPDATE course_ratings SET isActive = FALSE, updatedAt = NOW() WHERE id = ? AND userId = ? AND isActive = TRUE';
      const [result] = await connection.execute(sql, [id, req.user.id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: '评价不存在'
        });
      }
      
      res.json({
        success: true,
        message: '评价删除成功'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('删除课程评价错误:', error);
    res.status(500).json({
      success: false,
      error: '删除评价失败'
    });
  }
});

module.exports = router;

