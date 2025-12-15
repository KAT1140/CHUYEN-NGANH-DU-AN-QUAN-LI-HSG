// File: src/routes/teamRoutes.js (ĐÃ SỬA VÀ ÁP DỤNG AUTH)

const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamController');

// FIX: Import auth bằng destructuring
const { auth } = require('../middleware/authMiddleware'); 

// QUẢN LÝ TEAM (Cần đăng nhập)
router.get('/', auth, controller.getAll); 
router.post('/', auth, controller.create); 
router.get('/:id', auth, controller.getById); 
// Thêm routes Update/Delete Team
// router.put('/:id', auth, controller.update); 
// router.delete('/:id', auth, controller.delete); 

// QUẢN LÝ THÀNH VIÊN (CRUD - Cần đăng nhập)
router.get('/:teamId/members', auth, controller.getMembersByTeam); 
router.post('/:teamId/members', auth, controller.createMember); 
router.put('/:teamId/members/:memberId', auth, controller.updateMember); 
router.delete('/:teamId/members/:memberId', auth, controller.deleteMember); 

module.exports = router;