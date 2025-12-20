// File: src/controllers/scoreController.js

const Score = require('../models/Score');
const Student = require('../models/Student');
const User = require('../models/User');
const Team = require('../models/Team');
const Teacher = require('../models/Teacher');
const { Op } = require('sequelize'); // Import Op để dùng toán tử tìm kiếm

// Get scores (Phân quyền: User chỉ xem của mình, Teacher xem môn của mình, Admin xem hết)
exports.getAll = async (req, res) => {
  try {
    const { id, role } = req.user; // Lấy ID và Role từ token đăng nhập
    let whereClause = {};
    let include = [
      { model: Student, as: 'member', include: [{ model: Team, as: 'team' }] },
      { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
    ];

    // LOGIC PHÂN QUYỀN TẠI ĐÂY
    if (role === 'user') {
      // Học sinh xem điểm: 
      // - Tiền bối (năm trước): xem tất cả
      // - Cùng khóa (năm hiện tại): chỉ xem người có giải (điểm >= 8)
      const currentYear = new Date().getFullYear();
      
      // Lấy tất cả điểm, sau đó filter ở JavaScript
      whereClause = {};
      
      // Fetch all scores first
      const allScores = await Score.findAll({
        where: whereClause,
        include,
        order: [['createdAt', 'DESC']]
      });
      
      // Filter: 
      // - Năm trước: chỉ xem điểm thi HSG chính thức
      // - Năm hiện tại: xem tất cả (HSG + điểm ôn), nhưng chỉ người có giải (>= 80%)
      const filteredScores = allScores.filter(score => {
        const scoreYear = new Date(score.createdAt).getFullYear();
        if (scoreYear < currentYear) {
          // Tiền bối: chỉ xem điểm thi HSG chính thức
          return score.testName && score.testName.includes('Kỳ thi HSG');
        } else {
          // Cùng khóa: xem tất cả (HSG + ôn tập), nhưng chỉ người có giải (điểm >= 8/10)
          const percentage = (score.score / score.maxScore) * 100;
          return percentage >= 80; // >= 80% = có giải
        }
      });
      
      // Lấy thông tin giáo viên bộ môn cho các điểm đã lọc
      const subjects = [...new Set(filteredScores.map(s => s.member?.team?.subject).filter(Boolean))];
      const subjectTeachers = await Teacher.findAll({
        where: { subject: subjects }
      });
      
      // Lấy userId của các giáo viên
      const teacherUserIds = subjectTeachers.map(t => t.userId).filter(Boolean);
      const teacherUsers = await User.findAll({
        where: { id: teacherUserIds },
        attributes: ['id', 'name', 'email']
      });
      
      const userMap = {};
      teacherUsers.forEach(u => {
        userMap[u.id] = u;
      });
      
      const teacherMap = {};
      subjectTeachers.forEach(t => {
        if (t.userId && userMap[t.userId]) {
          teacherMap[t.subject] = {
            name: userMap[t.userId].name,
            email: userMap[t.userId].email
          };
        } else {
          teacherMap[t.subject] = {
            name: t.fullName,
            email: t.email || 'N/A'
          };
        }
      });
      
      // Gắn thông tin giáo viên bộ môn vào mỗi điểm
      const scoresWithSubjectTeacher = filteredScores.map(score => {
        const scoreData = score.toJSON();
        const subject = scoreData.member?.team?.subject;
        if (subject && teacherMap[subject]) {
          scoreData.subjectTeacher = teacherMap[subject];
        } else {
          scoreData.subjectTeacher = { name: 'N/A', email: 'N/A' };
        }
        return scoreData;
      });
      
      return res.json({ scores: scoresWithSubjectTeacher });
    } else if (role === 'teacher') {
      // Teacher chỉ xem điểm của học sinh trong đội môn mình
      const teacher = await Teacher.findOne({ where: { userId: id } });
      
      if (!teacher || !teacher.subject) {
        return res.json({ scores: [] });
      }

      // Tìm tất cả học sinh trong các đội môn này
      const students = await Student.findAll({
        include: [{
          model: Team,
          as: 'team',
          where: { subject: teacher.subject }
        }],
        attributes: ['id']
      });

      const studentIds = students.map(s => s.id);
      
      if (studentIds.length === 0) {
        return res.json({ scores: [] });
      }

      whereClause = { memberId: studentIds };
    }
    // Admin: whereClause rỗng -> Lấy tất cả

    const scores = await Score.findAll({
      where: whereClause,
      include,
      order: [['createdAt', 'DESC']]
    });
    
    // Lấy thông tin giáo viên bộ môn cho mỗi điểm
    const subjects = [...new Set(scores.map(s => s.member?.team?.subject).filter(Boolean))];
    const subjectTeachers = await Teacher.findAll({
      where: { subject: subjects }
    });
    
    // Lấy userId của các giáo viên
    const teacherUserIds = subjectTeachers.map(t => t.userId).filter(Boolean);
    const teacherUsers = await User.findAll({
      where: { id: teacherUserIds },
      attributes: ['id', 'name', 'email']
    });
    
    const userMap = {};
    teacherUsers.forEach(u => {
      userMap[u.id] = u;
    });
    
    const teacherMap = {};
    subjectTeachers.forEach(t => {
      if (t.userId && userMap[t.userId]) {
        teacherMap[t.subject] = {
          name: userMap[t.userId].name,
          email: userMap[t.userId].email
        };
      } else {
        teacherMap[t.subject] = {
          name: t.fullName,
          email: t.email || 'N/A'
        };
      }
    });
    
    // Gắn thông tin giáo viên bộ môn vào mỗi điểm
    const scoresWithSubjectTeacher = scores.map(score => {
      const scoreData = score.toJSON();
      const subject = scoreData.member?.team?.subject;
      if (subject && teacherMap[subject]) {
        scoreData.subjectTeacher = teacherMap[subject];
      } else {
        scoreData.subjectTeacher = { name: 'N/A', email: 'N/A' };
      }
      return scoreData;
    });
    
    res.json({ scores: scoresWithSubjectTeacher });
  } catch (err) {
    console.error('Error getAll scores:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get scores by member (Giữ nguyên, nhưng thêm kiểm tra bảo mật nếu kỹ hơn)
exports.getByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const scores = await Score.findAll({
      where: { memberId },
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
      ],
      order: [['examDate', 'DESC']]
    });
    res.json({ scores });
  } catch (err) {
    console.error('Error getByMember scores:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create score (teacher/admin only)
exports.create = async (req, res) => {
  try {
    const { memberId, testName, score, maxScore, examDate, notes } = req.body;
    
    if (!memberId || !testName || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Kiểm tra học sinh có tồn tại không
    const student = await Student.findByPk(memberId, {
      include: [{ model: Team, as: 'team' }]
    });

    if (!student) {
      return res.status(404).json({ error: 'Học sinh không tồn tại' });
    }

    // Nếu là giáo viên, kiểm tra quyền (chỉ được nhập điểm cho học sinh trong đội môn của mình)
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
      
      if (!teacher || !teacher.subject) {
        return res.status(403).json({ error: 'Không tìm thấy thông tin giáo viên' });
      }

      if (!student.team || student.team.subject !== teacher.subject) {
        return res.status(403).json({ 
          error: `Bạn chỉ có thể nhập điểm cho học sinh trong đội môn ${teacher.subject}` 
        });
      }
    }

    const newScore = await Score.create({
      memberId,
      testName,
      score,
      maxScore: maxScore || 10,
      examDate,
      notes,
      createdBy: req.user.id
    });

    const scoreWithRelations = await Score.findByPk(newScore.id, {
      include: [
        { model: Student, as: 'member' },
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({ score: scoreWithRelations });
  } catch (err) {
    console.error('Error creating score:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update score (teacher/admin only)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { testName, score, maxScore, examDate, notes } = req.body;
    
    const scoreRecord = await Score.findByPk(id, {
      include: [{ model: Student, as: 'member', include: [{ model: Team, as: 'team' }] }]
    });
    
    if (!scoreRecord) {
      return res.status(404).json({ error: 'Score not found' });
    }

    // Kiểm tra quyền: Giáo viên chỉ sửa điểm của học sinh trong đội môn mình
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
      
      if (!teacher || !teacher.subject) {
        return res.status(403).json({ error: 'Không tìm thấy thông tin giáo viên' });
      }

      if (!scoreRecord.member?.team || scoreRecord.member.team.subject !== teacher.subject) {
        return res.status(403).json({ 
          error: `Bạn chỉ có thể sửa điểm cho học sinh trong đội môn ${teacher.subject}` 
        });
      }
    }

    await scoreRecord.update({
      testName: testName || scoreRecord.testName,
      score: score !== undefined ? score : scoreRecord.score,
      maxScore: maxScore || scoreRecord.maxScore,
      examDate: examDate || scoreRecord.examDate,
      notes: notes !== undefined ? notes : scoreRecord.notes
    });

    const updated = await Score.findByPk(id, {
      include: [
        { model: Student, as: 'member' },
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({ score: updated });
  } catch (err) {
    console.error('Error updating score:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete score (teacher/admin only)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scoreRecord = await Score.findByPk(id, {
      include: [{ model: Student, as: 'member', include: [{ model: Team, as: 'team' }] }]
    });
    
    if (!scoreRecord) {
      return res.status(404).json({ error: 'Score not found' });
    }

    // Kiểm tra quyền: Giáo viên chỉ xóa điểm của học sinh trong đội môn mình
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
      
      if (!teacher || !teacher.subject) {
        return res.status(403).json({ error: 'Không tìm thấy thông tin giáo viên' });
      }

      if (!scoreRecord.member?.team || scoreRecord.member.team.subject !== teacher.subject) {
        return res.status(403).json({ 
          error: `Bạn chỉ có thể xóa điểm cho học sinh trong đội môn ${teacher.subject}` 
        });
      }
    }

    await scoreRecord.destroy();
    res.json({ message: 'Score deleted' });
  } catch (err) {
    console.error('Error deleting score:', err);
    res.status(500).json({ error: err.message });
  }
};