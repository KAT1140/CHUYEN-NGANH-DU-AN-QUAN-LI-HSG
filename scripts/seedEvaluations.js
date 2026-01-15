/**
 * Script tạo dữ liệu đánh giá mẫu
 * Mỗi học sinh sẽ có 3-5 đánh giá tại các thời điểm khác nhau
 */

const { sequelize } = require('../src/config/database');
const Student = require('../src/models/student');
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Evaluation = require('../src/models/Evaluation');
const TeamTeacher = require('../src/models/TeamTeacher');

const evaluationComments = [
  "Học sinh có tinh thần học tập tốt, tham gia tích cực vào các buổi học.",
  "Có khả năng giải quyết vấn đề tốt, luôn hoàn thành bài tập đúng hạn.",
  "Thái độ học tập chân thành, chủ động hỏi bài khi chưa hiểu.",
  "Cần cải thiện kỹ năng trình bày và giải thích bài toán.",
  "Nổi bật trong môn học, có khả năng sáng tạo trong giải quyết bài tập.",
  "Mức độ tập trung cần được cải thiện, nhưng có tiến bộ so với lần trước.",
  "Rất tích cực tham gia các hoạt động tập thể, là tấm gương cho bạn bè.",
  "Cần ôn tập lại những phần kiến thức cơ bản để nâng cao điểm số.",
  "Xuất sắc trong kỳ thi, cho thấy sự chuẩn bị kỹ lưỡng.",
  "Cần chú ý tới chi tiết hơn, có những sai sót không đáng có.",
  "Tiến bộ rõ rệt so với tháng trước, hãy tiếp tục duy trì.",
  "Có khiếu năng nhưng cần phải chủ động hơn trong học tập.",
  "Thực hiện đầy đủ các yêu cầu, có ghi chép rõ ràng và khoa học.",
  "Cần tăng cường luyện tập để cải thiện độ chính xác.",
  "Thành tích học tập ổn định, duy trì được vị trí hàng đầu của lớp."
];

async function seedEvaluations() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Lấy danh sách học sinh
    const students = await Student.findAll({
      limit: 100
    });

    if (students.length === 0) {
      console.log('❌ Không tìm thấy học sinh nào');
      process.exit(1);
    }

    console.log(`📚 Tìm thấy ${students.length} học sinh`);

    let createdCount = 0;

    // Duyệt qua từng học sinh
    for (const student of students) {
      try {
        // Lấy danh sách giáo viên của team
        const teamTeachers = await TeamTeacher.findAll({
          where: { teamId: student.teamId, isActive: true },
          limit: 1
        });

        if (teamTeachers.length === 0) {
          console.log(`⏭️  Học sinh ${student.name} chưa có giáo viên - bỏ qua`);
          continue;
        }

        const teacherId = teamTeachers[0].teacherId;
        const numberOfEvaluations = Math.floor(Math.random() * 3) + 3; // 3-5 đánh giá

        // Tạo múliple đánh giá cho mỗi học sinh
        for (let i = 0; i < numberOfEvaluations; i++) {
          // Ngày đánh giá: ngẫu nhiên trong 12 tháng qua
          const daysAgo = Math.floor(Math.random() * 365);
          const evaluationDate = new Date();
          evaluationDate.setDate(evaluationDate.getDate() - daysAgo);

          const randomComment = evaluationComments[Math.floor(Math.random() * evaluationComments.length)];
          const rating = Math.floor(Math.random() * 4) + 7; // 7-10 điểm

          await Evaluation.create({
            memberId: student.id,
            content: randomComment,
            rating: rating,
            date: evaluationDate.toISOString().split('T')[0],
            createdBy: teacherId
          });

          createdCount++;
        }

        console.log(`✅ ${student.name} - Tạo ${numberOfEvaluations} đánh giá`);
      } catch (err) {
        console.error(`❌ Lỗi với học sinh ${student.name}:`, err.message);
      }
    }

    console.log(`\n✅ Hoàn thành! Đã tạo ${createdCount} bản ghi đánh giá`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
}

seedEvaluations();
