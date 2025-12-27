const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeamTeacher = sequelize.define('TeamTeacher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teamId: { 
    type: DataTypes.INTEGER,
    references: {
      model: 'Teams',
      key: 'id'
    },
    allowNull: false,
    comment: 'ID của đội tuyển'
  },
  teacherId: { 
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    },
    allowNull: false,
    comment: 'ID của giáo viên'
  },
  role: {
    type: DataTypes.ENUM('main', 'co-teacher'),
    defaultValue: 'co-teacher',
    comment: 'Vai trò: main (trưởng nhóm), co-teacher (đồng giảng dạy)'
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Ngày bắt đầu ôn tập'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Ngày kết thúc ôn tập (null = vô thời hạn)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Trạng thái hoạt động'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ghi chú về chuyên môn, kinh nghiệm của giáo viên'
  }
}, {
  tableName: 'team_teachers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['teamId', 'teacherId'],
      name: 'unique_team_teacher'
    }
  ]
});

module.exports = TeamTeacher;