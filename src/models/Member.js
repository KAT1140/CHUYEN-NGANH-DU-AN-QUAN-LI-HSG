const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Member = sequelize.define('Member', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  studentId: { type: DataTypes.STRING, unique: true, allowNull: false }, // Mã số học sinh
  contact: { type: DataTypes.STRING }, // Thông tin liên hệ
  teamId: { // Khóa ngoại liên kết với Team
    type: DataTypes.INTEGER,
    references: {
      model: 'Teams', // Tên bảng Team
      key: 'id'
    },
    allowNull: false
  }
});

module.exports = Member;