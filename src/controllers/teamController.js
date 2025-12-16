const Team = require('../models/Team');
const Member = require('../models/Member');
const User = require('../models/User'); 
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
    const { id, role, subject } = req.user; // Lấy thêm subject từ token user
    let teams;

    if (role === 'admin') {
      // Admin xem tất cả
      teams = await Team.findAll({
        include: [{ model: Member, as: 'members' }]
      });
    } else if (role === 'teacher') {
      // Teacher: Chỉ xem đội có cùng môn với mình
      let whereCondition = {};
      
      if (subject) {
        whereCondition = { subject: subject };
      } else {
        // Nếu giáo viên không có môn (dữ liệu cũ), trả về rỗng để an toàn
        return res.json({ teams: [] });
      }

      teams = await Team.findAll({
        where: whereCondition,
        include: [{ model: Member, as: 'members' }]
      });
    } else {
      // User thường: Chỉ xem đội mình tham gia
      const memberships = await Member.findAll({
        where: { userId: id },
        attributes: ['teamId']
      });

      const teamIds = memberships.map(m => m.teamId);

      if (teamIds.length === 0) {
        return res.json({ teams: [] });
      }

      teams = await Team.findAll({
        where: { id: { [Op.in]: teamIds } },
        include: [{ model: Member, as: 'members' }]
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
      include: [{ model: Member, as: 'members' }]
    });
    if (!team) return res.status(404).json({ error: 'Not found' });
    
    // Check quyền User thường (phải là thành viên mới được xem)
    if (req.user.role === 'user') {
       const isMember = team.members.some(m => m.userId === req.user.id);
       if (!isMember) return res.status(403).json({ error: 'Bạn không có quyền xem đội này' });
    }
    
    // Check quyền Teacher (phải đúng môn)
    if (req.user.role === 'teacher') {
        if (!req.user.subject || team.subject !== req.user.subject) {
            return res.status(403).json({ error: 'Bạn không được phép xem đội thuộc môn khác' });
        }
    }

    res.json({ team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 4. LẤY THÀNH VIÊN ---
exports.getMembersByTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    
    // Logic check quyền (để an toàn)
    if (req.user.role === 'teacher') {
        const team = await Team.findByPk(teamId);
        if (team && team.subject !== req.user.subject) {
             return res.status(403).json({ error: 'Không có quyền truy cập' });
        }
    }

    const members = await Member.findAll({ 
      where: { teamId }, 
      attributes: { exclude: ['teamId'] } 
    }); 
    res.json({ members });
  } catch (err) {
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
    const existingMember = await Member.findOne({
        where: { teamId, userId: targetUserId }
    });
    if (existingMember) {
        return res.status(400).json({ error: 'Thành viên này đã có trong đội.' });
    }

    const member = await Member.create({ teamId, name, studentId, contact, userId: targetUserId }); 

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
    
    const member = await Member.findByPk(memberId);
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
    const member = await Member.findByPk(memberId);
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

module.exports = exports;