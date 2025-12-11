// File: src/routes/teamRoutes.js (ĐÃ SỬA LỖI VÀ ÁP DỤNG PHÂN QUYỀN)

const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamController');

// FIX: Import auth và admin bằng destructuring từ authMiddleware
const { auth, admin } = require('../middleware/authMiddleware'); 

// QUẢN LÝ TEAM (Tạo/Sửa/Xóa cần Admin)
router.get('/', auth, controller.getAll); 
router.post('/', auth, admin, controller.create); 
router.get('/:id', auth, controller.getById); 
// Bạn có thể thêm các routes update/delete team (cần controller tương ứng)
// router.put('/:id', auth, admin, controller.update); 
// router.delete('/:id', auth, admin, controller.delete); 

// QUẢN LÝ THÀNH VIÊN (CRUD)
router.get('/:teamId/members', auth, controller.getMembersByTeam); 
router.post('/:teamId/members', auth, admin, controller.createMember); 
router.put('/:teamId/members/:memberId', auth, admin, controller.updateMember); 
router.delete('/:teamId/members/:memberId', auth, admin, controller.deleteMember); 

module.exports = router;