// Script drop database và recreate
const { sequelize } = require('../src/config/database');

async function resetDB() {
  try {
    console.log('Dropping database...');
    await sequelize.drop();
    console.log('✅ Database dropped');
    
    console.log('Syncing models...');
    // Load all models
    require('../src/models/User');
    require('../src/models/Team');
    require('../src/models/Member');
    require('../src/models/Schedule');
    
    await sequelize.sync({ force: true });
    console.log('✅ Database recreated');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

resetDB();
