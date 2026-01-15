<div align="center">

#  Hệ thống Quản lý Đội tuyển HSG

###  Nền tảng quản lý toàn diện cho Đội tuyển Học sinh Giỏi với UI hiện đại

[![Node.js](https://img.shields.io/badge/Node.js-v22.14.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-5.x-0170FE?style=for-the-badge&logo=ant-design&logoColor=white)](https://ant.design/)

[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

[ Tính năng](#-tính-năng-chính)  [ Cài đặt](#-cài-đặt-nhanh)  [ Tech Stack](#-tech-stack)  [ Cấu trúc](#-cấu-trúc-project)

</div>

---

##  Giới thiệu

> **Hệ thống Quản lý Đội tuyển HSG** là một ứng dụng web fullstack được xây dựng để hỗ trợ quản lý hiệu quả các hoạt động của Đội tuyển Học sinh Giỏi tại các trường THPT. 

 Hệ thống cung cấp các tính năng toàn diện từ quản lý học sinh, giáo viên, đội tuyển, lịch học, chấm điểm đến thống kê và đánh giá - tất cả trong một nền tảng hiện đại với **Glass Morphism UI** và **Dark Mode** tuyệt đẹp.

<br>

##  Điểm nổi bật

<table>
<tr>
<td width="50%">

###  **UI/UX Hiện đại**
-  Glass Morphism với backdrop blur
-  Dark/Light mode với "Midnight Blue" theme
-  Smooth animations & transitions
-  Responsive design cho mọi thiết bị
-  Keyboard shortcuts (Ctrl+Shift+T)

</td>
<td width="50%">

###  **Tính năng mạnh mẽ**
-  Dashboard với real-time statistics
-  Countdown kỳ thi HSG (15/04/2026)
-  1,800 buổi học tự động tạo sẵn
-  246 học sinh & giáo viên chuẩn hóa
-  JWT authentication & phân quyền

</td>
</tr>
</table>

<br>

##  UI/UX Features

###  Modern Design System

<table>
<tr>
<td width="33%" align="center">

####  Glass Morphism
Translucent cards với<br>backdrop blur effects

</td>
<td width="33%" align="center">

####  Gradient Backgrounds
Beautiful color gradients<br>throughout the app

</td>
<td width="33%" align="center">

####  Dark Mode
Complete theme switching<br>"Midnight Blue" palette

</td>
</tr>
</table>

** Design Highlights:**
-  **Theme Toggle** - Keyboard shortcut (Ctrl+Shift+T)
-  **Smooth Animations** - Fade-in, slide-in, hover effects
-  **Consistent Typography** - Unified font system
-  **Theme Variables** - Centralized color management
-  **Accessibility** - WCAG compliant với proper contrast ratios

<details>
<summary><b> Midnight Blue Theme Details</b></summary>

<br>

```css
/* Primary Colors */
--primary: #3b82f6
--primary-light: #60a5fa
--primary-dark: #2563eb

/* Background Gradients */
--bg-dark: #0f172a  #1e293b  #334155

/* Typography */
--text-light: #f8fafc
--text-dark: #1e293b
```

**Features:**
- Glass Effects: Enhanced translucency với backdrop blur
- Hover Animations: Smooth transforms và glow effects
- Calendar Header: Redesigned với gradient backgrounds
- Perfect Contrast: All text meets WCAG AAA standards

</details>

<br>

###  Phạm vi quản lý

<table>
<tr>
<td width="50%">

####  **9 Đội tuyển theo môn**
```
 Toán  |   Lý   |   Hóa
 Sinh  |   Văn  |   Anh
 Địa   |   Sử   |   Tin
```

</td>
<td width="50%">

####  **Phân quyền chi tiết**
-  **Admin** - Toàn quyền quản lý hệ thống
-  **Giáo viên** - Quản lý đội & môn phụ trách
-  **Học sinh** - Xem lịch học & điểm số

</td>
</tr>
</table>

** Dữ liệu:**
-  Đa khối trong một đội (10-12)
-  246 học sinh với tên chuẩn hóa
-  Dữ liệu HSG 2021-2025
-  Hiển thị đội với khối (VD: Đội tuyển Địa (10-12))

<br>

##  Tech Stack

<div align="center">

### Frontend Development
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/REACT-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/VITE-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Ant Design](https://img.shields.io/badge/ANT_DESIGN-0170FE?style=for-the-badge&logo=ant-design&logoColor=white)

### Backend Development
![Node.js](https://img.shields.io/badge/NODE.JS-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/EXPRESS-000000?style=for-the-badge&logo=express&logoColor=white)
![Sequelize](https://img.shields.io/badge/SEQUELIZE-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)

### Database & Tools
![MySQL](https://img.shields.io/badge/MYSQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Day.js](https://img.shields.io/badge/DAY.JS-FF5F4C?style=for-the-badge)
![bcrypt](https://img.shields.io/badge/BCRYPT-CA0000?style=for-the-badge)

</div>

<br>

##  Tính năng chính

###  Dashboard & Thống kê

<table>
<tr>
<td width="50%">

** Dashboard cá nhân hóa**
- 4 thẻ thống kê real-time
-  Countdown kỳ thi (15/04/2026)
-  Biểu đồ phân tích điểm số
-  Bảng xếp hạng học sinh

</td>
<td width="50%">

** Thống kê nâng cao**
- So sánh hiệu suất giữa các đội
- Phân tích điểm trung bình theo môn
- Lịch sử điểm HSG 2021-2025
- Export báo cáo PDF/Excel

</td>
</tr>
</table>

###  Chất lượng dữ liệu

```diff
 246 học sinh chuẩn hóa - Tên tiếng Việt đúng chuẩn, không trùng lặp
 246 đánh giá hoàn thiện - Dấu câu đầy đủ, ngữ pháp chuẩn
 1,800 buổi học thông minh - Tự động tạo cho năm 2026 (15/01 - 08/04)
 Countdown kỳ thi - Dashboard hiển thị số ngày còn lại (15/04/2026)
 Không ký tự lạ - Đã xóa tất cả ký tự tiếng Trung/Hàn
 Dữ liệu nhất quán - Đồng bộ giữa User, Student, Teacher, Team
```

###  Quản lý Lịch học

** Tính năng lịch học:**
-  **Tạo lịch tự động** - Script `seedScheduleWithBreaks.js` tạo 1,800 buổi học
-  **Lịch thông minh** - Từ 15/01/2026 đến 08/04/2026 (trước thi 1 tuần)
-  **Phân nhóm học** - Nhóm 1 (T2-T4-T6-CN), Nhóm 2 (T3-T5-T7-CN)
-  **Có buổi nghỉ** - Học 2-3 buổi rồi nghỉ 1 ngày
-  **Mô tả chi tiết** - Mỗi buổi có mục tiêu và nội dung cụ thể
-  **Navigation** - Previous/Next/Today với màu sắc phân biệt
-  **Phân quyền** - Giáo viên quản lý môn dạy, Học sinh xem lịch đội

###  Quản lý Giáo viên

<table>
<tr>
<td width="50%">

** Tính năng chính**
- CRUD đầy đủ (Admin only)
- Hệ thống đa giáo viên cho mỗi đội
- Phân quyền: Trưởng nhóm & Đồng giảng dạy
- Hiển thị đội với khối (VD: Đội Địa (10-12))

</td>
<td width="50%">

** Chi tiết**
- Form edit với dropdown chọn team
- Gán team thông minh
- Color-coded tags theo môn
- Tự động tạo User account

</td>
</tr>
</table>

###  Quản lý Học sinh & Đội

** Quản lý học sinh:**
-  CRUD đầy đủ với thông tin chi tiết (Mã số, tên, khối, lớp, đội)
-  **Filter nâng cao** - Lọc theo khối (10/11/12) và loại lớp (A/T)
-  Đa khối trong một đội - Học sinh khối 10-12 cùng đội tuyển
-  Liên kết với User account tự động
-  Hiển thị đội tuyển và giáo viên phụ trách

###  Quản lý Điểm số

** Tính năng chấm điểm:**
-  Thêm/sửa/xóa điểm thi cho học sinh
-  **Filter nâng cao** - Loại kỳ thi, năm, khối, môn học
-  **Hiển thị giải thưởng** - Giải Nhất, Nhì, Ba, Khuyến khích
-  **Dữ liệu đa năm** - Điểm HSG 2021-2025
-  **Phân quyền xem** - Học sinh chỉ xem điểm cá nhân
-  Tìm kiếm theo học sinh, đội, tên bài thi
-  Lưu ngày thi và metadata

###  Đánh giá & Nhận xét

** Hệ thống đánh giá:**
-  Đánh giá học sinh theo tiêu chí chi tiết
-  **Liên kết team-teacher** - Đánh giá bởi giáo viên của team
-  **Phân quyền** - Giáo viên đánh giá học sinh trong đội mình
-  **Quyền xem** - Học sinh chỉ xem đánh giá bản thân
-  Ghi chú chi tiết và lịch sử theo thời gian

<br>

##  Cài đặt nhanh

###  Yêu cầu hệ thống

```bash
Node.js: >= 22.x
MySQL: >= 8.0
npm: >= 10.x
```

###  Setup một lệnh (Khuyến nghị)

```bash
# 1. Clone project
git clone <repository-url>
cd hsg-management-backend

# 2. Cài đặt dependencies cho cả backend và frontend
npm install && cd client && npm install && cd ..

# 3. Tạo file .env
cp .env.example .env

# 4. Cấu hình database trong .env
# Sửa DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

# 5. Khởi tạo database với dữ liệu mẫu
node scripts/initDatabase.js

# 6. Tạo lịch học đầy đủ (1,800 buổi)
node scripts/seedScheduleWithBreaks.js

# 7. Chạy cả backend & frontend
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd client && npm run dev
```

###  File .env mẫu

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hsg-management-db

# Server Configuration
PORT=8080

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=24h

# Environment
NODE_ENV=development
```

###  Tài khoản mặc định

```bash
 Admin:       admin@hsg.edu.vn / 123456
 Giáo viên:  teacher.math@hsg.edu.vn / 123456
 Học sinh:    student.an@hsg.edu.vn / 123456
```

<br>

##  Cấu trúc Project

```
hsg-management-backend/
  client/                    # Frontend React + Vite
    src/
       components/          # UI Components
          Layout/         # AppLayout với Glass Morphism
          UI/             # AppCard, ThemeToggle
       contexts/           # ThemeContext for Dark Mode
       pages/              # All application pages
       styles/             # Global styles & themes
       utils/              # API & Auth utilities
    package.json
    vite.config.js

  src/                       # Backend Express + Sequelize
    config/                 # Database configuration
    controllers/            # Route controllers
    middleware/             # Auth & Admin middleware
    models/                 # Sequelize models
    routes/                 # API routes

  scripts/                   # Database scripts
    initDatabase.js        # Khởi tạo DB từ đầu
    seedScheduleWithBreaks.js  # Tạo 1,800 lịch học
    seedEvaluations.js     # Tạo đánh giá mẫu
    fullSetup.js           # Setup đầy đủ một lệnh
    testConnection.js      # Test kết nối DB

 .env                        # Environment variables
 .gitignore
 package.json
 README.md
 server.js                   # Main server file
```

<br>

##  Scripts hữu ích

```bash
# Backend
npm start              # Chạy server (production)
npm run dev            # Chạy server với nodemon (development)

# Frontend
cd client && npm run dev        # Chạy frontend dev server
cd client && npm run build      # Build frontend cho production

# Database
node scripts/initDatabase.js                # Khởi tạo DB từ đầu
node scripts/seedScheduleWithBreaks.js     # Tạo lịch học
node scripts/seedEvaluations.js            # Tạo đánh giá mẫu
node scripts/fullSetup.js                  # Setup đầy đủ (init + seed)
node checkDatabase.js                      # Kiểm tra số lượng records
```

<br>

##  API Documentation

###  Authentication

```http
POST   /api/auth/login          # Đăng nhập
POST   /api/auth/register       # Đăng ký
GET    /api/auth/me             # Lấy thông tin user hiện tại
```

###  Users & Roles

```http
GET    /api/teachers            # Lấy danh sách giáo viên
POST   /api/teachers            # Tạo giáo viên mới (Admin)
PUT    /api/teachers/:id        # Cập nhật giáo viên (Admin)
DELETE /api/teachers/:id        # Xóa giáo viên (Admin)

GET    /api/students            # Lấy danh sách học sinh
POST   /api/students            # Tạo học sinh mới
PUT    /api/students/:id        # Cập nhật học sinh
DELETE /api/students/:id        # Xóa học sinh
```

###  Teams & Schedules

```http
GET    /api/teams               # Lấy danh sách đội tuyển
GET    /api/teams/:id           # Chi tiết một đội

GET    /api/schedules           # Lấy lịch học (có filter)
POST   /api/schedules           # Tạo lịch mới
PUT    /api/schedules/:id       # Cập nhật lịch
DELETE /api/schedules/:id       # Xóa lịch
```

###  Scores & Evaluations

```http
GET    /api/scores              # Lấy danh sách điểm (có filter)
POST   /api/scores              # Thêm điểm mới
PUT    /api/scores/:id          # Cập nhật điểm
DELETE /api/scores/:id          # Xóa điểm

GET    /api/evaluations         # Lấy đánh giá
POST   /api/evaluations         # Tạo đánh giá
PUT    /api/evaluations/:id     # Cập nhật đánh giá
DELETE /api/evaluations/:id     # Xóa đánh giá
```

###  Statistics

```http
GET    /api/statistics          # Thống kê tổng quan
GET    /api/statistics/team/:id # Thống kê theo đội
```

<br>

##  Database Schema

```
          
    Users        Teachers           Students   
  (3 roles)         (specialized)       (with team) 
          
                                                
                                                
                          
                         Teams      TeamTeachers 
                      (9 subjects)         (roles)    
                          
                            
        
                                              
          
  Schedules            Scores          Evaluations  
 (1800 items)       (with awards)     (with rating) 
          
```

<br>

##  Contributing

Contributions, issues và feature requests đều được hoan nghênh!

<br>

##  License

This project is [MIT](LICENSE) licensed.

<br>

##  Author

Made with  by HSG Team

<br>

---

<div align="center">

###  Nếu project hữu ích, hãy cho một star nhé! 

[ Back to top](#-hệ-thống-quản-lý-đội-tuyển-hsg)

</div>
