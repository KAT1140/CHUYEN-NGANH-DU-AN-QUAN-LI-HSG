const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Score = sequelize.define('Score', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  memberId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'Members',
      key: 'id'
    }
  },
  testName: { type: DataTypes.STRING, allowNull: false },
  score: { type: DataTypes.FLOAT, allowNull: false },
  maxScore: { type: DataTypes.FLOAT, defaultValue: 10 },
  examDate: { type: DataTypes.DATEONLY, allowNull: true },
  notes: { type: DataTypes.TEXT },
  createdBy: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Score;
