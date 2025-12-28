const { sequelize } = require('../src/config/database');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const TeamTeacher = require('../src/models/TeamTeacher');
const Teacher = require('../src/models/teacher');

// Import associations
require('../src/models/associations');

async function createTestData() {
  try {
    console.log('🔄 Creating test data...');
    
    // 1. Tạo admin
    const adminPassword = await bcrypt.hash('123456', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hsg.edu.vn',
      password: adminPassword,
      role: 'admin'
    });
    console.log('✅ Created admin user');

    // 2. Tạo giáo viên Toán
    const teacherPassword = await bcrypt.hash('123456', 10);
    
    // Giáo viên main (trưởng nhóm)
    const mainTeacher = await User.create({
      name: 'Nguyễn Văn Toán',
      email: 'gv.toan1@hsg.edu.vn',
      password: teacherPassword,
      role: 'teacher',
      subject: 'Toán'
    });

    // Giáo viên co-teacher (đồng giảng dạy)
    const coTeacher = await User.create({
      name: 'Lê Thị Hương',
      email: 'gv.toan2@hsg.edu.vn',
      password: teacherPassword,
      role: 'teacher',
      subject: 'Toán'
    });

    console.log('✅ Created teacher users');

    // 3. Tạo teacher records
    await Teacher.create({
      fullName: 'Nguyễn Văn Toán',
      email: 'gv.toan1@hsg.edu.vn',
      subject: 'Toán',
      department: 'Tổ Toán',
      specialization: 'Đại số, Hình học',
      phoneNumber: '0901234567',
      userId: mainTeacher.id
    });

    await Teacher.create({
      fullName: 'Lê Thị Hương',
      email: 'gv.toan2@hsg.edu.vn',
      subject: 'Toán',
      department: 'Tổ Toán',
      specialization: 'Hình học không gian',
      phoneNumber: '0901234568',
      userId: coTeacher.id
    });

    console.log('✅ Created teacher records');

    // 4. Tạo team Toán
    const mathTeam = await Team.create({
      name: 'Đội tuyển Toán',
      subject: 'Toán',
      grade: 'Tất cả',
      description: 'Đội tuyển học sinh giỏi môn Toán'
    });

    console.log('✅ Created math team');

    // 5. Gán giáo viên vào team với roles
    await TeamTeacher.create({
      teamId: mathTeam.id,
      teacherId: mainTeacher.id,
      role: 'main', // Trưởng nhóm
      notes: 'Giáo viên chính phụ trách đội tuyển Toán'
    });

    await TeamTeacher.create({
      teamId: mathTeam.id,
      teacherId: coTeacher.id,
      role: 'co-teacher', // Đồng giảng dạy
      notes: 'Giáo viên hỗ trợ đội tuyển Toán'
    });

    console.log('✅ Assigned teachers to team');

    console.log('\n🎉 Test data created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Admin: admin@hsg.edu.vn / 123456');
    console.log('Main Teacher: gv.toan1@hsg.edu.vn / 123456 (can manage schedules)');
    console.log('Co-Teacher: gv.toan2@hsg.edu.vn / 123456 (can only view schedules)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();