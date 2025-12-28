const { sequelize } = require('./src/config/database');
const Schedule = require('./src/models/Schedule');

async function clearAllSchedules() {
  try {
    console.log('🗑️ XÓA TẤT CẢ LỊCH...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const deletedCount = await Schedule.destroy({ where: {} });
    console.log(`✅ Đã xóa ${deletedCount} lịch`);
    
    const remainingCount = await Schedule.count();
    console.log(`📊 Còn lại: ${remainingCount} lịch`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearAllSchedules();