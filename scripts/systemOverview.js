// Script: Tổng quan toàn bộ hệ thống HSG Management
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const Student = require('../src/models/student');
const Team = require('../src/models/Team');
const Score = require('../src/models/Score');
const Schedule = require('../src/models/Schedule');
const Teacher = require('../src/models/teacher');

// Import associations
require('../src/models/associations');

async function systemOverview() {
  try {
    await sequelize.authenticate();
    console.log('🚀 HSG MANAGEMENT SYSTEM - TỔNG QUAN HỆ THỐNG\n');

    // Đếm số lượng dữ liệu
    const userCount = await User.count();
    const studentCount = await Student.count();
    const teamCount = await Team.count();
    const scoreCount = await Score.count();
    const scheduleCount = await Schedule.count();
    const teacherCount = await Teacher.count();

    console.log('📊 THỐNG KÊ TỔNG QUAN:');
    console.log(`├── 👥 Người dùng: ${userCount}`);
    console.log(`├── 👨‍🏫 Giáo viên: ${teacherCount}`);
    console.log(`├── 🎓 Học sinh: ${studentCount}`);
    console.log(`├── 🏆 Đội tuyển: ${teamCount}`);
    console.log(`├── 📝 Điểm số: ${scoreCount}`);
    console.log(`└── 📅 Lịch ôn tập: ${scheduleCount}\n`);

    // Thống kê người dùng theo role
    const usersByRole = await User.findAll({
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['role']
    });

    console.log('👥 NGƯỜI DÙNG THEO VAI TRÒ:');
    usersByRole.forEach(user => {
      const role = user.role === 'admin' ? 'Quản trị viên' : 
                   user.role === 'teacher' ? 'Giáo viên' : 'Học sinh';
      console.log(`├── ${role}: ${user.dataValues.count}`);
    });
    console.log('');

    // Thống kê đội tuyển theo khối
    const teamsByGrade = await Team.findAll({
      attributes: ['grade', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['grade'],
      order: [['grade', 'ASC']]
    });

    console.log('🏆 ĐỘI TUYỂN THEO KHỐI:');
    teamsByGrade.forEach(team => {
      console.log(`├── Khối ${team.grade}: ${team.dataValues.count} đội`);
    });
    console.log('');

    // Thống kê học sinh theo khối
    const studentsByGrade = await Student.findAll({
      include: [{
        model: Team,
        as: 'team',
        attributes: ['grade']
      }],
      attributes: ['id'],
      where: {
        teamId: { [require('sequelize').Op.not]: null }
      }
    });

    const gradeCount = {};
    studentsByGrade.forEach(student => {
      if (student.team) {
        const grade = student.team.grade;
        gradeCount[grade] = (gradeCount[grade] || 0) + 1;
      }
    });

    console.log('🎓 HỌC SINH THEO KHỐI:');
    Object.keys(gradeCount).sort().forEach(grade => {
      console.log(`├── Khối ${grade}: ${gradeCount[grade]} học sinh`);
    });
    console.log('');

    // Thống kê điểm số theo loại
    const periodicScores = await Score.count({
      where: {
        testName: { [require('sequelize').Op.like]: '%Kiểm tra định kỳ%' }
      }
    });

    const provincialScores = await Score.count({
      where: {
        testName: { [require('sequelize').Op.like]: '%HSG cấp tỉnh%' }
      }
    });

    console.log('📝 ĐIỂM SỐ THEO LOẠI:');
    console.log(`├── Kiểm tra định kỳ: ${periodicScores}`);
    console.log(`├── HSG cấp tỉnh: ${provincialScores}`);
    console.log(`└── Tổng cộng: ${scoreCount}\n`);

    // Thống kê giải thưởng HSG
    const awards = await Score.findAll({
      attributes: ['award', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: {
        testName: { [require('sequelize').Op.like]: '%HSG cấp tỉnh%' },
        award: { [require('sequelize').Op.not]: null }
      },
      group: ['award']
    });

    console.log('🏆 GIẢI THƯỞNG HSG CẤP TỈNH:');
    awards.forEach(award => {
      console.log(`├── ${award.award}: ${award.dataValues.count}`);
    });
    console.log('');

    // Thống kê lịch ôn tập theo môn
    const schedulesBySubject = await Schedule.findAll({
      attributes: ['subject', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['subject'],
      order: [['subject', 'ASC']]
    });

    console.log('📅 LỊCH ÔN TẬP THEO MÔN:');
    schedulesBySubject.forEach(schedule => {
      console.log(`├── ${schedule.subject}: ${schedule.dataValues.count} lịch`);
    });
    console.log('');

    console.log('✅ HỆ THỐNG ĐÃ SẴN SÀNG!');
    console.log('🌐 Truy cập: http://localhost:5173/');
    console.log('🔑 Admin: namvokat@gmail.com / 123456');

    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Lỗi:', err.message);
    process.exit(1);
  }
}

systemOverview();