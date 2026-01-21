const express = require('express');
const { body, validationResult } = require('express-validator');
const Tool = require('../models/Tool');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// 提交工具
router.post('/submit', authenticate, [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('工具名称长度必须在1-100个字符之间'),
  body('description')
    .isLength({ min: 10, max: 500 })
    .withMessage('工具描述长度必须在10-500个字符之间'),
  body('category')
    .notEmpty()
    .withMessage('请选择分类'),
  body('website')
    .isURL()
    .withMessage('请输入有效的网站地址'),
  body('pricing')
    .isIn(['free', 'freemium', 'paid', 'trial'])
    .withMessage('请选择有效的定价模式'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('标签数量不能超过10个'),
  body('features')
    .optional()
    .isArray({ max: 10 })
    .withMessage('功能数量不能超过10个'),
  body('screenshots')
    .optional()
    .isArray({ max: 5 })
    .withMessage('截图数量不能超过5张'),
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('notes')
    .optional()
    .isLength({ max: 300 })
    .withMessage('备注不能超过300个字符')
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

    const {
      name,
      description,
      category,
      tags = [],
      website,
      pricing,
      features = [],
      screenshots = [],
      contactEmail,
      notes
    } = req.body;

    // 检查工具名称是否已存在
    if (await Tool.isNameExists(name)) {
      return res.status(409).json({
        success: false,
        error: '工具名称已存在'
      });
    }

    // 创建工具
    const tool = await Tool.create({
      name,
      description,
      category,
      tags,
      website,
      pricing,
      features,
      screenshots,
      contactEmail,
      notes,
      submittedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: '工具提交成功，等待审核',
      data: {
        tool: tool.toSafeObject()
      }
    });

  } catch (error) {
    console.error('提交工具错误:', error);
    res.status(500).json({
      success: false,
      error: '提交工具失败，请稍后重试'
    });
  }
});

// 获取工具列表
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      pricing,
      limit = 20,
      offset = 0,
      sort = 'newest'
    } = req.query;

    let tools;
    
    if (search) {
      tools = await Tool.searchTools(search, parseInt(limit), parseInt(offset));
    } else if (category) {
      tools = await Tool.getToolsByCategory(category, parseInt(limit), parseInt(offset));
    } else {
      tools = await Tool.getApprovedTools(parseInt(limit), parseInt(offset));
    }

    // 过滤定价模式
    if (pricing) {
      tools = tools.filter(tool => tool.pricing === pricing);
    }

    // 排序
    if (sort === 'popular') {
      tools.sort((a, b) => b.viewCount - a.viewCount);
    } else if (sort === 'rating') {
      tools.sort((a, b) => b.averageRating - a.averageRating);
    }

    res.json({
      success: true,
      data: {
        tools: tools.map(tool => tool.toPublicObject()),
        total: tools.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取工具列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取工具列表失败'
    });
  }
});

// 获取工具详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 尝试按ID查找
    let tool = await Tool.findById(id);
    
    // 如果按ID找不到，尝试按UUID查找
    if (!tool) {
      tool = await Tool.findByUuid(id);
    }
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: '工具不存在'
      });
    }

    // 增加浏览次数
    await tool.incrementViewCount();

    res.json({
      success: true,
      data: {
        tool: tool.toPublicObject()
      }
    });

  } catch (error) {
    console.error('获取工具详情错误:', error);
    res.status(500).json({
      success: false,
      error: '获取工具详情失败'
    });
  }
});

// 获取所有工具列表（管理员）
router.get('/admin/pending', authenticate, requireAdmin, async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      status = '', 
      category = '', 
      search = '' 
    } = req.query;
    
    let tools;
    let total = 0;
    
    if (search) {
      // 搜索工具
      tools = await Tool.searchTools(search, parseInt(limit), parseInt(offset));
      total = tools.length;
    } else if (status) {
      // 按状态筛选
      if (status === 'pending') {
        tools = await Tool.getPendingTools(parseInt(limit), parseInt(offset));
      } else if (status === 'approved') {
        tools = await Tool.getApprovedTools(parseInt(limit), parseInt(offset));
      } else {
        // 其他状态，需要自定义查询
        const { getConnection } = require('../config/database');
        const connection = await getConnection();
        const sql = `
          SELECT t.*, u.username as submittedByUsername 
          FROM tools t 
          LEFT JOIN users u ON t.submittedBy = u.id 
          WHERE t.status = ? AND t.isActive = TRUE 
          ORDER BY t.createdAt DESC 
          LIMIT ? OFFSET ?
        `;
        const [rows] = await connection.execute(sql, [status, parseInt(limit), parseInt(offset)]);
        tools = rows.map(row => new Tool(row));
      }
      total = tools.length;
    } else {
      // 获取所有工具
      const { getConnection } = require('../config/database');
      const connection = await getConnection();
      const sql = `
        SELECT t.*, u.username as submittedByUsername 
        FROM tools t 
        LEFT JOIN users u ON t.submittedBy = u.id 
        WHERE t.isActive = TRUE 
        ORDER BY t.createdAt DESC 
        LIMIT ? OFFSET ?
      `;
      const [rows] = await connection.execute(sql, [parseInt(limit), parseInt(offset)]);
      tools = rows.map(row => new Tool(row));
      
      // 获取总数
      const countSql = 'SELECT COUNT(*) as total FROM tools WHERE isActive = TRUE';
      const [countRows] = await connection.execute(countSql);
      total = countRows[0].total;
    }
    
    // 按分类筛选
    if (category && tools.length > 0) {
      tools = tools.filter(tool => tool.category === category);
    }
    
    res.json({
      success: true,
      data: {
        tools: tools.map(tool => tool.toSafeObject()),
        total: total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取工具列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取工具列表失败'
    });
  }
});

// 审核工具（管理员）
router.put('/:id/review', authenticate, requireAdmin, [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('状态必须是approved或rejected'),
  body('rejectedReason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('拒绝原因不能超过500个字符')
], async (req, res) => {
  try {
    // 这里可以添加管理员权限检查
    const { id } = req.params;
    const { status, rejectedReason } = req.body;

    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: '工具不存在'
      });
    }

    if (tool.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: '工具状态不是待审核'
      });
    }

    // 更新工具状态
    await tool.updateStatus(status, req.user.id, rejectedReason);

    res.json({
      success: true,
      message: `工具${status === 'approved' ? '审核通过' : '审核拒绝'}`,
      data: {
        tool: tool.toSafeObject()
      }
    });

  } catch (error) {
    console.error('审核工具错误:', error);
    res.status(500).json({
      success: false,
      error: '审核工具失败'
    });
  }
});

// 获取工具统计信息（管理员）
router.get('/admin/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    // 这里可以添加管理员权限检查
    const stats = await Tool.getStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取工具统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取工具统计失败'
    });
  }
});

// 更新工具信息（管理员）
router.put('/:id', authenticate, requireAdmin, [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('工具名称长度必须在1-100个字符之间'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('工具描述长度必须在10-500个字符之间'),
  body('category')
    .optional()
    .notEmpty()
    .withMessage('分类不能为空'),
  body('website')
    .optional()
    .isURL()
    .withMessage('请输入有效的网站地址'),
  body('pricing')
    .optional()
    .isIn(['free', 'freemium', 'paid', 'trial'])
    .withMessage('请选择有效的定价模式')
], async (req, res) => {
  try {
    // 这里可以添加管理员权限检查
    const { id } = req.params;
    const updateData = req.body;

    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: '工具不存在'
      });
    }

    // 检查名称是否重复
    if (updateData.name && updateData.name !== tool.name) {
      if (await Tool.isNameExists(updateData.name, id)) {
        return res.status(409).json({
          success: false,
          error: '工具名称已存在'
        });
      }
    }

    // 更新工具
    await tool.update(updateData);

    res.json({
      success: true,
      message: '工具更新成功',
      data: {
        tool: tool.toSafeObject()
      }
    });

  } catch (error) {
    console.error('更新工具错误:', error);
    res.status(500).json({
      success: false,
      error: '更新工具失败'
    });
  }
});

// 删除工具（管理员）
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // 这里可以添加管理员权限检查
    const { id } = req.params;

    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: '工具不存在'
      });
    }

    // 软删除工具
    await tool.softDelete();

    res.json({
      success: true,
      message: '工具删除成功'
    });

  } catch (error) {
    console.error('删除工具错误:', error);
    res.status(500).json({
      success: false,
      error: '删除工具失败'
    });
  }
});

module.exports = router;