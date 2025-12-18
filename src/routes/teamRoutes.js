// File: src/routes/teamRoutes.js (ĐÃ SỬA VÀ ÁP DỤNG AUTH)

const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamController');

// FIX: Import auth bằng destructuring
const { auth } = require('../middleware/authMiddleware');
const { requireAdmin, requireUser, requireTeacher } = require('../middleware/adminMiddleware');

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