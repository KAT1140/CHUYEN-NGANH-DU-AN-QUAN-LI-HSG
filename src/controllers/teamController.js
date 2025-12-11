const Team = require('../models/Team');
const Member = require('../models/Member');
const User = require('../models/User');

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
module.exports = exports;