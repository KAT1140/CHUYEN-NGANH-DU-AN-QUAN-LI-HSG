const { sequelize } = require('../src/config/database');

// Import tất cả models để tạo bảng
require('../src/models/User');
require('../src/models/teacher');
require('../src/models/student');
require('../src/models/Team');
require('../src/models/TeamTeacher');
require('../src/models/Schedule');
require('../src/models/Score');
require('../src/models/Evaluation');

// Import associations
require('../src/models/associations');

async function recreateDatabase() {
  try {
    console.log('🔄 Đang tạo lại database...');
    
    // Force sync để tạo lại tất cả bảng
    await sequelize.sync({ force: true });
    
    console.log('✅ Tạo lại database thành công!');
    console.log('📋 Các bảng đã được tạo:');
    
    // Liệt kê các bảng
    const tables = await sequelize.getQueryInterface().showAllTables();
    tables.forEach(table => console.log(`  - ${table}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo database:', error);
    process.exit(1);
  }
}

recreateDatabase();