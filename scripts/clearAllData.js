const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'hsg-db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

async function clearAllData() {
  let connection;
  try {
    console.log('🔄 Connecting to MySQL...');
    
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME
    });

    console.log('✅ Connected to database');
    
    // Tắt foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Lấy danh sách tất cả bảng
    const [tables] = await connection.execute('SHOW TABLES');
    
    console.log(`🗑️ Clearing data from ${tables.length} tables...`);
    
    // Xóa dữ liệu từ tất cả bảng
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`  - Clearing ${tableName}...`);
      await connection.execute(`TRUNCATE TABLE \`${tableName}\``);
    }
    
    // Bật lại foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ All data cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

clearAllData();