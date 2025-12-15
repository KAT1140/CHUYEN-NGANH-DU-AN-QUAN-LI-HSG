// Script: Seed admin user hoặc teacher user
// Chạy: node scripts/seedAdmin.js <email> [admin|teacher]
// VD: node scripts/seedAdmin.js admin@example.com admin
// VD: node scripts/seedAdmin.js teacher@example.com teacher

const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const email = process.argv[2] || 'admin@example.com';
    const role = process.argv[3] || 'admin'; // Mặc định role là admin
    
    if (!['admin', 'teacher', 'user'].includes(role)) {
      console.error('❌ Role không hợp lệ. Phải là: admin, teacher, hoặc user');
      process.exit(1);
    }

    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Nếu chưa tồn tại, tạo user mới với role được chỉ định
      const hashed = await bcrypt.hash('password123', 10);
      user = await User.create({
        name: role === 'admin' ? 'Admin User' : role === 'teacher' ? 'Giáo viên' : 'Học sinh',
        email,
        password: hashed,
        role
      });
      console.log(`✅ Tạo user mới: ${email} (role: ${role})`);
    } else {
      // Nếu đã tồn tại, update role
      await user.update({ role });
      console.log(`✅ Update user ${email} sang role: ${role}`);
    }

    console.log(`\nThông tin tài khoản:`);
    console.log(`- Email: ${email}`);
    console.log(`- Role: ${role}`);
    console.log(`- Mật khẩu mặc định: password123`);
    console.log('\nSetup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();
