const express = require('express');
const { body, validationResult } = require('express-validator');
const { getConnection } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取用户的收藏列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      offset = 0, 
      limit = 20, 
      category = '', 
      sortBy = 'createdAt',
      order = 'DESC'
    } = req.query;
    
    const connection = await getConnection();
    
    let sql = `
      SELECT f.*, t.name, t.description, t.category, t.website, t.pricing, 
             t.averageRating, t.ratingCount, t.viewCount, t.favoriteCount
      FROM favorites f
      LEFT JOIN tools t ON f.toolId = t.id
      WHERE f.userId = ? AND f.isActive = TRUE AND t.isActive = TRUE AND t.status = 'approved'
    `;
    
    const params = [req.user.id];
    
    // 添加分类筛选
    if (category) {
      sql += ' AND t.category = ?';
      params.push(category);
    }
    
    // 添加排序
    const validSortFields = ['createdAt', 'name', 'averageRating', 'viewCount', 'favoriteCount'];
    const validOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sortBy) && validOrders.includes(order.toUpperCase())) {
      sql += ` ORDER BY ${sortBy} ${order.toUpperCase()}`;
    } else {
      sql += ' ORDER BY f.createdAt DESC';
    }
    
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await connection.execute(sql, params);
    
    // 获取总数
    let countSql = `
      SELECT COUNT(*) as total
      FROM favorites f
      LEFT JOIN tools t ON f.toolId = t.id
      WHERE f.userId = ? AND f.isActive = TRUE AND t.isActive = TRUE AND t.status = 'approved'
    `;
    
    const countParams = [req.user.id];
    if (category) {
      countSql += ' AND t.category = ?';
      countParams.push(category);
    }
    
    const [countRows] = await connection.execute(countSql, countParams);
    const total = countRows[0].total;
    
    res.json({
      success: true,
      data: {
        favorites: rows,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取收藏列表失败'
    });
  }
});

// 添加收藏
router.post('/', authenticate, [
  body('toolId')
    .notEmpty()
    .withMessage('工具ID不能为空')
    .isInt()
    .withMessage('工具ID必须是数字'),
  body('folderId')
    .optional()
    .isInt()
    .withMessage('收藏夹ID必须是数字')
], async (req, res) => {
  try {
    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg
      });
    }

    const { toolId, folderId } = req.body;
    const connection = await getConnection();
    
    // 检查工具是否存在
    const toolSql = 'SELECT id, name FROM tools WHERE id = ? AND isActive = TRUE AND status = "approved"';
    const [toolRows] = await connection.execute(toolSql, [toolId]);
    
    if (toolRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '工具不存在或未通过审核'
      });
    }
    
    // 检查是否已经收藏
    const checkSql = 'SELECT id FROM favorites WHERE toolId = ? AND userId = ? AND isActive = TRUE';
    const [existing] = await connection.execute(checkSql, [toolId, req.user.id]);
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: '您已经收藏过该工具'
      });
    }
    
    // 检查收藏夹是否存在（如果指定了收藏夹）
    if (folderId) {
      const folderSql = 'SELECT id FROM favorite_folders WHERE id = ? AND userId = ? AND isActive = TRUE';
      const [folderRows] = await connection.execute(folderSql, [folderId, req.user.id]);
      
      if (folderRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '收藏夹不存在'
        });
      }
    }
    
    // 添加收藏
    const insertSql = `
      INSERT INTO favorites (toolId, userId, folderId, notes)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute(insertSql, [
      toolId,
      req.user.id,
      folderId || null,
      null // 可以后续添加备注功能
    ]);
    
    // 更新工具的收藏数
    await updateToolFavoriteCount(toolId);
    
    res.status(201).json({
      success: true,
      message: '收藏成功',
      data: {
        favoriteId: result.insertId,
        toolName: toolRows[0].name
      }
    });

  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({
      success: false,
      error: '添加收藏失败'
    });
  }
});

// 取消收藏
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();
    
    // 检查收藏是否存在且属于当前用户
    const checkSql = 'SELECT toolId FROM favorites WHERE id = ? AND userId = ? AND isActive = TRUE';
    const [favoriteRows] = await connection.execute(checkSql, [id, req.user.id]);
    
    if (favoriteRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '收藏不存在或无权限删除'
      });
    }
    
    // 软删除收藏
    const deleteSql = 'UPDATE favorites SET isActive = FALSE, updatedAt = NOW() WHERE id = ?';
    await connection.execute(deleteSql, [id]);
    
    // 更新工具的收藏数
    await updateToolFavoriteCount(favoriteRows[0].toolId);
    
    res.json({
      success: true,
      message: '取消收藏成功'
    });

  } catch (error) {
    console.error('取消收藏错误:', error);
    res.status(500).json({
      success: false,
      error: '取消收藏失败'
    });
  }
});

// 检查工具是否已收藏
router.get('/check/:toolId', authenticate, async (req, res) => {
  try {
    const { toolId } = req.params;
    const connection = await getConnection();
    
    const sql = 'SELECT id, folderId, createdAt FROM favorites WHERE toolId = ? AND userId = ? AND isActive = TRUE';
    const [rows] = await connection.execute(sql, [toolId, req.user.id]);
    
    res.json({
      success: true,
      data: {
        isFavorited: rows.length > 0,
        favorite: rows.length > 0 ? rows[0] : null
      }
    });

  } catch (error) {
    console.error('检查收藏状态错误:', error);
    res.status(500).json({
      success: false,
      error: '检查收藏状态失败'
    });
  }
});

// 批量操作收藏
router.post('/batch', authenticate, [
  body('action')
    .isIn(['add', 'remove', 'move'])
    .withMessage('操作类型必须是add、remove或move'),
  body('toolIds')
    .isArray({ min: 1 })
    .withMessage('工具ID列表不能为空'),
  body('folderId')
    .optional()
    .isInt()
    .withMessage('收藏夹ID必须是数字')
], async (req, res) => {
  try {
    const { action, toolIds, folderId } = req.body;
    const connection = await getConnection();
    
    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg
      });
    }
    
    let result = { success: 0, failed: 0, errors: [] };
    
    for (const toolId of toolIds) {
      try {
        if (action === 'add') {
          // 检查是否已收藏
          const checkSql = 'SELECT id FROM favorites WHERE toolId = ? AND userId = ? AND isActive = TRUE';
          const [existing] = await connection.execute(checkSql, [toolId, req.user.id]);
          
          if (existing.length === 0) {
            const insertSql = 'INSERT INTO favorites (toolId, userId, folderId) VALUES (?, ?, ?)';
            await connection.execute(insertSql, [toolId, req.user.id, folderId || null]);
            result.success++;
          } else {
            result.failed++;
            result.errors.push(`工具 ${toolId} 已收藏`);
          }
        } else if (action === 'remove') {
          const deleteSql = 'UPDATE favorites SET isActive = FALSE, updatedAt = NOW() WHERE toolId = ? AND userId = ? AND isActive = TRUE';
          const [deleteResult] = await connection.execute(deleteSql, [toolId, req.user.id]);
          if (deleteResult.affectedRows > 0) {
            result.success++;
          } else {
            result.failed++;
            result.errors.push(`工具 ${toolId} 未收藏`);
          }
        } else if (action === 'move') {
          const updateSql = 'UPDATE favorites SET folderId = ?, updatedAt = NOW() WHERE toolId = ? AND userId = ? AND isActive = TRUE';
          const [updateResult] = await connection.execute(updateSql, [folderId, toolId, req.user.id]);
          if (updateResult.affectedRows > 0) {
            result.success++;
          } else {
            result.failed++;
            result.errors.push(`工具 ${toolId} 未收藏`);
          }
        }
      } catch (error) {
        result.failed++;
        result.errors.push(`工具 ${toolId}: ${error.message}`);
      }
    }
    
    res.json({
      success: true,
      message: `批量操作完成，成功: ${result.success}, 失败: ${result.failed}`,
      data: result
    });

  } catch (error) {
    console.error('批量操作收藏错误:', error);
    res.status(500).json({
      success: false,
      error: '批量操作失败'
    });
  }
});

// 获取收藏统计
router.get('/stats', authenticate, async (req, res) => {
  try {
    const connection = await getConnection();
    
    const sql = `
      SELECT 
        COUNT(*) as totalFavorites,
        COUNT(DISTINCT t.category) as categoriesCount,
        AVG(t.averageRating) as avgRating
      FROM favorites f
      LEFT JOIN tools t ON f.toolId = t.id
      WHERE f.userId = ? AND f.isActive = TRUE AND t.isActive = TRUE
    `;
    
    const [rows] = await connection.execute(sql, [req.user.id]);
    const stats = rows[0];
    
    // 获取分类分布
    const categorySql = `
      SELECT t.category, COUNT(*) as count
      FROM favorites f
      LEFT JOIN tools t ON f.toolId = t.id
      WHERE f.userId = ? AND f.isActive = TRUE AND t.isActive = TRUE
      GROUP BY t.category
      ORDER BY count DESC
    `;
    
    const [categoryRows] = await connection.execute(categorySql, [req.user.id]);
    
    res.json({
      success: true,
      data: {
        totalFavorites: stats.totalFavorites || 0,
        categoriesCount: stats.categoriesCount || 0,
        avgRating: stats.avgRating ? parseFloat(stats.avgRating.toFixed(2)) : 0,
        categoryDistribution: categoryRows
      }
    });

  } catch (error) {
    console.error('获取收藏统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取收藏统计失败'
    });
  }
});

// 更新工具的收藏数
async function updateToolFavoriteCount(toolId) {
  try {
    const connection = await getConnection();
    
    const countSql = `
      SELECT COUNT(*) as favoriteCount
      FROM favorites 
      WHERE toolId = ? AND isActive = TRUE
    `;
    
    const [countRows] = await connection.execute(countSql, [toolId]);
    const favoriteCount = countRows[0].favoriteCount || 0;
    
    const updateSql = 'UPDATE tools SET favoriteCount = ?, updatedAt = NOW() WHERE id = ?';
    await connection.execute(updateSql, [favoriteCount, toolId]);
    
  } catch (error) {
    console.error('更新工具收藏数错误:', error);
  }
}

module.exports = router;