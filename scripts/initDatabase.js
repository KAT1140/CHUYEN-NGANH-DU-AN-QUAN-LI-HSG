// Script: Khởi tạo database từ đầu với dữ liệu mẫu
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'hsg-management-db';

async function initDatabase() {
  let connection;
  
  try {
    console.log('📌 Bước 1: Kết nối MySQL...');
    
    // Kết nối MySQL mà không chỉ định database
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('✅ Kết nối MySQL thành công\n');
    
    // Bước 1: Xóa database cũ nếu tồn tại
    console.log('📌 Bước 2: Xóa database cũ (nếu tồn tại)...');
    try {
      await connection.execute(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
      console.log(`✅ Đã xóa database cũ\n`);
    } catch (err) {
      console.log(`⚠️  Không thể xóa database cũ: ${err.message}\n`);
    }
    
    // Bước 2: Tạo database mới
    console.log('📌 Bước 3: Tạo database mới...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${DB_NAME}' đã được tạo\n`);
    
    // Bước 3: Sử dụng database
    console.log(`📌 Bước 4: Sử dụng database '${DB_NAME}'...`);
    await connection.execute(`USE \`${DB_NAME}\``);
    console.log(`✅ Đang sử dụng database '${DB_NAME}'\n`);
    
    // Bước 4: Tạo bảng Users
    console.log('📌 Bước 5: Tạo bảng Users...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`Users\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng Users đã được tạo\n');
    
    // Bước 5: Tạo bảng Teachers
    console.log('📌 Bước 6: Tạo bảng Teachers...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`Teachers\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`userId\` INT NOT NULL UNIQUE,
        \`subject\` VARCHAR(100),
        \`specialization\` VARCHAR(255),
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (\`userId\`) REFERENCES \`Users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng Teachers đã được tạo\n');
    
    // Bước 6: Tạo bảng Students
    console.log('📌 Bước 7: Tạo bảng Students...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`Students\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`userId\` INT NOT NULL UNIQUE,
        \`studentCode\` VARCHAR(50),
        \`className\` VARCHAR(100),
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (\`userId\`) REFERENCES \`Users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng Students đã được tạo\n');
    
    // Bước 7: Tạo bảng Teams
    console.log('📌 Bước 8: Tạo bảng Teams...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`Teams\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`subject\` VARCHAR(100),
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng Teams đã được tạo\n');
    
    // Bước 8: Tạo bảng TeamTeachers
    console.log('📌 Bước 9: Tạo bảng TeamTeachers...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`TeamTeachers\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`teamId\` INT NOT NULL,
        \`teacherId\` INT NOT NULL,
        \`role\` VARCHAR(100),
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`unique_team_teacher\` (\`teamId\`, \`teacherId\`),
        FOREIGN KEY (\`teamId\`) REFERENCES \`Teams\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`teacherId\`) REFERENCES \`Teachers\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng TeamTeachers đã được tạo\n');
    
    // Bước 9: Tạo bảng Schedules
    console.log('📌 Bước 10: Tạo bảng Schedules...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`Schedules\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`teamId\` INT NOT NULL,
        \`date\` DATE NOT NULL,
        \`time\` TIME NOT NULL,
        \`location\` VARCHAR(255),
        \`description\` TEXT,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (\`teamId\`) REFERENCES \`Teams\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng Schedules đã được tạo\n');
    
    // Bước 10: Tạo bảng Scores
    console.log('📌 Bước 11: Tạo bảng Scores...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`Scores\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`studentId\` INT NOT NULL,
        \`teamId\` INT NOT NULL,
        \`score\` DECIMAL(5, 2),
        \`rank\` INT,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`unique_student_team\` (\`studentId\`, \`teamId\`),
        FOREIGN KEY (\`studentId\`) REFERENCES \`Students\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`teamId\`) REFERENCES \`Teams\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng Scores đã được tạo\n');
    
    // Bước 11: Tạo bảng Evaluations
    console.log('📌 Bước 12: Tạo bảng Evaluations...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`Evaluations\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`studentId\` INT NOT NULL,
        \`teamId\` INT NOT NULL,
        \`evaluationDate\` DATE,
        \`feedback\` TEXT,
        \`rating\` INT,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (\`studentId\`) REFERENCES \`Students\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`teamId\`) REFERENCES \`Teams\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng Evaluations đã được tạo\n');
    
    // Bước 12: Thêm dữ liệu mẫu - Admin
    console.log('📌 Bước 13: Thêm dữ liệu mẫu...');
    const bcryptjs = require('bcryptjs');
    const adminPassword = await bcryptjs.hash('123456', 10);
    
    await connection.execute(
      `INSERT INTO \`Users\` (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Admin HSG', 'admin@hsg.edu.vn', adminPassword, 'admin']
    );
    console.log('✅ Đã thêm tài khoản Admin\n');
    
    // Thêm giáo viên
    console.log('📌 Bước 14: Thêm giáo viên mẫu...');
    const teacherPassword = await bcryptjs.hash('123456', 10);
    
    const teachers = [
      ['Thầy Toán', 'teacher.math@hsg.edu.vn', 'Toán'],
      ['Thầy Lý', 'teacher.physics@hsg.edu.vn', 'Lý'],
      ['Thầy Hóa', 'teacher.chemistry@hsg.edu.vn', 'Hóa'],
      ['Thầy Anh', 'teacher.english@hsg.edu.vn', 'Anh'],
      ['Thầy Văn', 'teacher.literature@hsg.edu.vn', 'Văn']
    ];
    
    for (const [name, email, subject] of teachers) {
      const [userResult] = await connection.execute(
        `INSERT INTO \`Users\` (name, email, password, role) VALUES (?, ?, ?, ?)`,
        [name, email, teacherPassword, 'teacher']
      );
      
      await connection.execute(
        `INSERT INTO \`Teachers\` (userId, subject) VALUES (?, ?)`,
        [userResult.insertId, subject]
      );
    }
    console.log('✅ Đã thêm các giáo viên mẫu\n');
    
    // Thêm học sinh
    console.log('📌 Bước 15: Thêm học sinh mẫu...');
    const studentPassword = await bcryptjs.hash('123456', 10);
    
    const students = [
      ['Nguyễn An', 'student.an@hsg.edu.vn', 'HS001', '10A'],
      ['Trần Bình', 'student.binh@hsg.edu.vn', 'HS002', '10A'],
      ['Lê Chi', 'student.chi@hsg.edu.vn', 'HS003', '10B'],
      ['Phạm Đông', 'student.dong@hsg.edu.vn', 'HS004', '10B'],
      ['Hoàng Em', 'student.em@hsg.edu.vn', 'HS005', '10C'],
      ['Võ Phương', 'student.phuong@hsg.edu.vn', 'HS006', '10C'],
      ['Dương Quân', 'student.quan@hsg.edu.vn', 'HS007', '10D'],
      ['Bùi Rô', 'student.ro@hsg.edu.vn', 'HS008', '10D'],
      ['Tô Sâm', 'student.sam@hsg.edu.vn', 'HS009', '10E'],
      ['Nông Tâm', 'student.tam@hsg.edu.vn', 'HS010', '10E']
    ];
    
    const studentIds = [];
    for (const [name, email, code, className] of students) {
      const [userResult] = await connection.execute(
        `INSERT INTO \`Users\` (name, email, password, role) VALUES (?, ?, ?, ?)`,
        [name, email, studentPassword, 'student']
      );
      
      const [studentResult] = await connection.execute(
        `INSERT INTO \`Students\` (userId, studentCode, className) VALUES (?, ?, ?)`,
        [userResult.insertId, code, className]
      );
      
      studentIds.push(studentResult.insertId);
    }
    console.log('✅ Đã thêm các học sinh mẫu\n');
    
    // Thêm các đội tuyển
    console.log('📌 Bước 16: Thêm các đội tuyển...');
    const teams = [
      ['Đội Toán', 'Đội tuyển Toán HSG', 'Toán'],
      ['Đội Lý', 'Đội tuyển Lý HSG', 'Lý'],
      ['Đội Hóa', 'Đội tuyển Hóa HSG', 'Hóa'],
      ['Đội Anh', 'Đội tuyển Anh HSG', 'Anh'],
      ['Đội Văn', 'Đội tuyển Văn HSG', 'Văn']
    ];
    
    const teamIds = [];
    for (const [name, description, subject] of teams) {
      const [teamResult] = await connection.execute(
        `INSERT INTO \`Teams\` (name, description, subject) VALUES (?, ?, ?)`,
        [name, description, subject]
      );
      teamIds.push(teamResult.insertId);
    }
    console.log('✅ Đã thêm các đội tuyển\n');
    
    // Thêm điểm số cho học sinh
    console.log('📌 Bước 17: Thêm điểm số cho học sinh...');
    for (let i = 0; i < studentIds.length; i++) {
      for (let j = 0; j < teamIds.length; j++) {
        const score = (Math.random() * 10).toFixed(2);
        const rank = Math.floor(Math.random() * 10) + 1;
        
        try {
          await connection.execute(
            `INSERT INTO \`Scores\` (studentId, teamId, score, rank) VALUES (?, ?, ?, ?)`,
            [studentIds[i], teamIds[j], score, rank]
          );
        } catch (err) {
          // Bỏ qua nếu bản ghi đã tồn tại
        }
      }
    }
    console.log('✅ Đã thêm điểm số\n');
    
    // Thêm lịch ôn tập
    console.log('📌 Bước 18: Thêm lịch ôn tập...');
    const today = new Date();
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = 0; j < 3; j++) {
        const scheduleDate = new Date(today);
        scheduleDate.setDate(scheduleDate.getDate() + j + 1);
        
        const dateStr = scheduleDate.toISOString().split('T')[0];
        const time = `${9 + j}:00:00`;
        
        await connection.execute(
          `INSERT INTO \`Schedules\` (teamId, date, time, location, description) VALUES (?, ?, ?, ?, ?)`,
          [teamIds[i], dateStr, time, 'Phòng học 101', `Buổi ôn tập ngày ${dateStr}`]
        );
      }
    }
    console.log('✅ Đã thêm lịch ôn tập\n');
    
    console.log('🎉 ✅ DATABASE ĐÃ ĐƯỢC KHỞI TẠO THÀNH CÔNG!\n');
    console.log('📋 THÔNG TIN ĐĂNG NHẬP:');
    console.log('━'.repeat(50));
    console.log('🔑 Admin:        admin@hsg.edu.vn / 123456');
    console.log('🔑 Giáo viên:    teacher.math@hsg.edu.vn / 123456');
    console.log('🔑 Học sinh:     student.an@hsg.edu.vn / 123456');
    console.log('━'.repeat(50));
    console.log('\n🌐 TRUY CẬP:');
    console.log('   Frontend: http://localhost:5173/');
    console.log('   Backend:  http://localhost:8080/');
    
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ LỖI:', error.message);
    console.error(error);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

initDatabase();
