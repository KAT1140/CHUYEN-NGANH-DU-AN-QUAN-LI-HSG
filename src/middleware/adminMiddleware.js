// Middleware kiểm tra quyền admin
// Phải chạy sau auth middleware

exports.requireAdmin = function(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'No user' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin role required' });
  }

  next();
};

// Middleware kiểm tra user đã đăng nhập (bất kỳ role nào)
// Sử dụng cho các route cần xác thực cơ bản
exports.requireUser = function(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Login required' });
  }

  next();
};

// Middleware kiểm tra quyền giáo viên
// Teacher có thể xem tất cả đội và quản lý thành viên của mọi đội
exports.requireTeacher = function(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Login required' });
  }

  const { role } = req.user;
  if (role !== 'admin' && role !== 'teacher') {
    return res.status(403).json({ error: 'Forbidden: Teacher or Admin role required' });
  }

  next();
};
