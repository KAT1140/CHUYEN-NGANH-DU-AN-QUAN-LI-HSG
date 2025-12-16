// File: src/controllers/evaluationController.js
const Evaluation = require('../models/Evaluation');
const Member = require('../models/Member');
const User = require('../models/User');
const { Op } = require('sequelize');

// Lấy danh sách đánh giá
exports.getAll = async (req, res) => {
  try {
    const { id, role } = req.user;
    let whereClause = {};

    // Nếu là học sinh, chỉ xem đánh giá của chính mình
    if (role === 'user') {
      const members = await Member.findAll({ where: { userId: id }, attributes: ['id'] });
      const memberIds = members.map(m => m.id);
      
      if (memberIds.length === 0) return res.json({ evaluations: [] });
      whereClause = { memberId: { [Op.in]: memberIds } };
    }

    const evaluations = await Evaluation.findAll({
      where: whereClause,
      include: [
        { model: Member, as: 'member' },
        { model: User, as: 'teacher', attributes: ['id', 'name'] }
      ],
      order: [['date', 'DESC']]
    });
    res.json({ evaluations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo đánh giá mới (Chỉ Teacher/Admin)
exports.create = async (req, res) => {
  try {
    const { memberId, content, rating, date } = req.body;
    const evaluation = await Evaluation.create({
      memberId,
      content,
      rating,
      date,
      createdBy: req.user.id
    });
    res.status(201).json({ evaluation, message: 'Đã thêm đánh giá' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa đánh giá (Chỉ Teacher/Admin)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await Evaluation.destroy({ where: { id } });
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};