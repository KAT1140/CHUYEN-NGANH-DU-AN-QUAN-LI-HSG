const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Team = require('../models/Team');

router.post('/login', controller.login);
router.post('/register', controller.register);
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    const response = { user: user.toJSON() };
    
    // Nếu là teacher, thêm teacher info
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: user.id } });
      response.teacher = teacher ? teacher.toJSON() : null;
    }
    // Nếu là student, thêm student info với team
    else if (user.role === 'user') {
      const student = await Student.findOne({ 
        where: { userId: user.id },
        include: [{ model: Team, as: 'team' }]
      });
      response.student = student ? student.toJSON() : null;
    }
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
