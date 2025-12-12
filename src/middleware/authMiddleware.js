// File: src/middleware/authMiddleware.js (ĐÃ SỬA LỖI EXPORT)

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// CHUYỂN THÀNH NAMED EXPORT: exports.auth
exports.auth = function(req, res, next){
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // Payload chứa role (đã sửa ở bước trước)
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Middleware Phân quyền Admin (giữ nguyên named export)
exports.admin = (req, res, next) => {
    // Kiểm tra role: user phải có quyền admin
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            error: 'Không có quyền truy cập. Chỉ Admin mới được phép thực hiện chức năng này.',
        });
    }
}