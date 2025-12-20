// File: src/controllers/teacherController.js
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Lấy danh sách tất cả giáo viên
exports.getAll = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      order: [['fullName', 'ASC']]
    });
    res.json({ teachers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo giáo viên mới
exports.create = async (req, res) => {
  try {
    const { fullName, email, subject, department, specialization, phoneNumber } = req.body;

    // Kiểm tra email trùng
    const existingTeacher = await Teacher.findOne({ where: { email } });
    if (existingTeacher) {
      return res.status(400).json({ error: 'Email giáo viên đã tồn tại' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // Tạo User account cho giáo viên
    const hashedPassword = await bcrypt.hash('123456', 10); // Mật khẩu mặc định
    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      role: 'teacher',
      subject
    });

    // Tạo Teacher record
    const teacher = await Teacher.create({
      fullName,
      email,
      subject,
      department,
      specialization,
      phoneNumber,
      userId: user.id
    });

    res.status(201).json({ 
      teacher, 
      message: 'Tạo giáo viên thành công. Mật khẩu mặc định: 123456' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa giáo viên
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id);
    
    if (!teacher) {
      return res.status(404).json({ error: 'Không tìm thấy giáo viên' });
    }

    // Xóa User account nếu có
    if (teacher.userId) {
      await User.destroy({ where: { id: teacher.userId } });
    }

    await teacher.destroy();
    res.json({ message: 'Đã xóa giáo viên' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
