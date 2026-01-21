const express = require('express');
const { body, validationResult } = require('express-validator');
const { getConnection } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取工具的评分数据
router.get('/tool/:toolId', async (req, res) => {
  try {
    const { toolId } = req.params;
    const { offset = 0, limit = 10 } = req.query;
    const userId = req.user?.id; // 可选，用于获取用户自己的评分
    
    const connection = await getConnection();
    
    // 获取平均评分和总评分数
    const statsSql = `
      SELECT 
        AVG(rating) as averageRating,
        COUNT(*) as totalRatings,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as rating5,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as rating4,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as rating3,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as rating2,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as rating1
      FROM ratings 
      WHERE toolId = ? AND isActive = TRUE
    `;
    
    const [statsRows] = await connection.execute(statsSql, [toolId]);
    const stats = statsRows[0];
    
    // 获取用户自己的评分
    let userRating = null;
    if (userId) {
      const userRatingSql = `
        SELECT * FROM ratings 
        WHERE toolId = ? AND userId = ? AND isActive = TRUE
      `;
      const [userRatingRows] = await connection.execute(userRatingSql, [toolId, userId]);
      if (userRatingRows.length > 0) {
        userRating = userRatingRows[0];
      }
    }
    
    // 获取最近的评分
    const recentSql = `
      SELECT r.*, u.username, u.avatar as userAvatar
      FROM ratings r
      LEFT JOIN users u ON r.userId = u.id
      WHERE r.toolId = ? AND r.isActive = TRUE
      ORDER BY r.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const [recentRows] = await connection.execute(recentSql, [
      toolId, 
      parseInt(limit), 
      parseInt(offset)
    ]);
    
    // 构建评分分布
    const ratingDistribution = {
      5: stats.rating5 || 0,
      4: stats.rating4 || 0,
      3: stats.rating3 || 0,
      2: stats.rating2 || 0,
      1: stats.rating1 || 0
    };
    
    res.json({
      success: true,
      data: {
        averageRating: stats.averageRating ? parseFloat(stats.averageRating.toFixed(2)) : 0,
        totalRatings: stats.totalRatings || 0,
        ratingDistribution,
        userRating,
        recentRatings: recentRows.map(row => ({
          id: row.id,
          rating: row.rating,
          comment: row.comment,
          createdAt: row.createdAt,
          username: row.username,
          userAvatar: row.userAvatar,
          userId: row.userId
        }))
      }
    });

  } catch (error) {
    console.error('获取评分数据错误:', error);
    res.status(500).json({
      success: false,
      error: '获取评分数据失败'
    });
  }
});

// 提交评分
router.post('/', authenticate, [
  body('toolId')
    .notEmpty()
    .withMessage('工具ID不能为空'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('评分必须在1-5之间'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('评价内容不能超过500个字符')
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

    const { toolId, rating, comment } = req.body;
    const connection = await getConnection();
    
    // 检查用户是否已经评分过
    const checkSql = 'SELECT id FROM ratings WHERE toolId = ? AND userId = ? AND isActive = TRUE';
    const [existing] = await connection.execute(checkSql, [toolId, req.user.id]);
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: '您已经对该工具评分过了'
      });
    }
    
    // 检查工具是否存在
    const toolSql = 'SELECT id FROM tools WHERE id = ? AND isActive = TRUE AND status = "approved"';
    const [toolRows] = await connection.execute(toolSql, [toolId]);
    
    if (toolRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '工具不存在或未通过审核'
      });
    }
    
    // 插入评分
    const insertSql = `
      INSERT INTO ratings (toolId, userId, rating, comment)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute(insertSql, [
      toolId,
      req.user.id,
      rating,
      comment || null
    ]);
    
    // 更新工具的平均评分
    await updateToolRating(toolId);
    
    res.status(201).json({
      success: true,
      message: '评分提交成功',
      data: {
        ratingId: result.insertId
      }
    });

  } catch (error) {
    console.error('提交评分错误:', error);
    res.status(500).json({
      success: false,
      error: '提交评分失败'
    });
  }
});

// 更新评分
router.put('/:id', authenticate, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('评分必须在1-5之间'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('评价内容不能超过500个字符')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg
      });
    }
    
    const connection = await getConnection();
    
    // 检查评分是否存在且属于当前用户
    const checkSql = 'SELECT * FROM ratings WHERE id = ? AND userId = ? AND isActive = TRUE';
    const [ratingRows] = await connection.execute(checkSql, [id, req.user.id]);
    
    if (ratingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '评分不存在或无权限修改'
      });
    }
    
    // 更新评分
    const updateSql = `
      UPDATE ratings 
      SET rating = ?, comment = ?, updatedAt = NOW()
      WHERE id = ?
    `;
    
    await connection.execute(updateSql, [rating, comment || null, id]);
    
    // 更新工具的平均评分
    await updateToolRating(ratingRows[0].toolId);
    
    res.json({
      success: true,
      message: '评分更新成功'
    });

  } catch (error) {
    console.error('更新评分错误:', error);
    res.status(500).json({
      success: false,
      error: '更新评分失败'
    });
  }
});

// 删除评分
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();
    
    // 检查评分是否存在且属于当前用户
    const checkSql = 'SELECT * FROM ratings WHERE id = ? AND userId = ? AND isActive = TRUE';
    const [ratingRows] = await connection.execute(checkSql, [id, req.user.id]);
    
    if (ratingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '评分不存在或无权限删除'
      });
    }
    
    // 软删除评分
    const deleteSql = 'UPDATE ratings SET isActive = FALSE, updatedAt = NOW() WHERE id = ?';
    await connection.execute(deleteSql, [id]);
    
    // 更新工具的平均评分
    await updateToolRating(ratingRows[0].toolId);
    
    res.json({
      success: true,
      message: '评分删除成功'
    });

  } catch (error) {
    console.error('删除评分错误:', error);
    res.status(500).json({
      success: false,
      error: '删除评分失败'
    });
  }
});

// 获取用户的评分列表
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { offset = 0, limit = 20 } = req.query;
    
    const connection = await getConnection();
    const sql = `
      SELECT r.*, t.name as toolName, t.description as toolDescription
      FROM ratings r
      LEFT JOIN tools t ON r.toolId = t.id
      WHERE r.userId = ? AND r.isActive = TRUE
      ORDER BY r.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await connection.execute(sql, [
      userId, 
      parseInt(limit), 
      parseInt(offset)
    ]);
    
    res.json({
      success: true,
      data: {
        ratings: rows
      }
    });

  } catch (error) {
    console.error('获取用户评分错误:', error);
    res.status(500).json({
      success: false,
      error: '获取用户评分失败'
    });
  }
});

// 获取评分统计
router.get('/stats', async (req, res) => {
  try {
    const connection = await getConnection();
    
    const sql = `
      SELECT 
        COUNT(*) as totalRatings,
        AVG(rating) as averageRating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as rating5,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as rating4,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as rating3,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as rating2,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as rating1
      FROM ratings 
      WHERE isActive = TRUE
    `;
    
    const [rows] = await connection.execute(sql);
    const stats = rows[0];
    
    res.json({
      success: true,
      data: {
        totalRatings: stats.totalRatings || 0,
        averageRating: stats.averageRating ? parseFloat(stats.averageRating.toFixed(2)) : 0,
        ratingDistribution: {
          5: stats.rating5 || 0,
          4: stats.rating4 || 0,
          3: stats.rating3 || 0,
          2: stats.rating2 || 0,
          1: stats.rating1 || 0
        }
      }
    });

  } catch (error) {
    console.error('获取评分统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取评分统计失败'
    });
  }
});

// 更新工具的平均评分
async function updateToolRating(toolId) {
  try {
    const connection = await getConnection();
    
    // 计算新的平均评分
    const avgSql = `
      SELECT AVG(rating) as averageRating, COUNT(*) as totalRatings
      FROM ratings 
      WHERE toolId = ? AND isActive = TRUE
    `;
    
    const [avgRows] = await connection.execute(avgSql, [toolId]);
    const averageRating = avgRows[0].averageRating || 0;
    const totalRatings = avgRows[0].totalRatings || 0;
    
    // 更新工具表
    const updateSql = `
      UPDATE tools 
      SET averageRating = ?, ratingCount = ?, updatedAt = NOW()
      WHERE id = ?
    `;
    
    await connection.execute(updateSql, [averageRating, totalRatings, toolId]);
    
  } catch (error) {
    console.error('更新工具评分错误:', error);
  }
}

module.exports = router;