const Score = require('../models/Score');
const Member = require('../models/Member');
const User = require('../models/User');

// Get all scores with member and teacher info
exports.getAll = async (req, res) => {
  try {
    const scores = await Score.findAll({
      include: [
        { model: Member, as: 'member' },
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ scores });
  } catch (err) {
    console.error('Error getAll scores:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get scores by member
exports.getByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const scores = await Score.findAll({
      where: { memberId },
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
      ],
      order: [['examDate', 'DESC']]
    });
    res.json({ scores });
  } catch (err) {
    console.error('Error getByMember scores:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create score (teacher/admin only)
exports.create = async (req, res) => {
  try {
    const { memberId, testName, score, maxScore, examDate, notes } = req.body;
    
    if (!memberId || !testName || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newScore = await Score.create({
      id,
      testName,
      score,
      maxScore: maxScore || 10,
      examDate,
      notes,
      createdBy: req.user.id
    });

    const scoreWithRelations = await Score.findByPk(newScore.id, {
      include: [
        { model: Member, as: 'member' },
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({ score: scoreWithRelations });
  } catch (err) {
    console.error('Error creating score:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update score (teacher/admin only, or creator)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { testName, score, maxScore, examDate, notes } = req.body;
    
    const scoreRecord = await Score.findByPk(id);
    if (!scoreRecord) {
      return res.status(404).json({ error: 'Score not found' });
    }

    // Check permission: only creator, admin, or teacher can update
    if (req.user.role === 'user' || (req.user.role === 'teacher' && req.user.id !== scoreRecord.createdBy && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await scoreRecord.update({
      testName: testName || scoreRecord.testName,
      score: score !== undefined ? score : scoreRecord.score,
      maxScore: maxScore || scoreRecord.maxScore,
      examDate: examDate || scoreRecord.examDate,
      notes: notes !== undefined ? notes : scoreRecord.notes
    });

    const updated = await Score.findByPk(id, {
      include: [
        { model: Member, as: 'member' },
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({ score: updated });
  } catch (err) {
    console.error('Error updating score:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete score (teacher/admin only, or creator)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scoreRecord = await Score.findByPk(id);
    if (!scoreRecord) {
      return res.status(404).json({ error: 'Score not found' });
    }

    // Check permission: only creator, admin, or teacher can delete
    if (req.user.role === 'user' || (req.user.role === 'teacher' && req.user.id !== scoreRecord.createdBy && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await scoreRecord.destroy();
    res.json({ message: 'Score deleted' });
  } catch (err) {
    console.error('Error deleting score:', err);
    res.status(500).json({ error: err.message });
  }
};
