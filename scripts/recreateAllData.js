const { sequelize } = require('../src/config/database');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const TeamTeacher = require('../src/models/TeamTeacher');
const Teacher = require('../src/models/teacher');
const Student = require('../src/models/student');
const Score = require('../src/models/Score');

// Import associations
require('../src/models/associations');

async function recreateAllData() {
  try {
    console.log('🚀 BẮT ĐẦU TẠO LẠI TẤT CẢ DỮ LIỆU HSG MANAGEMENT');
    
    const saltRounds = 10;
    const defaultPassword = await bcrypt.hash('123456', saltRounds);
    
    // 1. Tạo admin
    console.log('👤 Tạo admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'namvokat@gmail.com',
      password: defaultPassword,
      role: 'admin'
    });

    // 2. Tạo tất cả giáo viên users
    console.log('👨‍🏫 Tạo giáo viên users...');
    const teacherUsers = [];
    const teacherData = [
      // Toán
      { name: 'Nguyễn Văn Toán', email: 'gv.toan1@hsg.edu.vn', subject: 'Toán', dept: 'Tổ Toán', spec: 'Đại số, Hình học, Giải tích' },
      { name: 'Nguyễn Văn Minh', email: 'gv.toan2@hsg.edu.vn', subject: 'Toán', dept: 'Tổ Toán', spec: 'Toán ứng dụng, Thống kê' },
      { name: 'Lê Thị Hương', email: 'gv.toan3@hsg.edu.vn', subject: 'Toán', dept: 'Tổ Toán', spec: 'Hình học không gian, Lượng giác' },
      // Lý
      { name: 'Trần Văn Lý', email: 'gv.ly1@hsg.edu.vn', subject: 'Lý', dept: 'Tổ Khoa học Tự nhiên', spec: 'Cơ học, Điện học' },
      { name: 'Phạm Thị Lan', email: 'gv.ly2@hsg.edu.vn', subject: 'Lý', dept: 'Tổ Khoa học Tự nhiên', spec: 'Quang học, Nhiệt học' },
      { name: 'Hoàng Văn Nam', email: 'gv.ly3@hsg.edu.vn', subject: 'Lý', dept: 'Tổ Khoa học Tự nhiên', spec: 'Vật lý hạt nhân, Dao động sóng' },
      // Hóa
      { name: 'Lê Văn Hóa', email: 'gv.hoa1@hsg.edu.vn', subject: 'Hóa', dept: 'Tổ Khoa học Tự nhiên', spec: 'Hóa vô cơ, Hóa hữu cơ' },
      { name: 'Đỗ Thị Mai', email: 'gv.hoa2@hsg.edu.vn', subject: 'Hóa', dept: 'Tổ Khoa học Tự nhiên', spec: 'Hóa phân tích, Hóa sinh' },
      { name: 'Vũ Văn Đức', email: 'gv.hoa3@hsg.edu.vn', subject: 'Hóa', dept: 'Tổ Khoa học Tự nhiên', spec: 'Hóa lý, Điện hóa' },
      // Sinh
      { name: 'Phạm Thị Sinh', email: 'gv.sinh1@hsg.edu.vn', subject: 'Sinh', dept: 'Tổ Khoa học Tự nhiên', spec: 'Sinh học phân tử, Di truyền học' },
      { name: 'Nguyễn Văn Bình', email: 'gv.sinh2@hsg.edu.vn', subject: 'Sinh', dept: 'Tổ Khoa học Tự nhiên', spec: 'Sinh thái học, Tiến hóa' },
      { name: 'Trần Thị Hoa', email: 'gv.sinh3@hsg.edu.vn', subject: 'Sinh', dept: 'Tổ Khoa học Tự nhiên', spec: 'Sinh lý học, Vi sinh vật' },
      // Văn
      { name: 'Hoàng Văn Văn', email: 'gv.van1@hsg.edu.vn', subject: 'Văn', dept: 'Tổ Khoa học Xã hội', spec: 'Văn học cổ điển, Ngữ pháp' },
      { name: 'Lê Thị Thảo', email: 'gv.van2@hsg.edu.vn', subject: 'Văn', dept: 'Tổ Khoa học Xã hội', spec: 'Văn học hiện đại, Tu từ học' },
      { name: 'Đỗ Văn Tùng', email: 'gv.van3@hsg.edu.vn', subject: 'Văn', dept: 'Tổ Khoa học Xã hội', spec: 'Thơ ca, Tiểu thuyết' },
      // Anh
      { name: 'Đỗ Thị Anh', email: 'gv.anh1@hsg.edu.vn', subject: 'Anh', dept: 'Tổ Ngoại ngữ', spec: 'Grammar, Speaking' },
      { name: 'Nguyễn Văn Long', email: 'gv.anh2@hsg.edu.vn', subject: 'Anh', dept: 'Tổ Ngoại ngữ', spec: 'Writing, Reading' },
      { name: 'Trần Thị Linh', email: 'gv.anh3@hsg.edu.vn', subject: 'Anh', dept: 'Tổ Ngoại ngữ', spec: 'Listening, Pronunciation' },
      // Sử
      { name: 'Vũ Văn Sử', email: 'gv.su1@hsg.edu.vn', subject: 'Sử', dept: 'Tổ Khoa học Xã hội', spec: 'Lịch sử Việt Nam' },
      { name: 'Phạm Thị Nga', email: 'gv.su2@hsg.edu.vn', subject: 'Sử', dept: 'Tổ Khoa học Xã hội', spec: 'Lịch sử thế giới' },
      { name: 'Lê Văn Quang', email: 'gv.su3@hsg.edu.vn', subject: 'Sử', dept: 'Tổ Khoa học Xã hội', spec: 'Lịch sử cận hiện đại' },
      // Địa
      { name: 'Bùi Thị Địa', email: 'gv.dia1@hsg.edu.vn', subject: 'Địa', dept: 'Tổ Khoa học Xã hội', spec: 'Địa lý tự nhiên' },
      { name: 'Hoàng Văn Hải', email: 'gv.dia2@hsg.edu.vn', subject: 'Địa', dept: 'Tổ Khoa học Xã hội', spec: 'Địa lý kinh tế' },
      { name: 'Nguyễn Thị Thu', email: 'gv.dia3@hsg.edu.vn', subject: 'Địa', dept: 'Tổ Khoa học Xã hội', spec: 'Địa lý dân cư' },
      // Tin
      { name: 'Ngô Văn Tin', email: 'gv.tin1@hsg.edu.vn', subject: 'Tin', dept: 'Tổ Tin học', spec: 'Lập trình, Cơ sở dữ liệu' },
      { name: 'Đỗ Thị Lan', email: 'gv.tin2@hsg.edu.vn', subject: 'Tin', dept: 'Tổ Tin học', spec: 'Mạng máy tính, Bảo mật' },
      { name: 'Trần Văn Dũng', email: 'gv.tin3@hsg.edu.vn', subject: 'Tin', dept: 'Tổ Tin học', spec: 'AI, Machine Learning' }
    ];

    for (const teacher of teacherData) {
      const user = await User.create({
        name: teacher.name,
        email: teacher.email,
        password: defaultPassword,
        role: 'teacher',
        subject: teacher.subject,
        department: teacher.dept
      });
      teacherUsers.push({ ...teacher, userId: user.id });
    }

    // 3. Tạo teacher records
    console.log('📋 Tạo teacher records...');
    for (let i = 0; i < teacherUsers.length; i++) {
      const teacher = teacherUsers[i];
      await Teacher.create({
        fullName: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        department: teacher.dept,
        specialization: teacher.spec, // Thêm specialization chi tiết
        phoneNumber: `090123456${i}`,
        userId: teacher.userId
      });
    }

    // 4. Tạo teams theo môn học (không chia theo lớp)
    console.log('🏆 Tạo teams theo môn học...');
    const subjects = ['Toán', 'Lý', 'Hóa', 'Sinh', 'Văn', 'Anh', 'Sử', 'Địa', 'Tin'];
    const teams = [];
    
    for (const subject of subjects) {
      const team = await Team.create({
        name: `Đội tuyển ${subject}`,
        subject: subject,
        grade: 'Tất cả khối', // Không giới hạn khối
        description: `Đội tuyển học sinh giỏi môn ${subject} - Tất cả khối 10, 11, 12`
      });
      teams.push(team);
    }

    // 5. Gán giáo viên vào teams với multiple teachers per team
    console.log('👥 Gán giáo viên vào teams...');
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const subject = team.subject;
      
      // Tìm giáo viên cùng môn
      const subjectTeachers = teacherUsers.filter(t => t.subject === subject);
      
      if (subjectTeachers.length > 0) {
        // Giáo viên đầu tiên làm main
        await TeamTeacher.create({
          teamId: team.id,
          teacherId: subjectTeachers[0].userId,
          role: 'main',
          notes: `Giáo viên chính phụ trách đội tuyển ${subject}`
        });
        
        // Các giáo viên khác làm co-teacher
        for (let j = 1; j < subjectTeachers.length; j++) {
          await TeamTeacher.create({
            teamId: team.id,
            teacherId: subjectTeachers[j].userId,
            role: 'co-teacher',
            notes: `Giáo viên hỗ trợ đội tuyển ${subject}`
          });
        }
      }
    }

    // 6. Tạo học sinh và phân bổ vào đội theo năng lực (không theo lớp)
    console.log('👨‍🎓 Tạo học sinh và phân bổ vào đội...');
    const grades = ['10', '11', '12'];
    const classes = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'C1', 'C2'];
    let studentCount = 0;
    
    // Tạo tổng cộng 180 học sinh (20 học sinh mỗi đội × 9 đội)
    const studentsPerTeam = 20;
    
    for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
      const team = teams[teamIndex];
      console.log(`  - Tạo ${studentsPerTeam} học sinh cho đội ${team.name}...`);
      
      for (let i = 0; i < studentsPerTeam; i++) {
        studentCount++;
        // Phân bổ ngẫu nhiên các khối trong đội (có thể có học sinh từ khối 10, 11, 12)
        const grade = grades[Math.floor(Math.random() * grades.length)];
        const className = classes[Math.floor(Math.random() * classes.length)];
        const studentId = `HS${String(studentCount).padStart(3, '0')}`;
        
        // Tạo user cho học sinh
        const studentUser = await User.create({
          name: `Học sinh ${team.subject} ${String(i + 1).padStart(2, '0')}`,
          email: studentId,
          password: defaultPassword,
          role: 'user'
        });
        
        // Tạo student record
        await Student.create({
          name: `Học sinh ${team.subject} ${String(i + 1).padStart(2, '0')}`,
          studentId: studentId,
          grade: grade,
          className: `${grade}${className}`,
          contact: `090000${String(studentCount).padStart(4, '0')}`,
          teamId: team.id,
          userId: studentUser.id
        });
      }
    }

    // 7. Tạo điểm số mẫu
    console.log('📊 Tạo điểm số mẫu...');
    const students = await Student.findAll();
    const examTypes = [
      'Thi chọn đội tuyển',
      'Kiểm tra định kỳ',
      'Thi thử khu vực',
      'Thi chính thức'
    ];
    
    for (const student of students) {
      // Tạo 3-5 điểm cho mỗi học sinh
      const numScores = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < numScores; i++) {
        const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
        const score = Math.floor(Math.random() * 5) + 6; // Điểm từ 6-10
        const examDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        
        await Score.create({
          memberId: student.id, // Sử dụng memberId thay vì studentId
          testName: examType, // Sử dụng testName thay vì examType
          score: score,
          examDate: examDate,
          notes: examType === 'Kiểm tra định kỳ' ? `Tháng ${examDate.getMonth() + 1}` : null,
          createdBy: admin.id // Thêm createdBy
        });
      }
    }

    console.log('\n🎉 TẠO LẠI DỮ LIỆU THÀNH CÔNG!');
    console.log('\n📊 THỐNG KÊ:');
    console.log(`👤 Users: ${await User.count()}`);
    console.log(`👨‍🏫 Teachers: ${await Teacher.count()}`);
    console.log(`🏆 Teams: ${await Team.count()}`);
    console.log(`👨‍🎓 Students: ${await Student.count()}`);
    console.log(`📊 Scores: ${await Score.count()}`);
    console.log(`👥 Team-Teacher assignments: ${await TeamTeacher.count()}`);
    
    console.log('\n🔑 THÔNG TIN ĐĂNG NHẬP:');
    console.log('Admin: namvokat@gmail.com / 123456');
    console.log('Giáo viên main Toán: gv.toan1@hsg.edu.vn / 123456 (có thể quản lý lịch)');
    console.log('Giáo viên co-teacher Toán: gv.toan2@hsg.edu.vn / 123456 (chỉ xem lịch)');
    console.log('Học sinh: HS001, HS002, ... / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo dữ liệu:', error);
    process.exit(1);
  }
}

recreateAllData();