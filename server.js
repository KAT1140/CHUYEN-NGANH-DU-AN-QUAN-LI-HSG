// File: server.js
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const PORT = process.env.PORT || 8080;

// 1. Kết nối Database
const { sequelize, connectDB } = require('./src/config/database');

// 2. Load Models (Chỉ load, KHÔNG setup quan hệ ở đây)
const User = require('./src/models/User');
const Team = require('./src/models/Team');
const Student = require('./src/models/student');
const Schedule = require('./src/models/Schedule');
const Score = require('./src/models/Score');
const Evaluation = require('./src/models/Evaluation');
const Teacher = require('./src/models/teacher');


// Đảm bảo load associations Sequelize trước khi khởi động app
require('./src/models/associations');

// 4. Middlewares
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'file://'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Proxy Helper & Routes
const http = require('http');
const https = require('https');
const os = require('os');

function probeUrl(url, timeout = 1000) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.request({ method: 'HEAD', hostname: u.hostname, port: u.port, path: u.pathname || '/', timeout }, (res) => { resolve(true); req.destroy(); });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.end();
    } catch (e) { resolve(false); }
  });
}

async function findViteServer() {
  const candidates = [];
  if (process.env.VITE_DEV_SERVER) candidates.push(process.env.VITE_DEV_SERVER);
  candidates.push('http://localhost:5173', 'http://127.0.0.1:5173');
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const nif of nets[name]) {
      if (nif.family === 'IPv4' && !nif.internal) { candidates.push(`http://${nif.address}:5173`); }
    }
  }
  for (const c of candidates) { if (await probeUrl(c, 1000)) return c; }
  return null;
}

// --- ĐĂNG KÝ ROUTES ---
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/teams', require('./src/routes/teamRoutes'));
app.use('/api/schedules', require('./src/routes/scheduleRoutes'));
app.use('/api/scores', require('./src/routes/scoreRoutes'));
app.use('/api/evaluations', require('./src/routes/evaluationRoutes'));
app.use('/api/students', require('./src/routes/studentRoutes'));
app.use('/api/teachers', require('./src/routes/teacherRoutes'));
app.use('/api/statistics', require('./src/routes/statisticsRoutes'));

// Serve frontend
const clientDist = path.join(__dirname, 'client', 'dist');
const clientIndex = path.join(__dirname, 'client', 'index.html');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else if (fs.existsSync(clientIndex)) {
  app.get('/', (req, res) => { res.sendFile(clientIndex); });
} else {
  app.get('/', (req, res) => res.send('HSG backend — API available at /api/*'));
}

// Start Server
const start = async () => {
  try {
    await connectDB();
    await sequelize.sync({ force: false }); // Chỉ tạo bảng nếu chưa có

    if (process.env.NODE_ENV !== 'production') {
      try {
        const { createProxyMiddleware } = require('http-proxy-middleware');
        const viteTarget = (await findViteServer()) || process.env.VITE_DEV_SERVER || 'http://localhost:5173';
        if (viteTarget) {
          app.use(['/src', '/@vite', '/@fs', '/node_modules'], createProxyMiddleware({ target: viteTarget, changeOrigin: true, ws: true, logLevel: 'warn' }));
          console.log('Vite proxy configured to', viteTarget);
        }
      } catch (err) { console.warn('Skipping Vite proxy'); }
    }

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
};

start();