const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const PORT = process.env.PORT || 8080;

// Sequelize setup
const { sequelize, connectDB } = require('./src/config/database');

// --- 1. LOAD MODELS ---
require('./src/models/User');
require('./src/models/Team');
require('./src/models/Member');
require('./src/models/Schedule');
require('./src/models/Score');
require('./src/models/Evaluation'); // <--- [QUAN TRỌNG] Load model Đánh giá

// --- 2. SETUP ASSOCIATIONS (MỐI QUAN HỆ) ---
const User = require('./src/models/User');
const Team = require('./src/models/Team');
const Member = require('./src/models/Member');
const Schedule = require('./src/models/Schedule');
const Score = require('./src/models/Score');
const Evaluation = require('./src/models/Evaluation'); // <--- [QUAN TRỌNG]

// Score associations
Score.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
Score.belongsTo(User, { foreignKey: 'createdBy', as: 'teacher' });
Member.hasMany(Score, { foreignKey: 'memberId', as: 'scores' });

// Evaluation associations (MỚI)
Evaluation.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
Evaluation.belongsTo(User, { foreignKey: 'createdBy', as: 'teacher' });
Member.hasMany(Evaluation, { foreignKey: 'memberId', as: 'evaluations' });

// Team & Member associations
Team.hasMany(Member, { foreignKey: 'teamId', as: 'members' });
Member.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Member.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Member, { foreignKey: 'userId', as: 'teamMembers' });

// Schedule associations
Schedule.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Schedule, { foreignKey: 'createdBy', as: 'schedules' });

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- 3. PROXY & DEV SERVER HELPERS (GIỮ NGUYÊN) ---
const http = require('http');
const https = require('https');
const os = require('os');

function probeUrl(url, timeout = 1000) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.request({ method: 'HEAD', hostname: u.hostname, port: u.port, path: u.pathname || '/', timeout }, (res) => {
        resolve(true);
        req.destroy();
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch (e) {
      resolve(false);
    }
  });
}

async function findViteServer() {
  const candidates = [];
  if (process.env.VITE_DEV_SERVER) candidates.push(process.env.VITE_DEV_SERVER);
  candidates.push('http://localhost:5173', 'http://127.0.0.1:5173');
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const nif of nets[name]) {
      if (nif.family === 'IPv4' && !nif.internal) {
        candidates.push(`http://${nif.address}:5173`);
      }
    }
  }
  for (const c of candidates) {
    if (await probeUrl(c, 1000)) return c;
  }
  return null;
}

// --- 4. ROUTES (ĐĂNG KÝ ĐƯỜNG DẪN API) ---
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/teams', require('./src/routes/teamRoutes'));
app.use('/api/schedules', require('./src/routes/scheduleRoutes'));
app.use('/api/scores', require('./src/routes/scoreRoutes'));
app.use('/api/evaluations', require('./src/routes/evaluationRoutes')); // <--- [ĐÃ THÊM] Đánh giá
app.use('/api/students', require('./src/routes/studentRoutes'));       // <--- [ĐÃ THÊM] Quản lý sinh viên

// --- 5. SERVE FRONTEND ---
const clientDist = path.join(__dirname, 'client', 'dist');
const clientIndex = path.join(__dirname, 'client', 'index.html');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else if (fs.existsSync(clientIndex)) {
  app.get('/', (req, res) => {
    res.sendFile(clientIndex);
  });
} else {
  app.get('/', (req, res) => res.send('HSG backend — API available at /api/*'));
}

const start = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true }); // Cập nhật bảng DB

    // Setup Vite Proxy for Development
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { createProxyMiddleware } = require('http-proxy-middleware');
        const viteTarget = (await findViteServer()) || process.env.VITE_DEV_SERVER || 'http://localhost:5173';
        if (viteTarget) {
          app.use(['/src', '/@vite', '/@fs', '/node_modules'], createProxyMiddleware({
            target: viteTarget,
            changeOrigin: true,
            ws: true,
            logLevel: 'warn'
          }));
          console.log('Vite proxy configured to', viteTarget);
        } else {
          console.warn('No Vite dev server found; proxy not configured');
        }
      } catch (err) {
        console.warn('http-proxy-middleware not available; skipping Vite proxy (dev only)');
      }
    }

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
};

start();