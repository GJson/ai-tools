const { getConnection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Order {
  constructor(data) {
    this.id = data.id;
    this.uuid = data.uuid;
    this.courseId = data.courseId;
    this.courseTitle = data.courseTitle;
    this.userId = data.userId;
    this.amount = data.amount;
    this.status = data.status;
    this.paidAt = data.paidAt;
    this.cancelledAt = data.cancelledAt;
    this.completedAt = data.completedAt;
    this.paymentMethod = data.paymentMethod;
    this.paymentTransactionId = data.paymentTransactionId;
    this.notes = data.notes;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // 创建订单
  static async create(orderData) {
    const connection = await getConnection();
    const uuid = uuidv4();
    
    const sql = `
      INSERT INTO orders (
        uuid, courseId, courseTitle, userId, amount, status,
        paymentMethod, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute(sql, [
      uuid,
      orderData.courseId,
      orderData.courseTitle,
      orderData.userId,
      orderData.amount,
      orderData.status || 'pending',
      orderData.paymentMethod || null,
      orderData.notes || null
    ]);
    
    return await Order.findById(result.insertId);
  }

  // 根据ID查找订单
  static async findById(id) {
    const connection = await getConnection();
    const sql = 'SELECT * FROM orders WHERE id = ? AND isActive = TRUE';
    const [rows] = await connection.execute(sql, [id]);
    
    if (rows.length === 0) return null;
    return new Order(rows[0]);
  }

  // 根据UUID查找订单
  static async findByUuid(uuid) {
    const connection = await getConnection();
    const sql = 'SELECT * FROM orders WHERE uuid = ? AND isActive = TRUE';
    const [rows] = await connection.execute(sql, [uuid]);
    
    if (rows.length === 0) return null;
    return new Order(rows[0]);
  }

  // 根据用户ID获取订单列表
  static async findByUserId(userId, options = {}) {
    const connection = await getConnection();
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = options;

    let sql = 'SELECT * FROM orders WHERE userId = ? AND isActive = TRUE';
    const params = [userId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    // 排序
    const allowedSortFields = ['createdAt', 'paidAt', 'amount'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${order}`;

    // 分页
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await connection.execute(sql, params);
    return rows.map(row => new Order(row));
  }

  // 根据课程ID获取订单列表
  static async findByCourseId(courseId) {
    const connection = await getConnection();
    const sql = 'SELECT * FROM orders WHERE courseId = ? AND isActive = TRUE ORDER BY createdAt DESC';
    const [rows] = await connection.execute(sql, [courseId]);
    return rows.map(row => new Order(row));
  }

  // 更新订单状态
  async updateStatus(status, additionalData = {}) {
    const connection = await getConnection();
    const allowedStatuses = ['pending', 'paid', 'cancelled', 'completed'];
    
    if (!allowedStatuses.includes(status)) {
      throw new Error('无效的订单状态');
    }

    const updates = ['status = ?'];
    const values = [status];

    if (status === 'paid' && !this.paidAt) {
      updates.push('paidAt = NOW()');
    } else if (status === 'cancelled' && !this.cancelledAt) {
      updates.push('cancelledAt = NOW()');
    } else if (status === 'completed' && !this.completedAt) {
      updates.push('completedAt = NOW()');
    }

    if (additionalData.paymentMethod) {
      updates.push('paymentMethod = ?');
      values.push(additionalData.paymentMethod);
    }

    if (additionalData.paymentTransactionId) {
      updates.push('paymentTransactionId = ?');
      values.push(additionalData.paymentTransactionId);
    }

    if (additionalData.notes) {
      updates.push('notes = ?');
      values.push(additionalData.notes);
    }

    values.push(this.id);
    const sql = `UPDATE orders SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`;
    
    await connection.execute(sql, values);
    this.status = status;
    
    if (status === 'paid' && !this.paidAt) {
      this.paidAt = new Date();
    } else if (status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    } else if (status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }

    if (additionalData.paymentMethod) {
      this.paymentMethod = additionalData.paymentMethod;
    }
    if (additionalData.paymentTransactionId) {
      this.paymentTransactionId = additionalData.paymentTransactionId;
    }
    if (additionalData.notes) {
      this.notes = additionalData.notes;
    }

    return this;
  }

  // 更新订单
  async update(updateData) {
    const connection = await getConnection();
    const allowedFields = ['amount', 'notes', 'paymentMethod', 'paymentTransactionId'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('没有可更新的字段');
    }

    values.push(this.id);
    const sql = `UPDATE orders SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`;
    
    await connection.execute(sql, values);
    Object.assign(this, updateData);
    return this;
  }

  // 软删除订单
  async softDelete() {
    const connection = await getConnection();
    const sql = 'UPDATE orders SET isActive = FALSE, updatedAt = NOW() WHERE id = ?';
    await connection.execute(sql, [this.id]);
    this.isActive = false;
    return this;
  }

  // 转换为JSON对象
  toJSON() {
    return {
      id: this.id,
      uuid: this.uuid,
      courseId: this.courseId,
      courseTitle: this.courseTitle,
      userId: this.userId,
      amount: parseFloat(this.amount),
      status: this.status,
      paidAt: this.paidAt,
      cancelledAt: this.cancelledAt,
      completedAt: this.completedAt,
      paymentMethod: this.paymentMethod,
      paymentTransactionId: this.paymentTransactionId,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Order;
