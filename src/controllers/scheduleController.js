// Schedule Controller

const Schedule = require('../models/Schedule');
const User = require('../models/User');

exports.getAll = async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
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
    const { title, description, date, time, type } = req.body;
    const userId = req.user.id;

    const schedule = await Schedule.create({
      title,
      description,
      date,
      time,
      type: type || 'event',
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
    const { title, description, date, time, type } = req.body;

    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      return res.status(404).json({ error: 'Lịch không tồn tại' });
    }

    // Chỉ admin, teacher hoặc người tạo mới được sửa
    if (role !== 'admin' && role !== 'teacher' && schedule.createdBy !== userId) {
      return res.status(403).json({ error: 'Bạn không có quyền sửa lịch này' });
    }

    await schedule.update({ title, description, date, time, type });

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

    await schedule.destroy();

    res.json({ message: 'Xóa lịch thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
