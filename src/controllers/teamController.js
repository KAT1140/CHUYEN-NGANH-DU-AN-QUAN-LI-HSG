// File: src/controllers/teamController.js

const Team = require('../models/Team');
const Member = require('../models/Member');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs'); 
const saltRounds = 10; 
const { Op } = require('sequelize'); // Đảm bảo đã import Op

const handleSequelizeError = (err, res) => {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Mã số học sinh (hoặc Email) đã tồn tại. Vui lòng kiểm tra.' });
    }
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    }
    console.error('Lỗi server:', err);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
};

// --- SỬA HÀM getAll ---
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let teams;
    if (role === 'admin' || role === 'teacher') {
      // Admin và Teacher xem tất cả đội
      teams = await Team.findAll({
        include: [{ model: Member, as: 'members' }]
      });
    } else {
      // User thường: Chỉ xem đội mình tham gia
      
      // B1: Tìm danh sách ID các đội mà user này là thành viên
      const memberships = await Member.findAll({
        where: { userId: userId },
        attributes: ['teamId']
      });

      // Lấy ra mảng các teamId, ví dụ: [1, 3]
      const teamIds = memberships.map(m => m.teamId);

      if (teamIds.length === 0) {
        // Nếu chưa vào đội nào, trả về rỗng ngay
        return res.json({ teams: [] });
      }

      // B2: Chỉ lấy thông tin các Team nằm trong danh sách teamIds
      teams = await Team.findAll({
        where: {
          id: { [Op.in]: teamIds } // Dùng toán tử IN
        },
        include: [{ model: Member, as: 'members' }] // Vẫn include members để user xem được đồng đội
      });
    }
    
    res.json({ teams });
  } catch (err) {
    console.error('Error getAll teams:', err);
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
    
    // Bảo mật thêm: Nếu là user thường, kiểm tra xem có trong đội này không mới cho xem chi tiết
    if (req.user.role === 'user') {
       const isMember = team.members.some(m => m.userId === req.user.id);
       if (!isMember) return res.status(403).json({ error: 'Bạn không có quyền xem đội này' });
    }

    res.json({ team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIC MEMBER CRUD
exports.getMembersByTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user.id;
    const role = req.user.role;

    // Admin và Teacher xem được tất cả đội, user chỉ xem đội của họ
    if (role !== 'admin' && role !== 'teacher') {
      const userMember = await Member.findOne({
        where: { teamId, userId }
      });
      if (!userMember) {
        return res.status(403).json({ error: 'Bạn không có quyền xem danh sách thành viên của đội này' });
      }
    }

    const members = await Member.findAll({ 
      where: { teamId }, 
      attributes: { exclude: ['teamId'] } 
    }); 
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMember = async (req, res) => {
  const { name, studentId, contact } = req.body;
  const teamId = req.params.teamId;
  const userId = req.user.id;
  const role = req.user.role;
  const defaultPassword = '123456';
  const email = studentId; 

  try {
    const team = await Team.findByPk(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Admin và Teacher được thêm member vào mọi đội, user chỉ được thêm vào đội của họ
    if (role !== 'admin' && role !== 'teacher') {
      const userMember = await Member.findOne({
        where: { teamId, userId }
      });
      if (!userMember) {
        return res.status(403).json({ error: 'Bạn không có quyền thêm thành viên vào đội này' });
      }
    }

    // Logic kiểm tra User đã có chưa
    let targetUserId = req.body.userId; // Nếu frontend gửi userId lên

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
    
    // Kiểm tra đã có trong đội chưa
    const existingMember = await Member.findOne({
        where: { teamId, userId: targetUserId }
    });
    if (existingMember) {
        return res.status(400).json({ error: 'Thành viên này đã có trong đội.' });
    }

    const member = await Member.create({ teamId, name, studentId, contact, userId: targetUserId }); 

    res.status(201).json({ 
        member, 
        message: 'Thêm thành viên thành công' 
    });
  } catch (err) {
    handleSequelizeError(err, res);
  }
};

exports.updateMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const teamId = req.params.teamId;
    const userId = req.user.id;
    const role = req.user.role;
    const { name, studentId, contact } = req.body; 
    
    const member = await Member.findByPk(memberId);
    if (!member) return res.status(404).json({ error: 'Thành viên không tồn tại' });

    // Admin và Teacher được sửa member của mọi đội, user chỉ sửa đội của họ
    if (role !== 'admin' && role !== 'teacher') {
      const userMember = await Member.findOne({
        where: { teamId, userId }
      });
      if (!userMember) {
        return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa thành viên của đội này' });
      }
    }
    
    if (member.userId) {
      const user = await User.findByPk(member.userId);
      if (user) {
          if (studentId && studentId !== user.email) {
              const existingUser = await User.findOne({ where: { email: studentId } });
              if (existingUser && existingUser.id !== user.id) {
                   return res.status(400).json({ error: 'Mã số học sinh mới đã được sử dụng làm tài khoản khác.' });
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
    const teamId = req.params.teamId;
    const userId = req.user.id;
    const role = req.user.role;
    
    const member = await Member.findByPk(memberId);
    if (!member) return res.status(404).json({ error: 'Thành viên không tồn tại' });

    // Admin và Teacher được xóa member của mọi đội, user chỉ xóa đội của họ
    if (role !== 'admin' && role !== 'teacher') {
      const userMember = await Member.findOne({
        where: { teamId, userId }
      });
      if (!userMember) {
        return res.status(403).json({ error: 'Bạn không có quyền xóa thành viên của đội này' });
      }
    }
    
    // Lưu ý: Chỉ xóa khỏi đội (bảng Member), không xóa tài khoản User để giữ lịch sử
    await member.destroy();
    
    res.json({ message: 'Đã xóa thành viên khỏi đội.' });
  } catch (err) {
    handleSequelizeError(err, res);
  }
};

module.exports = exports;