// Script: Setup toàn bộ hệ thống từ đầu
const { execSync } = require('child_process');

async function runCommand(command, description) {
  try {
    console.log(`[INFO] ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`[OK] ${description} hoàn tất\n`);
  } catch (err) {
    console.error(`[ERROR] ${description} thất bại:`, err.message);
    process.exit(1);
  }
}

async function fullSetup() {
  console.log('🚀 BẮT ĐẦU SETUP TOÀN BỘ HỆ THỐNG HSG MANAGEMENT\n');
  
  // 1. Setup database
  await runCommand('node scripts/setupDatabase.js', 'Setup database');
  
  // 2. Seed admin
  await runCommand('node scripts/seedAdmin.js namvokat@gmail.com admin 123456', 'Tạo tài khoản admin');
  
  // 3. Seed teams
  await runCommand('node scripts/seedAllTeams.js', 'Tạo các đội tuyển');
  
  // 4. Seed teachers
  await runCommand('node scripts/seedTeachers.js', 'Tạo tài khoản giáo viên');
  
  // 5. Create teacher records
  await runCommand('node scripts/createTeacherRecords.js', 'Tạo Teacher records');
  
  // 6. Update teacher specializations
  await runCommand('node scripts/updateTeacherSpecializations.js', 'Cập nhật chuyên môn giáo viên');
  
  // 7. Fix duplicate teachers
  await runCommand('node scripts/fixDuplicateTeachers.js', 'Sửa giáo viên trùng tên');
  
  // 8. Improve teacher names
  await runCommand('node scripts/improveTeacherNames.js', 'Cải thiện tên giáo viên');
  
  // 9. Seed schedules
  await runCommand('node scripts/seedSchedules.js', 'Tạo lịch ôn tập');
  
  // 10. Seed students
  await runCommand('node scripts/seedStudents.js', 'Tạo học sinh mẫu');
  
  // 11. Add students to all teams
  await runCommand('node scripts/addStudentsToAllTeams.js', 'Thêm học sinh vào các đội tuyển');
  
  // 12. Add scores for all students
  await runCommand('node scripts/addScoresForAllStudents.js', 'Thêm điểm số cho tất cả học sinh');
  
  console.log('🎉 SETUP HOÀN TẤT!');
  console.log('\n📋 THÔNG TIN ĐĂNG NHẬP:');
  console.log('- Admin: namvokat@gmail.com / 123456');
  console.log('- Giáo viên: gv.toan@hsg.edu.vn / 123 (và các GV khác)');
  console.log('- Học sinh: hs.an@hsg.edu.vn / 123456 (và các HS khác)');
  console.log('\n🌐 TRUY CẬP:');
  console.log('- Frontend: http://localhost:5173/');
  console.log('- Backend API: http://localhost:8080/');
}

fullSetup();