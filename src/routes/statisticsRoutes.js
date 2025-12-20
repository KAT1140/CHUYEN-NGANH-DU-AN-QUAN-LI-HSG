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

module.exports = router;
