const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');

const Team = sequelize.define('Team', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  grade: { type: DataTypes.STRING }
});
Team.hasMany(Member, { foreignKey: 'teamId', as: 'members' });

module.exports = Team;
