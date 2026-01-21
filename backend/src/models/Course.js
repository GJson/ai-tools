const { getConnection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Course {
  constructor(data) {
    this.id = data.id;
    this.uuid = data.uuid;
    this.title = data.title;
    this.description = data.description;
    this.instructor = data.instructor;
    this.price = data.price;
    this.imageUrl = data.imageUrl;
    this.duration = data.duration;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.maxStudents = data.maxStudents;
    this.currentStudents = data.currentStudents;
    this.tags = data.tags ? (typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags) : [];
    this.category = data.category;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // 创建课程
  static async create(courseData) {
    const connection = await getConnection();
    try {
      const uuid = uuidv4();
      const tags = Array.isArray(courseData.tags) ? JSON.stringify(courseData.tags) : '[]';
      
      const sql = `
        INSERT INTO courses (
          uuid, title, description, instructor, price, imageUrl,
          duration, startDate, endDate, maxStudents, currentStudents,
          tags, category
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute(sql, [
        uuid,
        courseData.title,
        courseData.description,
        courseData.instructor,
        courseData.price || 0,
        courseData.imageUrl || null,
        courseData.duration,
        courseData.startDate,
        courseData.endDate,
        courseData.maxStudents || 30,
        courseData.currentStudents || 0,
        tags,
        courseData.category
      ]);
      
      // 先释放当前连接，再查询新创建的记录
      connection.release();
      
      // findById会获取新连接，并在内部释放
      return await Course.findById(result.insertId);
    } catch (error) {
      // 确保出错时也释放连接
      if (connection) {
        connection.release();
      }
      throw error;
    }
  }

  // 根据ID查找课程
  static async findById(id) {
    const connection = await getConnection();
    try {
      const sql = 'SELECT * FROM courses WHERE id = ? AND isActive = TRUE';
      const [rows] = await connection.execute(sql, [id]);
      
      if (rows.length === 0) return null;
      return new Course(rows[0]);
    } finally {
      connection.release();
    }
  }

  // 根据UUID查找课程
  static async findByUuid(uuid) {
    const connection = await getConnection();
    try {
      const sql = 'SELECT * FROM courses WHERE uuid = ? AND isActive = TRUE';
      const [rows] = await connection.execute(sql, [uuid]);
      
      if (rows.length === 0) return null;
      return new Course(rows[0]);
    } finally {
      connection.release();
    }
  }

  // 获取课程列表
  static async findAll(options = {}) {
    const connection = await getConnection();
    try {
      const {
        category,
        instructor,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = options;

      let sql = 'SELECT * FROM courses WHERE isActive = TRUE';
      const params = [];

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      if (instructor) {
        sql += ' AND instructor = ?';
        params.push(instructor);
      }

      if (search) {
        sql += ' AND (title LIKE ? OR description LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
      }

      // 排序
      const allowedSortFields = ['createdAt', 'startDate', 'price', 'currentStudents'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      sql += ` ORDER BY ${sortField} ${order}`;

      // 分页（LIMIT 和 OFFSET 不能使用参数绑定，需要直接拼接）
      const offset = (page - 1) * limit;
      sql += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

      const [rows] = await connection.execute(sql, params);
      return rows.map(row => new Course(row));
    } finally {
      // 确保连接被释放回连接池
      connection.release();
    }
  }

  // 获取课程总数
  static async count(options = {}) {
    const connection = await getConnection();
    try {
      const { category, instructor, search } = options;

      let sql = 'SELECT COUNT(*) as total FROM courses WHERE isActive = TRUE';
      const params = [];

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      if (instructor) {
        sql += ' AND instructor = ?';
        params.push(instructor);
      }

      if (search) {
        sql += ' AND (title LIKE ? OR description LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
      }

      const [rows] = await connection.execute(sql, params);
      return rows[0].total;
    } finally {
      // 确保连接被释放回连接池
      connection.release();
    }
  }

  // 更新课程
  async update(updateData) {
    const connection = await getConnection();
    try {
      const allowedFields = [
        'title', 'description', 'instructor', 'price', 'imageUrl',
        'duration', 'startDate', 'endDate', 'maxStudents', 'currentStudents',
        'tags', 'category'
      ];
      const updates = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (key === 'tags' && Array.isArray(value)) {
            updates.push(`${key} = ?`);
            values.push(JSON.stringify(value));
          } else {
            updates.push(`${key} = ?`);
            values.push(value);
          }
        }
      }

      if (updates.length === 0) {
        throw new Error('没有可更新的字段');
      }

      values.push(this.id);
      const sql = `UPDATE courses SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`;
      
      await connection.execute(sql, values);
      
      // 更新当前对象
      Object.assign(this, updateData);
      if (updateData.tags && Array.isArray(updateData.tags)) {
        this.tags = updateData.tags;
      }
      return this;
    } finally {
      connection.release();
    }
  }

  // 增加当前学生数
  async incrementStudents() {
    const connection = await getConnection();
    try {
      const sql = 'UPDATE courses SET currentStudents = currentStudents + 1, updatedAt = NOW() WHERE id = ? AND currentStudents < maxStudents';
      const [result] = await connection.execute(sql, [this.id]);
      
      if (result.affectedRows > 0) {
        this.currentStudents += 1;
      }
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // 减少当前学生数
  async decrementStudents() {
    const connection = await getConnection();
    try {
      const sql = 'UPDATE courses SET currentStudents = GREATEST(currentStudents - 1, 0), updatedAt = NOW() WHERE id = ?';
      await connection.execute(sql, [this.id]);
      
      if (this.currentStudents > 0) {
        this.currentStudents -= 1;
      }
      return this;
    } finally {
      connection.release();
    }
  }

  // 软删除课程
  async softDelete() {
    const connection = await getConnection();
    try {
      const sql = 'UPDATE courses SET isActive = FALSE, updatedAt = NOW() WHERE id = ?';
      await connection.execute(sql, [this.id]);
      this.isActive = false;
      return this;
    } finally {
      connection.release();
    }
  }

  // 转换为JSON对象
  toJSON() {
    return {
      id: this.id,
      uuid: this.uuid,
      title: this.title,
      description: this.description,
      instructor: this.instructor,
      price: parseFloat(this.price),
      imageUrl: this.imageUrl,
      duration: this.duration,
      startDate: this.startDate,
      endDate: this.endDate,
      maxStudents: this.maxStudents,
      currentStudents: this.currentStudents,
      tags: Array.isArray(this.tags) ? this.tags : (this.tags ? JSON.parse(this.tags) : []),
      category: this.category,
      isAvailable: this.currentStudents < this.maxStudents,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Course;
