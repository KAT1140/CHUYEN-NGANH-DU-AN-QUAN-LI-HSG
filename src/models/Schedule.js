const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATEONLY, allowNull: false }, // Lưu chỉ ngày YYYY-MM-DD
  time: { type: DataTypes.TIME }, // HH:mm:ss
  type: { 
    type: DataTypes.ENUM('event', 'meeting'), 
    allowNull: false, 
    defaultValue: 'event' 
  },
  createdBy: { // User tạo lịch
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    },
    allowNull: false
  }
});

// Associations
const User = require('./User');
Schedule.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Schedule, { foreignKey: 'createdBy', as: 'schedules' });

module.exports = Schedule;
