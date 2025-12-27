import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, Table, Space, message, Spin, Tabs, Progress, Tag, Avatar, Empty } from 'antd';
import { 
  LineChartOutlined, 
  TrophyOutlined, 
  BookOutlined, 
  CalendarOutlined,
  BarChartOutlined,
  UserOutlined,
  StarOutlined
} from '@ant-design/icons';
import { getToken } from '../utils/auth';
import AppLayout from '../components/Layout/AppLayout';
import AppCard from '../components/UI/AppCard';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function Statistics() {
  const [loading, setLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);
  
  // Student statistics states
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentStats, setStudentStats] = useState(null);

  const fetchYears = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/statistics/years`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.years && data.years.length > 0) {
        setYears(data.years);
        setSelectedYear(data.years[0]); // Select most recent year
      }
    } catch (err) {
      console.error('Error fetching years:', err);
    }
  };

  const fetchStats = async (year) => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/statistics/year/${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.error) {
        message.error(data.error);
      } else {
        setStats(data.stats);
      }
    } catch (err) {
      message.error('Lỗi tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students list based on user role
  const fetchStudents = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.students) {
        // Filter students based on user role
        const userRole = localStorage.getItem('userRole');
        const userId = localStorage.getItem('userId');
        
        let filteredStudents = data.students;
        
        if (userRole === 'user') {
          // Students can only see themselves
          filteredStudents = data.students.filter(student => 
            student.userId && student.userId.toString() === userId
          );
        } else if (userRole === 'teacher') {
          // Teachers can only see students from their subject teams
          // This filtering will be done on the backend, but we can add client-side as backup
          filteredStudents = data.students;
        }
        // Admin can see all students
        
        setStudents(filteredStudents);
        
        // Auto-select if only one student (for regular users)
        if (filteredStudents.length === 1) {
          setSelectedStudent(filteredStudents[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Fetch student statistics
  const fetchStudentStats = async (studentId, year) => {
    if (!studentId || !year) return;
    
    console.log('Fetching student stats for:', { studentId, year });
    setStudentLoading(true);
    try {
      const token = getToken();
      const url = `${API_BASE}/statistics/student/${studentId}/${year}`;
      console.log('API URL:', url);
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('API Response:', data);
      
      if (data.error) {
        message.error(data.error);
        setStudentStats(null);
      } else {
        setStudentStats(data.stats);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      message.error('Lỗi tải thống kê học sinh');
      setStudentStats(null);
    } finally {
      setStudentLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchStats(selectedYear);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedStudent && selectedYear) {
      fetchStudentStats(selectedStudent, selectedYear);
    }
  }, [selectedStudent, selectedYear]);

  // Get student info
  const studentInfo = students.find(s => s.id === selectedStudent);

  // Prepare data for general statistics
  const subjectData = stats?.bySubject ? Object.entries(stats.bySubject).map(([subject, data]) => ({
    key: subject,
    subject,
    count: data.count,
    avgScore: data.avgScore
  })) : [];

  const subjectColumns = [
    { 
      title: 'Môn học', 
      dataIndex: 'subject', 
      key: 'subject'
    },
    { title: 'Số bài kiểm tra', dataIndex: 'count', key: 'count' },
    { 
      title: 'Điểm trung bình', 
      dataIndex: 'avgScore', 
      key: 'avgScore',
      render: (score) => <span style={{ fontWeight: 'bold', color: score >= 8 ? '#52c41a' : score >= 6.5 ? '#1890ff' : '#ff4d4f' }}>{score}</span>
    }
  ];

  const monthData = stats?.byMonth ? Object.entries(stats.byMonth).map(([month, data]) => ({
    key: month,
    month: `Tháng ${month}`,
    count: data.count,
    avgScore: data.avgScore
  })) : [];

  const monthColumns = [
    { title: 'Tháng', dataIndex: 'month', key: 'month' },
    { title: 'Số bài kiểm tra', dataIndex: 'count', key: 'count' },
    { 
      title: 'Điểm TB', 
      dataIndex: 'avgScore', 
      key: 'avgScore',
      render: (score) => <span style={{ fontWeight: 'bold' }}>{score}</span>
    }
  ];

  const topStudentsColumns = [
    { 
      title: 'Hạng', 
      key: 'rank',
      render: (_, __, index) => {
        const icons = ['🥇', '🥈', '🥉'];
        return icons[index] || `${index + 1}`;
      }
    },
    { title: 'Tên học sinh', dataIndex: 'name', key: 'name' },
    { title: 'Số bài thi', dataIndex: 'count', key: 'count' },
    { 
      title: 'Điểm TB', 
      dataIndex: 'avgScore', 
      key: 'avgScore',
      render: (score) => <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>{score}</span>
    }
  ];

  // Prepare data for student statistics
  const scoresData = studentStats?.scores ? studentStats.scores.map((score, index) => ({
    key: index,
    ...score,
    examDate: score.examDate ? new Date(score.examDate).toLocaleDateString('vi-VN') : 'N/A'
  })) : [];

  const scoresColumns = [
    {
      title: 'Ngày thi',
      dataIndex: 'examDate',
      key: 'examDate',
      width: 100
    },
    {
      title: 'Bài kiểm tra',
      dataIndex: 'testName',
      key: 'testName'
    },
    {
      title: 'Môn học',
      dataIndex: ['member', 'team', 'subject'],
      key: 'subject',
      render: (_, record) => record.member?.team?.subject || 'N/A'
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score, record) => {
        const maxScore = record.maxScore || 10;
        const percentage = (score / maxScore) * 100;
        let color = '#ff4d4f';
        if (percentage >= 80) color = '#52c41a';
        else if (percentage >= 65) color = '#1890ff';
        else if (percentage >= 50) color = '#faad14';
        
        return (
          <Space>
            <span style={{ fontWeight: 'bold', color }}>{score}/{maxScore}</span>
            <span style={{ fontSize: '12px', color: '#999' }}>({percentage.toFixed(1)}%)</span>
          </Space>
        );
      }
    },
    {
      title: 'Giải thưởng',
      dataIndex: 'award',
      key: 'award',
      render: (award) => {
        if (!award) return <Tag color="default">Không đạt giải</Tag>;
        
        const colorMap = {
          'Giải Nhất': 'gold',
          'Giải Nhì': 'purple',
          'Giải Ba': 'cyan',
          'Giải Khuyến khích': 'blue',
          'Giải Nhất QG': 'red',
          'Giải Nhì QG': 'volcano',
          'Giải Ba QG': 'orange',
          'Giải Khuyến khích QG': 'geekblue',
          'Tham dự QG': 'default'
        };
        
        return <Tag color={colorMap[award] || 'default'}>{award}</Tag>;
      }
    }
  ];

  const studentSubjectData = studentStats?.bySubject ? Object.entries(studentStats.bySubject).map(([subject, data]) => ({
    key: subject,
    subject,
    count: data.count,
    avgScore: data.avgScore,
    maxScore: data.maxScore,
    minScore: data.minScore,
    percentage: ((data.avgScore / (data.maxScoreLimit || 10)) * 100).toFixed(1)
  })) : [];

  const studentSubjectColumns = [
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject'
    },
    {
      title: 'Số bài thi',
      dataIndex: 'count',
      key: 'count'
    },
    {
      title: 'Điểm TB',
      dataIndex: 'avgScore',
      key: 'avgScore',
      render: (score, record) => (
        <Space direction="vertical" size="small">
          <span style={{ fontWeight: 'bold' }}>{score}</span>
          <Progress 
            percent={parseFloat(record.percentage)} 
            size="small" 
            strokeColor={parseFloat(record.percentage) >= 80 ? '#52c41a' : parseFloat(record.percentage) >= 65 ? '#1890ff' : '#faad14'}
          />
        </Space>
      )
    },
    {
      title: 'Cao nhất',
      dataIndex: 'maxScore',
      key: 'maxScore',
      render: (score) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{score}</span>
    },
    {
      title: 'Thấp nhất',
      dataIndex: 'minScore',
      key: 'minScore',
      render: (score) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{score}</span>
    }
  ];

  // Tab items
  const tabItems = [
    {
      key: 'general',
      label: '📊 Thống kê chung',
      children: (
        <>
          {loading ? (
            <AppCard>
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            </AppCard>
          ) : stats ? (
            <>
              {/* Summary Cards */}
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <AppCard variant="stats" size="small">
                    <Statistic 
                      title="Năm học" 
                      value={stats.year} 
                      prefix={<CalendarOutlined />}
                      formatter={(value) => value}
                    />
                  </AppCard>
                </Col>
                <Col span={6}>
                  <AppCard variant="stats" size="small">
                    <Statistic 
                      title="Tổng số bài thi" 
                      value={stats.totalScores} 
                      prefix={<BookOutlined />}
                    />
                  </AppCard>
                </Col>
                <Col span={6}>
                  <AppCard variant="stats" size="small">
                    <Statistic 
                      title="Điểm trung bình" 
                      value={stats.averageScore} 
                      precision={2}
                      prefix={<LineChartOutlined />}
                      valueStyle={{ color: stats.averageScore >= 8 ? '#3f8600' : '#1890ff' }}
                    />
                  </AppCard>
                </Col>
                <Col span={6}>
                  <AppCard variant="stats" size="small">
                    <Statistic 
                      title="Số môn học" 
                      value={Object.keys(stats.bySubject || {}).length} 
                      prefix={<TrophyOutlined />}
                    />
                  </AppCard>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: 16 }}>
                {/* By Subject */}
                <Col span={12}>
                  <AppCard title="Thống kê theo môn học" variant="glass">
                    <Table 
                      dataSource={subjectData} 
                      columns={subjectColumns}
                      pagination={false}
                      size="small"
                    />
                  </AppCard>
                </Col>

                {/* By Month */}
                <Col span={12}>
                  <AppCard title="Thống kê theo tháng" variant="glass">
                    <Table 
                      dataSource={monthData} 
                      columns={monthColumns}
                      pagination={false}
                      size="small"
                      scroll={{ y: 300 }}
                    />
                  </AppCard>
                </Col>
              </Row>

              {/* Top Students */}
              <AppCard title={`🏆 Top 10 học sinh xuất sắc năm ${stats.year}`} variant="glass">
                <Table 
                  dataSource={stats.topStudents || []} 
                  columns={topStudentsColumns}
                  pagination={false}
                  size="small"
                />
              </AppCard>
            </>
          ) : (
            <AppCard>
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                Chưa có dữ liệu thống kê
              </div>
            </AppCard>
          )}
        </>
      )
    },
    {
      key: 'student',
      label: '👤 Thống kê học sinh',
      children: (
        <>
          {/* Student Selection */}
          <AppCard title="Chọn học sinh" variant="glass" style={{ marginBottom: 16 }}>
            {students.length === 0 ? (
              <Empty description="Không có học sinh nào để xem thống kê" />
            ) : students.length === 1 ? (
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}>
                <Avatar size={48} icon={<UserOutlined />} style={{ marginBottom: 12, backgroundColor: '#1890ff' }} />
                <h4 style={{ color: '#333', margin: '8px 0' }}>{students[0].name}</h4>
                <p style={{ color: '#666', margin: '4px 0' }}>Mã số: <strong style={{ color: '#333' }}>{students[0].studentId}</strong> - Khối <strong style={{ color: '#333' }}>{students[0].grade}</strong></p>
                <p style={{ color: '#666', margin: '4px 0' }}>Đội: <strong style={{ color: '#1890ff' }}>{students[0].team?.name || 'Chưa có đội'}</strong></p>
              </div>
            ) : (
              <Select
                showSearch
                placeholder="Tìm và chọn học sinh..."
                style={{ width: '100%' }}
                value={selectedStudent}
                onChange={setSelectedStudent}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {students.map(student => (
                  <Select.Option key={student.id} value={student.id}>
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      {student.name} - {student.studentId} - Khối {student.grade}
                      {student.team && ` (${student.team.subject})`}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            )}
          </AppCard>

          {studentLoading ? (
            <AppCard>
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            </AppCard>
          ) : selectedStudent && studentStats ? (
            <>
              {/* Student Info & Summary */}
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <AppCard variant="glass" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 16, backgroundColor: '#1890ff' }} />
                      <h3 style={{ color: '#333', margin: '8px 0' }}>{studentInfo?.name}</h3>
                      <p style={{ color: '#666', margin: '4px 0' }}>Mã số: <strong style={{ color: '#333' }}>{studentInfo?.studentId}</strong></p>
                      <p style={{ color: '#666', margin: '4px 0' }}>Khối: <strong style={{ color: '#333' }}>{studentInfo?.grade}</strong></p>
                      <p style={{ color: '#666', margin: '4px 0' }}>Đội: <strong style={{ color: '#333' }}>{studentInfo?.team?.name || 'Chưa có đội'}</strong></p>
                      {studentInfo?.team?.subject && (
                        <p style={{ color: '#666', margin: '4px 0' }}>Môn: <strong style={{ color: '#1890ff' }}>{studentInfo.team.subject}</strong></p>
                      )}
                    </div>
                  </AppCard>
                </Col>
                <Col span={16}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <AppCard variant="stats" size="small" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                        <Statistic 
                          title={<span style={{ color: '#333', fontWeight: 'bold' }}>Tổng số bài thi</span>}
                          value={studentStats.totalScores} 
                          prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                          valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                        />
                      </AppCard>
                    </Col>
                    <Col span={8}>
                      <AppCard variant="stats" size="small" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                        <Statistic 
                          title={<span style={{ color: '#333', fontWeight: 'bold' }}>Điểm trung bình</span>}
                          value={studentStats.averageScore} 
                          precision={2}
                          prefix={<LineChartOutlined style={{ color: studentStats.averageScore >= 8 ? '#52c41a' : studentStats.averageScore >= 6.5 ? '#1890ff' : '#ff4d4f' }} />}
                          valueStyle={{ 
                            color: studentStats.averageScore >= 8 ? '#52c41a' : 
                                   studentStats.averageScore >= 6.5 ? '#1890ff' : '#ff4d4f',
                            fontSize: '24px',
                            fontWeight: 'bold'
                          }}
                        />
                      </AppCard>
                    </Col>
                    <Col span={8}>
                      <AppCard variant="stats" size="small" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                        <Statistic 
                          title={<span style={{ color: '#333', fontWeight: 'bold' }}>Số giải thưởng</span>}
                          value={studentStats.totalAwards || 0} 
                          prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                          valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: 'bold' }}
                        />
                      </AppCard>
                    </Col>
                  </Row>
                </Col>
              </Row>

              {/* Performance by Subject */}
              <AppCard title="📊 Kết quả theo môn học" variant="glass" style={{ marginBottom: 16 }}>
                {studentSubjectData.length > 0 ? (
                  <Table 
                    dataSource={studentSubjectData} 
                    columns={studentSubjectColumns}
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Empty description="Chưa có dữ liệu theo môn học" />
                )}
              </AppCard>

              {/* Detailed Scores */}
              <AppCard title="📝 Chi tiết các bài kiểm tra" variant="glass">
                {scoresData.length > 0 ? (
                  <Table 
                    dataSource={scoresData} 
                    columns={scoresColumns}
                    pagination={{ 
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài thi`
                    }}
                    size="small"
                    scroll={{ x: 800 }}
                  />
                ) : (
                  <Empty description="Chưa có dữ liệu bài kiểm tra" />
                )}
              </AppCard>
            </>
          ) : selectedStudent && !studentLoading ? (
            <AppCard>
              <Empty description="Không có dữ liệu thống kê cho học sinh này" />
            </AppCard>
          ) : (
            <AppCard>
              <Empty description="Vui lòng chọn học sinh để xem thống kê" />
            </AppCard>
          )}
        </>
      )
    }
  ];

  return (
    <AppLayout 
      title="Thống kê kết quả" 
      subtitle="Phân tích và báo cáo kết quả học tập"
      headerExtra={
        <Space>
          <span>Năm học:</span>
          <Select 
            value={selectedYear} 
            onChange={setSelectedYear}
            style={{ width: 150 }}
          >
            {years.map(year => (
              <Select.Option key={year} value={year}>{year}</Select.Option>
            ))}
          </Select>
        </Space>
      }
    >
      <Tabs 
        items={tabItems} 
        defaultActiveKey="general"
        size="large"
        style={{ marginTop: -16 }}
      />
    </AppLayout>
  );
}
