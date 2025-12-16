// File: src/controllers/studentController.js
const User = require('../models/User');
const Member = require('../models/Member');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Lấy danh sách tất cả học sinh (User có role = 'user')
exports.getAll = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'user' },
      attributes: { exclude: ['password'] }, // Không trả về mật khẩu
      order: [['createdAt', 'DESC']]
    });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo học sinh mới
exports.create = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Kiểm tra email trùng
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Mã học sinh/Email này đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    // Trả về user không có password
    const { password: p, ...userWithoutPass } = newUser.toJSON();
    res.status(201).json({ student: userWithoutPass, message: 'Tạo học sinh thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật thông tin học sinh
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const student = await User.findOne({ where: { id, role: 'user' } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh' });

    // Nếu đổi email, kiểm tra trùng
    if (email && email !== student.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    const updateData = { name, email };
    
    // Nếu có nhập password mới thì hash và cập nhật
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await student.update(updateData);
    
    // Cập nhật thông tin bên bảng Member nếu có liên kết (để đồng bộ tên/mã)
    await Member.update(
      { name: name, studentId: email }, 
      { where: { userId: id } }
    );

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa học sinh
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ where: { id, role: 'user' } });
    if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh' });

    // Xóa (hoặc set null) các dữ liệu liên quan
    // 1. Xóa Member liên kết (Học sinh sẽ bị xóa khỏi các đội)
    await Member.destroy({ where: { userId: id } });
    
    // 2. Xóa User
    await student.destroy();

    res.json({ message: 'Đã xóa học sinh và thông tin trong các đội' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// [MỚI] Lấy danh sách học sinh CHƯA tham gia đội nào
exports.getAvailable = async (req, res) => {
  try {
    // 1. Lấy danh sách ID của những user đã nằm trong bảng Member
    const occupiedMembers = await Member.findAll({
      attributes: ['userId'],
      where: { userId: { [Op.ne]: null } } // Chỉ lấy dòng có userId hợp lệ
    });
    
    const occupiedUserIds = occupiedMembers.map(m => m.userId);

    // 2. Tìm User là 'user' VÀ ID không nằm trong danh sách trên
    const availableStudents = await User.findAll({
      where: {
        role: 'user',
        id: { [Op.notIn]: occupiedUserIds } // Điều kiện loại trừ
      },
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });

    res.json({ students: availableStudents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};