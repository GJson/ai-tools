const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getConnection } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取用户的学习记录列表
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('isCompleted').optional().isBoolean().toBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { page = 1, limit = 20, isCompleted } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const connection = await getConnection();
    try {
      let sql = `
        SELECT clh.*, c.uuid as courseUuid, c.title, c.description, c.instructor, 
               c.price, c.imageUrl, c.duration, c.startDate, c.endDate, c.category
        FROM course_learning_history clh
        LEFT JOIN courses c ON clh.courseId = c.id
        WHERE clh.userId = ? AND clh.isActive = TRUE AND c.isActive = TRUE
      `;
      
      const params = [req.user.id];
      
      if (isCompleted !== undefined) {
        sql += ' AND clh.isCompleted = ?';
        params.push(isCompleted === 'true' ? 1 : 0);
      }
      
      sql += ' ORDER BY clh.lastStudyAt DESC, clh.createdAt DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [rows] = await connection.execute(sql, params);
      
      // 获取总数
      let countSql = `
        SELECT COUNT(*) as total
        FROM course_learning_history clh
        LEFT JOIN courses c ON clh.courseId = c.id
        WHERE clh.userId = ? AND clh.isActive = TRUE AND c.isActive = TRUE
      `;
      const countParams = [req.user.id];
      
      if (isCompleted !== undefined) {
        countSql += ' AND clh.isCompleted = ?';
        countParams.push(isCompleted === 'true' ? 1 : 0);
      }
      
      const [countRows] = await connection.execute(countSql, countParams);
      const total = countRows[0].total;
      
      res.json({
        success: true,
        data: {
          history: rows.map(row => ({
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
            progress: row.progress,
            lastStudyAt: row.lastStudyAt,
            totalStudyTime: row.totalStudyTime,
            isCompleted: row.isCompleted === 1,
            completedAt: row.completedAt,
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
    console.error('获取学习记录列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取学习记录失败'
    });
  }
});

// 创建或更新学习记录
router.post('/', authenticate, [
  body('courseId').notEmpty().withMessage('课程ID不能为空').isInt().withMessage('课程ID必须是数字'),
  body('orderId').optional().isInt().withMessage('订单ID必须是数字'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('学习进度必须在0-100之间'),
  body('studyTime').optional().isInt({ min: 0 }).withMessage('学习时长必须大于等于0'),
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

    const { courseId, orderId, progress, studyTime, notes } = req.body;
    const connection = await getConnection();
    
    try {
      // 检查课程是否存在
      const courseSql = 'SELECT id FROM courses WHERE id = ? AND isActive = TRUE';
      const [courseRows] = await connection.execute(courseSql, [courseId]);
      
      if (courseRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '课程不存在'
        });
      }
      
      // 检查是否已有学习记录
      const checkSql = 'SELECT id, progress, totalStudyTime FROM course_learning_history WHERE courseId = ? AND userId = ? AND isActive = TRUE';
      const [existing] = await connection.execute(checkSql, [courseId, req.user.id]);
      
      if (existing.length > 0) {
        // 更新学习记录
        const updateData = [];
        const updateFields = [];
        
        if (progress !== undefined) {
          updateFields.push('progress = ?');
          updateData.push(progress);
          
          // 如果进度达到100%，标记为完成
          if (progress >= 100) {
            updateFields.push('isCompleted = TRUE');
            updateFields.push('completedAt = NOW()');
          }
        }
        
        if (studyTime !== undefined) {
          updateFields.push('totalStudyTime = totalStudyTime + ?');
          updateData.push(studyTime);
        }
        
        if (notes !== undefined) {
          updateFields.push('notes = ?');
          updateData.push(notes || null);
        }
        
        updateFields.push('lastStudyAt = NOW()');
        updateFields.push('updatedAt = NOW()');
        updateData.push(courseId, req.user.id);
        
        const updateSql = `UPDATE course_learning_history SET ${updateFields.join(', ')} WHERE courseId = ? AND userId = ? AND isActive = TRUE`;
        await connection.execute(updateSql, updateData);
        
        res.json({
          success: true,
          message: '学习记录更新成功'
        });
      } else {
        // 创建新学习记录
        const insertSql = `
          INSERT INTO course_learning_history (courseId, userId, orderId, progress, totalStudyTime, lastStudyAt, notes)
          VALUES (?, ?, ?, ?, ?, NOW(), ?)
        `;
        
        const [result] = await connection.execute(insertSql, [
          courseId,
          req.user.id,
          orderId || null,
          progress || 0,
          studyTime || 0,
          notes || null
        ]);
        
        res.status(201).json({
          success: true,
          message: '学习记录创建成功',
          data: {
            id: result.insertId
          }
        });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('创建/更新学习记录错误:', error);
    res.status(500).json({
      success: false,
      error: '操作失败'
    });
  }
});

// 获取课程的学习记录详情
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const connection = await getConnection();
    
    try {
      const sql = `
        SELECT clh.*, c.title, c.instructor, c.imageUrl
        FROM course_learning_history clh
        LEFT JOIN courses c ON clh.courseId = c.id
        WHERE clh.courseId = ? AND clh.userId = ? AND clh.isActive = TRUE
      `;
      
      const [rows] = await connection.execute(sql, [courseId, req.user.id]);
      
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '学习记录不存在'
        });
      }
      
      const row = rows[0];
      res.json({
        success: true,
        data: {
          id: row.id,
          courseId: row.courseId,
          courseTitle: row.title,
          instructor: row.instructor,
          imageUrl: row.imageUrl,
          progress: row.progress,
          lastStudyAt: row.lastStudyAt,
          totalStudyTime: row.totalStudyTime,
          isCompleted: row.isCompleted === 1,
          completedAt: row.completedAt,
          notes: row.notes,
          createdAt: row.createdAt
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取学习记录详情错误:', error);
    res.status(500).json({
      success: false,
      error: '获取学习记录失败'
    });
  }
});

// 获取学习统计
router.get('/stats', authenticate, async (req, res) => {
  try {
    const connection = await getConnection();
    
    try {
      const sql = `
        SELECT 
          COUNT(*) as totalCourses,
          COUNT(CASE WHEN isCompleted = TRUE THEN 1 END) as completedCourses,
          SUM(totalStudyTime) as totalStudyTime,
          AVG(progress) as averageProgress
        FROM course_learning_history
        WHERE userId = ? AND isActive = TRUE
      `;
      
      const [rows] = await connection.execute(sql, [req.user.id]);
      const stats = rows[0];
      
      res.json({
        success: true,
        data: {
          totalCourses: stats.totalCourses || 0,
          completedCourses: stats.completedCourses || 0,
          totalStudyTime: stats.totalStudyTime || 0,
          averageProgress: stats.averageProgress ? parseFloat(stats.averageProgress).toFixed(1) : '0.0'
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取学习统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取学习统计失败'
    });
  }
});

module.exports = router;

