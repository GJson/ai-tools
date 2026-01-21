const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Course = require('../models/Course');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 获取课程列表
router.get('/', [
  query('category').optional().isString(),
  query('instructor').optional().isString(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'startDate', 'price', 'currentStudents']),
  query('sortOrder').optional().isIn(['ASC', 'DESC'])
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const {
      category,
      instructor,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    let courses, total;
    try {
      courses = await Course.findAll({
        category,
        instructor,
        search,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      });

      total = await Course.count({ category, instructor, search });
    } catch (dbError) {
      console.error('数据库查询错误:', dbError);
      throw dbError;
    }

    res.json({
      success: true,
      data: {
        courses: courses.map(course => course.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取课程列表失败'
    });
  }
});

// 获取课程详情
router.get('/:uuid', optionalAuth, async (req, res) => {
  try {
    const { uuid } = req.params;
    const course = await Course.findByUuid(uuid);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: '课程不存在'
      });
    }

    res.json({
      success: true,
      data: {
        course: course.toJSON()
      }
    });
  } catch (error) {
    console.error('获取课程详情错误:', error);
    res.status(500).json({
      success: false,
      error: '获取课程详情失败'
    });
  }
});

// 创建课程（需要认证，通常用于管理员）
router.post('/', [
  body('title').notEmpty().withMessage('课程标题不能为空'),
  body('description').notEmpty().withMessage('课程描述不能为空'),
  body('instructor').notEmpty().withMessage('讲师不能为空'),
  body('price').isFloat({ min: 0 }).withMessage('价格必须大于等于0'),
  body('duration').isInt({ min: 1 }).withMessage('课程时长必须大于0'),
  body('startDate').isISO8601().withMessage('开始日期格式错误'),
  body('endDate').isISO8601().withMessage('结束日期格式错误'),
  body('maxStudents').optional().isInt({ min: 1 }).withMessage('最大学生数必须大于0'),
  body('category').notEmpty().withMessage('课程分类不能为空'),
  body('tags').optional().isArray().withMessage('标签必须是数组')
], authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const courseData = {
      ...req.body,
      currentStudents: req.body.currentStudents || 0
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: '课程创建成功',
      data: {
        course: course.toJSON()
      }
    });
  } catch (error) {
    console.error('创建课程错误:', error);
    res.status(500).json({
      success: false,
      error: '创建课程失败'
    });
  }
});

// 更新课程（需要认证）
router.put('/:uuid', [
  body('title').optional().notEmpty().withMessage('课程标题不能为空'),
  body('description').optional().notEmpty().withMessage('课程描述不能为空'),
  body('instructor').optional().notEmpty().withMessage('讲师不能为空'),
  body('price').optional().isFloat({ min: 0 }).withMessage('价格必须大于等于0'),
  body('duration').optional().isInt({ min: 1 }).withMessage('课程时长必须大于0'),
  body('startDate').optional().isISO8601().withMessage('开始日期格式错误'),
  body('endDate').optional().isISO8601().withMessage('结束日期格式错误'),
  body('maxStudents').optional().isInt({ min: 1 }).withMessage('最大学生数必须大于0'),
  body('category').optional().notEmpty().withMessage('课程分类不能为空'),
  body('tags').optional().isArray().withMessage('标签必须是数组')
], authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { uuid } = req.params;
    const course = await Course.findByUuid(uuid);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: '课程不存在'
      });
    }

    await course.update(req.body);

    res.json({
      success: true,
      message: '课程更新成功',
      data: {
        course: course.toJSON()
      }
    });
  } catch (error) {
    console.error('更新课程错误:', error);
    res.status(500).json({
      success: false,
      error: '更新课程失败'
    });
  }
});

// 删除课程（需要认证）
router.delete('/:uuid', authenticate, async (req, res) => {
  try {
    const { uuid } = req.params;
    const course = await Course.findByUuid(uuid);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: '课程不存在'
      });
    }

    await course.softDelete();

    res.json({
      success: true,
      message: '课程删除成功'
    });
  } catch (error) {
    console.error('删除课程错误:', error);
    res.status(500).json({
      success: false,
      error: '删除课程失败'
    });
  }
});

module.exports = router;
