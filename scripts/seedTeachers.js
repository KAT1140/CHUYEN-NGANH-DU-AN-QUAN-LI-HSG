// File: scripts/seedTeachers.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, connectDB } = require('../src/config/database');
const User = require('../src/models/User');

const teachers = [
  { name: 'Nguyễn Văn Toán', email: 'gv.toan@hsg.edu.vn', subject: 'Toán' },
  { name: 'Trần Thị Lý', email: 'gv.ly@hsg.edu.vn', subject: 'Lý' },
  { name: 'Lê Văn Hóa', email: 'gv.hoa@hsg.edu.vn', subject: 'Hóa' },
  { name: 'Phạm Thị Sinh', email: 'gv.sinh@hsg.edu.vn', subject: 'Sinh' },
  { name: 'Hoàng Văn Tin', email: 'gv.tin@hsg.edu.vn', subject: 'Tin' },
  { name: 'Vũ Thị Văn', email: 'gv.van@hsg.edu.vn', subject: 'Văn' },
  { name: 'Đặng Văn Sử', email: 'gv.su@hsg.edu.vn', subject: 'Sử' },
  { name: 'Bùi Thị Địa', email: 'gv.dia@hsg.edu.vn', subject: 'Địa' },
  { name: 'Ngô Văn Anh', email: 'gv.anh@hsg.edu.vn', subject: 'Anh' },
];

const defaultPassword = '123'; // Mật khẩu mặc định cho tất cả giáo viên

async function seedTeachers() {
  try {
    await connectDB();
    console.log('🔄 Đang kết nối CSDL...');

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    console.log('🚀 Đang khởi tạo tài khoản giáo viên...');

    for (const teacher of teachers) {
      // Dùng findOrCreate để không bị lỗi nếu chạy lại script nhiều lần
      const [user, created] = await User.findOrCreate({
        where: { email: teacher.email },
        defaults: {
          name: teacher.name,
          password: hashedPassword,
          role: 'teacher',
          subject: teacher.subject
        }
      });

      if (created) {
        console.log(`✅ Đã tạo: ${teacher.name} (${teacher.subject})`);
      } else {
        console.log(`⚠️ Đã tồn tại: ${teacher.name}`);
      }
    }

    console.log('🎉 Hoàn tất! Bạn có thể đăng nhập với mật khẩu: ' + defaultPassword);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi tạo giáo viên:', err);
    process.exit(1);
  }
}

seedTeachers();