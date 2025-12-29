// File: src/controllers/scoreController.js

const Score = require('../models/Score');
const Student = require('../models/student');
const User = require('../models/User');
const Team = require('../models/Team');
const Teacher = require('../models/teacher');
const { Op } = require('sequelize');

// Get scores (Phân quyền: User chỉ xem của mình, Teacher xem môn của mình, Admin xem hết)
exports.getAll = async (req, res) => {
  try {
    const { id, role } = req.user;
    let whereClause = {};
    let include = [
      { 
        model: Student, 
        as: 'member', 
        include: [{ 
          model: Team, 
          as: 'team'
        }] 
      },
      { 
        model: User, 
        as: 'creator', 
        attributes: ['id', 'name', 'email'] 
      }
    ];

    if (role === 'user') {
      // Học sinh xem điểm của mình + điểm HSG các năm trước của môn mình
      const student = await Student.findOne({ 
        where: { userId: id },
        include: [{ model: Team, as: 'team' }]
      });
      
      if (!student) {
        return res.json({ scores: [] });
      }

      // Điều kiện: điểm của học sinh này HOẶC điểm HSG cấp tỉnh của môn mình (các năm trước)
      whereClause = {
        [Op.or]: [
          { memberId: student.id }, // Điểm của mình
          {
            // Điểm HSG cấp tỉnh của môn mình (các năm trước để tham khảo)
            testName: 'HSG cấp tỉnh',
            '$member.team.subject$': student.team?.subject || null
          }
        ]
      };
    } else if (role === 'teacher') {
      // Teacher: Xem tất cả điểm (để tham khảo) nhưng chỉ quản lý môn mình
      // Không cần lọc ở đây, sẽ lọc ở phần create/update/delete
    }
    // Admin: whereClause rỗng -> Lấy tất cả

    const scores = await Score.findAll({
      where: whereClause,
      include,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ scores });
  } catch (err) {
    console.error('Error getAll scores:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get scores by member
exports.getByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const scores = await Score.findAll({
      where: { memberId },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
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

    // Nếu là giáo viên, kiểm tra quyền
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
      maxScore: maxScore || (testName === 'HSG cấp tỉnh' ? 20 : 10),
      examDate,
      notes,
      createdBy: req.user.id
    });

    // Tự động tính giải thưởng cho HSG cấp tỉnh
    if (testName === 'HSG cấp tỉnh') {
      const percentage = (score / (maxScore || 20)) * 100;
      let award = null;
      
      if (percentage >= 90) {
        award = 'Giải Nhất';
      } else if (percentage >= 80) {
        award = 'Giải Nhì';
      } else if (percentage >= 70) {
        award = 'Giải Ba';
      } else if (percentage >= 60) {
        award = 'Giải Khuyến khích';
      }
      
      if (award) {
        await newScore.update({ award });
      }
    }

    const scoreWithRelations = await Score.findByPk(newScore.id, {
      include: [
        { model: Student, as: 'member' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
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

    // Kiểm tra quyền
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

    // Tự động tính lại giải thưởng cho HSG cấp tỉnh
    const finalTestName = testName || scoreRecord.testName;
    const finalScore = score !== undefined ? score : scoreRecord.score;
    const finalMaxScore = maxScore || scoreRecord.maxScore;
    
    if (finalTestName === 'HSG cấp tỉnh') {
      const percentage = (finalScore / finalMaxScore) * 100;
      let award = null;
      
      if (percentage >= 90) {
        award = 'Giải Nhất';
      } else if (percentage >= 80) {
        award = 'Giải Nhì';
      } else if (percentage >= 70) {
        award = 'Giải Ba';
      } else if (percentage >= 60) {
        award = 'Giải Khuyến khích';
      }
      
      await scoreRecord.update({ award });
    }

    const updated = await Score.findByPk(id, {
      include: [
        { model: Student, as: 'member' },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
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

    // Kiểm tra quyền
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