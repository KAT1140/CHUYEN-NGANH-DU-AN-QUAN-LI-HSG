// File: src/models/Evaluation.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Evaluation = sequelize.define('Evaluation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  memberId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'students', // Lưu ý: Bảng này tên là 'students' trong DB của bạn
      key: 'id'
    }
  },
  content: { type: DataTypes.TEXT, allowNull: false }, // Nội dung nhận xét
  rating: { type: DataTypes.INTEGER, validate: { min: 1, max: 10 } }, // Điểm chuyên cần/thái độ (1-10)
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }, // Ngày đánh giá
  createdBy: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = Evaluation;