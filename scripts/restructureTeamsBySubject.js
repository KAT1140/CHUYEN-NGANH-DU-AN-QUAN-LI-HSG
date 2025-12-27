// Script: Tái cấu trúc đội tuyển theo môn học (không chia khối)
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const Student = require('../src/models/student');
const Team = require('../src/models/Team');
const Teacher = require('../src/models/teacher');

// Import associations
require('../src/models/associations');

async function restructureTeamsBySubject() {
  try {
    await sequelize.authenticate();
    console.log('🔄 BẮT ĐẦU TÁI CẤU TRÚC ĐỘI TUYỂN THEO MÔN HỌC...\n');

    // 1. Tạo 9 đội tuyển theo môn học (không chia khối)
    const subjects = [
      'Toán', 'Lý', 'Hóa', 'Sinh', 'Văn', 'Anh', 'Địa', 'Lịch sử', 'Tin học'
    ];

    console.log('📝 Xóa dữ liệu cũ...');
    await Team.destroy({ where: {} });
    
    console.log('🏆 Tạo 9 đội tuyển theo môn học...');
    const teams = [];
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      const team = await Team.create({
        name: `Đội tuyển ${subject}`,
        subject: subject,
        grade: null, // Không chia theo khối nữa
        teacherId: null // Sẽ gán sau
      });
      teams.push(team);
      console.log(`├── Tạo đội: ${team.name}`);
    }

    // 2. Gán giáo viên cho từng đội (1 giáo viên/đội)
    console.log('\n👨‍🏫 Gán giáo viên cho các đội...');
    const teachers = await Teacher.findAll({
      include: [{ model: User, as: 'user' }]
    });

    // Mapping giáo viên theo chuyên môn
    const teacherSubjectMap = {
      'Toán': ['Toán', 'toán', 'Đại số', 'Hình học'],
      'Lý': ['Lý', 'Vật lý', 'lý'],
      'Hóa': ['Hóa', 'Hóa học', 'hóa'],
      'Sinh': ['Sinh', 'Sinh học', 'sinh'],
      'Văn': ['Văn', 'Ngữ văn', 'văn'],
      'Anh': ['Anh', 'Tiếng Anh', 'anh'],
      'Địa': ['Địa', 'Địa lý', 'địa'],
      'Lịch sử': ['Lịch sử', 'lịch sử', 'Sử'],
      'Tin học': ['Tin', 'Tin học', 'CNTT']
    };

    for (const team of teams) {
      const subject = team.subject;
      const keywords = teacherSubjectMap[subject] || [subject];
      
      // Tìm giáo viên phù hợp
      const teacher = teachers.find(t => 
        keywords.some(keyword => 
          t.specialization?.includes(keyword) || 
          t.user?.name?.includes(keyword)
        )
      );

      if (teacher) {
        await team.update({ teacherId: teacher.user.id });
        console.log(`├── ${team.name}: ${teacher.user.name}`);
      } else {
        console.log(`├── ${team.name}: Chưa có giáo viên phù hợp`);
      }
    }

    // 3. Phân bổ lại học sinh vào các đội theo môn
    console.log('\n🎓 Phân bổ lại học sinh vào các đội...');
    const students = await Student.findAll({
      include: [{ model: User, as: 'user' }]
    });

    // Reset tất cả học sinh về không có team
    await Student.update({ teamId: null }, { where: {} });

    // Phân bổ học sinh theo môn (ngẫu nhiên nhưng cân bằng)
    const studentsPerTeam = Math.ceil(students.length / teams.length);
    let studentIndex = 0;

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const teamStudents = students.slice(studentIndex, studentIndex + studentsPerTeam);
      
      for (const student of teamStudents) {
        await student.update({ teamId: team.id });
      }
      
      console.log(`├── ${team.name}: ${teamStudents.length} học sinh`);
      studentIndex += studentsPerTeam;
    }

    // 4. Thống kê kết quả
    console.log('\n📊 THỐNG KÊ SAU KHI TÁI CẤU TRÚC:');
    
    const finalTeams = await Team.findAll();

    for (const team of finalTeams) {
      const memberCount = await Student.count({ where: { teamId: team.id } });
      
      // Lấy thông tin giáo viên
      let teacherName = 'Chưa có';
      if (team.teacherId) {
        const teacher = await Teacher.findOne({
          where: { userId: team.teacherId },
          include: [{ model: User, as: 'user' }]
        });
        teacherName = teacher?.user?.name || 'Chưa có';
      }
      
      console.log(`├── ${team.name}: ${memberCount} học sinh, GV: ${teacherName}`);
    }

    // 5. Thống kê học sinh theo khối trong mỗi đội
    console.log('\n🎯 PHÂN BỐ HỌC SINH THEO KHỐI TRONG CÁC ĐỘI:');
    for (const team of finalTeams) {
      const gradeStats = await Student.findAll({
        attributes: ['grade', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        where: { teamId: team.id },
        group: ['grade'],
        order: [['grade', 'ASC']]
      });

      const gradeInfo = gradeStats.map(g => `Khối ${g.grade}: ${g.dataValues.count}`).join(', ');
      console.log(`├── ${team.name}: ${gradeInfo || 'Không có học sinh'}`);
    }

    console.log('\n✅ TÁI CẤU TRÚC HOÀN THÀNH!');
    console.log('🏆 9 đội tuyển theo môn học (không chia khối)');
    console.log('👥 Học sinh từ nhiều khối có thể cùng một đội');
    console.log('👨‍🏫 Mỗi đội có 1 giáo viên phụ trách');

    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Lỗi:', err.message);
    process.exit(1);
  }
}

restructureTeamsBySubject();