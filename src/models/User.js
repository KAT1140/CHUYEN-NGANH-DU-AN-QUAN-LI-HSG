// ... existing code ...
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { 
    type: DataTypes.ENUM('admin', 'teacher', 'user'), 
    allowNull: false, 
    defaultValue: 'user' 
  },
}, {
  timestamps: true
});

module.exports = User;