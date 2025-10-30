const express = require('express');
const { body, validationResult } = require('express-validator');
const { getConnection } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 记录用户行为
router.post('/track', authenticate, [
  body('action')
    .isIn(['view', 'search', 'favorite', 'unfavorite', 'rating', 'comment', 'download'])
    .withMessage('行为类型必须是有效的操作类型'),
  body('targetType')
    .isIn(['tool', 'page', 'search'])
    .withMessage('目标类型必须是tool、page或search'),
  body('targetId')
    .optional()
    .isInt()
    .withMessage('目标ID必须是数字'),
  body('targetName')
    .optional()
    .isLength({ max: 200 })
    .withMessage('目标名称不能超过200个字符'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('元数据必须是对象')
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

    const { action, targetType, targetId, targetName, metadata } = req.body;
    const connection = getConnection();
    
    // 检查是否已存在相同的记录（避免重复记录）
    const checkSql = `
      SELECT id FROM user_history 
      WHERE userId = ? AND action = ? AND targetType = ? AND targetId = ? 
      AND createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `;
    
    const [existing] = await connection.execute(checkSql, [
      req.user.id,
      action,
      targetType,
      targetId || null
    ]);
    
    if (existing.length > 0) {
      // 更新现有记录的时间
      const updateSql = 'UPDATE user_history SET createdAt = NOW() WHERE id = ?';
      await connection.execute(updateSql, [existing[0].id]);
      
      return res.json({
        success: true,
        message: '历史记录已更新'
      });
    }
    
    // 插入新记录
    const insertSql = `
      INSERT INTO user_history (userId, action, targetType, targetId, targetName, metadata, ipAddress, userAgent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute(insertSql, [
      req.user.id,
      action,
      targetType,
      targetId || null,
      targetName || null,
      metadata ? JSON.stringify(metadata) : null,
      req.ip,
      req.get('User-Agent')
    ]);
    
    res.status(201).json({
      success: true,
      message: '历史记录已保存',
      data: {
        historyId: result.insertId
      }
    });

  } catch (error) {
    console.error('记录用户行为错误:', error);
    res.status(500).json({
      success: false,
      error: '记录用户行为失败'
    });
  }
});

// 获取用户历史记录
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      offset = 0, 
      limit = 50, 
      action = '', 
      targetType = '',
      startDate = '',
      endDate = ''
    } = req.query;
    
    const connection = getConnection();
    
    let sql = `
      SELECT h.*, t.name as toolName, t.description as toolDescription, t.category as toolCategory
      FROM user_history h
      LEFT JOIN tools t ON h.targetId = t.id AND h.targetType = 'tool'
      WHERE h.userId = ? AND h.isActive = TRUE
    `;
    
    const params = [req.user.id];
    
    // 添加筛选条件
    if (action) {
      sql += ' AND h.action = ?';
      params.push(action);
    }
    
    if (targetType) {
      sql += ' AND h.targetType = ?';
      params.push(targetType);
    }
    
    if (startDate) {
      sql += ' AND h.createdAt >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND h.createdAt <= ?';
      params.push(endDate);
    }
    
    sql += ' ORDER BY h.createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await connection.execute(sql, params);
    
    // 获取总数
    let countSql = `
      SELECT COUNT(*) as total
      FROM user_history h
      WHERE h.userId = ? AND h.isActive = TRUE
    `;
    
    const countParams = [req.user.id];
    if (action) {
      countSql += ' AND h.action = ?';
      countParams.push(action);
    }
    if (targetType) {
      countSql += ' AND h.targetType = ?';
      countParams.push(targetType);
    }
    if (startDate) {
      countSql += ' AND h.createdAt >= ?';
      countParams.push(startDate);
    }
    if (endDate) {
      countSql += ' AND h.createdAt <= ?';
      countParams.push(endDate);
    }
    
    const [countRows] = await connection.execute(countSql, countParams);
    const total = countRows[0].total;
    
    res.json({
      success: true,
      data: {
        history: rows.map(row => ({
          ...row,
          metadata: row.metadata ? JSON.parse(row.metadata) : null
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取用户历史错误:', error);
    res.status(500).json({
      success: false,
      error: '获取用户历史失败'
    });
  }
});

// 获取历史统计
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { period = '30' } = req.query; // 默认30天
    const connection = getConnection();
    
    // 基础统计
    const statsSql = `
      SELECT 
        COUNT(*) as totalActions,
        COUNT(DISTINCT DATE(createdAt)) as activeDays,
        COUNT(CASE WHEN action = 'view' THEN 1 END) as viewCount,
        COUNT(CASE WHEN action = 'search' THEN 1 END) as searchCount,
        COUNT(CASE WHEN action = 'favorite' THEN 1 END) as favoriteCount,
        COUNT(CASE WHEN action = 'rating' THEN 1 END) as ratingCount,
        COUNT(CASE WHEN action = 'comment' THEN 1 END) as commentCount
      FROM user_history 
      WHERE userId = ? AND isActive = TRUE 
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const [statsRows] = await connection.execute(statsSql, [req.user.id, parseInt(period)]);
    const stats = statsRows[0];
    
    // 每日活动统计
    const dailySql = `
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as actions,
        COUNT(CASE WHEN action = 'view' THEN 1 END) as views,
        COUNT(CASE WHEN action = 'search' THEN 1 END) as searches
      FROM user_history 
      WHERE userId = ? AND isActive = TRUE 
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `;
    
    const [dailyRows] = await connection.execute(dailySql, [req.user.id, parseInt(period)]);
    
    // 最常访问的工具
    const toolsSql = `
      SELECT 
        h.targetId,
        t.name as toolName,
        t.category as toolCategory,
        COUNT(*) as visitCount
      FROM user_history h
      LEFT JOIN tools t ON h.targetId = t.id
      WHERE h.userId = ? AND h.isActive = TRUE 
      AND h.action = 'view' AND h.targetType = 'tool'
      AND h.createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY h.targetId, t.name, t.category
      ORDER BY visitCount DESC
      LIMIT 10
    `;
    
    const [toolsRows] = await connection.execute(toolsSql, [req.user.id, parseInt(period)]);
    
    // 搜索关键词统计
    const searchSql = `
      SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.query')) as searchQuery,
        COUNT(*) as searchCount
      FROM user_history 
      WHERE userId = ? AND isActive = TRUE 
      AND action = 'search' AND metadata IS NOT NULL
      AND createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.query'))
      ORDER BY searchCount DESC
      LIMIT 10
    `;
    
    const [searchRows] = await connection.execute(searchSql, [req.user.id, parseInt(period)]);
    
    res.json({
      success: true,
      data: {
        period: parseInt(period),
        stats: {
          totalActions: stats.totalActions || 0,
          activeDays: stats.activeDays || 0,
          viewCount: stats.viewCount || 0,
          searchCount: stats.searchCount || 0,
          favoriteCount: stats.favoriteCount || 0,
          ratingCount: stats.ratingCount || 0,
          commentCount: stats.commentCount || 0
        },
        dailyActivity: dailyRows,
        topTools: toolsRows,
        topSearches: searchRows.filter(row => row.searchQuery)
      }
    });

  } catch (error) {
    console.error('获取历史统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取历史统计失败'
    });
  }
});

// 清除历史记录
router.delete('/', authenticate, [
  body('action')
    .optional()
    .isIn(['view', 'search', 'favorite', 'unfavorite', 'rating', 'comment', 'download'])
    .withMessage('行为类型必须是有效的操作类型'),
  body('targetType')
    .optional()
    .isIn(['tool', 'page', 'search'])
    .withMessage('目标类型必须是tool、page或search'),
  body('beforeDate')
    .optional()
    .isISO8601()
    .withMessage('日期格式不正确')
], async (req, res) => {
  try {
    const { action, targetType, beforeDate } = req.body;
    const connection = getConnection();
    
    let deleteSql = 'UPDATE user_history SET isActive = FALSE WHERE userId = ?';
    const params = [req.user.id];
    
    if (action) {
      deleteSql += ' AND action = ?';
      params.push(action);
    }
    
    if (targetType) {
      deleteSql += ' AND targetType = ?';
      params.push(targetType);
    }
    
    if (beforeDate) {
      deleteSql += ' AND createdAt < ?';
      params.push(beforeDate);
    }
    
    const [result] = await connection.execute(deleteSql, params);
    
    res.json({
      success: true,
      message: `已清除 ${result.affectedRows} 条历史记录`
    });

  } catch (error) {
    console.error('清除历史记录错误:', error);
    res.status(500).json({
      success: false,
      error: '清除历史记录失败'
    });
  }
});

// 导出历史记录
router.get('/export', authenticate, async (req, res) => {
  try {
    const { format = 'json', startDate = '', endDate = '' } = req.query;
    const connection = getConnection();
    
    let sql = `
      SELECT h.*, t.name as toolName, t.description as toolDescription, t.category as toolCategory
      FROM user_history h
      LEFT JOIN tools t ON h.targetId = t.id AND h.targetType = 'tool'
      WHERE h.userId = ? AND h.isActive = TRUE
    `;
    
    const params = [req.user.id];
    
    if (startDate) {
      sql += ' AND h.createdAt >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND h.createdAt <= ?';
      params.push(endDate);
    }
    
    sql += ' ORDER BY h.createdAt DESC';
    
    const [rows] = await connection.execute(sql, params);
    
    const data = rows.map(row => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    }));
    
    if (format === 'csv') {
      // 生成CSV格式
      const csv = generateCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="user_history.csv"');
      res.send(csv);
    } else {
      // 返回JSON格式
      res.json({
        success: true,
        data: {
          history: data,
          total: data.length,
          exportDate: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('导出历史记录错误:', error);
    res.status(500).json({
      success: false,
      error: '导出历史记录失败'
    });
  }
});

// 生成CSV格式数据
function generateCSV(data) {
  if (data.length === 0) return '';
  
  const headers = [
    '时间', '行为', '目标类型', '目标名称', '工具名称', '工具分类', 'IP地址'
  ];
  
  const rows = data.map(row => [
    row.createdAt,
    row.action,
    row.targetType,
    row.targetName || '',
    row.toolName || '',
    row.toolCategory || '',
    row.ipAddress || ''
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return '\uFEFF' + csvContent; // 添加BOM以支持中文
}

module.exports = router;