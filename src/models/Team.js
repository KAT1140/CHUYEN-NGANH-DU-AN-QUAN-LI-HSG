const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Team = sequelize.define('Team', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  grade: { type: DataTypes.STRING },
  subject: { type: DataTypes.STRING }
}, {
  timestamps: true
});

module.exports = Team;
