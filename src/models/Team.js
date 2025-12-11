const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


const Team = sequelize.define('Team', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  grade: { type: DataTypes.STRING }
});

module.exports = Team;

// Require Member sau khi Team đã được export
const Member = require('./Member');

Team.hasMany(Member, { foreignKey: 'teamId', as: 'members' });
Member.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

module.exports = Team;
