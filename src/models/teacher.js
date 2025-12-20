const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Môn dạy/ôn (Toán, Lý, Hóa, Sinh, Văn, Anh, Sử, Địa, GDCD)'
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tổ môn (Tổ Toán, Tổ Lý, Tổ Hóa-Sinh, Tổ Văn-Sử-Địa, Tổ Ngoại ngữ)'
  },
  specialization: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Chuyên môn sâu / Lĩnh vực ôn tập đặc biệt'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phoneNumber: {
    type: DataTypes.STRING
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    },
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'teachers'
});

module.exports = Teacher;