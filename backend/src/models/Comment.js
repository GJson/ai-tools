const { getConnection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Comment {
  constructor(data) {
    this.id = data.id;
    this.uuid = data.uuid;
    this.toolId = data.toolId;
    this.userId = data.userId;
    this.parentId = data.parentId; // 用于回复功能
    this.content = data.content;
    this.rating = data.rating; // 1-5星评分
    this.isAnonymous = data.isAnonymous || false;
    this.likeCount = data.likeCount || 0;
    this.dislikeCount = data.dislikeCount || 0;
    this.reportCount = data.reportCount || 0;
    this.isApproved = data.isApproved !== false; // 默认通过审核
    this.isActive = data.isActive !== false; // 默认激活
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    
    // 关联数据
    this.username = data.username;
    this.userAvatar = data.userAvatar;
    this.replies = data.replies || [];
  }

  // 创建评论
  static async create(commentData) {
    const connection = getConnection();
    const { 
      toolId, 
      userId, 
      parentId, 
      content, 
      rating, 
      isAnonymous = false 
    } = commentData;
    
    // 生成UUID
    const uuid = uuidv4();
    
    const sql = `
      INSERT INTO comments (
        uuid, toolId, userId, parentId, content, rating, isAnonymous
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.execute(sql, [
      uuid, 
      toolId, 
      userId, 
      parentId, 
      content, 
      rating, 
      isAnonymous
    ]);
    
    return await Comment.findById(result.insertId);
  }

  // 根据ID查找评论
  static async findById(id) {
    const connection = getConnection();
    const sql = `
      SELECT c.*, u.username, u.avatar as userAvatar 
      FROM comments c 
      LEFT JOIN users u ON c.userId = u.id 
      WHERE c.id = ? AND c.isActive = TRUE
    `;
    const [rows] = await connection.execute(sql, [id]);
    
    if (rows.length === 0) return null;
    return new Comment(rows[0]);
  }

  // 根据UUID查找评论
  static async findByUuid(uuid) {
    const connection = getConnection();
    const sql = `
      SELECT c.*, u.username, u.avatar as userAvatar 
      FROM comments c 
      LEFT JOIN users u ON c.userId = u.id 
      WHERE c.uuid = ? AND c.isActive = TRUE
    `;
    const [rows] = await connection.execute(sql, [uuid]);
    
    if (rows.length === 0) return null;
    return new Comment(rows[0]);
  }

  // 获取工具的所有评论（分页）
  static async getByToolId(toolId, limit = 20, offset = 0, includeReplies = true) {
    const connection = getConnection();
    
    // 获取主评论
    const sql = `
      SELECT c.*, u.username, u.avatar as userAvatar 
      FROM comments c 
      LEFT JOIN users u ON c.userId = u.id 
      WHERE c.toolId = ? AND c.parentId IS NULL AND c.isActive = TRUE AND c.isApproved = TRUE
      ORDER BY c.createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.execute(sql, [toolId, parseInt(limit), parseInt(offset)]);
    
    const comments = rows.map(row => new Comment(row));
    
    if (includeReplies) {
      // 获取每个主评论的回复
      for (let comment of comments) {
        comment.replies = await Comment.getReplies(comment.id);
      }
    }
    
    return comments;
  }

  // 获取评论的回复
  static async getReplies(parentId) {
    const connection = getConnection();
    const sql = `
      SELECT c.*, u.username, u.avatar as userAvatar 
      FROM comments c 
      LEFT JOIN users u ON c.userId = u.id 
      WHERE c.parentId = ? AND c.isActive = TRUE AND c.isApproved = TRUE
      ORDER BY c.createdAt ASC
    `;
    const [rows] = await connection.execute(sql, [parentId]);
    
    return rows.map(row => new Comment(row));
  }

  // 获取用户的评论
  static async getByUserId(userId, limit = 20, offset = 0) {
    const connection = getConnection();
    const sql = `
      SELECT c.*, u.username, u.avatar as userAvatar, t.name as toolName
      FROM comments c 
      LEFT JOIN users u ON c.userId = u.id 
      LEFT JOIN tools t ON c.toolId = t.id
      WHERE c.userId = ? AND c.isActive = TRUE
      ORDER BY c.createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.execute(sql, [userId, parseInt(limit), parseInt(offset)]);
    
    return rows.map(row => new Comment(row));
  }

  // 获取待审核评论（管理员）
  static async getPendingComments(limit = 20, offset = 0) {
    const connection = getConnection();
    const sql = `
      SELECT c.*, u.username, u.avatar as userAvatar, t.name as toolName
      FROM comments c 
      LEFT JOIN users u ON c.userId = u.id 
      LEFT JOIN tools t ON c.toolId = t.id
      WHERE c.isApproved = FALSE AND c.isActive = TRUE
      ORDER BY c.createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.execute(sql, [parseInt(limit), parseInt(offset)]);
    
    return rows.map(row => new Comment(row));
  }

  // 搜索评论
  static async searchComments(query, limit = 20, offset = 0) {
    const connection = getConnection();
    const searchTerm = `%${query}%`;
    const sql = `
      SELECT c.*, u.username, u.avatar as userAvatar, t.name as toolName
      FROM comments c 
      LEFT JOIN users u ON c.userId = u.id 
      LEFT JOIN tools t ON c.toolId = t.id
      WHERE c.content LIKE ? AND c.isActive = TRUE AND c.isApproved = TRUE
      ORDER BY c.createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await connection.execute(sql, [searchTerm, parseInt(limit), parseInt(offset)]);
    
    return rows.map(row => new Comment(row));
  }

  // 更新评论
  async update(updateData) {
    const connection = getConnection();
    const allowedFields = ['content', 'rating', 'isAnonymous'];
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
    const sql = `UPDATE comments SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`;
    
    await connection.execute(sql, values);
    
    // 更新当前对象
    Object.assign(this, updateData);
    return this;
  }

  // 点赞/踩
  async toggleLike(userId, action) {
    const connection = getConnection();
    
    // 检查用户是否已经点赞/踩过
    const checkSql = 'SELECT * FROM comment_likes WHERE commentId = ? AND userId = ?';
    const [existing] = await connection.execute(checkSql, [this.id, userId]);
    
    if (existing.length > 0) {
      // 如果已经点赞/踩过，则取消
      const deleteSql = 'DELETE FROM comment_likes WHERE commentId = ? AND userId = ?';
      await connection.execute(deleteSql, [this.id, userId]);
      
      // 更新计数
      if (action === 'like') {
        this.likeCount = Math.max(0, this.likeCount - 1);
      } else {
        this.dislikeCount = Math.max(0, this.dislikeCount - 1);
      }
    } else {
      // 新增点赞/踩
      const insertSql = 'INSERT INTO comment_likes (commentId, userId, action) VALUES (?, ?, ?)';
      await connection.execute(insertSql, [this.id, userId, action]);
      
      // 更新计数
      if (action === 'like') {
        this.likeCount += 1;
      } else {
        this.dislikeCount += 1;
      }
    }
    
    // 更新数据库中的计数
    const updateSql = 'UPDATE comments SET likeCount = ?, dislikeCount = ? WHERE id = ?';
    await connection.execute(updateSql, [this.likeCount, this.dislikeCount, this.id]);
    
    return this;
  }

  // 举报评论
  async report(userId, reason) {
    const connection = getConnection();
    
    // 检查用户是否已经举报过
    const checkSql = 'SELECT * FROM comment_reports WHERE commentId = ? AND userId = ?';
    const [existing] = await connection.execute(checkSql, [this.id, userId]);
    
    if (existing.length === 0) {
      // 新增举报
      const insertSql = 'INSERT INTO comment_reports (commentId, userId, reason) VALUES (?, ?, ?)';
      await connection.execute(insertSql, [this.id, userId, reason]);
      
      // 更新举报计数
      this.reportCount += 1;
      const updateSql = 'UPDATE comments SET reportCount = reportCount + 1 WHERE id = ?';
      await connection.execute(updateSql, [this.id]);
    }
    
    return this;
  }

  // 审核评论（管理员）
  async moderate(approved, reason = null) {
    const connection = getConnection();
    const sql = 'UPDATE comments SET isApproved = ?, updatedAt = NOW() WHERE id = ?';
    await connection.execute(sql, [approved, this.id]);
    
    this.isApproved = approved;
    return this;
  }

  // 软删除评论
  async softDelete() {
    const connection = getConnection();
    const sql = 'UPDATE comments SET isActive = FALSE, updatedAt = NOW() WHERE id = ?';
    await connection.execute(sql, [this.id]);
    this.isActive = false;
    return this;
  }

  // 转换为安全对象（不包含敏感信息）
  toSafeObject() {
    return {
      id: this.id,
      uuid: this.uuid,
      toolId: this.toolId,
      userId: this.userId,
      parentId: this.parentId,
      content: this.content,
      rating: this.rating,
      isAnonymous: this.isAnonymous,
      likeCount: this.likeCount,
      dislikeCount: this.dislikeCount,
      reportCount: this.reportCount,
      isApproved: this.isApproved,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      username: this.isAnonymous ? '匿名用户' : this.username,
      userAvatar: this.isAnonymous ? null : this.userAvatar,
      replies: this.replies || []
    };
  }

  // 转换为公开对象（用于前端显示）
  toPublicObject() {
    return {
      id: this.id,
      uuid: this.uuid,
      toolId: this.toolId,
      content: this.content,
      rating: this.rating,
      isAnonymous: this.isAnonymous,
      likeCount: this.likeCount,
      dislikeCount: this.dislikeCount,
      createdAt: this.createdAt,
      username: this.isAnonymous ? '匿名用户' : this.username,
      userAvatar: this.isAnonymous ? null : this.userAvatar,
      replies: this.replies ? this.replies.map(reply => reply.toPublicObject()) : []
    };
  }

  // 检查用户是否已评论过该工具
  static async hasUserCommented(toolId, userId) {
    const connection = getConnection();
    const sql = 'SELECT COUNT(*) as count FROM comments WHERE toolId = ? AND userId = ? AND isActive = TRUE';
    const [rows] = await connection.execute(sql, [toolId, userId]);
    return rows[0].count > 0;
  }

  // 获取工具的平均评分
  static async getAverageRating(toolId) {
    const connection = getConnection();
    const sql = `
      SELECT 
        AVG(rating) as averageRating,
        COUNT(*) as totalRatings
      FROM comments 
      WHERE toolId = ? AND rating IS NOT NULL AND isActive = TRUE AND isApproved = TRUE
    `;
    const [rows] = await connection.execute(sql, [toolId]);
    
    return {
      averageRating: rows[0].averageRating ? parseFloat(rows[0].averageRating.toFixed(2)) : 0,
      totalRatings: rows[0].totalRatings || 0
    };
  }

  // 获取评论统计信息
  static async getStats() {
    const connection = getConnection();
    const sql = `
      SELECT 
        COUNT(*) as totalComments,
        SUM(CASE WHEN isApproved = FALSE THEN 1 ELSE 0 END) as pendingComments,
        SUM(CASE WHEN isApproved = TRUE THEN 1 ELSE 0 END) as approvedComments,
        SUM(likeCount) as totalLikes,
        SUM(reportCount) as totalReports
      FROM comments 
      WHERE isActive = TRUE
    `;
    const [rows] = await connection.execute(sql);
    return rows[0];
  }
}

module.exports = Comment;