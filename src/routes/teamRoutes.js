// File: src/routes/teamRoutes.js (LOẠI BỎ HOÀN TOÀN AUTH/ADMIN)

const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamController');

// Xóa: const { auth, admin } = require('../middleware/authMiddleware');

// QUẢN LÝ TEAM (KHÔNG CẦN ĐĂNG NHẬP)
router.get('/', controller.getAll); 
router.post('/', controller.create); 
router.get('/:id', controller.getById); 

// QUẢN LÝ THÀNH VIÊN (CRUD - KHÔNG CẦN ĐĂNG NHẬP)
router.get('/:teamId/members', controller.getMembersByTeam); 
router.post('/:teamId/members', controller.createMember); 
router.put('/:teamId/members/:memberId', controller.updateMember); 
router.delete('/:teamId/members/:memberId', controller.deleteMember); 

module.exports = router;