const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection OK');

    const hashedPassword = await bcrypt.hash('123456', 10);

    const admin = await User.create({
      name: 'Admin Nam',
      email: 'namvokat@gmail.com',
      password: hashedPassword,
      role: 'admin',
      subject: null
    });

    console.log('✅ Admin created:', admin.toJSON());
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seedAdmin();
