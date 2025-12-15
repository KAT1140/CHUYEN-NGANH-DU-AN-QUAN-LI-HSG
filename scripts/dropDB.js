// Drop database bằng connection mà không có database
const mysql = require('mysql2/promise');

async function dropAndCreateDB() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('Dropping database hsg_db...');
    await connection.execute('DROP DATABASE IF EXISTS hsg_db');
    console.log('✅ Database dropped');

    console.log('Creating database hsg_db...');
    await connection.execute('CREATE DATABASE hsg_db');
    console.log('✅ Database created');

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

dropAndCreateDB();
