// File: src/controllers/scoreController.js

const Score = require('../models/Score');
const Student = require('../models/Student');
const User = require('../models/User');
const { Op } = require('sequelize'); // Import Op để dùng toán tử tìm kiếm

// Get scores (Phân quyền: User chỉ xem của mình, Admin/Teacher xem hết)
exports.getAll = async (req, res) => {
  try {
    const { id, role } = req.user; // Lấy ID và Role từ token đăng nhập
    let whereClause = {};

    // LOGIC PHÂN QUYỀN TẠI ĐÂY
    if (role === 'user') {
      // 1. Tìm tất cả các "hồ sơ thành viên" của user này (vì 1 user có thể tham gia nhiều đội)
      const members = await Student.findAll({ 
        where: { userId: id },
        attributes: ['id'] 
      });
      
      // Lấy danh sách ID thành viên
      const memberIds = members.map(m => m.id);

      // Nếu không tham gia đội nào -> Không có điểm
      if (memberIds.length === 0) {
        return res.json({ scores: [] });
      }

      // 2. Chỉ lấy điểm thuộc về các memberId này
      whereClause = { memberId: memberIds };
    }
    // Nếu là admin/teacher thì whereClause rỗng -> Lấy tất cả

    const scores = await Score.findAll({
      where: whereClause,
      include: [
        { model: Student, as: 'member' },
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

// Get scores by member (Giữ nguyên, nhưng thêm kiểm tra bảo mật nếu kỹ hơn)
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

// Create score (teacher/admin only) - Giữ nguyên
exports.create = async (req, res) => {
  try {
    const { memberId, testName, score, maxScore, examDate, notes } = req.body;
    
    if (!memberId || !testName || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newScore = await Score.create({
      memberId,
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

// Update score (teacher/admin only, or creator) - Giữ nguyên
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { testName, score, maxScore, examDate, notes } = req.body;
    
    const scoreRecord = await Score.findByPk(id);
    if (!scoreRecord) {
      return res.status(404).json({ error: 'Score not found' });
    }

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

// Delete score (teacher/admin only, or creator) - Giữ nguyên
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scoreRecord = await Score.findByPk(id);
    if (!scoreRecord) {
      return res.status(404).json({ error: 'Score not found' });
    }

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