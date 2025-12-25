const { Sequelize } = require('sequelize');
require('dotenv').config();

// Cấu hình database
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false
});

// Import models
const Schedule = sequelize.define('Schedule', {
  title: { type: Sequelize.STRING, allowNull: false },
  description: { type: Sequelize.TEXT },
  date: { type: Sequelize.DATEONLY, allowNull: false },
  time: { type: Sequelize.TIME },
  type: { type: Sequelize.STRING, defaultValue: 'event' },
  subject: { type: Sequelize.STRING },
  createdBy: { type: Sequelize.INTEGER }
}, {
  tableName: 'schedules',
  timestamps: true
});

const Team = sequelize.define('Team', {
  name: { type: Sequelize.STRING, allowNull: false },
  subject: { type: Sequelize.STRING },
  grade: { type: Sequelize.INTEGER }
}, {
  tableName: 'teams',
  timestamps: true
});

// Danh sách 27 môn học (9 môn x 3 khối)
const subjects = [
  'Toán', 'Lý', 'Hóa', 'Sinh', 'Văn', 'Anh', 'Sử', 'Địa', 'Tin'
];

// Các loại hoạt động
const activityTypes = [
  'Ôn tập lý thuyết',
  'Giải bài tập nâng cao', 
  'Luyện đề thi',
  'Thảo luận nhóm',
  'Kiểm tra định kỳ',
  'Thi thử',
  'Seminar chuyên đề',
  'Thực hành',
  'Ôn tập tổng hợp',
  'Chữa bài tập'
];

// Thời gian học (chỉ buổi chiều và tối)
const timeSlots = [
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

// Địa điểm học
const locations = [
  'Phòng A101', 'Phòng A102', 'Phòng A103', 'Phòng A201', 'Phòng A202',
  'Phòng B101', 'Phòng B102', 'Phòng B201', 'Phòng B202',
  'Phòng Lab1', 'Phòng Lab2', 'Thư viện', 'Hội trường'
];

// Hàm tạo ngày ngẫu nhiên trong khoảng thời gian
function getRandomDate(start, end) {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  const randomDate = new Date(randomTime);
  
  // Chỉ lấy ngày trong tuần (thứ 2-6)
  const dayOfWeek = randomDate.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Nếu là cuối tuần, chuyển sang thứ 2
    const daysToAdd = dayOfWeek === 0 ? 1 : 2;
    randomDate.setDate(randomDate.getDate() + daysToAdd);
  }
  
  return randomDate;
}

// Hàm tạo mô tả chi tiết
function generateDescription(subject, activity, location, time, date) {
  const descriptions = {
    'Ôn tập lý thuyết': [
      `Ôn tập các kiến thức cơ bản môn ${subject}. Tập trung vào các định lý, công thức quan trọng.`,
      `Hệ thống hóa kiến thức lý thuyết ${subject}. Giải đáp thắc mắc của học sinh.`,
      `Củng cố nền tảng lý thuyết môn ${subject}. Chuẩn bị cho các bài kiểm tra.`
    ],
    'Giải bài tập nâng cao': [
      `Luyện giải các bài tập khó môn ${subject}. Phát triển tư duy logic và sáng tạo.`,
      `Thực hành giải bài tập Olympic ${subject}. Nâng cao kỹ năng giải quyết vấn đề.`,
      `Phân tích và giải các dạng bài tập phức tạp môn ${subject}.`
    ],
    'Luyện đề thi': [
      `Luyện đề thi HSG cấp tỉnh môn ${subject}. Làm quen với format đề thi.`,
      `Giải đề thi thử môn ${subject}. Rèn luyện kỹ năng làm bài trong thời gian quy định.`,
      `Ôn luyện đề thi HSG quốc gia môn ${subject}. Nâng cao khả năng thi cử.`
    ],
    'Thảo luận nhóm': [
      `Thảo luận nhóm về chuyên đề ${subject}. Trao đổi kinh nghiệm học tập.`,
      `Hoạt động nhóm: Nghiên cứu chủ đề nâng cao môn ${subject}.`,
      `Seminar nhóm nhỏ về các vấn đề khó môn ${subject}.`
    ],
    'Kiểm tra định kỳ': [
      `Kiểm tra định kỳ môn ${subject}. Đánh giá tiến độ học tập của học sinh.`,
      `Bài kiểm tra 45 phút môn ${subject}. Kiểm tra kiến thức đã học.`,
      `Test đánh giá năng lực môn ${subject}. Xác định điểm mạnh, điểm yếu.`
    ],
    'Thi thử': [
      `Thi thử HSG cấp tỉnh môn ${subject}. Mô phỏng điều kiện thi thật.`,
      `Kỳ thi thử môn ${subject} - 180 phút. Đánh giá khả năng thi cử.`,
      `Thi thử Olympic ${subject}. Chuẩn bị cho các kỳ thi lớn.`
    ],
    'Seminar chuyên đề': [
      `Seminar chuyên đề nâng cao môn ${subject}. Mở rộng kiến thức chuyên sâu.`,
      `Hội thảo khoa học nhỏ về ${subject}. Phát triển tư duy nghiên cứu.`,
      `Chuyên đề đặc biệt môn ${subject}. Khám phá các lĩnh vực mới.`
    ],
    'Thực hành': [
      `Buổi thực hành môn ${subject}. Áp dụng lý thuyết vào thực tế.`,
      `Lab thực hành ${subject}. Rèn luyện kỹ năng thực nghiệm.`,
      `Thực hành giải bài tập môn ${subject}. Củng cố kiến thức đã học.`
    ],
    'Ôn tập tổng hợp': [
      `Ôn tập tổng hợp môn ${subject}. Hệ thống hóa toàn bộ kiến thức.`,
      `Review toàn diện chương trình ${subject}. Chuẩn bị cho kỳ thi cuối.`,
      `Tổng kết kiến thức môn ${subject}. Giải đáp mọi thắc mắc.`
    ],
    'Chữa bài tập': [
      `Chữa bài tập về nhà môn ${subject}. Giải thích chi tiết các bước giải.`,
      `Sửa bài kiểm tra môn ${subject}. Phân tích lỗi sai thường gặp.`,
      `Chữa đề thi thử môn ${subject}. Hướng dẫn cách làm bài hiệu quả.`
    ]
  };

  const activityDescriptions = descriptions[activity] || [`Hoạt động học tập môn ${subject}.`];
  const randomDesc = activityDescriptions[Math.floor(Math.random() * activityDescriptions.length)];
  
  return `${randomDesc}\n\n📅 Thời gian: ${time} - ${new Date(date).toLocaleDateString('vi-VN')}\n📍 Địa điểm: ${location}\n👨‍🏫 Giáo viên phụ trách sẽ có mặt để hướng dẫn chi tiết.`;
}

async function randomizeSchedule() {
  try {
    console.log('🔄 Đang xóa lịch học cũ...');
    await Schedule.destroy({ where: {} });

    console.log('📅 Đang tạo lịch học ngẫu nhiên mới...');
    
    // Lấy danh sách tất cả teams
    const teams = await Team.findAll();
    console.log(`📋 Tìm thấy ${teams.length} teams`);

    const schedules = [];
    const startDate = new Date('2024-12-26'); // Từ ngày mai
    const endDate = new Date('2025-04-08');   // Đến trước thi HSG 1 tuần

    // Tạo lịch ngẫu nhiên cho mỗi team
    for (const team of teams) {
      // Mỗi team có 15-25 buổi học ngẫu nhiên
      const numSessions = Math.floor(Math.random() * 11) + 15; // 15-25 buổi
      
      for (let i = 0; i < numSessions; i++) {
        const randomDate = getRandomDate(startDate, endDate);
        const randomTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        
        // Tạo thời gian kết thúc (1.5-2.5 giờ sau)
        const startTime = new Date(`2000-01-01 ${randomTime}`);
        const duration = Math.floor(Math.random() * 61) + 90; // 90-150 phút
        const endTime = new Date(startTime.getTime() + duration * 60000);
        const endTimeStr = endTime.toTimeString().slice(0, 5);

        const schedule = {
          title: `${team.subject} ${team.grade} - ${randomActivity}`,
          description: generateDescription(team.subject, randomActivity, randomLocation, `${randomTime} - ${endTimeStr}`, randomDate),
          date: randomDate.toISOString().split('T')[0],
          time: randomTime,
          type: 'event',
          subject: team.subject,
          createdBy: 1, // Admin user
          createdAt: new Date(),
          updatedAt: new Date()
        };

        schedules.push(schedule);
      }
    }

    // Thêm một số sự kiện đặc biệt ngẫu nhiên
    const specialEvents = [
      {
        title: 'Thi thử HSG Cấp tỉnh - Tất cả môn',
        description: 'Kỳ thi thử chính thức cho tất cả học sinh HSG. Mô phỏng hoàn toàn điều kiện thi thật.\n\n📅 Thời gian: 07:30 - 11:30\n📍 Địa điểm: Hội trường chính\n⚠️ Học sinh cần có mặt trước 15 phút.',
        subject: 'Tổng hợp',
        time: '07:30'
      },
      {
        title: 'Hội thảo Phương pháp học HSG',
        description: 'Hội thảo chia sẻ kinh nghiệm học tập và thi cử HSG từ các thầy cô và học sinh xuất sắc.\n\n📅 Thời gian: 14:00 - 16:30\n📍 Địa điểm: Hội trường\n👥 Tất cả học sinh HSG tham dự.',
        subject: 'Tổng hợp',
        time: '14:00'
      },
      {
        title: 'Giao lưu với đội tuyển HSG trường khác',
        description: 'Hoạt động giao lưu, trao đổi kinh nghiệm với đội tuyển HSG của các trường THPT trong tỉnh.\n\n📅 Thời gian: 08:00 - 17:00\n📍 Địa điểm: Trường THPT Chuyên\n🚌 Có xe đưa đón.',
        subject: 'Tổng hợp',
        time: '08:00'
      }
    ];

    // Thêm sự kiện đặc biệt vào ngày ngẫu nhiên
    for (const event of specialEvents) {
      const randomDate = getRandomDate(startDate, endDate);
      schedules.push({
        ...event,
        date: randomDate.toISOString().split('T')[0],
        type: 'event',
        createdBy: 1, // Admin user
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Shuffle lịch học để tạo sự ngẫu nhiên
    for (let i = schedules.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [schedules[i], schedules[j]] = [schedules[j], schedules[i]];
    }

    // Bulk insert tất cả schedules
    await Schedule.bulkCreate(schedules);

    console.log(`✅ Đã tạo thành công ${schedules.length} lịch học ngẫu nhiên!`);
    console.log(`📊 Thống kê:`);
    console.log(`   - Số teams: ${teams.length}`);
    console.log(`   - Lịch học team: ${schedules.length - specialEvents.length}`);
    console.log(`   - Sự kiện đặc biệt: ${specialEvents.length}`);
    console.log(`   - Tổng cộng: ${schedules.length} lịch học`);
    console.log(`📅 Thời gian: ${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo lịch học ngẫu nhiên:', error);
  } finally {
    await sequelize.close();
  }
}

// Chạy script
randomizeSchedule();