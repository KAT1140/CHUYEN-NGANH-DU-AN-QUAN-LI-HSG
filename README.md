<div align="center">

# 🏆 Hệ thống Quản lý Đội tuyển HSG

### Nền tảng quản lý toàn diện cho Đội tuyển Học sinh Giỏi

[![Node.js](https://img.shields.io/badge/Node.js-v22.14.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-5.x-0170FE?style=for-the-badge&logo=ant-design&logoColor=white)](https://ant.design/)

[Tính năng](#-tính-năng) • [Cài đặt](#-cài-đặt--chạy) • [Công nghệ](#-công-nghệ-sử-dụng) • [Cấu trúc](#-cấu-trúc-project)

</div>

---

## 📖 Giới thiệu

**Hệ thống Quản lý Đội tuyển HSG** là một ứng dụng web fullstack được xây dựng để hỗ trợ quản lý hiệu quả các hoạt động của Đội tuyển Học sinh Giỏi tại các trường THPT. Hệ thống cung cấp các tính năng toàn diện từ quản lý học sinh, đội tuyển, lịch học, chấm điểm đến thống kê và đánh giá.

### ✨ Điểm nổi bật

- 🎯 **Dashboard thống kê trực quan**: Hiển thị tổng quan về đội tuyển, học sinh, lịch học tuần và đếm ngược kỳ thi HSG
- 📅 **Quản lý lịch học thông minh**: Calendar view với color-coding theo môn học, phân quyền xem/thêm lịch theo vai trò
- 👥 **Quản lý đa cấp**: Hỗ trợ 3 vai trò (Admin, Giáo viên, Học sinh) với quyền hạn riêng biệt
- 🎨 **Giao diện hiện đại**: UI responsive với Ant Design, gradient backgrounds và animations mượt mà
- 📊 **Thống kê & báo cáo**: Biểu đồ phân tích điểm số, xếp hạng học sinh theo năm học
- 🔐 **Bảo mật cao**: JWT authentication, middleware phân quyền, mã hóa mật khẩu

### 🎓 Phạm vi quản lý

- **8 môn học**: Toán, Lý, Hóa, Sinh, Văn, Anh, Địa, Lịch sử
- **3 khối lớp**: 10, 11, 12
- **Phân quyền chi tiết**: 
  - **Admin**: Toàn quyền quản lý hệ thống
  - **Giáo viên**: Quản lý lịch học & điểm số môn giảng dạy
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
│  (3 roles)  │     │  (subject)  │     │ (year,team) │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                    ┌─────────────┐            │
                    │    Team     │◀───────────┘
                    │(subject,gr) │
                    └──────┬──────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Schedule   │     │    Score    │     │ Evaluation  │
│(subject,dt) │     │(score,max=10)│     │  (rating)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 🎯 Tính năng

### 🏠 Dashboard & Thống kê
- ✅ 4 thẻ thống kê: Tổng đội, Tổng học sinh, Lịch tuần, Đếm ngược kỳ thi
- ✅ Biểu đồ phân tích điểm trung bình theo môn
- ✅ Bảng xếp hạng học sinh xuất sắc
- ✅ So sánh hiệu suất giữa các đội

### 📅 Quản lý Lịch học
- ✅ Calendar view với màu sắc phân biệt 8 môn học
- ✅ Thêm/sửa/xóa lịch học với date picker
- ✅ Giáo viên: Quản lý lịch môn giảng dạy (subject auto-fill)
- ✅ Học sinh: Xem lịch học môn của đội
- ✅ Hiển thị tối đa 2 lịch/ngày, có indicator "+X lịch"
- ✅ Hover effects và gradient card design

### 🎯 Quản lý Điểm số
- ✅ Thêm/sửa/xóa điểm thi cho học sinh
- ✅ Hệ thống điểm 10 (0-10, step 0.1)
- ✅ Tìm kiếm theo: Học sinh, Đội, Tên bài thi
- ✅ Ghi chú chi tiết cho từng điểm
- ✅ Lưu ngày thi và metadata

### 👥 Quản lý Học sinh & Đội
- ✅ CRUD đầy đủ cho học sinh
- ✅ Phân đội theo môn và khối (10/11/12)
- ✅ Liên kết với tài khoản User
- ✅ Theo dõi năm học hiện tại/đã tốt nghiệp
- ✅ 24 đội tuyển (8 môn × 3 khối)

### ⭐ Đánh giá & Nhận xét
- ✅ Đánh giá học sinh theo tiêu chí
- ✅ Ghi chú chi tiết và lịch sử
- ✅ Lưu trữ đánh giá theo thời gian

## 📦 Cài đặt & Chạy

### 1. Backend

```powershell
cd d:\xamp\htdocs\hsg-management-backend
npm install
```

**Cấu hình database:**
- Copy `.env.example` thành `.env`
- Cập nhật thông tin MySQL trong `.env`

**Khởi tạo database:**
```powershell
node scripts/seedAdmin.js
node scripts/seedTeachers.js
node scripts/seedTeams.js
node scripts/seedStudents.js
node scripts/seedSchedules.js
```

**Chạy server:**
```powershell
npm start                       # Production
npm run dev                     # Development với nodemon
```

Backend: `http://localhost:8080`

### 2. Frontend

```powershell
cd d:\xamp\htdocs\hsg-management-backend\client
npm install
npm run dev                     # Development
npm run build                   # Production build
```

Frontend: `http://localhost:5173`

## 📁 Cấu trúc Project

## 📁 Cấu trúc Project

```
hsg-management-backend/
├── package.json
├── server.js
├── .env
├── README.md
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Teacher.js
│   │   ├── Student.js
│   │   ├── Team.js
│   │   ├── Schedule.js
│   │   ├── Score.js
│   │   └── Evaluation.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── teamController.js
│   │   ├── scheduleController.js
│   │   ├── scoreController.js
│   │   ├── evaluationController.js
│   │   └── statisticsController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── scheduleRoutes.js
│   │   ├── scoreRoutes.js
│   │   ├── evaluationRoutes.js
│   │   └── statisticsRoutes.js
│   │
│   └── middleware/
│       ├── authMiddleware.js
│       └── adminMiddleware.js
│
├── scripts/
│   ├── seedAdmin.js
│   ├── seedTeachers.js
│   ├── seedTeams.js
│   ├── seedStudents.js
│   ├── seedSchedules.js
│   ├── resetPass.js
│   └── dropDB.js
│
└── client/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    │
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── MainContent.jsx
    │   │
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── Home.jsx
    │   │   ├── Schedule.jsx
    │   │   ├── Students.jsx
    │   │   ├── Teams.jsx
    │   │   ├── Scores.jsx
    │   │   ├── Evaluations.jsx
    │   │   ├── Statistics.jsx
    │   │   └── dangki.jsx
    │   │
    │   ├── components/
    │   │
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── auth.js
    │   │
    │   └── styles/
    │       ├── App.css
    │       ├── Home.css
    │       ├── Dashboard.css
    │       ├── LoginPage.css
    │       ├── Students.css
    │       ├── Teams.css
    │       └── Scores.css
    │
    └── dist/
        ├── index.html
        └── assets/
            ├── index-*.js
            └── index-*.css
```

## �‍💻 Developer

Phát triển bởi Nam Vo  
Email: namvokat@gmail.com
