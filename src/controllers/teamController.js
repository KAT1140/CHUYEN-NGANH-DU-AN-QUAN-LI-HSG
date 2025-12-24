const Team = require('../models/Team');
const Student = require('../models/student');
const User = require('../models/User'); 
const Teacher = require('../models/teacher');
const bcrypt = require('bcryptjs'); 
const saltRounds = 10; 
const { Op } = require('sequelize');

const handleSequelizeError = (err, res) => {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Mã số học sinh (hoặc Email) đã tồn tại.' });
    }
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    }
    console.error('Lỗi server:', err);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
};

// --- 1. LẤY DANH SÁCH ĐỘI (CÓ LỌC MÔN) ---
exports.getAll = async (req, res) => {
  try {
    const { id, role } = req.user;
    let teams;

    if (role === 'admin') {
      // Admin xem tất cả
      teams = await Team.findAll({
        include: [{ model: Student, as: 'members' }]
      });
    } else if (role === 'teacher') {
      // Teacher: Xem tất cả đội (để tham khảo) nhưng chỉ quản lý môn mình
      teams = await Team.findAll({
        include: [{ model: Student, as: 'members' }]
      });
    } else {
      // User thường: Chỉ xem đội mình tham gia
      const memberships = await Student.findAll({
        where: { userId: id },
        attributes: ['teamId']
      });

      const teamIds = memberships.map(m => m.teamId);

      if (teamIds.length === 0) {
        return res.json({ teams: [] });
      }

      teams = await Team.findAll({
        where: { id: { [Op.in]: teamIds } },
        include: [{ model: Student, as: 'members' }]
      });
    }
    
    res.json({ teams });
  } catch (err) {
    console.error('Error getAll teams:', err);
    res.status(500).json({ error: err.message });
  }
};

// --- 2. TẠO ĐỘI MỚI (TỰ GÁN MÔN) ---
exports.create = async (req, res) => {
  try {
    // Nếu là Teacher, tự động gán môn của đội = môn của Teacher
    if (req.user.role === 'teacher') {
      if (!req.user.subject) {
        return res.status(400).json({ error: 'Tài khoản giáo viên này chưa được gán môn dạy.' });
      }
      req.body.subject = req.user.subject;
    }
    // Nếu là Admin, subject sẽ được lấy từ req.body (gửi từ frontend)

    const team = await Team.create(req.body);
    res.status(201).json({ team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 3. XEM CHI TIẾT ĐỘI (CHECK QUYỀN) ---
exports.getById = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [{ model: Student, as: 'members' }]
    });
    if (!team) return res.status(404).json({ error: 'Not found' });
    
    // Check quyền User thường (phải là thành viên mới được xem)
    if (req.user.role === 'user') {
       const isMember = team.members.some(m => m.userId === req.user.id);
       if (!isMember) return res.status(403).json({ error: 'Bạn không có quyền xem đội này' });
    }
    
    // Check quyền Teacher (có thể xem tất cả team để tham khảo)
    // Không cần check môn ở đây nữa

    res.json({ team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 4. LẤY THÀNH VIÊN ---
exports.getMembersByTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    
    // Logic check quyền (giáo viên có thể xem tất cả team để tham khảo)
    // Không cần check môn ở đây nữa

    const members = await Student.findAll({ 
      where: { teamId }, 
      attributes: { exclude: ['teamId'] } 
    }); 
    res.json({ members });
  } catch (err) {
    console.error('Error getMembersByTeam:', err);
    res.status(500).json({ error: err.message });
  }
};

// --- 5. THÊM THÀNH VIÊN ---
exports.createMember = async (req, res) => {
  const { name, studentId, contact } = req.body;
  const teamId = req.params.teamId;
  const userId = req.user.id;
  const role = req.user.role;
  const defaultPassword = '123'; // Mật khẩu mặc định cho HS mới
  const email = studentId; 

  try {
    const team = await Team.findByPk(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Check quyền teacher đúng môn
    if (role === 'teacher') {
        if (!req.user.subject || team.subject !== req.user.subject) {
            return res.status(403).json({ error: 'Bạn không được thêm thành viên vào đội môn khác' });
        }
    }

    // Check user thường không được thêm
    if (role === 'user') {
         return res.status(403).json({ error: 'Bạn không có quyền này' });
    }

    // Logic tạo User nếu chưa có
    let targetUserId = req.body.userId;
    if (!targetUserId) {
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            targetUserId = existingUser.id;
        } else {
            const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
            const newUser = await User.create({
                name: name,
                email: email, 
                password: hashedPassword,
                role: 'user' 
            });
            targetUserId = newUser.id;
        }
    }
    
    // Kiểm tra đã có trong đội chưa
    const existingMember = await Student.findOne({
        where: { teamId, userId: targetUserId }
    });
    if (existingMember) {
        return res.status(400).json({ error: 'Thành viên này đã có trong đội.' });
    }

    const member = await Student.create({ teamId, name, studentId, contact, userId: targetUserId }); 

    res.status(201).json({ 
        member, 
        message: 'Thêm thành viên thành công' 
    });
  } catch (err) {
    handleSequelizeError(err, res);
  }
};

// --- 6. CẬP NHẬT THÀNH VIÊN ---
exports.updateMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const { name, studentId, contact } = req.body; 
    
    const member = await Student.findByPk(memberId);
    if (!member) return res.status(404).json({ error: 'Thành viên không tồn tại' });

    // Check quyền
    if (req.user.role === 'teacher') {
         const team = await Team.findByPk(member.teamId);
         if (team && team.subject !== req.user.subject) {
             return res.status(403).json({ error: 'Không có quyền chỉnh sửa' });
         }
    }

    // Cập nhật thông tin User gốc nếu cần
    if (member.userId) {
      const user = await User.findByPk(member.userId);
      if (user) {
          if (studentId && studentId !== user.email) {
              const existingUser = await User.findOne({ where: { email: studentId } });
              if (existingUser && existingUser.id !== user.id) {
                   return res.status(400).json({ error: 'Mã số học sinh mới trùng với tài khoản khác.' });
              }
              await user.update({ name, email: studentId }); 
          } else {
              await user.update({ name }); 
          }
      }
    }

    await member.update({ name, studentId, contact });
    
    res.json({ message: 'Cập nhật thành viên thành công', member });
  } catch (err) {
    handleSequelizeError(err, res);
  }
};

// --- 7. XÓA THÀNH VIÊN ---
exports.deleteMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const member = await Student.findByPk(memberId);
    if (!member) return res.status(404).json({ error: 'Thành viên không tồn tại' });

    // Check quyền
    if (req.user.role === 'teacher') {
         const team = await Team.findByPk(member.teamId);
         if (team && team.subject !== req.user.subject) {
             return res.status(403).json({ error: 'Không có quyền xóa' });
         }
    }
    
    await member.destroy();
    res.json({ message: 'Đã xóa thành viên khỏi đội.' });
  } catch (err) {
    handleSequelizeError(err, res);
  }
};

// --- 8. XÓA ĐỘI (CHỈ ADMIN VÀ TEACHER CÓ QUYỀN) ---
exports.deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    const team = await Team.findByPk(teamId);
    if (!team) return res.status(404).json({ error: 'Đội không tồn tại' });

    // Check quyền: Chỉ Admin hoặc Teacher cùng môn mới được xóa
    if (req.user.role === 'user') {
      return res.status(403).json({ error: 'Bạn không có quyền xóa đội' });
    }

    if (req.user.role === 'teacher') {
      // Lấy thông tin giáo viên từ database
      const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
      if (!teacher || !teacher.subject || team.subject !== teacher.subject) {
        return res.status(403).json({ error: 'Bạn chỉ có quyền xóa đội cùng môn' });
      }
    }

    await team.destroy();
    res.json({ message: 'Đã xóa đội thành công' });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = exports;