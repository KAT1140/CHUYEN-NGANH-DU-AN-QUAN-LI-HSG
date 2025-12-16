// File: src/controllers/teamController.js

const Team = require('../models/Team');
const Member = require('../models/Member');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs'); 
const saltRounds = 10; 
const { Op } = require('sequelize');

const handleSequelizeError = (err, res) => {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Thành viên hoặc Tài khoản này đã tồn tại trong hệ thống.' });
    }
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    }
    console.error('Lỗi server:', err);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
};

// --- SỬA LẠI HÀM getAll ĐỂ LẤY KÈM THÀNH VIÊN ---
exports.getAll = async (req, res) => {
  try {
    // Thêm include: [{ model: Member, as: 'members' }] để lấy danh sách thành viên trong đội
    const teams = await Team.findAll({
        include: [{ 
            model: Member, 
            as: 'members' 
        }]
    });
    res.json({ teams });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json({ team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [{ model: Member, as: 'members' }]
    });
    if (!team) return res.status(404).json({ error: 'Not found' });
    res.json({ team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMembersByTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const members = await Member.findAll({ 
      where: { teamId }, 
      attributes: { exclude: ['teamId'] } 
    }); 
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- HÀM CREATE MEMBER GIỮ NGUYÊN ---
exports.createMember = async (req, res) => {
  const { name, studentId, contact, userId } = req.body;
  const teamId = req.params.teamId;
  const defaultPassword = '123456';
  const email = studentId; 

  try {
    const team = await Team.findByPk(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const existingMember = await Member.findOne({
        where: {
            teamId: teamId,
            [Op.or]: [
                { studentId: studentId },
                ...(userId ? [{ userId: userId }] : [])
            ]
        }
    });

    if (existingMember) {
        return res.status(400).json({ error: 'Học sinh này đã là thành viên của đội.' });
    }

    let targetUserId = userId;

    if (!targetUserId) {
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            targetUserId = existingUser.id;
        } else {
            const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
            const newUser = await User.create({
                name: name,
                email: email, 
                password: hashedPassword,
                role: 'user' 
            });
            targetUserId = newUser.id;
        }
    }

    const member = await Member.create({ 
        teamId, 
        name, 
        studentId, 
        contact, 
        userId: targetUserId 
    }); 

    res.status(201).json({ 
        member, 
        message: 'Thêm thành viên thành công.' 
    });
  } catch (err) {
    handleSequelizeError(err, res);
  }
};

exports.updateMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const { name, studentId, contact } = req.body; 
    
    const member = await Member.findByPk(memberId);
    if (!member) return res.status(404).json({ error: 'Thành viên không tồn tại' });
    
    if (member.userId) {
        const user = await User.findByPk(member.userId);
        if (user) {
             if (studentId && studentId !== user.email) {
                const duplicateUser = await User.findOne({ where: { email: studentId } });
                if (duplicateUser && duplicateUser.id !== user.id) {
                     return res.status(400).json({ error: 'Mã số học sinh mới đã được sử dụng.' });
                }
                await user.update({ name, email: studentId }); 
            } else {
                await user.update({ name }); 
            }
        }
    }

    await member.update({ name, studentId, contact });
    res.json({ message: 'Cập nhật thành viên thành công', member });
  } catch (err) {
    handleSequelizeError(err, res);
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const member = await Member.findByPk(memberId);
    if (!member) return res.status(404).json({ error: 'Thành viên không tồn tại' });
    await member.destroy();
    res.json({ message: 'Đã xóa thành viên khỏi đội.' });
  } catch (err) {
    handleSequelizeError(err, res);
  }
};

module.exports = exports;