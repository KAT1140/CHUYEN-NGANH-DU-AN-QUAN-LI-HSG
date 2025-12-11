const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

module.exports = function(req, res, next){
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
// Middleware bảo vệ route 
exports.auth = function(req, res, next){
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // Payload chứa role
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
};
