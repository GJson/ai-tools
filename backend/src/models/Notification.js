const { getConnection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Notification {
  constructor(data) {
    this.id = data.id;
    this.uuid = data.uuid;
    this.userId = data.userId;
    this.type = data.type;
    this.title = data.title;
    this.content = data.content;
    this.relatedId = data.relatedId;
    this.relatedType = data.relatedType;
    this.isRead = data.isRead;
    this.readAt = data.readAt;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // 创建通知
  static async create(notificationData) {
    const connection = await getConnection();
    try {
      const uuid = uuidv4();
      
      const sql = `
        INSERT INTO notifications (
          uuid, userId, type, title, content, relatedId, relatedType
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute(sql, [
        uuid,
        notificationData.userId,
        notificationData.type,
        notificationData.title,
        notificationData.content,
        notificationData.relatedId || null,
        notificationData.relatedType || null,
      ]);
      
      return await Notification.findById(result.insertId);
    } finally {
      connection.release();
    }
  }

  // 根据ID查找通知
  static async findById(id) {
    const connection = await getConnection();
    try {
      const sql = 'SELECT * FROM notifications WHERE id = ? AND isActive = TRUE';
      const [rows] = await connection.execute(sql, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Notification(rows[0]);
    } finally {
      connection.release();
    }
  }

  // 根据UUID查找通知
  static async findByUuid(uuid) {
    const connection = await getConnection();
    try {
      const sql = 'SELECT * FROM notifications WHERE uuid = ? AND isActive = TRUE';
      const [rows] = await connection.execute(sql, [uuid]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Notification(rows[0]);
    } finally {
      connection.release();
    }
  }

  // 获取用户的通知列表
  static async findByUserId(userId, options = {}) {
    const connection = await getConnection();
    try {
      const { page = 1, limit = 20, type, isRead } = options;
      const offset = (page - 1) * limit;
      
      let sql = 'SELECT * FROM notifications WHERE userId = ? AND isActive = TRUE';
      const params = [userId];
      
      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }
      
      if (isRead !== undefined) {
        sql += ' AND isRead = ?';
        params.push(isRead ? 1 : 0);
      }
      
      sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [rows] = await connection.execute(sql, params);
      
      return rows.map(row => new Notification(row));
    } finally {
      connection.release();
    }
  }

  // 获取用户未读通知数量
  static async getUnreadCount(userId) {
    const connection = await getConnection();
    try {
      const sql = 'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = FALSE AND isActive = TRUE';
      const [rows] = await connection.execute(sql, [userId]);
      
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  // 标记为已读
  async markAsRead() {
    const connection = await getConnection();
    try {
      const sql = 'UPDATE notifications SET isRead = TRUE, readAt = NOW(), updatedAt = NOW() WHERE id = ?';
      await connection.execute(sql, [this.id]);
      
      this.isRead = true;
      this.readAt = new Date();
      return this;
    } finally {
      connection.release();
    }
  }

  // 标记所有为已读
  static async markAllAsRead(userId) {
    const connection = await getConnection();
    try {
      const sql = 'UPDATE notifications SET isRead = TRUE, readAt = NOW(), updatedAt = NOW() WHERE userId = ? AND isRead = FALSE AND isActive = TRUE';
      const [result] = await connection.execute(sql, [userId]);
      
      return result.affectedRows;
    } finally {
      connection.release();
    }
  }

  // 删除通知（软删除）
  async softDelete() {
    const connection = await getConnection();
    try {
      const sql = 'UPDATE notifications SET isActive = FALSE, updatedAt = NOW() WHERE id = ?';
      await connection.execute(sql, [this.id]);
      
      this.isActive = false;
      return this;
    } finally {
      connection.release();
    }
  }

  // 转换为JSON
  toJSON() {
    return {
      id: this.id,
      uuid: this.uuid,
      userId: this.userId,
      type: this.type,
      title: this.title,
      content: this.content,
      relatedId: this.relatedId,
      relatedType: this.relatedType,
      isRead: this.isRead,
      readAt: this.readAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Notification;
