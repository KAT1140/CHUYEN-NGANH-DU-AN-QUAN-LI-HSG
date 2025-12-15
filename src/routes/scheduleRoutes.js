// Schedule Routes

const express = require('express');
const router = express.Router();
const controller = require('../controllers/scheduleController');
const { auth } = require('../middleware/authMiddleware');
const { requireUser, requireTeacher } = require('../middleware/adminMiddleware');

// Lấy tất cả lịch
router.get('/', auth, controller.getAll);

// Lấy lịch theo ngày (YYYY-MM-DD)
router.get('/:date', auth, controller.getByDate);

// Tạo lịch (teacher và admin)
router.post('/', auth, requireTeacher, controller.create);

// Sửa lịch (admin, teacher, hoặc người tạo)
router.put('/:id', auth, controller.update);

// Xóa lịch (admin, teacher, hoặc người tạo)
router.delete('/:id', auth, controller.delete);

module.exports = router;
