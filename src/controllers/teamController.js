const Team = require('../models/Team');

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
