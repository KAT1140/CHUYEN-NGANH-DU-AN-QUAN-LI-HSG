const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


const Team = sequelize.define('Team', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  grade: { type: DataTypes.STRING }
});

module.exports = Team;

// Require models sau khi Team đã được export
const Member = require('./Member');
const User = require('./User');

// Associations
Team.hasMany(Member, { foreignKey: 'teamId', as: 'members' });
Member.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

Member.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Member, { foreignKey: 'userId', as: 'teamMembers' });

module.exports = Team;
