const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/login', controller.login);
router.post('/register', controller.register);
router.get('/me', auth, (req, res) => res.json({ user: req.user }));

// Get all students (user role only, not admin/teacher)
router.get('/students', auth, async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'user' },
      attributes: ['id', 'name', 'email']
    });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
