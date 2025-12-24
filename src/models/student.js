const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  studentId: { type: DataTypes.STRING, allowNull: false }, // Mã số học sinh
  grade: { type: DataTypes.STRING }, // Khối (10, 11, 12)
  className: { type: DataTypes.STRING }, // Tên lớp (10A1, 11B2, 12C3, ...)
  contact: { type: DataTypes.STRING }, // Thông tin liên hệ
  teamId: { // Khóa ngoại liên kết với Team
    type: DataTypes.INTEGER,
    references: {
      model: 'Teams',
      key: 'id'
    },
    allowNull: true // Cho phép null - học sinh chưa có team
  },
  userId: { // Khóa ngoại liên kết với User (nếu student cũng là user trong hệ thống)
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    },
    allowNull: true
  }
}, {
  tableName: 'students' // Đặt tên bảng là 'students'
});

module.exports = Student;