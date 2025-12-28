const { sequelize } = require('../src/config/database');
const Schedule = require('../src/models/Schedule');
const User = require('../src/models/User');

async function createSimpleSchedule() {
  try {
    console.log('Creating simple schedule...');
    
    const admin = await User.findOne({ where: { role: 'admin' } });
    console.log('Admin found:', admin.name);
    
    const schedule = await Schedule.create({
      title: 'Test Schedule',
      description: 'Test description',
      date: '2025-01-15',
      time: '08:00:00',
      type: 'event',
      subject: 'Toán',
      createdBy: admin.id
    });
    
    console.log('Schedule created:', schedule.id);
    
    const count = await Schedule.count();
    console.log('Total schedules:', count);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

createSimpleSchedule();