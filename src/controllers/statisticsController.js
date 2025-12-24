const Score = require('../models/Score');
const Student = require('../models/student');
const Team = require('../models/Team');
const Teacher = require('../models/teacher');
const User = require('../models/User');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Get statistics by year
exports.getStatsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const { id, role } = req.user;

    let whereClause = {};
    
    // Filter by year
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31 23:59:59`);
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Apply role-based filtering
    let studentIds = null;
    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: id } });
      if (teacher && teacher.subject) {
        const students = await Student.findAll({
          include: [{
            model: Team,
            as: 'team',
            where: { subject: teacher.subject }
          }],
          attributes: ['id']
        });
        studentIds = students.map(s => s.id);
      }
    } else if (role === 'user') {
      const members = await Student.findAll({ 
        where: { userId: id },
        attributes: ['id'] 
      });
      studentIds = members.map(m => m.id);
    }

    if (studentIds !== null) {
      whereClause.memberId = { [Op.in]: studentIds };
    }

    // Get scores statistics
    const scores = await Score.findAll({
      where: whereClause,
      include: [
        { 
          model: Student, 
          as: 'member',
          include: [{ model: Team, as: 'team' }]
        }
      ]
    });

    // Calculate statistics
    const stats = {
      year: year || new Date().getFullYear(),
      totalScores: scores.length,
      averageScore: 0,
      bySubject: {},
      byMonth: {},
      topStudents: []
    };

    if (scores.length > 0) {
      // Average score
      const totalScore = scores.reduce((sum, s) => sum + (s.score / s.maxScore * 10), 0);
      stats.averageScore = (totalScore / scores.length).toFixed(2);

      // Group by subject
      scores.forEach(score => {
        const subject = score.member?.team?.subject || 'Unknown';
        if (!stats.bySubject[subject]) {
          stats.bySubject[subject] = {
            count: 0,
            totalScore: 0,
            avgScore: 0
          };
        }
        stats.bySubject[subject].count++;
        stats.bySubject[subject].totalScore += (score.score / score.maxScore * 10);
      });

      // Calculate average by subject
      Object.keys(stats.bySubject).forEach(subject => {
        const data = stats.bySubject[subject];
        data.avgScore = (data.totalScore / data.count).toFixed(2);
      });

      // Group by month
      scores.forEach(score => {
        const month = new Date(score.createdAt).getMonth() + 1;
        if (!stats.byMonth[month]) {
          stats.byMonth[month] = {
            count: 0,
            totalScore: 0,
            avgScore: 0
          };
        }
        stats.byMonth[month].count++;
        stats.byMonth[month].totalScore += (score.score / score.maxScore * 10);
      });

      // Calculate average by month
      Object.keys(stats.byMonth).forEach(month => {
        const data = stats.byMonth[month];
        data.avgScore = (data.totalScore / data.count).toFixed(2);
      });

      // Top students
      const studentScores = {};
      scores.forEach(score => {
        const studentId = score.memberId;
        const studentName = score.member?.name || 'Unknown';
        if (!studentScores[studentId]) {
          studentScores[studentId] = {
            studentId,
            name: studentName,
            totalScore: 0,
            count: 0
          };
        }
        studentScores[studentId].totalScore += (score.score / score.maxScore * 10);
        studentScores[studentId].count++;
      });

      stats.topStudents = Object.values(studentScores)
        .map(s => ({
          ...s,
          avgScore: (s.totalScore / s.count).toFixed(2)
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 10);
    }

    res.json({ stats });
  } catch (err) {
    console.error('Error getStatsByYear:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get available years
exports.getAvailableYears = async (req, res) => {
  try {
    const { role, id } = req.user;
    
    let whereClause = {};
    
    // Apply role-based filtering
    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: id } });
      if (teacher && teacher.subject) {
        const students = await Student.findAll({
          include: [{
            model: Team,
            as: 'team',
            where: { subject: teacher.subject }
          }],
          attributes: ['id']
        });
        const studentIds = students.map(s => s.id);
        whereClause.memberId = { [Op.in]: studentIds };
      }
    } else if (role === 'user') {
      const members = await Student.findAll({ 
        where: { userId: id },
        attributes: ['id'] 
      });
      const studentIds = members.map(m => m.id);
      whereClause.memberId = { [Op.in]: studentIds };
    }

    const years = await Score.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.fn('YEAR', sequelize.col('createdAt'))), 'year']
      ],
      order: [[sequelize.fn('YEAR', sequelize.col('createdAt')), 'DESC']],
      raw: true
    });

    res.json({ years: years.map(y => y.year) });
  } catch (err) {
    console.error('Error getAvailableYears:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const Schedule = require('../models/Schedule');
    const dayjs = require('dayjs');
    const isoWeek = require('dayjs/plugin/isoWeek');
    dayjs.extend(isoWeek);

    // 1. Tổng số đội tuyển
    const totalTeams = await Team.count();

    // 2. Tổng số học sinh
    const totalStudents = await Student.count();

    // 3. Số buổi học trong tuần này
    const startOfWeek = dayjs().startOf('isoWeek').toDate();
    const endOfWeek = dayjs().endOf('isoWeek').toDate();
    
    const schedulesThisWeek = await Schedule.count({
      where: {
        date: {
          [Op.between]: [startOfWeek, endOfWeek]
        }
      }
    });

    // 4. Kỳ thi HSG Quốc gia (giả định là ngày 15/04/2026)
    const hsgExamDate = dayjs('2026-04-15');
    const today = dayjs();
    const daysUntilExam = hsgExamDate.diff(today, 'day');

    res.json({
      totalTeams,
      totalStudents,
      schedulesThisWeek,
      daysUntilExam,
      hsgExamDate: hsgExamDate.format('DD/MM/YYYY')
    });
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = exports;
