const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

// Load associations
require('../src/models/associations');

async function resetAllPasswords() {
  try {
    console.log('=== RESETTING ALL USER PASSWORDS TO 123456 ===');
    
    // Lấy tất cả users
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role']
    });
    
    console.log(`📊 Found ${users.length} user accounts`);
    
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    let resetCount = 0;
    const roleStats = {};
    
    for (const user of users) {
      try {
        await user.update({ password: hashedPassword });
        resetCount++;
        
        // Thống kê theo role
        roleStats[user.role] = (roleStats[user.role] || 0) + 1;
        
        if (resetCount <= 15) {
          console.log(`✅ Reset: ${user.name} (${user.email}) - ${user.role}`);
        }
      } catch (err) {
        console.log(`❌ Failed to reset: ${user.name} - ${err.message}`);
      }
    }
    
    console.log(`\n📈 Results:`);
    console.log(`✅ Successfully reset ${resetCount}/${users.length} passwords`);
    console.log(`🔑 New password for ALL accounts: "${newPassword}"`);
    
    console.log('\n📊 Reset by role:');
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`- ${role || 'empty'}: ${count} accounts`);
    });
    
    // Hiển thị sample accounts theo role
    console.log('\n📋 Sample accounts by role (all with password "123456"):');
    
    // Admin
    const admin = users.find(u => u.role === 'admin');
    if (admin) {
      console.log(`👑 ADMIN: ${admin.name} | ${admin.email}`);
    }
    
    // Teachers
    const teachers = users.filter(u => u.role === 'teacher').slice(0, 5);
    console.log('\n👨‍🏫 TEACHERS:');
    teachers.forEach((teacher, index) => {
      console.log(`${index + 1}. ${teacher.name} | ${teacher.email}`);
    });
    
    // Students
    const students = users.filter(u => u.role === 'user').slice(0, 5);
    console.log('\n👨‍🎓 STUDENTS:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} | ${student.email}`);
    });
    
    // Test login với admin
    console.log('\n🧪 Testing admin login...');
    if (admin) {
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: admin.email,
            password: newPassword
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('✅ Admin login test successful');
          console.log(`👤 Logged in as: ${result.user?.name} (${result.user?.role})`);
        } else {
          console.log('❌ Admin login test failed');
          console.log(`📝 Error: ${result.error || result.message}`);
        }
      } catch (apiError) {
        console.log('❌ API test failed:', apiError.message);
      }
    }
    
    // Test login với teacher
    console.log('\n🧪 Testing teacher login...');
    if (teachers.length > 0) {
      const testTeacher = teachers[0];
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: testTeacher.email,
            password: newPassword
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('✅ Teacher login test successful');
          console.log(`👤 Logged in as: ${result.user?.name} (${result.user?.role})`);
        } else {
          console.log('❌ Teacher login test failed');
          console.log(`📝 Error: ${result.error || result.message}`);
        }
      } catch (apiError) {
        console.log('❌ API test failed:', apiError.message);
      }
    }
    
    // Test login với student
    console.log('\n🧪 Testing student login...');
    if (students.length > 0) {
      const testStudent = students[0];
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: testStudent.email,
            password: newPassword
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('✅ Student login test successful');
          console.log(`👤 Logged in as: ${result.user?.name} (${result.user?.role})`);
        } else {
          console.log('❌ Student login test failed');
          console.log(`📝 Error: ${result.error || result.message}`);
        }
      } catch (apiError) {
        console.log('❌ API test failed:', apiError.message);
      }
    }
    
    console.log('\n✅ ALL PASSWORDS RESET COMPLETED!');
    console.log('\n🎯 LOGIN CREDENTIALS:');
    console.log('Password for ALL accounts: 123456');
    console.log(`Admin: ${admin?.email || 'Not found'}`);
    console.log(`Sample Teacher: ${teachers[0]?.email || 'Not found'}`);
    console.log(`Sample Student: ${students[0]?.email || 'Not found'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

resetAllPasswords();