import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select, Table, Space, message, Spin } from 'antd';
import { 
  LineChartOutlined, 
  TrophyOutlined, 
  BookOutlined, 
  CalendarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { getToken } from '../utils/auth';
import AppLayout from '../components/Layout/AppLayout';
import AppCard from '../components/UI/AppCard';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function Statistics() {
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);

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

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchStats(selectedYear);
    }
  }, [selectedYear]);

  // Prepare subject table data
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

  // Prepare month table data
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

  // Top students table
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
    </AppLayout>
  );
}
