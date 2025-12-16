const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { requireTeacher, requireUser } = require('../middleware/adminMiddleware');
const scoreController = require('../controllers/scoreController');

// Get all scores
router.get('/', auth, scoreController.getAll);

// Get scores by member
router.get('/member/:memberId', auth, scoreController.getByMember);

// Create score (teacher/admin only)
router.post('/', auth, requireTeacher, scoreController.create);

// Update score (teacher/admin only)
router.put('/:id', auth, requireTeacher, scoreController.update);

// Delete score (teacher/admin only)
router.delete('/:id', auth, requireTeacher, scoreController.delete);

module.exports = router;
