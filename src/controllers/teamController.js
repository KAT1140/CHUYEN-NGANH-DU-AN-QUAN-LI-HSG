const Team = require('../models/Team');
const Member = require('../models/Member');
const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getAll = async (req, res) => {
  try {
    const teams = await Team.findAll();
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
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ error: 'Not found' });
    res.json({ team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIC QUẢN LÝ THÀNH VIÊN
exports.getMembersByTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const members = await Member.findAll({ where: { teamId } });
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMember = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { name, studentId, contact } = req.body;
    
    const team = await Team.findByPk(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const member = await Member.create({ teamId, name, studentId, contact });
    res.status(201).json({ member });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Mã số học sinh đã tồn tại.' });
    }
    res.status(500).json({ error: err.message });
  }
};

const defaultPassword = '123456'; // Mật khẩu mặc định
  const email = studentId; // Dùng studentId làm email đăng nhập (do nó là duy nhất)

  try {
    // 1. Kiểm tra Team có tồn tại không
    const team = await Team.findByPk(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // 2. Băm mật khẩu mặc định
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // 3. Tạo tài khoản User (vai trò mặc định là 'user')
    const user = await User.create({
      name: name,
      email: email, // Sử dụng studentId làm email đăng nhập
      password: hashedPassword,
      role: 'user' // Phân quyền là học sinh
    });
    const member = await Member.create({ teamId, name, studentId, contact, userId: user.id }); // Tùy chọn: Thêm userId vào Member

    res.status(201).json({ 
        member, 
        message: `Đã tạo thành viên và tài khoản. Email: ${email}, Mật khẩu mặc định: ${defaultPassword}` 
    });
  } catch (err) {
    // Xử lý lỗi trùng lặp (nếu studentId đã tồn tại trong User hoặc Member)
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Mã số học sinh (hoặc Email) đã tồn tại. Vui lòng kiểm tra.' });
    }
    // Lỗi validation khác
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    }
    console.error('Lỗi khi tạo thành viên:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi tạo thành viên.' });
  }
module.exports = exports;