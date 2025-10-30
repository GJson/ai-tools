const { getConnection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Tool {
  constructor(data) {
    this.id = data.id;
    this.uuid = data.uuid;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.tags = data.tags ? JSON.parse(data.tags) : [];
    this.website = data.website;
    this.pricing = data.pricing;
    this.features = data.features ? JSON.parse(data.features) : [];
    this.screenshots = data.screenshots ? JSON.parse(data.screenshots) : [];
    this.contactEmail = data.contactEmail;
    this.notes = data.notes;
    this.submittedBy = data.submittedBy;
    this.status = data.status;
    this.approvedBy = data.approvedBy;
    this.approvedAt = data.approvedAt;
    this.rejectedReason = data.rejectedReason;
    this.viewCount = data.viewCount || 0;
    this.favoriteCount = data.favoriteCount || 0;
    this.ratingCount = data.ratingCount || 0;
    this.averageRating = data.averageRating || 0;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // 创建工具
  static async create(toolData) {
    const connection = getConnection();
    const { 
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
      submittedBy 
    } = toolData;
    
    // 生成UUID
    const uuid = uuidv4();
    
    const sql = `
      INSERT INTO tools (
        uuid, name, description, category, tags, website, pricing, 
        features, screenshots, contactEmail, notes, submittedBy, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;
    
    const [result] = await connection.execute(sql, [
      uuid, 
      name, 
      description, 
      category, 
      JSON.stringify(tags), 
      website, 
      pricing, 
      JSON.stringify(features), 
      JSON.stringify(screenshots), 
      contactEmail, 
      notes, 
      submittedBy
    ]);
    
    return await Tool.findById(result.insertId);
  }

  // 根据ID查找工具
  static async findById(id) {
    const connection = getConnection();
    const sql = 'SELECT * FROM tools WHERE id = ? AND isActive = TRUE';
    const [rows] = await connection.execute(sql, [id]);
    
    if (rows.length === 0) return null;
    return new Tool(rows[0]);
  }

  // 根据UUID查找工具
  static async findByUuid(uuid) {
    const connection = getConnection();
    const sql = 'SELECT * FROM tools WHERE uuid = ? AND isActive = TRUE';
    const [rows] = await connection.execute(sql, [uuid]);
    
    if (rows.length === 0) return null;
    return new Tool(rows[0]);
  }

  // 获取待审核工具
  static async getPendingTools(limit = 20, offset = 0) {
    const connection = getConnection();
    const sql = `
      SELECT t.*, u.username as submittedByUsername 
      FROM tools t 
      LEFT JOIN users u ON t.submittedBy = u.id 
      WHERE t.status = 'pending' AND t.isActive = TRUE 
      ORDER BY t.createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.execute(sql, [limit, offset]);
    return rows.map(row => new Tool(row));
  }

  // 获取已审核工具
  static async getApprovedTools(limit = 20, offset = 0) {
    const connection = getConnection();
    const sql = `
      SELECT t.*, u.username as submittedByUsername 
      FROM tools t 
      LEFT JOIN users u ON t.submittedBy = u.id 
      WHERE t.status = 'approved' AND t.isActive = TRUE 
      ORDER BY t.createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.execute(sql, [limit, offset]);
    return rows.map(row => new Tool(row));
  }

  // 根据分类获取工具
  static async getToolsByCategory(categoryId, limit = 20, offset = 0) {
    const connection = getConnection();
    const sql = `
      SELECT * FROM tools 
      WHERE category = ? AND status = 'approved' AND isActive = TRUE 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.execute(sql, [categoryId, limit, offset]);
    return rows.map(row => new Tool(row));
  }

  // 搜索工具
  static async searchTools(query, limit = 20, offset = 0) {
    const connection = getConnection();
    const searchTerm = `%${query}%`;
    const sql = `
      SELECT * FROM tools 
      WHERE (name LIKE ? OR description LIKE ? OR JSON_SEARCH(tags, 'one', ?) IS NOT NULL) 
      AND status = 'approved' AND isActive = TRUE 
      ORDER BY 
        CASE 
          WHEN name LIKE ? THEN 1
          WHEN description LIKE ? THEN 2
          ELSE 3
        END,
        createdAt DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.execute(sql, [
      searchTerm, searchTerm, query, searchTerm, searchTerm, limit, offset
    ]);
    return rows.map(row => new Tool(row));
  }

  // 更新工具状态
  async updateStatus(status, approvedBy = null, rejectedReason = null) {
    const connection = getConnection();
    const updateData = { status };
    
    if (status === 'approved' && approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
    }
    
    if (status === 'rejected' && rejectedReason) {
      updateData.rejectedReason = rejectedReason;
    }
    
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
    
    values.push(this.id);
    const sql = `UPDATE tools SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`;
    
    await connection.execute(sql, values);
    
    // 更新当前对象
    Object.assign(this, updateData);
    return this;
  }

  // 更新工具信息
  async update(updateData) {
    const connection = getConnection();
    const allowedFields = [
      'name', 'description', 'category', 'tags', 'website', 'pricing',
      'features', 'screenshots', 'contactEmail', 'notes'
    ];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'tags' || key === 'features' || key === 'screenshots') {
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
    const sql = `UPDATE tools SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`;
    
    await connection.execute(sql, values);
    
    // 更新当前对象
    Object.assign(this, updateData);
    return this;
  }

  // 增加浏览次数
  async incrementViewCount() {
    const connection = getConnection();
    const sql = 'UPDATE tools SET viewCount = viewCount + 1 WHERE id = ?';
    await connection.execute(sql, [this.id]);
    this.viewCount += 1;
  }

  // 软删除工具
  async softDelete() {
    const connection = getConnection();
    const sql = 'UPDATE tools SET isActive = FALSE, updatedAt = NOW() WHERE id = ?';
    await connection.execute(sql, [this.id]);
    this.isActive = false;
    return this;
  }

  // 转换为安全对象（不包含敏感信息）
  toSafeObject() {
    return {
      id: this.id,
      uuid: this.uuid,
      name: this.name,
      description: this.description,
      category: this.category,
      tags: this.tags,
      website: this.website,
      pricing: this.pricing,
      features: this.features,
      screenshots: this.screenshots,
      contactEmail: this.contactEmail,
      notes: this.notes,
      submittedBy: this.submittedBy,
      status: this.status,
      approvedBy: this.approvedBy,
      approvedAt: this.approvedAt,
      rejectedReason: this.rejectedReason,
      viewCount: this.viewCount,
      favoriteCount: this.favoriteCount,
      ratingCount: this.ratingCount,
      averageRating: this.averageRating,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // 转换为公开对象（用于前端显示）
  toPublicObject() {
    return {
      id: this.id,
      uuid: this.uuid,
      name: this.name,
      description: this.description,
      category: this.category,
      tags: this.tags,
      website: this.website,
      pricing: this.pricing,
      features: this.features,
      screenshots: this.screenshots,
      viewCount: this.viewCount,
      favoriteCount: this.favoriteCount,
      ratingCount: this.ratingCount,
      averageRating: this.averageRating,
      createdAt: this.createdAt
    };
  }

  // 检查工具名称是否已存在
  static async isNameExists(name, excludeId = null) {
    const connection = getConnection();
    let sql = 'SELECT COUNT(*) as count FROM tools WHERE name = ? AND isActive = TRUE';
    const params = [name];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await connection.execute(sql, params);
    return rows[0].count > 0;
  }

  // 获取工具统计信息
  static async getStats() {
    const connection = getConnection();
    const sql = `
      SELECT 
        COUNT(*) as totalTools,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingTools,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedTools,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedTools,
        SUM(viewCount) as totalViews,
        SUM(favoriteCount) as totalFavorites
      FROM tools 
      WHERE isActive = TRUE
    `;
    const [rows] = await connection.execute(sql);
    return rows[0];
  }
}

module.exports = Tool;