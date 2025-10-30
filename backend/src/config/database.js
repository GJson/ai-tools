const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_tools',
  charset: 'utf8mb4',
  timezone: '+08:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

let connection;

// 创建数据库连接
const createConnection = async () => {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    return connection;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    throw error;
  }
};

// 连接数据库
const connectDB = async () => {
  try {
    // 首先尝试连接MySQL服务器（不指定数据库）
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      charset: 'utf8mb4'
    });

    // 创建数据库（如果不存在）
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tempConnection.end();

    // 连接到指定数据库
    connection = await createConnection();
    
    // 创建用户表
    await createUsersTable();
    
    // 创建工具表
    await createToolsTable();
    
    // 创建评论表
    await createCommentsTable();
    
    // 创建评论点赞表
    await createCommentLikesTable();
    
    // 创建评论举报表
    await createCommentReportsTable();
    
    // 创建搜索日志表
    await createSearchLogsTable();
    
    // 创建评分表
    await createRatingsTable();
    
    // 创建收藏夹表（必须先创建，因为favorites表引用它）
    await createFavoriteFoldersTable();
    
    // 创建收藏表
    await createFavoritesTable();    
    // 创建用户历史表
    await createUserHistoryTable();
    
    return connection;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    throw error;
  }
};

// 创建用户表
const createUsersTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      uuid VARCHAR(36) UNIQUE NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      avatar VARCHAR(500) DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      website VARCHAR(500) DEFAULT NULL,
      location VARCHAR(100) DEFAULT NULL,
      isPublic BOOLEAN DEFAULT TRUE,
      showEmail BOOLEAN DEFAULT FALSE,
      showStats BOOLEAN DEFAULT TRUE,
      is_active BOOLEAN DEFAULT TRUE,
      email_verified BOOLEAN DEFAULT FALSE,
      last_login_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NULL,
      INDEX idx_email (email),
      INDEX idx_username (username),
      INDEX idx_uuid (uuid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('✅ 用户表创建/检查完成');
    
    // 检查并添加新字段（如果表已存在）
    await addNewFieldsIfNotExists();
  } catch (error) {
    console.error('❌ 创建用户表失败:', error.message);
    throw error;
  }
};

// 创建工具表
const createToolsTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS tools (
      id INT PRIMARY KEY AUTO_INCREMENT,
      uuid VARCHAR(36) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      tags TEXT DEFAULT NULL,
      website VARCHAR(500) NOT NULL,
      pricing ENUM('free', 'freemium', 'paid', 'trial') NOT NULL,
      features TEXT DEFAULT NULL,
      screenshots TEXT DEFAULT NULL,
      contactEmail VARCHAR(100) DEFAULT NULL,
      notes TEXT DEFAULT NULL,
      submittedBy INT NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      approvedBy INT DEFAULT NULL,
      approvedAt DATETIME DEFAULT NULL,
      rejectedReason TEXT DEFAULT NULL,
      viewCount INT DEFAULT 0,
      favoriteCount INT DEFAULT 0,
      ratingCount INT DEFAULT 0,
      averageRating DECIMAL(3,2) DEFAULT 0.00,
      isActive BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT NULL,
      INDEX idx_category (category),
      INDEX idx_status (status),
      INDEX idx_submittedBy (submittedBy),
      INDEX idx_name (name),
      INDEX idx_createdAt (createdAt),
      FOREIGN KEY (submittedBy) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('✅ 工具表创建/检查完成');
  } catch (error) {
    console.error('❌ 创建工具表失败:', error.message);
    throw error;
  }
};

// 创建评论表
const createCommentsTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS comments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      uuid VARCHAR(36) UNIQUE NOT NULL,
      toolId INT NOT NULL,
      userId INT NOT NULL,
      parentId INT DEFAULT NULL,
      content TEXT NOT NULL,
      rating TINYINT DEFAULT NULL,
      isAnonymous BOOLEAN DEFAULT FALSE,
      likeCount INT DEFAULT 0,
      dislikeCount INT DEFAULT 0,
      reportCount INT DEFAULT 0,
      isApproved BOOLEAN DEFAULT TRUE,
      isActive BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT NULL,
      INDEX idx_toolId (toolId),
      INDEX idx_userId (userId),
      INDEX idx_parentId (parentId),
      INDEX idx_createdAt (createdAt),
      INDEX idx_rating (rating),
      FOREIGN KEY (toolId) REFERENCES tools(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('✅ 评论表创建/检查完成');
  } catch (error) {
    console.error('❌ 创建评论表失败:', error.message);
    throw error;
  }
};

// 创建评论点赞表
const createCommentLikesTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS comment_likes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      commentId INT NOT NULL,
      userId INT NOT NULL,
      action ENUM('like', 'dislike') NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_like (commentId, userId),
      INDEX idx_commentId (commentId),
      INDEX idx_userId (userId),
      FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('✅ 评论点赞表创建/检查完成');
  } catch (error) {
    console.error('❌ 创建评论点赞表失败:', error.message);
    throw error;
  }
};

// 创建评论举报表
const createCommentReportsTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS comment_reports (
      id INT PRIMARY KEY AUTO_INCREMENT,
      commentId INT NOT NULL,
      userId INT NOT NULL,
      reason TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_report (commentId, userId),
      INDEX idx_commentId (commentId),
      INDEX idx_userId (userId),
      FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('✅ 评论举报表创建/检查完成');
  } catch (error) {
    console.error('❌ 创建评论举报表失败:', error.message);
    throw error;
  }
};

// 创建搜索日志表
const createSearchLogsTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS search_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      query VARCHAR(255) NOT NULL,
      results_count INT DEFAULT 0,
      filters TEXT DEFAULT NULL,
      user_id INT DEFAULT NULL,
      ip_address VARCHAR(45) DEFAULT NULL,
      user_agent TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_query (query),
      INDEX idx_created_at (created_at),
      INDEX idx_user_id (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('✅ 搜索日志表创建/检查完成');
  } catch (error) {
    console.error('❌ 创建搜索日志表失败:', error.message);
    throw error;
  }
};

// 创建评分表
const createRatingsTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ratings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      toolId INT NOT NULL,
      userId INT NOT NULL,
      rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT DEFAULT NULL,
      isActive BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT NULL,
      UNIQUE KEY unique_user_tool_rating (userId, toolId),
      INDEX idx_toolId (toolId),
      INDEX idx_userId (userId),
      INDEX idx_rating (rating),
      INDEX idx_createdAt (createdAt),
      FOREIGN KEY (toolId) REFERENCES tools(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('✅ 评分表创建/检查完成');
  } catch (error) {
    console.error('❌ 创建评分表失败:', error.message);
    throw error;
  }
};

// 创建收藏表
const createFavoritesTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS favorites (
      id INT PRIMARY KEY AUTO_INCREMENT,
      toolId INT NOT NULL,
      userId INT NOT NULL,
      folderId INT DEFAULT NULL,
      notes TEXT DEFAULT NULL,
      isActive BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT NULL,
      UNIQUE KEY unique_user_tool_favorite (userId, toolId),
      INDEX idx_toolId (toolId),
      INDEX idx_userId (userId),
      INDEX idx_folderId (folderId),
      INDEX idx_createdAt (createdAt),
      FOREIGN KEY (toolId) REFERENCES tools(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (folderId) REFERENCES favorite_folders(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('✅ 收藏表创建/检查完成');
  } catch (error) {
    console.error('❌ 创建收藏表失败:', error.message);
    throw error;
  }
};

// 创建收藏夹表
const createFavoriteFoldersTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS favorite_folders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL,
      description VARCHAR(200) DEFAULT NULL,
      color VARCHAR(7) DEFAULT '#6366f1',
      userId INT NOT NULL,
      isActive BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT NULL,
      UNIQUE KEY unique_user_folder_name (userId, name),
      INDEX idx_userId (userId),
      INDEX idx_createdAt (createdAt),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('✅ 收藏夹表创建/检查完成');
  } catch (error) {
    console.error('❌ 创建收藏夹表失败:', error.message);
    throw error;
  }
};

// 创建用户历史表
const createUserHistoryTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS user_history (
      id INT PRIMARY KEY AUTO_INCREMENT,
      userId INT NOT NULL,
      action ENUM('view', 'search', 'favorite', 'unfavorite', 'rating', 'comment', 'download') NOT NULL,
      targetType ENUM('tool', 'page', 'search') NOT NULL,
      targetId INT DEFAULT NULL,
      targetName VARCHAR(200) DEFAULT NULL,
      metadata TEXT DEFAULT NULL,
      ipAddress VARCHAR(45) DEFAULT NULL,
      userAgent TEXT DEFAULT NULL,
      isActive BOOLEAN DEFAULT TRUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_userId (userId),
      INDEX idx_action (action),
      INDEX idx_targetType (targetType),
      INDEX idx_targetId (targetId),
      INDEX idx_createdAt (createdAt),
      INDEX idx_user_action (userId, action),
      INDEX idx_user_target (userId, targetType, targetId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('✅ 用户历史表创建/检查完成');
  } catch (error) {
    console.error('❌ 创建用户历史表失败:', error.message);
    throw error;
  }
};

// 添加新字段（如果不存在）
const addNewFieldsIfNotExists = async () => {
  const fieldsToAdd = [
    { name: 'bio', type: 'TEXT DEFAULT NULL' },
    { name: 'website', type: 'VARCHAR(500) DEFAULT NULL' },
    { name: 'location', type: 'VARCHAR(100) DEFAULT NULL' },
    { name: 'isPublic', type: 'BOOLEAN DEFAULT TRUE' },
    { name: 'showEmail', type: 'BOOLEAN DEFAULT FALSE' },
    { name: 'showStats', type: 'BOOLEAN DEFAULT TRUE' }
  ];

  for (const field of fieldsToAdd) {
    try {
      const checkColumnSQL = `
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = ?
      `;
      
      const [rows] = await connection.execute(checkColumnSQL, [dbConfig.database, field.name]);
      
      if (rows[0].count === 0) {
        const addColumnSQL = `ALTER TABLE users ADD COLUMN ${field.name} ${field.type}`;
        await connection.execute(addColumnSQL);
        console.log(`✅ 添加字段 ${field.name} 成功`);
      }
    } catch (error) {
      console.error(`❌ 添加字段 ${field.name} 失败:`, error.message);
    }
  }
};

// 获取数据库连接
const getConnection = () => {
  if (!connection) {
    throw new Error('数据库未连接');
  }
  return connection;
};

// 关闭数据库连接
const closeConnection = async () => {
  if (connection) {
    await connection.end();
    connection = null;
    console.log('✅ 数据库连接已关闭');
  }
};

module.exports = {
  connectDB,
  getConnection,
  closeConnection,
  createConnection
};
