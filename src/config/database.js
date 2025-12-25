const { Sequelize } = require('sequelize');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'hsg_management_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[OK] DB connection OK');
  } catch (err) {
    console.error('[ERROR] DB connection error', err);
    console.error('[INFO] DB connection parameters', {
      host: DB_HOST,
      port: DB_PORT,
      database: DB_NAME,
      user: DB_USER
    });
    console.error('[HINT] Ensure MySQL is running (XAMPP/Service) and credentials are correct.');
    throw err;
  }
};

module.exports = { sequelize, connectDB };
