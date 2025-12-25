// File: src/routes/evaluationRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/evaluationController');
const { auth } = require('../middleware/authMiddleware');
const { requireTeacher } = require('../middleware/adminMiddleware');

router.get('/', auth, controller.getAll);
router.post('/', auth, requireTeacher, controller.create);
router.put('/:id', auth, requireTeacher, controller.update);
router.delete('/:id', auth, requireTeacher, controller.delete);

module.exports = router;