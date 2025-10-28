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
      is_active BOOLEAN DEFAULT TRUE,
      email_verified BOOLEAN DEFAULT FALSE,
      last_login_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NULL, INDEX idx_email (email),
      INDEX idx_username (username),
      INDEX idx_uuid (uuid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('✅ 用户表创建/检查完成');
  } catch (error) {
    console.error('❌ 创建用户表失败:', error.message);
    throw error;
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
