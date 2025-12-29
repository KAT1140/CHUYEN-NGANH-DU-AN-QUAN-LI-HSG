// File: src/routes/teamRoutes.js (ĐÃ SỬA VÀ ÁP DỤNG AUTH)

const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamController');

// FIX: Import auth bằng destructuring
const { auth } = require('../middleware/authMiddleware');
const { requireAdmin, requireUser, requireTeacher } = require('../middleware/adminMiddleware');

// LẤY ROLE CỦA GIÁO VIÊN TRONG ĐỘI (Chỉ giáo viên) - ĐẶT TRƯỚC /:id
router.get('/teacher-role', auth, requireTeacher, controller.getTeacherRole);

// LẤY DANH SÁCH TEAM MÀ GIÁO VIÊN LÀ CHỦ NHIỆM - ĐẶT TRƯỚC /:id
router.get('/teacher-teams', auth, requireTeacher, controller.getTeacherTeams);

// THÊM GIÁO VIÊN VÀO ĐỘI (Admin hoặc Teacher main) - ĐẶT TRƯỚC /:id
router.post('/add-teacher', auth, requireUser, controller.addTeacherToTeam);

// QUẢN LÝ TEAM (Cần đăng nhập)
router.get('/', auth, controller.getAll); 
router.post('/', auth, requireTeacher, controller.create); 
router.get('/:id', auth, controller.getById); 
router.delete('/:id', auth, controller.deleteTeam); // Xóa đội (Admin + Teacher) 

// QUẢN LÝ THÀNH VIÊN (CRUD - Yêu cầu user đã đăng nhập)
router.get('/:teamId/members', auth, requireUser, controller.getMembersByTeam); 
router.post('/:teamId/members', auth, requireUser, controller.createMember); 
router.put('/:teamId/members/:memberId', auth, requireUser, controller.updateMember); 
router.delete('/:teamId/members/:memberId', auth, requireUser, controller.deleteMember); 

module.exports = router;