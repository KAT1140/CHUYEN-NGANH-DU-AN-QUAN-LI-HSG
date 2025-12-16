// File: src/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentController');
const { auth } = require('../middleware/authMiddleware');
const { requireTeacher } = require('../middleware/adminMiddleware'); // Cho phép Teacher và Admin quản lý

router.get('/', auth, requireTeacher, controller.getAll);
router.post('/', auth, requireTeacher, controller.create);
router.put('/:id', auth, requireTeacher, controller.update);
router.delete('/:id', auth, requireTeacher, controller.delete);

module.exports = router;