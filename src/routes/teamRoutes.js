const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id', controller.getById);

router.get('/:teamId/members', controller.getMembersByTeam);
router.post('/:teamId/members', controller.createMember);

module.exports = router;
