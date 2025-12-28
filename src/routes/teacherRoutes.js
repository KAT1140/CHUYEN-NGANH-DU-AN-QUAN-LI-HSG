// File: src/routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/teacherController');
const { auth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// Lấy danh sách giáo viên
router.get('/', auth, controller.getAll);

// Lấy danh sách giáo viên có sẵn (chưa có team)
router.get('/available', auth, controller.getAvailable);

// Tạo giáo viên mới (chỉ admin)
router.post('/', auth, requireAdmin, controller.create);

// Cập nhật giáo viên (chỉ admin)
router.put('/:id', auth, requireAdmin, controller.update);

// Xóa giáo viên (chỉ admin)
router.delete('/:id', auth, requireAdmin, controller.delete);

module.exports = router;
