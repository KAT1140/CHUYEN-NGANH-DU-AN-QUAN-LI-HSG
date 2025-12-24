<div align="center">

# 🏆 Hệ thống Quản lý Đội tuyển HSG

### Nền tảng quản lý toàn diện cho Đội tuyển Học sinh Giỏi với UI hiện đại

[![Node.js](https://img.shields.io/badge/Node.js-v22.14.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-5.x-0170FE?style=for-the-badge&logo=ant-design&logoColor=white)](https://ant.design/)

[Tính năng](#-tính-năng) • [Cài đặt nhanh](#-cài-đặt-nhanh) • [Công nghệ](#-công-nghệ-sử-dụng) • [Cấu trúc](#-cấu-trúc-project)

</div>

---

## 📖 Giới thiệu

**Hệ thống Quản lý Đội tuyển HSG** là một ứng dụng web fullstack được xây dựng để hỗ trợ quản lý hiệu quả các hoạt động của Đội tuyển Học sinh Giỏi tại các trường THPT. Hệ thống cung cấp các tính năng toàn diện từ quản lý học sinh, giáo viên, đội tuyển, lịch học, chấm điểm đến thống kê và đánh giá.

### ✨ Điểm nổi bật

- � **DUI hiện đại với Glass Morphism**: Giao diện đẹp mắt với hiệu ứng kính mờ, gradient backgrounds và animations mượt mà
- 🎯 **Dashboard thống kê trực quan**: Hiển thị tổng quan về đội tuyển, học sinh, giáo viên và lịch học tuần
- � **Quản  lý lịch học thông minh**: Calendar view với màu sắc phân biệt, navigation tháng, keyboard shortcuts
- 👥 **Quản lý đa cấp**: Hỗ trợ 3 vai trò (Admin, Giáo viên, Học sinh) với quyền hạn riêng biệt
- 📊 **Thống kê & báo cáo**: Biểu đồ phân tích điểm số, xếp hạng học sinh theo năm học
- 🔐 **Bảo mật cao**: JWT authentication, middleware phân quyền, mã hóa mật khẩu bcrypt
- 📱 **Responsive Design**: Tương thích hoàn hảo trên desktop, tablet và mobile

## � UIh/UX Features

### 🌟 Modern Design System
- **Glass Morphism**: Translucent cards với backdrop blur effects
- **Gradient Backgrounds**: Beautiful color gradients throughout the app
- **Smooth Animations**: Fade-in, slide-in, và hover effects
- **Consistent Typography**: Unified font system và sizing
- **Theme Variables**: Centralized color management với CSS variables

### 📱 Responsive Components
- **AppLayout**: Modern layout với gradient header và glass morphism
- **AppCard**: Flexible card component với multiple variants (default, glass, gradient, stats)
- **Mobile-First**: Optimized cho tất cả screen sizes
- **Touch-Friendly**: Large buttons và touch targets cho mobile users

### 🎯 Enhanced User Experience
- **Intuitive Navigation**: Clear menu structure và breadcrumbs
- **Loading States**: Smooth loading animations và skeleton screens
- **Error Handling**: User-friendly error messages và recovery options
- **Keyboard Shortcuts**: Power user features với keyboard navigation

### 🎓 Phạm vi quản lý
- **3 khối lớp**: 10, 11, 12 (27 đội tuyển tổng cộng)
- **Đầy đủ dữ liệu**: 1 Admin + 27 Giáo viên + 91 Học sinh + 27 Teams
- **Phân quyền chi tiết**: 
  - **Admin**: Toàn quyền quản lý hệ thống
  - **Giáo viên**: Quản lý đội phụ trách, lịch học & điểm số
  - **Học sinh**: Xem lịch học & điểm số cá nhân

## � Tech Stack

### 🎨 Frontend Development

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/REACT-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/VITE-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Ant Design](https://img.shields.io/badge/ANT_DESIGN-0170FE?style=for-the-badge&logo=ant-design&logoColor=white)

### ⚙️ Backend Development

![Node.js](https://img.shields.io/badge/NODE.JS-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/EXPRESS-000000?style=for-the-badge&logo=express&logoColor=white)
![Sequelize](https://img.shields.io/badge/SEQUELIZE-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)

### 🗄️ Database

![MySQL](https://img.shields.io/badge/MYSQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

### 🛠️ Other Tools

![Day.js](https://img.shields.io/badge/DAY.JS-FF5F4C?style=for-the-badge)
![bcrypt](https://img.shields.io/badge/BCRYPT-CA0000?style=for-the-badge)
![Nodemon](https://img.shields.io/badge/NODEMON-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)

### Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▶│   Teacher   │     │   Student   │
│  (3 roles)  │     │(specialization)│   │(grade,team) │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │    Team     │◀────│  TeamMember │
                    │(subject,gr) │     │  (linkage)  │
                    └──────┬──────┘     └─────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Schedule   │     │    Score    │     │ Evaluation  │
│(subject,dt) │     │(score,max=10)│     │(rating 1-10)│
└─────────────┘     └─────────────┘     └─────────────┘
```

## 🎯 Tính năng

### 🏠 Dashboard & Thống kê
- ✅ 4 thẻ thống kê: Tổng đội, Tổng học sinh, Tổng giáo viên, Lịch tuần
- ✅ Biểu đồ phân tích điểm trung bình theo môn
- ✅ Bảng xếp hạng học sinh xuất sắc
- ✅ So sánh hiệu suất giữa các đội

### 📅 Quản lý Lịch học
- ✅ Navigation tháng với nút Previous/Next/Today
- ✅ Thêm/sửa/xóa lịch học với date picker
- ✅ Giáo viên: Quản lý lịch môn giảng dạy
- ✅ Học sinh: Xem lịch học môn của đội
- ✅ Hiển thị số lượng sự kiện mỗi tháng

### 👨‍🏫 Quản lý Giáo viên
- ✅ CRUD đầy đủ cho giáo viên (Admin only)
- ✅ Hiển thị môn dạy với color-coded tags
- ✅ Cột "Đội phụ trách" với thông tin team
- ✅ Chuyên môn chi tiết (VD: "Đại số, Hình học, Giải tích")
- ✅ Tổ môn và thông tin liên hệ
- ✅ Tự động tạo User account khi thêm giáo viên

### 👨‍🎓 Quản lý Học sinh & Đội
- ✅ CRUD đầy đủ cho học sinh
- ✅ Phân đội theo môn và khối (10/11/12)
- ✅ Liên kết với tài khoản User
- ✅ 27 đội tuyển (9 môn × 3 khối)
- ✅ Mỗi đội có giáo viên phụ trách và học sinh

### 🎯 Quản lý Điểm số
- ✅ Thêm/sửa/xóa điểm thi cho học sinh
- ✅ Tìm kiếm theo: Học sinh, Đội, Tên bài thi
- ✅ Ghi chú chi tiết cho từng điểm
- ✅ Lưu ngày thi và metadata

### ⭐ Đánh giá & Nhận xét
- ✅ Đánh giá học sinh theo tiêu chí
- ✅ Ghi chú chi tiết và lịch sử
- ✅ Lưu trữ đánh giá theo thời gian

## � Cài đặt nhanh

### ⚡ Setup một lệnh (Khuyến nghị)

```bash
# Clone project
git clone <repository-url>
cd hsg-management-backend

# Cài đặt dependencies
npm install
cd client && npm install && cd ..

# Setup database và dữ liệu mẫu
node scripts/fullSetup.js        # Setup toàn bộ hệ thống

# Khởi động servers
npm start                        # Backend: http://localhost:8080
cd client && npm run dev         # Frontend: http://localhost:5173
```

### 🔑 Tài khoản mặc định

```
Admin: namvokat@gmail.com / 123456
Giáo viên: gv.toan1@hsg.edu.vn / 123456  
Học sinh: hs1011_0@hsg.edu.vn / 123456
```

### 📋 Cài đặt chi tiết

#### 1. Yêu cầu hệ thống
- Node.js 18+ 
- MySQL 8.0+ hoặc MariaDB
- XAMPP (khuyến nghị cho Windows)

#### 2. Cấu hình Database
```powershell
# Tạo database trong phpMyAdmin
CREATE DATABASE `hsg-db`;

# Cập nhật .env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=hsg-db
DB_USER=root
DB_PASS=
```

#### 3. Backend Setup
```bash
npm install
npm start                       # Production
npm run dev                     # Development với nodemon
```

#### 4. Frontend Setup
```bash
cd client
npm install
npm run dev                     # Development
npm run build                   # Production build
```

### 🎯 Scripts hữu ích

```bash
# Essential Scripts (Chỉ còn 4 scripts cần thiết)
node scripts/fullSetup.js           # Setup toàn bộ hệ thống
node scripts/quickSetupAll.sql      # Setup nhanh database bằng SQL
node scripts/resetAllPasswords.js   # Reset mật khẩu tất cả user
node scripts/systemOverview.js      # Xem tổng quan hệ thống
```

## 📁 Cấu trúc Project

```
hsg-management-backend/
├── 📄 package.json              # Backend dependencies
├── 📄 server.js                 # Main server file
├── 📄 .env                      # Environment variables
├── 📄 README.md                 # Documentation
│
├── 📁 src/                      # Backend source code
│   ├── 📁 config/
│   │   └── database.js          # Database configuration
│   │
│   ├── 📁 models/               # Sequelize models
│   │   ├── User.js              # User authentication
│   │   ├── Teacher.js           # Teacher information
│   │   ├── Student.js           # Student information
│   │   ├── Team.js              # Team management
│   │   ├── Schedule.js          # Schedule management
│   │   ├── Score.js             # Score tracking
│   │   ├── Evaluation.js        # Student evaluations
│   │   └── associations.js      # Model relationships
│   │
│   ├── 📁 controllers/          # Business logic
│   │   ├── authController.js    # Authentication logic
│   │   ├── teacherController.js # Teacher management
│   │   ├── studentController.js # Student management
│   │   ├── teamController.js    # Team management
│   │   ├── scheduleController.js# Schedule management
│   │   ├── scoreController.js   # Score management
│   │   ├── evaluationController.js # Evaluation management
│   │   └── statisticsController.js # Statistics & reports
│   │
│   ├── 📁 routes/               # API endpoints
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── teacherRoutes.js     # Teacher CRUD routes
│   │   ├── studentRoutes.js     # Student CRUD routes
│   │   ├── teamRoutes.js        # Team CRUD routes
│   │   ├── scheduleRoutes.js    # Schedule CRUD routes
│   │   ├── scoreRoutes.js       # Score CRUD routes
│   │   ├── evaluationRoutes.js  # Evaluation CRUD routes
│   │   └── statisticsRoutes.js  # Statistics routes
│   │
│   └── 📁 middleware/           # Express middleware
│       ├── authMiddleware.js    # JWT authentication
│       └── adminMiddleware.js   # Admin authorization
│
├── 📁 scripts/                  # Essential scripts only (4 files)
│   ├── fullSetup.js             # Complete system setup
│   ├── quickSetupAll.sql        # Quick database setup
│   ├── resetAllPasswords.js     # Password reset utility
│   └── systemOverview.js        # System overview tool
│
└── 📁 client/                   # Frontend React app
    ├── 📄 package.json          # Frontend dependencies
    ├── 📄 vite.config.js        # Vite configuration
    ├── 📄 index.html            # HTML template
    │
    └── 📁 src/
        ├── 📄 main.jsx          # App entry point
        ├── 📄 App.jsx           # Root component
        ├── 📄 MainContent.jsx   # Main layout component
        │
        ├── 📁 pages/            # Page components
        │   ├── LoginPage.jsx    # Login page
        │   ├── dangki.jsx       # Registration page
        │   ├── Home.jsx         # Dashboard home
        │   ├── Schedule.jsx     # Schedule management
        │   ├── Teams.jsx        # Team management
        │   ├── TeachersPage.jsx # Teacher management
        │   ├── Students.jsx     # Student management
        │   ├── Scores.jsx       # Score management
        │   ├── Evaluations.jsx  # Evaluation management
        │   └── Statistics.jsx   # Statistics & reports
        │
        ├── 📁 components/       # Reusable UI components
        │   ├── 📁 Layout/       # Layout components
        │   │   ├── AppLayout.jsx    # Main app layout
        │   │   └── AppLayout.css    # Layout styles
        │   │
        │   └── 📁 UI/           # UI components
        │       ├── AppCard.jsx      # Card component
        │       └── AppCard.css      # Card styles
        │
        ├── 📁 utils/            # Utility functions
        │   ├── api.js           # API client
        │   └── auth.js          # Authentication utilities
        │
        └── 📁 styles/           # Global styles
            ├── GlobalTheme.css  # Global theme system
            ├── Dashboard.css    # Dashboard styles
            ├── MainContent.css  # Main content styles
            └── Home.css         # Home page styles
```

### 🎨 UI Architecture

```
📁 UI System/
├── 🎨 GlobalTheme.css           # CSS variables, utilities, animations
├── 🏗️ AppLayout.jsx            # Main layout với gradient header
├── 🃏 AppCard.jsx              # Flexible card component
│   ├── Variants: default, glass, gradient, stats
│   ├── Sizes: small, default, large
│   └── Features: hover effects, loading states
└── 📱 Responsive Design         # Mobile-first approach
```

## �‍💻 Developer

Phát triển bởi Nam Vo  
Email: namvokat@gmail.com

## 🎮 Hướng dẫn sử dụng

### 🔐 Đăng nhập
1. Truy cập http://localhost:5173
2. Đăng nhập với tài khoản admin: `namvokat@gmail.com` / `123456`

### 👨‍🏫 Quản lý Giáo viên
- **Xem danh sách**: Trang Teachers hiển thị 27 giáo viên với đầy đủ thông tin
- **Cột "Đội phụ trách"**: Mỗi giáo viên được gán 1 team cụ thể
- **Filter theo môn**: Dropdown lọc giáo viên theo 9 môn học
- **Thêm giáo viên**: Admin có thể thêm giáo viên mới (tự động tạo User account)

### 👨‍🎓 Quản lý Học sinh
- **91 học sinh**: 81 có team (3/team) + 10 chưa có team
- **Thông tin đầy đủ**: Tên, lớp, team, thông tin liên hệ
- **Liên kết User**: Mỗi học sinh có tài khoản đăng nhập riêng
- **Flexible assignment**: Có thể gán học sinh vào team bất kỳ lúc nào

### 📅 Lịch học
- **Navigation tháng**: Nút Previous/Next/Today
- **Keyboard shortcuts**: Arrow keys, Home key
- **Color-coding**: Mỗi môn có màu riêng biệt
- **Event counter**: Hiển thị số sự kiện mỗi tháng

### 📊 Thống kê
- **Dashboard**: 4 cards thống kê tổng quan
- **Biểu đồ**: Phân tích điểm số theo môn
- **Xếp hạng**: Top học sinh xuất sắc

### 🔧 Troubleshooting

### Database Connection Issues
```bash
# Kiểm tra MySQL service trong XAMPP
# Đảm bảo port 3306 không bị conflict
# Chạy lại setup database
node scripts/fullSetup.js
```

### Frontend Build Issues
```bash
# Clear cache và reinstall
rm -rf client/node_modules client/dist
cd client && npm install && npm run build
```

### Missing Data Issues
```bash
# Chạy script kiểm tra và setup lại
node scripts/systemOverview.js
node scripts/fullSetup.js
```

## 📈 Roadmap

### 🎨 UI/UX Improvements
- [x] **Modern Glass Morphism Design** - Completed ✅
- [x] **Responsive Layout System** - Completed ✅
- [x] **Consistent Theme Variables** - Completed ✅
- [ ] **Dark Mode Support** - Coming soon 🌙
- [ ] **Advanced Animations** - Micro-interactions và page transitions

### 🚀 Technical Enhancements
- [ ] **Mobile App**: React Native version
- [ ] **Real-time notifications**: Socket.io integration  
- [ ] **File upload**: Tài liệu, hình ảnh học sinh
- [ ] **Export/Import**: Excel, PDF reports
- [ ] **Advanced analytics**: Machine learning insights
- [ ] **Multi-school support**: Quản lý nhiều trường
- [ ] **PWA Support**: Progressive Web App features

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔌 API
 
- **Base URL:** http://localhost:8080/api
- **Xác thực:** Yêu cầu JWT Bearer token cho các endpoint được bảo vệ (gửi header `Authorization: Bearer <token>`).

- **Endpoints (tóm tắt):**
  - `POST /api/auth/login` — Đăng nhập, body: `{ email, password }` → trả về `{ token }`.
  - `POST /api/auth/register` — (Nếu bật) tạo tài khoản người dùng.

  - `GET /api/students` — Lấy danh sách học sinh (query: `?team=`, `?grade=`).
  - `POST /api/students` — Tạo học sinh (admin/teacher).
  - `GET /api/students/:id` — Lấy thông tin học sinh theo id.
  - `PUT /api/students/:id` — Cập nhật học sinh.
  - `DELETE /api/students/:id` — Xóa học sinh.

  - `GET /api/teachers` — Lấy danh sách giáo viên.
  - `POST /api/teachers` — Tạo giáo viên.
  - `GET /api/teachers/:id` — Lấy thông tin giáo viên.
  - `PUT /api/teachers/:id` — Cập nhật giáo viên.
  - `DELETE /api/teachers/:id` — Xóa giáo viên.

  - `GET /api/teams` — Lấy danh sách đội.
  - `POST /api/teams` — Tạo đội.
  - `GET /api/teams/:id` — Lấy thông tin đội.
  - `PUT /api/teams/:id` — Cập nhật đội.
  - `DELETE /api/teams/:id` — Xóa đội.

  - `GET /api/schedules` — Lấy lịch học (lọc theo team/teacher/date).
  - `POST /api/schedules` — Tạo lịch học.
  - `PUT /api/schedules/:id` — Cập nhật lịch học.
  - `DELETE /api/schedules/:id` — Xóa lịch học.

  - `GET /api/scores` — Lấy danh sách điểm (lọc theo học sinh/team).
  - `POST /api/scores` — Tạo bản ghi điểm.
  - `PUT /api/scores/:id` — Cập nhật điểm.
  - `DELETE /api/scores/:id` — Xóa điểm.

  - `GET /api/evaluations` — Lấy đánh giá.
  - `POST /api/evaluations` — Tạo đánh giá.

  - `GET /api/statistics` — Lấy báo cáo tổng hợp và dữ liệu thống kê.

- **Ví dụ nhanh:**

  1) Đăng nhập lấy token

  ```bash
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"namvokat@gmail.com","password":"123456"}'
  ```

  Phản hồi: `{ "token": "<JWT_TOKEN>" }`

  2) Lấy danh sách học sinh (cần xác thực)

  ```bash
  curl http://localhost:8080/api/students \
    -H "Authorization: Bearer <JWT_TOKEN>"
  ```

Để xem chi tiết request/response, xem các route trong `src/routes` và các controller trong `src/controllers`.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact & Support

**Developer**: Nam Vo  
**Email**: namvokat@gmail.com  
**Project Link**: [GitHub Repository](https://github.com/namvokat/hsg-management)

---

<div align="center">

**⭐ Nếu project hữu ích, hãy cho một star! ⭐**

**🎨 Featuring Modern Glass Morphism UI Design**

Made with ❤️ by Nam Vo

</div>