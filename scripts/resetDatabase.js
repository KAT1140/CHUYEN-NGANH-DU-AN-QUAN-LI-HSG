const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'hsg-management-db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

async function resetDatabase() {
  let connection;
  try {
    console.log('🔄 Connecting to MySQL...');
    
    // Kết nối không chỉ định database
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS
    });

    console.log('✅ Connected to MySQL');
    
    // Xóa database cũ nếu tồn tại
    console.log(`🗑️ Dropping database ${DB_NAME} if exists...`);
    await connection.execute(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
    
    // Tạo database mới
    console.log(`🆕 Creating database ${DB_NAME}...`);
    await connection.execute(`CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log('✅ Database reset successfully!');
    console.log('🚀 Now you can start the server to create tables');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDatabase();