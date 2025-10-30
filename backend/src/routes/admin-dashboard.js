const express = require('express');
const { getConnection } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// 获取仪表板概览数据
router.get('/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const connection = getConnection();
    
    // 获取基础统计数据
    const statsSql = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as totalUsers,
        (SELECT COUNT(*) FROM tools WHERE isActive = TRUE) as totalTools,
        (SELECT COUNT(*) FROM tools WHERE status = 'pending' AND isActive = TRUE) as pendingTools,
        (SELECT COUNT(*) FROM tools WHERE status = 'approved' AND isActive = TRUE) as approvedTools,
        (SELECT COUNT(*) FROM tools WHERE status = 'rejected' AND isActive = TRUE) as rejectedTools,
        (SELECT COUNT(*) FROM comments WHERE isActive = TRUE) as totalComments,
        (SELECT COUNT(*) FROM ratings WHERE isActive = TRUE) as totalRatings,
        (SELECT COUNT(*) FROM favorites WHERE isActive = TRUE) as totalFavorites
    `;
    
    const [statsRows] = await connection.execute(statsSql);
    const stats = statsRows[0];
    
    // 获取今日数据
    const todaySql = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as newUsersToday,
        (SELECT COUNT(*) FROM tools WHERE DATE(createdAt) = CURDATE()) as newToolsToday,
        (SELECT COUNT(*) FROM comments WHERE DATE(createdAt) = CURDATE()) as newCommentsToday,
        (SELECT COUNT(*) FROM ratings WHERE DATE(createdAt) = CURDATE()) as newRatingsToday
    `;
    
    const [todayRows] = await connection.execute(todaySql);
    const todayStats = todayRows[0];
    
    // 获取用户增长趋势（最近30天）
    const userGrowthSql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    
    const [userGrowthRows] = await connection.execute(userGrowthSql);
    
    // 获取工具增长趋势（最近30天）
    const toolGrowthSql = `
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM tools 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `;
    
    const [toolGrowthRows] = await connection.execute(toolGrowthSql);
    
    // 获取分类分布
    const categorySql = `
      SELECT 
        category,
        COUNT(*) as count
      FROM tools 
      WHERE isActive = TRUE AND status = 'approved'
      GROUP BY category
      ORDER BY count DESC
    `;
    
    const [categoryRows] = await connection.execute(categorySql);
    
    // 获取评分分布
    const ratingSql = `
      SELECT 
        rating,
        COUNT(*) as count
      FROM ratings 
      WHERE isActive = TRUE
      GROUP BY rating
      ORDER BY rating DESC
    `;
    
    const [ratingRows] = await connection.execute(ratingSql);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: stats.totalUsers || 0,
          totalTools: stats.totalTools || 0,
          pendingTools: stats.pendingTools || 0,
          approvedTools: stats.approvedTools || 0,
          rejectedTools: stats.rejectedTools || 0,
          totalComments: stats.totalComments || 0,
          totalRatings: stats.totalRatings || 0,
          totalFavorites: stats.totalFavorites || 0
        },
        today: {
          newUsers: todayStats.newUsersToday || 0,
          newTools: todayStats.newToolsToday || 0,
          newComments: todayStats.newCommentsToday || 0,
          newRatings: todayStats.newRatingsToday || 0
        },
        trends: {
          userGrowth: userGrowthRows,
          toolGrowth: toolGrowthRows
        },
        distributions: {
          categories: categoryRows,
          ratings: ratingRows
        }
      }
    });

  } catch (error) {
    console.error('获取仪表板概览错误:', error);
    res.status(500).json({
      success: false,
      error: '获取仪表板数据失败'
    });
  }
});

// 获取用户统计
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { offset = 0, limit = 20, search = '', sortBy = 'created_at', order = 'DESC' } = req.query;
    const connection = getConnection();
    
    let sql = `
      SELECT 
        u.*,
        COUNT(DISTINCT t.id) as submittedTools,
        COUNT(DISTINCT c.id) as commentsCount,
        COUNT(DISTINCT r.id) as ratingsCount,
        COUNT(DISTINCT f.id) as favoritesCount
      FROM users u
      LEFT JOIN tools t ON u.id = t.submittedBy
      LEFT JOIN comments c ON u.id = c.userId AND c.isActive = TRUE
      LEFT JOIN ratings r ON u.id = r.userId AND r.isActive = TRUE
      LEFT JOIN favorites f ON u.id = f.userId AND f.isActive = TRUE
      WHERE u.is_active = TRUE
    `;
    
    const params = [];
    
    if (search) {
      sql += ' AND (u.username LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' GROUP BY u.id';
    
    // 添加排序
    const validSortFields = ['created_at', 'last_login_at', 'submittedTools', 'commentsCount', 'ratingsCount'];
    const validOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sortBy) && validOrders.includes(order.toUpperCase())) {
      sql += ` ORDER BY ${sortBy} ${order.toUpperCase()}`;
    } else {
      sql += ' ORDER BY u.created_at DESC';
    }
    
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await connection.execute(sql, params);
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM users WHERE is_active = TRUE';
    const countParams = [];
    
    if (search) {
      countSql += ' AND (username LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const [countRows] = await connection.execute(countSql, countParams);
    const total = countRows[0].total;
    
    res.json({
      success: true,
      data: {
        users: rows.map(user => ({
          ...user,
          password_hash: undefined // 不返回密码哈希
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取用户统计失败'
    });
  }
});

// 获取工具统计
router.get('/tools', authenticate, requireAdmin, async (req, res) => {
  try {
    const { offset = 0, limit = 20, status = '', category = '', search = '' } = req.query;
    const connection = getConnection();
    
    let sql = `
      SELECT 
        t.*,
        u.username as submittedByUsername,
        COUNT(DISTINCT c.id) as commentsCount,
        COUNT(DISTINCT r.id) as ratingsCount,
        COUNT(DISTINCT f.id) as favoritesCount
      FROM tools t
      LEFT JOIN users u ON t.submittedBy = u.id
      LEFT JOIN comments c ON t.id = c.toolId AND c.isActive = TRUE
      LEFT JOIN ratings r ON t.id = r.toolId AND r.isActive = TRUE
      LEFT JOIN favorites f ON t.id = f.toolId AND f.isActive = TRUE
      WHERE t.isActive = TRUE
    `;
    
    const params = [];
    
    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }
    
    if (category) {
      sql += ' AND t.category = ?';
      params.push(category);
    }
    
    if (search) {
      sql += ' AND (t.name LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' GROUP BY t.id ORDER BY t.createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await connection.execute(sql, params);
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM tools WHERE isActive = TRUE';
    const countParams = [];
    
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    
    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }
    
    if (search) {
      countSql += ' AND (name LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const [countRows] = await connection.execute(countSql, countParams);
    const total = countRows[0].total;
    
    res.json({
      success: true,
      data: {
        tools: rows,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取工具统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取工具统计失败'
    });
  }
});

// 获取评论统计
router.get('/comments', authenticate, requireAdmin, async (req, res) => {
  try {
    const { offset = 0, limit = 20, status = 'all', search = '' } = req.query;
    const connection = getConnection();
    
    let sql = `
      SELECT 
        c.*,
        u.username,
        t.name as toolName,
        t.category as toolCategory
      FROM comments c
      LEFT JOIN users u ON c.userId = u.id
      LEFT JOIN tools t ON c.toolId = t.id
      WHERE c.isActive = TRUE
    `;
    
    const params = [];
    
    if (status === 'pending') {
      sql += ' AND c.isApproved = FALSE';
    } else if (status === 'approved') {
      sql += ' AND c.isApproved = TRUE';
    }
    
    if (search) {
      sql += ' AND (c.content LIKE ? OR u.username LIKE ? OR t.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY c.createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await connection.execute(sql, params);
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM comments WHERE isActive = TRUE';
    const countParams = [];
    
    if (status === 'pending') {
      countSql += ' AND isApproved = FALSE';
    } else if (status === 'approved') {
      countSql += ' AND isApproved = TRUE';
    }
    
    if (search) {
      countSql += ' AND (content LIKE ? OR userId IN (SELECT id FROM users WHERE username LIKE ?) OR toolId IN (SELECT id FROM tools WHERE name LIKE ?))';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const [countRows] = await connection.execute(countSql, countParams);
    const total = countRows[0].total;
    
    res.json({
      success: true,
      data: {
        comments: rows,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取评论统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取评论统计失败'
    });
  }
});

// 获取系统活动日志
router.get('/activity', authenticate, requireAdmin, async (req, res) => {
  try {
    const { offset = 0, limit = 50, action = '', startDate = '', endDate = '' } = req.query;
    const connection = getConnection();
    
    let sql = `
      SELECT 
        h.*,
        u.username,
        t.name as toolName
      FROM user_history h
      LEFT JOIN users u ON h.userId = u.id
      LEFT JOIN tools t ON h.targetId = t.id AND h.targetType = 'tool'
      WHERE h.isActive = TRUE
    `;
    
    const params = [];
    
    if (action) {
      sql += ' AND h.action = ?';
      params.push(action);
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
    let countSql = 'SELECT COUNT(*) as total FROM user_history WHERE isActive = TRUE';
    const countParams = [];
    
    if (action) {
      countSql += ' AND action = ?';
      countParams.push(action);
    }
    
    if (startDate) {
      countSql += ' AND createdAt >= ?';
      countParams.push(startDate);
    }
    
    if (endDate) {
      countSql += ' AND createdAt <= ?';
      countParams.push(endDate);
    }
    
    const [countRows] = await connection.execute(countSql, countParams);
    const total = countRows[0].total;
    
    res.json({
      success: true,
      data: {
        activities: rows.map(activity => ({
          ...activity,
          metadata: activity.metadata ? JSON.parse(activity.metadata) : null
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取系统活动错误:', error);
    res.status(500).json({
      success: false,
      error: '获取系统活动失败'
    });
  }
});

// 获取系统性能指标
router.get('/performance', authenticate, requireAdmin, async (req, res) => {
  try {
    const connection = getConnection();
    
    // 获取数据库性能指标
    const performanceSql = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as totalUsers,
        (SELECT COUNT(*) FROM tools WHERE isActive = TRUE) as totalTools,
        (SELECT COUNT(*) FROM comments WHERE isActive = TRUE) as totalComments,
        (SELECT COUNT(*) FROM ratings WHERE isActive = TRUE) as totalRatings,
        (SELECT COUNT(*) FROM favorites WHERE isActive = TRUE) as totalFavorites,
        (SELECT COUNT(*) FROM user_history WHERE isActive = TRUE) as totalHistory,
        (SELECT AVG(averageRating) FROM tools WHERE averageRating > 0) as avgToolRating,
        (SELECT COUNT(*) FROM tools WHERE status = 'pending') as pendingApprovals
    `;
    
    const [performanceRows] = await connection.execute(performanceSql);
    const performance = performanceRows[0];
    
    // 获取最近7天的活跃用户
    const activeUsersSql = `
      SELECT 
        DATE(createdAt) as date,
        COUNT(DISTINCT userId) as activeUsers
      FROM user_history 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `;
    
    const [activeUsersRows] = await connection.execute(activeUsersSql);
    
    // 获取热门工具（按浏览量）
    const popularToolsSql = `
      SELECT 
        t.id,
        t.name,
        t.category,
        t.viewCount,
        t.favoriteCount,
        t.averageRating,
        t.ratingCount
      FROM tools t
      WHERE t.isActive = TRUE AND t.status = 'approved'
      ORDER BY t.viewCount DESC
      LIMIT 10
    `;
    
    const [popularToolsRows] = await connection.execute(popularToolsSql);
    
    res.json({
      success: true,
      data: {
        performance: {
          totalUsers: performance.totalUsers || 0,
          totalTools: performance.totalTools || 0,
          totalComments: performance.totalComments || 0,
          totalRatings: performance.totalRatings || 0,
          totalFavorites: performance.totalFavorites || 0,
          totalHistory: performance.totalHistory || 0,
          avgToolRating: performance.avgToolRating ? parseFloat(performance.avgToolRating.toFixed(2)) : 0,
          pendingApprovals: performance.pendingApprovals || 0
        },
        activeUsers: activeUsersRows,
        popularTools: popularToolsRows
      }
    });

  } catch (error) {
    console.error('获取系统性能错误:', error);
    res.status(500).json({
      success: false,
      error: '获取系统性能失败'
    });
  }
});

// 批量操作
router.post('/batch', authenticate, requireAdmin, async (req, res) => {
  try {
    const { action, type, ids } = req.body;
    const connection = getConnection();
    
    if (!action || !type || !ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '参数不完整'
      });
    }
    
    let result = { success: 0, failed: 0, errors: [] };
    
    for (const id of ids) {
      try {
        if (type === 'users') {
          if (action === 'deactivate') {
            await connection.execute('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
            result.success++;
          } else if (action === 'activate') {
            await connection.execute('UPDATE users SET is_active = TRUE WHERE id = ?', [id]);
            result.success++;
          }
        } else if (type === 'tools') {
          if (action === 'approve') {
            await connection.execute('UPDATE tools SET status = "approved", approvedBy = ?, approvedAt = NOW() WHERE id = ?', [req.user.id, id]);
            result.success++;
          } else if (action === 'reject') {
            await connection.execute('UPDATE tools SET status = "rejected", approvedBy = ?, approvedAt = NOW() WHERE id = ?', [req.user.id, id]);
            result.success++;
          } else if (action === 'delete') {
            await connection.execute('UPDATE tools SET isActive = FALSE WHERE id = ?', [id]);
            result.success++;
          }
        } else if (type === 'comments') {
          if (action === 'approve') {
            await connection.execute('UPDATE comments SET isApproved = TRUE WHERE id = ?', [id]);
            result.success++;
          } else if (action === 'reject') {
            await connection.execute('UPDATE comments SET isApproved = FALSE WHERE id = ?', [id]);
            result.success++;
          } else if (action === 'delete') {
            await connection.execute('UPDATE comments SET isActive = FALSE WHERE id = ?', [id]);
            result.success++;
          }
        }
      } catch (error) {
        result.failed++;
        result.errors.push(`ID ${id}: ${error.message}`);
      }
    }
    
    res.json({
      success: true,
      message: `批量操作完成，成功: ${result.success}, 失败: ${result.failed}`,
      data: result
    });

  } catch (error) {
    console.error('批量操作错误:', error);
    res.status(500).json({
      success: false,
      error: '批量操作失败'
    });
  }
});

module.exports = router;