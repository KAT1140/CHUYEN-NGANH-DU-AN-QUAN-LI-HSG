const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const Student = require('../src/models/student');
const Team = require('../src/models/Team');

// Import associations
require('../src/models/associations');

async function checkStudentInfo() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('\n=== KIỂM TRA THÔNG TIN HỌC SINH ===');

    // Lấy tất cả học sinh
    const allStudents = await User.findAll({
      where: { role: 'user' },
      include: [
        {
          model: Student,
          as: 'studentProfile',
          include: [
            {
              model: Team,
              as: 'team',
              attributes: ['id', 'name', 'subject']
            }
          ]
        }
      ]
    });

    console.log(`📊 Tổng số học sinh: ${allStudents.length}`);

    // Phân loại theo thông tin
    let hasGrade = 0;
    let hasClass = 0;
    let hasTeam = 0;
    let complete = 0;

    const gradeStats = {};
    const classStats = {};
    const teamStats = {};

    allStudents.forEach(user => {
      if (user.studentProfile) {
        const student = user.studentProfile;
        
        // Kiểm tra grade
        if (student.grade) {
          hasGrade++;
          if (!gradeStats[student.grade]) gradeStats[student.grade] = 0;
          gradeStats[student.grade]++;
        }
        
        // Kiểm tra class
        if (student.className) {
          hasClass++;
          if (!classStats[student.className]) classStats[student.className] = 0;
          classStats[student.className]++;
        }
        
        // Kiểm tra team
        if (student.team) {
          hasTeam++;
          if (!teamStats[student.team.subject]) teamStats[student.team.subject] = 0;
          teamStats[student.team.subject]++;
        }
        
        // Kiểm tra đầy đủ
        if (student.grade && student.className && student.team) {
          complete++;
        }
      }
    });

    console.log(`\n=== THỐNG KÊ TỔNG QUAN ===`);
    console.log(`✅ Có thông tin khối: ${hasGrade}/${allStudents.length} (${(hasGrade/allStudents.length*100).toFixed(1)}%)`);
    console.log(`✅ Có thông tin lớp: ${hasClass}/${allStudents.length} (${(hasClass/allStudents.length*100).toFixed(1)}%)`);
    console.log(`✅ Có đội tuyển: ${hasTeam}/${allStudents.length} (${(hasTeam/allStudents.length*100).toFixed(1)}%)`);
    console.log(`🎯 Thông tin đầy đủ: ${complete}/${allStudents.length} (${(complete/allStudents.length*100).toFixed(1)}%)`);

    console.log(`\n=== PHÂN BỐ THEO KHỐI ===`);
    Object.keys(gradeStats).sort().forEach(grade => {
      console.log(`📚 Khối ${grade}: ${gradeStats[grade]} học sinh`);
    });

    console.log(`\n=== PHÂN BỐ THEO LỚP ===`);
    Object.keys(classStats).sort().forEach(className => {
      console.log(`🏫 Lớp ${className}: ${classStats[className]} học sinh`);
    });

    console.log(`\n=== PHÂN BỐ THEO ĐỘI TUYỂN ===`);
    Object.keys(teamStats).sort().forEach(subject => {
      console.log(`🏆 ${subject}: ${teamStats[subject]} học sinh`);
    });

    // Hiển thị một số ví dụ học sinh đầy đủ thông tin
    console.log(`\n=== VÍ DỤ HỌC SINH ĐẦY ĐỦ THÔNG TIN ===`);
    const completeStudents = allStudents.filter(user => 
      user.studentProfile && 
      user.studentProfile.grade && 
      user.studentProfile.className && 
      user.studentProfile.team
    ).slice(0, 5);

    completeStudents.forEach((user, index) => {
      const student = user.studentProfile;
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   📧 ${user.email}`);
      console.log(`   📚 Khối ${student.grade} - Lớp ${student.className}`);
      console.log(`   🏆 Đội tuyển ${student.team.subject}`);
      console.log('');
    });

    // Kiểm tra học sinh thiếu thông tin
    const incompleteStudents = allStudents.filter(user => {
      if (!user.studentProfile) return true;
      const student = user.studentProfile;
      return !student.grade || !student.className || !student.team;
    });

    if (incompleteStudents.length > 0) {
      console.log(`\n⚠️  HỌC SINH THIẾU THÔNG TIN (${incompleteStudents.length}):`);
      incompleteStudents.slice(0, 5).forEach((user, index) => {
        const student = user.studentProfile;
        const missing = [];
        if (!student || !student.grade) missing.push('khối');
        if (!student || !student.className) missing.push('lớp');
        if (!student || !student.team) missing.push('đội');
        
        console.log(`${index + 1}. ${user.name} - Thiếu: ${missing.join(', ')}`);
      });
      if (incompleteStudents.length > 5) {
        console.log(`   ... và ${incompleteStudents.length - 5} học sinh khác`);
      }
    } else {
      console.log(`\n✅ TẤT CẢ HỌC SINH ĐỀU CÓ THÔNG TIN ĐẦY ĐỦ!`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

checkStudentInfo();