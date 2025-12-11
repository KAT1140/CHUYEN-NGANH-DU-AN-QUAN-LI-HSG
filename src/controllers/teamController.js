// File: src/controllers/teamController.js (ĐÃ SỬA LỖI SYNTAX AWAI/TASYNC)

const Team = require('../models/Team');
const Member = require('../models/Member');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Sử dụng bcryptjs
const saltRounds = 10; // Định nghĩa saltRounds

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

exports.getMembersByTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const members = await Member.findAll({ where: { teamId }, attributes: { exclude: ['teamId'] } }); 
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// LOGIC QUẢN LÝ THÀNH VIÊN (ĐÃ HỢP NHẤT LOGIC TẠO USER VÀ MEMBER)
exports.createMember = async (req, res) => {
  const { name, studentId, contact } = req.body;
  const teamId = req.params.teamId;

  const defaultPassword = '123456';
  const email = studentId; // Dùng studentId làm email đăng nhập (do nó là duy nhất)

  try {
    // 1. Kiểm tra Team có tồn tại không
    const team = await Team.findByPk(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // 2. Băm mật khẩu mặc định
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // 3. Tạo tài khoản User (vai trò mặc định là 'user' = học sinh)
    const user = await User.create({
      name: name,
      email: email, 
      password: hashedPassword,
      role: 'user' // Vai trò học sinh
    });

    // 4. Tạo bản ghi Thành viên (Member) và liên kết với User (nếu cần)
    // Lưu ý: Nếu bạn muốn lưu userId vào bảng members, bạn cần thêm cột userId vào Member Model. 
    // Hiện tại, tôi không thấy cột userId trong Member Model, nên tôi sẽ bỏ qua userId trong Member.create.
    const member = await Member.create({ teamId, name, studentId, contact }); 

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
};

// LOGIC CẬP NHẬT THÀNH VIÊN
exports.updateMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const { name, studentId, contact } = req.body; // Lấy dữ liệu mới
    
    const member = await Member.findByPk(memberId);
    if (!member) return res.status(404).json({ error: 'Thành viên không tồn tại' });
    
    // 1. Cập nhật bản ghi User liên kết (Nếu có thay đổi studentId)
    // Giả định email của User = studentId của Member
    const user = await User.findOne({ where: { email: member.studentId } });
    
    if (user) {
        if (studentId && studentId !== member.studentId) {
            // Kiểm tra trùng email (studentId) mới trước khi update
            const existingUser = await User.findOne({ where: { email: studentId } });
            if (existingUser && existingUser.id !== user.id) {
                 return res.status(400).json({ error: 'Mã số học sinh mới đã được sử dụng làm tài khoản khác.' });
            }
            await user.update({ name, email: studentId }); // Cập nhật email và tên User
        } else {
            await user.update({ name }); // Chỉ cập nhật tên
        }
    }

    // 2. Cập nhật bản ghi Member
    await member.update({ name, studentId, contact });
    
    res.json({ message: 'Cập nhật thành viên thành công', member });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Mã số học sinh đã tồn tại.' });
    }
    console.error('Lỗi khi cập nhật thành viên:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật thành viên.' });
  }
};

// LOGIC XÓA THÀNH VIÊN
exports.deleteMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    
    const member = await Member.findByPk(memberId);
    if (!member) return res.status(404).json({ error: 'Thành viên không tồn tại' });
    
    // 1. Xóa bản ghi User liên kết (dùng studentId làm email)
    await User.destroy({ where: { email: member.studentId } });
    
    // 2. Xóa bản ghi Member
    await member.destroy();
    
    res.json({ message: 'Xóa thành viên và tài khoản liên kết thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa thành viên:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi xóa thành viên.' });
  }
};

module.exports = exports;