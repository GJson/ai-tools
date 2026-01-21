const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Course = require('../models/Course');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取订单列表（需要认证）
router.get('/', [
  query('status').optional().isIn(['pending', 'paid', 'cancelled', 'completed']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy').optional().isIn(['createdAt', 'paidAt', 'amount']),
  query('sortOrder').optional().isIn(['ASC', 'DESC'])
], authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const orders = await Order.findByUserId(req.user.id, {
      status,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      data: {
        orders: orders.map(order => order.toJSON())
      }
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取订单列表失败'
    });
  }
});

// 获取订单详情（需要认证）
router.get('/:uuid', authenticate, async (req, res) => {
  try {
    const { uuid } = req.params;
    const order = await Order.findByUuid(uuid);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在'
      });
    }

    // 检查订单是否属于当前用户
    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '无权访问此订单'
      });
    }

    res.json({
      success: true,
      data: {
        order: order.toJSON()
      }
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({
      success: false,
      error: '获取订单详情失败'
    });
  }
});

// 创建订单（需要认证）
router.post('/', [
  body('courseId').isInt().withMessage('课程ID无效'),
  body('paymentMethod').optional().isString()
], authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { courseId, paymentMethod, notes } = req.body;

    // 查找课程
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: '课程不存在'
      });
    }

    // 检查课程是否可报名
    if (course.currentStudents >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        error: '课程已满员'
      });
    }

    // 检查是否已经报名
    const existingOrders = await Order.findByUserId(req.user.id, {});
    const hasEnrolled = existingOrders.some(
      order => order.courseId === courseId && 
      (order.status === 'pending' || order.status === 'paid' || order.status === 'completed')
    );

    if (hasEnrolled) {
      return res.status(400).json({
        success: false,
        error: '您已经报名此课程'
      });
    }

    // 创建订单
    const order = await Order.create({
      courseId: course.id,
      courseTitle: course.title,
      userId: req.user.id,
      amount: course.price,
      status: 'pending',
      paymentMethod: paymentMethod || null,
      notes: notes || null
    });

    res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: {
        order: order.toJSON()
      }
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({
      success: false,
      error: '创建订单失败'
    });
  }
});

// 更新订单状态（支付/取消/完成）
router.patch('/:uuid/status', [
  body('status').isIn(['pending', 'paid', 'cancelled', 'completed']).withMessage('无效的订单状态'),
  body('paymentMethod').optional().isString(),
  body('paymentTransactionId').optional().isString(),
  body('notes').optional().isString()
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
    const { status, paymentMethod, paymentTransactionId, notes } = req.body;

    const order = await Order.findByUuid(uuid);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在'
      });
    }

    // 检查订单是否属于当前用户
    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '无权操作此订单'
      });
    }

    // 更新订单状态
    await order.updateStatus(status, {
      paymentMethod,
      paymentTransactionId,
      notes
    });

    // 如果支付成功，增加课程学生数
    if (status === 'paid' && order.status !== 'paid') {
      const course = await Course.findById(order.courseId);
      if (course) {
        await course.incrementStudents();
      }
    }

    // 如果取消订单且之前已支付，减少课程学生数
    if (status === 'cancelled' && order.status === 'paid') {
      const course = await Course.findById(order.courseId);
      if (course) {
        await course.decrementStudents();
      }
    }

    // 创建订单状态通知
    const { createOrderNotification } = require('../utils/notifications');
    await createOrderNotification(req.user.id, order, status);

    res.json({
      success: true,
      message: '订单状态更新成功',
      data: {
        order: order.toJSON()
      }
    });
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({
      success: false,
      error: '更新订单状态失败'
    });
  }
});

// 取消订单（需要认证）
router.post('/:uuid/cancel', authenticate, async (req, res) => {
  try {
    const { uuid } = req.params;
    const order = await Order.findByUuid(uuid);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '订单不存在'
      });
    }

    // 检查订单是否属于当前用户
    if (order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '无权操作此订单'
      });
    }

    // 只能取消待支付或已支付的订单
    if (order.status !== 'pending' && order.status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: '只能取消待支付或已支付的订单'
      });
    }

    // 更新订单状态
    await order.updateStatus('cancelled', {
      notes: req.body.notes || '用户取消订单'
    });

    // 如果之前已支付，减少课程学生数
    if (order.status === 'paid') {
      const course = await Course.findById(order.courseId);
      if (course) {
        await course.decrementStudents();
      }
    }

    res.json({
      success: true,
      message: '订单取消成功',
      data: {
        order: order.toJSON()
      }
    });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({
      success: false,
      error: '取消订单失败'
    });
  }
});

module.exports = router;
