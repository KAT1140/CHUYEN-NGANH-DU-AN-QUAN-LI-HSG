// File: src/middleware/authMiddleware.js (ĐÃ SỬA LỖI XUNG ĐỘT EXPORT)

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// CHUYỂN THÀNH NAMED EXPORT: exports.auth (Đây là hàm bảo vệ)
exports.auth = function(req, res, next){
  const authHeader = req.headers.authorization;
  // Kiểm tra header Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
// BỎ HOÀN TOÀN: exports.admin và module.exports = function(...)