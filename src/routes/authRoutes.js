const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/login', controller.login);
router.post('/register', controller.register);
router.get('/me', auth, (req, res) => res.json({ user: req.user }));

module.exports = router;
