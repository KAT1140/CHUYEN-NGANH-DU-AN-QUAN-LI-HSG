const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamController');

const { auth, admin } = require('../middleware/authMiddleware');


// QUẢN LÝ TEAM
router.get('/', auth, controller.getAll); // Xem: Cần đăng nhập
router.post('/', auth, admin, controller.create); // Tạo: Cần Admin
router.get('/:id', auth, controller.getById); // Xem chi tiết: Cần đăng nhập


// QUẢN LÝ THÀNH VIÊN
router.get('/:teamId/members', auth, controller.getMembersByTeam); // Xem thành viên: Cần đăng nhập
router.post('/:teamId/members', auth, admin, controller.createMember); // Tạo thành viên: Cần Admin
router.put('/:teamId/members/:memberId', auth, admin, controller.updateMember); // Sửa thành viên: Cần Admin
router.delete('/:teamId/members/:memberId', auth, admin, controller.deleteMember); // Xóa thành viên: Cần Admin

module.exports = router;
