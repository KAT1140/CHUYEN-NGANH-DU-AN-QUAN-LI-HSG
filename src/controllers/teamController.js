const Team = require('../models/Team');
const Student = require('../models/student');
const User = require('../models/User'); 
const Teacher = require('../models/teacher');
const TeamTeacher = require('../models/TeamTeacher');
const bcrypt = require('bcryptjs'); 
const saltRounds = 10; 
const { Op } = require('sequelize');

// Import associations
require('../models/associations');

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
        include: [
          { model: Student, as: 'members' },
          {
            model: TeamTeacher,
            as: 'teamTeachers',
            include: [
              {
                model: User,
                as: 'teacher',
                attributes: ['id', 'name', 'email']
              }
            ]
          }
        ]
      });
    } else if (role === 'teacher') {
      // Teacher: Xem tất cả đội (để tham khảo) nhưng chỉ quản lý môn mình
      teams = await Team.findAll({
        include: [
          { model: Student, as: 'members' },
          {
            model: TeamTeacher,
            as: 'teamTeachers',
            include: [
              {
                model: User,
                as: 'teacher',
                attributes: ['id', 'name', 'email']
              }
            ]
          }
        ]
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
        include: [
          { model: Student, as: 'members' },
          {
            model: TeamTeacher,
            as: 'teamTeachers',
            include: [
              {
                model: User,
                as: 'teacher',
                attributes: ['id', 'name', 'email']
              }
            ]
          }
        ]
      });
    }
    
    // Format response to include teachers info
    const formattedTeams = teams.map(team => ({
      ...team.toJSON(),
      teachers: team.teamTeachers ? team.teamTeachers.map(tt => ({
        id: tt.teacher.id,
        name: tt.teacher.name,
        email: tt.teacher.email,
        role: tt.role,
        isActive: tt.isActive,
        startDate: tt.startDate,
        endDate: tt.endDate,
        notes: tt.notes
      })) : []
    }));
    
    res.json({ teams: formattedTeams });
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
      include: [
        { model: Student, as: 'members' },
        {
          model: TeamTeacher,
          as: 'teamTeachers',
          include: [
            {
              model: User,
              as: 'teacher',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });
    if (!team) return res.status(404).json({ error: 'Not found' });
    
    // Check quyền User thường (phải là thành viên mới được xem)
    if (req.user.role === 'user') {
       const isMember = team.members.some(m => m.userId === req.user.id);
       if (!isMember) return res.status(403).json({ error: 'Bạn không có quyền xem đội này' });
    }
    
    // Format response to include teachers info
    const formattedTeam = {
      ...team.toJSON(),
      teachers: team.teamTeachers ? team.teamTeachers.map(tt => ({
        id: tt.teacher.id,
        name: tt.teacher.name,
        email: tt.teacher.email,
        role: tt.role,
        isActive: tt.isActive,
        startDate: tt.startDate,
        endDate: tt.endDate,
        notes: tt.notes
      })) : []
    };

    res.json({ team: formattedTeam });
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

    // Check quyền: chỉ admin hoặc chủ nhiệm của đội đó mới được thêm thành viên
    if (role === 'user') {
         return res.status(403).json({ error: 'Bạn không có quyền này' });
    }
    
    if (role === 'teacher') {
        // Kiểm tra xem giáo viên có phải là chủ nhiệm của đội này không
        const isMainTeacher = await TeamTeacher.findOne({
          where: {
            teamId,
            teacherId: userId,
            role: 'main'
          }
        });
        
        if (!isMainTeacher) {
          return res.status(403).json({ 
            error: 'Chỉ có chủ nhiệm hoặc admin mới có thể thêm thành viên vào đội' 
          });
        }
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

    // Check quyền: chỉ admin hoặc chủ nhiệm của đội đó mới được sửa thành viên
    if (req.user.role === 'user') {
      return res.status(403).json({ error: 'Bạn không có quyền này' });
    }
    
    if (req.user.role === 'teacher') {
        const team = await Team.findByPk(member.teamId);
        if (team) {
          // Kiểm tra xem giáo viên có phải là chủ nhiệm của đội này không
          const isMainTeacher = await TeamTeacher.findOne({
            where: {
              teamId: team.id,
              teacherId: req.user.id,
              role: 'main'
            }
          });
          
          if (!isMainTeacher) {
            return res.status(403).json({ 
              error: 'Chỉ có chủ nhiệm hoặc admin mới có thể sửa thành viên' 
            });
          }
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

    // Check quyền: chỉ admin hoặc chủ nhiệm của đội đó mới được xóa thành viên
    if (req.user.role === 'user') {
      return res.status(403).json({ error: 'Bạn không có quyền này' });
    }
    
    if (req.user.role === 'teacher') {
         const team = await Team.findByPk(member.teamId);
         if (team) {
           // Kiểm tra xem giáo viên có phải là chủ nhiệm của đội này không
           const isMainTeacher = await TeamTeacher.findOne({
             where: {
               teamId: team.id,
               teacherId: req.user.id,
               role: 'main'
             }
           });
           
           if (!isMainTeacher) {
             return res.status(403).json({ 
               error: 'Chỉ có chủ nhiệm hoặc admin mới có thể xóa thành viên' 
             });
           }
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

    // Check quyền: Chỉ Admin hoặc chủ nhiệm của đội đó mới được xóa
    if (req.user.role === 'user') {
      return res.status(403).json({ error: 'Bạn không có quyền xóa đội' });
    }

    if (req.user.role === 'teacher') {
      // Kiểm tra xem giáo viên có phải là chủ nhiệm của đội này không
      const isMainTeacher = await TeamTeacher.findOne({
        where: {
          teamId,
          teacherId: req.user.id,
          role: 'main'
        }
      });
      
      if (!isMainTeacher) {
        return res.status(403).json({ 
          error: 'Chỉ có chủ nhiệm hoặc admin mới có thể xóa đội' 
        });
      }
    }

    await team.destroy();
    res.json({ message: 'Đã xóa đội thành công' });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ error: err.message });
  }
};

// --- 9. LẤY ROLE CỦA GIÁO VIÊN TRONG ĐỘI ---
exports.getTeacherRole = async (req, res) => {
  try {
    const { id, role } = req.user;
    
    if (role !== 'teacher') {
      return res.status(403).json({ error: 'Chỉ giáo viên mới có thể gọi API này' });
    }

    // Tìm role của giáo viên trong đội
    const teamTeacher = await TeamTeacher.findOne({
      where: { teacherId: id, isActive: true },
      include: [
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'subject']
        }
      ]
    });

    if (!teamTeacher) {
      return res.json({ role: null, team: null });
    }

    res.json({ 
      role: teamTeacher.role, // 'main' hoặc 'co-teacher'
      team: teamTeacher.team
    });
  } catch (err) {
    console.error('Error getting teacher role:', err);
    res.status(500).json({ error: err.message });
  }
};

// --- 10. THÊM GIÁO VIÊN VÀO ĐỘI ---
exports.addTeacherToTeam = async (req, res) => {
  try {
    const { teamId, teacherId, role = 'co-teacher' } = req.body;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Kiểm tra quyền: chỉ admin hoặc chủ nhiệm của đội này mới được thêm giáo viên
    if (currentUserRole !== 'admin') {
      if (currentUserRole !== 'teacher') {
        return res.status(403).json({ error: 'Bạn không có quyền thêm giáo viên vào đội' });
      }
      
      // Kiểm tra teacher hiện tại có phải chủ nhiệm của đội này không
      const isMainTeacher = await TeamTeacher.findOne({
        where: { 
          teamId: teamId, 
          teacherId: currentUserId, 
          role: 'main'
        }
      });
      
      if (!isMainTeacher) {
        return res.status(403).json({ error: 'Chỉ có chủ nhiệm hoặc admin mới có thể thêm giáo viên vào đội' });
      }
    }

    // Kiểm tra đội có tồn tại không
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Đội không tồn tại' });
    }

    // Kiểm tra giáo viên có tồn tại không
    const teacher = await User.findOne({
      where: { id: teacherId, role: 'teacher' }
    });
    if (!teacher) {
      return res.status(404).json({ error: 'Giáo viên không tồn tại' });
    }

    // Kiểm tra giáo viên đã có trong đội chưa
    const existingTeamTeacher = await TeamTeacher.findOne({
      where: { teamId, teacherId }
    });
    if (existingTeamTeacher) {
      return res.status(400).json({ error: 'Giáo viên này đã có trong đội' });
    }

    // Thêm giáo viên vào đội
    const teamTeacher = await TeamTeacher.create({
      teamId,
      teacherId,
      role,
      isActive: true,
      startDate: new Date()
    });

    res.status(201).json({ 
      message: 'Thêm giáo viên vào đội thành công',
      teamTeacher 
    });
  } catch (err) {
    console.error('Error adding teacher to team:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = exports;

// Lấy danh sách team mà giáo viên hiện tại là chủ nhiệm
exports.getTeacherTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Tìm các team mà user này là chủ nhiệm (role = 'main')
    const teamTeachers = await TeamTeacher.findAll({
      where: {
        teacherId: userId,
        role: 'main'
      },
      include: [{
        model: Team,
        as: 'team',
        attributes: ['id', 'name', 'subject', 'grade']
      }]
    });
    
    const teams = teamTeachers.map(tt => tt.team);
    
    res.json({ teams });
  } catch (err) {
    console.error('Error fetching teacher teams:', err);
    res.status(500).json({ error: err.message });
  }
};