// Schedule Controller

const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const Team = require('../models/Team');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { role, id } = req.user;
    let whereClause = {};

    // Giáo viên: xem lịch dạy (lịch của môn họ dạy)
    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: id } });
      if (teacher && teacher.subject) {
        whereClause.subject = teacher.subject;
      }
    }
    // Học sinh: xem lịch học (lịch của môn họ ôn)
    else if (role === 'user') {
      const student = await Student.findOne({ 
        where: { userId: id },
        include: [{ model: Team, as: 'team' }]
      });
      if (student && student.team && student.team.subject) {
        whereClause.subject = student.team.subject;
      } else {
        // Nếu không có team, không hiển lịch nào
        whereClause.subject = null;
      }
    }
    // Admin thấy tất cả

    const schedules = await Schedule.findAll({
      where: whereClause,
      include: {
        model: User,
        attributes: ['id', 'name', 'email'],
        as: 'creator'
      },
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    res.json({ schedules });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByDate = async (req, res) => {
  try {
    const { date } = req.params; // format: YYYY-MM-DD
    const schedules = await Schedule.findAll({
      where: { date },
      include: {
        model: User,
        attributes: ['id', 'name', 'email'],
        as: 'creator'
      },
      order: [['time', 'ASC']]
    });
    res.json({ schedules });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, date, time, type, subject } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Nếu là giáo viên, kiểm tra môn học
    if (userRole === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId } });
      if (!teacher) {
        return res.status(403).json({ error: 'Không tìm thấy thông tin giáo viên' });
      }
      
      // Giáo viên chỉ được tạo lịch cho môn của mình
      if (!subject || subject !== teacher.subject) {
        return res.status(403).json({ 
          error: `Bạn chỉ có thể tạo lịch cho môn ${teacher.subject}` 
        });
      }
    }

    const schedule = await Schedule.create({
      title,
      description,
      date,
      time,
      type: type || 'event',
      subject,
      createdBy: userId
    });

    res.status(201).json({ 
      schedule,
      message: 'Tạo lịch thành công'
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const { title, description, date, time, type, subject } = req.body;

    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: 'Lịch không tồn tại' });
    }

    // Chỉ admin, teacher hoặc người tạo mới được sửa
    if (role !== 'admin' && role !== 'teacher' && schedule.createdBy !== userId) {
      return res.status(403).json({ error: 'Bạn không có quyền sửa lịch này' });
    }

    // Nếu là giáo viên, kiểm tra môn học
    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId } });
      if (!teacher) {
        return res.status(403).json({ error: 'Không tìm thấy thông tin giáo viên' });
      }
      
      // Giáo viên chỉ được sửa lịch môn của mình
      if (schedule.subject !== teacher.subject) {
        return res.status(403).json({ 
          error: `Bạn chỉ có thể sửa lịch môn ${teacher.subject}` 
        });
      }
      
      // Đảm bảo không thay đổi môn học
      if (subject && subject !== teacher.subject) {
        return res.status(403).json({ 
          error: `Bạn chỉ có thể tạo lịch cho môn ${teacher.subject}` 
        });
      }
    }

    await schedule.update({ title, description, date, time, type, subject });

    res.json({ 
      schedule,
      message: 'Cập nhật lịch thành công'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: 'Lịch không tồn tại' });
    }

    // Chỉ admin, teacher hoặc người tạo mới được xóa
    if (role !== 'admin' && role !== 'teacher' && schedule.createdBy !== userId) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa lịch này' });
    }

    // Nếu là giáo viên, kiểm tra môn học
    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId } });
      if (!teacher) {
        return res.status(403).json({ error: 'Không tìm thấy thông tin giáo viên' });
      }
      
      // Giáo viên chỉ được xóa lịch môn của mình
      if (schedule.subject !== teacher.subject) {
        return res.status(403).json({ 
          error: `Bạn chỉ có thể xóa lịch môn ${teacher.subject}` 
        });
      }
    }

    await schedule.destroy();

    res.json({ message: 'Xóa lịch thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
