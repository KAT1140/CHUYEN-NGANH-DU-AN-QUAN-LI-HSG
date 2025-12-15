// File: src/controllers/teamController.js (ĐÃ SỬA LỖI CẤU TRÚC VÀ LOGIC)

const Team = require('../models/Team');
const Member = require('../models/Member');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs'); 
const saltRounds = 10; 

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


exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let teams;
    if (role === 'admin' || role === 'teacher') {
      // Admin và Teacher xem tất cả đội
      teams = await Team.findAll();
    } else {
      // User chỉ xem đội mà họ là thành viên - filter trên client hoặc dùng JOIN
      teams = await Team.findAll();
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
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ error: 'Not found' });
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

    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    const user = await User.create({
      name: name,
      email: email, 
      password: hashedPassword,
      role: 'user' 
    });

    const member = await Member.create({ teamId, name, studentId, contact, userId: user.id }); 

    res.status(201).json({ 
        member, 
        message: `Đã tạo thành viên và tài khoản. Email: ${email}, Mật khẩu mặc định: ${defaultPassword}` 
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
    
    const user = await User.findOne({ where: { email: member.studentId } });
    
    if (user) {
        if (studentId && studentId !== member.studentId) {
            const existingUser = await User.findOne({ where: { email: studentId } });
            if (existingUser && existingUser.id !== user.id) {
                 return res.status(400).json({ error: 'Mã số học sinh mới đã được sử dụng làm tài khoản khác.' });
            }
            await user.update({ name, email: studentId }); 
        } else {
            await user.update({ name }); 
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
    
    await User.destroy({ where: { email: member.studentId } });
    await member.destroy();
    
    res.json({ message: 'Xóa thành viên và tài khoản liên kết thành công' });
  } catch (err) {
    handleSequelizeError(err, res);
  }
};

module.exports = exports;