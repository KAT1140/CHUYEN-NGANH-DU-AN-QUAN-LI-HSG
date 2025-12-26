// File: src/controllers/teacherController.js
const Teacher = require('../models/teacher');
const User = require('../models/User');
const Team = require('../models/Team');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Lấy danh sách tất cả giáo viên
exports.getAll = async (req, res) => {
  try {
    // Lấy từ bảng Teacher, join User để lấy email, tên, v.v.
    const teachers = await Teacher.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['fullName', 'ASC']]
    });

    // Lấy thông tin teams mà giáo viên phụ trách
    const teacherIds = teachers.map(t => t.user ? t.user.id : null).filter(id => id !== null);
    const teams = await Team.findAll({
      where: {
        teacherId: teacherIds
      },
      attributes: ['id', 'name', 'subject', 'grade', 'teacherId']
    });

    // Tạo map teacherId -> team
    const teacherTeamMap = {};
    teams.forEach(team => {
      teacherTeamMap[team.teacherId] = team;
    });

    // Định dạng lại cho frontend
    const result = teachers.map(t => ({
      id: t.user ? t.user.id : null,
      name: t.fullName,
      subject: t.subject,
      department: t.department,
      specialization: t.specialization,
      email: t.email,
      phoneNumber: t.phoneNumber,
      team: t.user && teacherTeamMap[t.user.id] ? {
        id: teacherTeamMap[t.user.id].id,
        name: teacherTeamMap[t.user.id].name,
        grade: teacherTeamMap[t.user.id].grade
      } : null
    }));
    res.json({ teachers: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo giáo viên mới
exports.create = async (req, res) => {
  try {
    const { fullName, email, subject, department, specialization, phoneNumber, teamId } = req.body;

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

    // Gán team nếu có
    if (teamId) {
      await Team.update({ teacherId: user.id }, { where: { id: teamId } });
    }

    res.status(201).json({ 
      teacher, 
      message: 'Tạo giáo viên thành công. Mật khẩu mặc định: 123456' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật giáo viên
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, subject, department, specialization, phoneNumber, teamId } = req.body;

    console.log('Update teacher request:', { id, fullName, email, subject, teamId });

    // Tìm giáo viên cần cập nhật
    const teacher = await Teacher.findOne({
      where: { userId: id },
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Không tìm thấy giáo viên' });
    }

    console.log('Found teacher:', teacher.fullName);

    // Kiểm tra email trùng (ngoại trừ email hiện tại)
    if (email !== teacher.email) {
      const existingTeacher = await Teacher.findOne({ 
        where: { 
          email,
          userId: { [Op.ne]: id }
        } 
      });
      if (existingTeacher) {
        return res.status(400).json({ error: 'Email giáo viên đã tồn tại' });
      }

      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id }
        } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email đã được sử dụng' });
      }
    }

    // Cập nhật User record
    await User.update({
      name: fullName,
      email,
      subject
    }, {
      where: { id }
    });

    console.log('Updated user record');

    // Cập nhật Teacher record
    await Teacher.update({
      fullName,
      email,
      subject,
      department,
      specialization,
      phoneNumber
    }, {
      where: { userId: id }
    });

    console.log('Updated teacher record');

    // Cập nhật team assignment
    if (teamId) {
      // Xóa assignment cũ của giáo viên này
      await Team.update({ teacherId: null }, { where: { teacherId: id } });
      
      // Gán team mới
      await Team.update({ teacherId: id }, { where: { id: teamId } });
      console.log('Updated team assignment to:', teamId);
    } else {
      // Nếu không chọn team, xóa assignment
      await Team.update({ teacherId: null }, { where: { teacherId: id } });
      console.log('Removed team assignment');
    }

    res.json({ 
      message: 'Cập nhật giáo viên thành công' 
    });
  } catch (err) {
    console.error('Error updating teacher:', err);
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
