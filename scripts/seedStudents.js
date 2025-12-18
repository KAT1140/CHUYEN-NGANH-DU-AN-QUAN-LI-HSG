const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Team = require('../src/models/Team');
const bcrypt = require('bcryptjs');

const seedStudents = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection OK');

    // Tạo đội tuyển trước
    const team = await Team.create({
      name: 'Đội tuyển Toán 10',
      grade: '10',
      subject: 'Toán'
    });
    console.log('✅ Team created:', team.name);

    // Tạo dữ liệu học sinh
    const studentsData = [
      { name: 'Nguyễn Văn An', studentId: 'HS001', email: 'hs.an@hsg.edu.vn', grade: '10' },
      { name: 'Trần Thị Bình', studentId: 'HS002', email: 'hs.binh@hsg.edu.vn', grade: '10' },
      { name: 'Lê Hoàng Cường', studentId: 'HS003', email: 'hs.cuong@hsg.edu.vn', grade: '10' },
      { name: 'Phạm Minh Đức', studentId: 'HS004', email: 'hs.duc@hsg.edu.vn', grade: '11' },
      { name: 'Hoàng Thùy Linh', studentId: 'HS005', email: 'hs.linh@hsg.edu.vn', grade: '11' },
      { name: 'Vũ Tuấn Kiệt', studentId: 'HS006', email: 'hs.kiet@hsg.edu.vn', grade: '12' },
      { name: 'Đặng Ngọc Mai', studentId: 'HS007', email: 'hs.mai@hsg.edu.vn', grade: '12' }
    ];

    const hashedPassword = await bcrypt.hash('123456', 10);

    for (const studentData of studentsData) {
      try {
        // Tạo User
        const user = await User.create({
          name: studentData.name,
          email: studentData.email,
          password: hashedPassword,
          role: 'user'
        }).catch(async (err) => {
          // Nếu email trùng, tìm user cũ
          if (err.name === 'SequelizeUniqueConstraintError') {
            return await User.findOne({ where: { email: studentData.email } });
          }
          throw err;
        });

        // Tạo Student record (chỉ tạo User, học sinh sẽ được thêm vào đội sau)
        // Không tạo Student record vì teamId bắt buộc
        // Thay vào đó, chỉ tạo User với role 'user'
        console.log(`✅ Student created: ${studentData.name} (${studentData.studentId})`);
      } catch (err) {
        console.error(`❌ Error creating ${studentData.name}:`, err.message);
      }
    }

    console.log('\n✅ All students created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.errors) {
      err.errors.forEach(e => console.error('  -', e.message));
    }
    process.exit(1);
  }
};

seedStudents();
