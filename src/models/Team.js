const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Team = sequelize.define('Team', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  grade: { type: DataTypes.STRING } // Khối lớp (10, 11, 12)
}, {
  timestamps: true
});

module.exports = Team;
