// Script để thêm lịch ôn tập cho mỗi môn
const { sequelize } = require('../src/config/database');
const Schedule = require('../src/models/Schedule');
const Team = require('../src/models/Team');
const User = require('../src/models/User');

async function seedSchedules() {
  try {
    console.log('🔄 Đang thêm lịch ôn tập...');

    // Lấy tất cả các đội tuyển
    const teams = await Team.findAll();
    if (teams.length === 0) {
      console.log('❌ Không có đội tuyển nào');
      return;
    }

    // Lấy giáo viên đầu tiên để làm người tạo
    const teacher = await User.findOne({ where: { role: 'teacher' } });
    if (!teacher) {
      console.log('❌ Không có giáo viên nào');
      return;
    }

    const schedules = [];
    const activities = [
      'Ôn tập chương',
      'Làm đề thi thử',
      'Giải bài tập nâng cao',
      'Ôn tập kiến thức cơ bản',
      'Chữa đề thi',
      'Thảo luận nhóm',
      'Tổng ôn',
      'Kiểm tra định kỳ',
      'Ôn tập chuyên đề',
      'Luyện đề HSG'
    ];

    // Tạo lịch cho mỗi môn
    for (const team of teams) {
      const subject = team.subject;
      
      // Tạo 10 lịch ôn cho mỗi môn
      for (let i = 0; i < 10; i++) {
        const dayOffset = Math.floor(Math.random() * 30) + 1; // 1-30 ngày kể từ hôm nay
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);
        const dateStr = date.toISOString().split('T')[0];
        
        const hour = Math.floor(Math.random() * 4) + 14; // 14-17h
        const minute = Math.random() < 0.5 ? '00' : '30';
        const time = `${hour}:${minute}`;
        
        schedules.push({
          title: `${subject} - ${activities[i]}`,
          description: `Buổi ${activities[i].toLowerCase()} môn ${subject} cho đội tuyển HSG`,
          date: dateStr,
          time: time,
          subject: subject,
          teamId: team.id,
          createdBy: teacher.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Bulk insert
    await Schedule.bulkCreate(schedules);

    console.log(`✅ Đã thêm ${schedules.length} lịch ôn tập`);
    console.log(`   - ${teams.length} môn học`);
    console.log(`   - Mỗi môn có 10 lịch ôn`);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

seedSchedules();
