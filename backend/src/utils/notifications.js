const Notification = require('../models/Notification');

/**
 * 创建订单通知
 */
async function createOrderNotification(userId, order, status) {
  try {
    let title = '';
    let content = '';

    switch (status) {
      case 'paid':
        title = '订单支付成功';
        content = `您的订单"${order.courseTitle}"已支付成功，金额：¥${order.amount.toFixed(2)}。`;
        break;
      case 'cancelled':
        title = '订单已取消';
        content = `您的订单"${order.courseTitle}"已取消。`;
        break;
      case 'completed':
        title = '订单已完成';
        content = `您的订单"${order.courseTitle}"已完成。`;
        break;
      default:
        return null;
    }

    return await Notification.create({
      userId,
      type: 'order',
      title,
      content,
      relatedId: order.id,
      relatedType: 'order',
    });
  } catch (error) {
    console.error('创建订单通知失败:', error);
    return null;
  }
}

/**
 * 创建课程通知
 */
async function createCourseNotification(userId, course, type) {
  try {
    let title = '';
    let content = '';

    switch (type) {
      case 'start':
        title = '课程即将开始';
        content = `您报名的课程"${course.title}"即将开始，请做好准备。`;
        break;
      case 'reminder':
        title = '课程提醒';
        content = `您报名的课程"${course.title}"将在明天开始，请做好准备。`;
        break;
      default:
        return null;
    }

    return await Notification.create({
      userId,
      type: 'course',
      title,
      content,
      relatedId: course.id,
      relatedType: 'course',
    });
  } catch (error) {
    console.error('创建课程通知失败:', error);
    return null;
  }
}

/**
 * 创建系统通知
 */
async function createSystemNotification(userId, title, content) {
  try {
    return await Notification.create({
      userId,
      type: 'system',
      title,
      content,
    });
  } catch (error) {
    console.error('创建系统通知失败:', error);
    return null;
  }
}

/**
 * 创建评价通知（当有新的评价时）
 */
async function createRatingNotification(courseOwnerId, course, rating) {
  try {
    return await Notification.create({
      userId: courseOwnerId,
      type: 'rating',
      title: '收到新评价',
      content: `您的课程"${course.title}"收到了一条新评价。`,
      relatedId: rating.id,
      relatedType: 'rating',
    });
  } catch (error) {
    console.error('创建评价通知失败:', error);
    return null;
  }
}

module.exports = {
  createOrderNotification,
  createCourseNotification,
  createSystemNotification,
  createRatingNotification,
};
