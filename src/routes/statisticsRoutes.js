const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const statisticsController = require('../controllers/statisticsController');

// Get available years
router.get('/years', auth, statisticsController.getAvailableYears);

// Get statistics by year
router.get('/year/:year', auth, statisticsController.getStatsByYear);

// Get dashboard statistics
router.get('/dashboard', auth, statisticsController.getDashboardStats);

// Get statistics for a specific student
router.get('/student/:studentId/:year', auth, statisticsController.getStudentStats);

// Test endpoint to check if API is working
router.get('/test', (req, res) => {
  res.json({ message: 'Statistics API is working!', timestamp: new Date() });
});

// Test endpoint to check student data
router.get('/test/student/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const Student = require('../models/student');
    const Team = require('../models/Team');
    const Score = require('../models/Score');
    
    const student = await Student.findByPk(studentId, {
      include: [{ model: Team, as: 'team' }]
    });
    
    const scores = await Score.findAll({
      where: { memberId: studentId },
      limit: 5
    });
    
    res.json({ student, scores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
