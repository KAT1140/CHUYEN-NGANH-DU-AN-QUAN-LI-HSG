// File: scripts/resetDB.js
require('dotenv').config();
const { sequelize, connectDB } = require('../src/config/database');

// Load Models
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Member = require('../src/models/Member');
const Schedule = require('../src/models/Schedule');
const Score = require('../src/models/Score');
const Evaluation = require('../src/models/Evaluation'); // Load thêm Evaluation

async function resetDB() {
  try {
    await connectDB();
    console.log('🔄 Đang reset database...');
    
    // force: true sẽ DROP TABLE cũ và tạo lại mới tinh
    await sequelize.sync({ force: true });
    
    console.log('✅ Database đã được làm mới hoàn toàn!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi reset DB:', err);
    process.exit(1);
  }
}

resetDB();