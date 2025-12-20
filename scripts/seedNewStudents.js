const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const Student = require('../src/models/Student');

async function seedNewStudents() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // 5 học sinh mới chưa có team
    const newStudents = [
      {
        name: 'Nguyễn Văn An',
        studentId: 'HS134',
        grade: '10',
        contact: '0901234567',
        email: 'hs134@hsg.edu.vn',
        year: 2025
      },
      {
        name: 'Trần Thị Bình',
        studentId: 'HS135',
        grade: '10',
        contact: '0901234568',
        email: 'hs135@hsg.edu.vn',
        year: 2025
      },
      {
        name: 'Lê Hoàng Cường',
        studentId: 'HS136',
        grade: '11',
        contact: '0901234569',
        email: 'hs136@hsg.edu.vn',
        year: 2024
      },
      {
        name: 'Phạm Minh Đức',
        studentId: 'HS137',
        grade: '11',
        contact: '0901234570',
        email: 'hs137@hsg.edu.vn',
        year: 2024
      },
      {
        name: 'Hoàng Thu Hà',
        studentId: 'HS138',
        grade: '12',
        contact: '0901234571',
        email: 'hs138@hsg.edu.vn',
        year: 2023
      }
    ];

    const hashedPassword = await bcrypt.hash('123456', 10);

    for (const studentData of newStudents) {
      // Tạo User account
      const user = await User.create({
        name: studentData.name,
        email: studentData.email,
        password: hashedPassword,
        role: 'user'
      });

      // Tạo Student record (chưa có teamId)
      await Student.create({
        name: studentData.name,
        studentId: studentData.studentId,
        grade: studentData.grade,
        contact: studentData.contact,
        year: studentData.year,
        teamId: null, // Chưa gán team
        userId: user.id
      });

      console.log(`✓ Created student: ${studentData.name} (${studentData.studentId})`);
    }

    console.log('\n✅ Successfully created 5 new students without team assignment!');
    console.log('📧 All passwords: 123456');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

seedNewStudents();
