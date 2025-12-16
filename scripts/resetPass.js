// File: scripts/resetPass.js
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

async function run() {
  await sequelize.authenticate();
  
  // Tạo hash chuẩn cho "123456"
  const hash = await bcrypt.hash('123456', 10);
  
  // Cập nhật vào DB
  await User.update({ password: hash }, { where: {} });
  
  console.log('✅ Đã đổi pass tất cả user thành 123456');
  process.exit();
}

run();