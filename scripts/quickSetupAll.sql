-- QUICK SETUP: Tạo tất cả dữ liệu một lần
USE `hsg-db`;

-- 1. Tạo admin
INSERT IGNORE INTO users (name, email, password, role, subject, department, createdAt, updatedAt) 
VALUES ('Admin User', 'namvokat@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, NULL, NOW(), NOW());

-- 2. Tạo tất cả giáo viên users
INSERT INTO users (name, email, password, role, subject, department, createdAt, updatedAt) VALUES
-- Toán
('Nguyễn Văn Toán', 'gv.toan1@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Toán', 'Tổ Toán', NOW(), NOW()),
('Nguyễn Văn Minh', 'gv.toan2@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Toán', 'Tổ Toán', NOW(), NOW()),
('Lê Thị Hương', 'gv.toan3@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Toán', 'Tổ Toán', NOW(), NOW()),
-- Lý
('Trần Văn Lý', 'gv.ly1@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Lý', 'Tổ Khoa học Tự nhiên', NOW(), NOW()),
('Phạm Thị Lan', 'gv.ly2@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Lý', 'Tổ Khoa học Tự nhiên', NOW(), NOW()),
('Hoàng Văn Nam', 'gv.ly3@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Lý', 'Tổ Khoa học Tự nhiên', NOW(), NOW()),
-- Hóa
('Lê Văn Hóa', 'gv.hoa1@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Hóa', 'Tổ Khoa học Tự nhiên', NOW(), NOW()),
('Đỗ Thị Mai', 'gv.hoa2@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Hóa', 'Tổ Khoa học Tự nhiên', NOW(), NOW()),
('Vũ Văn Đức', 'gv.hoa3@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Hóa', 'Tổ Khoa học Tự nhiên', NOW(), NOW()),
-- Sinh
('Phạm Thị Sinh', 'gv.sinh1@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Sinh', 'Tổ Khoa học Tự nhiên', NOW(), NOW()),
('Nguyễn Văn Bình', 'gv.sinh2@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Sinh', 'Tổ Khoa học Tự nhiên', NOW(), NOW()),
('Trần Thị Hoa', 'gv.sinh3@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Sinh', 'Tổ Khoa học Tự nhiên', NOW(), NOW()),
-- Văn
('Hoàng Văn Văn', 'gv.van1@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Văn', 'Tổ Khoa học Xã hội', NOW(), NOW()),
('Lê Thị Thảo', 'gv.van2@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Văn', 'Tổ Khoa học Xã hội', NOW(), NOW()),
('Đỗ Văn Tùng', 'gv.van3@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Văn', 'Tổ Khoa học Xã hội', NOW(), NOW()),
-- Anh
('Đỗ Thị Anh', 'gv.anh1@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Anh', 'Tổ Ngoại ngữ', NOW(), NOW()),
('Nguyễn Văn Long', 'gv.anh2@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Anh', 'Tổ Ngoại ngữ', NOW(), NOW()),
('Trần Thị Linh', 'gv.anh3@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Anh', 'Tổ Ngoại ngữ', NOW(), NOW()),
-- Sử
('Vũ Văn Sử', 'gv.su1@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Sử', 'Tổ Khoa học Xã hội', NOW(), NOW()),
('Phạm Thị Nga', 'gv.su2@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Sử', 'Tổ Khoa học Xã hội', NOW(), NOW()),
('Lê Văn Quang', 'gv.su3@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Sử', 'Tổ Khoa học Xã hội', NOW(), NOW()),
-- Địa
('Bùi Thị Địa', 'gv.dia1@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Địa', 'Tổ Khoa học Xã hội', NOW(), NOW()),
('Hoàng Văn Hải', 'gv.dia2@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Địa', 'Tổ Khoa học Xã hội', NOW(), NOW()),
('Nguyễn Thị Thu', 'gv.dia3@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Địa', 'Tổ Khoa học Xã hội', NOW(), NOW()),
-- Tin
('Ngô Văn Tin', 'gv.tin1@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Tin', 'Tổ Tin học', NOW(), NOW()),
('Đỗ Thị Lan', 'gv.tin2@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Tin', 'Tổ Tin học', NOW(), NOW()),
('Trần Văn Dũng', 'gv.tin3@hsg.edu.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'Tin', 'Tổ Tin học', NOW(), NOW());

-- 3. Tạo teacher records cho tất cả
INSERT INTO teachers (fullName, email, subject, department, specialization, phoneNumber, userId, createdAt, updatedAt) VALUES
-- Toán (userId: 2,3,4)
('Nguyễn Văn Toán', 'gv.toan1@hsg.edu.vn', 'Toán', 'Tổ Toán', 'Đại số, Hình học, Giải tích', '0901234567', 2, NOW(), NOW()),
('Nguyễn Văn Minh', 'gv.toan2@hsg.edu.vn', 'Toán', 'Tổ Toán', 'Toán ứng dụng, Thống kê', '0901234568', 3, NOW(), NOW()),
('Lê Thị Hương', 'gv.toan3@hsg.edu.vn', 'Toán', 'Tổ Toán', 'Hình học không gian, Lượng giác', '0901234569', 4, NOW(), NOW()),
-- Lý (userId: 5,6,7)
('Trần Văn Lý', 'gv.ly1@hsg.edu.vn', 'Lý', 'Tổ Khoa học Tự nhiên', 'Cơ học, Điện học', '0901234570', 5, NOW(), NOW()),
('Phạm Thị Lan', 'gv.ly2@hsg.edu.vn', 'Lý', 'Tổ Khoa học Tự nhiên', 'Quang học, Nhiệt học', '0901234571', 6, NOW(), NOW()),
('Hoàng Văn Nam', 'gv.ly3@hsg.edu.vn', 'Lý', 'Tổ Khoa học Tự nhiên', 'Vật lý hạt nhân, Dao động sóng', '0901234572', 7, NOW(), NOW()),
-- Hóa (userId: 8,9,10)
('Lê Văn Hóa', 'gv.hoa1@hsg.edu.vn', 'Hóa', 'Tổ Khoa học Tự nhiên', 'Hóa vô cơ, Hóa hữu cơ', '0901234573', 8, NOW(), NOW()),
('Đỗ Thị Mai', 'gv.hoa2@hsg.edu.vn', 'Hóa', 'Tổ Khoa học Tự nhiên', 'Hóa phân tích, Hóa sinh', '0901234574', 9, NOW(), NOW()),
('Vũ Văn Đức', 'gv.hoa3@hsg.edu.vn', 'Hóa', 'Tổ Khoa học Tự nhiên', 'Hóa lý, Điện hóa', '0901234575', 10, NOW(), NOW()),
-- Sinh (userId: 11,12,13)
('Phạm Thị Sinh', 'gv.sinh1@hsg.edu.vn', 'Sinh', 'Tổ Khoa học Tự nhiên', 'Sinh học phân tử, Di truyền học', '0901234576', 11, NOW(), NOW()),
('Nguyễn Văn Bình', 'gv.sinh2@hsg.edu.vn', 'Sinh', 'Tổ Khoa học Tự nhiên', 'Sinh thái học, Tiến hóa', '0901234577', 12, NOW(), NOW()),
('Trần Thị Hoa', 'gv.sinh3@hsg.edu.vn', 'Sinh', 'Tổ Khoa học Tự nhiên', 'Sinh lý học, Vi sinh vật', '0901234578', 13, NOW(), NOW()),
-- Văn (userId: 14,15,16)
('Hoàng Văn Văn', 'gv.van1@hsg.edu.vn', 'Văn', 'Tổ Khoa học Xã hội', 'Văn học cổ điển, Ngữ pháp', '0901234579', 14, NOW(), NOW()),
('Lê Thị Thảo', 'gv.van2@hsg.edu.vn', 'Văn', 'Tổ Khoa học Xã hội', 'Văn học hiện đại, Tu từ học', '0901234580', 15, NOW(), NOW()),
('Đỗ Văn Tùng', 'gv.van3@hsg.edu.vn', 'Văn', 'Tổ Khoa học Xã hội', 'Thơ ca, Tiểu thuyết', '0901234581', 16, NOW(), NOW()),
-- Anh (userId: 17,18,19)
('Đỗ Thị Anh', 'gv.anh1@hsg.edu.vn', 'Anh', 'Tổ Ngoại ngữ', 'Grammar, Speaking', '0901234582', 17, NOW(), NOW()),
('Nguyễn Văn Long', 'gv.anh2@hsg.edu.vn', 'Anh', 'Tổ Ngoại ngữ', 'Writing, Reading', '0901234583', 18, NOW(), NOW()),
('Trần Thị Linh', 'gv.anh3@hsg.edu.vn', 'Anh', 'Tổ Ngoại ngữ', 'Listening, Pronunciation', '0901234584', 19, NOW(), NOW()),
-- Sử (userId: 20,21,22)
('Vũ Văn Sử', 'gv.su1@hsg.edu.vn', 'Sử', 'Tổ Khoa học Xã hội', 'Lịch sử Việt Nam', '0901234585', 20, NOW(), NOW()),
('Phạm Thị Nga', 'gv.su2@hsg.edu.vn', 'Sử', 'Tổ Khoa học Xã hội', 'Lịch sử thế giới', '0901234586', 21, NOW(), NOW()),
('Lê Văn Quang', 'gv.su3@hsg.edu.vn', 'Sử', 'Tổ Khoa học Xã hội', 'Lịch sử cận hiện đại', '0901234587', 22, NOW(), NOW()),
-- Địa (userId: 23,24,25)
('Bùi Thị Địa', 'gv.dia1@hsg.edu.vn', 'Địa', 'Tổ Khoa học Xã hội', 'Địa lý tự nhiên', '0901234588', 23, NOW(), NOW()),
('Hoàng Văn Hải', 'gv.dia2@hsg.edu.vn', 'Địa', 'Tổ Khoa học Xã hội', 'Địa lý kinh tế', '0901234589', 24, NOW(), NOW()),
('Nguyễn Thị Thu', 'gv.dia3@hsg.edu.vn', 'Địa', 'Tổ Khoa học Xã hội', 'Địa lý dân cư', '0901234590', 25, NOW(), NOW()),
-- Tin (userId: 26,27,28)
('Ngô Văn Tin', 'gv.tin1@hsg.edu.vn', 'Tin', 'Tổ Tin học', 'Lập trình, Cơ sở dữ liệu', '0901234591', 26, NOW(), NOW()),
('Đỗ Thị Lan', 'gv.tin2@hsg.edu.vn', 'Tin', 'Tổ Tin học', 'Mạng máy tính, Bảo mật', '0901234592', 27, NOW(), NOW()),
('Trần Văn Dũng', 'gv.tin3@hsg.edu.vn', 'Tin', 'Tổ Tin học', 'AI, Machine Learning', '0901234593', 28, NOW(), NOW());

-- 4. Assign giáo viên vào tất cả teams (mỗi môn 3 giáo viên cho 3 khối)
-- Toán
UPDATE teams SET teacherId = 2 WHERE name = 'Đội tuyển Toán 12';   -- Nguyễn Văn Toán
UPDATE teams SET teacherId = 3 WHERE name = 'Đội tuyển Toán 11';   -- Nguyễn Văn Minh  
UPDATE teams SET teacherId = 4 WHERE name = 'Đội tuyển Toán 10';   -- Lê Thị Hương

-- Lý
UPDATE teams SET teacherId = 5 WHERE name = 'Đội tuyển Lý 12';     -- Trần Văn Lý
UPDATE teams SET teacherId = 6 WHERE name = 'Đội tuyển Lý 11';     -- Phạm Thị Lan
UPDATE teams SET teacherId = 7 WHERE name = 'Đội tuyển Lý 10';     -- Hoàng Văn Nam

-- Hóa
UPDATE teams SET teacherId = 8 WHERE name = 'Đội tuyển Hóa 12';    -- Lê Văn Hóa
UPDATE teams SET teacherId = 9 WHERE name = 'Đội tuyển Hóa 11';    -- Đỗ Thị Mai
UPDATE teams SET teacherId = 10 WHERE name = 'Đội tuyển Hóa 10';   -- Vũ Văn Đức

-- Sinh
UPDATE teams SET teacherId = 11 WHERE name = 'Đội tuyển Sinh 12';  -- Phạm Thị Sinh
UPDATE teams SET teacherId = 12 WHERE name = 'Đội tuyển Sinh 11';  -- Nguyễn Văn Bình
UPDATE teams SET teacherId = 13 WHERE name = 'Đội tuyển Sinh 10';  -- Trần Thị Hoa

-- Văn
UPDATE teams SET teacherId = 14 WHERE name = 'Đội tuyển Văn 12';   -- Hoàng Văn Văn
UPDATE teams SET teacherId = 15 WHERE name = 'Đội tuyển Văn 11';   -- Lê Thị Thảo
UPDATE teams SET teacherId = 16 WHERE name = 'Đội tuyển Văn 10';   -- Đỗ Văn Tùng

-- Anh
UPDATE teams SET teacherId = 17 WHERE name = 'Đội tuyển Anh 12';   -- Đỗ Thị Anh
UPDATE teams SET teacherId = 18 WHERE name = 'Đội tuyển Anh 11';   -- Nguyễn Văn Long
UPDATE teams SET teacherId = 19 WHERE name = 'Đội tuyển Anh 10';   -- Trần Thị Linh

-- Sử
UPDATE teams SET teacherId = 20 WHERE name = 'Đội tuyển Sử 12';    -- Vũ Văn Sử
UPDATE teams SET teacherId = 21 WHERE name = 'Đội tuyển Sử 11';    -- Phạm Thị Nga
UPDATE teams SET teacherId = 22 WHERE name = 'Đội tuyển Sử 10';    -- Lê Văn Quang

-- Địa
UPDATE teams SET teacherId = 23 WHERE name = 'Đội tuyển Địa 12';   -- Bùi Thị Địa
UPDATE teams SET teacherId = 24 WHERE name = 'Đội tuyển Địa 11';   -- Hoàng Văn Hải
UPDATE teams SET teacherId = 25 WHERE name = 'Đội tuyển Địa 10';   -- Nguyễn Thị Thu

-- Tin
UPDATE teams SET teacherId = 26 WHERE name = 'Đội tuyển Tin 12';   -- Ngô Văn Tin
UPDATE teams SET teacherId = 27 WHERE name = 'Đội tuyển Tin 11';   -- Đỗ Thị Lan
UPDATE teams SET teacherId = 28 WHERE name = 'Đội tuyển Tin 10';   -- Trần Văn Dũng

-- 5. Kiểm tra kết quả
SELECT 'THỐNG KÊ CUỐI CÙNG:' as info;

SELECT 'Tổng số users:' as metric, COUNT(*) as value FROM users;
SELECT 'Tổng số teachers:' as metric, COUNT(*) as value FROM teachers;
SELECT 'Tổng số teams:' as metric, COUNT(*) as value FROM teams;
SELECT 'Teams có giáo viên:' as metric, COUNT(*) as value FROM teams WHERE teacherId IS NOT NULL;
SELECT 'Teams chưa có giáo viên:' as metric, COUNT(*) as value FROM teams WHERE teacherId IS NULL;

-- Kiểm tra assignments theo môn
SELECT 'ASSIGNMENTS THEO MÔN:' as info;
SELECT 
    t.subject,
    COUNT(*) as total_teams,
    SUM(CASE WHEN t.teacherId IS NOT NULL THEN 1 ELSE 0 END) as assigned_teams
FROM teams t
GROUP BY t.subject
ORDER BY t.subject;

-- Kiểm tra 2 giáo viên Toán không conflicts
SELECT 'GIÁO VIÊN TOÁN:' as info;
SELECT t.name as team_name, u.name as teacher_name, u.email 
FROM teams t 
LEFT JOIN users u ON t.teacherId = u.id 
WHERE t.subject = 'Toán' 
ORDER BY t.grade;