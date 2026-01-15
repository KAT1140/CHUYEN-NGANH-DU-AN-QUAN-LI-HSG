/**
 * Script tạo lịch ôn tập với các buổi nghỉ xen kẽ
 * Cấu trúc: Học 2-3 buổi rồi nghỉ 1 ngày, sau đó lại học...
 */

const { sequelize } = require('../src/config/database');
const Team = require('../src/models/Team');
const Schedule = require('../src/models/Schedule');
const dayjs = require('dayjs');

const scheduleContents = [
  { 
    objective: "Ôn tập lý thuyết cơ bản", 
    description: "Tổng hợp các khái niệm chính, công thức quan trọng" 
  },
  { 
    objective: "Luyện tập bài tập cơ bản", 
    description: "Làm các bài tập từ dễ đến trung bình" 
  },
  { 
    objective: "Luyện tập bài tập nâng cao", 
    description: "Giải các bài tập khó, bài toán chuyên sâu" 
  },
  { 
    objective: "Ôn tập tổng hợp", 
    description: "Rà soát lại toàn bộ nội dung, làm đề tập hợp" 
  },
  { 
    objective: "Kiểm tra, đánh giá", 
    description: "Làm bài kiểm tra mock, đánh giá mức độ chuẩn bị" 
  },
  { 
    objective: "Giải đáp thắc mắc", 
    description: "Hỏi đáp, giải thích lại những phần còn khó" 
  },
];

async function createScheduleWithBreaks() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    const teams = await Team.findAll();
    console.log(`⚽ Tìm thấy ${teams.length} đội`);

    let createdCount = 0;

    // Tạo lịch từ hôm nay đến trước ngày thi 1 tuần
    // Ngày thi: 15/04/2026 → Lịch học đến: 08/04/2026
    const startDate = dayjs('2026-01-15');
    const endDate = dayjs('2026-04-08'); // Trước ngày thi 1 tuần

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      
      try {
        // Chia đội thành 2 nhóm
        // Nhóm 1 (đội chẵn): Học thứ 2, 4, 6, Chủ nhật
        // Nhóm 2 (đội lẻ): Học thứ 3, 5, 7, Chủ nhật
        const isGroup1 = i % 2 === 0;
        const studyDays = isGroup1 
          ? [1, 3, 5, 0] // Thứ 2, 4, 6, Chủ nhật
          : [2, 4, 6, 0]; // Thứ 3, 5, 7, Chủ nhật

        let currentDate = startDate;

        while (currentDate.isBefore(endDate)) {
          const dayOfWeek = currentDate.day();
          
          // Kiểm tra xem hôm nay có phải ngày học không
          if (studyDays.includes(dayOfWeek)) {
            // Tạo buổi học
            const randomContent = scheduleContents[Math.floor(Math.random() * scheduleContents.length)];

            await Schedule.create({
              teamId: team.id,
              title: `Lịch ôn tập ${team.name}`,
              date: currentDate.toDate(),
              objective: randomContent.objective,
              description: randomContent.description,
              subject: team.name.replace('Đội tuyển ', ''),
              note: `Buổi ôn tập #${createdCount % 10 + 1}`
            });

            createdCount++;
          }

          currentDate = currentDate.add(1, 'day');
        }

        const studyDaysLabel = isGroup1 ? "T2-T4-T6-CN" : "T3-T5-T7-CN";
        console.log(`✅ ${team.name} - Tạo lịch nhóm ${studyDaysLabel}`);
      } catch (err) {
        console.error(`❌ Lỗi với đội ${team.name}:`, err.message);
      }
    }

    console.log(`\n✅ Hoàn thành! Đã tạo ${createdCount} buổi học có buổi nghỉ xen kẽ`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
}

createScheduleWithBreaks();
