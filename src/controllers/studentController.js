// File: src/controllers/studentController.js
const User = require('../models/User');
const Student = require('../models/student');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Import associations
require('../models/associations');

// Lấy danh sách tất cả học sinh (join Student + User) - với phân quyền
exports.getAll = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    
    let where = {};
    let teamIncludeWhere = undefined;
    
    // Phân quyền theo role
    if (role === 'user') {
      // Học sinh chỉ xem được thông tin của chính mình
      where.userId = userId;
    } else if (role === 'teacher') {
      // Giáo viên chỉ xem được học sinh trong team của mình
      const Teacher = require('../models/teacher');
      const teacher = await Teacher.findOne({ where: { userId } });
      
      if (teacher && teacher.subject) {
        // Lọc theo môn học của giáo viên
        teamIncludeWhere = { subject: teacher.subject };
      } else {
        // Nếu giáo viên không có môn học, không xem được ai
        where.id = -1; // Điều kiện không bao giờ đúng
      }
    }
    // Admin có thể xem tất cả (không thêm điều kiện where)

    const Team = require('../models/Team');
    const students = await Student.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'subject', 'teacherId'],
          required: role === 'teacher', // Bắt buộc có team nếu là teacher
          where: teamIncludeWhere
        }
      ],
      order: [['studentId', 'ASC']]
    });

    // Định dạng lại dữ liệu cho frontend
    const result = students.map(s => ({
      id: s.id, // Sử dụng Student.id thay vì User.id
      userId: s.userId, // Thêm userId để frontend có thể check
      name: s.name,
      studentId: s.studentId,
      grade: s.grade,
      className: s.className,
      email: s.user ? s.user.email : '',
      team: s.team ? {
        id: s.team.id,
        name: s.team.name,
        subject: s.team.subject
      } : null,
      createdAt: s.user ? s.user.createdAt : '',
    }));

    console.log(`Role ${role} can see ${result.length} students`);
    res.json({ students: result });
  } catch (err) {
    console.error('Error in getAll students:', err);
    res.status(500).json({ error: err.message });
  }
};

// Tạo học sinh mới
exports.create = async (req, res) => {
  try {
    const { name, email, password, grade, className } = req.body;
    
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

    // Tạo Student record nếu có thông tin grade/className
    if (grade || className) {
      await Student.create({
        name,
        studentId: email,
        grade,
        className,
        userId: newUser.id
      });
    }

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
    const { name, email, password, grade, className } = req.body;

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
    
    // Cập nhật hoặc tạo Student record
    const existingStudent = await Student.findOne({ where: { userId: id } });
    if (existingStudent) {
      // Cập nhật Student record hiện có
      await Student.update(
        { 
          name: name, 
          studentId: email,
          grade: grade,
          className: className
        }, 
        { where: { userId: id } }
      );
    } else if (grade || className) {
      // Tạo Student record mới nếu chưa có
      await Student.create({
        name: name,
        studentId: email,
        grade: grade,
        className: className,
        userId: id
      });
    }

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
    // 1. Xóa Student liên kết (Học sinh sẽ bị xóa khỏi các đội)
    await Student.destroy({ where: { userId: id } });
    
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
    // 1. Lấy danh sách ID của những user đã nằm trong bảng Student
    const occupiedMembers = await Student.findAll({
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