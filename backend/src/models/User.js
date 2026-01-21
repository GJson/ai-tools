const { getConnection } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id;
    this.uuid = data.uuid;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.avatar = data.avatar;
    this.bio = data.bio;
    this.website = data.website;
    this.location = data.location;
    this.isPublic = data.isPublic !== undefined ? data.isPublic : true;
    this.showEmail = data.showEmail !== undefined ? data.showEmail : false;
    this.showStats = data.showStats !== undefined ? data.showStats : true;
    this.channel = data.channel || 'gjson.com'; // 渠道来源，默认为官网
    this.is_active = data.is_active;
    this.email_verified = data.email_verified;
    this.last_login_at = data.last_login_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // 创建用户
  static async create(userData) {
    const connection = await getConnection();
    try {
      const { username, email, password, channel = 'gjson.com' } = userData;
      
      // 生成UUID
      const uuid = uuidv4();
      
      // 加密密码
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      // 生成默认头像
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
      
      const sql = `
        INSERT INTO users (uuid, username, email, password_hash, avatar, channel)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute(sql, [
        uuid, username, email, password_hash, avatar, channel
      ]);
      
      connection.release();
      return await User.findById(result.insertId);
    } catch (error) {
      connection.release();
      throw error;
    }
  }

  // 根据ID查找用户
  static async findById(id) {
    const connection = await getConnection();
    try {
      const sql = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE';
      const [rows] = await connection.execute(sql, [id]);
      
      if (rows.length === 0) return null;
      return new User(rows[0]);
    } finally {
      connection.release();
    }
  }

  // 根据UUID查找用户
  static async findByUuid(uuid) {
    const connection = await getConnection();
    try {
      const sql = 'SELECT * FROM users WHERE uuid = ? AND is_active = TRUE';
      const [rows] = await connection.execute(sql, [uuid]);
      
      if (rows.length === 0) return null;
      return new User(rows[0]);
    } finally {
      connection.release();
    }
  }

  // 根据邮箱查找用户
  static async findByEmail(email) {
    const connection = await getConnection();
    try {
      const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
      const [rows] = await connection.execute(sql, [email]);
      
      if (rows.length === 0) return null;
      return new User(rows[0]);
    } finally {
      connection.release();
    }
  }

  // 根据用户名查找用户
  static async findByUsername(username) {
    const connection = await getConnection();
    try {
      const sql = 'SELECT * FROM users WHERE username = ? AND is_active = TRUE';
      const [rows] = await connection.execute(sql, [username]);
      
      if (rows.length === 0) return null;
      return new User(rows[0]);
    } finally {
      connection.release();
    }
  }

  // 验证密码
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // 更新最后登录时间
  async updateLastLogin() {
    const connection = await getConnection();
    try {
      const sql = 'UPDATE users SET last_login_at = NOW() WHERE id = ?';
      await connection.execute(sql, [this.id]);
      this.last_login_at = new Date();
    } finally {
      connection.release();
    }
  }

  // 更新用户信息
  async update(updateData) {
    const connection = await getConnection();
    const allowedFields = [
      'username', 
      'email', 
      'avatar', 
      'bio', 
      'website', 
      'location', 
      'isPublic', 
      'showEmail', 
      'showStats'
    ];
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
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
    
    await connection.execute(sql, values);
    
    // 更新当前对象
    Object.assign(this, updateData);
    return this;
  }

  // 更新密码
  async updatePassword(newPassword) {
    const connection = await getConnection();
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const sql = 'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?';
    await connection.execute(sql, [password_hash, this.id]);
    
    this.password_hash = password_hash;
    return this;
  }

  // 软删除用户
  async softDelete() {
    const connection = await getConnection();
    const sql = 'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?';
    await connection.execute(sql, [this.id]);
    this.is_active = false;
    return this;
  }

  // 转换为安全对象（不包含敏感信息）
  toSafeObject() {
    return {
      id: this.id,
      uuid: this.uuid,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
      bio: this.bio,
      website: this.website,
      location: this.location,
      isPublic: this.isPublic,
      showEmail: this.showEmail,
      showStats: this.showStats,
      channel: this.channel,
      is_active: this.is_active,
      email_verified: this.email_verified,
      last_login_at: this.last_login_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // 检查邮箱是否已存在
  static async isEmailExists(email) {
    const connection = await getConnection();
    const sql = 'SELECT COUNT(*) as count FROM users WHERE email = ? AND is_active = TRUE';
    const [rows] = await connection.execute(sql, [email]);
    return rows[0].count > 0;
  }

  // 检查用户名是否已存在
  static async isUsernameExists(username) {
    const connection = await getConnection();
    const sql = 'SELECT COUNT(*) as count FROM users WHERE username = ? AND is_active = TRUE';
    const [rows] = await connection.execute(sql, [username]);
    return rows[0].count > 0;
  }
}

module.exports = User;
