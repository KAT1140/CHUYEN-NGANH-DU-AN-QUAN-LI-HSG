// File: src/controllers/evaluationController.js
const Evaluation = require('../models/Evaluation');
const Student = require('../models/student');
const User = require('../models/User');
const Team = require('../models/Team');
const { Op } = require('sequelize');

// Lấy danh sách đánh giá
exports.getAll = async (req, res) => {
  try {
    const { id, role } = req.user;
    let whereClause = {};

    // Nếu là học sinh, chỉ xem đánh giá của chính mình
    if (role === 'user') {
      const members = await Student.findAll({ where: { userId: id }, attributes: ['id'] });
      const memberIds = members.map(m => m.id);
      
      if (memberIds.length === 0) return res.json({ evaluations: [] });
      whereClause = { memberId: { [Op.in]: memberIds } };
    }
    // Nếu là giáo viên, chỉ xem đánh giá của học sinh trong team mình
    else if (role === 'teacher') {
      // Lấy danh sách team mà giáo viên này phụ trách
      const TeamTeacher = require('../models/TeamTeacher');
      const teacherTeams = await TeamTeacher.findAll({
        where: { teacherId: id, isActive: true },
        attributes: ['teamId']
      });
      
      const teamIds = teacherTeams.map(tt => tt.teamId);
      
      if (teamIds.length === 0) return res.json({ evaluations: [] });
      
      // Lấy danh sách học sinh trong các team này
      const teamMembers = await Student.findAll({
        where: { teamId: { [Op.in]: teamIds } },
        attributes: ['id']
      });
      
      const memberIds = teamMembers.map(m => m.id);
      if (memberIds.length === 0) return res.json({ evaluations: [] });
      
      whereClause = { memberId: { [Op.in]: memberIds } };
    }
    // Admin xem tất cả

    const evaluations = await Evaluation.findAll({
      where: whereClause,
      include: [
        { 
          model: Student, 
          as: 'member',
          include: [{ 
            model: Team, 
            as: 'team'
          }]
        },
        { model: User, as: 'teacher', attributes: ['id', 'name'] }
      ],
      order: [['date', 'DESC']]
    });
    res.json({ evaluations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo đánh giá mới (Chỉ Teacher/Admin và chỉ cho học sinh trong team mình)
exports.create = async (req, res) => {
  try {
    const { memberId, content, rating, date } = req.body;
    const { id: userId, role } = req.user;

    // Kiểm tra quyền: giáo viên chỉ được tạo đánh giá cho học sinh trong team mình
    if (role === 'teacher') {
      const student = await Student.findByPk(memberId, {
        include: [{ model: Team, as: 'team' }]
      });
      
      if (!student) {
        return res.status(404).json({ error: 'Không tìm thấy học sinh' });
      }

      const TeamTeacher = require('../models/TeamTeacher');
      const isTeacherOfTeam = await TeamTeacher.findOne({
        where: {
          teacherId: userId,
          teamId: student.teamId,
          isActive: true
        }
      });
      
      if (!isTeacherOfTeam) {
        return res.status(403).json({ error: 'Bạn chỉ có thể tạo đánh giá cho học sinh trong team mình' });
      }
    }

    const evaluation = await Evaluation.create({
      memberId,
      content,
      rating,
      date,
      createdBy: userId
    });
    res.status(201).json({ evaluation, message: 'Đã thêm đánh giá' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật đánh giá (Chỉ Teacher/Admin và chỉ đánh giá của học sinh trong team mình)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId, content, rating, date } = req.body;
    const { id: userId, role } = req.user;
    
    const evaluation = await Evaluation.findByPk(id, {
      include: [{
        model: Student,
        as: 'member',
        include: [{ model: Team, as: 'team' }]
      }]
    });
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
    }

    // Kiểm tra quyền: giáo viên chỉ được sửa đánh giá của học sinh trong team mình
    if (role === 'teacher') {
      const TeamTeacher = require('../models/TeamTeacher');
      const isTeacherOfTeam = await TeamTeacher.findOne({
        where: {
          teacherId: userId,
          teamId: evaluation.member.teamId,
          isActive: true
        }
      });
      
      if (!isTeacherOfTeam) {
        return res.status(403).json({ error: 'Bạn chỉ có thể sửa đánh giá của học sinh trong team mình' });
      }
    }

    await evaluation.update({
      memberId,
      content,
      rating,
      date
    });

    res.json({ evaluation, message: 'Đã cập nhật đánh giá' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa đánh giá (Chỉ Teacher/Admin và chỉ đánh giá của học sinh trong team mình)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;
    
    const evaluation = await Evaluation.findByPk(id, {
      include: [{
        model: Student,
        as: 'member',
        include: [{ model: Team, as: 'team' }]
      }]
    });
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
    }

    // Kiểm tra quyền: giáo viên chỉ được xóa đánh giá của học sinh trong team mình
    if (role === 'teacher') {
      const TeamTeacher = require('../models/TeamTeacher');
      const isTeacherOfTeam = await TeamTeacher.findOne({
        where: {
          teacherId: userId,
          teamId: evaluation.member.teamId,
          isActive: true
        }
      });
      
      if (!isTeacherOfTeam) {
        return res.status(403).json({ error: 'Bạn chỉ có thể xóa đánh giá của học sinh trong team mình' });
      }
    }

    await evaluation.destroy();
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách học sinh mà giáo viên có thể đánh giá
exports.getStudentsForEvaluation = async (req, res) => {
  try {
    const { id, role } = req.user;
    let students = [];

    if (role === 'admin') {
      // Admin có thể đánh giá tất cả học sinh
      students = await Student.findAll({
        include: [{ 
          model: Team, 
          as: 'team',
          attributes: ['id', 'name', 'subject']
        }],
        order: [['name', 'ASC']]
      });
    } else if (role === 'teacher') {
      // Giáo viên chỉ có thể đánh giá học sinh trong team mình
      const TeamTeacher = require('../models/TeamTeacher');
      const teacherTeams = await TeamTeacher.findAll({
        where: { teacherId: id, isActive: true },
        attributes: ['teamId']
      });
      
      const teamIds = teacherTeams.map(tt => tt.teamId);
      
      if (teamIds.length > 0) {
        students = await Student.findAll({
          where: { teamId: { [Op.in]: teamIds } },
          include: [{ 
            model: Team, 
            as: 'team',
            attributes: ['id', 'name', 'subject']
          }],
          order: [['name', 'ASC']]
        });
      }
    }

    res.json({ students });
  } catch (err) {
    console.error('Error in getStudentsForEvaluation:', err);
    res.status(500).json({ error: err.message });
  }
};