// Định nghĩa các quan hệ Sequelize ở đây để tránh vòng lặp require
const Team = require('./Team');
const Student = require('./student');
const User = require('./User');
const Teacher = require('./teacher');
const Score = require('./Score');
const Schedule = require('./Schedule');
const Evaluation = require('./Evaluation');

// Team - Student
Team.hasMany(Student, { foreignKey: 'teamId', as: 'members' });
Student.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// User - Student
User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Teacher - User
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Score - Student (using 'member' alias to match frontend expectations)
Score.belongsTo(Student, { foreignKey: 'memberId', as: 'member' });
Student.hasMany(Score, { foreignKey: 'memberId', as: 'scores' });

// Score - User (createdBy)
Score.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Schedule - User (createdBy)
Schedule.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Evaluation - Student (using 'member' alias to match other models)
Evaluation.belongsTo(Student, { foreignKey: 'memberId', as: 'member' });
Student.hasMany(Evaluation, { foreignKey: 'memberId', as: 'evaluations' });

// Evaluation - User (createdBy)
Evaluation.belongsTo(User, { foreignKey: 'createdBy', as: 'teacher' });
