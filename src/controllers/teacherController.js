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

    // Lấy thông tin teams mà giáo viên phụ trách từ bảng TeamTeacher
    const TeamTeacher = require('../models/TeamTeacher');
    const teacherIds = teachers.map(t => t.user ? t.user.id : null).filter(id => id !== null);
    
    const teamTeachers = await TeamTeacher.findAll({
      where: {
        teacherId: teacherIds,
        isActive: true // Bỏ điều kiện role: 'main' để lấy cả co-teacher
      },
      include: [
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'subject', 'grade']
        }
      ]
    });

    // Tạo map teacherId -> team (với role info)
    const teacherTeamMap = {};
    teamTeachers.forEach(tt => {
      if (tt.team) {
        // Nếu giáo viên đã có team, ưu tiên role 'main'
        if (!teacherTeamMap[tt.teacherId] || tt.role === 'main') {
          teacherTeamMap[tt.teacherId] = {
            ...tt.team.toJSON(),
            role: tt.role
          };
        }
      }
    });

    // Định dạng lại cho frontend
    const result = teachers.map(t => {
      const teacherId = t.user ? t.user.id : null;
      const hasTeam = teacherId && teacherTeamMap[teacherId];
      
      return {
        id: teacherId,
        name: t.fullName,
        subject: t.subject,
        department: t.department,
        specialization: t.specialization,
        email: t.email,
        phoneNumber: t.phoneNumber,
        team: hasTeam ? {
          id: teacherTeamMap[teacherId].id,
          name: teacherTeamMap[teacherId].name,
          grade: teacherTeamMap[teacherId].grade,
          subject: teacherTeamMap[teacherId].subject,
          role: teacherTeamMap[teacherId].role // Thêm role info
        } : null
      };
    });
    res.json({ teachers: result });
  } catch (err) {
    console.error('Error in getAll teachers:', err);
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
      const TeamTeacher = require('../models/TeamTeacher');
      await TeamTeacher.create({
        teamId: teamId,
        teacherId: user.id,
        role: 'main',
        isActive: true,
        startDate: new Date()
      });
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
    const TeamTeacher = require('../models/TeamTeacher');
    
    if (teamId) {
      // Xóa assignment cũ của giáo viên này (chỉ role main)
      await TeamTeacher.destroy({ 
        where: { 
          teacherId: id,
          role: 'main'
        } 
      });
      
      // Gán team mới
      await TeamTeacher.create({
        teamId: teamId,
        teacherId: id,
        role: 'main',
        isActive: true,
        startDate: new Date()
      });
      console.log('Updated team assignment to:', teamId);
    } else {
      // Nếu không chọn team, xóa assignment
      await TeamTeacher.destroy({ 
        where: { 
          teacherId: id,
          role: 'main'
        } 
      });
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

// Lấy danh sách giáo viên có sẵn (chưa có trong team hoặc đúng môn)
exports.getAvailable = async (req, res) => {
  try {
    const { subject } = req.query;
    
    // Lấy danh sách giáo viên theo môn (nếu có)
    const whereCondition = {};
    if (subject) {
      whereCondition.subject = subject;
    }
    
    const teachers = await Teacher.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['fullName', 'ASC']]
    });

    // Lấy danh sách giáo viên đã có trong team (từ bảng TeamTeacher)
    const TeamTeacher = require('../models/TeamTeacher');
    const assignedTeachers = await TeamTeacher.findAll({
      attributes: ['teacherId']
    });
    const assignedTeacherIds = assignedTeachers.map(at => at.teacherId);

    // Lọc ra những giáo viên chưa có trong team nào
    const availableTeachers = teachers.filter(t => 
      t.user && !assignedTeacherIds.includes(t.user.id)
    );

    // Định dạng lại cho frontend
    const result = availableTeachers.map(t => ({
      id: t.user.id,
      name: t.fullName,
      subject: t.subject,
      department: t.department,
      specialization: t.specialization,
      email: t.email,
      phoneNumber: t.phoneNumber
    }));
    
    res.json({ teachers: result });
  } catch (err) {
    console.error('Error fetching available teachers:', err);
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
