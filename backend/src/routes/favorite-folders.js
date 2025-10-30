const express = require('express');
const { body, validationResult } = require('express-validator');
const { getConnection } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取用户的收藏夹列表
router.get('/', authenticate, async (req, res) => {
  try {
    const connection = getConnection();
    
    const sql = `
      SELECT ff.*, COUNT(f.id) as favoritesCount
      FROM favorite_folders ff
      LEFT JOIN favorites f ON ff.id = f.folderId AND f.isActive = TRUE
      WHERE ff.userId = ? AND ff.isActive = TRUE
      GROUP BY ff.id
      ORDER BY ff.createdAt DESC
    `;
    
    const [rows] = await connection.execute(sql, [req.user.id]);
    
    res.json({
      success: true,
      data: {
        folders: rows
      }
    });

  } catch (error) {
    console.error('获取收藏夹列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取收藏夹列表失败'
    });
  }
});

// 创建收藏夹
router.post('/', authenticate, [
  body('name')
    .notEmpty()
    .withMessage('收藏夹名称不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('收藏夹名称长度必须在1-50个字符之间'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('收藏夹描述不能超过200个字符'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('颜色格式不正确')
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

    const { name, description, color } = req.body;
    const connection = getConnection();
    
    // 检查收藏夹名称是否重复
    const checkSql = 'SELECT id FROM favorite_folders WHERE name = ? AND userId = ? AND isActive = TRUE';
    const [existing] = await connection.execute(checkSql, [name, req.user.id]);
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: '收藏夹名称已存在'
      });
    }
    
    // 创建收藏夹
    const insertSql = `
      INSERT INTO favorite_folders (name, description, color, userId)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute(insertSql, [
      name,
      description || null,
      color || '#6366f1',
      req.user.id
    ]);
    
    res.status(201).json({
      success: true,
      message: '收藏夹创建成功',
      data: {
        folderId: result.insertId
      }
    });

  } catch (error) {
    console.error('创建收藏夹错误:', error);
    res.status(500).json({
      success: false,
      error: '创建收藏夹失败'
    });
  }
});

// 更新收藏夹
router.put('/:id', authenticate, [
  body('name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('收藏夹名称长度必须在1-50个字符之间'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('收藏夹描述不能超过200个字符'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('颜色格式不正确')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    
    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg
      });
    }
    
    const connection = getConnection();
    
    // 检查收藏夹是否存在且属于当前用户
    const checkSql = 'SELECT id FROM favorite_folders WHERE id = ? AND userId = ? AND isActive = TRUE';
    const [folderRows] = await connection.execute(checkSql, [id, req.user.id]);
    
    if (folderRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '收藏夹不存在或无权限修改'
      });
    }
    
    // 检查名称是否重复（如果修改了名称）
    if (name) {
      const nameCheckSql = 'SELECT id FROM favorite_folders WHERE name = ? AND userId = ? AND id != ? AND isActive = TRUE';
      const [nameExisting] = await connection.execute(nameCheckSql, [name, req.user.id, id]);
      
      if (nameExisting.length > 0) {
        return res.status(409).json({
          success: false,
          error: '收藏夹名称已存在'
        });
      }
    }
    
    // 构建更新SQL
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: '没有可更新的字段'
      });
    }
    
    values.push(id);
    const updateSql = `UPDATE favorite_folders SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`;
    
    await connection.execute(updateSql, values);
    
    res.json({
      success: true,
      message: '收藏夹更新成功'
    });

  } catch (error) {
    console.error('更新收藏夹错误:', error);
    res.status(500).json({
      success: false,
      error: '更新收藏夹失败'
    });
  }
});

// 删除收藏夹
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();
    
    // 检查收藏夹是否存在且属于当前用户
    const checkSql = 'SELECT id FROM favorite_folders WHERE id = ? AND userId = ? AND isActive = TRUE';
    const [folderRows] = await connection.execute(checkSql, [id, req.user.id]);
    
    if (folderRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '收藏夹不存在或无权限删除'
      });
    }
    
    // 检查收藏夹是否为空
    const favoritesSql = 'SELECT COUNT(*) as count FROM favorites WHERE folderId = ? AND isActive = TRUE';
    const [favoritesRows] = await connection.execute(favoritesSql, [id]);
    
    if (favoritesRows[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: '收藏夹不为空，请先清空收藏夹或移动收藏到其他收藏夹'
      });
    }
    
    // 软删除收藏夹
    const deleteSql = 'UPDATE favorite_folders SET isActive = FALSE, updatedAt = NOW() WHERE id = ?';
    await connection.execute(deleteSql, [id]);
    
    res.json({
      success: true,
      message: '收藏夹删除成功'
    });

  } catch (error) {
    console.error('删除收藏夹错误:', error);
    res.status(500).json({
      success: false,
      error: '删除收藏夹失败'
    });
  }
});

// 获取收藏夹详情
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { offset = 0, limit = 20 } = req.query;
    
    const connection = getConnection();
    
    // 获取收藏夹信息
    const folderSql = 'SELECT * FROM favorite_folders WHERE id = ? AND userId = ? AND isActive = TRUE';
    const [folderRows] = await connection.execute(folderSql, [id, req.user.id]);
    
    if (folderRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '收藏夹不存在'
      });
    }
    
    // 获取收藏夹中的工具
    const favoritesSql = `
      SELECT f.*, t.name, t.description, t.category, t.website, t.pricing, 
             t.averageRating, t.ratingCount, t.viewCount, t.favoriteCount
      FROM favorites f
      LEFT JOIN tools t ON f.toolId = t.id
      WHERE f.folderId = ? AND f.userId = ? AND f.isActive = TRUE AND t.isActive = TRUE AND t.status = 'approved'
      ORDER BY f.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const [favoritesRows] = await connection.execute(favoritesSql, [
      id, 
      req.user.id, 
      parseInt(limit), 
      parseInt(offset)
    ]);
    
    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total
      FROM favorites f
      LEFT JOIN tools t ON f.toolId = t.id
      WHERE f.folderId = ? AND f.userId = ? AND f.isActive = TRUE AND t.isActive = TRUE AND t.status = 'approved'
    `;
    
    const [countRows] = await connection.execute(countSql, [id, req.user.id]);
    const total = countRows[0].total;
    
    res.json({
      success: true,
      data: {
        folder: folderRows[0],
        favorites: favoritesRows,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取收藏夹详情错误:', error);
    res.status(500).json({
      success: false,
      error: '获取收藏夹详情失败'
    });
  }
});

// 移动收藏到其他收藏夹
router.post('/:id/move', authenticate, [
  body('favoriteIds')
    .isArray({ min: 1 })
    .withMessage('收藏ID列表不能为空'),
  body('targetFolderId')
    .optional()
    .isInt()
    .withMessage('目标收藏夹ID必须是数字')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { favoriteIds, targetFolderId } = req.body;
    
    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: firstError.msg
      });
    }
    
    const connection = getConnection();
    
    // 检查源收藏夹是否存在
    const sourceFolderSql = 'SELECT id FROM favorite_folders WHERE id = ? AND userId = ? AND isActive = TRUE';
    const [sourceFolderRows] = await connection.execute(sourceFolderSql, [id, req.user.id]);
    
    if (sourceFolderRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '源收藏夹不存在'
      });
    }
    
    // 检查目标收藏夹是否存在（如果指定了目标收藏夹）
    if (targetFolderId) {
      const targetFolderSql = 'SELECT id FROM favorite_folders WHERE id = ? AND userId = ? AND isActive = TRUE';
      const [targetFolderRows] = await connection.execute(targetFolderSql, [targetFolderId, req.user.id]);
      
      if (targetFolderRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: '目标收藏夹不存在'
        });
      }
    }
    
    // 移动收藏
    const moveSql = 'UPDATE favorites SET folderId = ?, updatedAt = NOW() WHERE id IN (?) AND userId = ? AND isActive = TRUE';
    const [result] = await connection.execute(moveSql, [
      targetFolderId || null,
      favoriteIds.join(','),
      req.user.id
    ]);
    
    res.json({
      success: true,
      message: `成功移动 ${result.affectedRows} 个收藏`,
      data: {
        movedCount: result.affectedRows
      }
    });

  } catch (error) {
    console.error('移动收藏错误:', error);
    res.status(500).json({
      success: false,
      error: '移动收藏失败'
    });
  }
});

module.exports = router;