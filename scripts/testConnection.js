console.log('🔄 Testing database connection...');

const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');

async function test() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const userCount = await User.count();
    console.log(`👤 Found ${userCount} users`);
    
    const admin = await User.findOne({ where: { role: 'admin' } });
    console.log('👑 Admin:', admin ? admin.name : 'Not found');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();